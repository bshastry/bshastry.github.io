import Link from 'next/link'
import { Layers, ArrowLeft, ArrowRight } from 'lucide-react'
import type { SeriesPart } from '@/lib/blog'

function PartNumber({ part, active }: { part: number; active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs ${
        active ? 'bg-accent text-bg' : 'border border-line text-faint'
      }`}
    >
      {part}
    </span>
  )
}

/**
 * Top-of-article series card: lists every part with the current one
 * highlighted. Rendered only for posts that belong to a series.
 */
export function SeriesNav({ title, parts }: { title: string; parts: SeriesPart[] }) {
  if (parts.length < 2) return null
  const current = parts.find((p) => p.isCurrent)

  return (
    <nav aria-label="Article series" className="panel mb-10 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <Layers size={14} className="text-accent" />
        <span className="eyebrow">Series</span>
        {current && (
          <span className="ml-auto font-mono text-xs text-faint">
            Part {current.part} of {parts.length}
          </span>
        )}
      </div>

      <div className="px-3 py-3 sm:px-4">
        <p className="px-2 pb-2 text-sm font-semibold tracking-tight text-fg">{title}</p>
        <ol className="space-y-0.5">
          {parts.map((p) =>
            p.isCurrent ? (
              <li key={p.slug}>
                <span
                  aria-current="page"
                  className="flex items-center gap-3 rounded-md bg-accent/10 px-2 py-2 text-sm text-fg"
                >
                  <PartNumber part={p.part} active />
                  <span className="font-medium">
                    <span className="sr-only">Part {p.part}: </span>
                    {p.label}
                  </span>
                  <span className="eyebrow ml-auto text-accent">You are here</span>
                </span>
              </li>
            ) : (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted transition-colors hover:bg-accent/5 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <PartNumber part={p.part} active={false} />
                  <span className="transition-colors group-hover:text-fg">
                    <span className="sr-only">Part {p.part}: </span>
                    {p.label}
                  </span>
                </Link>
              </li>
            ),
          )}
        </ol>
      </div>
    </nav>
  )
}

/**
 * Bottom-of-article previous/next pager within a series. A lone card (first
 * or last part) spans the full row instead of floating in one column.
 */
export function SeriesPager({ parts }: { parts: SeriesPart[] }) {
  if (parts.length < 2) return null
  const idx = parts.findIndex((p) => p.isCurrent)
  if (idx === -1) return null
  const prev = parts[idx - 1]
  const next = parts[idx + 1]
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Series navigation"
      className={`mt-16 grid gap-4 border-t border-line pt-8 ${
        prev && next ? 'sm:grid-cols-2' : 'sm:grid-cols-1'
      }`}
    >
      {prev && (
        <Link
          href={`/blog/${prev.slug}`}
          className="panel group p-4 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="eyebrow flex items-center gap-1">
            <ArrowLeft size={12} />
            Previous · Part {prev.part}
          </span>
          <span className="mt-1.5 block text-sm font-medium text-fg transition-colors group-hover:text-accent">
            {prev.label}
          </span>
        </Link>
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="panel group p-4 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-right"
        >
          <span className="eyebrow flex items-center gap-1 sm:justify-end">
            Next · Part {next.part}
            <ArrowRight size={12} />
          </span>
          <span className="mt-1.5 block text-sm font-medium text-fg transition-colors group-hover:text-accent">
            {next.label}
          </span>
        </Link>
      )}
    </nav>
  )
}
