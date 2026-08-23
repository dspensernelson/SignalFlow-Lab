// localStorage read/write helpers and runtime workflow-status derivation.
//
// Difficulty tiers: the same workflow map runs at three depths (easy, medium,
// hard). The active tier is persisted per project and read by every helper, so
// components never need to thread it through props.
//
// Multi-project: one app, many modules. The active project is persisted under
// signalflow_project (default module-01) and read the same way as the tier.
// Module 1 keeps ALL legacy storage keys byte-for-byte; every other project
// namespaces its keys with `__<projectId>`. Nodes, phases, the lesson path,
// and the unlock tree come from the active project's data set.

import {
  getProjectData,
  loadProject,
  hasProjectData,
  BUILT_LESSONS,
  DEFAULT_PROJECT,
} from './projects'

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

// The active project's nodes / phases / lesson path / prereq tree.
function projectNodes(project) {
  return getProjectData(hasProjectData(project) ? project : loadProject()).nodes
}
function projectLessonMeta(project) {
  return getProjectData(hasProjectData(project) ? project : loadProject()).lessonMeta || { LESSON_PATH: [], LESSON_PREREQS: {} }
}

// Tier is persisted per project. Module 1 keeps the legacy unsuffixed key.
function tierKeyFor(project) {
  const p = hasProjectData(project) ? project : loadProject()
  return p === DEFAULT_PROJECT ? TIER_KEY : `${TIER_KEY}__${p}`
}

export function loadTier(project) {
  try {
    const raw = localStorage.getItem(tierKeyFor(project))
    return TIERS.includes(raw) ? raw : 'easy'
  } catch {
    return 'easy'
  }
}

export function saveTier(tier, project) {
  if (TIERS.includes(tier)) localStorage.setItem(tierKeyFor(project), tier)
}

// Storage key for a base/tier/project. Module 1 keeps legacy keys exactly
// (easy unsuffixed, medium/hard `_tier` suffixed); every other project prefixes
// the base with `__<projectId>` before the tier suffix.
function keyFor(base, tier, project) {
  const p = hasProjectData(project) ? project : loadProject()
  const scoped = p === DEFAULT_PROJECT ? base : `${base}__${p}`
  return tier === 'easy' ? scoped : `${scoped}_${tier}`
}

// Node taskIds name the easy lesson; medium/hard lesson ids follow the
// convention `${taskId}-${tier}` (e.g. lesson-intake -> lesson-intake-medium).
export function tierLessonId(taskId, tier = loadTier()) {
  if (!taskId) return null
  return tier === 'easy' ? taskId : `${taskId}-${tier}`
}

// Lessons that are actually built, per tier, for the active project. Kept in
// src/lib/projects.js (BUILT_LESSONS[projectId][tier]); back-compat exports
// below mirror Module 1's lists for older callers/tests.
export const BUILT_LESSON_IDS_BY_TIER = BUILT_LESSONS[DEFAULT_PROJECT]

// Back-compat alias (easy tier), still used by older callers/tests.
export const BUILT_LESSON_IDS = BUILT_LESSON_IDS_BY_TIER.easy

// A node is buildable in the active tier/project when it has a task wired to a
// lesson built for that tier. Non-tier/non-project second/third arguments
// (e.g. the index/array Array#filter passes) fall back to the active values.
export function isBuildable(node, tier, project) {
  const activeTier = TIERS.includes(tier) ? tier : loadTier()
  const activeProject = hasProjectData(project) ? project : loadProject()
  if (!node.taskId) return false
  const built = (BUILT_LESSONS[activeProject] || {})[activeTier] || []
  return built.includes(tierLessonId(node.taskId, activeTier))
}

// Initial progress only tracks buildable task nodes; everything else is derived.
function buildInitialProgress(tier, project) {
  const progress = {}
  projectNodes(project)
    .filter((n) => isBuildable(n, tier, project))
    .forEach((node) => {
      progress[node.id] = STATUS.READY
    })
  return progress
}

// Ensures every buildable node has a stored status.
function reconcile(progress, tier, project) {
  const next = { ...progress }
  projectNodes(project)
    .filter((n) => isBuildable(n, tier, project))
    .forEach((node) => {
      if (!next[node.id]) next[node.id] = STATUS.READY
    })
  return next
}

export function loadProgress(tier = loadTier(), project = loadProject()) {
  try {
    const raw = localStorage.getItem(keyFor(PROGRESS_KEY, tier, project))
    if (!raw) {
      const initial = buildInitialProgress(tier, project)
      saveProgress(initial, tier, project)
      return initial
    }
    return reconcile(JSON.parse(raw), tier, project)
  } catch {
    const initial = buildInitialProgress(tier, project)
    saveProgress(initial, tier, project)
    return initial
  }
}

export function saveProgress(progress, tier = loadTier(), project = loadProject()) {
  localStorage.setItem(keyFor(PROGRESS_KEY, tier, project), JSON.stringify(progress))
}

export function loadArtifacts(tier = loadTier(), project = loadProject()) {
  try {
    const raw = localStorage.getItem(keyFor(ARTIFACTS_KEY, tier, project))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveArtifacts(artifacts, tier = loadTier(), project = loadProject()) {
  localStorage.setItem(keyFor(ARTIFACTS_KEY, tier, project), JSON.stringify(artifacts))
}

// Clears progress and artifacts for the active tier + project only. Also clears
// the tier-completion celebration flag so finishing again re-celebrates.
export function clearStorage(tier = loadTier(), project = loadProject()) {
  localStorage.removeItem(keyFor(PROGRESS_KEY, tier, project))
  localStorage.removeItem(keyFor(ARTIFACTS_KEY, tier, project))
  localStorage.removeItem(celebratedKey(tier, project))
}

// One-time "human moment" flags. The welcome card is app-global (shown once
// ever); the tier-completion celebration is scoped per project + tier (shown
// once per completed tier). Reads default to "already seen" if storage is
// unavailable so we never nag on a broken/private-mode client.
const WELCOME_KEY = 'signalflow_welcomed'

export function hasSeenWelcome() {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return true
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, '1')
  } catch {
    /* ignore: non-critical persistence */
  }
}

function celebratedKey(tier, project) {
  const p = hasProjectData(project) ? project : loadProject()
  const base = p === DEFAULT_PROJECT ? 'signalflow_tier_celebrated' : `signalflow_tier_celebrated__${p}`
  return `${base}_${tier}`
}

export function hasCelebratedTier(tier = loadTier(), project = loadProject()) {
  try {
    return localStorage.getItem(celebratedKey(tier, project)) === '1'
  } catch {
    return true
  }
}

export function markTierCelebrated(tier = loadTier(), project = loadProject()) {
  try {
    localStorage.setItem(celebratedKey(tier, project), '1')
  } catch {
    /* ignore: non-critical persistence */
  }
}

// The "you have seen this shape before" recurrence card is shown once per
// module (per project), the first time a learner enters a module that maps onto
// the shared workflow skeleton (module-02 and beyond). Scoped per project so
// each new module reintroduces the recurrence exactly once.
function recurrenceKey(project) {
  const p = hasProjectData(project) ? project : loadProject()
  return `signalflow_recurrence_seen__${p}`
}

export function hasSeenRecurrence(project = loadProject()) {
  try {
    return localStorage.getItem(recurrenceKey(project)) === '1'
  } catch {
    return true
  }
}

export function markRecurrenceSeen(project = loadProject()) {
  try {
    localStorage.setItem(recurrenceKey(project), '1')
  } catch {
    /* ignore: non-critical persistence */
  }
}

// Display/reading order of the lessons (the pedagogical path). Used for default
// selection and docs; unlocking is governed by the prerequisite tree, not this
// order. Both come from the active project's lessonMeta.json; the exports below
// mirror Module 1's for back-compat with older callers/tests.
export const LESSON_PATH = getProjectData(DEFAULT_PROJECT).lessonMeta.LESSON_PATH

export const LESSON_PREREQS = getProjectData(DEFAULT_PROJECT).lessonMeta.LESSON_PREREQS

// The lessons a given tier actually contains: the project's path filtered to
// built lessons.
export function tierPath(tier = loadTier(), project = loadProject()) {
  const nodes = projectNodes(project)
  return projectLessonMeta(project).LESSON_PATH.filter((id) => {
    const node = nodes.find((n) => n.id === id)
    return node && isBuildable(node, tier, project)
  })
}

// A tier may not build every node (hard is a curated set). Effective
// prerequisites skip unbuilt lessons transitively: if a prereq is not built
// in this tier, its own prereqs are required instead. So hard-tier lessons
// gate on the nearest built ancestors and unreachable prereqs collapse away.
export function effectivePrereqs(nodeId, tier = loadTier(), project = loadProject(), seen = new Set()) {
  const nodes = projectNodes(project)
  const prereqs = projectLessonMeta(project).LESSON_PREREQS
  const result = new Set()
  for (const prereqId of prereqs[nodeId] || []) {
    if (seen.has(prereqId)) continue
    seen.add(prereqId)
    const prereqNode = nodes.find((n) => n.id === prereqId)
    if (prereqNode && isBuildable(prereqNode, tier, project)) {
      result.add(prereqId)
    } else {
      effectivePrereqs(prereqId, tier, project, seen).forEach((id) => result.add(id))
    }
  }
  return Array.from(result)
}

// Resolves the visual status of a workflow node from stored progress + its
// type + the unlock tree. Completed and in-progress statuses always pass
// through; an unstarted lesson is READY only when every effective
// prerequisite is complete, otherwise it is LOCKED.
export function deriveNodeStatus(node, progress) {
  const project = loadProject()
  const tier = loadTier(project)
  if (isBuildable(node, tier, project)) {
    const stored = progress[node.id]
    if (stored === STATUS.COMPLETE || stored === STATUS.IN_PROGRESS) return stored
    const unlocked = effectivePrereqs(node.id, tier, project).every(
      (id) => progress[id] === STATUS.COMPLETE
    )
    return unlocked ? STATUS.READY : STATUS.LOCKED
  }
  if (node.type === 'source' || node.type === 'reference') return STATUS.CONTEXT
  // Task-shaped node (artifact/process/decision/handoff/output/archive) not built yet.
  return STATUS.LOCKED
}

// For a locked lesson, the incomplete prerequisite lessons blocking it (so
// the UI can say "complete X and Y first"). Returns an array of nodes.
export function getUnlockRequirement(node, progress, tier = loadTier(), project = loadProject()) {
  if (!isBuildable(node, tier, project)) return []
  const nodes = projectNodes(project)
  const path = projectLessonMeta(project).LESSON_PATH
  return effectivePrereqs(node.id, tier, project)
    .filter((id) => progress[id] !== STATUS.COMPLETE)
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean)
    .sort((a, b) => path.indexOf(a.id) - path.indexOf(b.id))
}

// Phase status mirrors the status of its statusSource node, if any.
export function derivePhaseStatus(phase, progress) {
  if (!phase.statusSource) return STATUS.LOCKED
  const node = projectNodes(loadProject()).find((n) => n.id === phase.statusSource)
  if (!node) return STATUS.LOCKED
  return deriveNodeStatus(node, progress)
}

// Default selected node: the in-progress lesson, else the path frontier (the
// first not-yet-complete lesson), else the start of the path.
export function getDefaultSelectedNodeId(progress, project = loadProject()) {
  const path = tierPath(loadTier(project), project)
  const inProgress = path.find((id) => progress[id] === STATUS.IN_PROGRESS)
  if (inProgress) return inProgress
  const frontier = path.find((id) => progress[id] !== STATUS.COMPLETE)
  if (frontier) return frontier
  return path[0] || projectNodes(project)[0].id
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
