import { FileDown } from 'lucide-react'

export default function About() {
  const expertise = [
    'Differential Testing & Fuzzing',
    'AI-Driven Triage & Vuln Discovery',
    'Ethereum Protocol Security',
    'Post-Quantum Cryptography',
    'Side-Channel Analysis',
    'Bug Bounty Triage',
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
          <div>
            <h3 className="mb-5 text-2xl font-semibold text-fg">
              Turning disagreement into evidence
            </h3>
            <p className="mb-5 text-lg leading-relaxed text-fg">
              My working thesis: in a system with more than one implementation there is no ground
              truth — only witnesses that can disagree. I make them disagree under controlled
              conditions. I build coverage-guided differential fuzzers that run Ethereum&apos;s
              execution clients, post-quantum cryptography libraries, and compilers against each
              other, so every divergence becomes a reproducible bug report before it becomes a
              production incident.
            </p>
            <p className="mb-4 leading-relaxed text-muted">
              I practice this as a security engineer at the Ethereum Foundation — differential
              fuzzing of execution clients, hard-fork readiness testing, and bug-bounty triage. To
              scale the method, I design and build AI-driven pipelines that decompose vulnerability
              research into context building, harness generation, PoC validation, and triage:
              deterministic orchestration, auditable logs, and human review at the decision points.
            </p>
            <p className="leading-relaxed text-muted">
              The method has deep roots — a Ph.D. on fuzzing and static analysis at TU Berlin, 300+
              commits to the Solidity compiler&apos;s fuzzing infrastructure, contributions to
              Google&apos;s OSS-Fuzz — and I work in the open where I can: upstream fixes merged in
              Erigon, Nethermind, revm, and the executable Ethereum specs, most recently
              cross-checking post-quantum cryptography implementations against each other.
            </p>
          </div>

          {/* Expertise + CV */}
          <div className="h-fit space-y-8 rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
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

            <a
              href="/media/Bhargava_Shastry_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FileDown size={16} />
              <span>Download CV (PDF)</span>
            </a>
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
