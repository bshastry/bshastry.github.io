// Rank populated clusters by "pressingness".
//
// The score is a weighted combination of four signals:
//
//   1. Cross-source breadth — how many distinct sources flagged this cluster.
//      A problem being discussed on HN _and_ Reddit _and_ Ethereum SE is a
//      much stronger indicator than 50 posts in one subreddit.
//
//   2. Volume — raw signal count, diminishing (sqrt).
//
//   3. Recency — signals from the last 30 days count more.
//
//   4. Engagement — total upvotes/comments/views across signals, log-scaled.
//
//   5. Authority multiplier — GH advisories and ethereum-magicians are more
//      authoritative than random Reddit threads.
//
// Each cluster also has a static `weight` from the vocabulary, which nudges
// high-impact categories (bridges, ZK bugs) upward.

/** @typedef {import('./cluster.mjs').PopulatedCluster} PopulatedCluster */

const SOURCE_AUTHORITY = {
  'github-advisories': 1.4,
  'ethereum-magicians': 1.25,
  'ethereum-stackexchange': 1.15,
  'github-issues': 1.1,
  hackernews: 1.0,
  reddit: 0.9,
}

/**
 * @param {PopulatedCluster} cluster
 * @returns {{score:number, breakdown: Record<string, number>}}
 */
export function scoreCluster(cluster) {
  const signals = cluster.signals || []
  if (signals.length === 0) {
    return { score: 0, breakdown: {} }
  }

  const sources = new Set(signals.map((s) => s.source))
  const breadth = sources.size

  const volume = Math.sqrt(signals.length)

  const now = Date.now()
  let recency = 0
  for (const s of signals) {
    const ageDays = (now - new Date(s.publishedAt).getTime()) / (86400 * 1000)
    if (Number.isNaN(ageDays)) continue
    // Linear decay from 1.0 (today) to 0.0 (30 days old).
    recency += Math.max(0, 1 - ageDays / 30)
  }

  const totalEngagement = signals.reduce((a, s) => a + (s.engagement || 0), 0)
  const engagementScore = Math.log1p(totalEngagement)

  const authority =
    signals.reduce((a, s) => a + (SOURCE_AUTHORITY[s.source] || 1.0), 0) / signals.length

  const vocabWeight = cluster.weight || 1.0

  // Weights tuned so that breadth dominates but volume + recency matter.
  const raw = breadth * 6 + volume * 2 + recency * 3 + engagementScore * 1.5

  const score = raw * authority * vocabWeight

  return {
    score: Number(score.toFixed(3)),
    breakdown: {
      breadth,
      volume: Number(volume.toFixed(2)),
      recency: Number(recency.toFixed(2)),
      engagementScore: Number(engagementScore.toFixed(2)),
      authority: Number(authority.toFixed(2)),
      vocabWeight,
      signalCount: signals.length,
      sourceCount: breadth,
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
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
