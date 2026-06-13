import { NextResponse } from 'next/server';
import { verifyCronSecret } from '../../../lib/security';
import { fetchAllSources, selectBestStory } from '../../../lib/rss-fetcher';
import { generateBlogPost, slugify } from '../../../lib/blog-generator';
import { savePost, postExists } from '../../../lib/supabase';
import { fetchImage } from '../../../lib/image-fetcher';
import { getSiteConfig } from '../../../config/site.config';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function pingIndexNow(slug) {
  try {
    const key = process.env.INDEX_NOW_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!key || !siteUrl) return;
    await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(`${siteUrl}/${slug}`)}&key=${key}`,
      { method: 'GET', signal: AbortSignal.timeout(5000) }
    );
  } catch (err) {
    console.error('IndexNow ping failed:', err.message);
  }
}

export async function GET(request) {
  const startTime = Date.now();

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getSiteConfig();
  const published = [];
  const errors = [];

  try {
    console.log(`Cron start — site: ${process.env.SITE_NAME || 'jobnewsindia'}`);
    const allStories = await fetchAllSources();
    console.log(`Cron: ${allStories.length} stories available`);

    if (allStories.length === 0) {
      return NextResponse.json({
        success: true,
        requested: 1,
        published: 0,
        duration_seconds: (Date.now() - startTime) / 1000,
        posts: [],
        errors: ['No stories found in any feed within 48h'],
      });
    }

    const usedTitles = new Set();

    for (let i = 0; i < 1; i++) {
      const story = selectBestStory(allStories, usedTitles);
      if (!story) { errors.push('No unique stories remaining'); break; }

      usedTitles.add(story.title.substring(0, 60).toLowerCase());

      try {
        // Skip if source URL already saved for this site
        const alreadyExists = await postExists(story.link);
        if (alreadyExists) {
          errors.push(`Already published: ${story.title.substring(0, 60)}`);
          continue;
        }

        console.log(`Generating: "${story.title.substring(0, 70)}"`);
        const generated = await generateBlogPost(story);

        if (!generated.success || !generated.data) {
          errors.push(`Generation failed: ${generated.error || 'Unknown error'}`);
          continue;
        }

        const post = generated.data;
        const slug = slugify(post.title || story.title) + '-' + Date.now().toString(36);

        // Fetch cover image
        const image = await fetchImage(post.category, post.title);

        // Excerpt fallback chain
        let excerpt =
          post.metaDescription ||
          post.content?.sections?.[0]?.body?.substring(0, 160) ||
          post.rawContent?.substring(0, 160) ||
          `${post.title} — ${config.tagline}`;
        if (excerpt.length > 160) excerpt = excerpt.substring(0, 157) + '...';

        // Word count + reading time
        const wordCount = (post.rawContent || '').split(/\s+/).length;
        const readingTime = Math.max(3, Math.ceil(wordCount / 200));

        // ── savePost payload — matches YOUR EXACT DB SCHEMA ──────────────
        // Columns in your table:
        // id, slug, title, excerpt, content (text), category, tags,
        // cover_image, cover_image_alt, author_name, author_title,
        // meta_title, meta_description, schema_json, live_data, faq (jsonb),
        // reading_time, word_count, ai_score, published, tweeted,
        // source_url, source_headline, created_at, updated_at,
        // site_name, published_at, views
        // NOTE: NO image_credit column in your DB!
        const saved = await savePost({
          slug,
          title: post.title,
          excerpt,
          content: JSON.stringify(post.content),   // DB column is TEXT not JSONB
          category: post.category || 'govt-jobs',
          tags: post.tags || [],
          cover_image: image.url,
          cover_image_alt: image.alt || post.title,
          author_name: config.author.name,
          author_title: config.author.title,
          meta_title: post.metaTitle || post.title,
          meta_description: post.metaDescription || excerpt,
          faq: post.faq || [],                     // JSONB — no stringify
          reading_time: readingTime,
          word_count: wordCount,
          ai_score: generated.quality?.score || 8,
          published: true,
          tweeted: false,
          source_url: story.link,
          source_headline: story.title,
          published_at: new Date().toISOString(),
          // site_name injected automatically by savePost() via getSiteName()
        });

        published.push({ title: post.title, slug });
        console.log(`Published: /${slug}`);

        // Fire-and-forget IndexNow
        pingIndexNow(slug);

      } catch (err) {
        console.error('Error processing story:', err.message);
        errors.push(err.message);
      }
    }

    return NextResponse.json({
      success: true,
      site: process.env.SITE_NAME || 'jobnewsindia',
      requested: 1,
      published: published.length,
      duration_seconds: Math.round((Date.now() - startTime) / 1000),
      posts: published,
      errors,
    });

  } catch (err) {
    console.error('Cron fatal error:', err);
    return NextResponse.json(
      { success: false, error: err.message, duration_seconds: (Date.now() - startTime) / 1000 },
      { status: 500 }
    );
  }
}
