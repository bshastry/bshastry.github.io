import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

export { default } from '@/app/findings/page'

// Preserve the Jekyll-era /bugs/ URL without competing with the canonical
// findings archive in search indexes.
export const metadata: Metadata = {
  title: 'Security Findings & Disclosures',
  description:
    'Legacy route for Bhargava Shastry’s public security findings, CVE-backed disclosures, and Solidity compiler bug records.',
  alternates: pageAlternates('/findings/'),
  robots: { index: false, follow: true },
}
