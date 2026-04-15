// Group signals into problem clusters using the curated vocabulary.
//
// Two hygiene rules gate cluster membership:
//
//   Rule 1 — Match-point threshold.
//     Title matches are worth 2 points; snippet matches are worth 1.
//     A signal needs ≥2 total points to join a cluster. This means either
//     one title hit OR two distinct snippet hits. A single phrase buried
//     in a snippet is not enough.
//
//   Rule 2 — Meta-complaint filter.
//     Signals whose title or snippet contains a lament stop-phrase
//     (e.g. "every few months", "why are we still") are excluded from
//     ALL clusters. They are commentary, not evidence of a new incident.
//
// A signal can still belong to multiple clusters if it passes Rule 1 for
// each of them. `matchStrength` is recorded on each clustered signal so
// the renderer and the eval corpus can reason about match quality.

/** @typedef {import('./sources.mjs').Signal} Signal */
/** @typedef {import('./vocabulary.mjs').Cluster} Cluster */
/** @typedef {Cluster & { signals: (Signal & {matchedKeywords: string[], matchStrength: number})[] }} PopulatedCluster */

const META_COMPLAINT_PHRASES = [
  'every few months',
  'every time',
  'keeps happening',
  'why are we still',
  'here we go again',
  'yet another',
  'reaction is the same',
  'same old story',
]

/**
 * Returns true if the signal looks like a meta-complaint — a post lamenting
 * that a class of bugs keeps recurring, rather than reporting a new incident.
 * @param {Signal} sig
 * @returns {boolean}
 */
function isMetaComplaint(sig) {
  const hay = `${sig.title || ''} ${sig.snippet || ''}`.toLowerCase()
  return META_COMPLAINT_PHRASES.some((p) => hay.includes(p))
}

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
    if (isMetaComplaint(sig)) continue

    const titleLower = (sig.title || '').toLowerCase()
    const snippetLower = (sig.snippet || '').toLowerCase()

    for (const v of vocabulary) {
      let matchPoints = 0
      const matched = []
      for (const k of v.keywords) {
        const kl = k.toLowerCase()
        if (titleLower.includes(kl)) {
          matchPoints += 2
          matched.push(k)
        } else if (snippetLower.includes(kl)) {
          matchPoints += 1
          matched.push(k)
        }
      }
      if (matchPoints < 2) continue

      if (!clusters.has(v.id)) {
        clusters.set(v.id, { ...v, signals: [] })
      }
      clusters.get(v.id).signals.push({
        ...sig,
        matchedKeywords: matched,
        matchStrength: matchPoints,
      })
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
