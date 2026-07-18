import { ExternalLink } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const rows = [
  { key: 'stakes', label: 'Stakes' },
  { key: 'approach', label: 'Approach' },
  { key: 'result', label: 'Result' },
] as const

export default function CaseStudies() {
  const { caseStudies } = portfolioData

  return (
    <section id="case-studies" className="border-t border-line py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">02 — Case Studies</p>
          <h2 className="section-title">Case Studies</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Three examples of what differential validation looks like in practice — what was at
            stake, how it was tested, and what changed upstream. Every claim links to a public
            artifact.
          </p>
        </div>

        <div className="space-y-12">
          {caseStudies.map((cs) => (
            <article key={cs.id} className="border-t border-line pt-8">
              <p className="eyebrow mb-3 text-accent">{cs.eyebrow}</p>
              <h3 className="mb-6 max-w-3xl text-balance text-2xl font-semibold text-fg">
                {cs.title}
              </h3>
              <dl className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
                {rows.map(({ key, label }) => (
                  <div key={key}>
                    <dt className="eyebrow mb-2">{label}</dt>
                    <dd className="text-sm leading-relaxed text-muted">{cs[key]}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-mono text-xs text-faint">{cs.demonstrates}</span>
                <span className="flex flex-wrap items-center gap-4">
                  {cs.evidence.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      {...(link.url.startsWith('/')
                        ? {}
                        : { target: '_blank', rel: 'noopener noreferrer' })}
                      className="link-accent inline-flex items-center gap-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ExternalLink size={13} className="flex-shrink-0" />
                      {link.label}
                    </a>
                  ))}
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-faint">
          Working on a system where independent implementations must agree?{' '}
          <a href="#contact" className="link-accent">
            Discuss a scoped review
          </a>
          .
        </p>
      </div>
    </section>
  )
}
