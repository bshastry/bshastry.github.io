import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileDown, Github, Linkedin, Mail, MapPin } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import portfolioData from '@/data/portfolio.json'
import { disclosureSummary, solSmithPatchedMiscompilations } from '@/lib/disclosures'
import { pageAlternates, serializeJsonLd, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Protocol Security Engineer — Recruiter Brief',
  description:
    'Recruiter brief for Bhargava Shastry: protocol security, differential fuzzing, Ethereum client testing, compiler security, cryptographic implementations, and AI-assisted vulnerability research.',
  alternates: pageAlternates('/recruiter-brief/'),
  openGraph: {
    title: 'Bhargava Shastry — Protocol Security Recruiter Brief',
    description:
      'A concise hiring-team view of role fit, current focus, public evidence, experience, and contact details.',
    url: `${SITE_URL}/recruiter-brief/`,
  },
}

const focusAreas = [
  'Protocol security and multi-client consensus testing',
  'Differential testing, coverage-guided fuzzing, and test-oracle design',
  'Compiler, virtual-machine, and cryptographic implementation security',
  'AI-assisted vulnerability discovery, PoC validation, and triage pipelines',
]

const recruiterJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: 'Bhargava Shastry — Recruiter Brief',
  url: `${SITE_URL}/recruiter-brief/`,
  mainEntity: {
    '@type': 'Person',
    name: 'Bhargava Shastry',
    url: SITE_URL,
    jobTitle: 'Security Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Ethereum Foundation',
    },
    knowsAbout: focusAreas,
  },
}

export default function RecruiterBriefPage() {
  const { personal, experience, education } = portfolioData
  const roleConversationHref = `mailto:${personal.email}?subject=${encodeURIComponent(
    'Role conversation',
  )}&body=${encodeURIComponent(`Organization and role:
Why this background may be relevant:
Working model or location constraint:
Timing (if known):
How did you find this page?:
`)}`
  const publicationsCount = portfolioData.publications.reduce(
    (sum, group) => sum + group.papers.length,
    0,
  )

  const stats = [
    { value: `${experience[0].period}`, label: 'Ethereum Foundation' },
    { value: String(solSmithPatchedMiscompilations), label: 'patched miscompilations found' },
    { value: String(disclosureSummary.cves), label: 'CVE-backed disclosures' },
    { value: String(publicationsCount), label: 'publications' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(recruiterJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-bg pt-16">
        <section className="border-b border-line">
          <div className="container-max section-padding py-16 sm:py-20">
            <p className="eyebrow mb-4 text-accent">For hiring teams</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              Protocol security, differential testing, and vulnerability research
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted">
              I&apos;m established in my role at the Ethereum Foundation and glad to hear from teams
              working on hard verification problems. This page is the shortest route through the
              evidence; timing and fit are discussed directly.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={personal.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <FileDown size={16} aria-hidden="true" />
                Download CV (PDF)
              </a>
              <a
                href={roleConversationHref}
                className="btn-ghost inline-flex items-center gap-2 px-6 py-3"
              >
                <Mail size={16} aria-hidden="true" />
                Start a conversation
              </a>
            </div>
          </div>
        </section>

        <section className="container-max section-padding py-16 md:py-20">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface/50 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-6 text-center ${
                  index % 2 === 1 ? 'border-l border-line' : ''
                } ${index < 2 ? 'border-b border-line md:border-b-0' : ''} ${
                  index > 0 ? 'md:border-l md:border-line' : ''
                }`}
              >
                <span className="font-mono text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                  {stat.value}
                </span>
                <span className="eyebrow text-center">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.6fr)]">
            <div>
              <h2 className="section-title">Relevant mandates</h2>
              <ul className="mt-6 space-y-4">
                {focusAreas.map((area) => (
                  <li key={area} className="flex gap-3 text-muted">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                    />
                    <span className="leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>

              <h2 className="section-title mt-14">Selected experience</h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {experience.slice(0, 3).map((role) => (
                  <article key={`${role.company}-${role.period}`} className="py-6">
                    <p className="font-mono text-xs text-accent">{role.period}</p>
                    <h3 className="mt-2 text-lg font-semibold text-fg">
                      {role.title} · {role.company}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{role.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-line bg-surface/50 p-6">
              <p className="eyebrow text-accent">At a glance</p>
              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="text-faint">Current role</dt>
                  <dd className="mt-1 font-medium text-fg">
                    Security Engineer · Ethereum Foundation
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">Working model</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 font-medium text-fg">
                    <MapPin size={14} aria-hidden="true" />
                    {personal.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">Highest degree</dt>
                  <dd className="mt-1 font-medium text-fg">
                    {education[0].degree} · {education[0].institution}
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">Availability</dt>
                  <dd className="mt-1 leading-relaxed text-muted">
                    Selective conversations; timing and fit discussed directly.
                  </dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-col items-start gap-3 border-t border-line pt-6 text-sm">
                <a
                  href={`https://linkedin.com/in/${personal.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent inline-flex items-center gap-2"
                >
                  <Linkedin size={15} aria-hidden="true" />
                  LinkedIn
                </a>
                <a
                  href={`https://github.com/${personal.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent inline-flex items-center gap-2"
                >
                  <Github size={15} aria-hidden="true" />
                  GitHub
                </a>
                <a
                  href={`mailto:${personal.email}`}
                  className="link-accent inline-flex items-center gap-2"
                >
                  <Mail size={15} aria-hidden="true" />
                  {personal.email}
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-16 border-t border-line pt-10">
            <p className="eyebrow mb-4 text-accent">Start with the evidence</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Case studies', '/#case-studies'],
                ['Security findings', '/findings/'],
                ['Research archive', '/research/'],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="focus-ring group flex items-center justify-between rounded-lg border border-line bg-surface/40 px-5 py-4 text-sm font-medium text-fg transition-colors hover:border-line-strong"
                >
                  <span>{label}</span>
                  <ArrowRight size={15} className="text-accent" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
