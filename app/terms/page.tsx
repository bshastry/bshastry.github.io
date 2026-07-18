import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Disclaimer for bshastry.github.io: personal views, no warranties, and responsible use of published security research.',
  alternates: { canonical: '/terms/' },
}

const LAST_UPDATED = 'July 18, 2026'

export default function DisclaimerPage() {
  const { email } = portfolioData.personal

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="border-b border-line">
        <div className="container-max section-padding py-8">
          <Link
            href="/"
            className="link-accent mb-6 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>

          <div className="mb-4 flex items-center">
            <Scale size={32} className="mr-3 text-faint" />
            <h1 className="section-title">Disclaimer</h1>
          </div>

          <p className="text-lg text-muted">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <div className="mx-auto max-w-4xl">
          <div className="panel p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">Personal views</h2>
                <p className="leading-relaxed text-muted">
                  This is my personal website. Everything published here — posts, findings, talks,
                  and opinions — is my own and does not represent the position of the Ethereum
                  Foundation or any other organization I work with, unless explicitly stated.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">Security research</h2>
                <p className="leading-relaxed text-muted">
                  Vulnerability write-ups and security research on this site are published for
                  defensive and educational purposes, after coordinated disclosure where applicable.
                  Don&apos;t use anything here to attack systems you are not authorized to test.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">No warranty</h2>
                <p className="leading-relaxed text-muted">
                  Content, including code samples, is provided &quot;as is&quot; without warranty of
                  any kind. Technical material can become outdated or contain errors, and I accept
                  no liability for damages arising from its use. Links to external sites are
                  provided for convenience and do not imply endorsement.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-fg">Questions</h2>
                <p className="leading-relaxed text-muted">
                  If anything here seems wrong or you have questions about this site, email me at{' '}
                  <a href={`mailto:${email}`} className="link-accent">
                    {email}
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
