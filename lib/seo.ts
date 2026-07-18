import type { Metadata } from 'next'

/**
 * Next.js replaces (rather than deep-merges) the `alternates` object when a
 * page defines its own, so every page that sets a canonical URL must also
 * restate the RSS alternate or it silently disappears from that page's head.
 */
export function pageAlternates(canonical: string): Metadata['alternates'] {
  return {
    canonical,
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Bhargava Shastry — Blog' }],
    },
  }
}
