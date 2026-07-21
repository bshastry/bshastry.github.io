import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileSearch, FlaskConical, Rss } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

// The Jekyll-era site lived at these URLs for years; the shims under public/
// cover known posts, but decayed or mistyped inbound links still land here.
const destinations = [
  {
    href: '/findings/',
    icon: FileSearch,
    title: 'Security findings & disclosures',
    description: 'The complete CVE ledger, Solidity compiler bug records, and recent merged fixes.',
  },
  {
    href: '/research/',
    icon: FlaskConical,
    title: 'Research archive',
    description: 'Current and historical research themes, tools, and upstream work.',
  },
  {
    href: '/blog/',
    icon: Rss,
    title: 'Blog',
    description: 'Technical writing on fuzzing, protocol security, cryptography, and compilers.',
  },
]

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-bg">
      <div className="border-b border-line">
        <div className="container-max section-padding flex items-center justify-between py-8">
          <Link
            href="/"
            className="link-accent inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
            Back to the portfolio
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="container-max section-padding flex flex-1 flex-col justify-center py-16 md:py-24">
        <p className="eyebrow mb-3 text-accent">404 · no witness at this address</p>
        <h1 className="section-title mb-5">Page not found</h1>
        <p className="max-w-2xl text-xl leading-relaxed text-muted">
          This URL doesn&apos;t resolve — likely an old link from the previous version of this site.
          The evidence is still here; it just moved.
        </p>

        <div className="mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring group rounded-xl border border-line bg-surface/50 p-6 transition-colors hover:border-line-strong hover:bg-surface"
            >
              <item.icon size={20} className="mb-4 text-accent" aria-hidden="true" />
              <h2 className="font-medium text-fg group-hover:text-accent">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </Link>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-faint">
          Looking for something specific that used to live here?{' '}
          <a href="mailto:bshastry@posteo.de" className="link-accent">
            Email me
          </a>{' '}
          and I&apos;ll point you to it.
        </p>
      </div>
    </main>
  )
}
