import Groq from 'groq-sdk';
import { getSiteConfig } from '../config/site.config';

let _groq = null;

function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

// ── Banned phrases (original AI tells) ───────────────────────────────────────
const BANNED_PHRASES = [
  'Furthermore',
  'Moreover',
  'In this article',
  'It is important to note',
  'Delve into',
  'In conclusion',
  'Robust',
  'Comprehensive',
  'game-changer',
  'It is worth noting',
  'As we can see',
  'Without further ado',
  'In summary',
  'To summarize',
  'Firstly',
  'Secondly',
  'Thirdly',
  'Last but not least',
  "In today's world",
  'In the realm of',
];

// ── Extended AI pattern list (for quality check) ─────────────────────────────
const AI_PATTERNS = [
  'it is worth noting',
  'it should be noted',
  'one must consider',
  'in light of',
  'with regard to',
  'it is important to',
  'needless to say',
  'as previously mentioned',
  'it goes without saying',
  'in terms of',
  'at the end of the day',
  'moving forward',
  'going forward',
  'in order to',
  'it can be seen that',
  'as mentioned above',
  ...BANNED_PHRASES.map((p) => p.toLowerCase()),
];

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(config) {
  return `${config.aiPersonality}

BANNED PHRASES — NEVER USE ANY OF THESE:
${BANNED_PHRASES.map((p) => `- ${p}`).join('\n')}

ANTI-AI-DETECTION RULES (follow these strictly):
1. VARY sentence length aggressively: 4 words. Then a much longer sentence that builds on the previous point with specific detail. Then medium. Never 3 sentences same length in a row.
2. USE contractions always: it's, don't, won't, here's, that's, they're, you'll, we've
3. START 2-3 sentences with "And" or "But" — real journalists do this
4. ADD one personal aside per section: "And honestly?", "Here's the thing —", "Look,", "Real talk:"
5. INCLUDE one rhetorical question per article
6. USE em-dashes for interruptions — like this — instead of commas where natural
7. NEVER use: "It is worth noting", "It should be noted", "One must consider", "In light of", "With regard to"
8. NUMBERS in first paragraph always — specific, not vague ("1,247 vacancies" not "many vacancies")
9. ONE opinion stated as fact: "This is the most important recruitment drive of the quarter."
10. ACTIVE voice always. Never passive. Bad: "Applications are being accepted." Good: "Apply before June 30."

WRITING RULES:
- Write in clear, direct English. No fluff.
- Use short paragraphs (2-4 sentences max).
- Include specific details: dates, vacancy numbers, age limits, salary, application links where relevant.
- Mention Naukri.com, LinkedIn India, or Shine.com naturally.
- Include India-specific details: reservation categories (SC/ST/OBC/EWS), age relaxation, form fees.
- End every article with 3-5 specific action steps the reader can take TODAY.
- Write like you are texting a friend who needs a job — warm but practical.

OUTPUT FORMAT — respond EXACTLY like this (no deviation):
TITLE: [compelling SEO title with year]
META_TITLE: [60 char max title for SEO]
META_DESC: [155 char max description]
TAGS: [tag1, tag2, tag3, tag4, tag5]
CATEGORY: [one of: govt-jobs, upsc-ssc, private-jobs, career-tips]
CONTENT:
[hook paragraph — grab attention immediately with a number]

## [First Major Section Heading]
[2-4 paragraphs of detailed content]

## [Second Major Section Heading]
[2-4 paragraphs]

## Eligibility & How to Apply
[specific eligibility criteria, dates, steps]

## Your Action Plan
[3-5 bullet points with exact steps]
FAQ:
Q: [Question 1]?
A: [Answer 1]

Q: [Question 2]?
A: [Answer 2]

Q: [Question 3]?
A: [Answer 3]

Q: [Question 4]?
A: [Answer 4]
END`;
}

// ── User prompt builder ───────────────────────────────────────────────────────
function buildUserPrompt(story, config) {
  return `Write a detailed, SEO-optimized blog post (900-1200 words) about this news for ${config.siteName}:

Title: ${story.title}
Description: ${story.description || 'No description available'}
Source: ${story.source}
Date: ${story.pubDate}

Primary keyword to target: ${config.primaryKeyword}
Secondary keywords: ${(config.secondaryKeywords || []).join(', ')}

Make this genuinely useful for Indian job seekers. Include specific, actionable information. Start with a number in the first sentence.`;
}

// ── Humanize pass — second Groq call to remove AI patterns ───────────────────
async function humanizeContent(rawContent) {
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: `Rewrite this article to sound like a real human journalist wrote it.

RULES:
1. Break long sentences into 2-3 shorter ones
2. Add 1-2 conversational asides like "And honestly?" or "Here's the thing —"
3. Use contractions: "it's", "don't", "here's", "that's"
4. Start 2-3 sentences with "And" or "But" (humans do this, AI avoids it)
5. Add one slightly informal phrase per section
6. Remove any remaining formal/academic phrasing
7. Keep all facts, numbers, and quotes EXACTLY the same
8. Keep the same structure and headings
9. Output ONLY the rewritten article, no preamble

ARTICLE:
${rawContent}`,
        },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || rawContent;
  } catch (err) {
    console.error('Humanize pass failed:', err.message);
    return rawContent; // graceful fallback
  }
}

// ── Content parsers ───────────────────────────────────────────────────────────
function parseSections(rawContent) {
  if (!rawContent) return [];
  const sections = [];
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  const hasHeadings = headingRegex.test(rawContent);

  if (hasHeadings) {
    const parts = rawContent.split(/^#{1,3}\s+/m);
    const headings = [...rawContent.matchAll(/^#{1,3}\s+(.+)$/gm)];
    const hook = parts[0].trim();
    if (hook) sections.push({ type: 'hook', heading: null, body: hook });
    headings.forEach((match, i) => {
      const heading = match[1].trim().replace(/\*\*/g, '');
      const body = parts[i + 1]?.trim() || '';
      if (body) sections.push({ type: 'section', heading, body });
    });
  } else {
    const paragraphs = rawContent.split(/\n\n+/).filter((p) => p.trim().length > 20);
    if (paragraphs.length === 0) {
      sections.push({ type: 'hook', heading: null, body: rawContent });
    } else {
      paragraphs.forEach((p, i) => {
        sections.push({ type: i === 0 ? 'hook' : 'section', heading: null, body: p.trim() });
      });
    }
  }
  return sections;
}

function parseFAQ(faqRaw) {
  if (!faqRaw) return [];
  const faqs = [];
  const pairs = faqRaw.split(/\n\n+/);
  pairs.forEach((pair) => {
    const qMatch = /Q:\s*(.+)\?/.exec(pair);
    const aMatch = /A:\s*([\s\S]+)/.exec(pair);
    if (qMatch && aMatch) {
      faqs.push({ question: qMatch[1].trim() + '?', answer: aMatch[1].trim() });
    }
  });
  return faqs.slice(0, 4);
}

function parseResponse(text) {
  const extract = (key) => {
    const regex = new RegExp(`${key}:\\s*([^\\n]+)`, 'i');
    const m = regex.exec(text);
    return m ? m[1].trim() : '';
  };

  const contentMatch = /CONTENT:\s*([\s\S]*?)(?=FAQ:|END|$)/i.exec(text);
  const faqMatch = /FAQ:\s*([\s\S]*?)(?=END|$)/i.exec(text);

  const rawContent = contentMatch ? contentMatch[1].trim() : text;
  const faqRaw = faqMatch ? faqMatch[1].trim() : '';

  const tagsRaw = extract('TAGS');
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return {
    title: extract('TITLE'),
    metaTitle: extract('META_TITLE'),
    metaDescription: extract('META_DESC'),
    tags,
    category: extract('CATEGORY') || 'govt-jobs',
    content: { sections: parseSections(rawContent), rawContent },
    faq: parseFAQ(faqRaw),
    rawContent,
  };
}

// ── Quality check ─────────────────────────────────────────────────────────────
function qualityCheck(parsed) {
  let score = 10;
  const issues = [];
  const fullText = (parsed.rawContent || '').toLowerCase();

  // Check banned phrases + AI patterns
  const allPatterns = [...new Set(AI_PATTERNS)];
  allPatterns.forEach((phrase) => {
    if (fullText.includes(phrase.toLowerCase())) {
      score -= 1;
      issues.push(`AI pattern: "${phrase}"`);
    }
  });

  if (!parsed.title || parsed.title.length < 20) { score -= 2; issues.push('Title too short'); }
  if (!parsed.metaDescription || parsed.metaDescription.length < 50) { score -= 1; issues.push('Meta desc too short'); }
  if (fullText.length < 500) { score -= 3; issues.push('Content too short'); }
  if (parsed.content.sections.length < 2) { score -= 1; issues.push('Too few sections'); }
  if (!parsed.category || !['govt-jobs','upsc-ssc','private-jobs','career-tips'].includes(parsed.category)) {
    score -= 1; issues.push('Invalid category');
  }

  // Check for AI patterns specifically (causes retry)
  const hasAiPattern = AI_PATTERNS.some((p) => fullText.includes(p.toLowerCase()));

  return { score, issues, pass: score >= 7 && !hasAiPattern };
}

// ── Main export: generateBlogPost ─────────────────────────────────────────────
export async function generateBlogPost(story) {
  const config = getSiteConfig();
  const groq = getGroq();
  let lastParsed = null;
  let lastQuality = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Generating blog post, attempt ${attempt}/3...`);

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.85,
        max_tokens: 4000,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        messages: [
          { role: 'system', content: buildSystemPrompt(config) },
          { role: 'user', content: buildUserPrompt(story, config) },
        ],
      });

      const rawText = response.choices[0]?.message?.content || '';
      const parsed = parseResponse(rawText);
      const quality = qualityCheck(parsed);

      console.log(`Attempt ${attempt} quality: ${quality.score}/10`, quality.issues.length ? quality.issues : 'clean');

      if (quality.pass) {
        // Run humanize pass on raw content
        console.log('Running humanize pass...');
        const humanized = await humanizeContent(parsed.rawContent);
        parsed.content.sections = parseSections(humanized);
        parsed.content.rawContent = humanized;
        parsed.rawContent = humanized;
        return { success: true, data: parsed };
      }

      lastParsed = parsed;
      lastQuality = quality;

      if (attempt < 3) {
        console.warn(`Attempt ${attempt} failed quality check, retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`Blog generation attempt ${attempt} failed:`, err.message);
      if (attempt === 3) return { success: false, error: err.message };
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // Return best-effort after 3 failures
  console.warn('Returning below-quality post after 3 attempts');
  return { success: true, data: lastParsed, lowQuality: true, quality: lastQuality };
}

// ── Slug generator ────────────────────────────────────────────────────────────
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-|-$/g, '');
}

// ── Stub: multilingual rewrite ────────────────────────────────────────────────
export async function rewritePostInLanguage(post, language) {
  console.log(`rewritePostInLanguage called for language: ${language} — not yet implemented`);
  return post;
}
