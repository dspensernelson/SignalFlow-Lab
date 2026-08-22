import { Suspense, lazy, useEffect, useState } from 'react'
import ProjectCanvas from './components/ProjectCanvas'

// F7: the lesson workspace and artifact viewer only render once a learner
// leaves the canvas, so they load on demand rather than in the initial bundle.
const LessonWorkspace = lazy(() => import('./components/LessonWorkspace'))
const ArtifactViewer = lazy(() => import('./components/ArtifactViewer'))
import {
  loadProgress,
  saveProgress,
  loadArtifacts,
  saveArtifacts,
  clearStorage,
  getDefaultSelectedNodeId,
  startNode,
  completeNode,
  restartNode,
  loadTier,
  saveTier,
  tierLessonId,
} from './lib/progress'
import { PROJECTS, getProjectData, loadProject, saveProject } from './lib/projects'
import { loadTheme, saveTheme, applyTheme } from './lib/theme'

// F7: each project's lesson registry is its own dynamic-import chunk, so a
// learner only downloads the lessons for the project they open. Projects with
// no built lessons yet resolve to an empty map.
const LESSON_MODULE_LOADERS = {
  'module-01': () => import('./data/lessons/module01Lessons.js'),
  'module-02': () => import('./data/lessons/module02Lessons.js'),
  'module-03': () => import('./data/lessons/module03Lessons.js'),
}

export default function App() {
  const [project, setProject] = useState(() => loadProject())
  const [tier, setTier] = useState(() => loadTier())
  const [progress, setProgress] = useState(() => loadProgress())
  const [artifacts, setArtifacts] = useState(() => loadArtifacts())
  const [view, setView] = useState('canvas') // 'canvas' | 'lesson' | 'artifact'
  const [selectedNodeId, setSelectedNodeId] = useState(() =>
    getDefaultSelectedNodeId(loadProgress())
  )
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [theme, setTheme] = useState(() => loadTheme())
  // Loaded lesson registry, stamped with the project it belongs to so a
  // stale set from the previous project is ignored during a project swap.
  const [lessonSet, setLessonSet] = useState(null)

  // The active project's workflow map (nodes/phases/edges) drives the canvas.
  const { nodes, phases, edges } = getProjectData(project)

  // The lesson registry for the active project, or null while its chunk loads.
  const lessons = lessonSet && lessonSet.project === project ? lessonSet.lessons : null

  // Load the active project's lesson chunk on mount and whenever the project
  // changes. State is only set asynchronously (after the chunk resolves) and
  // is discarded if the project changed again in the meantime.
  useEffect(() => {
    let cancelled = false
    const loader = LESSON_MODULE_LOADERS[project]
    const pending = loader ? loader() : Promise.resolve({ default: {} })
    pending.then((mod) => {
      if (!cancelled) setLessonSet({ project, lessons: mod.default })
    })
    return () => {
      cancelled = true
    }
  }, [project])

  // Apply and persist the theme whenever it changes.
  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  function toggleTheme(next) {
    setTheme(next === 'dark' || next === 'light' ? next : theme === 'dark' ? 'light' : 'dark')
  }

  // Persist progress and artifacts whenever they change, scoped to the active
  // tier + project so switching never writes to the wrong storage key.
  useEffect(() => {
    saveProgress(progress, tier, project)
  }, [progress, tier, project])

  useEffect(() => {
    saveArtifacts(artifacts, tier, project)
  }, [artifacts, tier, project])

  function handleSelect(nodeId) {
    setSelectedNodeId(nodeId)
    setNotice(null)
  }

  // Switching tiers swaps the whole working set: lessons resolve to the tier's
  // variants and progress/artifacts load from the tier's own storage keys.
  function handleTierChange(nextTier) {
    if (nextTier === tier) return
    saveTier(nextTier, project)
    setTier(nextTier)
    const freshProgress = loadProgress(nextTier, project)
    setProgress(freshProgress)
    setArtifacts(loadArtifacts(nextTier, project))
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(freshProgress, project))
    setView('canvas')
  }

  // Switching projects swaps the entire working set: map data, lesson registry,
  // unlock tree, and per-project progress/artifacts/tier storage. Behaves like a
  // tier switch - return to canvas on that project's own frontier.
  function handleProjectChange(nextProject) {
    if (nextProject === project) return
    saveProject(nextProject)
    setProject(nextProject)
    const nextTier = loadTier(nextProject)
    setTier(nextTier)
    const freshProgress = loadProgress(nextTier, nextProject)
    setProgress(freshProgress)
    setArtifacts(loadArtifacts(nextTier, nextProject))
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(freshProgress, nextProject))
    setView('canvas')
  }

  function openLesson(nodeId) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!lessons) {
      // The project's lesson chunk is still downloading; ask the learner to retry.
      setNotice('Loading lessons...')
      return
    }
    const lesson = node && lessons[tierLessonId(node.taskId, tier)]

    if (!lesson) {
      // NOTE: task-shaped nodes can be inspected, but only built lessons launch this pass.
      setNotice(
        tier === 'easy'
          ? 'This task is not built yet.'
          : `This task is not built for the ${tier} tier yet.`
      )
      return
    }

    setProgress((prev) => startNode(prev, nodeId))
    setActiveLessonId(lesson.id)
    setView('lesson')
    setNotice(null)
  }

  function handlePass(nodeId, artifact) {
    setArtifacts((prev) => ({ ...prev, [nodeId]: artifact }))
    setProgress((prev) => completeNode(prev, nodeId))
  }

  function handleViewArtifact(nodeId) {
    setSelectedNodeId(nodeId)
    setView('artifact')
  }

  function handleRestartNode(nodeId) {
    setProgress((prev) => restartNode(prev, nodeId))
    setArtifacts((prev) => {
      const next = { ...prev }
      delete next[nodeId]
      return next
    })
    setSelectedNodeId(nodeId)
  }

  function returnToCanvas(nextNodeId) {
    setView('canvas')
    setActiveLessonId(null)
    if (typeof nextNodeId === 'string' && nextNodeId) {
      setSelectedNodeId(nextNodeId)
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Start over? This clears your progress and saved artifacts for this project.'
    )
    if (!confirmed) return

    clearStorage(tier, project)
    const fresh = loadProgress(tier, project) // rebuilds and persists the initial state
    setProgress(fresh)
    setArtifacts({})
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(fresh, project))
    setView('canvas')
  }

  if (view === 'lesson' && activeLessonId) {
    const lesson = lessons && lessons[activeLessonId]
    if (!lesson) return null
    return (
      <Suspense fallback={null}>
        <LessonWorkspace
          lesson={lesson}
          tier={tier}
          onPass={handlePass}
          onReturnToCanvas={returnToCanvas}
        />
      </Suspense>
    )
  }

  if (view === 'artifact') {
    const node = nodes.find((n) => n.id === selectedNodeId)
    return (
      <Suspense fallback={null}>
        <ArtifactViewer
          node={node}
          artifact={artifacts[selectedNodeId]}
          onBack={returnToCanvas}
        />
      </Suspense>
    )
  }

  return (
    <div className="min-h-full">
      {notice && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4">
          <div className="rounded-md border border-sf-warning bg-sf-warning-weak px-4 py-3 text-sm text-sf-progress-text">
            {notice}
          </div>
        </div>
      )}
      <ProjectCanvas
        lessons={lessons}
        nodes={nodes}
        phases={phases}
        edges={edges}
        progress={progress}
        artifacts={artifacts}
        selectedNodeId={selectedNodeId}
        theme={theme}
        tier={tier}
        onTierChange={handleTierChange}
        projects={PROJECTS}
        project={project}
        onProjectChange={handleProjectChange}
        onToggleTheme={toggleTheme}
        onSelect={handleSelect}
        onStart={openLesson}
        onContinue={openLesson}
        onViewArtifact={handleViewArtifact}
        onReset={handleReset}
        onRestartNode={handleRestartNode}
      />
    </div>
  )
}
