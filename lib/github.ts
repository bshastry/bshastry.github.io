const GITHUB_USERNAME = 'bshastry'
const GITHUB_API = 'https://api.github.com'

export interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  fork: boolean
  pushed_at: string
}

export interface GitHubEvent {
  type: string
  repo: { name: string; url: string }
  created_at: string
  payload: {
    action?: string
    ref?: string
    ref_type?: string
    commits?: { message: string }[]
  }
}

export interface GitHubActivityData {
  recentRepos: {
    name: string
    description: string | null
    url: string
    language: string | null
    stars: number
    pushedAt: string
  }[]
  recentEvents: {
    type: string
    repo: string
    repoUrl: string
    date: string
    summary: string
  }[]
  totalPublicRepos: number
  fetchedAt: string
}

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github.v3+json' }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

function summarizeEvent(event: GitHubEvent): string {
  const repo = event.repo.name.replace(`${GITHUB_USERNAME}/`, '')
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.commits?.length ?? 0
      return `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${repo}`
    }
    case 'CreateEvent':
      return `Created ${event.payload.ref_type ?? 'repository'} in ${repo}`
    case 'PullRequestEvent':
      return `${event.payload.action ?? 'Updated'} PR in ${repo}`
    case 'IssuesEvent':
      return `${event.payload.action ?? 'Updated'} issue in ${repo}`
    case 'ForkEvent':
      return `Forked ${repo}`
    case 'WatchEvent':
      return `Starred ${repo}`
    default:
      return `Activity in ${repo}`
  }
}

export async function getGitHubActivity(): Promise<GitHubActivityData> {
  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`, {
        headers: headers(),
      }),
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=30`, {
        headers: headers(),
      }),
    ])

    if (!reposRes.ok || !eventsRes.ok) {
      console.warn('GitHub API fetch failed, returning empty activity data')
      return {
        recentRepos: [],
        recentEvents: [],
        totalPublicRepos: 0,
        fetchedAt: new Date().toISOString(),
      }
    }

    const repos: GitHubRepo[] = await reposRes.json()
    const events: GitHubEvent[] = await eventsRes.json()

    const ownRepos = repos.filter((r) => !r.fork)

    const recentRepos = ownRepos.slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }))

    const recentEvents = events
      .filter((e) =>
        ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type),
      )
      .slice(0, 8)
      .map((e) => ({
        type: e.type,
        repo: e.repo.name,
        repoUrl: `https://github.com/${e.repo.name}`,
        date: e.created_at,
        summary: summarizeEvent(e),
      }))

    return {
      recentRepos,
      recentEvents,
      totalPublicRepos: ownRepos.length,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('GitHub API fetch error:', error)
    return {
      recentRepos: [],
      recentEvents: [],
      totalPublicRepos: 0,
      fetchedAt: new Date().toISOString(),
    }
  }
}
