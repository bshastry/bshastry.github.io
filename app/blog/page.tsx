import { getAllPostsMeta } from '@/lib/blog'
import BlogIndexClient from './BlogIndexClient'

export default function BlogPage() {
  const posts = getAllPostsMeta()
  return <BlogIndexClient posts={posts} />
}
