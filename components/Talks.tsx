import { Fragment } from 'react'
import Link from 'next/link'
import { BookOpen, FileText, Video } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const latestVenueYear = (talk: (typeof portfolioData.talks)[number]) =>
  Math.max(...talk.venues.map((venue) => venue.year))

export default function Talks() {
  const talks = [...portfolioData.talks].sort((a, b) => latestVenueYear(b) - latestVenueYear(a))

  return (
    <section id="talks" className="py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">05 — Talks</p>
          <h2 className="section-title">Talks</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Conference presentations and invited talks on fuzzing, compiler security, and
            vulnerability research
          </p>
        </div>

        <div className="border-t border-line">
          {talks.map((talk) => (
            <article key={talk.title} className="border-b border-line py-6">
              <h3 className="text-lg font-semibold text-fg">{talk.title}</h3>

              {talk.summary && (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{talk.summary}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {talk.venues.map((venue) => (
                  <Fragment key={`${talk.title}-${venue.venue}`}>
                    <a
                      href={venue.slides}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={venue.location ? `${venue.venue}, ${venue.location}` : venue.venue}
                      className="chip gap-1.5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <FileText size={13} />
                      <span>
                        {venue.venue} &apos;{String(venue.year).slice(-2)}
                      </span>
                    </a>
                    {'video' in venue && venue.video && (
                      <a
                        href={venue.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chip gap-1.5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Video size={13} />
                        <span>{venue.venue} video</span>
                      </a>
                    )}
                  </Fragment>
                ))}

                {'essay' in talk && talk.essay && (
                  <Link
                    href={talk.essay}
                    className="chip gap-1.5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <BookOpen size={13} />
                    <span>Long version</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
