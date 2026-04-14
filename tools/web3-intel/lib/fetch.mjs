// Tiny HTTP helper built on Node 20+ native fetch.
// Adds: timeout via AbortController, exponential backoff on 429/5xx/network errors,
// a default User-Agent, and JSON parsing with graceful error reporting.

const DEFAULT_UA =
  'bshastry-web3-intel/1.0 (+https://bshastry.github.io; research crawler, contact via site)'

/**
 * Fetch a URL and return parsed JSON.
 * Never throws for non-2xx; instead returns { ok: false, status, error }.
 * @param {string} url
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.headers]
 * @param {number} [opts.retries=3]
 * @param {number} [opts.timeoutMs=15000]
 * @param {number} [opts.backoffMs=1000]
 * @returns {Promise<{ok: true, status: number, data: any} | {ok: false, status: number, error: string}>}
 */
export async function fetchJson(url, opts = {}) {
  const { headers = {}, retries = 3, timeoutMs = 15000, backoffMs = 1000 } = opts

  const mergedHeaders = {
    'User-Agent': DEFAULT_UA,
    Accept: 'application/json',
    ...headers,
  }

  let lastErr = 'unknown'
  let lastStatus = 0

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), timeoutMs)
    try {
      const res = await fetch(url, { headers: mergedHeaders, signal: ac.signal })
      clearTimeout(timer)
      lastStatus = res.status

      if (res.ok) {
        const text = await res.text()
        try {
          return { ok: true, status: res.status, data: JSON.parse(text) }
        } catch (e) {
          return {
            ok: false,
            status: res.status,
            error: `json-parse: ${(e && e.message) || e}`,
          }
        }
      }

      // Retry on 429 / 5xx. Fail fast on other 4xx.
      if (res.status !== 429 && res.status < 500) {
        const body = await safeText(res)
        return {
          ok: false,
          status: res.status,
          error: `http ${res.status}: ${body.slice(0, 200)}`,
        }
      }
      lastErr = `http ${res.status}`
    } catch (e) {
      clearTimeout(timer)
      lastErr = (e && e.message) || String(e)
    }

    if (attempt < retries) {
      const delay = backoffMs * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  return { ok: false, status: lastStatus, error: lastErr }
}

function safeText(res) {
  return res.text().catch(() => '')
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
