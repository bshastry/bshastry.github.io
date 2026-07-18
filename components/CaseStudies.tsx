import portfolioData from '@/data/portfolio.json'
import { ThemeLink } from '@/components/ResearchGrid'

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
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-mono text-xs text-faint">{cs.demonstrates}</span>
                <span className="flex flex-wrap items-center gap-4">
                  {cs.evidence.map((link) => (
                    <ThemeLink key={link.url} link={{ ...link, type: 'external' }} />
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
