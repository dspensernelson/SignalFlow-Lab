// Vite dev-server plugin: serves the middleware track's acceptance-check
// results to the React app.
//
// `middleware/checks/run.py <lesson-id>` writes one JSON file per lesson to
// middleware/checks/results/. In dev, the app fetches them here:
//
//   GET /__middleware/checks          -> [ {lessonId, passed, ...}, ... ]
//   GET /__middleware/checks/<id>     -> {lessonId, passed, ...} | 404
//
// This is a local file reader, not a backend: it exists only under `vite`
// (configureServer), never under `vite preview` or in the built site, so the
// deployed app gets a plain 404 page and the client falls back to its
// "run locally" guidance. Results are re-read on every request so a
// "Refresh checks" click always sees the latest run.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const ID_PATTERN = /^[a-z0-9-]+$/

function readResults(resultsDir) {
  if (!existsSync(resultsDir)) return []
  const out = []
  readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .forEach((f) => {
      try {
        const parsed = JSON.parse(readFileSync(path.join(resultsDir, f), 'utf8'))
        if (parsed && typeof parsed === 'object' && parsed.lessonId) out.push(parsed)
      } catch {
        // an unparseable or half-written file is skipped, never fatal
      }
    })
  return out
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

export function middlewareChecks({ resultsDir = 'middleware/checks/results' } = {}) {
  return {
    name: 'signalflow-middleware-checks',
    configureServer(server) {
      const dir = path.resolve(server.config.root, resultsDir)
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.startsWith('/__middleware/checks')) return next()
        if (req.method !== 'GET') return sendJson(res, 405, { error: 'method_not_allowed' })
        const rest = url.slice('/__middleware/checks'.length).replace(/^\/+|\/+$/g, '')
        const results = readResults(dir)
        if (!rest) return sendJson(res, 200, results)
        if (!ID_PATTERN.test(rest)) return sendJson(res, 400, { error: 'bad_lesson_id' })
        const hit = results.find((r) => r.lessonId === rest)
        return hit ? sendJson(res, 200, hit) : sendJson(res, 404, { error: 'not_found', lessonId: rest })
      })
    },
  }
}
