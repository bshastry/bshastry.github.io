// Internal-link audit over the static export in out/.
//
// Every recent site PR ran this audit by hand before merge; this encodes it as
// a CI gate so a renamed route, moved media file, or dropped legacy shim fails
// the build instead of shipping a broken inbound link.
//
// Checks every href/src in every exported HTML page that points inside the
// site (external URLs, mailto:, and pure-fragment links are out of scope).
// A directory target passes only if it contains an index.html, matching how
// GitHub Pages serves trailing-slash URLs.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, normalize } from 'node:path'

const OUT_DIR = 'out'

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return htmlFiles(path)
    return entry.name.endsWith('.html') ? [path] : []
  })
}

function decodeEntities(url) {
  return url
    .replaceAll('&amp;', '&')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function targetExists(fsPath) {
  if (!existsSync(fsPath)) {
    return existsSync(fsPath + '.html')
  }
  if (statSync(fsPath).isDirectory()) {
    return existsSync(join(fsPath, 'index.html'))
  }
  return true
}

if (!existsSync(OUT_DIR)) {
  console.error(`check-links: ${OUT_DIR}/ not found — run \`npm run build\` first.`)
  process.exit(1)
}

const pages = htmlFiles(OUT_DIR)
const broken = []
let checked = 0

for (const page of pages) {
  const content = readFileSync(page, 'utf8')
  for (const match of content.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = decodeEntities(match[1])
    if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue

    const path = decodeURIComponent(url.split('#')[0].split('?')[0])
    if (path === '') continue

    const fsPath = path.startsWith('/')
      ? join(OUT_DIR, ...path.slice(1).split('/'))
      : normalize(join(dirname(page), path))

    checked += 1
    if (!targetExists(fsPath)) {
      broken.push({ page, url })
    }
  }
}

console.log(`check-links: ${pages.length} pages, ${checked} internal references checked.`)

if (broken.length > 0) {
  console.error(`check-links: ${broken.length} broken internal link(s):`)
  for (const { page, url } of broken) {
    console.error(`  ${page} -> ${url}`)
  }
  process.exit(1)
}

console.log('check-links: no broken internal links.')
