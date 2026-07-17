'use client'

export default function About() {
  const stats = [
    { label: 'Years of Experience', value: '10+' },
    { label: 'Open Source Projects', value: '20+' },
    { label: 'Security Vulnerabilities Found', value: '50+' },
    { label: 'Publications & Preprints', value: '11' },
  ]

  const expertise = [
    'Differential Fuzzing',
    'Ethereum Protocol Security',
    'Bug Bounty Triage',
    'Vulnerability Research',
    'Post-Quantum Cryptography',
    'AI-Assisted Security Tooling',
  ]

  const technologies = [
    'Go',
    'Rust',
    'C++',
    'Python',
    'Solidity',
    'Ethereum',
    'EVM',
    'goevmlab',
    'libFuzzer',
    'cargo-fuzz',
    'AFL',
    'Foundry',
    'Docker',
    'LLM Agents',
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
                I'm a security engineer at the Ethereum Foundation working on protocol security for
                the execution layer. My day-to-day is differential fuzzing of Ethereum clients,
                hard-fork readiness testing, and technical evaluation of submissions to the Ethereum
                Foundation's bug bounty program.
              </p>
              <p className="mb-4 leading-relaxed text-muted">
                I came to Ethereum through compiler security — 300+ commits to the Solidity
                compiler's fuzzing and testing infrastructure — and before that a Ph.D. on fuzzing
                and static analysis at TU Berlin. That background in oracle-driven testing shapes my
                client work today: if two independent implementations disagree, at least one of them
                is wrong.
              </p>
              <p className="leading-relaxed text-muted">
                I work in the open where I can: upstream fixes merged in Erigon, Nethermind, revm,
                and the executable Ethereum specs, contributions to Google's OSS-Fuzz, and a blog
                about differential testing — most recently cross-checking post-quantum cryptography
                implementations against each other.
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
