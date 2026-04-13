import { Shield, Code, Network, Bug, Globe, Wallet, ExternalLink, Github } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const themeIcons: Record<string, React.ReactNode> = {
  'protocol-security': <Shield size={24} />,
  'compiler-security': <Code size={24} />,
  'p2p-networking': <Network size={24} />,
  'fuzzing-infra': <Bug size={24} />,
  'application-security': <Globe size={24} />,
  erc4337: <Wallet size={24} />,
}

export default function Projects() {
  const { themes } = portfolioData

  return (
    <section id="projects" className="bg-gray-50 py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Security Research</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Building tools and techniques to find vulnerabilities before attackers do
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div key={theme.id} className="card flex flex-col p-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  {themeIcons[theme.id] || <Shield size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{theme.title}</h3>
                  <span className="text-sm text-gray-500">{theme.period}</span>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-600">{theme.description}</p>

              <ul className="mb-4 flex-1 space-y-2">
                {theme.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {theme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                    >
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
                        className="inline-flex items-center space-x-1 text-sm text-gray-600 transition-colors hover:text-primary-600"
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
        </div>
      </div>
    </section>
  )
}
