'use client'

import Link from 'next/link'
import { ArrowDown, FileDown, Sparkles } from 'lucide-react'

const stats = [
  { value: '10+', label: 'years' },
  { value: '20+', label: 'projects' },
  { value: '50+', label: 'vulnerabilities' },
  { value: '11', label: 'publications' },
]

interface LatestPost {
  slug: string
  title: string
  date: string
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export default function Hero({ latestPost }: { latestPost: LatestPost | null }) {
  const scrollToAbout = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="flex min-h-screen items-center justify-center bg-bg pt-16">
      <div className="container-max section-padding">
        <div className="animate-fade-in text-center">
          {/* Main heading */}
          <h1 className="text-6xl font-semibold tracking-tight text-fg md:text-8xl">
            <span className="block">Bhargava</span>
            <span className="block text-accent">Shastry</span>
          </h1>

          {/* Role line */}
          <p className="mx-auto mt-8 max-w-3xl text-xl text-muted md:text-2xl">
            Security Engineer at the <span className="text-accent">Ethereum Foundation</span> &amp;
            Independent Security Researcher
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
              <span className="flex-shrink-0 font-mono text-xs text-faint">
                {formatDate(latestPost.date)}
              </span>
            </Link>
          )}

          {/* Stats row */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 divide-line border-y border-line md:grid-cols-4 md:divide-x">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 px-4 py-8">
                <span className="font-mono text-4xl font-semibold tracking-tight text-fg md:text-5xl">
                  {stat.value}
                </span>
                <span className="eyebrow">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#findings"
              className="btn-primary px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              View findings
            </a>
            <a
              href="/media/Bhargava_Shastry_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FileDown size={16} />
              <span>Download CV</span>
            </a>
            <a
              href="#contact"
              className="btn-ghost px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Work with me
            </a>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToAbout}
            className="mt-20 animate-bounce text-faint transition-colors duration-200 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}
