import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'
import { pageAlternates } from '@/lib/seo'
import ResearchGrid from '@/components/ResearchGrid'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Research Archive',
  description:
    'The complete archive of security research areas: Ethereum protocol security, compiler security, post-quantum cryptography, fuzzing infrastructure, P2P networking, and more.',
  alternates: pageAlternates('/research/'),
}

export default function ResearchPage() {
  const { themes } = portfolioData

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="border-b border-line">
        <div className="container-max section-padding py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="link-accent inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Portfolio
            </Link>
            <ThemeToggle />
          </div>

          <div>
            <p className="eyebrow mb-3">Research</p>
            <h1 className="section-title mb-4">Research Archive</h1>
            <p className="max-w-3xl text-xl text-muted">
              Every research area, past and present — from Solidity compiler fuzzing and OSS-Fuzz
              contributions to differential testing of Ethereum clients and post-quantum
              cryptography implementations.
            </p>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <ResearchGrid themes={themes} />
      </div>
    </main>
  )
}
