import { getSiteConfig } from '../config/site.config';

const MAX_AGE = 48 * 60 * 60 * 1000; // 48 hours in ms

// ── RSS Feed Fetcher ──────────────────────────────────────────────────────────
async function fetchRSSFeed(url, sourceName) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SyndicateHub/1.0 news aggregator' },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSS(xml, sourceName);
  } catch (err) {
    console.error(`RSS fetch failed for ${sourceName}:`, err.message);
    return [];
  }
}

function parseRSS(xml, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date');
    const description = extractTag(item, 'description');
    const guid = extractTag(item, 'guid');

    if (!title || !link) continue;

    // CRITICAL: correct age calculation — must be positive and within MAX_AGE
    const age = Date.now() - new Date(pubDate || new Date()).getTime();
    if (age > MAX_AGE || age < 0) continue;

    items.push({
      title: cleanText(title),
      link,
      pubDate,
      description: cleanText(description),
      guid: guid || link,
      source: sourceName,
      age,
    });
  }

  return items;
}

function extractTag(xml, tag) {
  const cdataMatch = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xml);
  return match ? match[1].trim() : '';
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Reddit JSON Fetcher (fixed) ───────────────────────────────────────────────
async function fetchReddit(subreddits) {
  const items = [];
  for (const sub of (subreddits || []).slice(0, 2)) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
        {
          headers: { 'User-Agent': 'SyndicateHub/1.0 news aggregator' },
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 0 },
        }
      );
      if (!res.ok) continue;
      const json = await res.json();
      const posts = json?.data?.children || [];

      const fresh = posts.filter((p) => {
        const age = Date.now() - p.data.created_utc * 1000;
        return age < 24 * 60 * 60 * 1000 && age > 0 && !p.data.stickied;
      });

      items.push(
        ...fresh.slice(0, 3).map((p) => ({
          title: cleanText(p.data.title),
          link: `https://reddit.com${p.data.permalink}`,
          pubDate: new Date(p.data.created_utc * 1000).toUTCString(),
          description: cleanText((p.data.selftext || p.data.title).slice(0, 400)),
          guid: p.data.id,
          source: `r/${sub}`,
          age: Date.now() - p.data.created_utc * 1000,
          score: p.data.score,
        }))
      );
    } catch (err) {
      console.error(`Reddit r/${sub} failed:`, err.message);
    }
  }
  return items;
}

// ── Bing News RSS ─────────────────────────────────────────────────────────────
async function fetchBing(query) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
  return fetchRSSFeed(url, 'Bing News');
}

// ── Yahoo Finance RSS ─────────────────────────────────────────────────────────
async function fetchYahoo(query) {
  const url = `https://finance.yahoo.com/rss/headline?s=${encodeURIComponent(query)}`;
  return fetchRSSFeed(url, 'Yahoo Finance');
}

// ── Deduplication ─────────────────────────────────────────────────────────────
function deduplicateByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.substring(0, 60).toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Story Scoring ─────────────────────────────────────────────────────────────
function scoreStory(item, keywords) {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descLower = (item.description || '').toLowerCase();

  keywords.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    if (titleLower.includes(kwLower)) score += 3;
    if (descLower.includes(kwLower)) score += 1;
  });

  // Recency bonus: newer = higher score (max +10 for brand new)
  const hoursOld = item.age / (1000 * 60 * 60);
  score += Math.max(0, 10 - hoursOld / 4);

  return score;
}

// ── Main Export: fetchAllSources ──────────────────────────────────────────────
export async function fetchAllSources() {
  const config = getSiteConfig();
  const rssSources = config.rssSources || [];
  const redditSources = config.reddit || [];
  const primaryKeyword = config.primaryKeyword || 'sarkari naukri india';

  // Source 1+2+3: Google News RSS sources (from config)
  const rssPromises = rssSources.map((src) => fetchRSSFeed(src.url, src.name));

  // Source 4: Bing News
  const bingPromise = fetchBing(primaryKeyword);

  // Source 5: Yahoo Finance (for private/IT jobs angle)
  const yahooPromise = fetchYahoo('india jobs hiring 2026');

  // Source 6: Reddit
  const redditPromise = fetchReddit(redditSources);

  // All in parallel — if any fail, others continue
  const results = await Promise.allSettled([
    ...rssPromises,
    bingPromise,
    yahooPromise,
    redditPromise,
  ]);

  let allItems = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allItems = allItems.concat(result.value);
    }
  });

  if (allItems.length === 0) {
    console.warn('fetchAllSources: all sources returned 0 items');
    return [];
  }

  const deduped = deduplicateByTitle(allItems);
  const sorted = deduped.sort((a, b) => a.age - b.age); // newest first
  console.log(`fetchAllSources: ${allItems.length} raw → ${deduped.length} deduped stories`);
  return sorted;
}

// ── selectBestStory ───────────────────────────────────────────────────────────
export function selectBestStory(items, usedTitles = new Set()) {
  const config = getSiteConfig();
  const keywords = [
    config.primaryKeyword,
    ...(config.secondaryKeywords || []),
    'sarkari', 'naukri', 'recruitment', 'vacancy', 'job', 'UPSC', 'SSC', 'government',
    'india', '2026',
  ];

  const available = items.filter((item) => {
    const key = item.title.substring(0, 60).toLowerCase();
    return !usedTitles.has(key);
  });

  if (available.length === 0) return null;

  const scored = available.map((item) => ({
    ...item,
    score: scoreStory(item, keywords),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
