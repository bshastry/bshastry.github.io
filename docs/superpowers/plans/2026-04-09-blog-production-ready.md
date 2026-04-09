# Blog Production-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring a Next.js 14 portfolio + blog to production-ready state: fix the broken blog rendering pipeline, patch bugs, add accessibility, add SEO, clean up the repo, and stand up proper CI/CD.

**Architecture:** Static export to GitHub Pages. Blog posts are real markdown files parsed at build time by a `remark`/`rehype` pipeline with Shiki syntax highlighting. Homepage is server-rendered with a single client island for the sticky header. All quality gates run in CI.

**Tech Stack:** Next.js 14 (App Router, `output: 'export'`), TypeScript, Tailwind CSS, `@tailwindcss/typography`, `gray-matter`, `remark`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`, `rehype-stringify`, `shiki`, Prettier, ESLint, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-04-09-blog-production-ready-design.md`

**Verification model:** This plan deliberately has no unit tests (out of scope per Section 0 of the spec). Each task ends with a **verification step** that combines `npm run check` (typecheck + lint + format), `npm run build` where relevant, and live browser inspection via `claude-in-chrome` against `next dev` running at `http://localhost:3000`.

**Working branch:** `migrate_blog` (already checked out). All commits land here. The separate deploy workflow only triggers on `master`, so CI runs against this branch but nothing publishes until a merge.

---

## File Structure (overview)

**New files:**
```
content/posts/*.md                        # 21 migrated posts (slug-named)
lib/blog.ts                               # markdown parsing pipeline
components/NavMenu.tsx                    # (optional) extracted nav list
app/robots.ts                             # robots.txt generator
app/sitemap.ts                            # sitemap.xml generator
app/icon.svg                              # favicon (terminal cursor in ETH diamond)
app/apple-icon.png                        # iOS home-screen icon
app/opengraph-image.tsx                   # dynamic OG image
.prettierrc.json                          # prettier config
.prettierignore                           # prettier ignore list
.eslintrc.json                            # eslint config
.github/workflows/ci.yml                  # new CI workflow
README.md                                 # consolidated docs
scripts/migrate-posts.mjs                 # one-off migration script (deleted after use)
```

**Modified files:**
```
package.json                              # deps, scripts
tsconfig.json                             # target → es2020
tailwind.config.js                        # typography plugin, content paths
next.config.js                            # metadataBase hint (if needed)
.gitignore                                # add memory-bank/
data/portfolio.json                       # scholar URL fix
app/layout.tsx                            # metadata additions (OG, canonical)
app/page.tsx                              # drop 'use client', become Server Component
components/Header.tsx                     # nav semantics, aria-labels, Blog link, activeSection state
components/Contact.tsx                    # aria-labels on social icons
components/Footer.tsx                     # scholar URL (use full URL directly)
app/blog/page.tsx                         # read from lib/blog
app/blog/[slug]/page.tsx                  # read from lib/blog, parse markdown
app/blog/[slug]/BlogPostClient.tsx        # accept parsed HTML, drop raw text dump
.github/workflows/deploy.yml              # rewrite: master-only, Node 20, build only
```

**Deleted files:**
```
data/blog.json                            # metadata now in frontmatter
.sass-cache/                              # Jekyll artifact
tmp                                       # stale root file
.idea/                                    # committed IDE config
ARCHITECTURE.md
DEPLOYMENT_GUIDE.md
GITHUB_PAGES_DEPLOYMENT_GUIDE.md
MAINTENANCE_GUIDE.md
MIGRATION_GUIDE.md
scripts/migrate-posts.mjs                 # after successful migration
```

**Untouched:**
```
legacy-archive/                           # remains for now; drop in follow-up after deploy verified
components/About.tsx, CV.tsx, Hero.tsx, Projects.tsx
app/privacy/, app/terms/
data/portfolio.json (except scholar field)
```

---

## Task 1: Foundations — dependencies, config, scripts

**Goal:** Get the project's tooling baseline in place before touching any feature code.

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `tailwind.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `.eslintrc.json`
- Modify: `.gitignore`

- [ ] **Step 1.1: Install new runtime and dev dependencies**

Run from repo root:
```bash
npm install gray-matter remark remark-gfm remark-rehype rehype-slug rehype-autolink-headings rehype-pretty-code rehype-stringify shiki unified
npm install -D prettier prettier-plugin-tailwindcss @tailwindcss/typography
npm uninstall @next/font
```

Note: `unified` is the pipeline orchestrator used by `remark`. `next/font` (built-in) is already imported correctly in `app/layout.tsx`; `@next/font` is removed because it's deprecated and unused.

- [ ] **Step 1.2: Update `package.json` scripts**

Replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "check": "npm run typecheck && npm run lint && npm run format:check"
}
```

The old `export` and `deploy` scripts are removed. `next export` is gone in Next 14; `output: 'export'` in `next.config.js` already handles static generation on `next build`.

- [ ] **Step 1.3: Update `tsconfig.json`**

Change `"target": "es5"` to `"target": "es2020"`. Leave every other field unchanged.

- [ ] **Step 1.4: Update `tailwind.config.js`**

Add `@tailwindcss/typography` to the plugins array, and extend `content` to include the new `content/` directory (for any blog-related classes that might appear in rendered markdown). Final file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

(If the existing `tailwind.config.js` has additional theme extensions beyond `primary`, preserve them — read the file first.)

- [ ] **Step 1.5: Create `.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 1.6: Create `.prettierignore`**

```
node_modules
.next
out
package-lock.json
legacy-archive
content/posts
docs/superpowers
```

(Ignoring `docs/superpowers` so formatting plans/specs doesn't break markdown formatting.)

- [ ] **Step 1.7: Create `.eslintrc.json`**

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-unused-vars": "warn",
    "react/no-unescaped-entities": "off"
  }
}
```

(`react/no-unescaped-entities` is disabled because the existing codebase uses apostrophes in JSX text and we're not refactoring text content in this plan.)

- [ ] **Step 1.8: Update `.gitignore`**

Append:
```
# Claude Code memory
memory-bank/
```

- [ ] **Step 1.9: Run format on the whole codebase**

```bash
npm run format
```

Expected: Prettier rewrites existing files (quotes, trailing commas, line widths). Review the diff — if Prettier wants to reformat something destructively, stop and investigate. Otherwise continue.

- [ ] **Step 1.10: Run the full check**

```bash
npm run check
```

Expected: All three steps pass (typecheck, lint, format:check). If typecheck fails due to the `es2020` target change, investigate — typically this should be a no-op improvement.

- [ ] **Step 1.11: Commit**

```bash
git add package.json package-lock.json tsconfig.json tailwind.config.js .prettierrc.json .prettierignore .eslintrc.json .gitignore
# Plus any files Prettier reformatted:
git add -u
git commit -m "$(cat <<'EOF'
chore: Add tooling baseline (prettier, lint scripts, typecheck)

- Add prettier + prettier-plugin-tailwindcss, @tailwindcss/typography
- Add markdown pipeline deps (remark/rehype/shiki/gray-matter)
- Add lint, format, typecheck, check scripts
- Update tsconfig target from es5 to es2020
- Remove deprecated @next/font (layout.tsx already uses next/font)
- Add memory-bank/ to .gitignore
- Format entire codebase with prettier

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Migrate blog content to `content/posts/`

**Goal:** Move the 21 legacy Jekyll posts into `content/posts/` with normalized frontmatter, using `data/blog.json` as the source of metadata truth and the legacy markdown files for body content.

**Files:**
- Create: `scripts/migrate-posts.mjs`
- Create: `content/posts/*.md` (21 files)

- [ ] **Step 2.1: Inspect a legacy post to confirm frontmatter format**

```bash
head -5 legacy-archive/_posts/2017-7-24-Fuzzing-OpenvSwitch.md
```

Expected: Jekyll frontmatter with `layout: post` and `title:` fields, minimal otherwise.

- [ ] **Step 2.2: Write the migration script**

Create `scripts/migrate-posts.mjs`:

```js
#!/usr/bin/env node
// One-off: read data/blog.json, copy each legacy post to content/posts/<slug>.md
// with normalized frontmatter. Deleted after successful migration.

import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')
const blogJson = JSON.parse(
  await fs.readFile(path.join(repoRoot, 'data/blog.json'), 'utf8')
)

const outDir = path.join(repoRoot, 'content/posts')
await fs.mkdir(outDir, { recursive: true })

function stripJekyllFrontmatter(src) {
  // Remove leading --- ... --- block if present
  const match = src.match(/^---\n[\s\S]*?\n---\n?/)
  return match ? src.slice(match[0].length).trimStart() : src
}

function escapeYaml(s) {
  // Quote if contains special chars; double any internal quotes.
  return `"${String(s).replace(/"/g, '\\"')}"`
}

let migrated = 0
for (const post of blogJson.posts) {
  const srcPath = path.join(repoRoot, post.content)
  const raw = await fs.readFile(srcPath, 'utf8')
  const body = stripJekyllFrontmatter(raw)

  const fm = [
    '---',
    `title: ${escapeYaml(post.title)}`,
    `date: ${post.date}`,
    `excerpt: ${escapeYaml(post.excerpt)}`,
    `tags: [${post.tags.map((t) => escapeYaml(t)).join(', ')}]`,
    '---',
    '',
    body,
  ].join('\n')

  const destPath = path.join(outDir, `${post.slug}.md`)
  await fs.writeFile(destPath, fm, 'utf8')
  migrated++
}

console.log(`Migrated ${migrated} posts to content/posts/`)
```

- [ ] **Step 2.3: Run the migration script**

```bash
node scripts/migrate-posts.mjs
```

Expected output: `Migrated 21 posts to content/posts/`.

- [ ] **Step 2.4: Verify file count and spot-check**

```bash
ls content/posts/ | wc -l
```
Expected: `21`

```bash
head -10 content/posts/fuzzing-openvswitch.md
```
Expected: Normalized frontmatter block with title, date, excerpt, tags; followed by `## Intro` or similar body content (Jekyll frontmatter stripped).

- [ ] **Step 2.5: Commit the migrated content (without deleting legacy yet)**

```bash
git add content/posts/ scripts/migrate-posts.mjs
git commit -m "$(cat <<'EOF'
content: Migrate 21 blog posts to content/posts/ with normalized frontmatter

Uses data/blog.json as the source of truth for metadata (title, date,
excerpt, tags) and the legacy archive for body content. Files are
renamed to slug-first convention. Legacy archive retained until
deploy is verified live; it will be removed in a follow-up.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create `lib/blog.ts` — markdown parsing pipeline

**Goal:** Central module that reads posts from `content/posts/`, parses frontmatter, and converts markdown bodies to HTML via the remark/rehype pipeline with Shiki syntax highlighting and heading anchors.

**Files:**
- Create: `lib/blog.ts`

- [ ] **Step 3.1: Create `lib/blog.ts`**

```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string
}

interface PostFrontmatter {
  title: string
  date: string
  excerpt: string
  tags: string[]
}

function computeReadTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function readPostFile(slug: string): { frontmatter: PostFrontmatter; body: string } | null {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  return { frontmatter: data as PostFrontmatter, body: content }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export function getAllPostsMeta(): BlogPostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const parsed = readPostFile(slug)
      if (!parsed) return null
      const { frontmatter, body } = parsed
      return {
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags ?? [],
        readTime: computeReadTime(body),
      }
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const parsed = readPostFile(slug)
  if (!parsed) return null
  const { frontmatter, body } = parsed

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'append' })
    .use(rehypePrettyCode, {
      theme: 'github-dark-dimmed',
      keepBackground: true,
    })
    .use(rehypeStringify)
    .process(body)

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    readTime: computeReadTime(body),
    contentHtml: String(processed),
  }
}
```

- [ ] **Step 3.2: Run typecheck to verify the module compiles**

```bash
npm run typecheck
```

Expected: exits 0. If not, common causes are: missing type declarations for remark/rehype plugins (each plugin ships its own types; ensure they installed correctly).

- [ ] **Step 3.3: Commit**

```bash
git add lib/blog.ts
git commit -m "$(cat <<'EOF'
feat: Add lib/blog.ts markdown pipeline

Reads content/posts/ markdown files, parses frontmatter via gray-matter,
processes bodies through remark-gfm → remark-rehype → rehype-slug →
rehype-autolink-headings → rehype-pretty-code (Shiki) → rehype-stringify.
Exports getAllPostsMeta(), getPostBySlug(), getAllSlugs().

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Refactor blog index page (`/blog`)

**Goal:** `app/blog/page.tsx` reads metadata from `lib/blog` instead of `data/blog.json`. Because search+filter need client state, the page stays as `'use client'` and we pass pre-fetched metadata in from a server component wrapper. Alternative: keep it fully client-side and load data at the top-level; since the data is statically embedded by the bundler it's fine either way. The simpler path: **convert to a server component that passes meta into a new client island**.

**Files:**
- Modify: `app/blog/page.tsx`
- Create: `app/blog/BlogIndexClient.tsx`

- [ ] **Step 4.1: Create `app/blog/BlogIndexClient.tsx`**

Extract the existing interactive search/filter UI from `app/blog/page.tsx` into this new client component. It accepts a `posts: BlogPostMeta[]` prop and handles all `useState`, `useEffect`, filtering, and rendering of the cards.

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Search, Tag } from 'lucide-react'
import type { BlogPostMeta } from '@/lib/blog'

interface BlogIndexClientProps {
  posts: BlogPostMeta[]
}

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [filteredPosts, setFilteredPosts] = useState(posts)

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)))

  useEffect(() => {
    let filtered = posts
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (selectedTag) {
      filtered = filtered.filter((p) => p.tags.includes(selectedTag))
    }
    setFilteredPosts(filtered)
  }, [searchTerm, selectedTag, posts])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Portfolio
          </Link>

          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Security Research Blog</h1>
            <p className="max-w-3xl text-xl text-gray-600">
              Insights and discoveries from the world of cybersecurity, fuzzing, blockchain
              security, and vulnerability research. Sharing knowledge from years of security
              engineering experience.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              />
              <label htmlFor="blog-search" className="sr-only">
                Search posts
              </label>
              <input
                id="blog-search"
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label htmlFor="blog-tag" className="sr-only">
              Filter by topic
            </label>
            <select
              id="blog-tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">No posts found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 flex items-center text-sm text-gray-500 md:mb-0">
                    <Calendar size={16} className="mr-2" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    <Clock size={16} className="ml-4 mr-2" />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="mb-4 leading-relaxed text-gray-600">{post.excerpt}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-colors hover:bg-blue-200"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Read full article
                  <ArrowLeft size={16} className="ml-2 rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Rewrite `app/blog/page.tsx` as a Server Component**

Replace the entire file with:
```tsx
import { getAllPostsMeta } from '@/lib/blog'
import BlogIndexClient from './BlogIndexClient'

export default function BlogPage() {
  const posts = getAllPostsMeta()
  return <BlogIndexClient posts={posts} />
}
```

- [ ] **Step 4.3: Verify in browser**

The dev server should still be running. Navigate:
```
http://localhost:3000/blog
```
Via `claude-in-chrome`: `tabs_context_mcp`, then `navigate` to that URL, then `read_page` with `depth: 10` to verify:
- The 21 posts are listed
- Search + tag filter still work
- Post cards show title, date, excerpt, tags, readTime
- Console has no errors (`read_console_messages` with pattern `error|warning`)

If the page fails to render, check: (a) `content/posts/*.md` frontmatter matches what `lib/blog.ts` expects, (b) tsc errors in the terminal.

- [ ] **Step 4.4: Run `npm run check` and commit**

```bash
npm run check
git add app/blog/page.tsx app/blog/BlogIndexClient.tsx
git commit -m "$(cat <<'EOF'
feat(blog): Refactor /blog index to use lib/blog

app/blog/page.tsx is now a Server Component that calls getAllPostsMeta()
and passes posts into a new BlogIndexClient that owns the search/filter
interactivity. Metadata now flows from content/posts/ frontmatter, not
data/blog.json.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Refactor blog post page (`/blog/[slug]`)

**Goal:** Replace the hardcoded placeholder with real parsed markdown HTML. Simplify `BlogPostClient.tsx` to accept `contentHtml` and render it via `dangerouslySetInnerHTML` wrapped in Tailwind Typography prose classes.

**Files:**
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/blog/[slug]/BlogPostClient.tsx`

- [ ] **Step 5.1: Rewrite `app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getAllSlugs, getAllPostsMeta, getPostBySlug } from '@/lib/blog'
import BlogPostClient from './BlogPostClient'

interface BlogPostPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()
  const allPosts = getAllPostsMeta()
  return <BlogPostClient post={post} allPosts={allPosts} />
}
```

- [ ] **Step 5.2: Rewrite `app/blog/[slug]/BlogPostClient.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Tag, Share2 } from 'lucide-react'
import type { BlogPost, BlogPostMeta } from '@/lib/blog'

interface BlogPostClientProps {
  post: BlogPost
  allPosts: BlogPostMeta[]
}

export default function BlogPostClient({ post, allPosts }: BlogPostClientProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              {post.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 flex items-center text-gray-600 md:mb-0">
                <Calendar size={18} className="mr-2" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                <Clock size={18} className="ml-4 mr-2" />
                {post.readTime}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <div className="mx-auto max-w-4xl">
          <article className="rounded-xl bg-white p-8 shadow-sm md:p-12">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </article>

          {related.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-6 text-2xl font-bold text-gray-900">Related Posts</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h4 className="mb-2 text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600">
                      {rp.title}
                    </h4>
                    <p className="mb-3 text-sm text-gray-600">{rp.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {new Date(rp.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <Clock size={14} className="ml-3 mr-1" />
                      {rp.readTime}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5.3: Verify in browser**

Navigate to 3 different posts and verify real content renders (not the "being migrated" placeholder):
- `http://localhost:3000/blog/rust-arbitrary-trait/`
- `http://localhost:3000/blog/fuzzing-openvswitch/`
- `http://localhost:3000/blog/good-turing-fuzzing/`

For each, use `read_page` and verify you see actual body content (headings, paragraphs, code blocks), NOT the string "currently being migrated". Check console for errors.

Code blocks should appear with syntax highlighting (Shiki's `github-dark-dimmed` theme). If code blocks render unstyled (plain text on dark background with no color), `rehype-pretty-code` may need additional CSS — add the following to `app/globals.css`:

```css
/* rehype-pretty-code support */
pre [data-line] {
  border-left: 2px solid transparent;
  padding: 0 1rem;
}
pre [data-highlighted-line] {
  background: rgba(200, 200, 255, 0.1);
  border-left-color: #60a5fa;
}
code[data-line-numbers] {
  counter-reset: line;
}
code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1.5rem;
  margin-right: 1rem;
  text-align: right;
  color: gray;
}
figure[data-rehype-pretty-code-figure] pre {
  padding: 1rem 0;
}
```

- [ ] **Step 5.4: Run `npm run build` to verify static export works**

```bash
npm run build
```

Expected: builds cleanly, produces `out/blog/<slug>/index.html` for all 21 posts. Check one:
```bash
ls out/blog/rust-arbitrary-trait/index.html
```

- [ ] **Step 5.5: Commit**

```bash
git add app/blog/[slug]/page.tsx app/blog/[slug]/BlogPostClient.tsx app/globals.css
git commit -m "$(cat <<'EOF'
feat(blog): Render real markdown content in post pages

Replaces the "currently being migrated" placeholder with actual parsed
HTML from lib/blog's getPostBySlug(). BlogPostClient now accepts the
full BlogPost (including contentHtml) and renders via
dangerouslySetInnerHTML wrapped in Tailwind Typography prose classes.
Adds rehype-pretty-code CSS support to globals.css.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5.6: Delete `data/blog.json`**

It's no longer imported anywhere. Verify with:
```bash
grep -r "blog.json" app/ components/ lib/ --include='*.ts' --include='*.tsx'
```
Expected: no output.

Then delete and commit:
```bash
rm data/blog.json
git add data/blog.json
git commit -m "chore: Remove data/blog.json (metadata now in frontmatter)"
```

---

## Task 6: Fix Google Scholar URL

**Files:**
- Modify: `data/portfolio.json`
- Modify: `components/Footer.tsx`

- [ ] **Step 6.1: Update `data/portfolio.json`**

Change `"scholar": "Bhargava Shastry"` to `"scholar": "https://scholar.google.com/citations?hl=en&authuser=2&user=lsdZxf8AAAAJ"`.

- [ ] **Step 6.2: Update `components/Footer.tsx`**

Find the Google Scholar link (around line 103–112) and change the `href` from
```tsx
href={`https://scholar.google.com/citations?user=${personal.social.scholar}`}
```
to
```tsx
href={personal.social.scholar}
```

- [ ] **Step 6.3: Browser verify**

Navigate to `http://localhost:3000`, scroll to footer, confirm the Google Scholar link's `href` is the correct URL (use `read_page` on the Resources section, or `javascript_tool` to read the `href` attribute).

- [ ] **Step 6.4: Commit**

```bash
npm run check
git add data/portfolio.json components/Footer.tsx
git commit -m "fix(footer): Correct Google Scholar link URL"
```

---

## Task 7: Header rewrite — semantics, Blog link, activeSection, a11y

**Goal:** (a) convert nav buttons to `<a href="#id">` anchors; (b) add a "Blog" entry that routes to `/blog`; (c) move `activeSection` state from `app/page.tsx` into `Header.tsx`; (d) add `aria-label` to all icon-only social links; (e) drop `'use client'` from `app/page.tsx`.

**Files:**
- Modify: `components/Header.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 7.1: Rewrite `components/Header.tsx`**

Replace the entire file with:
```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Github, Twitter, Linkedin } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  id?: string // only set for in-page anchors
  external?: boolean
}

const navigation: NavItem[] = [
  { name: 'Home', href: '#home', id: 'home' },
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Projects', href: '#projects', id: 'projects' },
  { name: 'CV', href: '#cv', id: 'cv' },
  { name: 'Contact', href: '#contact', id: 'contact' },
  { name: 'Blog', href: '/blog' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      const sections = ['home', 'about', 'projects', 'cv', 'contact']
      const scrollPosition = window.scrollY + 100
      for (const section of sections) {
        const element = document.getElementById(section)
        if (!element) continue
        const { offsetTop, offsetHeight } = element
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobile = () => setIsMenuOpen(false)

  const linkClass = (item: NavItem) => {
    const isActive = item.id && activeSection === item.id
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
    }`
  }

  const renderLink = (item: NavItem, onClick?: () => void) =>
    item.id ? (
      <a key={item.name} href={item.href} onClick={onClick} className={linkClass(item)}>
        {item.name}
      </a>
    ) : (
      <Link key={item.name} href={item.href} onClick={onClick} className={linkClass(item)}>
        {item.name}
      </Link>
    )

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container-max section-padding">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <a
              href="#home"
              className="text-gradient text-xl font-bold transition-opacity hover:opacity-80"
            >
              Bhargava Shastry
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => renderLink(item))}
            </div>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <a
              href="https://github.com/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/ibags"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com/in/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Linkedin size={20} />
            </a>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              className="text-gray-700 transition-colors hover:text-primary-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="mt-2 space-y-1 rounded-lg bg-white px-2 pb-3 pt-2 shadow-lg">
              {navigation.map((item) => renderLink(item, closeMobile))}
              <div className="flex items-center space-x-4 px-3 py-2">
                <a
                  href="https://github.com/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com/ibags"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
```

- [ ] **Step 7.2: Rewrite `app/page.tsx` as a Server Component**

```tsx
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import CV from '@/components/CV'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Projects />
      <CV />
      <Contact />
      <Footer />
    </main>
  )
}
```

Note: no `'use client'` directive, no state, no effects.

- [ ] **Step 7.3: Verify in browser**

Reload `http://localhost:3000`. Use `read_page` to verify:
- Nav shows: Home, About, Projects, CV, Contact, **Blog** (6 items)
- All 6 are `<a>`/`link` elements, not `<button>`s
- Social icon links have accessible names (the a11y tree should now show `link "GitHub profile"` instead of bare `link`)

Click through with `javascript_tool`: `document.querySelector('a[href="#about"]').click()` — page should scroll smoothly to the About section. Check that `activeSection` highlighting updates as you scroll. Navigate to `/blog` by clicking the Blog nav item.

Check console: `read_console_messages` with pattern `error`.

- [ ] **Step 7.4: Commit**

```bash
npm run check
git add components/Header.tsx app/page.tsx
git commit -m "$(cat <<'EOF'
refactor(header): Use semantic links, lift scroll state, add Blog nav

- Convert nav buttons to <a href="#id"> so deep linking and crawlers work
- Add Blog entry to nav (routes to /blog via next/link)
- Move activeSection state from app/page.tsx into Header (already client)
- Drop 'use client' from app/page.tsx → homepage now server-rendered
- Add aria-labels to icon-only GitHub/Twitter/LinkedIn links
- Add aria-label + aria-expanded to mobile menu button

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add aria-labels to Contact.tsx social icons

**Files:**
- Modify: `components/Contact.tsx`

- [ ] **Step 8.1: Add aria-labels**

In `components/Contact.tsx`, find the three social icon `<a>` elements in the "Follow Me" section (around lines 88–112). Add `aria-label="GitHub profile"`, `aria-label="LinkedIn profile"`, `aria-label="Twitter profile"` respectively.

- [ ] **Step 8.2: Verify and commit**

```bash
npm run check
git add components/Contact.tsx
git commit -m "fix(a11y): Add aria-labels to Contact social icons"
```

---

## Task 9: Favicon and app icons

**Goal:** Replace the default Next.js favicon with a custom SVG: terminal prompt `>_` inside an Ethereum diamond. Generate derivatives.

**Files:**
- Create: `app/icon.svg`
- Create: `app/apple-icon.png` (optional; Next.js can derive if we ship only `icon.svg`)

- [ ] **Step 9.1: Create `app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="eth" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#627EEA"/>
      <stop offset="100%" stop-color="#3C5AC9"/>
    </linearGradient>
  </defs>
  <!-- ETH diamond silhouette -->
  <polygon points="32,4 56,32 32,60 8,32" fill="url(#eth)"/>
  <!-- Subtle inner highlight (upper half lighter) -->
  <polygon points="32,4 56,32 32,36" fill="#ffffff" fill-opacity="0.15"/>
  <polygon points="8,32 32,36 32,60" fill="#000000" fill-opacity="0.15"/>
  <!-- Terminal prompt >_ in center -->
  <g fill="#ffffff" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-weight="700">
    <text x="32" y="40" font-size="22" text-anchor="middle">&gt;_</text>
  </g>
</svg>
```

Next.js automatically serves `app/icon.svg` as the site favicon when this file convention is used. No manual `<link>` tags needed.

- [ ] **Step 9.2: Browser verify**

Reload the homepage. In Chrome DevTools (or by reading `document.querySelector('link[rel=icon]').href` via `javascript_tool`), confirm the favicon resolves to the new SVG. In the Chrome tab, the icon should be visibly the new diamond-with-terminal.

- [ ] **Step 9.3: Remove the old `app/favicon.ico` if present**

```bash
ls app/favicon.ico 2>/dev/null && rm app/favicon.ico || true
```

(Next.js's `icon.svg` convention takes precedence, but removing the stale `.ico` avoids confusion.)

- [ ] **Step 9.4: Commit**

```bash
git add app/icon.svg
git add -u app/favicon.ico 2>/dev/null || true
git commit -m "feat(seo): Add custom favicon — terminal prompt in ETH diamond"
```

---

## Task 10: OpenGraph image

**Goal:** Dynamically generate a 1200×630 PNG at build time for social shares.

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/twitter-image.tsx` (re-export of the above)

- [ ] **Step 10.1: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'

// Note: intentionally NOT declaring `export const runtime = 'edge'`.
// With `output: 'export'` (static export), declaring the edge runtime
// causes `next build` to error. `next/og` works at build time in the
// default Node runtime when the static export target is set.

export const alt = 'Bhargava Shastry — Security Engineer & Researcher'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 24 }}>bshastry.github.io</div>
        <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
          Bhargava Shastry
        </div>
        <div style={{ fontSize: 42, opacity: 0.92, marginBottom: 12 }}>
          Security Engineer & Researcher
        </div>
        <div style={{ fontSize: 28, opacity: 0.7, maxWidth: 900 }}>
          Ethereum Foundation · Smart contract security · Fuzzing · Blockchain
        </div>
      </div>
    ),
    { ...size },
  )
}
```

Note: `runtime = 'edge'` is required by `next/og`, even though we're producing a static export — Next.js runs the generation at build time in the edge runtime.

- [ ] **Step 10.2: Run build and inspect output**

```bash
npm run build
ls out/opengraph-image*.png
```

Expected: a file matching that glob exists. If `next/og` fails in static export mode, fallback plan: write the file as a plain static asset in `public/og.png` (manually generated) and reference it in `layout.tsx` metadata. Document this fallback as a TODO if hit.

- [ ] **Step 10.3: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat(seo): Add dynamic OpenGraph image for social shares"
```

---

## Task 11: `robots.ts` and `sitemap.ts`

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

- [ ] **Step 11.1: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://bshastry.github.io/sitemap.xml',
  }
}
```

- [ ] **Step 11.2: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog'

const BASE = 'https://bshastry.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const postRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))
  return [...staticRoutes, ...postRoutes]
}
```

- [ ] **Step 11.3: Build and verify**

```bash
npm run build
cat out/robots.txt
cat out/sitemap.xml | head -20
```

Expected: `robots.txt` lists the sitemap URL; `sitemap.xml` is valid XML containing entries for `/`, `/blog`, each `/blog/<slug>`, `/privacy`, `/terms`.

- [ ] **Step 11.4: Commit**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "feat(seo): Add robots.txt and dynamic sitemap.xml"
```

---

## Task 12: Layout metadata updates

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 12.1: Update metadata export**

Replace the `metadata` export in `app/layout.tsx` with:
```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://bshastry.github.io'),
  title: {
    default: 'Bhargava Shastry — Security Engineer & Researcher',
    template: '%s — Bhargava Shastry',
  },
  description:
    'Security engineer at the Ethereum Foundation and indie security researcher specializing in smart contract security, fuzzing, and blockchain technology.',
  keywords: [
    'security engineer',
    'ethereum',
    'blockchain',
    'smart contracts',
    'fuzzing',
    'security research',
  ],
  authors: [{ name: 'Bhargava Shastry' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bshastry.github.io',
    siteName: 'Bhargava Shastry',
    title: 'Bhargava Shastry — Security Engineer & Researcher',
    description:
      'Security engineer at the Ethereum Foundation and indie security researcher.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhargava Shastry — Security Engineer & Researcher',
    description:
      'Security engineer at the Ethereum Foundation and indie security researcher.',
    creator: '@ibags',
  },
}
```

(The `opengraph-image.tsx` and `icon.svg` file conventions wire up OG image and favicon automatically — no need to reference them explicitly.)

- [ ] **Step 12.2: Browser verify**

Reload homepage. Use `javascript_tool` to inspect meta tags:
```js
Array.from(document.querySelectorAll('meta')).map(m => ({ name: m.name || m.getAttribute('property'), content: m.content })).filter(m => m.name)
```

Expected: meta tags include `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:image`, canonical link, etc.

- [ ] **Step 12.3: Commit**

```bash
npm run check
git add app/layout.tsx
git commit -m "feat(seo): Extend layout metadata with metadataBase and OG/canonical"
```

---

## Task 13: Repo cleanup and consolidated README

**Goal:** Remove stale artifacts, merge the 5 guide docs into a single `README.md`.

**Files:**
- Delete: `.sass-cache/`, `tmp`, `.idea/`
- Delete: `ARCHITECTURE.md`, `DEPLOYMENT_GUIDE.md`, `GITHUB_PAGES_DEPLOYMENT_GUIDE.md`, `MAINTENANCE_GUIDE.md`, `MIGRATION_GUIDE.md`
- Delete: `scripts/migrate-posts.mjs` (its job is done)
- Create: `README.md`

- [ ] **Step 13.1: Delete stale artifacts**

```bash
git rm -r .sass-cache/ .idea/ tmp 2>/dev/null || true
rm -rf .sass-cache/ .idea/ tmp 2>/dev/null || true
```

- [ ] **Step 13.2: Delete the migration script (served its purpose)**

```bash
git rm scripts/migrate-posts.mjs
rmdir scripts 2>/dev/null || true
```

- [ ] **Step 13.3: Read existing guide docs, then write consolidated `README.md`**

First skim each doc so the new README captures the still-relevant content:
```bash
wc -l ARCHITECTURE.md DEPLOYMENT_GUIDE.md GITHUB_PAGES_DEPLOYMENT_GUIDE.md MAINTENANCE_GUIDE.md MIGRATION_GUIDE.md
```

Write `README.md` with these sections:

```markdown
# Bhargava Shastry — Portfolio & Blog

Personal portfolio and security-research blog for Bhargava Shastry, security engineer at the Ethereum Foundation. Built with Next.js 14 (App Router) and deployed as a static site to GitHub Pages at [bshastry.github.io](https://bshastry.github.io).

## Stack

- **Framework:** Next.js 14 (App Router) with `output: 'export'` for static HTML
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `@tailwindcss/typography` for long-form prose
- **Content:** Blog posts live in `content/posts/*.md`; metadata via frontmatter
- **Markdown pipeline:** `gray-matter` + `remark` + `remark-gfm` + `remark-rehype` + `rehype-slug` + `rehype-autolink-headings` + `rehype-pretty-code` (Shiki) + `rehype-stringify`
- **Icons:** `lucide-react`
- **Hosting:** GitHub Pages via GitHub Actions
- **Quality gates:** Prettier, ESLint (`next/core-web-vitals`), `tsc --noEmit`, all enforced in CI

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server hot-reloads on change.

## Scripts

| Command              | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Local dev server with HMR                        |
| `npm run build`      | Static export to `out/`                          |
| `npm run typecheck`  | `tsc --noEmit`                                   |
| `npm run lint`       | ESLint (`next/core-web-vitals`)                  |
| `npm run lint:fix`   | ESLint with `--fix`                              |
| `npm run format`     | Prettier write                                   |
| `npm run format:check` | Prettier check (used in CI)                    |
| `npm run check`      | typecheck + lint + format:check                  |

## Writing a blog post

1. Add a new markdown file to `content/posts/<slug>.md`.
2. Include YAML frontmatter:
   ```yaml
   ---
   title: "Your Post Title"
   date: 2026-04-09
   excerpt: "One-line summary for the blog index card and meta description."
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
  blog/
    page.tsx              Blog index (server component)
    BlogIndexClient.tsx   Client-side search/filter
    [slug]/
      page.tsx            Post page (server component)
      BlogPostClient.tsx  Share button + layout
  privacy/, terms/        Static legal pages
  robots.ts               robots.txt generator
  sitemap.ts              sitemap.xml generator
  icon.svg                Favicon (terminal prompt in ETH diamond)
  opengraph-image.tsx     Dynamic OG image for social shares

components/
  Header, Hero, About, Projects, CV, Contact, Footer

content/posts/            Blog markdown files

lib/
  blog.ts                 Markdown parsing pipeline

data/
  portfolio.json          CV, projects, social data
```

## Deployment

Hosted at [bshastry.github.io](https://bshastry.github.io). Deployment is automated via GitHub Actions:

- **`.github/workflows/ci.yml`** runs on every push and PR to any branch. It runs `npm run check` and `npm run build` to catch regressions before merge.
- **`.github/workflows/deploy.yml`** runs only on push to `master`. It builds the static site and publishes `out/` to GitHub Pages.

### Repo-level settings (one-time)

Verify: **Settings → Pages → Source = "GitHub Actions"** (already set).

No custom domain is configured; the site serves from the default `bshastry.github.io` root.

## Maintenance

- **Dependencies:** Update periodically with `npm outdated` + `npm update`. For major bumps (Next.js, Tailwind), test thoroughly in a branch first.
- **Legacy archive:** `legacy-archive/` contains the original Jekyll site. Retained as historical reference; scheduled for removal once live deploy is verified with the new blog pipeline.
- **Content updates:** Blog posts live in `content/posts/`; portfolio data (projects, CV) lives in `data/portfolio.json`.

## License

See individual files for any applicable licenses.
```

- [ ] **Step 13.4: Delete the 5 old guide docs**

```bash
git rm ARCHITECTURE.md DEPLOYMENT_GUIDE.md GITHUB_PAGES_DEPLOYMENT_GUIDE.md MAINTENANCE_GUIDE.md MIGRATION_GUIDE.md
```

- [ ] **Step 13.5: Verify and commit**

```bash
ls *.md
# Expected: only README.md

npm run check
git add README.md
git commit -m "$(cat <<'EOF'
docs: Consolidate 5 guide docs into single README.md; remove stale artifacts

- Delete .sass-cache/ (Jekyll artifact), tmp, .idea/
- Delete scripts/migrate-posts.mjs (migration completed)
- Delete ARCHITECTURE, DEPLOYMENT_GUIDE, GITHUB_PAGES_DEPLOYMENT_GUIDE,
  MAINTENANCE_GUIDE, MIGRATION_GUIDE — content consolidated into README
- Add comprehensive README covering stack, dev workflow, post authoring,
  architecture, deployment, and maintenance

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: CI and deploy workflows

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml` (full rewrite)

- [ ] **Step 14.1: Create `.github/workflows/ci.yml`**

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

- [ ] **Step 14.2: Rewrite `.github/workflows/deploy.yml`**

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

- [ ] **Step 14.3: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "$(cat <<'EOF'
ci: Add CI workflow; rewrite deploy workflow for master-only

ci.yml runs on push + PR to any branch, gating on typecheck, lint,
format:check, and build. deploy.yml triggers only on push to master,
uses Node 20, and removes the PR trigger that would have failed due
to Pages environment protection.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Final verification pass

**Goal:** End-to-end confirm everything works.

- [ ] **Step 15.1: Run full quality check**

```bash
npm run check
```
Expected: all three steps pass.

- [ ] **Step 15.2: Run a clean build**

```bash
rm -rf .next out
npm run build
```
Expected: builds successfully; `out/` populated.

- [ ] **Step 15.3: Verify static export contents**

```bash
ls out/
ls out/blog/
ls out/blog/ | wc -l    # should include all 21 post directories plus index.html
test -f out/robots.txt && echo "robots.txt OK"
test -f out/sitemap.xml && echo "sitemap.xml OK"
ls out/opengraph-image*.png && echo "OG image OK"
```

- [ ] **Step 15.4: Spot-check a rendered post in `out/`**

```bash
grep -c "currently being migrated" out/blog/rust-arbitrary-trait/index.html || echo "No placeholder text — good"
grep -q "<h1" out/blog/rust-arbitrary-trait/index.html && echo "Has parsed heading — good"
grep -q "<pre" out/blog/rust-arbitrary-trait/index.html && echo "Has code block — good"
```

Expected: `No placeholder text — good`, `Has parsed heading — good`, `Has code block — good`. If the placeholder text is still present, something in the pipeline is broken — investigate before considering the plan complete.

- [ ] **Step 15.5: Full browser walkthrough**

In the browser via `claude-in-chrome`:
1. `http://localhost:3000/` — verify hero, nav, scrolling, active section highlight, Blog link in nav, Scholar link in footer, console empty
2. `http://localhost:3000/blog` — verify 21 cards, search works, tag filter works, click through to a post
3. `http://localhost:3000/blog/rust-arbitrary-trait/` — verify real content renders, headings, code blocks with syntax colors, Share button
4. `http://localhost:3000/privacy/` — verify loads
5. `http://localhost:3000/terms/` — verify loads

At each step, call `read_console_messages` with pattern `error|warning` and confirm clean (or acceptable warnings only — e.g., React DevTools hint is fine).

- [ ] **Step 15.6: Final summary commit (if any fixups)**

Only commit if fixups were needed; otherwise the plan is complete. Report to user:
- Every task complete
- `npm run check` green
- `npm run build` green
- All routes verified in browser
- Ready to open a PR from `migrate_blog` to `master`

---

## Post-plan handoff

After all tasks complete, report:

> Plan execution complete. Summary:
> - 21 blog posts render real content with syntax highlighting and heading anchors
> - Quality gates (typecheck/lint/format) pass; CI workflow added
> - Homepage server-rendered; `activeSection` state lifted into Header
> - All icon-only links have accessible names; nav uses semantic `<a>` elements
> - Google Scholar link fixed
> - SEO assets (robots, sitemap, OG image, favicon) in place
> - 5 legacy guide docs consolidated into README.md; stale artifacts removed
> - Deploy workflow rewritten for master-only, Node 20
>
> To deploy: merge `migrate_blog` → `master`. GitHub Actions will handle publishing.
> (Pages Source is already set to "GitHub Actions" — no settings change required.)

Legacy archive is still present; plan a follow-up commit to drop it once the new blog is verified live at bshastry.github.io.
