import portfolioData from '@/data/portfolio.json'
import ResearchGrid from '@/components/ResearchGrid'

const FEATURED_COUNT = 5

export default function Projects({ featured = false }: { featured?: boolean }) {
  const { themes } = portfolioData
  const shown = featured ? themes.slice(0, FEATURED_COUNT) : themes
  const moreCount = featured ? themes.length - shown.length : 0

  return (
    <section id="research" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">02 — Research</p>
          <h2 className="section-title">Security Research</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {featured
              ? 'Current focus areas — differential testing of Ethereum clients, post-quantum cryptography, and the tooling around both'
              : 'Building tools and techniques to find vulnerabilities before attackers do'}
          </p>
        </div>

        <ResearchGrid themes={shown} moreCount={moreCount} />
      </div>
    </section>
  )
}
