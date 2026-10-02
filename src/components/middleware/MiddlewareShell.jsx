import { useCallback, useEffect, useState } from 'react'
import MiddlewareHeader from './MiddlewareHeader'
import TrackHome from './TrackHome'
import ModuleLanding from './ModuleLanding'
import LessonView from './LessonView'
import {
  TRACK,
  MODULES,
  MODULE_BY_ID,
  LESSONS,
  LESSON_ORDER,
  lessonsForModule,
  nextLessonId,
} from '../../data/middleware/index.js'
import {
  loadMiddlewareProgress,
  saveMiddlewareProgress,
  clearMiddlewareProgress,
  deriveLessonStatus,
  markPassed,
  markFailed,
  markSkipped,
  saveExplain,
  frontierLessonId,
  LESSON_STATUS,
} from '../../lib/middlewareProgress'
import { fetchCheckResults } from '../../lib/middlewareChecks'

// The middleware track's shell: module list -> module landing -> lesson.
// Navigation is plain state (no router), matching the automation track.
// Progress is one localStorage key owned by middlewareProgress.js; check
// results come from the dev-server bridge (middlewareChecks.js) and are
// folded into progress whenever they are fetched.
export default function MiddlewareShell({ theme, onToggleTheme, track, onTrackChange }) {
  const [view, setView] = useState('home') // 'home' | 'module' | 'lesson'
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [progress, setProgress] = useState(() => loadMiddlewareProgress())
  const [checks, setChecks] = useState({ mode: 'idle', results: {}, fetchedAt: null })

  useEffect(() => {
    saveMiddlewareProgress(progress)
  }, [progress])

  // Fold a batch of check results into progress: a pass upgrades, a fail is
  // recorded without ever downgrading a passed lesson.
  const applyResults = useCallback((results) => {
    setProgress((prev) => {
      let next = prev
      Object.values(results).forEach((r) => {
        if (!LESSONS[r.lessonId]) return
        next = r.passed
          ? markPassed(next, r.lessonId, { checkedAt: r.timestamp || undefined })
          : markFailed(next, r.lessonId, r.failing, r.timestamp || undefined, LESSON_ORDER)
      })
      return next
    })
  }, [])

  // State is only set after the fetch resolves (never synchronously in the
  // effect), so a cancelled or stale call cannot cause cascading renders.
  const refreshChecks = useCallback(async () => {
    const outcome = await fetchCheckResults()
    if (outcome.mode === 'live') {
      setChecks({ mode: 'live', results: outcome.results, fetchedAt: outcome.fetchedAt })
      applyResults(outcome.results)
    } else {
      setChecks({ mode: 'unavailable', results: {}, fetchedAt: outcome.fetchedAt })
    }
  }, [applyResults])

  // Fetch once on entering the track and again whenever a lesson opens. On
  // the deployed site there is no bridge: after the first probe says so, stop
  // probing automatically (the Refresh button still can) so a built site does
  // not log a 404 on every lesson open. The async call is deferred out of the
  // effect body for the rule-of-hooks linter.
  const checksMode = checks.mode
  useEffect(() => {
    if (checksMode === 'unavailable') return undefined
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) refreshChecks()
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [refreshChecks, activeLessonId, checksMode])

  function statusOf(lessonId) {
    return deriveLessonStatus(progress, lessonId, LESSON_ORDER)
  }

  function openModule(moduleId) {
    setActiveModuleId(moduleId)
    setActiveLessonId(null)
    setView('module')
  }

  function openLesson(lessonId) {
    const lesson = LESSONS[lessonId]
    if (!lesson) return
    if (statusOf(lessonId) === LESSON_STATUS.LOCKED) return
    setActiveModuleId(lesson.module)
    setActiveLessonId(lessonId)
    setView('lesson')
  }

  function goHome() {
    setView('home')
    setActiveLessonId(null)
  }

  function backToModule() {
    setView('module')
    setActiveLessonId(null)
  }

  function handleSkip(lessonId) {
    setProgress((prev) => markSkipped(prev, lessonId, LESSON_ORDER))
  }

  function handleMarkDone(lessonId) {
    setProgress((prev) => markPassed(prev, lessonId, {}))
  }

  function handleSaveExplain(key, answers) {
    setProgress((prev) => saveExplain(prev, key, answers))
  }

  // Explain-only lessons pass once every question has an answer.
  function handleExplainPassed(lessonId) {
    setProgress((prev) => markPassed(prev, lessonId, {}))
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Reset the Middleware track? This clears its lesson progress and explain-it answers. The Automation track is not affected.'
    )
    if (!confirmed) return
    clearMiddlewareProgress()
    setProgress(loadMiddlewareProgress())
    goHome()
  }

  function continueFrontier() {
    const id = frontierLessonId(progress, LESSON_ORDER)
    if (id) openLesson(id)
  }

  const activeModule = activeModuleId ? MODULE_BY_ID[activeModuleId] : null
  const activeLesson = activeLessonId ? LESSONS[activeLessonId] : null
  const workbenchMode = view === 'lesson'

  const crumbs = [{ label: TRACK.name, onClick: view === 'home' ? null : goHome }]
  if (activeModule && view !== 'home') {
    crumbs.push({ label: `Module ${activeModule.order}: ${activeModule.title}`, onClick: view === 'lesson' ? backToModule : null })
  }
  if (activeLesson && view === 'lesson') crumbs.push({ label: activeLesson.title, onClick: null })

  return (
    <div className={`flex flex-col text-left text-sf-text ${workbenchMode ? 'h-screen overflow-hidden' : 'min-h-full'}`}>
      <MiddlewareHeader
        track={track}
        onTrackChange={onTrackChange}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onReset={handleReset}
        crumbs={crumbs}
        canReset={Object.keys(progress.lessons).length > 0 || Object.keys(progress.explainIt).length > 0}
      />
      <main className={workbenchMode ? 'min-h-0 flex-1' : ''}>
        {view === 'home' && (
          <TrackHome
            track={TRACK}
            modules={MODULES}
            progress={progress}
            lessonsForModule={lessonsForModule}
            statusOf={statusOf}
            onOpenModule={openModule}
            onContinue={continueFrontier}
            frontierLessonId={frontierLessonId(progress, LESSON_ORDER)}
          />
        )}
        {view === 'module' && activeModule && (
          <ModuleLanding
            module={activeModule}
            lessons={lessonsForModule(activeModule.id)}
            progress={progress}
            statusOf={statusOf}
            onOpenLesson={openLesson}
            onBack={goHome}
          />
        )}
        {view === 'lesson' && activeLesson && activeModule && (
          <LessonView
            key={activeLesson.id}
            lesson={activeLesson}
            module={activeModule}
            moduleLessons={lessonsForModule(activeModule.id)}
            status={statusOf(activeLesson.id)}
            progress={progress}
            checks={checks}
            onRefreshChecks={refreshChecks}
            onSkip={() => handleSkip(activeLesson.id)}
            onMarkDone={() => handleMarkDone(activeLesson.id)}
            onSaveExplain={handleSaveExplain}
            onExplainPassed={() => handleExplainPassed(activeLesson.id)}
            onBack={backToModule}
            nextLessonId={nextLessonId(activeLesson.id)}
            onOpenLesson={openLesson}
            nextStatus={nextLessonId(activeLesson.id) ? statusOf(nextLessonId(activeLesson.id)) : null}
          />
        )}
      </main>
    </div>
  )
}
