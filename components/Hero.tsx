'use client'

import Link from 'next/link'
import { ArrowDown, Sparkles } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'
import { formatDate } from '@/lib/format'

type LatestPost = Pick<BlogPostMeta, 'slug' | 'title' | 'date'>

interface HeroProps {
  latestPost: LatestPost | null
  // Counts come from the server component so this client component doesn't
  // ship the whole portfolio JSON just to render two numbers.
  findingsCount: number
  publicationsCount: number
}

export default function Hero({ latestPost, findingsCount, publicationsCount }: HeroProps) {
  // Every number links to the evidence behind it — no unexplained totals.
  const stats = [
    { value: '10+', label: 'years in security', href: '#about' },
    {
      value: '300+',
      label: 'compiler commits',
      href: 'https://github.com/ethereum/solidity/commits?author=bshastry',
      external: true,
    },
    { value: String(findingsCount), label: 'public findings', href: '#findings' },
    { value: String(publicationsCount), label: 'publications', href: '#publications' },
  ]

  const scrollToAbout = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="flex min-h-screen items-center justify-center bg-bg pt-16">
      {/* min-w-0 lets the latest-post pill's nowrap title truncate instead of
          inflating this flex item's min-content width past the viewport. */}
      <div className="container-max section-padding w-full min-w-0">
        <div className="animate-fade-in text-center">
          {/* Main heading */}
          <h1 className="text-6xl font-semibold tracking-tight text-fg md:text-8xl">
            <span className="block">Bhargava</span>
            <span className="block text-accent">Shastry</span>
          </h1>

          {/* Defining statement */}
          <p className="mx-auto mt-8 max-w-3xl text-xl text-muted md:text-2xl">
            I find <span className="text-accent">cross-implementation failures</span> before they
            become production incidents — differential testing of Ethereum clients, cryptographic
            libraries, and compilers that turns disagreement between systems into reproducible
            evidence.
          </p>

          {/* Proof line */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-faint">
            Security Engineer at the Ethereum Foundation. Beyond the day job, I design and build
            AI-driven triage and vulnerability-discovery pipelines that scale this method — agentic
            systems with auditable logs and human review at the decision points.
          </p>

          {/* Latest activity */}
          {latestPost && (
            <Link
              href={`/blog/${latestPost.slug}`}
              className="group mx-auto mt-8 inline-flex max-w-full items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Sparkles size={14} className="flex-shrink-0 text-accent" />
              <span className="eyebrow flex-shrink-0">Latest</span>
              <span className="truncate">{latestPost.title}</span>
              <time
                dateTime={latestPost.date}
                className="flex-shrink-0 font-mono text-xs text-faint"
              >
                {formatDate(latestPost.date, { year: 'numeric', month: 'short' })}
              </time>
            </Link>
          )}

          {/* Stats row — each stat links to its evidence */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 divide-line border-y border-line md:grid-cols-4 md:divide-x">
            {stats.map((stat) => (
              <a
                key={stat.label}
                href={stat.href}
                {...(stat.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex flex-col items-center gap-2 px-4 py-8 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              >
                <span className="font-mono text-4xl font-semibold tracking-tight text-fg md:text-5xl">
                  {stat.value}
                </span>
                <span className="eyebrow">{stat.label}</span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#case-studies"
              className="btn-primary px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              See case studies
            </a>
            <a
              href="#contact"
              className="btn-ghost px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Discuss a scoped review
            </a>
          </div>

          {/* Independence qualifier */}
          <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-faint">
            Independent engagements are limited and subject to conflict review. Employer affiliation
            does not imply endorsement.
          </p>

          {/* Scroll indicator */}
          <button
            onClick={scrollToAbout}
            className="mt-16 animate-bounce text-faint transition-colors duration-200 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}
