import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSlugs, getAllPostsMeta, getPostBySlug, getSeriesParts } from '@/lib/blog'
import { pageAlternates, serializeJsonLd, AUTHOR, FEED_TITLE, SITE_URL } from '@/lib/seo'
import BlogPostClient from './BlogPostClient'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const canonical = `/blog/${post.slug}/`
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: pageAlternates(canonical),
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${canonical}`,
      siteName: AUTHOR,
      title: post.title,
      description: post.excerpt,
      publishedTime: `${post.date}T00:00:00.000Z`,
      authors: [AUTHOR],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@ibags',
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  const allPosts = getAllPostsMeta()
  const seriesParts = post.series ? getSeriesParts(post.series.id, post.slug) : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: `${post.date}T00:00:00.000Z`,
    keywords: post.tags.join(', '),
    url: `${SITE_URL}/blog/${post.slug}/`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
    author: {
      '@type': 'Person',
      name: AUTHOR,
      url: SITE_URL,
    },
    isPartOf: {
      '@type': 'Blog',
      name: FEED_TITLE,
      url: `${SITE_URL}/blog/`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BlogPostClient
        post={post}
        allPosts={allPosts}
        seriesTitle={post.series?.title ?? null}
        seriesParts={seriesParts}
      />
    </>
  )
}
