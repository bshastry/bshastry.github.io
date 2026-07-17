import Link from 'next/link'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function Writing({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section id="writing" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-4">05 — Writing</p>
            <h2 className="section-title">Recent Writing</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Long-form notes on differential testing, most recently a series cross-checking
              post-quantum cryptography implementations
            </p>
          </div>
          <Link
            href="/blog"
            className="link-accent inline-flex items-center gap-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>All posts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="border-t border-line">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 border-b border-line py-6 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent md:flex-row md:items-baseline md:gap-8"
            >
              <div className="flex flex-shrink-0 items-center gap-4 font-mono text-xs text-faint md:w-44 md:flex-col md:items-start md:gap-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="flex-shrink-0" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="flex-shrink-0" />
                  {post.readTime}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-fg transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
