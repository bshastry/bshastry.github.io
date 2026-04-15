import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clusterSignals } from '../lib/cluster.mjs'
import { rankClusters } from '../lib/score.mjs'
import { renderBrief, renderReport } from '../lib/brief.mjs'
import { VOCABULARY } from '../lib/vocabulary.mjs'

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

const META = { generatedAt: new Date().toISOString() }

function pipeline(signals) {
  const clusters = clusterSignals(signals, VOCABULARY)
  return rankClusters(clusters, 10)
}

// ---------- Pressing rendering path ----------

test('renderBrief: pressing-tier brief contains status line, heading, blog hook, and no thin warning', () => {
  // 3 sources, 3 signals, all fresh, one title keyword match per signal.
  const signals = [
    makeSignal({
      title: 'Wormhole bridge drained for $500M in surprise exploit',
      source: 'hackernews',
      daysAgo: 1,
      engagement: 500,
    }),
    makeSignal({
      title: 'Wormhole bridge hack postmortem: what went wrong',
      source: 'reddit',
      daysAgo: 2,
      engagement: 200,
    }),
    makeSignal({
      title: 'Wormhole bridge exploit — advisory',
      source: 'github-advisories',
      daysAgo: 3,
      engagement: 10,
    }),
  ]
  const ranked = pipeline(signals)
  const bridge = ranked.find((c) => c.id === 'bridge-exploits')
  assert.ok(bridge, 'should produce bridge-exploits cluster')
  assert.equal(bridge.tier, 'pressing', 'three sources + fresh + multi-signal → pressing')
  const md = renderBrief(bridge, META)

  assert.match(md, /\*\*Status:\*\* PRESSING/, 'pressing brief must label status PRESSING')
  assert.match(md, /## Why this is pressing/, 'pressing brief uses current heading')
  assert.match(md, /## Blog hook/, 'pressing brief includes blog hook section')
  assert.doesNotMatch(md, /Thin evidence/, 'pressing brief must not include thin warning')
  assert.doesNotMatch(md, /Emerging evidence/, 'pressing brief must not include emerging warning')
})

// ---------- Thin rendering path ----------

test('renderBrief: thin-tier brief uses THIN label, radar heading, warning, no blog hook', () => {
  const signals = [
    makeSignal({
      title: 'Wormhole bridge drained in a surprise incident',
      source: 'reddit',
      daysAgo: 0,
      engagement: 5,
    }),
  ]
  const ranked = pipeline(signals)
  const bridge = ranked.find((c) => c.id === 'bridge-exploits')
  assert.ok(bridge, 'should produce bridge-exploits cluster')
  assert.equal(bridge.tier, 'thin', '1 signal, 1 source → thin')
  const md = renderBrief(bridge, META)

  assert.match(md, /\*\*Status:\*\* THIN/, 'thin brief must label status THIN')
  assert.match(
    md,
    /\*\*Evidence:\*\* 1 signal · 1 source · newest \d+d · match \d+pts/,
    'thin brief must include evidence fingerprint',
  )
  assert.match(md, /## Why this is on our radar/, 'thin brief uses radar heading')
  assert.match(md, /Thin evidence/, 'thin brief must include thin-evidence notice')
  assert.doesNotMatch(md, /## Blog hook/, 'thin brief must not include blog hook section')
  assert.doesNotMatch(
    md,
    /not a single-community echo chamber/,
    'thin brief must not claim breadth it does not have',
  )
})

// ---------- Emerging rendering path ----------

test('renderBrief: emerging-tier brief (single source, 3 signals) uses EMERGING label', () => {
  const signals = [
    makeSignal({
      title: 'Wormhole bridge drained overnight',
      source: 'reddit',
      daysAgo: 0,
      engagement: 10,
    }),
    makeSignal({
      title: 'Wormhole bridge incident thread',
      source: 'reddit',
      daysAgo: 1,
      engagement: 5,
    }),
    makeSignal({
      title: 'Wormhole bridge attack — analysis',
      source: 'reddit',
      daysAgo: 2,
      engagement: 20,
    }),
  ]
  const ranked = pipeline(signals)
  const bridge = ranked.find((c) => c.id === 'bridge-exploits')
  assert.ok(bridge)
  assert.equal(bridge.tier, 'emerging', '1 source + 3 signals → emerging')
  const md = renderBrief(bridge, META)

  assert.match(md, /\*\*Status:\*\* EMERGING/, 'emerging brief must label status EMERGING')
  assert.match(md, /## Why this is worth watching/, 'emerging brief uses watching heading')
  assert.match(md, /Emerging evidence/, 'emerging brief must include emerging notice')
  assert.doesNotMatch(md, /## Blog hook/, 'emerging brief must not include blog hook section')
})

// ---------- Pipeline ordering: tier gates sort at the report level ----------

test('pipeline: a thin cluster with high score cannot rank above an emerging cluster', () => {
  // Thin cluster: 1 reddit signal with enormous engagement and bridge vocab title.
  // Emerging cluster: 3 reddit signals with modest engagement about a different topic.
  const signals = [
    makeSignal({
      title: 'Massive Wormhole bridge incident today',
      source: 'reddit',
      engagement: 1_000_000,
      daysAgo: 0,
    }),
    // Three reentrancy signals (single source, multi-signal → emerging)
    makeSignal({
      title: 'new read-only reentrancy discovery in a vault contract',
      source: 'hackernews',
      engagement: 1,
      daysAgo: 0,
    }),
    makeSignal({
      title: 'another read-only reentrancy case study',
      source: 'hackernews',
      engagement: 1,
      daysAgo: 1,
    }),
    makeSignal({
      title: 'third read-only reentrancy writeup',
      source: 'hackernews',
      engagement: 1,
      daysAgo: 2,
    }),
  ]
  const ranked = pipeline(signals)

  const bridgeIdx = ranked.findIndex((c) => c.id === 'bridge-exploits')
  const reentrancyIdx = ranked.findIndex((c) => c.id === 'reentrancy')
  assert.ok(bridgeIdx >= 0 && reentrancyIdx >= 0, 'both clusters should exist')
  assert.equal(ranked[bridgeIdx].tier, 'thin', 'bridge should be thin')
  assert.equal(ranked[reentrancyIdx].tier, 'emerging', 'reentrancy should be emerging')
  assert.ok(
    reentrancyIdx < bridgeIdx,
    `emerging reentrancy (${reentrancyIdx}) should rank above thin bridge (${bridgeIdx})`,
  )
})

// ---------- Meta-complaint filter: end-to-end ----------

test('pipeline: a single meta-complaint signal produces zero top-N briefs', () => {
  const signals = [
    makeSignal({
      title:
        '$285M from Drift, $4.4M from IoTeX — why are we still routing billions through bridges?',
      snippet:
        'every few months we get another bridge exploit and every time the reaction is the same.',
      source: 'reddit',
      engagement: 1,
      daysAgo: 0,
    }),
  ]
  const ranked = pipeline(signals)
  assert.equal(ranked.length, 0, 'meta-complaint produces no ranked clusters')
})

// ---------- renderReport grouping ----------

test('renderReport: groups clusters under Pressing / Emerging / Thin leads subheaders', () => {
  const signals = [
    // pressing bridge — 3 sources, fresh, keyword in title
    makeSignal({
      title: 'Wormhole bridge drained for $500M',
      source: 'hackernews',
      daysAgo: 0,
      engagement: 500,
    }),
    makeSignal({
      title: 'Wormhole bridge hack analysis',
      source: 'reddit',
      daysAgo: 1,
      engagement: 200,
    }),
    makeSignal({
      title: 'Wormhole bridge vulnerability advisory',
      source: 'github-advisories',
      daysAgo: 2,
      engagement: 10,
    }),
    // emerging reentrancy — single source, 3 signals
    makeSignal({
      title: 'read-only reentrancy in a vault contract',
      source: 'hackernews',
      daysAgo: 0,
      engagement: 5,
    }),
    makeSignal({
      title: 'read-only reentrancy case study',
      source: 'hackernews',
      daysAgo: 1,
      engagement: 5,
    }),
    makeSignal({
      title: 'read-only reentrancy writeup part 3',
      source: 'hackernews',
      daysAgo: 2,
      engagement: 5,
    }),
    // thin MEV — single reddit signal
    makeSignal({
      title: 'sandwich attack drained my swap',
      source: 'reddit',
      daysAgo: 0,
      engagement: 5,
    }),
  ]
  const ranked = pipeline(signals)
  const meta = {
    generatedAt: new Date().toISOString(),
    totalSignals: signals.length,
    perSource: { reddit: 3, hackernews: 3, 'github-advisories': 1 },
  }
  const report = renderReport(ranked, meta)

  const pressingIdx = report.indexOf('## Pressing')
  const emergingIdx = report.indexOf('## Emerging')
  const thinIdx = report.indexOf('## Thin leads')

  assert.ok(pressingIdx >= 0, 'report should contain Pressing subheader')
  assert.ok(emergingIdx >= 0, 'report should contain Emerging subheader')
  assert.ok(thinIdx >= 0, 'report should contain Thin leads subheader')
  assert.ok(
    pressingIdx < emergingIdx && emergingIdx < thinIdx,
    'subheaders must appear in order: Pressing → Emerging → Thin',
  )
})
