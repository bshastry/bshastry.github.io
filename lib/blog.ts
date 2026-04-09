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
  date: string | Date
  excerpt: string
  tags: string[]
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
    .map((slug) => {
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
    date: normalizeDate(frontmatter.date),
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    readTime: computeReadTime(body),
    contentHtml: String(processed),
  }
}
