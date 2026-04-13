import { Award, BookOpen } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Publications() {
  const { publications } = portfolioData
  const nonEmpty = publications.filter((group) => group.papers.length > 0)

  return (
    <section id="publications" className="bg-gray-50 py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Publications</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Peer-reviewed research in security, fuzzing, and program analysis
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-10">
          {nonEmpty.map((group) => (
            <div key={group.era}>
              <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                <BookOpen size={20} className="mr-2 text-primary-600" />
                {group.era}
              </h3>
              <div className="space-y-4">
                {group.papers.map((paper, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{paper.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{paper.authors}</p>
                        <p className="mt-1 text-sm font-medium text-primary-600">{paper.venue}</p>
                      </div>
                      {paper.award && (
                        <span className="ml-3 inline-flex flex-shrink-0 items-center space-x-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800">
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
