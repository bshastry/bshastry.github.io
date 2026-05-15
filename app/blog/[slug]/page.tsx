import { notFound } from 'next/navigation'
import { getAllSlugs, getAllPostsMeta, getPostBySlug } from '@/lib/blog'
import BlogPostClient from './BlogPostClient'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  const allPosts = getAllPostsMeta()
  return <BlogPostClient post={post} allPosts={allPosts} />
}
