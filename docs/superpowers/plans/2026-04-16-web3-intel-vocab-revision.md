# Web3 Intel Vocabulary Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the web3-intel crawler's vocabulary so 80%+ of security-relevant signals reach a cluster, without touching the honest-ranker adjudication (score/cluster/brief libs stay locked).

**Architecture:** Vocabulary-only sprint. Three new clusters (`recent-exploits`, `post-quantum`, `audit-discourse`) plus keyword expansions to four existing clusters. A hand-labeled JSON fixture serves as the regression oracle; two aggregate tests (recall ≥ 80%, FP < 15%) lock the adjudication behavior.

**Tech Stack:** Node 20+ ESM (`.mjs`), `node:test`, `node:assert/strict`. Zero npm dependencies added.

**Spec:** `docs/superpowers/specs/2026-04-16-web3-intel-vocab-revision-design.md`

---

## File Structure

Four commits. Each commit leaves `npm run test:intel` in a passing state (bisect-friendly).

| Change | File | Kind |
|---|---|---|
| Create | `tools/web3-intel/test/fixtures/miss-list-2026-04-15.json` | Hand-labeled JSON fixture, ~90 entries |
| Modify | `tools/web3-intel/lib/vocabulary.mjs` | Append 3 new clusters, expand 4 existing |
| Create | `tools/web3-intel/test/vocab-coverage.test.mjs` | Two aggregate tests reading the fixture |

Untouched and locked:
- `tools/web3-intel/lib/score.mjs`
- `tools/web3-intel/lib/cluster.mjs`
- `tools/web3-intel/lib/brief.mjs`

---

## Task 1: Build the labeled miss-list fixture

**Purpose:** Create the regression oracle — a JSON file of ~90 hand-labeled signals that the vocab-coverage tests read.

**Files:**
- Create: `tools/web3-intel/test/fixtures/miss-list-2026-04-15.json`

**Source data:** `data/web3-intel/raw/{reddit,hackernews,github-advisories,github-issues,ethereum-magicians,ethereum-stackexchange}.json` — each file has a `signals` array with `{id, title, snippet, url, publishedAt, source, engagement, tags}` entries.

**Labeling rubric (apply in order; first match wins):**

| Signal pattern | expectedCluster |
|---|---|
| Title/snippet contains confirmed-exploit anchor (e.g., `"drained for $12M"`, `"hack confirmed"`, `"postmortem"`, `"rekt"`, `"lazarus group"`) | `["recent-exploits"]` |
| Title/snippet references quantum cryptography threats (e.g., `"post-quantum"`, `"q-day"`, `"shor's algorithm"`) | `["post-quantum"]` |
| Title/snippet discusses audit effectiveness / fatigue / bounty programs (e.g., `"audit theater"`, `"audited but"`) | `["audit-discourse"]` |
| Bridge-hack context + recent-exploit anchor | `["bridge-exploits", "recent-exploits"]` |
| Wallet drain / key compromise context | `["key-management"]` |
| Malicious plugin / infostealer / hijacked npm | `["supply-chain"]` |
| Existing cluster match (signature-phishing, oracle-manipulation, etc.) | `["<matching-cluster-id>"]` |
| Meta-complaint ("everyone's being rugged", "every protocol gets hacked") | `[]` |
| Off-topic (price talk, shilling, generic news, dev-help) | `[]` |
| Security-adjacent but vague ("stay safe", "be careful", "trust no one") | `[]` |

**Cluster ids** (must match `id` field in `tools/web3-intel/lib/vocabulary.mjs`):
`signature-phishing`, `bridge-exploits`, `oracle-manipulation`, `flashloan-governance`, `reentrancy`, `access-control`, `proxy-upgrades`, `mev-frontrunning`, `zk-circuit-bugs`, `supply-chain`, `rollup-sequencer`, `account-abstraction`, `key-management`, `frontend-compromise`, `recent-exploits`, `post-quantum`, `audit-discourse`

**Composition target (~90 entries):**

| Bucket | Count | Examples |
|---|---|---|
| Positive: `recent-exploits` | ~10 | "Balancer drained for $116M" |
| Positive: `post-quantum` | ~5 | "Q-day is closer than you think" |
| Positive: `audit-discourse` | ~5 | "Three audits and still rekt" |
| Positive: existing-vocab expansions | ~15 | "wallets drained after setApprovalForAll", "malicious hardhat plugin" |
| Negative: meta-complaint | ~20 | "every few months a bridge dies" |
| Negative: off-topic | ~20 | "ARB/USDT arbitrage tips" |
| Negative: security-adjacent vague | ~15 | "stay safe out there" |

Hard floors: ≥ 35 positive entries, ≥ 55 negative entries.

**Entry schema:**

```json
{
  "id": "m001",
  "source": "reddit",
  "title": "Balancer drained for $116M — postmortem coming",
  "snippet": "Attacker cashed out through Tornado Cash...",
  "url": "https://www.reddit.com/r/defi/comments/...",
  "expectedCluster": ["recent-exploits"],
  "rationale": "Confirmed exploit with dollar amount and postmortem anchor"
}
```

Rules:
- `id` must be unique; suggested format `m001` through `m090`.
- `expectedCluster` is `string[]`; `[]` means should NOT cluster; non-empty means primary cluster(s).
- Entries MAY be drawn verbatim from `data/web3-intel/raw/*.json` OR synthesized to exercise new clusters (synthesis is necessary — the raw dump has few `post-quantum` hits).
- For synthesized entries, use `source: "reddit"` and `url: "https://example.com/synthetic/<id>"`.
- `rationale` is a one-line human note; required for debuggability.

### Steps

- [ ] **Step 1.1: Read the raw signal dump to understand the material.**

Run:
```bash
node -e 'const fs=require("fs"); for (const f of ["reddit","hackernews","github-advisories","github-issues","ethereum-magicians","ethereum-stackexchange"]) { const j=JSON.parse(fs.readFileSync(`data/web3-intel/raw/${f}.json`,"utf8")); console.log(`${f}: ${j.signals.length}`); }'
```
Expected: Each source file reports its signal count; total should approach 214.

- [ ] **Step 1.2: Create the fixture directory.**

```bash
mkdir -p tools/web3-intel/test/fixtures
```

- [ ] **Step 1.3: Draft `miss-list-2026-04-15.json` per the composition targets above.**

Use the labeling rubric. Draw real titles from `data/web3-intel/raw/*.json` where they fit the target categories. Synthesize entries for coverage of new clusters (`post-quantum`, `audit-discourse`, `recent-exploits` anchors) where the raw dump is thin.

Double-check: every `expectedCluster` value is either `[]` or an array of valid cluster ids from the list above.

- [ ] **Step 1.4: Validate the fixture is well-formed JSON.**

```bash
node -e 'const f=JSON.parse(require("fs").readFileSync("tools/web3-intel/test/fixtures/miss-list-2026-04-15.json","utf8")); const pos=f.filter(x=>x.expectedCluster.length>0); const neg=f.filter(x=>x.expectedCluster.length===0); console.log(`total ${f.length}, positive ${pos.length}, negative ${neg.length}`); const ids=new Set(f.map(x=>x.id)); if (ids.size !== f.length) throw new Error("duplicate ids"); console.log("OK")'
```
Expected: `total 90, positive >=35, negative >=55\nOK` (or similar counts meeting the floors).

- [ ] **Step 1.5: Sanity-check fixture against current vocab.**

Run this one-off script to confirm the fixture actually discriminates:

```bash
node --input-type=module -e '
import { readFileSync } from "fs";
import { clusterSignals } from "./tools/web3-intel/lib/cluster.mjs";
import { VOCABULARY } from "./tools/web3-intel/lib/vocabulary.mjs";
const fx = JSON.parse(readFileSync("tools/web3-intel/test/fixtures/miss-list-2026-04-15.json","utf8"));
const toSig = f => ({id:f.id, title:f.title, snippet:f.snippet, url:f.url, source:f.source, publishedAt:"2026-04-01T00:00:00Z", engagement:1});
const pos = fx.filter(f=>f.expectedCluster.length>0);
const neg = fx.filter(f=>f.expectedCluster.length===0);
const posClusters = clusterSignals(pos.map(toSig), VOCABULARY);
const negClusters = clusterSignals(neg.map(toSig), VOCABULARY);
const posHits = pos.filter(f => posClusters.some(c => f.expectedCluster.includes(c.id) && c.signals.some(s=>s.id===f.id)));
const negClusteredIds = new Set(negClusters.flatMap(c => c.signals.map(s=>s.id)));
const negFPs = neg.filter(f => negClusteredIds.has(f.id));
console.log(`Current vocab: positive recall ${(posHits.length/pos.length).toFixed(2)}, negative FP ${(negFPs.length/neg.length).toFixed(2)}`);
'
```

Expected: positive recall < 0.80 (the whole point — current vocab is insufficient). Negative FP should already be low (< 0.15). If positive recall is already > 0.80 against current vocab, the fixture is not discriminating enough — rebalance by adding more entries whose anchors are in the new vocab only.

- [ ] **Step 1.6: Verify existing tests still pass.**

```bash
npm run test:intel
```
Expected: `# tests 24 / # pass 24 / # fail 0` — fixture is inert data, doesn't affect existing tests.

- [ ] **Step 1.7: Commit.**

```bash
git add tools/web3-intel/test/fixtures/miss-list-2026-04-15.json
git commit -m "$(cat <<'EOF'
test(intel): labeled miss-list fixture for vocab coverage

Hand-labeled ~90 signals drawn from the 2026-04-15 crawl plus
synthesized entries for new-cluster coverage. Serves as the regression
oracle for vocab-coverage.test.mjs (added in task 4).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add three new clusters

**Purpose:** Append `recent-exploits`, `post-quantum`, `audit-discourse` to the vocabulary.

**Files:**
- Modify: `tools/web3-intel/lib/vocabulary.mjs`

### Steps

- [ ] **Step 2.1: Append three new cluster objects to the `VOCABULARY` array.**

Open `tools/web3-intel/lib/vocabulary.mjs`. Insert the three objects immediately before the closing `]` on line 303 (after the `frontend-compromise` cluster). Maintain existing formatting (2-space indent, trailing commas on object properties, string values).

```js
  {
    id: 'recent-exploits',
    label: 'Active Exploits & Confirmed Hacks',
    description:
      'Live incidents, confirmed hacks, postmortems, and attacker activity. Uses anchor phrases (dollar amounts, cashout language, postmortem) rather than protocol names, which go stale within weeks.',
    keywords: [
      'drained for ',
      'stolen ',
      'hack confirmed',
      'exploit confirmed',
      'active attack',
      'attacker cashed out',
      'suspended all deposits',
      'postmortem',
      'protocol hack',
      'defi hack',
      'rekt',
      'hacked for',
      'lazarus group',
      'state-backed',
      'north korean hackers',
    ],
    weight: 1.25,
  },
  {
    id: 'post-quantum',
    label: 'Post-Quantum Cryptography Risk',
    description:
      "Quantum-resistant cryptography and Q-day preparedness. Shor's and Grover's algorithms threaten current ECDSA/BLS signatures; the migration debate is live.",
    keywords: [
      'post-quantum',
      'post quantum',
      'quantum threat',
      'quantum attack',
      'q-day',
      'quantum vulnerabilities',
      'quantum-resistant',
      'quantum resistant',
      "shor's algorithm",
      "grover's algorithm",
    ],
    weight: 1.0,
  },
  {
    id: 'audit-discourse',
    label: 'Audit Effectiveness & Bounty Critique',
    description:
      'Debates about audit effectiveness, audit fatigue, audit-theater accusations, and bounty program gaps. Signals recurring concerns about whether audit badges mean anything.',
    keywords: [
      'audit fatigue',
      'audit theater',
      'audit completed',
      'multiple audits',
      'audited but',
      'audit badge',
      'post-audit',
      'bug bounty program',
      'security audit program',
    ],
    weight: 1.0,
  },
```

- [ ] **Step 2.2: Verify the module parses and exports 17 clusters.**

```bash
node --input-type=module -e 'import { VOCABULARY } from "./tools/web3-intel/lib/vocabulary.mjs"; console.log(VOCABULARY.length, VOCABULARY.map(c=>c.id).join(","))'
```
Expected: First token is `17`. The id list ends with `...frontend-compromise,recent-exploits,post-quantum,audit-discourse`.

- [ ] **Step 2.3: Verify existing tests still pass.**

```bash
npm run test:intel
```
Expected: `# tests 24 / # pass 24`. New clusters are data; no behavior changes.

- [ ] **Step 2.4: Commit.**

```bash
git add tools/web3-intel/lib/vocabulary.mjs
git commit -m "$(cat <<'EOF'
feat(intel): add recent-exploits, post-quantum, audit-discourse clusters

Three new clusters close the biggest coverage gaps: confirmed
hacks/postmortems, quantum-threat discourse, and audit-effectiveness
debate. Uses anchor phrases (dollar amounts, cashout language) rather
than protocol names.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Expand four existing clusters

**Purpose:** Append keyword expansions to `supply-chain`, `key-management`, `bridge-exploits`, `proxy-upgrades`.

**Files:**
- Modify: `tools/web3-intel/lib/vocabulary.mjs`

### Steps

- [ ] **Step 3.1: Expand `supply-chain` keywords (around line 210-224).**

Append these six strings to the `keywords` array of the `supply-chain` cluster (id: 'supply-chain'), after `'npm malware'`:

```
      'malicious plugin',
      'infostealer',
      'vulnerable dependencies',
      'compromised dependency',
      'hijacked npm',
      'poisoned package',
```

- [ ] **Step 3.2: Expand `key-management` keywords (around line 270-281).**

Append these seven strings to the `keywords` array of the `key-management` cluster (id: 'key-management'), after `'clipboard malware'`:

```
      'wallet drained',
      'wallet hacked',
      'wallets drained',
      'wallets hacked',
      'got drained',
      'getting drained',
      'wallet exploit',
```

- [ ] **Step 3.3: Expand `bridge-exploits` keywords (around line 47-62).**

Append these three strings to the `keywords` array of the `bridge-exploits` cluster (id: 'bridge-exploits'), after `'layerzero'`:

```
      'bridged polkadot',
      'unauthorized mint',
      'unauthorized minting',
```

- [ ] **Step 3.4: Expand `proxy-upgrades` keywords (around line 146-159).**

Append these three strings to the `keywords` array of the `proxy-upgrades` cluster (id: 'proxy-upgrades'), after `'eip-1967'`:

```
      'create2 proxy',
      'minimal proxy',
      'initialization vulnerability',
```

- [ ] **Step 3.5: Verify the module parses and keyword counts are correct.**

```bash
node --input-type=module -e '
import { VOCABULARY } from "./tools/web3-intel/lib/vocabulary.mjs";
const want = { "supply-chain": 19, "key-management": 17, "bridge-exploits": 17, "proxy-upgrades": 15 };
for (const [id, expected] of Object.entries(want)) {
  const c = VOCABULARY.find(x => x.id === id);
  if (!c) throw new Error(`missing cluster: ${id}`);
  if (c.keywords.length !== expected) throw new Error(`${id}: want ${expected} keywords, got ${c.keywords.length}`);
  console.log(`${id}: ${c.keywords.length} keywords OK`);
}'
```
Expected counts: `supply-chain: 13+6=19`, `key-management: 10+7=17`, `bridge-exploits: 14+3=17`, `proxy-upgrades: 12+3=15`.

- [ ] **Step 3.6: Verify existing tests still pass.**

```bash
npm run test:intel
```
Expected: `# tests 24 / # pass 24`.

- [ ] **Step 3.7: Commit.**

```bash
git add tools/web3-intel/lib/vocabulary.mjs
git commit -m "$(cat <<'EOF'
feat(intel): expand supply-chain, key-management, bridge, proxy vocab

Adds 19 keyword anchors to four existing clusters: malicious plugins /
infostealers (supply-chain), drained-wallet phrasings (key-management),
unauthorized-mint language (bridge-exploits), and CREATE2/minimal
proxy variants (proxy-upgrades).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add vocab-coverage aggregate tests

**Purpose:** Lock the vocabulary adjudication via two aggregate tests reading the fixture.

**Files:**
- Create: `tools/web3-intel/test/vocab-coverage.test.mjs`

### Steps

- [ ] **Step 4.1: Create the test file.**

Write `tools/web3-intel/test/vocab-coverage.test.mjs`:

```js
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
```

- [ ] **Step 4.2: Run the tests and verify both pass.**

```bash
npm run test:intel
```
Expected: `# tests 26 / # pass 26 / # fail 0`. The two new tests are `vocab coverage: positive corpus reaches ≥80% recall` and `vocab coverage: negative corpus stays below 15% false-positive rate`.

- [ ] **Step 4.3: If a test fails, diagnose using the assertion message.**

The failure message lists the failing fixture ids. For a recall miss:
- Look up each missed id in `miss-list-2026-04-15.json`
- Check its `title`/`snippet` — does any vocab keyword actually appear?
- If a keyword should match but doesn't, verify the substring check (keywords are case-insensitive).
- If no keyword matches, the vocab truly needs another anchor — **but do not edit score.mjs / cluster.mjs / brief.mjs**. Add another keyword to the relevant cluster in `vocabulary.mjs` and retry.

For a false-positive:
- Look up each FP id in the fixture
- Check which cluster it landed in (re-run the sanity-check script from Step 1.5)
- Most likely cause: an overly broad keyword. Narrow it (e.g., `'hacked for'` → `'hacked for $'`).

- [ ] **Step 4.4: End-to-end smoke test against real crawl data.**

```bash
node tools/web3-intel/run.mjs
```
Expected output: multiple briefs written to `data/web3-intel/briefs/`, more than the prior baseline of 2. No brief should contain `"not a single-community echo chamber"` unless the brief's breadth is ≥ 2 (inherited honest-ranker invariant).

Quick grep to check breadth-phrase invariant:

```bash
grep -l "not a single-community echo chamber" data/web3-intel/briefs/*.md 2>/dev/null | while read f; do
  echo "--- $f ---"
  grep -E "breadth|source" "$f" | head -5
done
```
Expected: Either no files listed (no briefs use the phrase), or each listed brief shows `breadth: 2` or higher.

- [ ] **Step 4.5: Commit.**

```bash
git add tools/web3-intel/test/vocab-coverage.test.mjs
git commit -m "$(cat <<'EOF'
test(intel): vocab coverage aggregate tests

Two tests lock the vocabulary adjudication against the labeled
miss-list fixture: positive recall >= 80%, negative FP < 15%.
Assertion messages print failing ids for debuggability.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final Verification

After Task 4 commits:

- [ ] `npm run test:intel` reports 26 tests passing.
- [ ] `git diff <sprint-base>..HEAD -- tools/web3-intel/lib/score.mjs tools/web3-intel/lib/cluster.mjs tools/web3-intel/lib/brief.mjs` is empty.
- [ ] `VOCABULARY` in `tools/web3-intel/lib/vocabulary.mjs` has 17 clusters.
- [ ] `node tools/web3-intel/run.mjs` produces > 2 briefs.
- [ ] Real-crawl briefs that contain `"not a single-community echo chamber"` all have breadth ≥ 2.

## Escalation

**STOP and report BLOCKED if:**
- Fixture recall cannot reach 80% even after iterating on vocab within the locked clusters. Signals that we (the plan author) thought should match may actually need a new cluster — escalate rather than lowering the threshold.
- Negative FP cannot stay below 15% without neutering a legitimate keyword. Escalate.
- Any existing test starts failing. Vocabulary is data; it should not regress behavior. Stop and investigate.
- A fix appears to require editing `score.mjs`, `cluster.mjs`, or `brief.mjs`. Those are locked by spec. Stop.

**Report DONE_WITH_CONCERNS if:**
- Recall is between 80% and 90% (passes but with few margins). Note which fixture ids are borderline.
- FP rate is between 10% and 15% (passes but marginal). Note the borderline false-positives.
