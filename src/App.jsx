import { useEffect, useState } from 'react'
import nodes from './data/workflowNodes.json'
import phases from './data/phases.json'
import edges from './data/workflowEdges.json'
import lessonIntake from './data/lessons/lesson-intake.json'
import lessonThresholdPolicy from './data/lessons/lesson-threshold-policy.json'
import lessonCleanPriceData from './data/lessons/lesson-clean-price-data.json'
import lessonVarianceCheck from './data/lessons/lesson-variance-check.json'
import lessonRiskEvaluation from './data/lessons/lesson-risk-evaluation.json'
import lessonApprovalTemplate from './data/lessons/lesson-approval-template.json'
import lessonApprovalDecision from './data/lessons/lesson-approval-decision.json'
import lessonApprovalRoute from './data/lessons/lesson-approval-route.json'
import lessonRoutineUpdatePath from './data/lessons/lesson-routine-update-path.json'
import lessonDistributionArchive from './data/lessons/lesson-distribution-archive.json'
import lessonAnalystNotes from './data/lessons/lesson-analyst-notes.json'
import lessonTraderFlag from './data/lessons/lesson-trader-flag.json'
import lessonPriceFeed from './data/lessons/lesson-price-feed.json'
import lessonForecastData from './data/lessons/lesson-forecast-data.json'
import lessonPriorDayReference from './data/lessons/lesson-prior-day-reference.json'
import lessonPriorDayBriefTemplate from './data/lessons/lesson-prior-day-brief-template.json'
import lessonMorningBrief from './data/lessons/lesson-morning-brief.json'
import ProjectCanvas from './components/ProjectCanvas'
import LessonWorkspace from './components/LessonWorkspace'
import ArtifactViewer from './components/ArtifactViewer'
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
import { loadTheme, saveTheme, applyTheme } from './lib/theme'

// Only built lessons are wired here. Other lessonIds resolve to undefined.
const LESSONS = {
  'lesson-intake': lessonIntake,
  'lesson-threshold-policy': lessonThresholdPolicy,
  'lesson-clean-price-data': lessonCleanPriceData,
  'lesson-variance-check': lessonVarianceCheck,
  'lesson-risk-evaluation': lessonRiskEvaluation,
  'lesson-approval-template': lessonApprovalTemplate,
  'lesson-approval-decision': lessonApprovalDecision,
  'lesson-approval-route': lessonApprovalRoute,
  'lesson-routine-update-path': lessonRoutineUpdatePath,
  'lesson-distribution-archive': lessonDistributionArchive,
  'lesson-analyst-notes': lessonAnalystNotes,
  'lesson-trader-flag': lessonTraderFlag,
  'lesson-price-feed': lessonPriceFeed,
  'lesson-forecast-data': lessonForecastData,
  'lesson-prior-day-reference': lessonPriorDayReference,
  'lesson-prior-day-brief-template': lessonPriorDayBriefTemplate,
  'lesson-morning-brief': lessonMorningBrief,
}

export default function App() {
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

  // Apply and persist the theme whenever it changes.
  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  function toggleTheme(next) {
    setTheme(next === 'dark' || next === 'light' ? next : theme === 'dark' ? 'light' : 'dark')
  }

  // Persist progress and artifacts whenever they change.
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    saveArtifacts(artifacts)
  }, [artifacts])

  function handleSelect(nodeId) {
    setSelectedNodeId(nodeId)
    setNotice(null)
  }

  // Switching tiers swaps the whole working set: lessons resolve to the tier's
  // variants and progress/artifacts load from the tier's own storage keys.
  function handleTierChange(nextTier) {
    if (nextTier === tier) return
    saveTier(nextTier)
    setTier(nextTier)
    const freshProgress = loadProgress(nextTier)
    setProgress(freshProgress)
    setArtifacts(loadArtifacts(nextTier))
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(freshProgress))
    setView('canvas')
  }

  function openLesson(nodeId) {
    const node = nodes.find((n) => n.id === nodeId)
    const lesson = node && LESSONS[tierLessonId(node.taskId, tier)]

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

    clearStorage()
    const fresh = loadProgress() // rebuilds and persists the initial state
    setProgress(fresh)
    setArtifacts({})
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(fresh))
    setView('canvas')
  }

  if (view === 'lesson' && activeLessonId) {
    const lesson = LESSONS[activeLessonId]
    return (
      <LessonWorkspace
        lesson={lesson}
        onPass={handlePass}
        onReturnToCanvas={returnToCanvas}
      />
    )
  }

  if (view === 'artifact') {
    const node = nodes.find((n) => n.id === selectedNodeId)
    return (
      <ArtifactViewer
        node={node}
        artifact={artifacts[selectedNodeId]}
        onBack={returnToCanvas}
      />
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
        nodes={nodes}
        phases={phases}
        edges={edges}
        progress={progress}
        selectedNodeId={selectedNodeId}
        theme={theme}
        tier={tier}
        onTierChange={handleTierChange}
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
