import { Award, BookOpen } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Publications() {
  const { publications } = portfolioData
  const nonEmpty = publications.filter((group) => group.papers.length > 0)

  return (
    <section id="publications" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-3">04 — Publications</p>
          <h2 className="section-title">Publications</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Peer-reviewed research in security, fuzzing, and program analysis
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-12">
          {nonEmpty.map((group) => (
            <div key={group.era}>
              <h3 className="mb-4 flex items-center text-xl font-semibold text-fg">
                <BookOpen size={20} className="mr-2 text-faint" />
                {group.era}
              </h3>
              <div className="space-y-4">
                {group.papers.map((paper, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-line p-4 transition-colors hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-fg">{paper.title}</p>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
