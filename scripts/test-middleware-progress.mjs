// Unit tests for the middleware track's progress model (pure functions).
// Run with: npm run test:middleware-progress (part of npm run check).
//
// The model stores only terminal lesson states (passed / skipped / failed);
// locked and ready are derived from the lesson order, so the gating rule
// "lesson N is ready iff lesson N-1 is passed or skipped" lives in one place.

import assert from 'node:assert/strict'
import {
  emptyProgress,
  deriveLessonStatus,
  markPassed,
  markFailed,
  markSkipped,
  saveExplain,
  explainComplete,
  moduleSummary,
  frontierLessonId,
  normalizeProgress,
} from '../src/lib/middlewareProgress.js'

const ORDER = ['m0-1-a', 'm0-2-b', 'm0-3-c', 'm1-1-d']
let passed = 0
function test(name, fn) {
  fn()
  passed += 1
  console.log(`ok - ${name}`)
}

test('first lesson is ready, the rest locked, on empty progress', () => {
  const p = emptyProgress()
  assert.equal(deriveLessonStatus(p, 'm0-1-a', ORDER), 'ready')
  assert.equal(deriveLessonStatus(p, 'm0-2-b', ORDER), 'locked')
  assert.equal(deriveLessonStatus(p, 'm1-1-d', ORDER), 'locked')
  assert.equal(frontierLessonId(p, ORDER), 'm0-1-a')
})

test('passing a lesson unlocks exactly the next one', () => {
  const p = markPassed(emptyProgress(), 'm0-1-a', { checkedAt: '2026-10-02T10:00:00Z' })
  assert.equal(deriveLessonStatus(p, 'm0-1-a', ORDER), 'passed')
  assert.equal(deriveLessonStatus(p, 'm0-2-b', ORDER), 'ready')
  assert.equal(deriveLessonStatus(p, 'm0-3-c', ORDER), 'locked')
  assert.equal(p.lessons['m0-1-a'].checkedAt, '2026-10-02T10:00:00Z')
  assert.equal(frontierLessonId(p, ORDER), 'm0-2-b')
})

test('skipping is recorded, shown, and unlocks the next lesson', () => {
  const p = markSkipped(markPassed(emptyProgress(), 'm0-1-a', {}), 'm0-2-b', ORDER)
  assert.equal(deriveLessonStatus(p, 'm0-2-b', ORDER), 'skipped')
  assert.equal(deriveLessonStatus(p, 'm0-3-c', ORDER), 'ready')
  assert.ok(p.lessons['m0-2-b'].skippedAt)
})

test('a failed check keeps the lesson ready (with failures) and does not unlock', () => {
  const p = markFailed(emptyProgress(), 'm0-1-a', ['test_runs::shape'], '2026-10-02T10:05:00Z')
  assert.equal(deriveLessonStatus(p, 'm0-1-a', ORDER), 'failed')
  assert.equal(deriveLessonStatus(p, 'm0-2-b', ORDER), 'locked')
  assert.deepEqual(p.lessons['m0-1-a'].failingTests, ['test_runs::shape'])
})

test('a later passing result upgrades a skipped or failed lesson', () => {
  let p = markSkipped(emptyProgress(), 'm0-1-a', ORDER)
  p = markPassed(p, 'm0-1-a', {})
  assert.equal(deriveLessonStatus(p, 'm0-1-a', ORDER), 'passed')
  assert.deepEqual(p.lessons['m0-1-a'].failingTests, [])
})

test('a failing result never downgrades a passed lesson', () => {
  let p = markPassed(emptyProgress(), 'm0-1-a', {})
  p = markFailed(p, 'm0-1-a', ['x'], 'later')
  assert.equal(deriveLessonStatus(p, 'm0-1-a', ORDER), 'passed')
})

test('a locked lesson cannot be skipped or passed out of order', () => {
  const p = markSkipped(emptyProgress(), 'm0-3-c', ORDER)
  assert.equal(deriveLessonStatus(p, 'm0-3-c', ORDER), 'locked')
  assert.equal(p.lessons['m0-3-c'], undefined)
})

test('mark functions never mutate their input', () => {
  const p = emptyProgress()
  markPassed(p, 'm0-1-a', {})
  assert.deepEqual(p.lessons, {})
})

test('explain-it answers are saved per key and completeness needs every answer', () => {
  let p = saveExplain(emptyProgress(), 'm0', { 0: 'a', 1: '' })
  assert.equal(explainComplete(p, 'm0', 2), false)
  p = saveExplain(p, 'm0', { 0: 'a', 1: 'b' })
  assert.equal(explainComplete(p, 'm0', 2), true)
  assert.ok(p.explainIt.m0.savedAt)
})

test('module summary counts passed and skipped lessons', () => {
  let p = markPassed(emptyProgress(), 'm0-1-a', {})
  p = markSkipped(p, 'm0-2-b', ORDER)
  const s = moduleSummary(p, ['m0-1-a', 'm0-2-b', 'm0-3-c'])
  assert.deepEqual(s, { passed: 1, skipped: 1, total: 3, done: 2 })
})

test('normalizeProgress repairs a missing or foreign shape', () => {
  assert.deepEqual(normalizeProgress(null), emptyProgress())
  assert.deepEqual(normalizeProgress({ version: 1, lessons: 'nope' }), emptyProgress())
  const ok = { version: 1, lessons: { 'm0-1-a': { status: 'passed' } }, explainIt: {} }
  assert.deepEqual(normalizeProgress(ok), ok)
})

console.log(`\n${passed} middleware progress tests passed.`)
