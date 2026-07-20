import { ExternalLink, FileText, GitMerge, ShieldAlert } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const typeIcons: Record<string, React.ReactNode> = {
  Paper: <FileText size={12} />,
  'Merged fix': <GitMerge size={12} />,
  'Merged tests': <GitMerge size={12} />,
  'Fixed upstream': <GitMerge size={12} />,
  'Security advisory': <ShieldAlert size={12} />,
}
const fallbackTypeIcon = <FileText size={12} />

export default function Findings() {
  const { findings } = portfolioData

  return (
    <section id="findings" className="py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">04 — Findings</p>
          <h2 className="section-title">Selected Findings</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            The evidence index behind the case studies. Don&apos;t take the numbers on faith — every
            entry below links to a public artifact: a merged fix, upstreamed tests, or published
            research.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
          {findings.map((finding) => (
            <a
              key={finding.url}
              href={finding.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col bg-bg p-6 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                finding.featured ? 'border-t-2 border-accent md:col-span-2 md:p-8' : ''
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="chip gap-1.5">
                  {typeIcons[finding.type] ?? fallbackTypeIcon}
                  <span>{finding.type}</span>
                </span>
                <span className="font-mono text-xs text-faint">{finding.date}</span>
              </div>
              <h3
                className={`${
                  finding.featured ? 'text-lg' : 'text-base'
                } font-semibold text-fg transition-colors group-hover:text-accent`}
              >
                {finding.title}
              </h3>
              <p className="mb-4 mt-2 flex-1 text-sm leading-relaxed text-muted">
                {finding.description}
              </p>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-faint">
                <ExternalLink size={12} className="flex-shrink-0" />
                {finding.project}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-faint">
          Bug-bounty submissions and client-security reports are disclosed privately by default;
          this is the subset of the work with public artifacts. More on{' '}
          <a
            href={`https://github.com/${portfolioData.personal.social.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  )
}
