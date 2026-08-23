// localStorage persistence for the runnable-flow builder.
//
//   state = { version, flows: {flowId: Flow}, passed: {buildId: true}, activeBuildId, skin }
//
// One key per module: signalflow_flows__<moduleId>. Independent of the
// worksheet-lesson progress keys, so the two paths never collide.

import { createFlow, createStep } from '../runtime/flowModel.js'

export const FLOW_STATE_VERSION = 1

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

// Fresh state for a module: every flow starts with just its trigger (source
// pre-wired for the event flow, schedule for the scheduled flow), nothing else.
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
  }
}

export function loadFlowState(moduleData) {
  const storage = safeStorage()
  const fresh = initialFlowState(moduleData)
  if (!storage) return fresh
  try {
    const raw = storage.getItem(flowStateKey(moduleData.moduleId))
    if (!raw) return fresh
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== FLOW_STATE_VERSION || !parsed.flows) return fresh
    // Any flow the module defines but the saved state lacks gets a fresh trigger.
    for (const id of Object.keys(fresh.flows)) if (!parsed.flows[id]) parsed.flows[id] = fresh.flows[id]
    if (!parsed.activeBuildId) parsed.activeBuildId = fresh.activeBuildId
    if (!parsed.passed) parsed.passed = {}
    if (!parsed.skin) parsed.skin = 'lab'
    return parsed
  } catch {
    return fresh
  }
}

export function saveFlowState(moduleId, state) {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(flowStateKey(moduleId), JSON.stringify(state))
  } catch {
    // Quota or privacy mode: the session still works in memory.
  }
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
