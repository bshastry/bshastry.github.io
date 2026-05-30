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

export interface SeriesInfo {
  /** Display title of the series; also the grouping key across posts. */
  title: string
  /** 1-based position of this post within the series. */
  part: number
  /** Short label for this part in the nav; falls back to the post title. */
  label?: string
}

export interface SeriesPart {
  slug: string
  part: number
  label: string
  isCurrent: boolean
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: string
  series?: SeriesInfo
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string
}

interface PostFrontmatter {
  title: string
  date: string | Date
  excerpt: string
  tags: string[]
  series?: string
  seriesPart?: number
  seriesLabel?: string
}

function parseSeries(frontmatter: PostFrontmatter): SeriesInfo | undefined {
  if (!frontmatter.series || frontmatter.seriesPart == null) return undefined
  return {
    title: frontmatter.series,
    part: frontmatter.seriesPart,
    label: frontmatter.seriesLabel,
  }
}

function normalizeDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  return String(date)
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
    .map((slug): BlogPostMeta | null => {
      const parsed = readPostFile(slug)
      if (!parsed) return null
      const { frontmatter, body } = parsed
      return {
        slug,
        title: frontmatter.title,
        date: normalizeDate(frontmatter.date),
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags ?? [],
        readTime: computeReadTime(body),
        series: parseSeries(frontmatter),
      }
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/**
 * All posts in a series, ordered by part. Returns [] when the series has
 * fewer than two posts (a lone post is not a series).
 */
export function getSeriesParts(seriesTitle: string, currentSlug?: string): SeriesPart[] {
  const parts = getAllPostsMeta()
    .filter((p) => p.series?.title === seriesTitle)
    .sort((a, b) => a.series!.part - b.series!.part)
    .map((p) => ({
      slug: p.slug,
      part: p.series!.part,
      label: p.series!.label ?? p.title,
      isCurrent: p.slug === currentSlug,
    }))
  return parts.length > 1 ? parts : []
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
    date: normalizeDate(frontmatter.date),
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    readTime: computeReadTime(body),
    series: parseSeries(frontmatter),
    contentHtml: String(processed),
  }
}
