'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Search, Rss } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'
import { COLLECTIONS, collectionFor, type Collection } from '@/lib/collections'
import ThemeToggle from '@/components/ThemeToggle'
import { PostTitle } from '@/components/PostTitle'

interface BlogIndexClientProps {
  posts: BlogPostMeta[]
}

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<Collection | ''>('')

  // Granular tags stay in post metadata; readers navigate six collections.
  const collectionOf = useMemo(
    () => new Map(posts.map((p) => [p.slug, collectionFor(p.tags)])),
    [posts],
  )
  const visibleCollections = COLLECTIONS.filter((c) =>
    posts.some((p) => collectionOf.get(p.slug) === c),
  )

  const filteredPosts = posts.filter((p) => {
    if (selectedCollection && collectionOf.get(p.slug) !== selectedCollection) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

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
              Field notes on differential testing, fuzzing, and the security of multi-implementation
              systems — Ethereum clients, cryptographic libraries, and compilers.
            </p>
            <a
              href="/feed.xml"
              className="link-accent mt-4 inline-flex items-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Rss size={14} className="mr-2" />
              Subscribe via RSS
            </a>
          </div>

          <div className="mb-4">
            <div className="relative max-w-xl">
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
          </div>

          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by collection">
            <button
              type="button"
              onClick={() => setSelectedCollection('')}
              aria-pressed={selectedCollection === ''}
              className={`chip transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                selectedCollection === '' ? 'border-accent text-accent' : ''
              }`}
            >
              All posts
            </button>
            {visibleCollections.map((collection) => (
              <button
                key={collection}
                type="button"
                onClick={() =>
                  setSelectedCollection(selectedCollection === collection ? '' : collection)
                }
                aria-pressed={selectedCollection === collection}
                className={`chip transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  selectedCollection === collection ? 'border-accent text-accent' : ''
                }`}
              >
                {collection}
              </button>
            ))}
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
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {post.readTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCollection(collectionOf.get(post.slug) ?? 'Archive')}
                    className="chip focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {collectionOf.get(post.slug)}
                  </button>
                </div>

                <h2 className="mb-3 text-balance text-2xl font-bold text-fg transition-colors hover:text-accent">
                  <Link href={`/blog/${post.slug}`}>
                    <PostTitle title={post.title} variant="inline" />
                  </Link>
                </h2>

                <p className="mb-4 leading-relaxed text-muted">{post.excerpt}</p>

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
