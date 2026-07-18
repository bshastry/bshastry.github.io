import type { Metadata } from 'next'
import { getAllPostsMeta } from '@/lib/blog'
import BlogIndexClient from './BlogIndexClient'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on fuzzing, Ethereum client security, post-quantum cryptography, and vulnerability research by Bhargava Shastry.',
  alternates: {
    canonical: '/blog/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Bhargava Shastry — Blog' }],
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://bshastry.github.io/blog/',
    siteName: 'Bhargava Shastry',
    title: 'Blog — Bhargava Shastry',
    description:
      'Writing on fuzzing, Ethereum client security, post-quantum cryptography, and vulnerability research.',
  },
}

export default function BlogPage() {
  const posts = getAllPostsMeta()
  return <BlogIndexClient posts={posts} />
}
