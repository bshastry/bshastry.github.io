import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Privacy notice for bshastry.github.io: a static site with no cookies, no analytics, and no contact forms.',
  alternates: { canonical: '/privacy/' },
}

const LAST_UPDATED = 'July 18, 2026'

export default function PrivacyPolicyPage() {
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
            <Shield size={32} className="mr-3 text-faint" />
            <h1 className="section-title">Privacy</h1>
          </div>

          <p className="text-lg text-muted">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <div className="mx-auto max-w-4xl">
          <div className="panel p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">The short version</h2>
                <p className="leading-relaxed text-muted">
                  This is a static personal website. It sets no cookies, runs no analytics or
                  tracking scripts, and has no contact forms or accounts. I collect no personal data
                  from your visit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">What the site stores</h2>
                <p className="leading-relaxed text-muted">
                  Your light/dark theme choice is saved in your browser&apos;s{' '}
                  <code>localStorage</code>. It never leaves your device and you can clear it at any
                  time through your browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">Hosting</h2>
                <p className="leading-relaxed text-muted">
                  The site is served by GitHub Pages. GitHub may log visitor IP addresses for
                  security purposes, as described in the{' '}
                  <a
                    href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent"
                  >
                    GitHub Privacy Statement
                  </a>
                  . I do not have access to per-visitor data from this logging.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">If you email me</h2>
                <p className="leading-relaxed text-muted">
                  The only way to contact me through this site is email (
                  <a href={`mailto:${email}`} className="link-accent">
                    {email}
                  </a>
                  ). I use your address and message solely to reply, and I don&apos;t share them
                  with anyone.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-fg">External links</h2>
                <p className="leading-relaxed text-muted">
                  Links to GitHub, YouTube, Google Scholar, and other external sites are governed by
                  those services&apos; own privacy policies.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-fg">Changes</h2>
                <p className="leading-relaxed text-muted">
                  If the site ever starts collecting data — for example, by adding analytics — this
                  page will be updated first, with a new date above.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
