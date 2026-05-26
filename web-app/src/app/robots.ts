import type { MetadataRoute } from 'next';

/**
 * robots defines the crawl policy for search bots.
 * Why this exists: Keep authenticated app surfaces out of search while allowing
 * crawl/index on public entry routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/chat', '/auth-callback'],
      },
    ],
    sitemap: 'https://chroniclife.app/sitemap.xml',
    host: 'https://chroniclife.app',
  };
}
