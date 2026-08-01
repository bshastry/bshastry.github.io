# Bhargava Shastry — Portfolio & Blog

Personal portfolio and security-research blog for Bhargava Shastry, security engineer at the Ethereum Foundation. Built with Next.js 15 (App Router) and deployed as a static site to GitHub Pages at [bshastry.github.io](https://bshastry.github.io).

## Stack

- **Framework:** Next.js 15 (App Router) with `output: 'export'` for static HTML
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `@tailwindcss/typography` for long-form prose
- **Content:** Blog posts live in `content/posts/*.md`; metadata via frontmatter
- **Markdown pipeline:** `js-yaml` front matter + `remark` + `remark-gfm` + `remark-rehype` + `rehype-slug` + `rehype-autolink-headings` + `rehype-pretty-code` (Shiki) + `rehype-stringify`
- **Icons:** `lucide-react`
- **Hosting:** GitHub Pages via GitHub Actions
- **Machine-readable trust:** Evidence-linked JSON claims with a deployment-generated Sigstore bundle
- **Quality gates:** Prettier, ESLint (`next/core-web-vitals`), `tsc --noEmit`, all enforced in CI

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server hot-reloads on change.

## Scripts

| Command                      | Purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `npm run dev`                | Local dev server with HMR                                       |
| `npm run build`              | Static export to `out/`                                         |
| `npm run typecheck`          | `tsc --noEmit`                                                  |
| `npm run lint`               | ESLint (`next/core-web-vitals`)                                 |
| `npm run lint:fix`           | ESLint with `--fix`                                             |
| `npm run format`             | Prettier write                                                  |
| `npm run format:check`       | Prettier check (used in CI)                                     |
| `npm run check`              | typecheck + lint + formatting + claims + PGP validation         |
| `npm run check:claims`       | Validate the claims contract, evidence shape, and freshness     |
| `npm run check:claims:links` | Audit built same-origin claims/llms links and anchors           |
| `npm run check:pgp`          | Verify the published PGP key and retired Keybase references     |
| `npm run check:links`        | Internal-link audit over `out/` (run after `build`; used in CI) |

## Writing a blog post

1. Add a new markdown file to `content/posts/<slug>.md`.
2. Include YAML frontmatter:
   ```yaml
   ---
   title: 'Your Post Title'
   date: 2026-04-09
   excerpt: 'One-line summary for the blog index card and meta description.'
   tags: [tag1, tag2, tag3]
   ---
   ```
3. Write the body as standard markdown. Code fences support language hints; Shiki renders them with the `github-dark-dimmed` theme. Headings automatically receive id anchors for deep linking.
4. Read time is computed automatically from word count.
5. Commit and push. CI runs `npm run check` and `npm run build`.

## Architecture

```
app/
  layout.tsx              Root layout + metadata + fonts
  page.tsx                Server-rendered homepage (composes components)
  not-found.tsx           Branded 404 with routes back into the evidence pages
  blog/
    page.tsx              Blog index (server component)
    BlogIndexClient.tsx   Client-side search/filter
    [slug]/
      page.tsx            Post page (server component)
      BlogPostClient.tsx  Share button + layout
  research/               Full research-area archive (homepage features 5)
  findings/               CVE + Solidity security-relevant bug ledgers
  engagements/            Engagement index + evidence-backed service detail routes
  recruiter-brief/        Concise hiring-team route through fit and evidence
  bugs/                   No-index legacy alias for /findings
  privacy/, terms/        Static legal pages
  feed.xml/               RSS feed generator
  robots.ts               robots.txt generator
  sitemap.ts              sitemap.xml generator
  icon.svg                Favicon (terminal prompt in ETH diamond)
  opengraph-image.tsx     Dynamic OG image for social shares

components/
  Header, Hero, About, Projects (featured research), ResearchGrid,
  Findings, DisclosureLedger, Talks, Writing, Publications, Contact, Footer
  (CV download lives in About)

content/posts/            Blog markdown files

docs/
  distribution-playbook.md  Channel selection, profile copy, and measurement cadence
  verifiable-claims.md      Claims trust model, verification, and maintenance

lib/
  blog.ts                 Markdown parsing pipeline
  disclosures.ts          CVE and Solidity known-bug ledgers + aggregates
  engagements.ts          Shared offers, detailed scopes, evidence links, enquiry builder
  seo.ts                  Site constants, canonical/RSS alternates, JSON-LD serializer

data/
  portfolio.json          CV, research themes, findings, talks, publications

public/
  llms.txt                Curated agent-readable site index
  pgp-key.asc             Verified OpenPGP public key for sensitive contact
  .well-known/claims.json  Evidence-linked professional claims
  .well-known/claims.schema.json  JSON Schema for the claims document
  .well-known/security.txt  RFC 9116 vulnerability-report contact (has an Expires date — renew yearly)
  <year>/.../*.html       Legacy Jekyll article redirects

scripts/
  check-claims.mjs        CI gate: validates schema, source facts, links, and expiry
  check-links.mjs         CI gate: fails the build on broken internal links in out/
```

## Deployment

Hosted at [bshastry.github.io](https://bshastry.github.io). Deployment is automated via GitHub Actions:

- **`.github/workflows/ci.yml`** runs on every push and PR to any branch. It
  checks types, lint, formatting, claims, the production build, and internal
  links to catch regressions before merge.
- **`.github/workflows/deploy.yml`** runs only on push to `master`. It signs
  `claims.json` with the workflow's keyless GitHub Actions identity, verifies
  the Sigstore bundle, builds the static site, and publishes `out/` to GitHub
  Pages.

### Repo-level settings (one-time)

Verify: **Settings → Pages → Source = "GitHub Actions"** (already set).

No custom domain is configured; the site serves from the default `bshastry.github.io` root.

## Maintenance

- **Dependencies:** Update periodically with `npm outdated` + `npm update`. For major bumps (Next.js, Tailwind), test thoroughly in a branch first.
- **Legacy continuity:** Keep the static redirect files under `public/` and the `/bugs/` alias when changing routes; external links to the Jekyll-era site still depend on them.
- **Content updates:** Blog posts live in `content/posts/`; portfolio data (projects, CV) lives in `data/portfolio.json`.
- **Claims:** Review `public/.well-known/claims.json` at least yearly, update its
  dates and evidence with any substantive change, and follow
  [`docs/verifiable-claims.md`](docs/verifiable-claims.md).
- **Distribution:** Use [`docs/distribution-playbook.md`](docs/distribution-playbook.md) for
  channel selection, profile alignment, community rules, and the six-week review cadence.

## License

See individual files for any applicable licenses.
