# Web3 Security Intelligence Crawler

A tiny, zero-dependency Node crawler that mines public APIs for pressing Web3
security problems and produces **one-page compelling briefs** you can turn into
blog posts. The goal is to raise the site's visibility by publishing on live,
pressing issues people are actually talking about — with evidence.

## What it does

1. **Crawls** six public sources (no auth required):
   - Hacker News (Algolia API)
   - Reddit (`.json` endpoints, multiple subreddits)
   - Ethereum Stack Exchange (Stack Exchange API v2.3)
   - GitHub Security Advisories (global advisory DB)
   - GitHub Issues search (filtered to known Web3 orgs)
   - Ethereum Magicians forum (Discourse `/latest.json`)
2. **Normalizes** every hit into a common `Signal` shape.
3. **Clusters** signals into a curated Web3 security problem taxonomy
   (see `lib/vocabulary.mjs`).
4. **Ranks** clusters by cross-source breadth, volume, recency, engagement,
   and source authority.
5. **Writes** the top 5–6 problems as Markdown one-pagers plus a structured
   JSON report.

## Outputs

All outputs land in `data/web3-intel/`:

```
data/web3-intel/
  latest.json               # structured top-N report
  report-latest.md          # human-readable combined report
  report-YYYY-MM-DD.md      # dated snapshot
  briefs/<cluster-id>.md    # one-page brief per top cluster
  raw/<source>.json         # per-source raw signals (for debugging)
```

Each brief contains:

- **TL;DR** — one-sentence problem statement
- **Why it's pressing** — breadth / volume / recency / engagement bullets
- **Who is affected** — personas
- **Evidence** — top signals with links and engagement metrics
- **Proposed solution angles** — seeds for the blog post
- **Blog hook** — suggested opening sentence
- **Sources referenced** — transparent source tally

## Running it

```bash
# Fast mode — last 60 days, top 6 problems (default)
npm run intel

# Explicit flags
node tools/web3-intel/run.mjs --since-days 30 --limit 5

# Run against a subset of sources (useful while iterating on a fetcher)
node tools/web3-intel/run.mjs --only hackernews,reddit
```

No API keys are required. Every public endpoint used here is free to hit
anonymously; we send a descriptive `User-Agent`, cap request rates with small
sleeps, and retry with exponential backoff on 429/5xx.

## Design notes

- **Zero new npm dependencies.** Native `fetch`, `AbortController`, and
  `fs/promises` are enough. This keeps the blog's dependency surface minimal.
- **Every source is optional.** If a source fails, the crawler logs the error
  and continues. An offline / sandboxed run still produces valid output
  (possibly with zero signals).
- **Deterministic templating.** The crawler never calls an LLM. It surfaces
  and ranks evidence; you write the prose. That means reruns are reproducible
  and the tool has no hidden API cost.
- **Vocabulary-driven clustering.** `lib/vocabulary.mjs` is a curated list of
  Web3 security problem categories. Add a new cluster by appending an entry
  with tight, specific keywords — don't broaden existing ones.
- **Rate limits are conservative.** The GitHub search API unauth'd limit is
  the tightest (10 req/min); we only issue 3 queries there and sleep 2s
  between them.

## Turning a brief into a blog post

Every brief is designed to be a 30-minute-to-draft post:

1. Open `data/web3-intel/briefs/<id>.md`.
2. Use the **Blog hook** as your opener.
3. Use **Why this is pressing** as your lede — the evidence is already cited.
4. Use **Proposed solution angles** as the skeleton of your solution section.
5. Add your own research, opinions, and any code samples.
6. Save the draft to `content/posts/<slug>.md` with standard frontmatter.

The crawler gives you the problem; you bring the point of view.

## Adding a new source

1. Add a new exported fetcher in `lib/sources.mjs` that returns
   `{ signals, error? }`.
2. Register it in the `SOURCES` array at the bottom of that file.
3. (Optional) Give it a source-authority multiplier in `lib/score.mjs`.
4. Run `node tools/web3-intel/run.mjs --only your-source` to iterate.

Keep fetchers boring — no new deps, no weird retry logic beyond what
`fetch.mjs` already does, and always degrade gracefully when the remote
endpoint returns garbage.

## Scheduling

The existing `.github/workflows/weekly-rebuild.yml` rebuilds the site every
Monday. To surface fresh intel on every rebuild, add a step that runs
`npm run intel` before `npm run build`. For now the crawler runs on demand so
you can review its output before committing.
