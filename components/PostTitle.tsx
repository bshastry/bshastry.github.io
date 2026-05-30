import { splitTitle } from '@/lib/title'

/**
 * Renders a post title with the "— Part N: …" tail visually de-emphasized,
 * while keeping the full title as a single string inside one heading element
 * (the caller supplies the <h1>/<h2>/<h3> and any <Link>). Screen readers and
 * SEO still see the complete title.
 *
 * - variant="full"   stacked 3-tier hierarchy for the post-page H1.
 * - variant="inline" main + dimmed inline tail for compact listing/related cards.
 */
export function PostTitle({
  title,
  variant,
  className,
}: {
  title: string
  variant: 'full' | 'inline'
  className?: string
}) {
  const { main, part, subtitle } = splitTitle(title)
  const hasTail = Boolean(part || subtitle)

  if (variant === 'inline') {
    return (
      <span className={className}>
        {main}
        {hasTail && (
          <span className="font-normal text-muted">
            {' — '}
            {part ? `${part}: ` : ''}
            {subtitle}
          </span>
        )}
      </span>
    )
  }

  return (
    <span className={className}>
      <span className="block text-balance">{main}</span>
      {hasTail && (
        <span className="mt-3 block">
          {/* sr-only separators keep the heading's text content equal to the
              original title for screen readers and SEO, despite the visual split. */}
          <span className="sr-only">{' — '}</span>
          {part && (
            <span className="block font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {part}
              {subtitle && <span className="sr-only">: </span>}
            </span>
          )}
          {subtitle && (
            <span className="mt-1.5 block text-pretty text-lg font-normal leading-snug text-muted sm:text-xl">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
