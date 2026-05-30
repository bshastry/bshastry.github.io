import { notFound } from 'next/navigation'
import { getAllSlugs, getAllPostsMeta, getPostBySlug, getSeriesParts } from '@/lib/blog'
import BlogPostClient from './BlogPostClient'

interface BlogPostPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()
  const allPosts = getAllPostsMeta()
  const seriesParts = post.series ? getSeriesParts(post.series.id, post.slug) : []
  return (
    <BlogPostClient
      post={post}
      allPosts={allPosts}
      seriesTitle={post.series?.title ?? null}
      seriesParts={seriesParts}
    />
  )
}
