// Which record fields exist at a given point in a flow: the trigger's source
// fields plus whatever earlier steps attached or set. Used for editor
// autocompletion so the learner is not guessing field names.

import { walkSteps, findStep } from '../runtime/flowModel.js'

export function storeFields(moduleData, storeId) {
  const def = (moduleData.stores || []).find((s) => s.id === storeId)
  return def && def.fields ? def.fields : []
}

function addStepFields(step, moduleData, add) {
  const c = step.config || {}
  if (step.kind === 'trigger') {
    if (c.mode === 'schedule') ['runId', 'scheduledAt', 'day'].forEach(add)
    else {
      const src = (moduleData.sources || []).find((s) => s.id === c.source)
      ;(src && src.fields ? src.fields : []).forEach(add)
    }
  } else if (step.kind === 'lookup') {
    const as = c.as || c.store
    if (as) {
      add(as)
      if (c.mode !== 'all') storeFields(moduleData, c.store).forEach((f) => add(`${as}.${f}`))
    }
  } else if (step.kind === 'transform') {
    ;(c.set || []).forEach((s) => add(s.field))
  } else if (step.kind === 'approval') {
    ;['approval.outcome', 'approval.by', 'approval.at'].forEach(add)
  } else if (step.kind === 'compose') {
    add(c.as || 'body')
  }
}

// Fields set by the steps of a list (and its branches) before stopId.
function collect(steps, moduleData, stopId, add) {
  let reached = false
  walkSteps(steps, (step) => {
    if (reached || step.id === stopId) {
      reached = true
      return
    }
    addStepFields(step, moduleData, add)
  })
}

// The fields of one item of a list: the table's columns when a Lookup in
// all-rows mode produced it.
function itemFields(flow, moduleData, listName) {
  let out = []
  walkSteps(flow.steps, (step) => {
    const c = step.config || {}
    if (step.kind === 'lookup' && c.mode === 'all' && (c.as || c.store) === listName) out = storeFields(moduleData, c.store)
  })
  return out
}

export function availableFields(flow, moduleData, beforeStepId) {
  const fields = []
  const seen = new Set()
  const add = (f) => {
    if (f && !seen.has(f)) {
      seen.add(f)
      fields.push(f)
    }
  }
  // Inside a For each, the record is the item; the outer record is parent.
  const found = beforeStepId ? findStep(flow, beforeStepId) : null
  let loop = null
  if (found) {
    for (let i = found.path.length - 2; i >= 0; i -= 2) {
      if (found.path[i + 1] === 'each') {
        loop = findStep(flow, found.path[i])
        break
      }
    }
  }
  if (loop) {
    itemFields(flow, moduleData, loop.step.config.list).forEach(add)
    availableFields(flow, moduleData, loop.step.id).forEach((f) => add(`parent.${f}`))
    collect(loop.step.branches.each || [], moduleData, beforeStepId, add)
    return fields
  }
  collect(flow.steps, moduleData, beforeStepId, add)
  return fields
}
