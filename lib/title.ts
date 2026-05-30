/**
 * Splits a post title into a main heading and an optional de-emphasized
 * subtitle, using a spaced em-dash (" — ") as the editorial separator.
 *
 *   "Cross-checking ... the web — Part 1: the setup and the CIRCL finding"
 *     -> { main: "Cross-checking ... the web",
 *          part: "Part 1",
 *          subtitle: "the setup and the CIRCL finding" }
 *
 * Titles without the separator are returned unchanged ({ main: title }),
 * so non-series / short titles render exactly as before.
 */
export interface TitleParts {
  main: string
  /** e.g. "Part 1" — present only when the subtitle leads with a part marker. */
  part?: string
  /** Remainder after the part marker, or the whole tail when there's no marker. */
  subtitle?: string
}

const SEPARATOR = ' — ' // space + em-dash + space
const PART_PATTERN = /^Part\s+(\d+)\s*[:–—.-]?\s*(.*)$/i

export function splitTitle(title: string): TitleParts {
  const idx = title.indexOf(SEPARATOR)
  if (idx === -1) return { main: title }

  const main = title.slice(0, idx)
  const tail = title.slice(idx + SEPARATOR.length).trim()

  const m = tail.match(PART_PATTERN)
  if (m) {
    return { main, part: `Part ${m[1]}`, subtitle: m[2] ? m[2].trim() : undefined }
  }
  return { main, subtitle: tail || undefined }
}
