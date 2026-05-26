import type { MetadataRoute } from 'next';

/**
 * sitemap enumerates canonical URLs for Search Console and crawlers.
 * Why this exists: Advertises stable, indexable routes while excluding
 * authenticated product surfaces.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://chroniclife.app/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
