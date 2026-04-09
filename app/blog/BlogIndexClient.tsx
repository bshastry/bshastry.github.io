'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Search, Tag } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'

interface BlogIndexClientProps {
  posts: BlogPostMeta[]
}

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [filteredPosts, setFilteredPosts] = useState(posts)

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)))

  useEffect(() => {
    let filtered = posts
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (selectedTag) {
      filtered = filtered.filter((p) => p.tags.includes(selectedTag))
    }
    setFilteredPosts(filtered)
  }, [searchTerm, selectedTag, posts])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Portfolio
          </Link>

          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Security Research Blog</h1>
            <p className="max-w-3xl text-xl text-gray-600">
              Insights and discoveries from the world of cybersecurity, fuzzing, blockchain
              security, and vulnerability research. Sharing knowledge from years of security
              engineering experience.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              />
              <label htmlFor="blog-search" className="sr-only">
                Search posts
              </label>
              <input
                id="blog-search"
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label htmlFor="blog-tag" className="sr-only">
              Filter by topic
            </label>
            <select
              id="blog-tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">No posts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 flex items-center text-sm text-gray-500 md:mb-0">
                    <Calendar size={16} className="mr-2" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    <Clock size={16} className="ml-4 mr-2" />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="mb-4 leading-relaxed text-gray-600">{post.excerpt}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-colors hover:bg-blue-200"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Read full article
                  <ArrowLeft size={16} className="ml-2 rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
