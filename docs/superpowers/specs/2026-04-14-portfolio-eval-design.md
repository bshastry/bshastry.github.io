# Portfolio Evaluation and Optimization Framework — Design

**Date:** 2026-04-14
**Status:** Draft, pending spec review
**Owner:** Bhargava Shastry
**Scope:** Internal tooling in this repo (`tools/portfolio-eval/`), not shipped to the public site

## 1. Problem

Build a portfolio evaluation and optimization framework that:

- Evaluates a security engineer's portfolio (website, GitHub profile, LinkedIn, resume PDF) against a rubric derived from research on resume/portfolio evaluation combined with a benchmark of peers who actually hold senior-level L1/L2 protocol security roles.
- Produces a numeric score that is deterministic, auditable, and resistant to gaming ("no cheating").
- Drives an iterative optimization loop that either auto-applies structural fixes or emits human-reviewable prose suggestions until a stopping condition is reached.
- Makes an honest, defensible claim about its relationship to hiring outcomes: the rubric is the best available proxy for "higher hiring outcome for senior/staff security engineer roles at L1/L2 protocol teams," not a validated causal predictor.

The target role is senior/staff security engineer at L1/L2 protocol organizations (Ethereum Foundation, Optimism, Arbitrum, Base, Starkware, Scroll, Polygon, zkSync, etc.).

## 2. Non-goals

- Not a public product. Internal tool, not marketed.
- Not a smart-contract auditor ranking system.
- Not a hiring-outcome predictor in the machine-learning sense; no longitudinal outcome data is involved.
- Not a replacement for human editorial judgment on prose; prose changes always go through a human review gate.
- No SEO chase for anonymous reader traffic; discoverability is one modest input, not the objective.
- No social-media optimization; follower counts and engagement metrics are not features.

## 3. Approach selection

The user chose a **hybrid ground truth**: a research-grounded rubric that defines what to measure, plus a peer benchmark that calibrates how to score.

The architecture selected is **Approach B — deterministic linter + advisory LLM qualitative channel**:

- The numeric score is produced entirely from deterministic feature extraction over the four input surfaces. No LLM sits in the scoring path.
- An optional LLM panel reads the same content and produces a qualitative report (reactions, flags, suggestions) that appears alongside the score but does not contribute to it.

This separation is load-bearing for the "no cheating" requirement: LLMs cannot inflate a number they are not in the computation of.

## 4. Architecture

All code lives under `tools/portfolio-eval/` in this repository. TypeScript, reuses the existing Node toolchain.

```
tools/portfolio-eval/
  src/
    cli.ts                  Entry points: score | fix | suggest | loop | panel | peers:*
    rubric/
      index.ts              Dimension registry + weight computation
      dimensions/           One file per dimension (d1-signature-tools.ts, ...)
    extractors/
      site.ts               Walks content/posts/, data/portfolio.json, static HTML
      github.ts             Reads data/github-stats.json + cached api.github.com calls
      linkedin.ts           Parses private/linkedin-dump.txt
      resume.ts             Parses private/resume.pdf via pdf-parse
    peers/
      corpus.ts             Read/write data/peers.json, approval workflow
      fetcher.ts            Seed fetcher for bootstrap
      normalize.ts          Feature normalization across peers
    scorer/
      normalize.ts          Sub-score computation (percentile clamping)
      weights.ts            Variance-based weight computation
      aggregate.ts          S = Σ w·s
    gap-analyzer/
      index.ts              Rank gaps by computed delta
      edit-generators/      Per-dimension enumeration of candidate edits
    constraints/
      c1-unverifiable.ts    Claim provenance check
      c2-stuffing.ts        Keyword-density cap check
      c3-voice.ts           Style-distance floor check
      c4-prose-gate.ts      Structural vs prose classifier
    auto-fix/               Codemods for structural edits (metadata, ordering, completeness)
    llm-panel/              Advisory qualitative channel, off by default
    reporter/               Markdown + JSON report rendering
  data/
    rubric.yml              Dimension definitions, thresholds, version-pinned
    peers.json              Scored peer corpus (GITIGNORED — local-only)
    sources.json            User-curated whitelist of verifiable claim provenances
  eval-reports/             Time-stamped score reports (gitignored)
  tests/
    fixtures/               Tiny golden portfolios (empty, realistic, adversarial)
    __snapshots__/          Reporter output snapshots
```

### Data flow

1. CLI entry parses the command.
2. Extractors read each input surface and emit feature vectors per dimension. Missing optional surfaces (LinkedIn, resume) flag the report as `partial=true` but do not crash.
3. The scorer reads `data/peers.json`, computes variance-based weights, normalizes each feature against peer percentiles, and produces a per-dimension sub-score vector and an aggregate.
4. The gap analyzer identifies dimensions where you are below the stopping threshold (P75 of the peer corpus) and enumerates candidate edits. For each candidate, it computes the *exact* delta by simulating the edit against the scoring function.
5. Constraints C1–C4 are evaluated on each candidate edit. Any violation rejects that candidate.
6. The highest-delta surviving candidate is applied (structural) or emitted as a PR branch (prose).
7. The reporter writes a time-stamped markdown and JSON report under `eval-reports/`.
8. The advisory LLM panel (if enabled) runs in parallel and writes a separate `YYYY-MM-DD-qualitative.md` file; it never touches the score.

## 5. Rubric dimensions

Eight dimensions. Each dimension produces a raw feature scalar `f_i` and a sub-score `s_i ∈ [0,1]` computed via peer-percentile clamping (see §6).

| # | Dimension | Measures | Representative features |
|---|-----------|----------|-------------------------|
| D1 | **Signature tools** | Named, owned OSS tools with demonstrable purpose and adoption | At least one primary signature tool; count of supporting tools; upstream adoption (stars from distinct users, external references, downstream dependents). Self-starred stars excluded. |
| D2 | **Long-form writing corpus** | Depth and substance of research writing | Post count (rewarded in the 8–25 band, no monotonic reward beyond), median words per post, code references per post, external links per post, ratio of original-research/incident-analysis posts to summary posts. |
| D3 | **Narrative impact claims** | Quantitative claims embedded in prose | Counts of (number \| date \| named beneficiary \| CVE id \| link) tokens per 1000 words of visible prose. **Penalty** term for any claim presented as a KPI tile / dashboard widget. |
| D4 | **Credibility anchors** | Third-party validation with concrete anchors | Publications with venue + link; talks with venue + year + (optional) video; named affiliations with dates; upstream OSS merges with link to merged PR; coordination roles (SEAL 911, EPF, EIP authorship, bug-bounty program ownership, standards work). |
| D5 | **Topical coverage** | Breadth of in-domain vocabulary vs peer corpus | Term-set coverage from a peer-corpus-derived vocabulary (fuzzing, formal methods, consensus, MEV, bridges, AA, DA, rollups, precompiles, KZG, …). Per-term caps prevent stuffing. Lower weight than D1–D4 by design; depth beats breadth for this role. |
| D6 | **Freshness** | How current the portfolio reads | Days since last blog post, days since last commit on primary repos, presence of current affiliation, presence of current-year talk or post. |
| D7 | **Distinctive voice** | Sounds like you, not a template | Lexical distance from peer-corpus mean + first-person-ratio + penalty for corporate third-person phrasing and generic LLM n-grams. Serves as both a scoring dimension and the structural anti-cheat for voice. |
| D8 | **Minimalism + discoverability** | Focused, findable, consistent across surfaces | Page count rewarded in 4–6 band; SEO metadata present; OG image; link health; cross-surface name/role/claim consistency (site ↔ GitHub ↔ LinkedIn ↔ resume). **Penalty** terms for inflation patterns: services pages, testimonials, logos walls, skills bars, newsletter widgets, animated heroes. |

The rubric is grounded in a survey of 15 publicly identified senior L1/L2 protocol security engineers (samczsun, pcaversaccio, Fredrik Svantes, Yoav Weiss, Martin Holst Swende, Alex Beregszászi, Kelvin Fichter, Daejun Park, Pratyush Mishra, Philippe Dumonet, Antonio Viggiano, Norswap, transmissions11, tayvano, Dan Guido) whose portfolios exhibit the following majority patterns: long-form writing index over project grid, GitHub-as-CV, minimal 4–6 page structure, first-person terse voice, coordination-role visibility, concrete numbers embedded in prose, absence of KPI tiles and marketing surfaces. Rare-but-high-signal patterns: a named signature OSS tool, inline rescue/impact numbers in narrative, cross-linking to coordination roles, a distinct "notes/scratchpad" section.

## 6. Scoring function

### Sub-score normalization

For each dimension `i`, with `P10_i`, `P75_i`, `P90_i` the 10th, 75th, and 90th percentiles of `f_i` across the peer corpus:

```
s_i = clamp01( (f_i(you) - P10_i) / (P90_i - P10_i) )
```

`s_i = 0` ⇔ at or below the peer floor; `s_i = 1` ⇔ at or above the peer ceiling. Clamping handles outliers.

### Weights

```
w_i = var(peer f_i) / Σ_j var(peer f_j)
```

Dimension weights are proportional to peer variance. Dimensions with high peer variance are discriminative and weighted up; dimensions with low peer variance are less discriminative and weighted down. This is a principled, data-driven weighting that avoids hand-picked weights and is not a knob an LLM can adjust. Weights are recomputed whenever the peer corpus changes and are printed in every report so their provenance is visible.

### Aggregate

```
S = Σ_i w_i · s_i    ∈ [0, 1]
```

`S` is used for reporting and intra-loop comparison. It is **not** the stop condition.

### Stop condition

```
stop iff  f_i(you) ≥ P75_i  for all i ∈ {1, …, 8}
```

Per-dimension dominance at the 75th percentile of the peer corpus. This is stronger than "aggregate `S` is high" and prevents the failure mode where strong performance on a few dimensions masks weakness on others. Chosen by user.

## 7. Constraint set

Constraints are evaluated on each candidate edit *before* the edit is accepted. A violation rejects the edit entirely; it is not converted to a soft penalty.

| | Constraint | Definition | Enforcement |
|---|-----------|-------------|-------------|
| C1 | No unverifiable claims | Every numeric, date, or named-beneficiary token in visible prose must trace to an entry in `data/sources.json` or a live API (GitHub stats, DOI). | Edit rejected if it introduces or leaves any unmatched claim. |
| C2 | No keyword stuffing | For every topical term `t`, `density_t(portfolio) ≤ 1.5 × max(density_t(peer))`. | Edit rejected if any term density would exceed its cap after application. |
| C3 | Minimum voice distance | Style-fingerprint distance from peer-corpus mean ≥ `floor_voice`. | Edit rejected if distance would drop below the floor. |
| C4 | Prose requires human approval | Prose edits are emitted as PR branches; their score deltas are marked provisional until the PR is merged by the user. | Classifier distinguishes structural (auto-apply) from prose (PR). |

C1–C3 are hard constraints in the optimization. C4 is a workflow gate implemented via the PR branch mechanism.

The user explicitly chose not to include a multi-metric improvement rule (rejecting any edit that improves one dimension while regressing another). The design respects that choice; single-dimension improvements are acceptable.

## 8. Optimization algorithm

Greedy gap fixing with exact delta computation:

```
loop:
  features = extract(portfolio)
  (s, S) = score(features, peer_corpus)

  if all f_i ≥ P75_i:            break            # stop condition
  if iteration >= max_iters:     break            # safety limit

  candidates = []
  for dimension i where f_i < P75_i:
    for e in generate_edits(i, portfolio):
      if not all_constraints_hold(e, portfolio): continue
      delta = score(extract(apply(e, portfolio)), peer_corpus).S - S
      candidates.append((delta, e, i))

  if not candidates: break                        # nothing to improve under constraints

  candidates.sort(desc)
  best = candidates[0]

  if best.edit.kind == "structural":
    apply(best.edit)          # commits immediately
  else:
    open_pr_for(best.edit)    # human gate; loop may exit or continue based on mode
```

`delta` is computed, not estimated. The scoring function is pure and fast enough to simulate each candidate edit in full.

The edit generators are deterministic enumerators per dimension. Examples: for D1, "add a pinned signature tool repo to portfolio.json with fields X,Y,Z"; for D4, "add a talk entry with venue/year to `Talks.tsx`"; for D8, "remove the logos wall component if present." Generators are not open-ended; they produce a bounded, reviewable set.

## 9. Input surfaces

| Surface | Source | Notes |
|---------|--------|-------|
| Website | `content/posts/*.md`, `data/portfolio.json`, `next build` static HTML | Deterministic, no network. |
| GitHub | `data/github-stats.json` + cached `api.github.com` calls (24h TTL) | Rate-limit aware; degrades on failure. |
| LinkedIn | `private/linkedin-dump.txt` pasted locally (no scraping) | Gitignored. Missing → partial report. |
| Resume PDF | `private/resume.pdf` parsed via `pdf-parse` | Gitignored. Missing → partial report. |

The peer corpus uses the same four-surface model per peer where available; missing surfaces for a peer are marked and excluded from that peer's contribution to percentile statistics on the affected dimensions.

## 10. Error handling

- Missing optional inputs (LinkedIn, resume): extract what's present, set `partial=true` on report, continue.
- Stale peer corpus (`captured_at > 30 days`): warn in report header, continue scoring.
- LLM panel failure: degrade to deterministic-only; panel is advisory so this never blocks a score.
- Auto-fix conflict (edit violates a constraint, fails type check, or creates a merge conflict): abort that edit, log reason, fall back to next-ranked candidate. Never force.
- Empty peer corpus on first run: hard stop with actionable message to run peers bootstrap. No synthetic peers.

## 11. Testing

- **Fixtures**: three tiny portfolios under `tests/fixtures/`:
  - `empty/`: minimal content, exercises floor/minimum-score path.
  - `realistic/`: modeled on a public portfolio, known-good feature vector.
  - `adversarial/`: tries every gaming move — keyword stuffing, KPI tiles, inflated claims, generic LLM voice, peer-copied phrasing.
- **Unit tests**: table-driven per-extractor tests.
- **Constraint tests**: each of C1–C4 tested with a positive case (passes) and the adversarial fixture (rejects).
- **Determinism test**: run `score()` 100× on the same fixture, assert byte-identical output.
- **Snapshot tests**: reporter markdown output.
- **Integration test**: full pipeline on `realistic` fixture; asserts score is in an expected range and top-3 gaps match a golden list.
- **Adversarial regression test**: run the optimizer on the adversarial fixture *with constraints disabled* and confirm it scores high. Re-enable constraints and confirm the edits are rejected. This is the live proof that C1–C4 actually bite.

## 12. LLM panel (advisory, off by default)

- Runs only when `EVAL_LLM_PANEL=1`.
- Three agents with fixed, checked-in prompts: Hiring Manager — L1/L2 Protocol Security Lead; Recruiter — Senior Security Engineering; Peer Researcher — Published L1/L2 Security Contributor.
- Each agent reads the same extracted text and produces JSON `{reactions: [...], flags: [...], suggestions: [...]}`.
- Output is written to `eval-reports/YYYY-MM-DD-qualitative.md` and displayed alongside the numeric score in the CLI.
- No aggregation math. The panel is a readable set of reactions, not a score input.
- Prompts are version-pinned. Model family is pinned (not "latest"). The panel is reproducible on demand.

## 13. CLI surface

| Command | Behavior |
|---------|----------|
| `npm run portfolio:peers:bootstrap` | Fetch and extract features for seed peers, save as `pending`. |
| `npm run portfolio:peers:review` | Interactive approval of pending peers. |
| `npm run portfolio:score` | Run extraction + scoring, print report, write JSON to `eval-reports/`. |
| `npm run portfolio:fix` | Apply the single highest-delta structural fix that passes all constraints; commit. |
| `npm run portfolio:suggest` | Emit the highest-delta prose edit as a PR branch for review. |
| `npm run portfolio:loop` | Score → fix → (maybe suggest) until stop condition or human gate. |
| `npm run portfolio:panel` | Run the advisory LLM panel (requires env var + API key). |

The loop command is interactive when attached to a TTY: pauses on prose edits, prints the PR URL, and waits for `approve | skip | abort`. In non-interactive mode (cron), it exits cleanly after the last structural fix and leaves any emitted PRs for later review.

## 14. v1 scope

**v1 is setup-only, stopping before any repo mutation.** Chosen by user to let scores be validated against intuition before the optimizer starts modifying the portfolio.

v1 delivers:
- CLI scaffolding with the commands marked below.
- Rubric code with all eight dimensions.
- Extractors for all four surfaces.
- Peer corpus bootstrap + review workflow.
- Scoring (sub-scores, weights, aggregate, stop condition evaluation).
- Constraint framework with C1–C4 stubs (full C1 and C2 implementations; C3 and C4 stubs sufficient for scoring).
- Reporter (markdown + JSON).
- Fixtures and the full test suite described in §11.

v1 does **not** deliver:
- `portfolio:fix` (auto-fix)
- `portfolio:suggest` (PR generation)
- `portfolio:loop`
- LLM panel

Those land in v2 after v1 is validated — i.e., the user has run `portfolio:score` on their real portfolio, reviewed the output, and confirmed the numbers align with their intuition about where the portfolio is strong and weak.

## 15. Peer corpus governance

`data/peers.json` is gitignored (user choice) and lives locally. Governance rules:

- A peer is added to the corpus only after extracted features are human-reviewed and explicitly approved. Approval status is stored on each peer entry.
- The review step is mandatory; there is no "bulk approve all" command.
- Monthly refresh re-extracts features for existing approved peers but does not change their approval status or add new peers without human input.
- The seed list from the research phase is 15 peers; the target corpus size is 15–30.
- If a peer's portfolio becomes inaccessible, the entry is marked `unreachable` but not deleted, to preserve historical percentile continuity.

## 16. Honesty statement about hiring outcomes

This framework optimizes a rubric that is the best constructible proxy for "higher hiring outcome in senior/staff L1/L2 protocol security roles." It does **not** prove that a higher rubric score causes a higher hiring outcome. The proxy rests on two assumptions: (a) the research literature on resume/portfolio evaluation generalizes to this niche role, and (b) the 15 identified peers are a reasonable reference population for the target role.

Any public description of this framework should use the language "honest maximization of the best available proxy" rather than "optimization for hiring outcomes." The anti-cheating constraints exist precisely because the proxy is not ground truth and any framework built on a proxy must resist gaming of that proxy.

## 17. Open risks

- **Peer corpus selection bias.** The 15 surveyed peers skew toward publicly visible researchers; many senior L1/L2 security engineers have no personal portfolio at all. Mitigation: document this bias in the report header and keep the corpus small and human-approved.
- **Variance-based weights over-weight noisy dimensions.** A dimension with spurious measurement variance (e.g., inconsistent GitHub API responses) could get inflated weight. Mitigation: determinism tests and a capped max weight per dimension.
- **D7 voice distance is hard to compute reliably.** Style fingerprints over small text samples are noisy. Mitigation: start with a simple character-n-gram Jaccard/TF-IDF measure and iterate only if v1 scoring shows it's misranking.
- **Some dimensions have very small integer ranges.** Publication count, talk count, etc. can't meaningfully hit 90th percentile by one added item. Mitigation: use smoothed percentile estimators and document the granularity limitation in the report.

## 18. Explicitly deferred to v2

- Auto-fix and PR generation.
- The full loop driver.
- LLM advisory panel.
- Any form of A/B variant generation or engagement-driven learning (Approach C).
- Any control corpus for discriminativeness-based weight learning (as opposed to variance-based).
- Expansion to additional target-role clusters (audit firms, big-tech security, independent/consultant).

---

*End of design.*
