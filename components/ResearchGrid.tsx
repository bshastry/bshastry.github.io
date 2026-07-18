import {
  Shield,
  Code,
  Network,
  Bug,
  Globe,
  Wallet,
  Crosshair,
  Atom,
  Bot,
  Timer,
  ExternalLink,
  Github,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import portfolioData from '@/data/portfolio.json'

type Theme = (typeof portfolioData.themes)[number]

const themeIcons: Record<string, React.ReactNode> = {
  'protocol-security': <Shield size={16} />,
  'bug-bounty': <Crosshair size={16} />,
  'post-quantum': <Atom size={16} />,
  'crypto-side-channels': <Timer size={16} />,
  'ai-security': <Bot size={16} />,
  'compiler-security': <Code size={16} />,
  'p2p-networking': <Network size={16} />,
  'fuzzing-infra': <Bug size={16} />,
  'application-security': <Globe size={16} />,
  erc4337: <Wallet size={16} />,
}

export default function ResearchGrid({
  themes,
  moreCount = 0,
}: {
  themes: Theme[]
  moreCount?: number
}) {
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme, index) => (
        <div key={theme.id} className="flex flex-col bg-bg p-6">
          <div className="mb-4 flex items-baseline gap-3">
            <span className="font-mono text-sm text-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
                <span className="text-faint">{themeIcons[theme.id] || <Shield size={16} />}</span>
                {theme.title}
              </h3>
              <span className="font-mono text-sm text-faint">{theme.period}</span>
            </div>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-muted">{theme.description}</p>

          <ul className="mb-4 flex-1 space-y-2">
            {theme.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start text-sm text-muted">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {theme.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>

            {theme.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {theme.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent inline-flex items-center gap-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {link.type === 'github' ? <Github size={14} /> : <ExternalLink size={14} />}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {moreCount > 0 && (
        <Link
          href="/research"
          className="group flex flex-col items-center justify-center gap-3 bg-bg p-6 text-center transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <span className="text-lg font-semibold text-fg transition-colors group-hover:text-accent">
            All research areas
          </span>
          <span className="text-sm text-muted">
            {moreCount} more, from compiler security to P2P networking
          </span>
          <span className="link-accent inline-flex items-center gap-1.5 text-sm font-medium">
            <span>View the full archive</span>
            <ArrowRight size={14} />
          </span>
        </Link>
      )}
    </div>
  )
}
