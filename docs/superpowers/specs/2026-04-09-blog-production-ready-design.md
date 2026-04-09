# Blog Production-Readiness — Design

**Date:** 2026-04-09
**Branch:** `migrate_blog`
**Status:** Approved (user), pending spec review
**Scope level:** Solid (see Section 0)

## Problem

The blog repo (Next.js 14 portfolio + blog, static export to GitHub Pages) is mid-migration from Jekyll. The user described it as "not production ready and quite a mess." Investigation confirmed a broken blog rendering pipeline and a large collection of smaller production-readiness gaps.

### Specific issues found

**Critical — broken functionality:**
1. Blog posts never render real content. `app/blog/[slug]/page.tsx` constructs a hardcoded "This blog post is currently being migrated... The full content will be available soon" placeholder and dumps it via `whitespace-pre-line` — no markdown parser, and the `content` field in `data/blog.json` stores a path string (`"legacy-archive/_posts/..."`) that is never read.
2. No markdown library in the dependency tree. Even loaded, content has nothing to parse it.
3. Footer "Google Scholar" link is broken: `https://scholar.google.com/citations?user=Bhargava Shastry` contains a literal space. The correct URL (provided by user) is `https://scholar.google.com/citations?hl=en&authuser=2&user=lsdZxf8AAAAJ`.

**Production-readiness gaps:**
4. No `lint` script in `package.json` (ESLint is installed but unused).
5. No Prettier, no CI quality gate.
6. Deprecated `@next/font` dependency (already replaced in source by `next/font`).
7. `tsconfig.json` has `target: "es5"`, wildly stale for a Next 14 app.
8. No `robots.txt`, `sitemap.xml`, OG image, or favicon/app icons.
9. `app/page.tsx` is marked `'use client'` for the entire homepage just to track scroll position — kills SSR/SSG.

**Accessibility / UX:**
10. Header nav items ("Home", "About", "Projects", "CV", "Contact") are `<button>` elements with scroll handlers instead of `<a href="#...">` links — hurts a11y, deep linking, and SEO.
11. Social icon links in `Header.tsx`, `Contact.tsx`, `Footer.tsx` have no `aria-label`.
12. No "Blog" link in the header nav at all (only in the footer).

**Repo clutter:**
13. `.sass-cache/`, `tmp` (file at root), `.idea/` — stale artifacts.
14. Five overlapping top-level docs: `ARCHITECTURE.md`, `DEPLOYMENT_GUIDE.md`, `GITHUB_PAGES_DEPLOYMENT_GUIDE.md`, `MAINTENANCE_GUIDE.md`, `MIGRATION_GUIDE.md`. No `README.md` exists.
15. Untracked `memory-bank/` directory.
16. `legacy-archive/` — contains the 20 real markdown posts we need to migrate, so not pure cruft, but should be removed after migration is verified.

**CI/CD:**
17. `.github/workflows/deploy.yml` only triggers on `master` branch, hasn't run in ~1 year, uses Node 18, has no quality gates, and runs deploy steps on `pull_request` (which fail due to Pages environment protection).
18. GitHub Pages "Source" at the repo level is already correctly set to "GitHub Actions" (verified by user), so no manual repo-settings change is required.

---

## Section 0 — Scope

User selected the **Solid** scope tier (of three offered: Minimum viable / Solid / Comprehensive).

**In scope:**
- Real blog rendering pipeline with code highlighting and typography styling
- Bug fixes (Scholar URL, missing Blog nav link)
- Accessibility pass (nav semantics, aria-labels)
- SEO basics (robots.txt, sitemap.xml, OG image, favicon/app icons)
- Repo cleanup (remove stale artifacts, consolidate docs into single `README.md`)
- Quality tooling (Prettier, lint script, typecheck script, `check` composite script)
- CI workflow (typecheck + lint + format:check + build on every push/PR)
- Deploy workflow rewrite (deploy only on push to `master`)
- Homepage SSR restoration (narrow the `'use client'` boundary)

**Explicitly out of scope:**
- Unit tests (would be Scope C "Comprehensive")
- Playwright / E2E tests (C)
- A11y auto-testing in CI (C)
- Lighthouse CI / perf budgets (C)
- Visual regression testing (C)
- Husky / lint-staged pre-commit hooks (user can add later)
- Commitlint / conventional commits (single-author project, not worth it)
- Contact form backend (staying with `mailto:` — simple, static-export compatible)
- Removing `legacy-archive/` (keep until migration is verified; delete in a follow-up)
- Renaming `master` → `main` (not part of this work)

---

## Section 1 — Blog content pipeline

### Library choice: `gray-matter` + `remark`/`rehype`

Three options were considered:
- **Chosen: `gray-matter` + remark/rehype pipeline.** Industry-standard static markdown processing. Frontmatter via `gray-matter`, GFM via `remark-gfm`, syntax highlighting via `rehype-pretty-code` (Shiki-backed, same engine as VS Code), HTML output via `rehype-stringify`. Runs at build time in a Server Component. Fully static-export compatible. No runtime markdown library ships to the browser.
- **Rejected: `next-mdx-remote`.** Overkill — posts are static research content with no need for React components in markdown, and it adds runtime JS.
- **Rejected: `@next/mdx`.** Would require rewriting posts as `.mdx` page files and abandoning the dynamic `[slug]` route architecture. Big refactor, no gain here.

### New dependencies

```
"gray-matter"         ^4.0.3
"remark"              ^15.x
"remark-gfm"          ^4.x
"remark-rehype"       ^11.x
"rehype-pretty-code"  ^0.13.x
"rehype-stringify"    ^10.x
"shiki"               ^1.x          (peer of rehype-pretty-code)
"@tailwindcss/typography" ^0.5.x
```

### File layout

```
content/
  posts/
    2017-07-24-fuzzing-openvswitch.md         ← moved + renormalized from legacy-archive/_posts/
    2017-08-02-diagnosing-distributed-vulnerabilities.md
    ... (20 posts total)
lib/
  blog.ts                                      ← NEW: getAllPosts(), getPostBySlug(), markdown→HTML pipeline
data/
  blog.json                                    ← DELETED (metadata now read from frontmatter)
app/blog/
  page.tsx                                     ← refactored to read from lib/blog
  [slug]/
    page.tsx                                   ← refactored: async Server Component, real content
    BlogPostClient.tsx                         ← simplified: only Share button client island
```

### `lib/blog.ts` API

```ts
export interface BlogPost {
  slug: string
  title: string
  date: string          // ISO 8601
  excerpt: string
  tags: string[]
  readTime: string      // derived from word count
  contentHtml: string   // parsed and highlighted HTML
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
}

export function getAllPostsMeta(): BlogPostMeta[]   // for index page, no content
export function getPostBySlug(slug: string): BlogPost | null
export function getAllSlugs(): string[]             // for generateStaticParams
```

Implementation notes:
- `getAllPostsMeta()` reads all `content/posts/*.md`, extracts frontmatter via `gray-matter`, sorts by date descending, returns metadata only (no content parsing → fast).
- `getPostBySlug()` reads one file, extracts frontmatter, pipes body through `remark/rehype` pipeline, returns full post.
- `readTime` derivation: `Math.ceil(wordCount / 200)` (200 wpm average), formatted as `"N min read"`.
- All functions run at build time (Node.js `fs` in Server Components is fine for `output: 'export'`).

### Frontmatter normalization

Source posts in `legacy-archive/_posts/` use Jekyll-style frontmatter with inconsistent fields. During migration we'll normalize each to:

```yaml
---
title: Fuzzing OpenvSwitch
date: 2017-07-24
excerpt: Exploring fuzzing techniques for OpenvSwitch, a production-grade multilayer virtual switch...
tags: [fuzzing, networking, openvswitch, security]
---
```

Slug is derived from filename (`2017-07-24-fuzzing-openvswitch.md` → `fuzzing-openvswitch`). Files are renamed to lowercase-slug-first convention during the move.

### Rendering

- Index page (`/blog`): reads `getAllPostsMeta()`, renders existing card UI. Search + tag filter remain client-side (fine — data is small).
- Post page (`/blog/[slug]`): async Server Component that calls `getPostBySlug(params.slug)`, passes `contentHtml` to `BlogPostClient`. The client component injects via `dangerouslySetInnerHTML` wrapped in `prose prose-lg` Tailwind Typography classes. Share button stays as client-side interaction.
- `generateStaticParams()` uses `getAllSlugs()`.

### Security note

`dangerouslySetInnerHTML` is safe here: content is author-controlled (own markdown files in the repo) and passes through a sanitizing rehype pipeline. No user-supplied HTML. Not using `dangerouslySetInnerHTML` would require either shipping an MDX runtime or a heavier React-based renderer for zero benefit.

---

## Section 2 — Bug fixes, cleanup, SEO

### Bug fixes

- **Google Scholar URL.** Replace broken URL in `components/Footer.tsx` with `https://scholar.google.com/citations?hl=en&authuser=2&user=lsdZxf8AAAAJ`.
- **Nav header missing Blog.** Add "Blog" entry to `components/Header.tsx` navigation. Since `/blog` is a separate route, render as `<a href="/blog">` (not a scroll target).
- **Header nav semantics.** Convert "Home/About/Projects/CV/Contact" from `<button onClick={scrollTo}>` to `<a href="#section-id">`. Smooth scrolling is preserved via `scroll-smooth` already on `<html>`. Deep linking works, crawlers follow links, a11y tree is correct.
- **Icon-link aria-labels.** Every icon-only anchor in `Header.tsx`, `Contact.tsx`, `Footer.tsx` gets an `aria-label` describing the destination (e.g., `aria-label="GitHub profile"`).
- **Homepage `'use client'` boundary.** Narrow the boundary: create `components/ScrollSpy.tsx` (client component) that handles scroll-position tracking and passes the active section to `Header`. `app/page.tsx` becomes a Server Component that composes server-rendered sections + a thin client island for the Header/ScrollSpy.

### Repo cleanup

- **Delete:**
  - `.sass-cache/` (Jekyll era)
  - `tmp` (root file — looks like a text-editor swap leftover)
  - `.idea/` (IDE config, already in `.gitignore` but committed)
- **`.gitignore` additions:** `memory-bank/` (Claude-specific, should not be committed).
- **Remove dep:** `@next/font` from `package.json` (unused; emits a deprecation warning).
- **`tsconfig.json`:** change `target: "es5"` → `target: "es2020"`. Everything else untouched.
- **Documentation consolidation:**
  - Create `README.md` with sections: Overview, Stack, Local Development, Content (blog), Deployment, Architecture, Maintenance.
  - Delete `ARCHITECTURE.md`, `DEPLOYMENT_GUIDE.md`, `GITHUB_PAGES_DEPLOYMENT_GUIDE.md`, `MAINTENANCE_GUIDE.md`, `MIGRATION_GUIDE.md`.
  - Preserve any still-relevant content (re-synthesized and condensed in the new README; outdated migration/transitional content is dropped).
- **`legacy-archive/`:** leave in place for this PR. Removed in a separate follow-up commit after blog migration is verified live.

### SEO assets

- **`app/robots.ts`** — Next.js App Router convention file. Emits `robots.txt` allowing all bots, referencing sitemap URL.
- **`app/sitemap.ts`** — Dynamically generates `sitemap.xml` at build time. Includes `/`, `/blog`, `/privacy`, `/terms`, and all `/blog/[slug]` routes.
- **Favicon and app icons** — `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`. The design: a monospaced `>_` terminal cursor inside an Ethereum diamond silhouette. SVG source is the canonical master; PNG/ICO are derived. Small enough to be legible at 16px.
- **OG image** — `app/opengraph-image.tsx` (Next.js convention) uses `ImageResponse` to generate a dynamic 1200×630 PNG at build. Contains: name, title ("Security Engineer & Researcher"), one-line tagline, subtle Ethereum-diamond background motif consistent with favicon.
- **Metadata updates in `app/layout.tsx`:**
  - Add `metadataBase: new URL('https://bshastry.github.io')`
  - Explicit canonical URL in OpenGraph block
  - Twitter card uses the new OG image

---

## Section 3 — Tooling, quality gates, CI

### `package.json` scripts

```json
{
  "dev":          "next dev",
  "build":        "next build",
  "start":        "next start",
  "lint":         "next lint",
  "lint:fix":     "next lint --fix",
  "format":       "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck":    "tsc --noEmit",
  "check":        "npm run typecheck && npm run lint && npm run format:check"
}
```

Removed: the old `export` script (deprecated — `next export` no longer exists in Next 14; `output: 'export'` in `next.config.js` already handles it). Removed: the old `deploy` script (not needed — CI handles deploy).

### New dev dependencies

```
"prettier"                       ^3.x
"prettier-plugin-tailwindcss"    ^0.5.x
"@tailwindcss/typography"        ^0.5.x     (also used by Section 1)
```

### Config files

- **`.prettierrc.json`:**
  ```json
  {
    "semi": false,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "plugins": ["prettier-plugin-tailwindcss"]
  }
  ```
- **`.prettierignore`:**
  ```
  node_modules
  .next
  out
  package-lock.json
  legacy-archive
  content/posts
  ```
  (Don't reformat migrated markdown — preserve authored layout.)
- **`.eslintrc.json`:**
  ```json
  {
    "extends": ["next/core-web-vitals"],
    "rules": {
      "no-unused-vars": "warn"
    }
  }
  ```

### CI workflow — `.github/workflows/ci.yml` (NEW)

Triggers: `push` and `pull_request` to **any** branch.

```yaml
name: CI
on:
  push:
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check
      - run: npm run build
```

### Deploy workflow — `.github/workflows/deploy.yml` (REWRITTEN)

Triggers: `push` to `master` only. No `pull_request` trigger (avoids noisy failures from Pages environment protection).

```yaml
name: Deploy
on:
  push:
    branches: [master]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## Section 4 — Build & verify loop

This design is executed through an iterative dev loop backed by `claude-in-chrome`. The dev server (`next dev`) runs in the background; after each significant change, the browser is navigated to the affected route and the accessibility tree + console are inspected. Iteration continues until the rendered output is correct before moving to the next step.

### Work sequence (high-level — detail in implementation plan)

1. **Foundations** — install new deps, add Prettier/ESLint config, update `tsconfig`, remove `@next/font`, add `@tailwindcss/typography`, tailwind config.
2. **Blog content pipeline** — create `lib/blog.ts`, normalize and move posts to `content/posts/`, refactor both blog routes, delete `data/blog.json`.
3. **Bug fixes + a11y** — Scholar URL, add Blog nav link, convert nav `<button>`→`<a>`, add aria-labels, narrow `'use client'` boundary with `ScrollSpy`.
4. **SEO + icons** — `robots.ts`, `sitemap.ts`, favicon SVG/PNG/ICO, OG image, layout metadata updates.
5. **Repo cleanup** — delete stale artifacts, consolidate 5 docs into `README.md`, update `.gitignore`.
6. **CI workflows** — add `ci.yml`, rewrite `deploy.yml`.
7. **Final verification** — walk every page in the browser, run `npm run check`, run `npm run build`, inspect `/out` for issues.

### Commit strategy

Small, focused commits per step — not one giant mega-commit. Each commit should leave the tree green (builds, typechecks, passes format/lint). This preserves bisectability and makes review easier.

### Verification checkpoints

Each step ends with:
- Browser navigation to the affected page(s)
- Accessibility tree inspection
- Console error check
- Explicit "looks right" confirmation before moving on

### Manual step deferred to user

After merge to `master`: confirm `https://bshastry.github.io/` reflects the new site after the Deploy workflow runs. (Pages Source is already "GitHub Actions"; no settings change needed.)

---

## Success criteria

1. Every blog post renders parsed HTML from its real markdown source, with syntax-highlighted code blocks and typography styling.
2. `npm run check` exits zero.
3. `npm run build` produces a clean `/out` directory.
4. CI workflow runs and passes on `migrate_blog`.
5. No broken external links (Scholar URL works).
6. Lighthouse-style basics: favicon loads, OG image renders, robots.txt + sitemap.xml present.
7. Header nav includes Blog; all icon-only links have accessible names; homepage is no longer entirely a client component.
8. Repo contains exactly one markdown doc at root: `README.md`.
9. `/out` deploys successfully to `bshastry.github.io` after merge to `master`.
