import { ExternalLink, ShieldAlert } from 'lucide-react'
import {
  additionalPublicFindings,
  cveRecordUrl,
  disclosureGroups,
  disclosureSummary,
  solidityBugLedgerUrl,
  soliditySecurityBugs,
  soliditySecuritySummary,
  solSmithPaperUrl,
  solSmithPatchedMiscompilations,
} from '@/lib/disclosures'

const categoryDescriptions = [
  {
    value: disclosureSummary.memoryCorruption,
    label: 'memory corruption',
    detail: 'Heap or parser-buffer overflow paths',
  },
  {
    value: disclosureSummary.outOfBoundsReads,
    label: 'out-of-bounds reads',
    detail: 'Packet and protocol-parser bounds failures',
  },
  {
    value: disclosureSummary.logicOrDos,
    label: 'logic / DoS',
    detail: 'Validation or abort paths with availability impact',
  },
]

const projectId = (project: string) =>
  project
    .toLowerCase()
    .replace(/\+\+/g, 'pp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const solidityClassifications = [
  {
    value: soliditySecuritySummary.incorrectOptimization,
    label: 'optimizer',
  },
  {
    value: soliditySecuritySummary.codeGeneration,
    label: 'code generation',
  },
  {
    value: soliditySecuritySummary.frontEnd,
    label: 'front end',
  },
]

export default function DisclosureLedger() {
  return (
    <>
      <section aria-labelledby="disclosure-summary-heading">
        <h2 id="disclosure-summary-heading" className="sr-only">
          Disclosure summary
        </h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-5">
          <div className="flex min-h-28 flex-col justify-center bg-bg p-5 lg:col-span-1">
            <span className="font-mono text-3xl font-semibold text-fg">
              {disclosureSummary.cves}
            </span>
            <span className="eyebrow mt-2">published CVEs</span>
          </div>
          <div className="flex min-h-28 flex-col justify-center bg-bg p-5">
            <span className="font-mono text-3xl font-semibold text-fg">
              {disclosureSummary.projects}
            </span>
            <span className="eyebrow mt-2">upstream projects</span>
          </div>
          {categoryDescriptions.map((category, index) => (
            <div
              key={category.label}
              className={`flex min-h-28 flex-col justify-center bg-bg p-5 ${
                index === categoryDescriptions.length - 1 ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              <span className="font-mono text-3xl font-semibold text-fg">{category.value}</span>
              <span className="eyebrow mt-2">{category.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {categoryDescriptions.map((category) => (
            <div key={category.label} className="border-l-2 border-accent pl-4">
              <p className="text-sm font-medium text-fg">
                {category.value} {category.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{category.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="classification-note-heading">
        <div className="rounded-xl border border-line bg-surface/50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldAlert
              className="mt-0.5 flex-shrink-0 text-accent"
              size={20}
              aria-hidden="true"
            />
            <div>
              <h2 id="classification-note-heading" className="text-lg font-semibold text-fg">
                CVE record, advisory, and public finding are different labels
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">
                A CVE is the public vulnerability record. A vendor or distributor may separately
                publish an advisory, and a public finding may instead be documented in a patch,
                issue, or paper without receiving a CVE. This ledger uses “CVE-backed disclosure”
                for the {disclosureSummary.cves} assigned records and keeps the non-CVE pinctrl fix
                separate. Solidity’s own term is “known security-relevant compiler bugs”; those SOL
                records are shown in a separate ledger below. Severity is never inferred from an
                identifier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="solidity-security-bugs"
        className="mt-16 scroll-mt-24"
        aria-labelledby="solidity-security-bugs-heading"
      >
        <div className="mb-6 border-b border-line pb-5">
          <p className="eyebrow mb-2">Official compiler bug ledger · 2019–2022</p>
          <h2 id="solidity-security-bugs-heading" className="text-2xl font-semibold text-fg">
            {soliditySecuritySummary.total} Solidity security-relevant bugs found by SolSmith
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted">
            The SolSmith paper documents {solSmithPatchedMiscompilations} patched miscompilation
            bugs found through semantic differential fuzzing. Cross-referencing its linked reports
            with Solidity’s official{' '}
            <code className="font-mono text-xs text-fg">docs/bugs.json</code> ledger yields these{' '}
            {soliditySecuritySummary.total} exact matches. They are security-relevant compiler bug
            records, not CVEs; the severity and affected version ranges below come from the official
            ledger.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
          <div className="flex min-h-24 flex-col justify-center bg-bg p-5">
            <span className="font-mono text-3xl font-semibold text-fg">
              {soliditySecuritySummary.total}
            </span>
            <span className="eyebrow mt-2">official records</span>
          </div>
          {solidityClassifications.map((classification) => (
            <div
              key={classification.label}
              className="flex min-h-24 flex-col justify-center bg-bg p-5"
            >
              <span className="font-mono text-3xl font-semibold text-fg">
                {classification.value}
              </span>
              <span className="eyebrow mt-2">{classification.label}</span>
            </div>
          ))}
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {soliditySecurityBugs.map((bug) => (
            <li
              key={bug.uid}
              id={bug.uid.toLowerCase()}
              className="grid scroll-mt-24 gap-4 py-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6"
            >
              <div className="flex flex-col items-start gap-2">
                <span className="font-mono text-sm font-semibold text-accent">{bug.uid}</span>
                <span className="chip">{bug.severity}</span>
                <span className="text-xs leading-relaxed text-faint">{bug.versions}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-semibold text-fg">{bug.name}</h3>
                  <span className="font-mono text-xs text-faint">{bug.bugClass}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg">{bug.summary}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <strong className="font-medium text-fg">Impact:</strong> {bug.impact}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  <strong className="font-medium text-fg">Trigger:</strong> {bug.conditions}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <a
                    href={bug.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent inline-flex items-center gap-1.5 text-sm"
                  >
                    Fuzzer report #{bug.issueUrl.split('/').pop()}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                  {bug.advisoryUrl && (
                    <a
                      href={bug.advisoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent inline-flex items-center gap-1.5 text-sm"
                    >
                      Solidity notice
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <a
            href={solidityBugLedgerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent inline-flex items-center gap-1.5 text-sm"
          >
            Official Solidity bug ledger
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <a
            href={solSmithPaperUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent inline-flex items-center gap-1.5 text-sm"
          >
            SolSmith paper and all {solSmithPatchedMiscompilations} findings
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </section>

      <div id="cve-disclosures" className="mt-16 scroll-mt-24 space-y-16">
        {disclosureGroups.map((group) => (
          <section key={group.project} id={projectId(group.project)} className="scroll-mt-24">
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-line pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow mb-2">{group.period}</p>
                <h2 className="text-2xl font-semibold text-fg">{group.project}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                  {group.description}
                </p>
              </div>
              <p className="font-mono text-sm text-faint">
                {group.cves.length} {group.cves.length === 1 ? 'CVE' : 'CVEs'}
              </p>
            </div>

            <ul className="divide-y divide-line border-y border-line">
              {group.cves.map((cve) => (
                <li
                  key={cve.id}
                  id={cve.id.toLowerCase()}
                  className="grid scroll-mt-24 gap-3 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-6"
                >
                  <div className="flex flex-col items-start gap-2">
                    <a
                      href={cveRecordUrl(cve.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-accent inline-flex items-center gap-1.5 font-mono text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {cve.id}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    <span className="chip">{cve.category}</span>
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-fg">{cve.summary}</p>
                    {cve.impact && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        <strong className="font-medium text-fg">Impact:</strong> {cve.impact}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {group.evidence && group.evidence.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {group.evidence.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent inline-flex items-center gap-1.5 text-sm"
                  >
                    {item.label}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="mt-16" aria-labelledby="additional-findings-heading">
        <div className="mb-6 border-b border-line pb-5">
          <p className="eyebrow mb-2">Public, without a CVE</p>
          <h2 id="additional-findings-heading" className="text-2xl font-semibold text-fg">
            Additional finding
          </h2>
        </div>

        {additionalPublicFindings.map((finding) => (
          <article
            key={finding.url}
            className="grid gap-3 border-y border-line py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-6"
          >
            <div>
              <p className="font-mono text-sm text-faint">{finding.date}</p>
              <p className="mt-1 text-sm font-medium text-accent">{finding.project}</p>
            </div>
            <div>
              <a
                href={finding.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {finding.title}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <p className="mt-2 text-sm leading-relaxed text-muted">{finding.description}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
