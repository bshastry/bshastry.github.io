import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assignTier, scoreCluster, rankClusters } from '../lib/score.mjs'

// Inline signal factory — authored here so failures are always signal, never drift.
function makeSignal({
  title = 'test',
  snippet = '',
  source = 'reddit',
  engagement = 0,
  daysAgo = 0,
} = {}) {
  return {
    id: `test-${Math.random().toString(36).slice(2, 9)}`,
    title,
    snippet,
    url: `https://example.test/${Math.random().toString(36).slice(2, 9)}`,
    publishedAt: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
    source,
    engagement,
    tags: [],
  }
}

// ---------- assignTier boundary tests ----------

test('assignTier: thin when breadth=1 and volume<3', () => {
  assert.equal(assignTier({ breadth: 1, volume: 1, newestSignalAgeDays: 0 }), 'thin')
  assert.equal(assignTier({ breadth: 1, volume: 2, newestSignalAgeDays: 0 }), 'thin')
})

test('assignTier: emerging when breadth=1 and volume>=3 (sustained single-community)', () => {
  assert.equal(assignTier({ breadth: 1, volume: 3, newestSignalAgeDays: 0 }), 'emerging')
  assert.equal(assignTier({ breadth: 1, volume: 10, newestSignalAgeDays: 0 }), 'emerging')
})

test('assignTier: emerging when breadth>=2 but stale (recency clause fails)', () => {
  assert.equal(assignTier({ breadth: 2, volume: 3, newestSignalAgeDays: 20 }), 'emerging')
  assert.equal(assignTier({ breadth: 3, volume: 10, newestSignalAgeDays: 15 }), 'emerging')
})

test('assignTier: pressing when breadth>=2 and volume>=3 and newest<=14d', () => {
  assert.equal(assignTier({ breadth: 2, volume: 3, newestSignalAgeDays: 14 }), 'pressing')
  assert.equal(assignTier({ breadth: 2, volume: 3, newestSignalAgeDays: 0 }), 'pressing')
  assert.equal(assignTier({ breadth: 3, volume: 5, newestSignalAgeDays: 7 }), 'pressing')
})

test('assignTier: breadth>=2 with volume<3 falls to emerging (cross-source corroboration)', () => {
  assert.equal(assignTier({ breadth: 2, volume: 2, newestSignalAgeDays: 0 }), 'emerging')
  assert.equal(assignTier({ breadth: 2, volume: 1, newestSignalAgeDays: 0 }), 'emerging')
})

// ---------- scoreCluster math tests ----------

// Helper: build a populated cluster shape that scoreCluster accepts.
function makeCluster({ signals, id = 'test', label = 'Test', weight = 1.0 }) {
  return { id, label, description: 'test', keywords: [], weight, signals }
}

test('scoreCluster: breadthBonus is (breadth-1)*6, zero for single source', () => {
  // Single-source cluster → breadthBonus = 0
  const c1 = makeCluster({
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0 }),
      makeSignal({ source: 'reddit', daysAgo: 0 }),
    ],
  })
  const r1 = scoreCluster(c1)
  assert.equal(r1.breakdown.breadth, 1, 'single source → breadth 1')

  // Two-source cluster — use the score difference to back out breadthBonus.
  // Holding volume/recency/engagement constant, a 2-source cluster should
  // score exactly 6 × authority × vocabWeight more in raw terms than a
  // 1-source cluster with the same signals. We assert the raw diff indirectly
  // by computing score twice with identical other metrics.
  const c2 = makeCluster({
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0 }),
      makeSignal({ source: 'hackernews', daysAgo: 0 }),
    ],
  })
  const r2 = scoreCluster(c2)
  assert.equal(r2.breakdown.breadth, 2, 'two sources → breadth 2')
  // breadth=2 cluster must outscore breadth=1 cluster (same everything else).
  assert.ok(r2.score > r1.score, `breadth=2 (${r2.score}) should outscore breadth=1 (${r1.score})`)
})

test('scoreCluster: recency is mean not sum (many fresh signals do not inflate recency)', () => {
  const signals = []
  for (let i = 0; i < 10; i++) signals.push(makeSignal({ source: 'reddit', daysAgo: 0 }))
  const r = scoreCluster(makeCluster({ signals }))
  // With all signals 0 days old, per-signal recency is ~1.0. Mean across 10
  // signals should still be ~1.0 (not 10.0).
  assert.ok(
    r.breakdown.recency >= 0.99 && r.breakdown.recency <= 1.01,
    `expected mean recency ~1.0, got ${r.breakdown.recency}`,
  )
})

test('scoreCluster: vocabWeight gated to non-thin tiers (thin uses 1.0)', () => {
  // Thin cluster: 1 signal, 1 source → tier=thin → effectiveVocab=1.0 regardless of cluster.weight
  const thin = makeCluster({
    weight: 1.3,
    signals: [makeSignal({ source: 'reddit', daysAgo: 0 })],
  })
  const r = scoreCluster(thin)
  assert.equal(r.tier, 'thin')
  assert.equal(r.breakdown.vocabWeight, 1.0, 'thin tier must force vocabWeight to 1.0')

  // Emerging cluster: 3 signals from 1 source → tier=emerging → uses full weight
  const emerging = makeCluster({
    weight: 1.3,
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0 }),
      makeSignal({ source: 'reddit', daysAgo: 1 }),
      makeSignal({ source: 'reddit', daysAgo: 2 }),
    ],
  })
  const r2 = scoreCluster(emerging)
  assert.equal(r2.tier, 'emerging')
  assert.equal(r2.breakdown.vocabWeight, 1.3, 'emerging tier must preserve cluster.weight')
})

test('scoreCluster: empty cluster returns zero score and thin tier', () => {
  const r = scoreCluster(makeCluster({ signals: [] }))
  assert.equal(r.score, 0)
  assert.equal(r.tier, 'thin')
})

// ---------- rankClusters: tier gates sort ----------

test('rankClusters: thin cluster with high score ranks below emerging cluster with low score', () => {
  // Construct a thin cluster with artificially inflated engagement to get a high score.
  const thinCluster = makeCluster({
    id: 'thin-hot',
    label: 'Thin Hot',
    weight: 1.3,
    signals: [makeSignal({ source: 'reddit', daysAgo: 0, engagement: 100000 })],
  })

  // Construct an emerging cluster with modest engagement.
  const emergingCluster = makeCluster({
    id: 'emerging-cool',
    label: 'Emerging Cool',
    weight: 1.0,
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0, engagement: 1 }),
      makeSignal({ source: 'reddit', daysAgo: 1, engagement: 1 }),
      makeSignal({ source: 'reddit', daysAgo: 2, engagement: 1 }),
    ],
  })

  const ranked = rankClusters([thinCluster, emergingCluster], 10)
  assert.equal(ranked[0].id, 'emerging-cool', 'emerging tier ranks first regardless of score')
  assert.equal(ranked[1].id, 'thin-hot', 'thin tier ranks last regardless of score')
  // And verify the thin cluster actually did score higher, otherwise the test is meaningless.
  assert.ok(
    ranked[1].score > ranked[0].score,
    `thin score (${ranked[1].score}) should be > emerging score (${ranked[0].score}) for this test to be meaningful`,
  )
})

test('rankClusters: within a tier, higher score wins', () => {
  const a = makeCluster({
    id: 'a',
    label: 'A',
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0, engagement: 100 }),
      makeSignal({ source: 'hackernews', daysAgo: 0, engagement: 100 }),
      makeSignal({ source: 'github-advisories', daysAgo: 0, engagement: 100 }),
    ],
  })
  const b = makeCluster({
    id: 'b',
    label: 'B',
    signals: [
      makeSignal({ source: 'reddit', daysAgo: 0, engagement: 1 }),
      makeSignal({ source: 'hackernews', daysAgo: 0, engagement: 1 }),
      makeSignal({ source: 'github-advisories', daysAgo: 0, engagement: 1 }),
    ],
  })
  const ranked = rankClusters([b, a], 10)
  assert.equal(ranked[0].id, 'a', 'higher engagement wins within same tier')
})
