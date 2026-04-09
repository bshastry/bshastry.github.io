#!/usr/bin/env node
// One-off: read data/blog.json, copy each legacy post to content/posts/<slug>.md
// with normalized frontmatter. Deleted after successful migration.

import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')
const blogJson = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/blog.json'), 'utf8'))

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
