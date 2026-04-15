import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clusterSignals } from '../lib/cluster.mjs'
import { VOCABULARY } from '../lib/vocabulary.mjs'

// Inline factory — identical shape to ranker.test.mjs's factory.
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

// ---------- meta-complaint filter (Rule 2) ----------

test('clusterSignals: the exact 2026-04-15 bridge post is rejected (meta-complaint)', () => {
  const signals = [
    makeSignal({
      title:
        '$285M from Drift, $4.4M from IoTeX, $3M from CrossCurve. all in 2026. why are we still routing billions through bridges?',
      snippet:
        'every few months we get another bridge exploit and every time the reaction is the same.',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  assert.equal(clusters.length, 0, 'meta-complaint must not produce any cluster membership')
})

test('clusterSignals: "every few months" in a title triggers meta-complaint filter', () => {
  const signals = [
    makeSignal({
      title: 'every few months we get another wormhole bridge exploit',
      snippet: '',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  assert.equal(clusters.length, 0, 'stop-phrase in title excludes signal from all clusters')
})

test('clusterSignals: "yet another" stop-phrase excludes a vocab-matching signal', () => {
  const signals = [
    makeSignal({
      title: 'yet another wormhole bridge hack — $100M gone',
      snippet: 'how many times must this happen',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  assert.equal(clusters.length, 0)
})

// ---------- match-point threshold (Rule 1) ----------

test('clusterSignals: single snippet-only vocab hit is rejected (matchPoints=1)', () => {
  const signals = [
    makeSignal({
      title: 'random DeFi post',
      snippet: 'we briefly mentioned wormhole in passing',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  assert.equal(clusters.length, 0, '1 snippet match (1 point) is below the 2-point threshold')
})

test('clusterSignals: single title vocab hit qualifies (matchPoints=2)', () => {
  const signals = [
    makeSignal({
      title: 'Wormhole postmortem: how the 320M hack unfolded',
      snippet: 'a deep dive',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  const bridge = clusters.find((c) => c.id === 'bridge-exploits')
  assert.ok(bridge, 'title match should produce a cluster')
  assert.equal(bridge.signals.length, 1)
  assert.equal(bridge.signals[0].matchStrength, 2, 'title match must carry matchStrength=2')
})

test('clusterSignals: two distinct snippet vocab hits qualify (matchPoints=1+1=2)', () => {
  // Two different keywords from bridge-exploits vocab in the snippet.
  const signals = [
    makeSignal({
      title: 'DeFi weekly recap',
      snippet: 'discussion of wormhole and ronin and the lessons learned from each',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  const bridge = clusters.find((c) => c.id === 'bridge-exploits')
  assert.ok(bridge, 'two snippet matches should produce a cluster')
  assert.equal(bridge.signals[0].matchStrength, 2, 'two snippet matches must carry matchStrength=2')
})

test('clusterSignals: signal can belong to multiple clusters if it matches each', () => {
  const signals = [
    makeSignal({
      title: 'Reentrancy attack on a Wormhole bridge integration',
      snippet: 'read-only reentrancy let the attacker drain the wrapper contract',
    }),
  ]
  const clusters = clusterSignals(signals, VOCABULARY)
  const bridge = clusters.find((c) => c.id === 'bridge-exploits')
  const reentrancy = clusters.find((c) => c.id === 'reentrancy')
  assert.ok(bridge, 'should cluster under bridge-exploits (title has wormhole)')
  assert.ok(reentrancy, 'should cluster under reentrancy (title has "reentrancy")')
})
