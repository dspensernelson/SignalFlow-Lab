import { useEffect, useState } from 'react'
import nodes from './data/workflowNodes.json'
import phases from './data/phases.json'
import edges from './data/workflowEdges.json'
import lessonIntake from './data/lessons/lesson-intake.json'
import lessonThresholdPolicy from './data/lessons/lesson-threshold-policy.json'
import lessonCleanPriceData from './data/lessons/lesson-clean-price-data.json'
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
} from './lib/progress'

// Only built lessons are wired here. Other lessonIds resolve to undefined.
const LESSONS = {
  'lesson-intake': lessonIntake,
  'lesson-threshold-policy': lessonThresholdPolicy,
  'lesson-clean-price-data': lessonCleanPriceData,
}

export default function App() {
  const [progress, setProgress] = useState(() => loadProgress())
  const [artifacts, setArtifacts] = useState(() => loadArtifacts())
  const [view, setView] = useState('canvas') // 'canvas' | 'lesson' | 'artifact'
  const [selectedNodeId, setSelectedNodeId] = useState(() =>
    getDefaultSelectedNodeId(loadProgress())
  )
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [notice, setNotice] = useState(null)

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

  function openLesson(nodeId) {
    const node = nodes.find((n) => n.id === nodeId)
    const lesson = node && LESSONS[node.taskId]

    if (!lesson) {
      // NOTE: task-shaped nodes can be inspected, but only built lessons launch this pass.
      setNotice('This task is not built yet.')
      return
    }

    setProgress((prev) => startNode(prev, nodeId))
    setActiveLessonId(node.taskId)
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

  function returnToCanvas() {
    setView('canvas')
    setActiveLessonId(null)
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
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
