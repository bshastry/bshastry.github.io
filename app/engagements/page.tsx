import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Engagements from '@/components/Engagements'
import { engagementOffers } from '@/lib/engagements'
import { pageAlternates, serializeJsonLd, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Differential Testing & Protocol Security Engagements',
  description:
    'Independent differential fuzzing, Ethereum client and implementation review, constant-time analysis, and team workshops for critical systems.',
  alternates: pageAlternates('/engagements/'),
  openGraph: {
    title: 'Differential Testing & Protocol Security Engagements',
    description:
      'Conflict-screened security engagements for critical multi-implementation systems approaching a release, upgrade, or standardization milestone.',
    url: `${SITE_URL}/engagements/`,
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Differential Testing & Protocol Security Engagements',
  url: `${SITE_URL}/engagements/`,
  description:
    'Independent differential testing, critical implementation review, and workshops for critical multi-implementation systems.',
  provider: {
    '@type': 'Person',
    name: 'Bhargava Shastry',
    url: SITE_URL,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Scoped security engagements',
    itemListElement: engagementOffers.map((engagement) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: engagement.title,
        description: `${engagement.audience} ${engagement.deliverables}`,
      },
    })),
  },
}

export default function EngagementsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-bg pt-16">
        <section className="border-b border-line">
          <div className="container-max section-padding py-16 sm:py-20">
            <p className="eyebrow mb-4 text-accent">Independent · conflict-screened</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              Differential testing for critical systems approaching a milestone
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted">
              For teams that need independent evidence before a release, hard fork, protocol
              upgrade, cryptographic rollout, or standardization decision.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
              Detailed scopes cover differential fuzzing, client and protocol implementation review,
              constant-time analysis, and team capability building. Each scope is tied to public
              evidence and states what it does not cover.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-faint">
              The ranges below are planning estimates for a focused scope, not availability
              commitments. Timing is confirmed only after an Ethereum Foundation
              conflict-of-interest check and an availability discussion.
            </p>
          </div>
        </section>

        <section className="container-max section-padding py-16 md:py-20">
          <Engagements />
        </section>
      </main>
      <Footer />
    </>
  )
}
