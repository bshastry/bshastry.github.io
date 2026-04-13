import { GitCommit, Star, Github, Clock, ExternalLink } from 'lucide-react'
import type { GitHubActivityData } from '@/lib/github'

interface GitHubActivityProps {
  activity: GitHubActivityData
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function GitHubActivity({ activity }: GitHubActivityProps) {
  if (activity.recentRepos.length === 0 && activity.recentEvents.length === 0) {
    return null
  }

  return (
    <section id="activity" className="py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Open Source Activity
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Recent public contributions — auto-updated weekly
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {activity.recentRepos.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <Github size={20} className="mr-2 text-primary-600" />
                Recently Active Repos
              </h3>
              <div className="space-y-3">
                {activity.recentRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{repo.name}</p>
                        {repo.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink size={14} className="ml-2 mt-1 flex-shrink-0 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      {repo.language && (
                        <span className="flex items-center">
                          <span className="mr-1 h-2 w-2 rounded-full bg-primary-500" />
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center">
                          <Star size={12} className="mr-0.5" />
                          {repo.stars}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Clock size={12} className="mr-0.5" />
                        {timeAgo(repo.pushedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activity.recentEvents.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <GitCommit size={20} className="mr-2 text-primary-600" />
                Recent Activity
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {activity.recentEvents.map((event, i) => (
                  <a
                    key={`${event.repo}-${event.date}-${i}`}
                    href={event.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
                      i !== activity.recentEvents.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-900">{event.summary}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{timeAgo(event.date)}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {activity.fetchedAt && (
          <p className="mt-8 text-center text-xs text-gray-400">
            Data from GitHub API · Last updated{' '}
            {new Date(activity.fetchedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </section>
  )
}
