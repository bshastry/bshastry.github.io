import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react'
import blogData from '@/data/blog.json'
import BlogPostClient from './BlogPostClient'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
  content: string
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogData.posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  // Find the post directly since we're generating static pages
  const post = blogData.posts.find((p) => p.slug === params.slug)

  // Generate markdown content
  const markdownContent = post
    ? `
# ${post.title}

*Published on ${new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} • ${post.readTime}*

${post.excerpt}

---

**Note**: This blog post is currently being migrated from the legacy Jekyll system.
The full content will be available soon. In the meantime, you can find the original post
in the legacy archive.

**Topics covered**: ${post.tags.join(', ')}

---

*This post is part of a series on security research, fuzzing, and vulnerability discovery.
For more technical content, check out the other posts in the blog.*
  `
    : ''

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-max section-padding py-12">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>

          <div className="py-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Post Not Found</h1>
            <p className="mb-8 text-gray-600">The blog post you're looking for doesn't exist.</p>
            <Link
              href="/blog"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <BlogPostClient post={post} markdownContent={markdownContent} allPosts={blogData.posts} />
}
