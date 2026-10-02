// Progress model for the middleware track.
//
// Storage: one localStorage key, signalflow_middleware_progress, separate from
// every automation-track key. Only terminal lesson states are stored
// (passed / skipped / failed); "locked" and "ready" are derived from the
// track's lesson order so the gating rule lives in one function:
//
//   lesson 0 is ready; lesson N is ready iff lesson N-1 is passed or skipped.
//
// Skips are explicit, recorded with a timestamp, and displayed. A later
// passing check upgrades a skipped or failed lesson; a failing check never
// downgrades a passed one. Explain-it answers are free text saved per key
// (a module id, or a lesson id for explain-only lessons).
//
// Every mark* function returns a new object and never mutates its input.

export const MIDDLEWARE_PROGRESS_KEY = 'signalflow_middleware_progress'

export const LESSON_STATUS = {
  LOCKED: 'locked',
  READY: 'ready',
  PASSED: 'passed',
  SKIPPED: 'skipped',
  FAILED: 'failed',
}

const TERMINAL = new Set([LESSON_STATUS.PASSED, LESSON_STATUS.SKIPPED, LESSON_STATUS.FAILED])

export function emptyProgress() {
  return { version: 1, lessons: {}, explainIt: {}, resetAt: null }
}

// Repairs anything that is not the expected shape (missing key, old
// version, hand-edited storage) back to a usable progress object.
export function normalizeProgress(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress()
  if (raw.version !== 1) return emptyProgress()
  if (!raw.lessons || typeof raw.lessons !== 'object' || Array.isArray(raw.lessons)) {
    return emptyProgress()
  }
  const explainIt =
    raw.explainIt && typeof raw.explainIt === 'object' && !Array.isArray(raw.explainIt)
      ? raw.explainIt
      : {}
  const lessons = {}
  Object.entries(raw.lessons).forEach(([id, entry]) => {
    if (entry && typeof entry === 'object' && TERMINAL.has(entry.status)) lessons[id] = entry
  })
  const resetAt = typeof raw.resetAt === 'string' ? raw.resetAt : null
  return { version: 1, lessons, explainIt, resetAt }
}

export function loadMiddlewareProgress() {
  try {
    const raw = localStorage.getItem(MIDDLEWARE_PROGRESS_KEY)
    return normalizeProgress(raw ? JSON.parse(raw) : null)
  } catch {
    return emptyProgress()
  }
}

export function saveMiddlewareProgress(progress) {
  try {
    localStorage.setItem(MIDDLEWARE_PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)))
  } catch {
    // ignore write failures (e.g. storage disabled)
  }
}

export function clearMiddlewareProgress() {
  try {
    localStorage.removeItem(MIDDLEWARE_PROGRESS_KEY)
  } catch {
    // ignore
  }
}

function isDone(entry) {
  return Boolean(entry) && (entry.status === LESSON_STATUS.PASSED || entry.status === LESSON_STATUS.SKIPPED)
}

// The display status of a lesson given the track-wide lesson order.
export function deriveLessonStatus(progress, lessonId, order) {
  const entry = progress.lessons[lessonId]
  if (entry && TERMINAL.has(entry.status)) return entry.status
  const index = order.indexOf(lessonId)
  if (index < 0) return LESSON_STATUS.LOCKED
  if (index === 0) return LESSON_STATUS.READY
  return isDone(progress.lessons[order[index - 1]]) ? LESSON_STATUS.READY : LESSON_STATUS.LOCKED
}

// The first lesson that is not yet passed or skipped (where the learner is).
export function frontierLessonId(progress, order) {
  return order.find((id) => !isDone(progress.lessons[id])) || order[order.length - 1] || null
}

function withLesson(progress, lessonId, entry) {
  return {
    ...progress,
    lessons: { ...progress.lessons, [lessonId]: entry },
  }
}

// A pass on a lesson the learner cannot reach yet is ignored when `order` is
// given, so an out-of-order result file never jumps the sequence.
export function markPassed(progress, lessonId, { checkedAt } = {}, order) {
  if (order && deriveLessonStatus(progress, lessonId, order) === LESSON_STATUS.LOCKED) return progress
  return withLesson(progress, lessonId, {
    status: LESSON_STATUS.PASSED,
    checkedAt: checkedAt || new Date().toISOString(),
    failingTests: [],
  })
}

// A failing check is informational: it never downgrades a passed or skipped
// lesson (a skipped one keeps its status and just records the failures) and
// never unlocks anything. A result for a lesson the learner cannot work on
// yet (locked) is ignored so stale result files cannot mark the future.
export function markFailed(progress, lessonId, failingTests = [], checkedAt, order) {
  const current = progress.lessons[lessonId]
  const failing = Array.isArray(failingTests) ? failingTests : []
  const stamp = checkedAt || new Date().toISOString()
  if (current && current.status === LESSON_STATUS.PASSED) return progress
  if (current && current.status === LESSON_STATUS.SKIPPED) {
    return withLesson(progress, lessonId, { ...current, checkedAt: stamp, failingTests: failing })
  }
  if (order && deriveLessonStatus(progress, lessonId, order) === LESSON_STATUS.LOCKED) return progress
  return withLesson(progress, lessonId, {
    status: LESSON_STATUS.FAILED,
    checkedAt: stamp,
    failingTests: failing,
  })
}

// Skip is only meaningful on a lesson the learner could work on right now.
// Passed lessons stay passed; locked lessons stay locked. `order` is the
// track-wide lesson order used to derive lock state.
export function markSkipped(progress, lessonId, order = []) {
  const current = progress.lessons[lessonId]
  if (current && current.status === LESSON_STATUS.PASSED) return progress
  if (deriveLessonStatus(progress, lessonId, order) === LESSON_STATUS.LOCKED) return progress
  return withLesson(progress, lessonId, {
    status: LESSON_STATUS.SKIPPED,
    skippedAt: new Date().toISOString(),
    failingTests: current?.failingTests || [],
  })
}

// "Reset track": forget every lesson state and answer, and remember WHEN, so
// result files still on disk from before the reset cannot re-mark lessons.
export function markReset(progress, at) {
  return { ...emptyProgress(), resetAt: at || new Date().toISOString() }
}

// Fold a batch of check results (keyed by lesson id) into progress. Results
// dated at or before the last reset, or undated after a reset, are ignored;
// passes and failures both respect the lesson order.
export function applyCheckResults(progress, results, order) {
  let next = progress
  Object.values(results || {}).forEach((r) => {
    if (!r || typeof r.lessonId !== 'string' || !order.includes(r.lessonId)) return
    if (next.resetAt && (!r.timestamp || r.timestamp <= next.resetAt)) return
    next = r.passed
      ? markPassed(next, r.lessonId, { checkedAt: r.timestamp || undefined }, order)
      : markFailed(next, r.lessonId, r.failing, r.timestamp || undefined, order)
  })
  return next
}

export function saveExplain(progress, key, answers) {
  return {
    ...progress,
    explainIt: {
      ...progress.explainIt,
      [key]: { answers: { ...answers }, savedAt: new Date().toISOString() },
    },
  }
}

export function explainAnswers(progress, key) {
  return progress.explainIt[key]?.answers || {}
}

export function explainComplete(progress, key, questionCount) {
  const answers = explainAnswers(progress, key)
  for (let i = 0; i < questionCount; i += 1) {
    if (!answers[i] || !String(answers[i]).trim()) return false
  }
  return questionCount > 0
}

export function moduleSummary(progress, lessonIds) {
  let passed = 0
  let skipped = 0
  lessonIds.forEach((id) => {
    const s = progress.lessons[id]?.status
    if (s === LESSON_STATUS.PASSED) passed += 1
    if (s === LESSON_STATUS.SKIPPED) skipped += 1
  })
  return { passed, skipped, total: lessonIds.length, done: passed + skipped }
}
