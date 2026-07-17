import { FileText, Video, MapPin, Calendar } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Talks() {
  const { talks } = portfolioData

  return (
    <section id="talks" className="py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">04 — Talks</p>
          <h2 className="section-title">Talks</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Conference presentations and invited talks on fuzzing, compiler security, and
            vulnerability research
          </p>
        </div>

        <div className="border-t border-line">
          {talks.map((talk, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 border-b border-line py-6 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-fg">{talk.title}</h3>

                {talk.summary && (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                    {talk.summary}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-faint">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    {talk.venue}, {talk.year}
                  </span>
                  {talk.location && (
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-2 flex-shrink-0" />
                      {talk.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3">
                {talk.slides && (
                  <a
                    href={talk.slides}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip gap-1.5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    className="chip gap-1.5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
