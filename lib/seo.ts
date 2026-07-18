import type { Metadata } from 'next'

export const SITE_URL = 'https://bshastry.github.io'
export const AUTHOR = 'Bhargava Shastry'
export const FEED_TITLE = 'Bhargava Shastry — Blog'

/**
 * Next.js replaces (rather than deep-merges) the `alternates` object when a
 * page defines its own, so every page that sets a canonical URL must also
 * restate the RSS alternate or it silently disappears from that page's head.
 */
export function pageAlternates(canonical: string): Metadata['alternates'] {
  return {
    canonical,
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: FEED_TITLE }],
    },
  }
}

/**
 * JSON.stringify with `<` escaped so user-authored strings (post titles,
 * excerpts) can never terminate the surrounding <script> tag.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
