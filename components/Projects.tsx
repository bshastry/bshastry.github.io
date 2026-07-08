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
  ExternalLink,
  Github,
  Lock,
} from 'lucide-react'
import portfolioData from '@/data/portfolio.json'
import githubStats from '@/data/github-stats.json'

const themeIcons: Record<string, React.ReactNode> = {
  'protocol-security': <Shield size={16} />,
  'bug-bounty': <Crosshair size={16} />,
  'post-quantum': <Atom size={16} />,
  'ai-security': <Bot size={16} />,
  'compiler-security': <Code size={16} />,
  'p2p-networking': <Network size={16} />,
  'fuzzing-infra': <Bug size={16} />,
  'application-security': <Globe size={16} />,
  erc4337: <Wallet size={16} />,
}

export default function Projects() {
  const { themes } = portfolioData
  const stats = githubStats.themes as Record<
    string,
    { privateRepos: number; languages: Record<string, number> }
  >

  return (
    <section id="projects" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">02 — RESEARCH</p>
          <h2 className="section-title">Security Research</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Building tools and techniques to find vulnerabilities before attackers do
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => {
            const themeStats = stats[theme.id]
            const privateCount = themeStats?.privateRepos ?? 0

            return (
              <div key={theme.id} className="flex flex-col bg-bg p-6">
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-mono text-sm text-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
                      <span className="text-faint">
                        {themeIcons[theme.id] || <Shield size={16} />}
                      </span>
                      {theme.title}
                    </h3>
                    <span className="font-mono text-sm text-faint">{theme.period}</span>
                  </div>
                </div>

                {privateCount > 0 && (
                  <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-xs text-faint">
                    <Lock size={11} />
                    <span>
                      {privateCount} private repo{privateCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

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
                          {link.type === 'github' ? (
                            <Github size={14} />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
