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
    'lesson-analyst-notes-medium',
    'lesson-trader-flag-medium',
    'lesson-price-feed-medium',
    'lesson-forecast-data-medium',
    'lesson-prior-day-reference-medium',
    'lesson-prior-day-brief-template-medium',
    'lesson-approval-template-medium',
    'lesson-routine-update-path-medium',
    'lesson-morning-brief-medium',
    'lesson-distribution-archive-medium',
  ],
  hard: [
    'lesson-intake-hard',
    'lesson-threshold-policy-hard',
    'lesson-price-feed-hard',
    'lesson-approval-route-hard',
    'lesson-risk-evaluation-hard',
    'lesson-morning-brief-hard',
    'lesson-distribution-archive-hard',
  ],
}

// Back-compat alias (easy tier), still used by older callers/tests.
export const BUILT_LESSON_IDS = BUILT_LESSON_IDS_BY_TIER.easy

// A node is buildable in the active tier when it has a task wired to a lesson
// built for that tier. Non-tier second arguments (e.g. the index Array#filter
// passes when this is used as a callback) fall back to the active tier.
export function isBuildable(node, tier) {
  const activeTier = TIERS.includes(tier) ? tier : loadTier()
  if (!node.taskId) return false
  const built = BUILT_LESSON_IDS_BY_TIER[activeTier] || []
  return built.includes(tierLessonId(node.taskId, activeTier))
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

// The forced lesson order (the pedagogical path from NODE_AUDIT item 7).
// Exactly one lesson is READY at a time: completing it unlocks the next.
// Each tier walks this same path filtered to the lessons built for that tier.
export const LESSON_PATH = [
  'analyst-notes',
  'trader-flag',
  'market-intake-record',
  'price-feed',
  'forecast-data',
  'prior-day-reference',
  'clean-price-data',
  'threshold-policy',
  'variance-check',
  'risk-evaluation',
  'approval-template',
  'approval-decision',
  'approval-route',
  'routine-update-path',
  'prior-day-brief-template',
  'morning-brief',
  'distribution-archive',
]

// The path a given tier actually walks: LESSON_PATH filtered to built lessons.
export function tierPath(tier = loadTier()) {
  return LESSON_PATH.filter((id) => {
    const node = nodes.find((n) => n.id === id)
    return node && isBuildable(node, tier)
  })
}

// Resolves the visual status of a workflow node from stored progress + its
// type + its position on the tier's lesson path. Completed and in-progress
// statuses always pass through; an unstarted lesson is READY only when every
// earlier lesson on the path is complete, otherwise it is LOCKED.
export function deriveNodeStatus(node, progress) {
  const tier = loadTier()
  if (isBuildable(node, tier)) {
    const stored = progress[node.id]
    if (stored === STATUS.COMPLETE || stored === STATUS.IN_PROGRESS) return stored
    const path = tierPath(tier)
    const idx = path.indexOf(node.id)
    if (idx === -1) return stored || STATUS.READY
    const unlocked = path.slice(0, idx).every((id) => progress[id] === STATUS.COMPLETE)
    return unlocked ? STATUS.READY : STATUS.LOCKED
  }
  if (node.type === 'source' || node.type === 'reference') return STATUS.CONTEXT
  // Task-shaped node (artifact/process/decision/handoff/output/archive) not built yet.
  return STATUS.LOCKED
}

// For a locked lesson, names the earliest incomplete lesson blocking it (so
// the UI can say "complete X first"). Returns the blocking node or null.
export function getUnlockRequirement(node, progress, tier = loadTier()) {
  if (!isBuildable(node, tier)) return null
  const path = tierPath(tier)
  const idx = path.indexOf(node.id)
  if (idx <= 0) return null
  const blockingId = path
    .slice(0, idx)
    .find((id) => progress[id] !== STATUS.COMPLETE)
  if (!blockingId) return null
  return nodes.find((n) => n.id === blockingId) || null
}

// Phase status mirrors the status of its statusSource node, if any.
export function derivePhaseStatus(phase, progress) {
  if (!phase.statusSource) return STATUS.LOCKED
  const node = nodes.find((n) => n.id === phase.statusSource)
  if (!node) return STATUS.LOCKED
  return deriveNodeStatus(node, progress)
}

// Default selected node: the in-progress lesson, else the path frontier (the
// first not-yet-complete lesson), else the start of the path.
export function getDefaultSelectedNodeId(progress) {
  const path = tierPath()
  const inProgress = path.find((id) => progress[id] === STATUS.IN_PROGRESS)
  if (inProgress) return inProgress
  const frontier = path.find((id) => progress[id] !== STATUS.COMPLETE)
  if (frontier) return frontier
  return path[0] || nodes[0].id
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
