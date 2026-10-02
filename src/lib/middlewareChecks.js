// Client for the middleware check-result bridge (scripts/vite-plugin-
// middleware-checks.mjs). Returns a tagged object so the UI can tell "we
// asked and got results" from "there is no bridge here" (the built site on
// Vercel, where the request lands on the SPA's HTML fallback or a 404 page).
//
//   { mode: 'live', results: { [lessonId]: result }, fetchedAt }
//   { mode: 'unavailable', fetchedAt }

export const CHECKS_URL = '/__middleware/checks'

export async function fetchCheckResults(fetchImpl = globalThis.fetch) {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetchImpl(CHECKS_URL, { headers: { accept: 'application/json' }, cache: 'no-store' })
    const type = res.headers.get('content-type') || ''
    if (!res.ok || !type.includes('application/json')) return { mode: 'unavailable', fetchedAt }
    const list = await res.json()
    if (!Array.isArray(list)) return { mode: 'unavailable', fetchedAt }
    const results = {}
    list.forEach((r) => {
      if (r && typeof r === 'object' && typeof r.lessonId === 'string') results[r.lessonId] = normalizeResult(r)
    })
    return { mode: 'live', results, fetchedAt }
  } catch {
    return { mode: 'unavailable', fetchedAt }
  }
}

export function normalizeResult(r) {
  return {
    lessonId: r.lessonId,
    passed: Boolean(r.passed),
    timestamp: typeof r.timestamp === 'string' ? r.timestamp : null,
    failing: Array.isArray(r.failing) ? r.failing.map(String) : [],
    durationMs: typeof r.durationMs === 'number' ? r.durationMs : null,
    pytestExit: typeof r.pytestExit === 'number' ? r.pytestExit : null,
  }
}
