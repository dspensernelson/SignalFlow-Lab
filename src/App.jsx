import { Suspense, lazy, useEffect, useState } from 'react'
import BuilderWorkspace from './builder/BuilderWorkspace'
import ModuleSwitch from './builder/ModuleSwitch'
import { Logo } from './components/ui'

// The builder is home. The worksheet canvas, lesson workspace, artifact
// viewer, and the world-view overlay load on demand.
const ProjectCanvas = lazy(() => import('./components/ProjectCanvas'))
const LessonWorkspace = lazy(() => import('./components/LessonWorkspace'))
const ArtifactViewer = lazy(() => import('./components/ArtifactViewer'))
const WorldView = lazy(() => import('./builder/WorldView'))
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
import { PROJECTS, getProjectData, loadProject, saveProject, hasProjectData } from './lib/projects'
import { loadTheme, saveTheme, applyTheme } from './lib/theme'

// F7: each project's lesson registry is its own dynamic-import chunk, so a
// learner only downloads the lessons for the project they open. Projects with
// no built lessons yet resolve to an empty map.
const LESSON_MODULE_LOADERS = {
  'module-01': () => import('./data/lessons/module01Lessons.js'),
  'module-03': () => import('./data/lessons/module03Lessons.js'),
}

// Runnable-flow modules (the builder). A project with an entry here gets a
// "Build it" entry point on the canvas. Loaded on demand.
const FLOW_MODULE_LOADERS = {
  'module-02': async () => {
    const [data, ref] = await Promise.all([import('./data/flows/module-02.json'), import('./data/flows/module-02.reference.js')])
    return { moduleData: data.default, loadReference: ref.referenceFlowsFor }
  },
}
const FLOW_MODULE_IDS = Object.keys(FLOW_MODULE_LOADERS)

export default function App() {
  // Home is the first runnable-flow module unless the saved project is one.
  const [project, setProject] = useState(() => {
    const saved = loadProject()
    return FLOW_MODULE_IDS.includes(saved) ? saved : FLOW_MODULE_IDS[0] || saved
  })
  const [tier, setTier] = useState(() => loadTier())
  const [progress, setProgress] = useState(() => loadProgress())
  const [artifacts, setArtifacts] = useState(() => loadArtifacts())
  const [view, setView] = useState(() => (FLOW_MODULE_IDS.includes(loadProject()) || FLOW_MODULE_IDS.length ? 'builder' : 'canvas')) // 'builder' | 'world' | 'canvas' | 'lesson' | 'artifact'
  const [selectedNodeId, setSelectedNodeId] = useState(() =>
    getDefaultSelectedNodeId(loadProgress())
  )
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [theme, setTheme] = useState(() => loadTheme())
  // Loaded lesson registry, stamped with the project it belongs to so a
  // stale set from the previous project is ignored during a project swap.
  const [lessonSet, setLessonSet] = useState(null)
  // The loaded runnable-flow module for the builder view.
  const [flowModule, setFlowModule] = useState(null)
  // Load the flow module whenever the project has one.
  useEffect(() => {
    let cancelled = false
    const loader = FLOW_MODULE_LOADERS[project]
    if (!loader) return undefined
    loader().then((mod) => {
      if (!cancelled) setFlowModule({ project, ...mod })
    })
    return () => {
      cancelled = true
    }
  }, [project])

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
    setView(FLOW_MODULE_LOADERS[nextProject] ? 'builder' : 'canvas')
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

  // Open the builder for a project that has a runnable-flow module.
  function openBuilder(targetProject = project) {
    if (!FLOW_MODULE_LOADERS[targetProject]) return
    if (targetProject !== project) handleProjectChange(targetProject)
    else setView('builder')
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

  const shellHeaderLeft = (
    <div className="flex items-center gap-3">
      <span className="hidden whitespace-nowrap xl:inline-flex">
        <Logo size={20} uppercase wordmark="SignalFlow Lab" />
      </span>
      <ModuleSwitch projects={PROJECTS} value={project} flowModuleIds={FLOW_MODULE_IDS} hasData={hasProjectData} onChange={handleProjectChange} />
    </div>
  )

  if ((view === 'builder' || view === 'world') && FLOW_MODULE_LOADERS[project]) {
    if (!flowModule || flowModule.project !== project) {
      return <div className="flex h-screen items-center justify-center text-sm text-sf-muted">Loading the builder...</div>
    }
    return (
      <>
        <BuilderWorkspace
          key={project}
          moduleData={flowModule.moduleData}
          loadReference={flowModule.loadReference}
          theme={theme}
          onToggleTheme={toggleTheme}
          onWorld={() => setView('world')}
          headerLeft={shellHeaderLeft}
        />
        {view === 'world' && (
          <Suspense fallback={null}>
            <WorldView
              moduleData={flowModule.moduleData}
              project={PROJECTS.find((p) => p.id === project)}
              nodes={nodes}
              phases={phases}
              edges={edges}
              passed={JSON.parse(localStorage.getItem(`signalflow_flows__${project}`) || '{}').passed || {}}
              activeBuildId={(JSON.parse(localStorage.getItem(`signalflow_flows__${project}`) || '{}') || {}).activeBuildId}
              onOpenBuild={(buildId) => {
                try {
                  const key = `signalflow_flows__${project}`
                  const st = JSON.parse(localStorage.getItem(key) || 'null')
                  if (st) localStorage.setItem(key, JSON.stringify({ ...st, activeBuildId: buildId }))
                } catch {
                  // ignore
                }
                setFlowModule((m) => ({ ...m, nonce: (m.nonce || 0) + 1 }))
                setView('builder')
              }}
              onClose={() => setView('builder')}
            />
          </Suspense>
        )}
      </>
    )
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
      <Suspense fallback={null}>
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
        flowModuleIds={FLOW_MODULE_IDS}
        onBuild={openBuilder}
      />
      </Suspense>
    </div>
  )
}
