import portfolioData from '@/data/portfolio.json'
import { ThemeLink } from '@/components/ResearchGrid'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CaseStudies() {
  const { caseStudies } = portfolioData

  // No border-t on this section: the hero above already closes with border-b,
  // and doubling them produced a 2px seam once this moved directly below it.
  return (
    <section id="case-studies" className="bg-surface/30 py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">01 — Case Studies</p>
          <h2 className="section-title">Case Studies</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Three examples of what differential validation looks like in practice — what was at
            stake, how it was tested, and what changed upstream. Every claim links to a public
            artifact.
          </p>
        </div>

        <div className="space-y-6">
          {caseStudies.map((cs, index) => (
            <article
              key={cs.id}
              id={cs.id}
              className="relative scroll-mt-24 overflow-hidden rounded-xl border border-line bg-bg/80 p-6 md:p-8"
            >
              <span aria-hidden="true" className="absolute bottom-8 left-0 top-8 w-px bg-accent" />
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="eyebrow text-accent">{cs.eyebrow}</p>
              </div>
              <h3 className="mb-6 max-w-3xl text-balance text-2xl font-semibold text-fg">
                {cs.title}
              </h3>
              <dl className="grid grid-cols-1 gap-x-10 gap-y-5 border-t border-line pt-6 md:grid-cols-3">
                <div>
                  <dt className="eyebrow mb-2">Stakes</dt>
                  <dd className="text-sm leading-relaxed text-muted">{cs.stakes}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Approach</dt>
                  <dd className="text-sm leading-relaxed text-muted">{cs.approach}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Result</dt>
                  <dd className="text-sm leading-relaxed text-muted">{cs.result}</dd>
                </div>
              </dl>
              <div className="mt-7 border-t border-line pt-5">
                <p className="eyebrow mb-2 text-accent">Demonstrates</p>
                <p className="max-w-3xl text-sm leading-relaxed text-muted">{cs.demonstrates}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {cs.evidence.map((link) => (
                    <ThemeLink key={link.url} link={{ ...link, type: 'external' }} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-2 text-accent">Where this fits</p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Working on a critical system where independent implementations must agree — or
              building the team that is?
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/engagements"
              className="btn-primary inline-flex flex-shrink-0 items-center gap-2 px-5 py-2.5"
            >
              <span>Explore engagements</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/recruiter-brief" className="btn-ghost px-5 py-2.5">
              Recruiter brief
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
