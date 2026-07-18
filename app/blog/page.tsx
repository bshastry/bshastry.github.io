import type { Metadata } from 'next'
import { getAllPostsMeta } from '@/lib/blog'
import { pageAlternates } from '@/lib/seo'
import BlogIndexClient from './BlogIndexClient'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on fuzzing, Ethereum client security, post-quantum cryptography, and vulnerability research by Bhargava Shastry.',
  alternates: pageAlternates('/blog/'),
  openGraph: {
    type: 'website',
    url: 'https://bshastry.github.io/blog/',
    siteName: 'Bhargava Shastry',
    title: 'Blog — Bhargava Shastry',
    description:
      'Writing on fuzzing, Ethereum client security, post-quantum cryptography, and vulnerability research.',
  },
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Bhargava Shastry — Blog',
  url: 'https://bshastry.github.io/blog/',
  description:
    'Writing on fuzzing, Ethereum client security, post-quantum cryptography, and vulnerability research.',
  author: {
    '@type': 'Person',
    name: 'Bhargava Shastry',
    url: 'https://bshastry.github.io',
  },
}

export default function BlogPage() {
  const posts = getAllPostsMeta()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BlogIndexClient posts={posts} />
    </>
  )
}
