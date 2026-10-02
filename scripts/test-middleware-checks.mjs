// Unit tests for the middleware check-result client (fetchCheckResults).
import assert from 'node:assert/strict'
import { fetchCheckResults } from '../src/lib/middlewareChecks.js'

function fakeFetch(status, type, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    headers: { get: (k) => (k === 'content-type' ? type : null) },
    json: async () => body,
  })
}

let n = 0
const t = async (name, fn) => { await fn(); n += 1; console.log(`ok - ${name}`) }

await t('live results are keyed by lesson id and normalized', async () => {
  const r = await fetchCheckResults(fakeFetch(200, 'application/json; charset=utf-8', [
    { lessonId: 'm0-1-environment', passed: 1, failing: ['a'], timestamp: 't' },
    { nope: true },
  ]))
  assert.equal(r.mode, 'live')
  assert.deepEqual(Object.keys(r.results), ['m0-1-environment'])
  assert.equal(r.results['m0-1-environment'].passed, true)
  assert.deepEqual(r.results['m0-1-environment'].failing, ['a'])
})
await t('an HTML response (deployed site fallback page) is unavailable', async () => {
  const r = await fetchCheckResults(fakeFetch(200, 'text/html', '<!doctype html>'))
  assert.equal(r.mode, 'unavailable')
})
await t('a 404 is unavailable', async () => {
  const r = await fetchCheckResults(fakeFetch(404, 'text/html', ''))
  assert.equal(r.mode, 'unavailable')
})
await t('a network error is unavailable, never a throw', async () => {
  const r = await fetchCheckResults(async () => { throw new Error('offline') })
  assert.equal(r.mode, 'unavailable')
})
console.log(`\n${n} middleware check-client tests passed.`)
