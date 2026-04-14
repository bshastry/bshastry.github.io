// Group signals into problem clusters using the curated vocabulary.
//
// A signal can belong to multiple clusters (reasonable — "reentrancy on a
// cross-chain bridge" is both a bridge and a reentrancy issue). We also record
// which keywords matched so we can show them in the brief.

/** @typedef {import('./sources.mjs').Signal} Signal */
/** @typedef {import('./vocabulary.mjs').Cluster} Cluster */
/** @typedef {Cluster & { signals: (Signal & {matchedKeywords: string[]})[] }} PopulatedCluster */

/**
 * @param {Signal[]} signals
 * @param {Cluster[]} vocabulary
 * @returns {PopulatedCluster[]}
 */
export function clusterSignals(signals, vocabulary) {
  /** @type {Map<string, PopulatedCluster>} */
  const clusters = new Map()

  const deduped = dedupeSignals(signals)

  for (const sig of deduped) {
    const hay = `${sig.title} ${sig.snippet}`.toLowerCase()
    for (const v of vocabulary) {
      const matched = v.keywords.filter((k) => hay.includes(k.toLowerCase()))
      if (matched.length === 0) continue
      if (!clusters.has(v.id)) {
        clusters.set(v.id, { ...v, signals: [] })
      }
      clusters.get(v.id).signals.push({ ...sig, matchedKeywords: matched })
    }
  }

  // Sort signals inside each cluster by engagement desc, then recency.
  for (const c of clusters.values()) {
    c.signals.sort((a, b) => {
      if (b.engagement !== a.engagement) return b.engagement - a.engagement
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
  }

  return [...clusters.values()]
}

/**
 * Drop near-duplicate signals (same URL, or near-identical titles).
 * @param {Signal[]} signals
 * @returns {Signal[]}
 */
export function dedupeSignals(signals) {
  const byUrl = new Map()
  for (const s of signals) {
    const key = canonicalUrl(s.url) || s.id
    const existing = byUrl.get(key)
    if (!existing || (s.engagement || 0) > (existing.engagement || 0)) {
      byUrl.set(key, s)
    }
  }
  const byTitle = new Map()
  for (const s of byUrl.values()) {
    const key = normalizeTitle(s.title)
    if (!key) continue
    const existing = byTitle.get(key)
    if (!existing || (s.engagement || 0) > (existing.engagement || 0)) {
      byTitle.set(key, s)
    }
  }
  return [...byTitle.values()]
}

function canonicalUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.hash = ''
    // Drop common tracking params.
    for (const k of [...u.searchParams.keys()]) {
      if (/^utm_|^ref$|^source$/.test(k)) u.searchParams.delete(k)
    }
    return u.toString()
  } catch {
    return url
  }
}

function normalizeTitle(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
