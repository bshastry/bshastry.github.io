// Rank populated clusters by "pressingness".
//
// The score is a weighted combination of four signals:
//
//   1. Cross-source breadth — contributes (breadth-1) × 6. Single-source
//      clusters get zero credit for their sole source's existence; they
//      must earn their score from volume/recency/engagement.
//
//   2. Volume — raw signal count, diminishing (sqrt).
//
//   3. Recency — MEAN per-signal recency, not sum. A 10-day-old cluster
//      with 10 posts should not outrank a 1-day-old cluster with 1 post.
//
//   4. Engagement — total upvotes/comments/views across signals, log-scaled.
//
//   5. Authority multiplier — GH advisories and ethereum-magicians are more
//      authoritative than random Reddit threads.
//
// Each cluster also has a static `weight` from the vocabulary, BUT that
// weight is only applied when the cluster's confidence tier is non-thin.
// Vocab weight is a corroboration amplifier, not a noise amplifier.
//
// The ranked output sorts by tier first (pressing > emerging > thin) and
// by score second within a tier. A thin cluster can never rank above an
// emerging cluster regardless of score.

/** @typedef {import('./cluster.mjs').PopulatedCluster} PopulatedCluster */

/**
 * Assign a confidence tier based on breakdown metrics.
 * Pure function — depends only on its inputs, no side effects.
 *
 * Thresholds:
 *   - thin:     breadth == 1 && volume < 3 (one voice, low volume)
 *   - emerging: breadth >= 2 OR (breadth == 1 && volume >= 3)
 *   - pressing: breadth >= 2 && volume >= 3 && newestSignalAgeDays <= 14
 *
 * `volume` is raw signal count, not the sqrt-adjusted volume score used in
 * scoreCluster.
 *
 * @param {{breadth: number, volume: number, newestSignalAgeDays: number}} metrics
 * @returns {'thin'|'emerging'|'pressing'}
 */
export function assignTier({ breadth, volume, newestSignalAgeDays }) {
  if (breadth >= 2 && volume >= 3 && newestSignalAgeDays <= 14) return 'pressing'
  if (breadth >= 2 || volume >= 3) return 'emerging'
  return 'thin'
}

const SOURCE_AUTHORITY = {
  'github-advisories': 1.4,
  'ethereum-magicians': 1.25,
  'ethereum-stackexchange': 1.15,
  'github-issues': 1.1,
  hackernews: 1.0,
  reddit: 0.9,
}

const TIER_RANK = { pressing: 2, emerging: 1, thin: 0 }

/**
 * @param {PopulatedCluster} cluster
 * @returns {{score:number, tier:'thin'|'emerging'|'pressing', breakdown: Record<string, number>}}
 */
export function scoreCluster(cluster) {
  const signals = cluster.signals || []
  if (signals.length === 0) {
    return { score: 0, tier: 'thin', breakdown: {} }
  }

  const sources = new Set(signals.map((s) => s.source))
  const breadth = sources.size
  const signalCount = signals.length
  const volumeScore = Math.sqrt(signalCount)

  const now = Date.now()
  let recencySum = 0
  let newestAge = Infinity
  for (const s of signals) {
    const ageDays = (now - new Date(s.publishedAt).getTime()) / (86400 * 1000)
    if (Number.isNaN(ageDays)) continue
    recencySum += Math.max(0, 1 - ageDays / 30)
    if (ageDays < newestAge) newestAge = ageDays
  }
  const recency = recencySum / signalCount
  const newestSignalAgeDays = Number.isFinite(newestAge) ? newestAge : Infinity

  const totalEngagement = signals.reduce((a, s) => a + (s.engagement || 0), 0)
  const engagementScore = Math.log1p(totalEngagement)

  const authority =
    signals.reduce((a, s) => a + (SOURCE_AUTHORITY[s.source] || 1.0), 0) / signalCount

  const tier = assignTier({ breadth, volume: signalCount, newestSignalAgeDays })

  const breadthBonus = Math.max(0, breadth - 1) * 6
  const raw = breadthBonus + volumeScore * 2 + recency * 3 + engagementScore * 1.5

  const effectiveVocab = tier === 'thin' ? 1.0 : cluster.weight || 1.0
  const score = raw * authority * effectiveVocab

  return {
    score: Number(score.toFixed(3)),
    tier,
    breakdown: {
      breadth,
      volume: Number(volumeScore.toFixed(2)),
      recency: Number(recency.toFixed(2)),
      engagementScore: Number(engagementScore.toFixed(2)),
      authority: Number(authority.toFixed(2)),
      vocabWeight: effectiveVocab,
      signalCount,
      sourceCount: breadth,
      newestSignalAgeDays: Number.isFinite(newestSignalAgeDays)
        ? Number(newestSignalAgeDays.toFixed(2))
        : null,
    },
  }
}

/**
 * @param {PopulatedCluster[]} clusters
 * @param {number} limit
 */
export function rankClusters(clusters, limit = 6) {
  return clusters
    .map((c) => ({ ...c, ...scoreCluster(c) }))
    .filter((c) => c.signals.length > 0)
    .sort((a, b) => {
      if (TIER_RANK[a.tier] !== TIER_RANK[b.tier]) return TIER_RANK[b.tier] - TIER_RANK[a.tier]
      return b.score - a.score
    })
    .slice(0, limit)
}
