'use client'

export default function About() {
  const stats = [
    { label: 'Years of Experience', value: '8+' },
    { label: 'Open Source Projects', value: '20+' },
    { label: 'Security Vulnerabilities Found', value: '50+' },
    { label: 'Community Contributions', value: '1000+' },
  ]

  const expertise = [
    'Smart Contract Security',
    'Fuzzing & Testing',
    'Protocol Security',
    'Static Analysis',
    'Vulnerability Research',
    'Open Source Development',
  ]

  const technologies = [
    'Solidity',
    'Rust',
    'C++',
    'Python',
    'Go',
    'JavaScript',
    'LLVM',
    'AFL',
    'Foundry',
    'Hardhat',
    'Docker',
    'Git',
    'Ethereum',
    'EVM',
    'DeFi',
    'Smart Contracts',
  ]

  return (
    <section id="about" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">01 — About</p>
          <h2 className="section-title">About Me</h2>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Prose */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-2xl font-semibold text-fg">
                Security Engineer & Researcher
              </h3>
              <p className="mb-4 leading-relaxed text-muted">
                I'm a security engineer at the Ethereum Foundation and an independent security
                researcher with a deep passion for blockchain technology and smart contract
                security. My work focuses on identifying vulnerabilities, developing security tools,
                and contributing to the overall security posture of decentralized systems.
              </p>
              <p className="mb-4 leading-relaxed text-muted">
                With over 300 commits to the Solidity compiler and contributions to numerous
                critical projects, I've been at the forefront of blockchain security research. My
                expertise spans fuzzing, static analysis, protocol security, and vulnerability
                discovery.
              </p>
              <p className="leading-relaxed text-muted">
                I believe in the power of open-source collaboration and have contributed to projects
                like Google's OSS-Fuzz, various Ethereum clients, and developed specialized security
                tools that are used by the broader blockchain community.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-fg">Core Expertise</h4>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {expertise.map((item) => (
                  <li key={item} className="flex items-baseline gap-2 font-mono text-sm text-fg">
                    <span aria-hidden="true" className="text-accent">
                      &rsaquo;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stat ledger */}
          <div>
            <h4 className="eyebrow mb-2">By the numbers</h4>
            <dl className="divide-y divide-line border-y border-line">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-between gap-4 py-5">
                  <dt className="text-sm text-muted">{stat.label}</dt>
                  <dd className="font-mono text-3xl font-semibold tracking-tight text-fg md:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Technologies */}
        <div>
          <h3 className="mb-6 text-2xl font-semibold text-fg">Technologies & Tools</h3>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span key={tech} className="chip">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
