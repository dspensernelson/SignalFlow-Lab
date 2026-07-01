// localStorage read/write helpers and runtime workflow-status derivation.
//
// Difficulty tiers: the same workflow map runs at three depths (easy, medium,
// hard). The active tier is persisted under signalflow_tier and read by every
// helper, so components never need to thread it through props. Easy keeps the
// original storage keys for backward compatibility; medium/hard use suffixed
// keys so each tier has independent progress and artifacts.

import nodes from '../data/workflowNodes.json'

export const PROGRESS_KEY = 'signalflow_progress'
export const ARTIFACTS_KEY = 'signalflow_artifacts'
export const TIER_KEY = 'signalflow_tier'

export const TIERS = ['easy', 'medium', 'hard']

export const STATUS = {
  CONTEXT: 'context', // inspectable source/reference object, not completable
  LOCKED: 'locked', // future task node, not buildable yet
  READY: 'ready',
  IN_PROGRESS: 'in-progress',
  COMPLETE: 'complete',
}

export function loadTier() {
  try {
    const raw = localStorage.getItem(TIER_KEY)
    return TIERS.includes(raw) ? raw : 'easy'
  } catch {
    return 'easy'
  }
}

export function saveTier(tier) {
  if (TIERS.includes(tier)) localStorage.setItem(TIER_KEY, tier)
}

// Easy keys are unsuffixed so pre-tier progress carries over.
function keyFor(base, tier) {
  return tier === 'easy' ? base : `${base}_${tier}`
}

// Node taskIds name the easy lesson; medium/hard lesson ids follow the
// convention `${taskId}-${tier}` (e.g. lesson-intake -> lesson-intake-medium).
export function tierLessonId(taskId, tier = loadTier()) {
  if (!taskId) return null
  return tier === 'easy' ? taskId : `${taskId}-${tier}`
}

// Lessons that are actually built, per tier. Keep in sync with App's LESSONS.
export const BUILT_LESSON_IDS_BY_TIER = {
  easy: [
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
  ],
  medium: [
    'lesson-intake-medium',
    'lesson-clean-price-data-medium',
    'lesson-threshold-policy-medium',
    'lesson-variance-check-medium',
    'lesson-risk-evaluation-medium',
    'lesson-approval-decision-medium',
    'lesson-approval-route-medium',
  ],
  hard: [
    'lesson-intake-hard',
    'lesson-threshold-policy-hard',
    'lesson-price-feed-hard',
  ],
}

// Back-compat alias (easy tier), still used by older callers/tests.
export const BUILT_LESSON_IDS = BUILT_LESSON_IDS_BY_TIER.easy

// A node is buildable in the active tier when it has a task wired to a lesson
// built for that tier.
export function isBuildable(node, tier = loadTier()) {
  if (!node.taskId) return false
  const built = BUILT_LESSON_IDS_BY_TIER[tier] || []
  return built.includes(tierLessonId(node.taskId, tier))
}

// Initial progress only tracks buildable task nodes; everything else is derived.
function buildInitialProgress(tier) {
  const progress = {}
  nodes.filter((n) => isBuildable(n, tier)).forEach((node) => {
    progress[node.id] = STATUS.READY
  })
  return progress
}

// Ensures every buildable node has a stored status.
function reconcile(progress, tier) {
  const next = { ...progress }
  nodes.filter((n) => isBuildable(n, tier)).forEach((node) => {
    if (!next[node.id]) next[node.id] = STATUS.READY
  })
  return next
}

export function loadProgress(tier = loadTier()) {
  try {
    const raw = localStorage.getItem(keyFor(PROGRESS_KEY, tier))
    if (!raw) {
      const initial = buildInitialProgress(tier)
      saveProgress(initial, tier)
      return initial
    }
    return reconcile(JSON.parse(raw), tier)
  } catch {
    const initial = buildInitialProgress(tier)
    saveProgress(initial, tier)
    return initial
  }
}

export function saveProgress(progress, tier = loadTier()) {
  localStorage.setItem(keyFor(PROGRESS_KEY, tier), JSON.stringify(progress))
}

export function loadArtifacts(tier = loadTier()) {
  try {
    const raw = localStorage.getItem(keyFor(ARTIFACTS_KEY, tier))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveArtifacts(artifacts, tier = loadTier()) {
  localStorage.setItem(keyFor(ARTIFACTS_KEY, tier), JSON.stringify(artifacts))
}

// Clears progress and artifacts for the active tier only.
export function clearStorage(tier = loadTier()) {
  localStorage.removeItem(keyFor(PROGRESS_KEY, tier))
  localStorage.removeItem(keyFor(ARTIFACTS_KEY, tier))
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
  const buildable = nodes.find((n) => isBuildable(n))
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
