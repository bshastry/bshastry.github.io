import type { MetadataRoute } from 'next'
import { getAllPostsMeta } from '@/lib/blog'
import { engagementGuides } from '@/lib/engagements'
export const dynamic = 'force-static'

const BASE = 'https://bshastry.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/blog/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/research/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/findings/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/engagements/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/recruiter-brief/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms/`, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const postRoutes: MetadataRoute.Sitemap = getAllPostsMeta().map((post) => ({
    url: `${BASE}/blog/${post.slug}/`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: 'yearly',
    priority: 0.7,
  }))
  const engagementRoutes: MetadataRoute.Sitemap = engagementGuides.map((guide) => ({
    url: `${BASE}/engagements/${guide.slug}/`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
  return [...staticRoutes, ...engagementRoutes, ...postRoutes]
}
