import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog'

const BASE = 'https://bshastry.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const postRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))
  return [...staticRoutes, ...postRoutes]
}
