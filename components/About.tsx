import Link from 'next/link'
import { FileDown } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

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

export default function About() {
  const { experience, education } = portfolioData

  return (
    <section id="about" className="bg-bg py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">01 — About</p>
          <h2 className="section-title">About Me</h2>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <blockquote className="mb-8 border-l-2 border-accent pl-5">
              <p className="text-xl font-semibold leading-relaxed text-fg sm:text-2xl">
                “In a system with more than one implementation there is no ground truth — only
                witnesses that disagree. So: trust no single witness.”
              </p>
              <Link
                href="/blog/trust-no-single-witness"
                className="link-accent mt-3 inline-flex text-sm font-medium"
              >
                Read the long version →
              </Link>
            </blockquote>

            <p className="mb-5 text-lg leading-relaxed text-fg">
              That&apos;s the whole method. I make the witnesses disagree under controlled
              conditions: coverage-guided differential fuzzers that run Ethereum&apos;s execution
              clients, post-quantum cryptography libraries, and compilers against each other, so
              every divergence becomes a reproducible bug report.
            </p>
            <p className="mb-4 leading-relaxed text-muted">
              I practice this as a security engineer at the Ethereum Foundation — differential
              fuzzing of execution clients, hard-fork readiness testing, and bug-bounty triage. To
              scale the method, I build AI-assisted pipelines for context building, harness
              generation, PoC validation, and triage, with deterministic orchestration, auditable
              logs and human review at the decision points.
            </p>
            <p className="leading-relaxed text-muted">
              The roots are a Ph.D. in fuzzing and static analysis at TU Berlin, Solidity compiler
              fuzzing infrastructure, and contributions to Google&apos;s OSS-Fuzz; the timeline
              below carries the rest of the history.
            </p>
          </div>

          <div className="h-fit rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
            <h3 className="mb-4 text-lg font-semibold text-fg">Core Expertise</h3>
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

        <div className="mb-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="mb-5 text-2xl font-semibold text-fg">Experience</h3>
              <div className="border-t border-line">
                {experience.map((entry) => (
                  <article
                    key={`${entry.company}-${entry.period}`}
                    className="border-b border-line py-5"
                  >
                    <p className="font-mono text-xs text-faint">{entry.period}</p>
                    <h4 className="mt-1 font-medium text-fg">
                      {entry.title} · {entry.company}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{entry.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-2xl font-semibold text-fg">Education</h3>
              <div className="border-t border-line">
                {education.map((entry) => (
                  <article
                    key={`${entry.institution}-${entry.year}`}
                    className="border-b border-line py-5"
                  >
                    <p className="font-mono text-xs text-faint">{entry.year}</p>
                    <h4 className="mt-1 font-medium text-fg">
                      {entry.degree} · {entry.institution}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{entry.focus}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <a
            href="/media/Bhargava_Shastry_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-8 inline-flex items-center gap-2 px-5 py-2.5"
          >
            <FileDown size={16} />
            <span>Download CV (PDF)</span>
          </a>
        </div>

        <div>
          <h3 className="mb-6 text-2xl font-semibold text-fg">Technologies &amp; Tools</h3>
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
