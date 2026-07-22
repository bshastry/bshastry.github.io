import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Key, Mail } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import portfolioData from '@/data/portfolio.json'
import { engagementGuides, getEngagementGuide, getEngagementInquiryHref } from '@/lib/engagements'
import { pageAlternates, serializeJsonLd, SITE_URL } from '@/lib/seo'

interface EngagementGuidePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return engagementGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: EngagementGuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getEngagementGuide(slug)
  if (!guide) return {}

  const canonical = `/engagements/${guide.slug}/`
  return {
    title: guide.metadataTitle,
    description: guide.metadataDescription,
    alternates: pageAlternates(canonical),
    openGraph: {
      type: 'website',
      title: guide.metadataTitle,
      description: guide.metadataDescription,
      url: `${SITE_URL}${canonical}`,
    },
  }
}

function EvidenceLink({ href, label }: { href: string; label: string }) {
  const className =
    'link-accent inline-flex items-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <span>{label}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      <span>{label}</span>
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  )
}

export default async function EngagementGuidePage({ params }: EngagementGuidePageProps) {
  const { slug } = await params
  const guide = getEngagementGuide(slug)
  if (!guide) notFound()

  const canonicalUrl = `${SITE_URL}/engagements/${guide.slug}/`
  const inquiryHref = getEngagementInquiryHref(guide.label)
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: guide.metadataTitle,
    serviceType: guide.serviceType,
    url: canonicalUrl,
    description: guide.metadataDescription,
    provider: {
      '@type': 'Person',
      name: 'Bhargava Shastry',
      url: SITE_URL,
    },
    audience: {
      '@type': 'Audience',
      audienceType: guide.audience,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-bg pt-16">
        <section className="border-b border-line">
          <div className="container-max section-padding py-14 sm:py-20">
            <nav aria-label="Breadcrumb" className="mb-8">
              <Link
                href="/engagements/"
                className="link-accent inline-flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                All engagement options
              </Link>
            </nav>
            <p className="eyebrow mb-4 text-accent">{guide.eyebrow}</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              {guide.heading}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted">{guide.lead}</p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={inquiryHref}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <Mail size={16} aria-hidden="true" />
                Start a structured enquiry
              </a>
              <Link href="/#case-studies" className="btn-ghost px-6 py-3">
                Review public evidence
              </Link>
            </div>
          </div>
        </section>

        <section className="container-max section-padding py-16 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]">
            <div>
              <h2 className="section-title">When this is useful</h2>
              <ul className="mt-6 space-y-4">
                {guide.situations.map((situation) => (
                  <li key={situation} className="flex gap-3 text-muted">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                    />
                    <span className="leading-relaxed">{situation}</span>
                  </li>
                ))}
              </ul>

              <h2 className="section-title mt-16">How the work proceeds</h2>
              <ol className="mt-7 divide-y divide-line border-y border-line">
                {guide.phases.map((phase, index) => (
                  <li key={phase.title} className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr]">
                    <span className="font-mono text-sm text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-semibold text-fg">{phase.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{phase.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="h-fit rounded-xl border border-line bg-surface/50 p-6">
              <p className="eyebrow text-accent">Typical outputs</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
                {guide.outputs.map((output) => (
                  <li key={output} className="flex gap-3">
                    <span aria-hidden="true" className="text-accent">
                      —
                    </span>
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-line pt-6">
                <p className="eyebrow mb-3">Scope boundary</p>
                <p className="text-sm leading-relaxed text-muted">{guide.boundary}</p>
              </div>
            </aside>
          </div>

          <div className="mt-16 border-t border-line pt-12">
            <p className="eyebrow mb-4 text-accent">Public evidence</p>
            <h2 className="section-title">Start with work you can inspect</h2>
            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
              {guide.evidence.map((item) => (
                <article
                  key={item.href}
                  className="rounded-xl border border-line bg-surface/40 p-5"
                >
                  <p className="min-h-16 text-sm leading-relaxed text-muted">{item.description}</p>
                  <div className="mt-5">
                    <EvidenceLink href={item.href} label={item.label} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
            <p className="eyebrow text-accent">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold text-fg">
              Describe the decision, not secrets
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
              A short, non-confidential note about the system, milestone, desired evidence, timing,
              and possible Ethereum Foundation conflicts is enough to begin. Do not email
              vulnerability details, source code, credentials, or secrets.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={inquiryHref}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <Mail size={16} aria-hidden="true" />
                Start a structured enquiry
              </a>
              <a
                href={`https://keybase.io/${portfolioData.personal.social.keybase}/pgp_keys.asc`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2 px-6 py-3"
              >
                <Key size={16} aria-hidden="true" />
                PGP key
              </a>
            </div>
            <p className="mt-7 max-w-3xl text-xs leading-relaxed text-faint">
              Independent engagements are limited, subject to conflict review, and represent my own
              views and work. They are not offered, endorsed, or reviewed by the Ethereum
              Foundation.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
