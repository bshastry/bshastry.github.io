import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { clusterSignals } from '../lib/cluster.mjs'
import { VOCABULARY } from '../lib/vocabulary.mjs'

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/miss-list-2026-04-15.json', import.meta.url),
    'utf8',
  ),
)

const toSignal = (f) => ({
  id: f.id,
  title: f.title,
  snippet: f.snippet,
  url: f.url,
  source: f.source,
  publishedAt: '2026-04-01T00:00:00Z',
  engagement: 1,
})

const positive = fixture.filter((f) => f.expectedCluster.length > 0)
const negative = fixture.filter((f) => f.expectedCluster.length === 0)

test('vocab coverage: positive corpus reaches ≥80% recall', () => {
  const signals = positive.map(toSignal)
  const clusters = clusterSignals(signals, VOCABULARY)

  const hits = positive.filter((f) => {
    const landedClusterIds = clusters
      .filter((c) => c.signals.some((s) => s.id === f.id))
      .map((c) => c.id)
    return f.expectedCluster.some((ec) => landedClusterIds.includes(ec))
  })

  const recall = hits.length / positive.length
  const missed = positive.filter((f) => !hits.includes(f)).map((f) => f.id)
  assert.ok(
    recall >= 0.8,
    `recall ${recall.toFixed(2)} < 0.80; missed: ${missed.join(', ')}`,
  )
})

test('vocab coverage: negative corpus stays below 15% false-positive rate', () => {
  const signals = negative.map(toSignal)
  const clusters = clusterSignals(signals, VOCABULARY)
  const clusteredIds = new Set(
    clusters.flatMap((c) => c.signals.map((s) => s.id)),
  )
  const falsePositives = negative.filter((f) => clusteredIds.has(f.id))
  const fpRate = falsePositives.length / negative.length
  assert.ok(
    fpRate < 0.15,
    `FP rate ${fpRate.toFixed(2)} ≥ 0.15; false-positives: ${falsePositives
      .map((f) => f.id)
      .join(', ')}`,
  )
})
