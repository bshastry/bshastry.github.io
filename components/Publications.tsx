import { Award } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Publications() {
  const { publications } = portfolioData
  const nonEmpty = publications.filter((group) => group.papers.length > 0)

  return (
    <section id="publications" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-3">07 — Publications</p>
          <h2 className="section-title">Publications</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Research in security, fuzzing, and program analysis
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-10">
          {nonEmpty.map((group) => (
            <div key={group.era}>
              <h3 className="mb-4 text-xl font-semibold text-fg">{group.era}</h3>
              <div className="border-t border-line">
                {group.papers.map((paper, i) => (
                  <article key={i} className="border-b border-line py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {paper.url ? (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            {paper.title}
                          </a>
                        ) : (
                          <p className="font-medium text-fg">{paper.title}</p>
                        )}
                        <p className="mt-1 text-sm text-muted">{paper.authors}</p>
                        <p className="mt-1 text-sm font-medium text-accent">{paper.venue}</p>
                      </div>
                      {paper.award && (
                        <span className="chip ml-3 flex-shrink-0 space-x-1">
                          <Award size={12} />
                          <span>{paper.award}</span>
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
