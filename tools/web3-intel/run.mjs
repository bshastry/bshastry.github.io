#!/usr/bin/env node
// Web3 Security Intelligence Crawler
// ==================================
//
// Crawls public APIs for discussion of pressing Web3 security problems, groups
// the results into a curated taxonomy, ranks the top 5–6 clusters, and emits:
//
//   - data/web3-intel/latest.json             structured report
//   - data/web3-intel/report-YYYY-MM-DD.md    one-page combined report
//   - data/web3-intel/briefs/<cluster>.md     per-problem one-pagers
//   - data/web3-intel/raw/<source>.json       per-source raw signals
//
// Usage:
//
//   node tools/web3-intel/run.mjs [--since-days 60] [--limit 6] [--only src,src]
//
// Designed to work fully offline: every source failure degrades gracefully,
// and if _no_ sources return any data the crawler still writes a stub report
// instead of crashing the build.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SOURCES } from './lib/sources.mjs'
import { VOCABULARY } from './lib/vocabulary.mjs'
import { clusterSignals } from './lib/cluster.mjs'
import { rankClusters } from './lib/score.mjs'
import { renderBrief, renderReport } from './lib/brief.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const OUT_DIR = path.join(REPO_ROOT, 'data', 'web3-intel')
const BRIEFS_DIR = path.join(OUT_DIR, 'briefs')
const RAW_DIR = path.join(OUT_DIR, 'raw')

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2))
const sinceDays = Number(args['since-days'] ?? 60)
const limit = Number(args['limit'] ?? 6)
const only = args['only']
  ? String(args['only'])
      .split(',')
      .map((s) => s.trim())
  : null

function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const generatedAt = new Date().toISOString()
  console.log(`[web3-intel] starting run — sinceDays=${sinceDays} limit=${limit}`)
  await fs.mkdir(BRIEFS_DIR, { recursive: true })
  await fs.mkdir(RAW_DIR, { recursive: true })

  const picked = only ? SOURCES.filter((s) => only.includes(s.id)) : SOURCES
  if (picked.length === 0) {
    console.error(`[web3-intel] no sources selected (only=${only})`)
    process.exitCode = 1
    return
  }

  /** @type {Record<string, {count:number, error?:string}>} */
  const sourceStats = {}
  /** @type {import('./lib/sources.mjs').Signal[]} */
  const allSignals = []

  for (const src of picked) {
    const start = Date.now()
    try {
      const res = await src.fn(sinceDays)
      const count = res.signals.length
      sourceStats[src.id] = { count, error: res.error }
      allSignals.push(...res.signals)
      await fs.writeFile(
        path.join(RAW_DIR, `${src.id}.json`),
        JSON.stringify(
          { generatedAt, count, error: res.error || null, signals: res.signals },
          null,
          2,
        ),
      )
      const ms = Date.now() - start
      const tag = res.error ? `(partial: ${summarizeError(res.error)})` : ''
      console.log(`[web3-intel]   ${src.id}: ${count} signals in ${ms}ms ${tag}`)
    } catch (e) {
      const err = (e && e.message) || String(e)
      sourceStats[src.id] = { count: 0, error: err }
      console.warn(`[web3-intel]   ${src.id}: FAILED — ${err}`)
    }
  }

  console.log(`[web3-intel] total raw signals: ${allSignals.length}`)

  const clusters = clusterSignals(allSignals, VOCABULARY)
  console.log(`[web3-intel] non-empty clusters: ${clusters.length}`)

  const ranked = rankClusters(clusters, limit)
  console.log(`[web3-intel] top ${ranked.length} clusters:`)
  for (const c of ranked) {
    console.log(`  - ${c.id.padEnd(25)} score=${c.score}  signals=${c.signals.length}`)
  }

  // Write per-brief markdown.
  for (const c of ranked) {
    const body = renderBrief(c, { generatedAt })
    await fs.writeFile(path.join(BRIEFS_DIR, `${c.id}.md`), body)
  }

  // Write combined report.
  const perSource = Object.fromEntries(Object.entries(sourceStats).map(([k, v]) => [k, v.count]))
  const report = renderReport(ranked, {
    generatedAt,
    totalSignals: allSignals.length,
    perSource,
  })
  const reportName = `report-${generatedAt.slice(0, 10)}.md`
  await fs.writeFile(path.join(OUT_DIR, reportName), report)
  await fs.writeFile(path.join(OUT_DIR, 'report-latest.md'), report)

  // Write structured JSON.
  const latest = {
    generatedAt,
    params: { sinceDays, limit, only: only || null },
    sourceStats,
    totalSignals: allSignals.length,
    top: ranked.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      score: c.score,
      breakdown: c.breakdown,
      signalCount: c.signals.length,
      sources: [...new Set(c.signals.map((s) => s.source))],
      briefPath: `briefs/${c.id}.md`,
      topSignals: c.signals.slice(0, 8).map((s) => ({
        title: s.title,
        url: s.url,
        source: s.source,
        publishedAt: s.publishedAt,
        engagement: s.engagement,
      })),
    })),
  }
  await fs.writeFile(path.join(OUT_DIR, 'latest.json'), JSON.stringify(latest, null, 2))

  console.log(`[web3-intel] wrote ${ranked.length} briefs + latest.json + ${reportName}`)

  // Useful non-zero exit only if we got _zero_ signals AND had no intended
  // offline mode — so a sandbox can still complete the run.
  if (allSignals.length === 0) {
    console.warn('[web3-intel] no signals gathered from any source (network restricted?)')
  }
}

function summarizeError(err) {
  const s = String(err)
  return s.length > 80 ? s.slice(0, 77) + '...' : s
}

main().catch((e) => {
  console.error('[web3-intel] fatal:', e)
  process.exitCode = 1
})
