// Middleware track data barrel. Lessons and scenarios are globbed eagerly
// so the whole track ships in the middleware chunk (the track is small:
// ~32 lessons, ~9 scenarios). The track-wide lesson order is the single
// source of truth for sequential unlock (see src/lib/middlewareProgress.js).

import track from './track.json'
import map from './map.json'

const lessonModules = import.meta.glob('./lessons/*.json', { eager: true })
const scenarioModules = import.meta.glob('./scenarios/*.json', { eager: true })

function collect(modules) {
  const out = {}
  Object.values(modules).forEach((mod) => {
    const item = mod.default || mod
    if (item && item.id) out[item.id] = item
  })
  return out
}

export const TRACK = track
export const MAP = map
export const MODULES = [...track.modules].sort((a, b) => a.order - b.order)
export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]))
export const LESSONS = collect(lessonModules)
export const SCENARIOS = collect(scenarioModules)

const moduleOrder = Object.fromEntries(MODULES.map((m) => [m.id, m.order]))

// Every lesson id in play order: by module order, then lesson order.
export const LESSON_ORDER = Object.values(LESSONS)
  .sort((a, b) => moduleOrder[a.module] - moduleOrder[b.module] || a.order - b.order)
  .map((l) => l.id)

export function lessonsForModule(moduleId) {
  return LESSON_ORDER.map((id) => LESSONS[id]).filter((l) => l.module === moduleId)
}

export function nextLessonId(lessonId) {
  const i = LESSON_ORDER.indexOf(lessonId)
  return i >= 0 && i < LESSON_ORDER.length - 1 ? LESSON_ORDER[i + 1] : null
}

export function previousLessonId(lessonId) {
  const i = LESSON_ORDER.indexOf(lessonId)
  return i > 0 ? LESSON_ORDER[i - 1] : null
}

export function moduleForLesson(lessonId) {
  const lesson = LESSONS[lessonId]
  return lesson ? MODULE_BY_ID[lesson.module] : null
}
