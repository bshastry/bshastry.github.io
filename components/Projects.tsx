import portfolioData from '@/data/portfolio.json'
import ResearchGrid from '@/components/ResearchGrid'

// The homepage features the first FEATURED_COUNT entries of portfolio.json's
// themes array — the ordering in the data file is the curation.
const FEATURED_COUNT = 5

export default function Projects() {
  const { themes } = portfolioData
  const featured = themes.slice(0, FEATURED_COUNT)
  const hidden = themes.slice(FEATURED_COUNT)

  return (
    <section id="research" className="bg-bg py-24 md:py-28">
      {/* Legacy anchor: external links to /#projects predate the rename. */}
      <span id="projects" aria-hidden="true" />
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">03 — Research</p>
          <h2 className="section-title">Security Research</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Current focus areas — differential testing of Ethereum clients and cryptographic
            implementations, and the AI-driven triage and vulnerability-discovery pipelines that
            scale it
          </p>
        </div>

        <ResearchGrid themes={featured} hiddenThemes={hidden} />
      </div>
    </section>
  )
}
