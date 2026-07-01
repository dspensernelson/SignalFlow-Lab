// localStorage read/write helpers and runtime workflow-status derivation.

import nodes from '../data/workflowNodes.json'

export const PROGRESS_KEY = 'signalflow_progress'
export const ARTIFACTS_KEY = 'signalflow_artifacts'

export const STATUS = {
  CONTEXT: 'context', // inspectable source/reference object, not completable
  LOCKED: 'locked', // future task node, not buildable yet
  READY: 'ready',
  IN_PROGRESS: 'in-progress',
  COMPLETE: 'complete',
}

// Lessons that are actually built in this version. Keep in sync with App's LESSONS.
export const BUILT_LESSON_IDS = [
  'lesson-intake',
  'lesson-threshold-policy',
  'lesson-clean-price-data',
  'lesson-variance-check',
  'lesson-risk-evaluation',
  'lesson-approval-template',
  'lesson-approval-decision',
  'lesson-approval-route',
  'lesson-routine-update-path',
  'lesson-distribution-archive',
  'lesson-analyst-notes',
  'lesson-trader-flag',
  'lesson-price-feed',
  'lesson-forecast-data',
  'lesson-prior-day-reference',
  'lesson-prior-day-brief-template',
  'lesson-morning-brief',
]

// A node is buildable now when it has a task wired to a built lesson.
export function isBuildable(node) {
  return Boolean(node.taskId) && BUILT_LESSON_IDS.includes(node.taskId)
}

// Initial progress only tracks buildable task nodes; everything else is derived.
function buildInitialProgress() {
  const progress = {}
  nodes.filter(isBuildable).forEach((node) => {
    progress[node.id] = STATUS.READY
  })
  return progress
}

// Ensures every buildable node has a stored status.
function reconcile(progress) {
  const next = { ...progress }
  nodes.filter(isBuildable).forEach((node) => {
    if (!next[node.id]) next[node.id] = STATUS.READY
  })
  return next
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) {
      const initial = buildInitialProgress()
      saveProgress(initial)
      return initial
    }
    return reconcile(JSON.parse(raw))
  } catch {
    const initial = buildInitialProgress()
    saveProgress(initial)
    return initial
  }
}

export function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function loadArtifacts() {
  try {
    const raw = localStorage.getItem(ARTIFACTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveArtifacts(artifacts) {
  localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(artifacts))
}

export function clearStorage() {
  localStorage.removeItem(PROGRESS_KEY)
  localStorage.removeItem(ARTIFACTS_KEY)
}

// Resolves the visual status of a workflow node from stored progress + its type.
export function deriveNodeStatus(node, progress) {
  if (isBuildable(node)) return progress[node.id] || STATUS.READY
  if (node.type === 'source' || node.type === 'reference') return STATUS.CONTEXT
  // Task-shaped node (artifact/process/decision/handoff/output/archive) not built yet.
  return STATUS.LOCKED
}

// Phase status mirrors the status of its statusSource node, if any.
export function derivePhaseStatus(phase, progress) {
  if (!phase.statusSource) return STATUS.LOCKED
  const node = nodes.find((n) => n.id === phase.statusSource)
  if (!node) return STATUS.LOCKED
  return deriveNodeStatus(node, progress)
}

// Default selected node: an in-progress buildable node, else the first buildable node.
export function getDefaultSelectedNodeId(progress) {
  const inProgress = nodes.find(
    (n) => isBuildable(n) && progress[n.id] === STATUS.IN_PROGRESS
  )
  if (inProgress) return inProgress.id
  const buildable = nodes.find(isBuildable)
  return buildable ? buildable.id : nodes[0].id
}

export function startNode(progress, nodeId) {
  return { ...progress, [nodeId]: STATUS.IN_PROGRESS }
}

export function completeNode(progress, nodeId) {
  return { ...progress, [nodeId]: STATUS.COMPLETE }
}

// Resets a single task node back to ready so its task can be retaken.
export function restartNode(progress, nodeId) {
  return { ...progress, [nodeId]: STATUS.READY }
}
