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
