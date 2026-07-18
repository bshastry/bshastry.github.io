import type { Metadata } from 'next'
import { getAllPostsMeta } from '@/lib/blog'
import {
  pageAlternates,
  serializeJsonLd,
  AUTHOR,
  FEED_TITLE,
  FEED_DESCRIPTION,
  SITE_URL,
} from '@/lib/seo'
import BlogIndexClient from './BlogIndexClient'

const BLOG_DESCRIPTION = FEED_DESCRIPTION

export const metadata: Metadata = {
  title: 'Blog',
  description: `${BLOG_DESCRIPTION.slice(0, -1)} by ${AUTHOR}.`,
  alternates: pageAlternates('/blog/'),
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog/`,
    siteName: AUTHOR,
    title: FEED_TITLE,
    description: BLOG_DESCRIPTION,
  },
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: FEED_TITLE,
  url: `${SITE_URL}/blog/`,
  description: BLOG_DESCRIPTION,
  author: {
    '@type': 'Person',
    name: AUTHOR,
    url: SITE_URL,
  },
}

export default function BlogPage() {
  const posts = getAllPostsMeta()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd) }}
      />
      <BlogIndexClient posts={posts} />
    </>
  )
}
