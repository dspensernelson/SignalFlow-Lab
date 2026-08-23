// Which record fields exist at a given point in a flow: the trigger's source
// fields plus whatever earlier steps attached or set. Used for editor
// autocompletion so the learner is not guessing field names.

import { walkSteps } from '../runtime/flowModel.js'

export function storeFields(moduleData, storeId) {
  const def = (moduleData.stores || []).find((s) => s.id === storeId)
  return def && def.fields ? def.fields : []
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
  let reached = false
  walkSteps(flow.steps, (step) => {
    if (reached || step.id === beforeStepId) {
      reached = true
      return
    }
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
  })
  return fields
}
