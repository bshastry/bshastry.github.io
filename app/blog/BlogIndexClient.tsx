'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Search, Tag, Rss } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'
import ThemeToggle from '@/components/ThemeToggle'
import { PostTitle } from '@/components/PostTitle'

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
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="border-b border-line">
        <div className="container-max section-padding py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="link-accent inline-flex items-center focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Portfolio
            </Link>
            <ThemeToggle />
          </div>

          <div className="mb-8">
            <p className="eyebrow mb-3">Blog</p>
            <h1 className="section-title mb-4">Security Research Blog</h1>
            <p className="max-w-3xl text-xl text-muted">
              Insights and discoveries from the world of cybersecurity, fuzzing, blockchain
              security, and vulnerability research. Sharing knowledge from years of security
              engineering experience.
            </p>
            <a
              href="/feed.xml"
              className="link-accent mt-4 inline-flex items-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Rss size={14} className="mr-2" />
              Subscribe via RSS
            </a>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-0 top-1/2 -translate-y-1/2 transform text-faint"
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
                className="w-full border-0 border-b border-line bg-transparent py-3 pl-8 pr-4 text-fg placeholder:text-faint focus:border-accent focus:ring-0"
              />
            </div>
            <label htmlFor="blog-tag" className="sr-only">
              Filter by topic
            </label>
            <select
              id="blog-tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border-0 border-b border-line bg-transparent px-1 py-3 text-fg focus:border-accent focus:ring-0"
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
            <p className="text-lg text-muted">No posts found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {filteredPosts.map((post) => (
              <article key={post.slug} className="py-10">
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 flex items-center text-sm text-faint md:mb-0">
                    <Calendar size={16} className="mr-2" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <Clock size={16} className="ml-4 mr-2" />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="mb-3 text-balance text-2xl font-bold text-fg transition-colors hover:text-accent">
                  <Link href={`/blog/${post.slug}`}>
                    <PostTitle title={post.title} variant="inline" />
                  </Link>
                </h2>

                <p className="mb-4 leading-relaxed text-muted">{post.excerpt}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="chip focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="link-accent inline-flex items-center font-medium focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Read full article
                  <ArrowLeft size={16} className="ml-2 rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
