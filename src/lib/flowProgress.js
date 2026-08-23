// localStorage persistence for the runnable-flow builder.
//
//   flow state (per module): { version, flows: {flowId: Flow},
//     passed: {buildId: { at, hintsUsed, runs, assisted }}, activeBuildId,
//     skin, introSeen, hintLevel: {buildId: 0-3}, runs: {buildId: n} }
//   concept state (global): { version, passed: {conceptId: { at, moduleId }} }
//
// Keys: signalflow_flows__<moduleId>, signalflow_concepts. Independent of the
// worksheet-lesson progress keys.

import { createFlow, createStep } from '../runtime/flowModel.js'

export const FLOW_STATE_VERSION = 2
export const CONCEPT_STATE_VERSION = 1
export const CONCEPTS_KEY = 'signalflow_concepts'

export function flowStateKey(moduleId) {
  return `signalflow_flows__${moduleId}`
}

function safeStorage() {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
  } catch {
    return null
  }
}

function read(key) {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or privacy mode: the session still works in memory.
  }
}

// Fresh state for a module: every flow starts with just its trigger.
export function initialFlowState(moduleData) {
  const flows = {}
  for (const def of moduleData.flows || []) {
    const trig = def.trigger && def.trigger.mode === 'schedule'
      ? createStep('trigger', { mode: 'schedule', at: def.trigger.at || '' })
      : createStep('trigger', { mode: 'event', source: '' })
    flows[def.id] = createFlow({ id: def.id, moduleId: moduleData.moduleId, name: def.name, steps: [trig] })
  }
  return {
    version: FLOW_STATE_VERSION,
    flows,
    passed: {},
    activeBuildId: moduleData.builds && moduleData.builds[0] ? moduleData.builds[0].id : null,
    skin: 'lab',
    introSeen: false,
    hintLevel: {},
    runs: {},
  }
}

// v1 -> v2: passed[buildId] was `true`; now a record.
export function migrateFlowState(parsed, fresh) {
  if (!parsed || !parsed.flows) return fresh
  const next = { ...fresh, ...parsed, version: FLOW_STATE_VERSION }
  for (const id of Object.keys(fresh.flows)) if (!next.flows[id]) next.flows[id] = fresh.flows[id]
  const passed = {}
  for (const [id, v] of Object.entries(parsed.passed || {})) {
    passed[id] = v === true ? { at: null, hintsUsed: 0, runs: 0, assisted: false } : v
  }
  next.passed = passed
  if (!next.activeBuildId) next.activeBuildId = fresh.activeBuildId
  if (!next.skin) next.skin = 'lab'
  if (typeof next.introSeen !== 'boolean') next.introSeen = false
  if (!next.hintLevel) next.hintLevel = {}
  if (!next.runs) next.runs = {}
  return next
}

export function loadFlowState(moduleData) {
  const fresh = initialFlowState(moduleData)
  const parsed = read(flowStateKey(moduleData.moduleId))
  if (!parsed) return fresh
  return migrateFlowState(parsed, fresh)
}

export function saveFlowState(moduleId, state) {
  write(flowStateKey(moduleId), state)
}

export function clearFlowState(moduleId) {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(flowStateKey(moduleId))
  } catch {
    // ignore
  }
}

// ---- concept (rosetta + waypoint) progress, global across modules

export function loadConceptState() {
  const parsed = read(CONCEPTS_KEY)
  if (!parsed || !parsed.passed) return { version: CONCEPT_STATE_VERSION, passed: {} }
  return parsed
}

export function saveConceptState(state) {
  write(CONCEPTS_KEY, state)
}

export function markConceptPassed(state, conceptId, moduleId, at = null) {
  if (state.passed[conceptId]) return state
  return { ...state, passed: { ...state.passed, [conceptId]: { at, moduleId } } }
}

// ---- gating + world-view status (pure)

// A build is unlocked when the previous build passed and its concepts are done.
export function isBuildUnlocked(builds, index, passed, conceptPassed) {
  if (index < 0 || index >= builds.length) return false
  const prevOk = index === 0 || !!(passed && passed[builds[index - 1].id])
  if (!prevOk) return false
  return (builds[index].requires || []).every((id) => conceptPassed && conceptPassed[id])
}

// Which concepts still gate a build (ordered as listed on the build).
export function pendingConcepts(build, conceptPassed) {
  return (build.requires || []).filter((id) => !(conceptPassed && conceptPassed[id]))
}

export const NODE_STATUS = {
  COMPLETE: 'complete',
  ACTIVE: 'active',
  LOCKED: 'locked',
  CONTEXT: 'context',
  ASSISTED: 'assisted',
}

// Node status for the world view, derived from builds[].mapNodes and passes.
//   complete  - every build listing the node has passed unassisted
//   assisted  - every build listing it passed, at least one with the example
//   active    - the current build lists it (and it is not complete)
//   locked    - only later builds list it
//   context   - no build lists it (source/reference context)
export function nodeStatusFromBuilds(moduleData, passed, activeBuildId) {
  const status = {}
  const builds = moduleData.builds || []
  const activeIdx = builds.findIndex((b) => b.id === activeBuildId)
  const covering = {}
  builds.forEach((b, i) => (b.mapNodes || []).forEach((n) => (covering[n] = covering[n] || []).push(i)))
  for (const [node, idxs] of Object.entries(covering)) {
    const recs = idxs.map((i) => passed && passed[builds[i].id])
    if (recs.every(Boolean)) status[node] = recs.some((r) => r.assisted) ? NODE_STATUS.ASSISTED : NODE_STATUS.COMPLETE
    else if (idxs.includes(activeIdx)) status[node] = NODE_STATUS.ACTIVE
    else status[node] = NODE_STATUS.LOCKED
  }
  return status
}

export function nodeBuilds(moduleData, nodeId) {
  return (moduleData.builds || []).filter((b) => (b.mapNodes || []).includes(nodeId))
}
