# Site Improvement Plan — bshastry.github.io

**Priority frame:** Employability (employers, collaborators, research peers) is the **primary**
audience. Consulting/engagements is **secondary** — kept credible and reachable, but never
allowed to shape the first impression. Credibility is the hard constraint throughout: every
change either moves existing evidence earlier, states existing facts more concretely, or
removes duplication. Nothing gets louder.

**How to use this document:** Phases are ordered by impact-to-effort *for the employability
goal*. Each phase lists the files touched, exact copy to use (paste-ready), implementation
notes, and acceptance criteria. Phases are independently shippable; ship in order. Copy in
`> blockquotes` is final proposed text — edit voice to taste, but keep claims exactly as
factual as written (every number traces to `data/portfolio.json`).

**Verification for every phase:** `npm ci && npm run lint && npm run build`, then eyeball
`npm run dev` in both themes at 375 px, 768 px, and 1280 px. CI (`.github/workflows/ci.yml`)
must stay green.

---

## Phase 1 — Hero rework: the first 15 seconds (P0)

**Why first:** Recruiters and hiring managers scan for *role + employer + recent proof*.
Today the role/employer line is the faintest text on the screen (`text-sm text-faint`), the
name consumes two `text-8xl` lines, and the strongest 2025–26 results don't appear until
section 04. This phase moves the best material into the first screenful.

**Files:** `components/Hero.tsx`, `data/portfolio.json` (personal.description),
`app/layout.tsx` (metadata description — keep in sync).

### 1.1 Structure (top to bottom)

1. **Role eyebrow** — new element above the name, visible weight (not faint):
   `eyebrow` style but `text-muted`, e.g.
   > SECURITY ENGINEER · ETHEREUM FOUNDATION
2. **Name** — one line, smaller: `text-5xl md:text-7xl` (drop the two-`<span>` block split;
   keep the accent color on the surname if desired).
3. **Headline** (replaces the current 40-word sentence):
   > I run independent implementations against each other — Ethereum clients, post-quantum
   > cryptography libraries, compilers — and turn every disagreement into a reproducible
   > bug report.
4. **Proof line** (replaces the current faint proof line; render at `text-muted`, not
   `text-faint`, with inline evidence links):
   > Recently: a confirmed-exploitable timing channel in Mbed TLS
   > ([security advisory, Jul 2026](https://mbed-tls.readthedocs.io/en/latest/security-advisories/mbedtls-security-advisory-2026-07-ecc-optimized-modp-side-channel/)),
   > upstream fixes merged in Erigon, Nethermind, and revm ([findings](#findings)), and
   > 25 miscompilation bugs found in the Solidity compiler
   > ([paper](https://arxiv.org/abs/2607.07217)).
5. **Latest-post pill** — keep, but swap the `Sparkles` icon for `FileText` (sparkles reads
   as AI-hype in 2026).
6. **Stats row** — see Phase 2.
7. **CTA buttons** — employability-first pairing:
   - Primary: `See case studies` → `#case-studies` (unchanged)
   - Secondary: `Download CV (PDF)` → `/media/Bhargava_Shastry_CV.pdf`
   - The consulting path stays reachable via the nav "Work" item and the quiet link under
     Case Studies — do **not** keep "Discuss a scoped review" in the hero.
8. **Remove** the hero independence disclaimer paragraph ("Independent engagements are
   limited…"). It remains in Work-with-me and the footer (Phase 5.4); three instances reads
   anxious, and with no consulting CTA in the hero it is no longer needed here.
9. Keep the scroll arrow *element* if wanted but drop `animate-bounce` (dated); a static
   arrow with hover color is enough. Optional: delete entirely.

### 1.2 De-duplicate the mission sentence

The phrase "differential testing of Ethereum clients, cryptographic libraries, and
compilers … before they become production incidents" currently appears in the hero,
About, `portfolio.json` description, layout metadata, and footer. After this phase each
surface does one distinct job:

- **Hero:** claim + proof (copy above).
- **`personal.description` / metadata description** (SEO — keep keywords, one sentence):
  > Security engineer at the Ethereum Foundation. Differential testing of Ethereum
  > clients, post-quantum cryptography, and compilers — plus the AI-assisted triage
  > pipelines that scale it.
- **About:** the thesis (Phase 3).
- **Footer:** one plain sentence (Phase 5.4).

### Acceptance criteria

- Role + "Ethereum Foundation" legible in the first viewport at 375 px without scrolling.
- Advisory, merged-fixes, and paper links present and correct in the hero.
- No consulting CTA above the fold; CV reachable in one click from the hero.
- Headline ≤ 30 words; no phrase appears verbatim in more than one surface.

---

## Phase 2 — Stats row: recent, evidence-linked numbers (P0)

**Why:** "10+ years in security" is generic and "300+ compiler commits" is 2018–2022
activity, not impact. Recency is what a skeptical reader checks first.

**Files:** `components/Hero.tsx`, `app/page.tsx` (props).

Replace the four stats (keep the existing pattern that every number links to evidence):

| Value | Label | Href |
|---|---|---|
| `{findingsCount}` (computed, currently 10) | `public findings · 2025–26` | `#findings` |
| `1` | `security advisory` | Mbed TLS advisory URL (external) |
| `5` | `EVM implementations cross-checked` | `#case-studies` |
| `{publicationsCount}` (computed, currently 11) | `publications` | `#publications` |

Implementation notes:

- Keep `findingsCount`/`publicationsCount` computed in `app/page.tsx` as today. The "5"
  is the geth/Besu/Nethermind/Erigon/revm matrix from the first case study — hard-code
  with a comment pointing at `caseStudies[0].approach`, or add a small
  `stats` block to `portfolio.json` so all four are data-driven (preferred).
- The `2025–26` qualifier in the findings label is load-bearing (recency signal); update
  it when the data ages — another argument for putting labels in `portfolio.json`.
- Accuracy guard: say "EVM implementations", **not** "clients" (revm is an EVM library);
  merged-fix claims name only Erigon, Nethermind, revm, and execution-specs.

### Acceptance criteria

- No stat older than the current focus areas headlines the row; all four link somewhere
  verifiable; counts still derive from data (no hand-maintained numbers where avoidable).

---

## Phase 3 — About: thesis pull-quote + experience/education timeline (P0)

**Why:** (a) The site's most distinctive idea is buried as a mid-paragraph clause.
(b) **The site renders no experience or education anywhere** — `portfolio.json` contains
both, but no component consumes them. For an employability-first site this is the single
largest content gap: recruiters expect a scannable timeline without opening a PDF.

**Files:** `components/About.tsx`, `data/portfolio.json` (minor copy edits).

### 3.1 Thesis pull-quote (the brand's one prominent placement)

Open the prose column with a set-off quote (accent left border, larger type — reuse the
`border-l-2 border-accent pl-4` idiom already used in Contact):

> **"In a system with more than one implementation there is no ground truth — only
> witnesses that disagree. So: trust no single witness."**

Then tighten the three paragraphs to remove hero overlap (Phase 1.2). Suggested flow:

- ¶1 — the method: "That's the whole method. I make the witnesses disagree under
  controlled conditions: coverage-guided differential fuzzers that run Ethereum's
  execution clients, post-quantum cryptography libraries, and compilers against each
  other, so every divergence becomes a reproducible bug report."
- ¶2 — the practice (EF role, hard-fork readiness, bounty triage, the AI pipelines with
  the existing "auditable logs and human review at the decision points" hedge — keep that
  phrasing verbatim, it is exactly the right register).
- ¶3 — the roots (Ph.D. TU Berlin, Solidity fuzzing infrastructure, OSS-Fuzz) — one
  sentence shorter than today; the timeline below now carries the history.

This is the **only** prominent placement of the aphorism. Do not repeat it elsewhere on
the homepage (restraint is part of the brand). "A green checkmark is an agreed-upon
guess" stays as the blog post title / talk close only.

### 3.2 Experience & Education timeline (new)

Add below the prose/expertise grid, before Technologies — compact, list-style (no cards):

- Two columns on `md+`: **Experience** (4 entries) and **Education** (3 entries), rendered
  from `portfolio.json` `experience` / `education`.
- Row format: `period` in `font-mono text-xs text-faint` + title/company in
  `text-fg font-medium` + one-line description in `text-sm text-muted`. Border-top
  hairlines between rows (match Talks list styling).
- Keep descriptions to one line each; current JSON copy is fine. Optional trim: the
  Ittiam entry description → "VoIP phone software and tests."
- Keep the CV download button adjacent (it currently lives in the right column — move it
  to sit directly under the timeline so the scan path is timeline → full CV).

### 3.3 Manual task (owner)

- **Regenerate/refresh `public/media/Bhargava_Shastry_CV.pdf`** so it reflects the 2026
  work (Mbed TLS advisory, PQC series, AI-triage pipelines, SolSmith paper) — with the CV
  promoted to a hero CTA, a stale PDF would undercut the whole phase.

### Acceptance criteria

- A recruiter can reconstruct role history + education without opening the PDF.
- Pull-quote appears exactly once on the homepage; About prose shares no full sentence
  with the hero.

---

## Phase 4 — "Work with me" → professional front door (P1)

**Why:** The section currently reads as a consulting funnel with the collaborator path
buried inside the security-warning paragraph. Employability-first inverts the order:
open door first, engagements second — which also makes the consulting offer read *less*
sales-shaped (the stated failure mode).

**Files:** `components/Contact.tsx`.

### 4.1 Reorder and reframe

New section flow:

1. **Section intro** (replaces the current consulting-first intro):
   > I'm a security engineer at the Ethereum Foundation. Beyond that, I'm glad to hear
   > about roles and teams working on hard verification problems, research collaboration,
   > conference talks, and podcasts — no formality needed, just email.
   Followed by the plain-email line and LinkedIn/CV links (promote the existing
   "Prefer plain email?" line into this block).
2. **Referenceability line** (new, one sentence — public record as third-party validation):
   > My work has been merged upstream by the Nethermind, Erigon, revm, Mbed TLS, and
   > Solidity teams — the review threads are public.
3. **Engagements sub-block** (demoted to second position, retitled eyebrow e.g.
   "Independent engagements — limited"): the three engagement cards, each gaining
   mechanics (4.2), then good fit / poor fit (unchanged — protect this), then the
   process strip (4.3), then structured-inquiry + PGP buttons (unchanged).
4. **Security-warning paragraph** — keep, but delete "Also open to conference talks,
   podcasts, and research collaboration." from it (that content moved to the intro).
5. Independence disclaimer paragraph — keep here (this is the placement that matters).

### 4.2 Engagement cards gain mechanics

Pattern (owner fills real durations; the point is that *a* number exists):

> **Differential-testing diagnostic** · ~2 weeks, fixed scope
> For teams that suspect cross-implementation or oracle risk.
> **You get:** a divergence/threat model, a target matrix, a harness and coverage
> roadmap, and a prioritized-risk debrief — the same artifact structure as the case
> studies above.

Apply the same `title · duration / audience / You get:` shape to the review and workshop
cards.

### 4.3 Process strip + expectations line

Four steps, rendered as a compact numbered row (mono numerals, hairline separators —
match the existing eyebrow aesthetic):

> **01 Inquiry → 02 Conflict check → 03 Scoped proposal → 04 Delivery & debrief**

Below it, one line (owner fills N and quarter; keep honest):

> I reply to inquiries within N business days. Next availability: Qx 2026.

The conflict check as step 2 *of the process* converts the employment constraint into a
trust feature. If availability is genuinely unknown, omit the second sentence rather than
inventing a window.

### Acceptance criteria

- First thing a reader meets in the section is the open door (roles/collaboration/talks),
  not the engagement cards.
- Every engagement card answers "how long" and "what do I get".
- The security-warning paragraph contains only security instructions.

---

## Phase 5 — Congruence & density pass (P1)

Small independent fixes; batch into one PR.

### 5.1 Fonts: kill the Google Fonts request (credibility-aligned)

Current state: `app/layout.tsx` already loads Inter via `next/font/google` (self-hosted at
build), **and** `app/globals.css:5` *also* `@import`s Inter + JetBrains Mono from
`fonts.googleapis.com` — so every visitor pings Google (GDPR-relevant for a
privacy-conscious security site) and Inter is double-loaded.

- Delete the `@import` line from `globals.css`.
- In `layout.tsx`, add `JetBrains_Mono` from `next/font/google` alongside Inter; expose
  both as CSS variables (`variable: '--font-inter'` / `'--font-jetbrains-mono'`), put the
  variable classes on `<html>`.
- In `tailwind.config.js` `fontFamily`, change to
  `sans: ['var(--font-inter)', 'system-ui', 'sans-serif']`,
  `mono: ['var(--font-jetbrains-mono)', 'monospace']`.
- Verify with devtools: zero requests to `fonts.googleapis.com` / `fonts.gstatic.com`;
  mono renders in eyebrows/chips (weights 400/500 only were used — confirm chip/eyebrow
  weights unchanged).

### 5.2 Case studies: promote the punchline

In `components/CaseStudies.tsx`, the `demonstrates` field is set in
`font-mono text-xs text-faint` — the least legible style on the site for the most
important sentence. Give it its own line above the evidence links: eyebrow label
"Demonstrates" + body in `text-sm text-muted`. Evidence links stay on their own row.

### 5.3 Nav: rename "Pubs"

`components/Header.tsx`: `Pubs` → `Papers` (keeps width tight; "Publications" would crowd
the 8-item row). Section title stays "Publications".

### 5.4 Footer: one plain sentence

Replace the footer brand paragraph (currently the third verbatim mission statement) with:

> Security engineer at the Ethereum Foundation. I test systems where independent
> implementations must agree.

Keep the footer independence disclaimer (hero copy removed in Phase 1; final state =
Work-with-me + footer only).

### Acceptance criteria

- No third-party font requests; Lighthouse performance unchanged or better.
- "Demonstrates" line readable at a glance; nav fits one row at 768 px.

---

## Phase 6 — Evidence presentation: findings hierarchy, talks dedupe, publications flatten (P2)

**Files:** `components/Findings.tsx`, `components/Talks.tsx`, `components/Publications.tsx`,
`data/portfolio.json`.

### 6.1 Findings ledger hierarchy

Ten identical cells give a confirmed-exploitable advisory the same weight as a
harness-alignment fix. Keep the hairline-grid ledger, add one tier:

- First 2–3 entries (advisory → SolSmith paper → cross-client fixes cluster) get
  `md:col-span-2` full-width rows with a thin `border-t-2 border-accent`, slightly larger
  title (`text-lg`). Remaining entries keep the current 2-col cells.
- Data change: add `"featured": true` to the top entries in `portfolio.json` rather than
  relying on array position alone.
- Ordering rule stays "data file is the curation" (as in `Projects.tsx`).

### 6.2 Talks: merge the triplicate

Three entries titled "Fuzzing the Solidity Compiler" make 7 talks read like 4. Restructure
the data so one entry carries multiple venues:

```json
{
  "title": "Fuzzing the Solidity Compiler",
  "venues": [
    { "venue": "Devcon 5", "location": "Osaka", "year": 2019,
      "slides": "/media/Fuzzing_Solidity.pdf", "video": "https://youtu.be/cAU5NbrXst0" },
    { "venue": "EthCC 3", "location": "Paris", "year": 2020,
      "slides": "/media/Fuzzing_Solidity_EthCC3.pdf" },
    { "venue": "FuzzCon EU", "year": 2020,
      "slides": "/media/Fuzzing_Solidity_FuzzconEU.pdf" }
  ],
  "summary": "Threat model: incorrect code generation. Randomly generated valid Solidity/Yul programs stress the compiler's codegen and optimizer before releases ship — nine bugs found via semantic fuzzing."
}
```

`Talks.tsx` renders venue chips per entry ("Devcon 5 '19 · EthCC 3 '20 · FuzzCon EU '20"),
each chip linking its own slides; the video chip keeps its icon. Migrate the remaining
single-venue talks to the same shape (`venues` array of one) so the component has one code
path. Sort by max year desc — "Trust No Single Witness" (2026) stays on top.

### 6.3 Publications: flatten to citation list

Card-per-paper is a marketing idiom; academics use lists. Replace the bordered cards with
a flat list (border-t hairlines between rows, like Talks): linked title, authors
`text-sm text-muted`, venue in accent, award chip preserved (Best Paper must stay
visually distinct). Keep the era groupings. Saves roughly a full screen of scroll.

### Acceptance criteria

- Advisory and paper visually dominate the findings section.
- Talks list shows 5 rows, no duplicate titles; every slide deck still reachable.
- Publications section ≥ 30% shorter; award chip preserved.

---

## Phase 7 — POV consolidation: the canonical "witnesses" page (P2)

**Why:** The distinctive POV exists in three scattered phrasings (About clause, talk
title, blog post title). Ownership requires one canonical URL people can cite. As a
thought-leadership asset this serves employability directly (it's what a hiring manager
forwards to their team).

**Files:** new `app/witnesses/page.tsx` (or a pinned essay in `content/posts/` with slug
`trust-no-single-witness` — prefer the blog route: it inherits styling, OG images, RSS).

### 7.1 The essay (~800 words, one canonical statement)

Structure:

1. The thesis (the pull-quote, expanded): no ground truth in multi-implementation
   systems; only witnesses; make them disagree under controlled conditions.
2. The corollary: "a green checkmark is an agreed-upon guess" — link the existing
   testing-oracles post as the deep dive.
3. Instances, each one paragraph linking existing artifacts:
   Ethereum clients (case study 1), post-quantum crypto (ML-KEM series), compilers
   (SolSmith paper), and AI-era triage (three-witness severity model, Trust No Single
   Witness slides).
4. Close: what this predicts about testing AI systems (the LLM-as-judge angle from the
   oracle post) — the forward-looking hook.

### 7.2 Wiring

- About pull-quote (Phase 3.1) links to the essay ("the long version").
- Blog index: pin it at top as "Start here".
- Talks: the Trust No Single Witness entry links the essay alongside slides.
- Blog convention going forward (editorial habit, not code): each differential-testing
  post closes by naming *which witnesses disagreed and what the oracle was* — the
  recognizable signature move across the body of work.

### Acceptance criteria

- One URL that states the whole POV, linkable from bios/slides; reachable in ≤ 1 click
  from About, blog index, and the flagship talk entry.

---

## Explicitly deferred / not doing

- **No testimonials, logos, or client lists** — conflicts with disclosure norms; the
  merged-PR record (Phase 4.1) is the substitute.
- **No pricing on the site** — budget-band stays a field in the structured inquiry.
- **No hero tagline plastering** — the aphorism appears once (About) + the essay.
- **No design-system change** — palette, hairline grids, mono eyebrows, dark default all
  stay exactly as they are.
- **No new nav items** — the witnesses essay lives under Blog; 8 nav items is the max.

---

## Rollout order & effort summary

| # | Phase | Priority | Effort | Ships as |
|---|---|---|---|---|
| 1 | Hero rework | P0 | ~2–3 h | PR 1 |
| 2 | Stats row | P0 | ~1 h | PR 1 (same viewport) |
| 3 | About: pull-quote + timeline | P0 | ~2–3 h + CV refresh (manual) | PR 2 |
| 4 | Work-with-me front door | P1 | ~2 h + owner fills durations/availability | PR 3 |
| 5 | Congruence pass (fonts, punchline, nav, footer) | P1 | ~1–2 h | PR 4 |
| 6 | Findings/talks/pubs presentation | P2 | ~3 h | PR 5 |
| 7 | Witnesses essay | P2 | writing-bound (~half day) | PR 6 |

**Owner inputs needed before the relevant phase ships:** refreshed CV PDF (Phase 3),
engagement durations + reply-time + availability window or the decision to omit
(Phase 4), essay draft review (Phase 7).

## Final QA checklist (after Phase 5 and again after Phase 7)

- [ ] 375 px / 768 px / 1280 px, light + dark: no overflow, hero fits first viewport
- [ ] Zero requests to fonts.googleapis.com / fonts.gstatic.com
- [ ] Every hero/stat/finding link resolves (run a link check over portfolio.json URLs)
- [ ] Lighthouse: performance and a11y not regressed
- [ ] `npm run lint` and `npm run build` clean; CI green
- [ ] Claims audit: every number on the page traceable to a public artifact; "EVM
      implementations" vs "clients" wording correct; no phrase repeated verbatim across
      hero/About/footer
