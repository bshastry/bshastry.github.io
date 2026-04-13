import { FileText, Video, MapPin, Calendar } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Talks() {
  const { talks } = portfolioData

  return (
    <section id="talks" className="py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Talks</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Conference presentations and invited talks on fuzzing, compiler security, and
            vulnerability research
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk, i) => (
            <div key={i} className="card p-6">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{talk.title}</h3>
              </div>

              <div className="mb-4 space-y-1.5">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                  {talk.venue}, {talk.year}
                </div>
                {talk.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                    {talk.location}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {talk.slides && (
                  <a
                    href={talk.slides}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FileText size={14} />
                    <span>Slides</span>
                  </a>
                )}
                {talk.video && (
                  <a
                    href={talk.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Video size={14} />
                    <span>Video</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
