/**
 * Shared date formatting for post dates (YYYY-MM-DD strings). Anchoring to
 * UTC midnight and rendering in UTC keeps the calendar day stable across
 * viewer timezones — `new Date('2026-06-23')` rendered in a negative-offset
 * locale would otherwise display the previous day.
 *
 * Kept free of node imports so client components can use it.
 */
export function formatDate(
  date: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
}
