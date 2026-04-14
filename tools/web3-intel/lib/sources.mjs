// Source fetchers for the Web3 intel crawler.
//
// Every fetcher returns an array of normalized Signal objects:
//
//   {
//     id: string,             // stable id, used for dedupe
//     title: string,          // headline
//     snippet: string,        // short body / description / first sentence
//     url: string,            // canonical link
//     publishedAt: string,    // ISO-8601
//     source: string,         // "hackernews" | "reddit" | ...
//     engagement: number,     // upvotes, score, reactions, etc.
//     tags: string[],         // any source-provided tags
//   }
//
// Fetchers never throw. On failure they return { signals: [], error } so the
// caller can log and continue. All endpoints are public and require no auth;
// rate limits are conservative because we prefer to degrade gracefully.

import { fetchJson, sleep } from './fetch.mjs'

const DAY = 86400

/** @typedef {{id:string,title:string,snippet:string,url:string,publishedAt:string,source:string,engagement:number,tags:string[]}} Signal */
/** @typedef {{signals: Signal[], error?: string, note?: string}} SourceResult */

// ---------------------------------------------------------------------------
// Hacker News (Algolia search API)
// Docs: https://hn.algolia.com/api
// No auth, very permissive rate limits.
// ---------------------------------------------------------------------------
export async function fetchHackerNews(sinceDays = 60) {
  const since = Math.floor(Date.now() / 1000) - sinceDays * DAY
  const queries = [
    'web3 security',
    'smart contract exploit',
    'defi hack',
    'crypto wallet drainer',
    'ethereum vulnerability',
    'bridge exploit',
    'zk circuit bug',
  ]

  /** @type {Signal[]} */
  const all = []
  const errors = []

  for (const q of queries) {
    const url =
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}` +
      `&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=40`
    const res = await fetchJson(url)
    if (!res.ok) {
      errors.push(`${q}: ${res.error}`)
      continue
    }
    for (const hit of res.data.hits || []) {
      if (!hit.title) continue
      all.push({
        id: `hn-${hit.objectID}`,
        title: String(hit.title),
        snippet: firstSentence(hit.story_text || hit._highlightResult?.title?.value || ''),
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        publishedAt: new Date((hit.created_at_i || 0) * 1000).toISOString(),
        source: 'hackernews',
        engagement: Number(hit.points || 0) + Number(hit.num_comments || 0),
        tags: Array.isArray(hit._tags) ? hit._tags : [],
      })
    }
    await sleep(250)
  }

  return { signals: all, error: errors.length ? errors.join('; ') : undefined }
}

// ---------------------------------------------------------------------------
// Reddit (.json endpoints — public, requires a real User-Agent)
// Docs: https://www.reddit.com/dev/api/
// Unauth'd limit is ~60 req/min per IP; we issue far fewer.
// ---------------------------------------------------------------------------
export async function fetchReddit(sinceDays = 60) {
  const subs = ['ethdev', 'ethereum', 'defi', 'solidity', 'CryptoCurrency', 'ethfinance']
  const sinceUnix = Math.floor(Date.now() / 1000) - sinceDays * DAY

  /** @type {Signal[]} */
  const all = []
  const errors = []

  for (const sub of subs) {
    const url =
      `https://www.reddit.com/r/${sub}/search.json` +
      `?q=${encodeURIComponent('security OR exploit OR hack OR vulnerability OR drainer')}` +
      `&restrict_sr=1&sort=new&t=month&limit=50`
    const res = await fetchJson(url)
    if (!res.ok) {
      errors.push(`r/${sub}: ${res.error}`)
      continue
    }
    const children = res.data?.data?.children || []
    for (const c of children) {
      const p = c.data
      if (!p || !p.title) continue
      if ((p.created_utc || 0) < sinceUnix) continue
      all.push({
        id: `reddit-${p.id}`,
        title: String(p.title),
        snippet: firstSentence(p.selftext || ''),
        url: p.url_overridden_by_dest || `https://www.reddit.com${p.permalink}`,
        publishedAt: new Date((p.created_utc || 0) * 1000).toISOString(),
        source: 'reddit',
        engagement: Number(p.score || 0) + Number(p.num_comments || 0),
        tags: [`r/${sub}`],
      })
    }
    await sleep(500)
  }

  return { signals: all, error: errors.length ? errors.join('; ') : undefined }
}

// ---------------------------------------------------------------------------
// Ethereum Stack Exchange (Stack Exchange API v2.3)
// Docs: https://api.stackexchange.com/docs
// 300 req/day unauth, which is plenty for a weekly run.
// ---------------------------------------------------------------------------
export async function fetchStackExchange(sinceDays = 60) {
  const fromdate = Math.floor(Date.now() / 1000) - sinceDays * DAY
  const url =
    `https://api.stackexchange.com/2.3/questions` +
    `?order=desc&sort=activity&tagged=security&site=ethereum.stackexchange` +
    `&pagesize=50&fromdate=${fromdate}&filter=withbody`

  const res = await fetchJson(url)
  if (!res.ok) return { signals: [], error: res.error }

  /** @type {Signal[]} */
  const signals = (res.data.items || []).map((q) => ({
    id: `se-${q.question_id}`,
    title: decodeEntities(String(q.title || '')),
    snippet: firstSentence(stripHtml(q.body || '')),
    url: q.link,
    publishedAt: new Date((q.creation_date || 0) * 1000).toISOString(),
    source: 'ethereum-stackexchange',
    engagement:
      Number(q.score || 0) +
      Number(q.answer_count || 0) +
      Math.floor(Number(q.view_count || 0) / 50),
    tags: Array.isArray(q.tags) ? q.tags : [],
  }))
  return { signals }
}

// ---------------------------------------------------------------------------
// GitHub Security Advisories (global advisory DB)
// Docs: https://docs.github.com/en/rest/security-advisories/global-advisories
// Public endpoint, 60 req/hr per IP unauth.
// ---------------------------------------------------------------------------
export async function fetchGitHubAdvisories(sinceDays = 60) {
  const since = new Date(Date.now() - sinceDays * DAY * 1000).toISOString().slice(0, 10)
  // Web3 packages tend to live in npm, cargo, go, pip, rubygems. Query all.
  const ecosystems = ['npm', 'cargo', 'go', 'pip', 'rubygems']

  /** @type {Signal[]} */
  const all = []
  const errors = []

  for (const eco of ecosystems) {
    const url =
      `https://api.github.com/advisories` +
      `?ecosystem=${eco}&severity=high&published=%3E${since}&per_page=50`
    const res = await fetchJson(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) {
      errors.push(`${eco}: ${res.error}`)
      continue
    }
    for (const adv of res.data || []) {
      // Pre-filter: we only want advisories that look web3-adjacent, otherwise
      // noise (Laravel, Django, etc.) swamps the signal. Keyword-match first.
      const text = `${adv.summary || ''} ${adv.description || ''} ${(adv.vulnerabilities || [])
        .map((v) => v.package?.name || '')
        .join(' ')}`.toLowerCase()
      if (!looksWeb3(text)) continue
      all.push({
        id: `ghsa-${adv.ghsa_id}`,
        title: String(adv.summary || adv.ghsa_id),
        snippet: firstSentence(stripHtml(adv.description || '')),
        url: adv.html_url || `https://github.com/advisories/${adv.ghsa_id}`,
        publishedAt: adv.published_at || new Date().toISOString(),
        source: 'github-advisories',
        engagement: severityScore(adv.severity),
        tags: [eco, adv.severity || 'unknown'],
      })
    }
    await sleep(500)
  }

  return { signals: all, error: errors.length ? errors.join('; ') : undefined }
}

// ---------------------------------------------------------------------------
// GitHub Issues search (for vulnerability / security label activity in
// well-known web3 orgs). The search-issues endpoint has a stricter 10 req/min
// limit unauth, so we keep it minimal.
// ---------------------------------------------------------------------------
export async function fetchGitHubIssues(sinceDays = 60) {
  const since = new Date(Date.now() - sinceDays * DAY * 1000).toISOString().slice(0, 10)
  const queries = [
    `org:ethereum label:security is:issue created:>${since}`,
    `org:crytic label:bug is:issue created:>${since}`,
    `smart+contract+vulnerability+is:issue+state:open+created:>${since}`,
  ]

  /** @type {Signal[]} */
  const all = []
  const errors = []

  for (const q of queries) {
    const url =
      `https://api.github.com/search/issues?q=${encodeURIComponent(q)}` +
      `&sort=created&order=desc&per_page=30`
    const res = await fetchJson(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) {
      errors.push(`${q}: ${res.error}`)
      continue
    }
    for (const item of res.data?.items || []) {
      all.push({
        id: `gh-issue-${item.id}`,
        title: String(item.title || ''),
        snippet: firstSentence(stripHtml(item.body || '')),
        url: item.html_url,
        publishedAt: item.created_at,
        source: 'github-issues',
        engagement: Number(item.reactions?.total_count || 0) + Number(item.comments || 0),
        tags: (item.labels || []).map((l) => l.name).filter(Boolean),
      })
    }
    // Search API is stricter — pause longer.
    await sleep(2000)
  }

  return { signals: all, error: errors.length ? errors.join('; ') : undefined }
}

// ---------------------------------------------------------------------------
// Ethereum Magicians forum (Discourse /latest.json)
// Public, no auth. Great signal for live EIP / protocol security debates.
// ---------------------------------------------------------------------------
export async function fetchEthereumMagicians(sinceDays = 60) {
  const url = 'https://ethereum-magicians.org/latest.json?order=created'
  const res = await fetchJson(url)
  if (!res.ok) return { signals: [], error: res.error }

  const sinceMs = Date.now() - sinceDays * DAY * 1000
  const topics = res.data?.topic_list?.topics || []

  /** @type {Signal[]} */
  const signals = []
  for (const t of topics) {
    const created = new Date(t.created_at).getTime()
    if (Number.isNaN(created) || created < sinceMs) continue
    const title = String(t.title || '')
    // Only keep topics whose title or excerpt hints at security.
    const text = `${title} ${t.excerpt || ''}`.toLowerCase()
    if (
      !/security|vulnerab|exploit|attack|drain|phish|reentr|oracle|bridge|mev|proxy|upgrade|signature|7702|4337/.test(
        text,
      )
    ) {
      continue
    }
    signals.push({
      id: `magicians-${t.id}`,
      title,
      snippet: firstSentence(stripHtml(t.excerpt || '')),
      url: `https://ethereum-magicians.org/t/${t.slug}/${t.id}`,
      publishedAt: t.created_at,
      source: 'ethereum-magicians',
      engagement:
        Number(t.posts_count || 0) +
        Number(t.like_count || 0) +
        Math.floor(Number(t.views || 0) / 50),
      tags: Array.isArray(t.tags) ? t.tags : [],
    })
  }
  return { signals }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function firstSentence(s) {
  if (!s) return ''
  const clean = String(s).replace(/\s+/g, ' ').trim()
  const m = clean.match(/^(.{30,280}?[.!?])(\s|$)/)
  if (m) return m[1]
  return clean.slice(0, 240)
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function severityScore(sev) {
  switch ((sev || '').toLowerCase()) {
    case 'critical':
      return 20
    case 'high':
      return 12
    case 'medium':
      return 6
    case 'moderate':
      return 6
    case 'low':
      return 2
    default:
      return 1
  }
}

// Cheap filter — is this text plausibly about a web3 package?
const WEB3_HINTS = [
  'web3',
  'ethereum',
  'solidity',
  'hardhat',
  'foundry',
  'ethers',
  'viem',
  'wagmi',
  'metamask',
  'walletconnect',
  'wallet-connect',
  'cosmos',
  'solana',
  'near',
  'starknet',
  'polygon',
  'arbitrum',
  'optimism',
  'zksync',
  'uniswap',
  'erc-20',
  'erc20',
  'erc-721',
  'erc721',
  'erc-1155',
  'erc1155',
  'eip-',
  'evm',
  'smart contract',
  'smart-contract',
  'bridge',
  'rollup',
  'zk-',
  'zk ',
  'zero knowledge',
  'crypto wallet',
  'blockchain',
  'defi',
]

function looksWeb3(text) {
  const t = (text || '').toLowerCase()
  return WEB3_HINTS.some((w) => t.includes(w))
}

// Public registry of all sources, used by run.mjs.
export const SOURCES = [
  { id: 'hackernews', fn: fetchHackerNews },
  { id: 'reddit', fn: fetchReddit },
  { id: 'ethereum-stackexchange', fn: fetchStackExchange },
  { id: 'github-advisories', fn: fetchGitHubAdvisories },
  { id: 'github-issues', fn: fetchGitHubIssues },
  { id: 'ethereum-magicians', fn: fetchEthereumMagicians },
]
