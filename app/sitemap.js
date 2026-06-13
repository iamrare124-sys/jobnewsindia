import { getPosts } from '../lib/supabase';
import { getSiteConfig } from '../config/site.config';

export default async function sitemap() {
  const config = getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl;

  let posts = [];
  try {
    posts = await getPosts({ limit: 100 });
  } catch (err) {
    console.error('Sitemap fetch error:', err.message);
  }

  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages = config.categories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const postPages = posts.map((post) => ({
    url: `${siteUrl}/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...postPages];
}
