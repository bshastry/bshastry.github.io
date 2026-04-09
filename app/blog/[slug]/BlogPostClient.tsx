'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
  content: string
}

interface BlogPostClientProps {
  post: BlogPost
  markdownContent: string
  allPosts: BlogPost[]
}

export default function BlogPostClient({ post, markdownContent, allPosts }: BlogPostClientProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              {post.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 flex items-center text-gray-600 md:mb-0">
                <Calendar size={18} className="mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                <Clock size={18} className="ml-4 mr-2" />
                {post.readTime}
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-max section-padding py-12">
        <div className="mx-auto max-w-4xl">
          <article className="rounded-xl bg-white p-8 shadow-sm md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line leading-relaxed text-gray-800">
                {markdownContent}
              </div>
            </div>
          </article>

          {/* Related Posts */}
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Related Posts</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {allPosts
                .filter(
                  (p) => p.slug !== post.slug && p.tags.some((tag) => post.tags.includes(tag)),
                )
                .slice(0, 2)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h4 className="mb-2 text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600">
                      {relatedPost.title}
                    </h4>
                    <p className="mb-3 text-sm text-gray-600">{relatedPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {new Date(relatedPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <Clock size={14} className="ml-3 mr-1" />
                      {relatedPost.readTime}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
