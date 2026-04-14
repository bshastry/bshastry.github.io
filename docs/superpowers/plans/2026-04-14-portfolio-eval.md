# Portfolio Evaluation Framework v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `tools/portfolio-eval/`, an internal deterministic CLI that scores the portfolio against an 8-dimension rubric calibrated on a hand-curated peer corpus of senior L1/L2 protocol security engineers. v1 is setup-only: extractors, scoring, reporting. No repo mutation.

**Spec:** `docs/superpowers/specs/2026-04-14-portfolio-eval-design.md` (authoritative — defer to it for any ambiguity)

**Architecture:** TypeScript tooling under `tools/portfolio-eval/`, executed via `tsx` for zero-compile CLI. Four extractors → feature vectors → 8 rubric dimensions → percentile-based sub-scores → variance-weighted aggregate → markdown/JSON report. Voice distance is a shared function used by both dimension D7 and constraint C3. Peer corpus is hand-curated from seed data (not scraped).

**Tech Stack:** TypeScript, tsx, vitest (new dev dep), pdf-parse (new dep, dynamic import for CLI-only code), gray-matter (already present)

---

## File structure (authoritative)

```
tools/portfolio-eval/
  src/
    types.ts                    Core types: Portfolio, FeatureVector, PeerEntry, Report
    cli.ts                      Argv dispatcher, maps subcommand → handler
    commands/
      score.ts                  `portfolio:score` handler
      peers-bootstrap.ts        `portfolio:peers:bootstrap` handler
      peers-review.ts           `portfolio:peers:review` handler
    extractors/
      index.ts                  Combines all four surface extractors
      site.ts                   Reads content/posts/*.md + data/portfolio.json
      github.ts                 Reads data/github-stats.json (no network in v1)
      linkedin.ts               Reads private/linkedin-dump.txt if present
      resume.ts                 Reads private/resume.pdf via pdf-parse if present
    rubric/
      index.ts                  Dimension registry; runs all 8
      voice-distance.ts         Shared function used by D7 and C3
      dimensions/
        d1-signature-tools.ts
        d2-writing-corpus.ts
        d3-narrative-claims.ts
        d4-credibility-anchors.ts
        d5-topical-coverage.ts
        d6-freshness.ts
        d7-distinctive-voice.ts
        d8-minimalism-discovery.ts
    peers/
      corpus.ts                 Read/write peers.json, approval workflow
    scorer/
      index.ts                  Orchestrator: features + peers → score
      normalize.ts              Sub-score via P10/P90 clamping
      weights.ts                Variance-based weight computation
      aggregate.ts              S = Σ w·s + stop condition check
    constraints/
      c1-unverifiable.ts        Claim provenance check (full impl)
      c2-stuffing.ts            Keyword density cap check (full impl)
      c3-voice-gate.ts          Thin wrapper around rubric/voice-distance.ts (v1: stub that delegates)
    reporter/
      markdown.ts
      json.ts
  data/
    peer-seeds.json             15 hand-curated seed peers (COMMITTED)
    sources.json                User-curated claim whitelist (COMMITTED, starts with samples)
    domain-vocabulary.json      Topical terms for D5 (COMMITTED)
  tests/
    fixtures/
      empty/portfolio.json      Minimal, exercises floor path
      realistic/portfolio.json  Realistic, known-good feature vector
      adversarial/portfolio.json Stuffed, KPI-tiled, inflated, generic-voice
    unit/
      <per-file tests>
    integration/
      pipeline.test.ts          End-to-end on realistic fixture
      determinism.test.ts       Same input → byte-identical output
```

**Runtime files** (gitignored, not created by this plan but referenced):
- `tools/portfolio-eval/data/peers.json` — the live peer corpus (created by peers:bootstrap)
- `tools/portfolio-eval/eval-reports/*.md` + `*.json` — score reports
- `private/linkedin-dump.txt` — optional LinkedIn text dump
- `private/resume.pdf` — optional resume PDF

---

## Task 1: Scaffolding

**Files:**
- Create: `tools/portfolio-eval/tsconfig.json`
- Create: `tools/portfolio-eval/vitest.config.ts`
- Modify: `package.json` (add dev deps + scripts)
- Modify: `.gitignore`

- [ ] **Step 1.1** — Add dev deps: `npm install --save-dev vitest tsx pdf-parse @types/pdf-parse`
- [ ] **Step 1.2** — Add scripts to root `package.json`:
  ```json
  "portfolio:score": "tsx tools/portfolio-eval/src/cli.ts score",
  "portfolio:peers:bootstrap": "tsx tools/portfolio-eval/src/cli.ts peers:bootstrap",
  "portfolio:peers:review": "tsx tools/portfolio-eval/src/cli.ts peers:review",
  "portfolio:test": "vitest run -c tools/portfolio-eval/vitest.config.ts"
  ```
- [ ] **Step 1.3** — Create `tools/portfolio-eval/tsconfig.json` extending root, emit off, include `src/**/*`, `tests/**/*`.
- [ ] **Step 1.4** — Create `tools/portfolio-eval/vitest.config.ts` with `root: '.'`, `include: ['tests/**/*.test.ts']`.
- [ ] **Step 1.5** — Add to `.gitignore`:
  ```
  tools/portfolio-eval/data/peers.json
  tools/portfolio-eval/eval-reports/
  private/
  ```
- [ ] **Step 1.6** — Verify scaffolding: `npm run portfolio:test` → should output "No test files found" without errors.
- [ ] **Step 1.7** — Commit: `git add -A && git commit -m "feat(portfolio-eval): scaffold tools/portfolio-eval directory"`

---

## Task 2: Core types

**Files:**
- Create: `tools/portfolio-eval/src/types.ts`

Full type surface for v1. No tests (types are compile-checked).

- [ ] **Step 2.1** — Write `types.ts` containing:

```typescript
export type Surface = 'site' | 'github' | 'linkedin' | 'resume';

export interface SiteFeatures {
  postCount: number;
  medianPostWords: number;
  codeRefsPerPost: number;
  externalLinksPerPost: number;
  originalResearchPostRatio: number;
  projectCount: number;
  signatureToolPresent: boolean;
  supportingToolCount: number;
  narrativeClaimsPer1kWords: number;
  kpiTileCount: number;
  publicationCount: number;
  publicationsWithVenueLink: number;
  talkCount: number;
  talksWithVenueYear: number;
  coordinationRoleCount: number;
  namedAffiliationCount: number;
  visibleProseText: string;
  pageCount: number;
  seoMetadataComplete: boolean;
  ogImagePresent: boolean;
  inflationPatternHits: number;
  daysSinceLastPost: number;
  daysSinceLastCommit: number;
  currentAffiliationPresent: boolean;
  currentYearPostPresent: boolean;
}

export interface GithubFeatures {
  publicRepos: number;
  pinnedRepoCount: number;
  starsFromDistinctUsers: number;
  upstreamMergeCount: number;
  commitsLast90Days: number;
}

export interface LinkedinFeatures {
  present: boolean;
  headline: string;
  summaryWords: number;
  experienceCount: number;
  nameRoleMatchesSite: boolean;
}

export interface ResumeFeatures {
  present: boolean;
  roleMatchesSite: boolean;
  claimsCount: number;
}

export interface FeatureVector {
  site: SiteFeatures;
  github: GithubFeatures;
  linkedin: LinkedinFeatures;
  resume: ResumeFeatures;
  partial: boolean;
  partialReasons: string[];
}

export interface PeerEntry {
  id: string;
  name: string;
  org: string;
  role: string;
  surfaces: { site?: string; github?: string; linkedin?: string; resume?: string };
  features: FeatureVector;
  capturedAt: string;
  reviewStatus: 'pending' | 'approved' | 'unreachable';
}

export type DimensionId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8';

export interface DimensionExtractor {
  id: DimensionId;
  name: string;
  extract(fv: FeatureVector): number;
}

export interface SubScore {
  id: DimensionId;
  rawFeature: number;
  subScore: number;
  p10: number;
  p75: number;
  p90: number;
  weight: number;
  belowP75: boolean;
}

export interface Report {
  generatedAt: string;
  partial: boolean;
  partialReasons: string[];
  aggregateScore: number;
  subScores: SubScore[];
  stopConditionMet: boolean;
  gapsBelowP75: DimensionId[];
  peerCorpusSize: number;
  peerCorpusWarnings: string[];
}
```

- [ ] **Step 2.2** — Run `npm run typecheck` → PASS.
- [ ] **Step 2.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): core types"`

---

## Task 3: Test fixtures

**Files:**
- Create: `tools/portfolio-eval/tests/fixtures/empty/portfolio.json`
- Create: `tools/portfolio-eval/tests/fixtures/empty/posts/README.md` (placeholder so directory exists)
- Create: `tools/portfolio-eval/tests/fixtures/realistic/portfolio.json`
- Create: `tools/portfolio-eval/tests/fixtures/realistic/posts/example.md`
- Create: `tools/portfolio-eval/tests/fixtures/adversarial/portfolio.json`
- Create: `tools/portfolio-eval/tests/fixtures/adversarial/posts/stuffed.md`

Each fixture mirrors the real portfolio layout (portfolio.json + posts dir).

- [ ] **Step 3.1** — Create `empty/portfolio.json`: the smallest valid structure with empty `themes`, `talks`, `publications` arrays.
- [ ] **Step 3.2** — Create `realistic/portfolio.json`: 4 themes, 6 talks, 5 publications, realistic metrics with verifiable claims. Model structure on the real `data/portfolio.json`.
- [ ] **Step 3.3** — Create `realistic/posts/example.md`: one post with frontmatter (title, date, tags) and ~800 words with 3 code fences and 4 external links.
- [ ] **Step 3.4** — Create `adversarial/portfolio.json`: includes ONE explicit KPI-tile description (`"displayAs": "kpi-tile"`) on a theme, a `services` array (inflation pattern), and 3 unverifiable claims ("rescued $400M ETH" with no source).
- [ ] **Step 3.5** — Create `adversarial/posts/stuffed.md`: 500 words with the word "fuzzing" repeated 60 times (exceeds any reasonable density cap).
- [ ] **Step 3.6** — Commit: `git add -A && git commit -m "test(portfolio-eval): fixtures for empty/realistic/adversarial"`

---

## Task 4: Site extractor (TDD)

**Files:**
- Create: `tools/portfolio-eval/src/extractors/site.ts`
- Create: `tools/portfolio-eval/tests/unit/extractors/site.test.ts`

This is the most complex extractor. It reads `portfolio.json`, walks a `posts/` directory, and produces a `SiteFeatures`.

- [ ] **Step 4.1** — Write failing test `site.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { extractSite } from '../../../src/extractors/site';
import path from 'node:path';

const FIXTURES = path.resolve(__dirname, '../../fixtures');

describe('extractSite', () => {
  it('extracts feature vector from empty fixture', () => {
    const f = extractSite(path.join(FIXTURES, 'empty'));
    expect(f.postCount).toBe(0);
    expect(f.projectCount).toBe(0);
    expect(f.signatureToolPresent).toBe(false);
    expect(f.kpiTileCount).toBe(0);
    expect(f.inflationPatternHits).toBe(0);
  });

  it('extracts feature vector from realistic fixture', () => {
    const f = extractSite(path.join(FIXTURES, 'realistic'));
    expect(f.postCount).toBeGreaterThanOrEqual(1);
    expect(f.medianPostWords).toBeGreaterThan(0);
    expect(f.projectCount).toBeGreaterThanOrEqual(4);
    expect(f.talkCount).toBeGreaterThanOrEqual(6);
    expect(f.publicationCount).toBeGreaterThanOrEqual(5);
    expect(f.kpiTileCount).toBe(0);
    expect(f.inflationPatternHits).toBe(0);
  });

  it('detects KPI-tile and inflation patterns in adversarial fixture', () => {
    const f = extractSite(path.join(FIXTURES, 'adversarial'));
    expect(f.kpiTileCount).toBeGreaterThan(0);
    expect(f.inflationPatternHits).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4.2** — Run: `npm run portfolio:test -- extractors/site` → expect FAIL ("module not found").
- [ ] **Step 4.3** — Implement `site.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { SiteFeatures } from '../types';

const INFLATION_KEYS = ['services', 'testimonials', 'logosWall', 'skillsBar', 'newsletter'];
const COORDINATION_KEYWORDS = /\b(SEAL|EPF|EIP[- ]?\d+|bug bounty program|working group|standards|steward)\b/i;

export function extractSite(rootDir: string): SiteFeatures {
  const portfolio = readJson(path.join(rootDir, 'portfolio.json'));
  const postsDir = path.join(rootDir, 'posts');
  const posts = readPosts(postsDir);

  const allProse = [
    portfolio.personal?.description ?? '',
    ...(portfolio.themes ?? []).flatMap((t: any) => [t.description, ...(t.highlights ?? [])]),
    ...posts.map((p) => p.content),
  ].join('\n');

  const postWordCounts = posts.map((p) => wordCount(p.content));
  postWordCounts.sort((a, b) => a - b);
  const median = postWordCounts.length ? postWordCounts[Math.floor(postWordCounts.length / 2)] : 0;

  const kpiTileCount = (portfolio.themes ?? []).filter((t: any) => t.displayAs === 'kpi-tile').length;
  const inflationPatternHits = INFLATION_KEYS.filter((k) => k in portfolio).length;

  const talks = portfolio.talks ?? [];
  const publications = (portfolio.publications ?? []).flatMap((e: any) => e.papers ?? []);

  return {
    postCount: posts.length,
    medianPostWords: median,
    codeRefsPerPost: avg(posts.map((p) => countCodeFences(p.content))),
    externalLinksPerPost: avg(posts.map((p) => countExternalLinks(p.content))),
    originalResearchPostRatio: posts.length
      ? posts.filter((p) => !/summary|recap|digest/i.test(p.title ?? '')).length / posts.length
      : 0,
    projectCount: (portfolio.themes ?? []).length,
    signatureToolPresent: (portfolio.themes ?? []).some(
      (t: any) => (t.links ?? []).some((l: any) => l.type === 'github' && l.label)
    ),
    supportingToolCount: (portfolio.themes ?? []).reduce(
      (n: number, t: any) => n + (t.links ?? []).filter((l: any) => l.type === 'github').length,
      0
    ),
    narrativeClaimsPer1kWords: countNarrativeClaims(allProse) / Math.max(1, wordCount(allProse) / 1000),
    kpiTileCount,
    publicationCount: publications.length,
    publicationsWithVenueLink: publications.filter((p: any) => p.venue && p.url).length,
    talkCount: talks.length,
    talksWithVenueYear: talks.filter((t: any) => t.venue && t.year).length,
    coordinationRoleCount: countMatches(allProse, COORDINATION_KEYWORDS),
    namedAffiliationCount: (portfolio.experience ?? []).filter((e: any) => e.company && e.period).length,
    visibleProseText: allProse,
    pageCount: countPages(rootDir),
    seoMetadataComplete: Boolean(portfolio.personal?.title && portfolio.personal?.description),
    ogImagePresent: false, // v1: detection from static HTML lands in Task 21
    inflationPatternHits,
    daysSinceLastPost: daysSince(posts.map((p) => p.date)),
    daysSinceLastCommit: Number.POSITIVE_INFINITY, // filled by github extractor in combined step
    currentAffiliationPresent: (portfolio.experience ?? []).some((e: any) => /Present/.test(e.period ?? '')),
    currentYearPostPresent: posts.some((p) => p.date && new Date(p.date).getFullYear() === new Date().getFullYear()),
  };
}

function readJson(p: string): any {
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

interface ParsedPost { title?: string; date?: string; content: string; }

function readPosts(dir: string): ParsedPost[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const parsed = matter(raw);
      return { title: parsed.data.title, date: parsed.data.date, content: parsed.content };
    });
}

function wordCount(s: string): number { return (s.match(/\S+/g) ?? []).length; }
function countCodeFences(s: string): number { return (s.match(/```/g) ?? []).length / 2; }
function countExternalLinks(s: string): number { return (s.match(/\]\(https?:\/\/[^)]+\)/g) ?? []).length; }
function countMatches(s: string, re: RegExp): number { return (s.match(new RegExp(re, 'gi')) ?? []).length; }
function countNarrativeClaims(s: string): number {
  const numbers = (s.match(/\b\d[\d,]*(\.\d+)?\s*(%|ETH|USD|\$|bug|CVE|commit|audit|bounty|repo)s?\b/gi) ?? []).length;
  const dates = (s.match(/\b(19|20)\d{2}\b/g) ?? []).length;
  return numbers + dates;
}
function avg(nums: number[]): number { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }
function countPages(dir: string): number {
  // v1: approximate — count top-level keys in portfolio.json + 1 for blog index. Refined in Task 21.
  const p = readJson(path.join(dir, 'portfolio.json'));
  return Object.keys(p).length;
}
function daysSince(dates: (string | undefined)[]): number {
  const ts = dates.filter(Boolean).map((d) => new Date(d!).getTime()).filter((n) => !Number.isNaN(n));
  if (!ts.length) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - Math.max(...ts)) / 86_400_000);
}
```

- [ ] **Step 4.4** — Run test → PASS.
- [ ] **Step 4.5** — Commit: `git add -A && git commit -m "feat(portfolio-eval): site extractor"`

---

## Task 5: GitHub extractor (TDD)

**Files:**
- Create: `tools/portfolio-eval/src/extractors/github.ts`
- Create: `tools/portfolio-eval/tests/unit/extractors/github.test.ts`

v1: reads the existing `data/github-stats.json`. No network calls.

- [ ] **Step 5.1** — Write test asserting `extractGithub(statsPath)` returns `{publicRepos: 80, ...}` when given the real stats file, and returns zeros when the file is missing.
- [ ] **Step 5.2** — Run → FAIL.
- [ ] **Step 5.3** — Implement: read JSON, map fields, return `GithubFeatures`. Missing file → all zeros + set `partial=true` in the combined extractor later.
- [ ] **Step 5.4** — Run → PASS.
- [ ] **Step 5.5** — Commit: `git add -A && git commit -m "feat(portfolio-eval): github extractor"`

---

## Task 6: LinkedIn extractor (thin)

**Files:**
- Create: `tools/portfolio-eval/src/extractors/linkedin.ts`
- Create: `tools/portfolio-eval/tests/unit/extractors/linkedin.test.ts`

v1: parses `private/linkedin-dump.txt` if present. Format: plain text, first non-empty line = headline, rest = summary. If missing, returns `{present: false, ...}`.

- [ ] **Step 6.1** — Write tests for: missing file → `present:false`; fixture dump file → correct headline + summary word count.
- [ ] **Step 6.2** — Implement. Create a fixture file `tests/fixtures/linkedin-dump.txt` with 3 lines.
- [ ] **Step 6.3** — Run → PASS.
- [ ] **Step 6.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): linkedin extractor"`

---

## Task 7: Resume extractor (thin)

**Files:**
- Create: `tools/portfolio-eval/src/extractors/resume.ts`
- Create: `tools/portfolio-eval/tests/unit/extractors/resume.test.ts`

v1: parses `private/resume.pdf` with `pdf-parse` (dynamic import so tests don't need the binary). If missing, returns `{present: false}`.

- [ ] **Step 7.1** — Write tests for: missing file → `present:false`. (PDF-present case deferred — no test fixture PDF in v1.)
- [ ] **Step 7.2** — Implement with lazy dynamic import of `pdf-parse`.
- [ ] **Step 7.3** — Run → PASS.
- [ ] **Step 7.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): resume extractor"`

---

## Task 8: Combined extractor

**Files:**
- Create: `tools/portfolio-eval/src/extractors/index.ts`
- Create: `tools/portfolio-eval/tests/unit/extractors/combined.test.ts`

- [ ] **Step 8.1** — Test: `extractAll({ siteDir, githubStatsPath, linkedinPath, resumePath })` returns a complete `FeatureVector` with `partial=true` when optional surfaces are missing, `false` when all four are present.
- [ ] **Step 8.2** — Implement: call each extractor, merge into one FeatureVector, populate `partialReasons` with missing-surface strings.
- [ ] **Step 8.3** — Patch `site.daysSinceLastCommit` from github stats in the combined step (so site extractor stays pure).
- [ ] **Step 8.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): combined extractor"`

---

## Task 9: Voice distance function

**Files:**
- Create: `tools/portfolio-eval/src/rubric/voice-distance.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/voice-distance.test.ts`

Shared by D7 and C3. Implements character-trigram Jaccard between your prose and the peer corpus prose centroid.

- [ ] **Step 9.1** — Write tests:
  - `trigramSet("abcd")` equals `{abc, bcd}`.
  - `voiceDistance(prose, [peer1, peer2])` returns a number in `[0, 1]` where `1 = completely distinct`.
  - `voiceDistance(X, [X, X])` returns `0`.
- [ ] **Step 9.2** — Implement:

```typescript
export function trigramSet(s: string): Set<string> {
  const norm = s.toLowerCase().replace(/\s+/g, ' ');
  const out = new Set<string>();
  for (let i = 0; i < norm.length - 2; i++) out.add(norm.slice(i, i + 3));
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function voiceDistance(prose: string, peerCorpus: string[]): number {
  if (!peerCorpus.length) return 1;
  const you = trigramSet(prose);
  const meanSim =
    peerCorpus.reduce((acc, p) => acc + jaccard(you, trigramSet(p)), 0) / peerCorpus.length;
  return 1 - meanSim;
}
```

- [ ] **Step 9.3** — Run → PASS.
- [ ] **Step 9.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): voice distance function"`

---

## Task 10: Dimension D1 — Signature tools

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d1-signature-tools.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d1.test.ts`

Raw feature: `signatureToolPresent ? 1 : 0` + `0.3 * min(supportingToolCount, 5) / 5`. Range roughly `[0, 1.3]`.

- [ ] **Step 10.1** — Test: empty fixture → 0; realistic fixture → ≥1.0.
- [ ] **Step 10.2** — Implement `extract(fv) => (fv.site.signatureToolPresent ? 1 : 0) + 0.3 * Math.min(fv.site.supportingToolCount, 5) / 5`.
- [ ] **Step 10.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D1 signature tools"`

---

## Task 11: Dimension D2 — Writing corpus

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d2-writing-corpus.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d2.test.ts`

Raw feature: combines `postCount` (saturating at 25), `medianPostWords` / 1000, and `originalResearchPostRatio`. The 8–25 band is rewarded — below 8 is linear up, above 25 is flat.

- [ ] **Step 11.1** — Test: post counts 0, 5, 15, 30 produce monotonically increasing values up to the band cap, then plateau.
- [ ] **Step 11.2** — Implement band-saturated function.
- [ ] **Step 11.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D2 writing corpus"`

---

## Task 12: Dimension D3 — Narrative impact claims

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d3-narrative-claims.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d3.test.ts`

Raw feature: `narrativeClaimsPer1kWords - kpi_penalty * kpiTileCount`, where `kpi_penalty = 2`. Penalizing KPI tiles is the signature inversion from my first-pass rubric.

- [ ] **Step 12.1** — Test: realistic fixture positive; adversarial fixture (has 1 KPI tile) → strictly lower than realistic even with similar narrative counts.
- [ ] **Step 12.2** — Implement.
- [ ] **Step 12.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D3 narrative claims"`

---

## Task 13: Dimension D4 — Credibility anchors

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d4-credibility-anchors.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d4.test.ts`

Raw feature: weighted sum of `publicationsWithVenueLink`, `talksWithVenueYear`, `upstreamMergeCount`, `coordinationRoleCount`, `namedAffiliationCount`. Weights chosen so each contributes roughly equally in the realistic fixture.

- [ ] **Step 13.1** — Test: empty → 0; realistic → matches a pinned golden number ±0.01.
- [ ] **Step 13.2** — Implement.
- [ ] **Step 13.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D4 credibility anchors"`

---

## Task 14: Dimension D5 — Topical coverage

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d5-topical-coverage.ts`
- Create: `tools/portfolio-eval/data/domain-vocabulary.json`
- Create: `tools/portfolio-eval/tests/unit/rubric/d5.test.ts`

Domain vocabulary is a committed JSON file: ~40 terms (fuzzing, formal methods, consensus, MEV, bridges, account abstraction, data availability, rollups, precompiles, KZG, bls, EVM, state transition, fork choice, gossip, libp2p, ethereum, solidity, differential fuzzing, structure-aware, OSS-Fuzz, libFuzzer, AFL, cargo-fuzz, ...).

Raw feature: `(terms_present / total_terms)` with per-term density capped at `0.5 * peer_cap` to prevent stuffing contributing here.

- [ ] **Step 14.1** — Create `domain-vocabulary.json` with the term list.
- [ ] **Step 14.2** — Test: empty → 0; realistic → positive; stuffed adversarial prose does not get a D5 boost beyond what breadth would give.
- [ ] **Step 14.3** — Implement.
- [ ] **Step 14.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D5 topical coverage"`

---

## Task 15: Dimension D6 — Freshness

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d6-freshness.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d6.test.ts`

Raw feature: `max(0, 1 - daysSinceLastPost / 365) + max(0, 1 - daysSinceLastCommit / 180) + (currentAffiliationPresent ? 0.5 : 0) + (currentYearPostPresent ? 0.5 : 0)`. Range approximately `[0, 3]`.

- [ ] **Step 15.1** — Test: table-driven for (0 days, 180, 365, infinity).
- [ ] **Step 15.2** — Implement.
- [ ] **Step 15.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D6 freshness"`

---

## Task 16: Dimension D7 — Distinctive voice

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d7-distinctive-voice.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d7.test.ts`

Calls `voiceDistance(fv.site.visibleProseText, peerProseCorpus)`. The peer prose corpus is threaded through as a parameter because D7 is the only dimension that needs the full peer corpus (not just percentiles). Other dimensions take `fv` only.

This is a small divergence from the DimensionExtractor interface; adjust interface to pass an optional `context` argument.

- [ ] **Step 16.1** — Update `types.ts`:
  ```typescript
  export interface DimensionContext { peerProse: string[]; }
  export interface DimensionExtractor {
    id: DimensionId;
    name: string;
    extract(fv: FeatureVector, ctx: DimensionContext): number;
  }
  ```
  Update D1–D6 to accept `ctx` and ignore it.
- [ ] **Step 16.2** — Test D7: distinct prose → high; prose copy-pasted from peer → low.
- [ ] **Step 16.3** — Implement D7.
- [ ] **Step 16.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D7 distinctive voice"`

---

## Task 17: Dimension D8 — Minimalism + discoverability

**Files:**
- Create: `tools/portfolio-eval/src/rubric/dimensions/d8-minimalism-discovery.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/d8.test.ts`

Raw feature: `bandReward(pageCount, 4, 6) + (seoMetadataComplete ? 0.5 : 0) + (ogImagePresent ? 0.25 : 0) + (linkedin.nameRoleMatchesSite ? 0.25 : 0) - 0.3 * inflationPatternHits`. Band reward is 1 inside [4,6], linearly decaying outside.

- [ ] **Step 17.1** — Test: realistic fixture > adversarial fixture (because adversarial has inflation hits).
- [ ] **Step 17.2** — Implement.
- [ ] **Step 17.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension D8 minimalism discovery"`

---

## Task 18: Dimension registry

**Files:**
- Create: `tools/portfolio-eval/src/rubric/index.ts`
- Create: `tools/portfolio-eval/tests/unit/rubric/index.test.ts`

- [ ] **Step 18.1** — Test: `getAllDimensions()` returns 8 entries, ids D1..D8, unique, stable order.
- [ ] **Step 18.2** — Implement as a frozen array import.
- [ ] **Step 18.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): dimension registry"`

---

## Task 19: Peer seed data

**Files:**
- Create: `tools/portfolio-eval/data/peer-seeds.json`

Hand-curated seed list derived from the research phase. 15 entries. Each has `name`, `org`, `role`, `surfaces.site` (or github if no site), and a `features` object with feature values eyeballed from their public surfaces.

**Critical honesty note to include in the file comment:** "Feature values are hand-estimated from public surfaces, not measured. Peer corpus v1 is a structured guess; v2 will replace with measured extractions."

- [ ] **Step 19.1** — Write seed file with entries for: samczsun, pcaversaccio, Fredrik Svantes, Yoav Weiss, holiman, Alex Beregszászi, Kelvin Fichter, Daejun Park, Pratyush Mishra, Philippe Dumonet, Antonio Viggiano, Norswap, transmissions11, tayvano, Dan Guido. Each with plausible feature values (post count, signature tool bool, talk count, etc.) based on the research notes.
- [ ] **Step 19.2** — Commit: `git add -A && git commit -m "data(portfolio-eval): peer seed corpus (v1 hand-curated)"`

---

## Task 20: Peer corpus storage + approval

**Files:**
- Create: `tools/portfolio-eval/src/peers/corpus.ts`
- Create: `tools/portfolio-eval/tests/unit/peers/corpus.test.ts`

- [ ] **Step 20.1** — Test:
  - `loadCorpus(path)` returns empty array if file absent.
  - `saveCorpus(path, entries)` round-trips.
  - `markApproved(corpus, id)` updates status.
- [ ] **Step 20.2** — Implement with JSON I/O. Warn when file is missing but do not create it automatically.
- [ ] **Step 20.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): peer corpus storage"`

---

## Task 21: Peer bootstrap command

**Files:**
- Create: `tools/portfolio-eval/src/commands/peers-bootstrap.ts`
- Create: `tools/portfolio-eval/tests/unit/commands/peers-bootstrap.test.ts`

- [ ] **Step 21.1** — Test: runs against fixture seed file and a temporary out path; asserts the resulting `peers.json` contains 15 entries all with `reviewStatus: 'pending'`.
- [ ] **Step 21.2** — Implement: read `peer-seeds.json`, copy into `peers.json` shape, set all `reviewStatus='pending'`, set `capturedAt=now()`, save.
- [ ] **Step 21.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): peers bootstrap command"`

---

## Task 22: Peer review command

**Files:**
- Create: `tools/portfolio-eval/src/commands/peers-review.ts`
- Create: `tools/portfolio-eval/tests/unit/commands/peers-review.test.ts`

v1 simplification: `peers:review --approve-all` flag that bulk-approves every pending entry and prints a summary. The interactive TTY version can land in v2.

- [ ] **Step 22.1** — Test: bulk-approve flips all entries to `approved` and prints the count.
- [ ] **Step 22.2** — Implement.
- [ ] **Step 22.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): peers review command"`

---

## Task 23: Scorer — normalize

**Files:**
- Create: `tools/portfolio-eval/src/scorer/normalize.ts`
- Create: `tools/portfolio-eval/tests/unit/scorer/normalize.test.ts`

- [ ] **Step 23.1** — Test: `percentile([1,2,3,4,5,6,7,8,9,10], 0.5) === 5.5`; `subScore(5, {p10:0, p90:10}) === 0.5`; clamping at 0 and 1.
- [ ] **Step 23.2** — Implement percentile (linear interpolation) and `subScore`.
- [ ] **Step 23.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): sub-score normalization"`

---

## Task 24: Scorer — weights

**Files:**
- Create: `tools/portfolio-eval/src/scorer/weights.ts`
- Create: `tools/portfolio-eval/tests/unit/scorer/weights.test.ts`

- [ ] **Step 24.1** — Test: identical peer vectors (zero variance everywhere) → uniform weights; one high-variance dimension → disproportionately higher weight for that dimension; weights sum to 1 within 1e-9.
- [ ] **Step 24.2** — Implement: `varianceWeights(perDimensionFeatureLists: number[][]): number[]`.
- [ ] **Step 24.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): variance-based weights"`

---

## Task 25: Scorer — aggregate + stop condition

**Files:**
- Create: `tools/portfolio-eval/src/scorer/aggregate.ts`
- Create: `tools/portfolio-eval/src/scorer/index.ts`
- Create: `tools/portfolio-eval/tests/unit/scorer/aggregate.test.ts`
- Create: `tools/portfolio-eval/tests/unit/scorer/index.test.ts`

- [ ] **Step 25.1** — Test `aggregate(subScores, weights)` = `Σ w·s`.
- [ ] **Step 25.2** — Test `stopConditionMet(youFeatures, peerFeaturesPerDim, 0.75)` returns true iff each `youFeature_i ≥ P75_i`.
- [ ] **Step 25.3** — Test `scorer/index.ts` orchestration: runs all 8 dimensions on fv, computes percentiles from peer corpus, produces Report.
- [ ] **Step 25.4** — Implement all three.
- [ ] **Step 25.5** — Commit: `git add -A && git commit -m "feat(portfolio-eval): scorer aggregate + stop condition"`

---

## Task 26: Constraint C1 — unverifiable claims

**Files:**
- Create: `tools/portfolio-eval/src/constraints/c1-unverifiable.ts`
- Create: `tools/portfolio-eval/data/sources.json`
- Create: `tools/portfolio-eval/tests/unit/constraints/c1.test.ts`

`sources.json` shape:
```json
{
  "verified": [
    { "claim": "303 commits to the Solidity compiler", "source": "https://github.com/ethereum/solidity/commits?author=chriseth", "capturedAt": "2026-04-14" }
  ]
}
```

C1 extracts every quantified claim from visible prose (regex for numbers + units) and returns `{ok: bool, unverified: string[]}`. An edit-gate version (for v2) will reject edits that introduce entries in `unverified`. In v1 the function is called by the reporter to surface unverified claims as a warning.

- [ ] **Step 26.1** — Test: realistic fixture has 2 unverified claims; sources.json with matching entries makes them verified.
- [ ] **Step 26.2** — Implement claim extraction + whitelist matching.
- [ ] **Step 26.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): constraint C1 claim provenance"`

---

## Task 27: Constraint C2 — keyword stuffing

**Files:**
- Create: `tools/portfolio-eval/src/constraints/c2-stuffing.ts`
- Create: `tools/portfolio-eval/tests/unit/constraints/c2.test.ts`

Computes per-term density in your prose and compares against `1.5 * max(density_t(peer))`. v1: since we don't have real peer prose yet, fall back to a fixed cap of `0.03` per term from the domain vocabulary. Document this limitation.

- [ ] **Step 27.1** — Test: adversarial fixture "fuzzing" density > 0.10 → flagged; realistic fixture → clean.
- [ ] **Step 27.2** — Implement.
- [ ] **Step 27.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): constraint C2 keyword stuffing"`

---

## Task 28: Constraint C3 — voice gate wrapper

**Files:**
- Create: `tools/portfolio-eval/src/constraints/c3-voice-gate.ts`
- Create: `tools/portfolio-eval/tests/unit/constraints/c3.test.ts`

Thin wrapper around `rubric/voice-distance.ts`. In v1 it only exposes `checkVoiceDistance(prose, peerProse, floor)` returning `{ok, distance}`. The gate role (rejecting edits) is v2.

- [ ] **Step 28.1** — Test: prose distinct from peer corpus → ok; prose identical to one peer → ok fails if floor > 0.
- [ ] **Step 28.2** — Implement.
- [ ] **Step 28.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): constraint C3 voice gate"`

---

## Task 29: Reporter — markdown

**Files:**
- Create: `tools/portfolio-eval/src/reporter/markdown.ts`
- Create: `tools/portfolio-eval/tests/unit/reporter/markdown.test.ts`

- [ ] **Step 29.1** — Snapshot test: feed a canned `Report` and assert the markdown matches a checked-in snapshot. First run creates the snapshot; subsequent runs compare.
- [ ] **Step 29.2** — Implement markdown formatter. Include: header (generated at, partial flag), aggregate score, per-dimension table (id, name, raw, sub-score, p10/p75/p90, weight, below-P75 flag), stop-condition line, unverified-claim warnings, peer-corpus warnings.
- [ ] **Step 29.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): markdown reporter"`

---

## Task 30: Reporter — JSON

**Files:**
- Create: `tools/portfolio-eval/src/reporter/json.ts`
- Create: `tools/portfolio-eval/tests/unit/reporter/json.test.ts`

- [ ] **Step 30.1** — Test: JSON output validates against the `Report` type shape and is deterministic for the same input.
- [ ] **Step 30.2** — Implement with sorted keys + stable stringification.
- [ ] **Step 30.3** — Commit: `git add -A && git commit -m "feat(portfolio-eval): json reporter"`

---

## Task 31: CLI dispatcher + score command

**Files:**
- Create: `tools/portfolio-eval/src/cli.ts`
- Create: `tools/portfolio-eval/src/commands/score.ts`
- Create: `tools/portfolio-eval/tests/unit/commands/score.test.ts`

- [ ] **Step 31.1** — Test: invoking `scoreCommand({siteDir, peersPath, outDir})` against the realistic fixture and a temporary peers file (pre-populated from seeds) writes a markdown and JSON report to `outDir` and returns an exit code of 0.
- [ ] **Step 31.2** — Implement: dispatcher switches on `argv[2]` (`score` | `peers:bootstrap` | `peers:review`). Score command: load peers, extract features, run scorer, write reporter output to `eval-reports/YYYY-MM-DD-HHMMSS.{md,json}`.
- [ ] **Step 31.3** — Smoke-test by hand: `npm run portfolio:peers:bootstrap && npm run portfolio:peers:review -- --approve-all && npm run portfolio:score` — must print an aggregate score and gap list for the real portfolio.
- [ ] **Step 31.4** — Commit: `git add -A && git commit -m "feat(portfolio-eval): cli dispatcher + score command"`

---

## Task 32: Integration + determinism tests

**Files:**
- Create: `tools/portfolio-eval/tests/integration/pipeline.test.ts`
- Create: `tools/portfolio-eval/tests/integration/determinism.test.ts`

- [ ] **Step 32.1** — Pipeline test: load realistic fixture + mock peer corpus, run full pipeline, assert aggregate score is in `[0.3, 0.9]` (generous for v1) and gap list top-3 matches a golden.
- [ ] **Step 32.2** — Determinism test: run score 50× on the same inputs, assert byte-identical JSON outputs.
- [ ] **Step 32.3** — Run: `npm run portfolio:test` → all green.
- [ ] **Step 32.4** — Commit: `git add -A && git commit -m "test(portfolio-eval): integration + determinism"`

---

## Task 33: Final verification

- [ ] **Step 33.1** — `npm run check` (typecheck + lint + format). If prettier/eslint complains about tool files, add `tools/portfolio-eval/**` to the relevant ignore globs or fix formatting.
- [ ] **Step 33.2** — `npm run portfolio:test` — all tests green.
- [ ] **Step 33.3** — Dry-run the real CLI flow:
  ```
  npm run portfolio:peers:bootstrap
  npm run portfolio:peers:review -- --approve-all
  npm run portfolio:score
  cat tools/portfolio-eval/eval-reports/$(ls -t tools/portfolio-eval/eval-reports | head -1)
  ```
  Expect: a markdown report with 8 sub-scores and a gap list. The numbers don't need to be calibrated yet — the point is that the pipeline runs end-to-end against the real portfolio.
- [ ] **Step 33.4** — Commit any final fixups: `git add -A && git commit -m "chore(portfolio-eval): v1 final verification"`

---

## What this plan does NOT deliver (v2 scope)

- `portfolio:fix` auto-fix command
- `portfolio:suggest` PR generation
- `portfolio:loop` driver
- `portfolio:panel` advisory LLM channel
- Edit generators for any dimension
- Adversarial regression test (requires edit generators)
- Live peer corpus scraping / refreshing
- Interactive TTY peer review (v1 ships bulk-approve only)
- GitHub API on-demand fetching (v1 uses the already-committed `data/github-stats.json`)
- Cross-surface consistency checks that require the LinkedIn + resume inputs to be present (falls back to `ogImagePresent=false` etc. when inputs are missing)

Any of the above that start blocking real use come back as v2 tasks driven by the actual v1 output. We won't guess; we'll measure.
