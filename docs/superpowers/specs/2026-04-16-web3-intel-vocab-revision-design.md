# Web3 Intel: Vocabulary Revision

**Date:** 2026-04-16
**Branch:** `claude/web3-security-crawler-HHVMq`
**Predecessor:** `2026-04-15-web3-intel-honest-ranker-design.md` (shipped; commits b7140a9…6bab3e5)

## Problem

The honest-ranker sprint made the crawler's briefs trustworthy: tier-gated, breadth-checked, meta-complaint-filtered. But it exposed a coverage gap. Of 214 signals in the most recent crawl, 208 contained zero vocab keywords; only 2 thin briefs reached the output. The adjudication is sound — the vocabulary it adjudicates is too narrow.

Manual triage of the 214 signals identified ~86 that are security-relevant but vocab-missed. Root causes:

- **Missing clusters** — active-exploit / hack-postmortem language has no home; post-quantum discourse has no home; audit-effectiveness debates have no home.
- **Narrow existing clusters** — `supply-chain` only captures npm/pypi compromises; misses malicious plugins and infostealers. `key-management` missed "wallets drained" phrasing. `bridge-exploits` missed unauthorized-mint language. `proxy-upgrades` missed CREATE2/minimal-proxy variants.

## Goals

1. Positive recall ≥ 80% on a hand-labeled fixture of signals the crawler *should* cluster.
2. Negative false-positive rate < 15% on a hand-labeled fixture of signals the crawler should *not* cluster.
3. Real crawl produces > 2 non-thin briefs without touching the honest-ranker adjudication (score/cluster/brief libs unchanged).
4. All 24 existing tests remain green (no regression of honest-ranker invariants).

## Non-Goals

- No changes to `lib/score.mjs`, `lib/cluster.mjs`, `lib/brief.mjs`. The adjudication is locked.
- No new source integrations (Twitter, Discord, paid feeds). Vocabulary-only sprint.
- No `ai-code-risk` cluster yet. Only 1 signal in the crawl matches; density is insufficient.
- No per-cluster unit tests. Aggregate fixture recall/FP-rate is the regression oracle.

## Design

### Section 1 — Vocabulary Changes

Three new clusters appended to `VOCABULARY` in `tools/web3-intel/lib/vocabulary.mjs`:

**`recent-exploits`** (weight 1.25) — Active exploits, confirmed hacks, postmortems, attacker activity. Uses anchor phrases instead of protocol names (which go stale within weeks):

```
'drained for ', 'stolen ', 'hack confirmed', 'exploit confirmed',
'active attack', 'attacker cashed out', 'suspended all deposits',
'postmortem', 'protocol hack', 'defi hack', 'rekt', 'hacked for',
'lazarus group', 'state-backed', 'north korean hackers'
```

**`post-quantum`** (weight 1.0) — Quantum-resistant cryptography and Q-day preparedness:

```
'post-quantum', 'post quantum', 'quantum threat', 'quantum attack',
'q-day', 'quantum vulnerabilities', 'quantum-resistant',
'quantum resistant', "shor's algorithm", "grover's algorithm"
```

**`audit-discourse`** (weight 1.0) — Audit effectiveness, fatigue, and bounty-program critique:

```
'audit fatigue', 'audit theater', 'audit completed', 'multiple audits',
'audited but', 'audit badge', 'post-audit', 'bug bounty program',
'security audit program'
```

Expansions appended to existing clusters' `keywords` arrays:

- `supply-chain` += `['malicious plugin', 'infostealer', 'vulnerable dependencies', 'compromised dependency', 'hijacked npm', 'poisoned package']`
- `key-management` += `['wallet drained', 'wallet hacked', 'wallets drained', 'wallets hacked', 'got drained', 'getting drained', 'wallet exploit']`
- `bridge-exploits` += `['bridged polkadot', 'unauthorized mint', 'unauthorized minting']`
- `proxy-upgrades` += `['create2 proxy', 'minimal proxy', 'initialization vulnerability']`

Net delta: 14 → 17 clusters; +53 keywords total (34 new-cluster: 15+10+9; 19 expansion: 6+7+3+3).

### Section 2 — Labeled Miss-List Fixture

New file: `tools/web3-intel/test/fixtures/miss-list-2026-04-15.json`

Frozen regression oracle — hand-labeled once, committed, read by tests.

Entry schema:

```json
{
  "id": "m001",
  "source": "reddit|hn|github|rss",
  "title": "...",
  "snippet": "...",
  "url": "https://...",
  "expectedCluster": ["recent-exploits"],
  "rationale": "Confirmed exploit with dollar amount anchor"
}
```

`expectedCluster` is `string[]`:

- `[]` — should NOT cluster (negative corpus).
- `["cluster-name"]` — primary expected cluster.
- `["cluster-a", "cluster-b"]` — legitimate multi-cluster assignment (e.g., bridge hack hits `bridge-exploits` + `recent-exploits`).

Target composition (~90 entries):

| Tier | Count | Purpose |
|---|---|---|
| Should-cluster (new vocab) | ~35 | Exercises 3 new clusters + 4 expansions |
| Should-NOT-cluster (meta-complaints) | ~20 | "this space is a scam", "everyone's being rugged" |
| Should-NOT-cluster (off-topic) | ~20 | Price talk, shilling, generic news |
| Should-NOT-cluster (security-adjacent but vague) | ~15 | "stay safe", "be careful", "trust no one" |

Sourced from the 214-signal crawl dump plus realistic synthesized variants where the crawl lacks breadth.

### Section 3 — Vocab Coverage Tests

New file: `tools/web3-intel/test/vocab-coverage.test.mjs` — two aggregate tests. No per-signal assertions; adding fixture entries does not balloon test count.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clusterSignals } from '../lib/cluster.mjs';
import { VOCABULARY } from '../lib/vocabulary.mjs';

const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/miss-list-2026-04-15.json', import.meta.url),
    'utf8',
  ),
);

const positive = fixture.filter(f => f.expectedCluster.length > 0);
const negative = fixture.filter(f => f.expectedCluster.length === 0);

test('vocab coverage: positive corpus reaches ≥80% recall', () => {
  const signals = positive.map(toSignal);
  const clusters = clusterSignals(signals, VOCABULARY);

  const hits = positive.filter(f => {
    const landedClusters = clusters
      .filter(c => c.signals.some(s => s.id === f.id))
      .map(c => c.name);
    return f.expectedCluster.some(ec => landedClusters.includes(ec));
  });

  const recall = hits.length / positive.length;
  assert.ok(
    recall >= 0.8,
    `recall ${recall.toFixed(2)} < 0.80; missed: ${
      positive.filter(f => !hits.includes(f)).map(f => f.id).join(', ')
    }`,
  );
});

test('vocab coverage: negative corpus stays below 15% false-positive rate', () => {
  const signals = negative.map(toSignal);
  const clusters = clusterSignals(signals, VOCABULARY);
  const clusteredIds = new Set(
    clusters.flatMap(c => c.signals.map(s => s.id)),
  );
  const falsePositives = negative.filter(f => clusteredIds.has(f.id));
  const fpRate = falsePositives.length / negative.length;
  assert.ok(
    fpRate < 0.15,
    `FP rate ${fpRate.toFixed(2)} ≥ 0.15; false-positives: ${
      falsePositives.map(f => f.id).join(', ')
    }`,
  );
});
```

Thresholds picked for buildability, not perfection:

- **80% recall** — allows ~7/35 positive misses for genuinely ambiguous cases.
- **15% FP ceiling** — allows ~8/55 negative edge cases that legitimately read like exploits.

Assertion messages print failing ids so fixture drift is debuggable without rerunning.

`toSignal` is a 3-line shim adapting fixture entries to whatever `clusterSignals` expects (title / snippet / url / source / date).

Total tests: 24 → 26.

### Section 4 — Commit Sequence

Four commits, each buildable and testable in isolation (bisect-friendly):

**Commit 1 — `test(intel): labeled miss-list fixture`**
- Add `tools/web3-intel/test/fixtures/miss-list-2026-04-15.json` (~90 hand-labeled entries)
- No code changes; fixture inert until Commit 4 reads it
- Verify: `npm run test:intel` green (24 tests)

**Commit 2 — `feat(intel): add recent-exploits, post-quantum, audit-discourse clusters`**
- Append 3 new cluster objects to `VOCABULARY` in `lib/vocabulary.mjs`
- Verify: `npm run test:intel` green (24 tests, unchanged — new clusters are data)

**Commit 3 — `feat(intel): expand supply-chain, key-management, bridge, proxy vocab`**
- Append expansion keywords to 4 existing cluster objects
- Verify: `npm run test:intel` green (24 tests)

**Commit 4 — `test(intel): vocab coverage aggregate tests`**
- Add `tools/web3-intel/test/vocab-coverage.test.mjs`
- Verify: `npm run test:intel` green (26 tests). Fixture recall ≥ 80%, FP < 15%.

### Section 5 — Verification

After Commit 4:

- Run `node tools/web3-intel/run.mjs` against real crawl data.
- Expect briefs count > 2 (prior baseline); pressing-tier only where breadth ≥ 2; no meta-complaint briefs.
- Grep briefs for `"not a single-community echo chamber"` — must appear only in breadth ≥ 2 briefs (inherited honest-ranker invariant).

## Success Criteria

1. `miss-list-2026-04-15.json` exists with ≥ 35 positive and ≥ 55 negative entries, all with `expectedCluster: string[]`.
2. `vocab-coverage.test.mjs` exists with exactly two tests and both pass.
3. `npm run test:intel` reports 26 passing tests.
4. `VOCABULARY` array in `lib/vocabulary.mjs` contains entries named `recent-exploits`, `post-quantum`, `audit-discourse`.
5. `git diff BASE HEAD -- tools/web3-intel/lib/score.mjs tools/web3-intel/lib/cluster.mjs tools/web3-intel/lib/brief.mjs` is empty (adjudication locked).
6. Real crawl output has > 2 briefs (manual verification outside test suite).

## Risk & Escalation

- **If fixture recall can't reach 80%** — escalate before relaxing the threshold. The point of the threshold is to expose vocabulary gaps; lowering it hides them. Likely fix: expand vocabulary further or reclassify borderline fixture entries.
- **If negative FP > 15%** — escalate before relaxing. Likely fix: narrow an overly greedy keyword (e.g., `'hacked for'` may trigger on "got hacked for clicks"; consider `'hacked for $'`).
- **If an existing test breaks** — stop immediately. Vocabulary is data; it should not regress behavior. Investigate before proceeding.
- **Out-of-scope guardrail** — no edits to `lib/score.mjs`, `lib/cluster.mjs`, `lib/brief.mjs`. If a fix appears to require editing those files, stop and escalate.
