'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from 'lucide-react'
import type { BlogPost, BlogPostMeta, SeriesPart } from '@/lib/blog'
import ThemeToggle from '@/components/ThemeToggle'
import { SeriesNav, SeriesPager } from '@/components/SeriesNav'
import { PostTitle } from '@/components/PostTitle'

interface BlogPostClientProps {
  post: BlogPost
  allPosts: BlogPostMeta[]
  seriesTitle: string | null
  seriesParts: SeriesPart[]
}

export default function BlogPostClient({
  post,
  allPosts,
  seriesTitle,
  seriesParts,
}: BlogPostClientProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2)

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="border-b border-line">
        <div className="container-max section-padding py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/blog"
              className="link-accent inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Blog
            </Link>
            <ThemeToggle />
          </div>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="chip">
                  <Tag size={12} className="mr-1 text-faint" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-4 max-w-3xl text-balance text-3xl font-bold leading-[1.1] tracking-tight text-fg sm:text-4xl md:text-5xl">
              <PostTitle title={post.title} variant="full" />
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 flex items-center text-sm text-faint md:mb-0">
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

              <button
                type="button"
                onClick={handleShare}
                className="btn-ghost inline-flex items-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <div className="mx-auto max-w-4xl">
          {seriesTitle && <SeriesNav title={seriesTitle} parts={seriesParts} />}

          {post.headings.length >= 3 && (
            <nav aria-label="Table of contents" className="mb-10 border-l-2 border-line py-1 pl-6">
              <p className="eyebrow mb-3">On this page</p>
              <ul className="space-y-2">
                {post.headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <article>
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-a:text-accent hover:prose-a:opacity-80"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          <SeriesPager parts={seriesParts} />

          {related.length > 0 && (
            <div className="mt-16 border-t border-line pt-12">
              <h3 className="mb-6 text-2xl font-semibold tracking-tight text-fg">Related Posts</h3>
              <div className="divide-y divide-line border-y border-line">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group block py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <h4 className="mb-2 text-balance text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-accent">
                      <PostTitle title={rp.title} variant="inline" />
                    </h4>
                    <p className="mb-3 text-sm text-muted">{rp.excerpt}</p>
                    <div className="flex items-center text-sm text-faint">
                      <Calendar size={14} className="mr-1" />
                      <time dateTime={rp.date}>
                        {new Date(rp.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                      <Clock size={14} className="ml-3 mr-1" />
                      {rp.readTime}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
