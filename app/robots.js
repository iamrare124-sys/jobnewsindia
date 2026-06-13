import { getSiteConfig } from '../config/site.config';

export default function robots() {
  const config = getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
