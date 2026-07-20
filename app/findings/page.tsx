import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import DisclosureLedger from '@/components/DisclosureLedger'
import ThemeToggle from '@/components/ThemeToggle'
import {
  allCveDisclosures,
  cveRecordUrl,
  disclosureSummary,
  soliditySecurityBugs,
  soliditySecuritySummary,
} from '@/lib/disclosures'
import { pageAlternates, serializeJsonLd, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Security Findings & Disclosures',
  description: `Public security work by Bhargava Shastry: ${disclosureSummary.cves} CVE-backed disclosures, ${soliditySecuritySummary.total} Solidity security-relevant compiler bugs found with SolSmith, and recent upstream fixes, advisories, and research.`,
  alternates: pageAlternates('/findings/'),
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Security Findings & Disclosures',
  url: `${SITE_URL}/findings/`,
  author: {
    '@type': 'Person',
    name: 'Bhargava Shastry',
    url: SITE_URL,
  },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: disclosureSummary.cves + soliditySecuritySummary.total,
    itemListElement: [
      ...allCveDisclosures.map((cve, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: cve.id,
        url: cveRecordUrl(cve.id),
      })),
      ...soliditySecurityBugs.map((bug, index) => ({
        '@type': 'ListItem',
        position: disclosureSummary.cves + index + 1,
        name: `${bug.uid}: ${bug.name}`,
        url: bug.issueUrl,
      })),
    ],
  },
}

export default function FindingsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />

      <div className="border-b border-line">
        <div className="container-max section-padding py-8">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/#findings"
              className="link-accent inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
              Back to selected findings
            </Link>
            <ThemeToggle />
          </div>

          <p className="eyebrow mb-3">Evidence archive · 2016–present</p>
          <h1 className="section-title mb-5">Security Findings &amp; Disclosures</h1>
          <p className="max-w-3xl text-xl leading-relaxed text-muted">
            The complete public record behind the portfolio: recent merged fixes, research, and
            advisories live on the homepage; this page restores the earlier CVE ledger and maps the
            SolSmith results to Solidity’s official known-bug records in a form that is searchable,
            linkable, and explicit about classification.
          </p>
        </div>
      </div>

      <div className="container-max section-padding py-12 md:py-16">
        <DisclosureLedger />

        <aside className="mt-16 border-t border-line pt-8 text-sm leading-relaxed text-faint">
          <p className="max-w-4xl">
            Provenance: restored from the final pre-migration portfolio snapshot and cross-checked
            against the official CVE record corpus. The public records establish identifiers and
            technical descriptions. The Solidity subset is a cross-reference of the paper’s linked
            reports against the compiler’s official security-relevant bug ledger. Project notices
            and acknowledgements are linked where they provide stronger attribution context.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="https://web.archive.org/web/20241129104910/https://bshastry.github.io/bugs"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent inline-flex items-center gap-1.5"
            >
              Archived disclosure page
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a
              href="https://github.com/CVEProject/cvelistV5"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent inline-flex items-center gap-1.5"
            >
              Official CVE record corpus
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </main>
  )
}
