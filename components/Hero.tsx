import Link from 'next/link'
import { ArrowDown, FileText } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'
import { formatDate } from '@/lib/format'
import {
  disclosureSummary,
  disclosureYearRange,
  solSmithPatchedMiscompilations,
} from '@/lib/disclosures'
import portfolioData from '@/data/portfolio.json'

type LatestPost = Pick<BlogPostMeta, 'slug' | 'title' | 'date'>

interface HeroProps {
  latestPost: LatestPost | null
  publicationsCount: number
}

const witnesses = [
  { name: 'implementation A', result: '0x4ab8…91e2', status: 'match' },
  { name: 'implementation B', result: '0x4ab8…91e2', status: 'match' },
  { name: 'implementation C', result: '0xc103…7bf4', status: 'diverged' },
]

function MethodTrace() {
  return (
    <aside
      aria-label="Differential testing method, illustrated"
      className="signal-panel relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-5 shadow-2xl shadow-black/5 dark:shadow-black/30 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <p className="eyebrow text-accent">Method / one trace</p>
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
          illustrative
        </span>
      </div>

      <ol className="mt-5 space-y-4">
        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <span className="font-mono text-xs text-accent">01</span>
          <div>
            <p className="text-sm font-medium text-fg">Generate one valid input</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-faint">
              state_test(seed=0x8f2a)
            </p>
          </div>
        </li>

        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <span className="font-mono text-xs text-accent">02</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">Ask independent witnesses</p>
            <div className="mt-3 overflow-hidden rounded-lg border border-line bg-bg/70">
              {witnesses.map((witness) => (
                <div
                  key={witness.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-line px-3 py-2.5 font-mono text-[11px] last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:text-xs"
                >
                  <span className="truncate text-muted">{witness.name}</span>
                  <span
                    className={`col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 ${
                      witness.status === 'diverged' ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {witness.result}
                  </span>
                  <span
                    className={`col-start-2 row-start-1 inline-flex items-center gap-2 sm:col-start-3 ${
                      witness.status === 'diverged' ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        witness.status === 'diverged'
                          ? 'bg-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.14)]'
                          : 'bg-faint'
                      }`}
                    />
                    {witness.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </li>

        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <span className="font-mono text-xs text-accent">03</span>
          <div>
            <p className="text-sm font-medium text-fg">Minimize, reproduce, report</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Turn a disagreement into a regression test and an upstream fix.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
        <span aria-hidden="true" className="h-px w-8 bg-accent" />
        <p className="font-mono text-xs text-muted">evidence, not intuition</p>
      </div>
    </aside>
  )
}

// Derived from the findings ledgers so the hero can't drift from the evidence
// it links to: the advisory URL tracks portfolio.json and the totals track
// lib/disclosures.ts.
const advisories = portfolioData.findings.filter((f) => f.type === 'Security advisory')
const advisoryUrl = advisories[0]?.url ?? '#findings'

export default function Hero({ latestPost, publicationsCount }: HeroProps) {
  const stats = [
    {
      value: String(disclosureSummary.cves),
      label: `CVE-backed disclosures · ${disclosureYearRange}`,
      href: '/findings/#cve-disclosures',
    },
    {
      value: String(solSmithPatchedMiscompilations),
      label: 'patched compiler miscompilations',
      href: '#findings',
    },
    // geth, Besu, Nethermind, Erigon, and revm — see caseStudies[0].approach.
    { value: '5', label: 'EVM implementations cross-checked', href: '#case-studies' },
    { value: String(publicationsCount), label: 'publications', href: '#publications' },
  ]

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-line bg-bg pt-16"
    >
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="container-max section-padding w-full py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:gap-16">
          <div className="min-w-0 animate-fade-in">
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              Security Engineer · Ethereum Foundation
            </p>

            <h1 className="mt-5 whitespace-nowrap text-[clamp(2.25rem,10.8vw,2.55rem)] font-semibold leading-none tracking-[-0.045em] text-fg sm:text-5xl md:text-7xl">
              Bhargava <span className="text-accent">Shastry</span>
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-fg sm:text-2xl">
              I run independent implementations against each other — Ethereum clients, post-quantum
              cryptography libraries, compilers — and turn every disagreement into a reproducible
              bug report.
            </p>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Recently: a confirmed-exploitable timing channel in Mbed TLS (
              <a
                href={advisoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                security advisory, Jul 2026
              </a>
              ), upstream fixes merged in Erigon, Nethermind, and revm (
              <a href="#findings" className="link-accent">
                findings
              </a>
              ), and 25 miscompilation bugs found in the Solidity compiler (
              <a
                href="https://arxiv.org/abs/2607.07217"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                paper
              </a>
              ).
            </p>

            {latestPost && (
              <Link
                href={`/blog/${latestPost.slug}`}
                className="focus-ring group mt-8 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                <FileText size={14} className="flex-shrink-0 text-accent" />
                <span className="eyebrow flex-shrink-0">Latest</span>
                <span className="truncate">{latestPost.title}</span>
                <time
                  dateTime={latestPost.date}
                  className="hidden flex-shrink-0 font-mono text-xs text-faint sm:inline"
                >
                  {formatDate(latestPost.date, { year: 'numeric', month: 'short' })}
                </time>
              </Link>
            )}

            {/* aria-label is prohibited on paragraphs, so screen readers get a
                spelled-out copy and the arrow glyphs stay visual-only. */}
            <p className="mt-8 border-l-2 border-accent pl-3 font-mono text-xs leading-relaxed text-muted lg:hidden">
              <span aria-hidden="true">input → independent witnesses → divergence → evidence</span>
              <span className="sr-only">
                Method: input, to independent witnesses, to divergence, to evidence
              </span>
            </p>
          </div>

          <div className="hidden animate-slide-up lg:block lg:pl-2">
            <MethodTrace />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface/50 md:grid-cols-4">
          {stats.map((stat, index) => (
            <a
              key={stat.label}
              href={stat.href}
              className={`flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-6 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                index % 2 === 1 ? 'border-l border-line' : ''
              } ${index < 2 ? 'border-b border-line md:border-b-0' : ''} ${
                index > 0 ? 'md:border-l md:border-line' : ''
              }`}
            >
              <span className="font-mono text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                {stat.value}
              </span>
              <span className="eyebrow text-center">{stat.label}</span>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
          <a href="#case-studies" className="btn-primary px-6 py-3">
            See case studies
          </a>
          <a href="#contact" className="btn-ghost px-6 py-3">
            Start a conversation
          </a>
          <a
            href={portfolioData.personal.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-6 py-3"
          >
            Download CV (PDF)
          </a>
        </div>

        <a
          href="#case-studies"
          className="focus-ring mx-auto mt-8 flex w-fit items-center gap-2 rounded-sm px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-faint transition-colors hover:text-fg"
        >
          Explore the evidence
          <ArrowDown size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
