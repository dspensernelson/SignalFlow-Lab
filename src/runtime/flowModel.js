// Flow model: the thing a learner builds. Pure data + immutable helpers.
//
//   Flow { id, moduleId, name, settings, steps: Step[] }
//   Step { id, kind, config, branches? }   // condition steps carry branches {yes, no}
//
// A "list path" addresses a step list inside the tree: [] is the root list,
// [stepId, 'yes'] is the yes-branch of the condition with that id. Lists can
// nest (a condition inside a branch), so paths can be longer: [id1,'no',id2,'yes'].

export const STEP_KINDS = ['trigger', 'lookup', 'transform', 'condition', 'approval', 'send', 'compose', 'store', 'stop']

export const CONDITION_OPS = ['==', '!=', '<', '<=', '>', '>=', 'exists', 'missing', 'contains']

let counter = 0
export function newId(prefix = 'step') {
  counter += 1
  return `${prefix}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function defaultConfig(kind) {
  switch (kind) {
    case 'trigger':
      return { source: '', mode: 'event', at: '' }
    case 'lookup':
      return { store: '', matchOn: [{ recordField: '', storeField: '' }], as: '', mode: 'one' }
    case 'transform':
      return { set: [{ field: '', expr: '' }] }
    case 'condition':
      return { rules: [{ left: '', op: '==', right: '', rightKind: 'value' }], combine: 'all' }
    case 'approval':
      return { approver: '', about: '' }
    case 'send':
      return { to: '', channel: 'email', subject: '', body: '' }
    case 'compose':
      return { template: '', as: 'body' }
    case 'store':
      return { store: '', from: '', mode: 'append', key: '' }
    case 'stop':
      return {}
    default:
      return {}
  }
}

export function defaultSettings() {
  return {
    connection: { system: '', identity: '', secretRef: '' },
    trigger: { mode: 'event', intervalMinutes: 15 },
    retries: 0,
    onFailure: 'skip',
  }
}

export function createStep(kind, configPatch = {}, id) {
  if (!STEP_KINDS.includes(kind)) throw new Error(`Unknown step kind "${kind}"`)
  const step = { id: id || newId(kind), kind, config: { ...defaultConfig(kind), ...configPatch } }
  if (kind === 'condition') step.branches = { yes: [], no: [] }
  return step
}

export function createFlow({ id, moduleId, name, steps = [], settings } = {}) {
  return {
    id: id || newId('flow'),
    moduleId: moduleId || '',
    name: name || 'Untitled flow',
    settings: settings || defaultSettings(),
    steps,
  }
}

// Deep clone via structured JSON (flows are plain data).
export function cloneFlow(flow) {
  return JSON.parse(JSON.stringify(flow))
}

export function getList(flow, path = []) {
  let list = flow.steps
  for (let i = 0; i < path.length; i += 2) {
    const step = list.find((s) => s.id === path[i])
    if (!step || !step.branches) return null
    list = step.branches[path[i + 1]]
    if (!list) return null
  }
  return list
}

// Depth-first walk. fn(step, path, index) - path is the list path containing the step.
export function walkSteps(steps, fn, path = []) {
  steps.forEach((step, index) => {
    fn(step, path, index)
    if (step.branches) {
      walkSteps(step.branches.yes, fn, [...path, step.id, 'yes'])
      walkSteps(step.branches.no, fn, [...path, step.id, 'no'])
    }
  })
}

export function findStep(flow, stepId) {
  let found = null
  walkSteps(flow.steps, (step, path, index) => {
    if (!found && step.id === stepId) found = { step, path, index }
  })
  return found
}

export function stepCount(flow) {
  let n = 0
  walkSteps(flow.steps, () => {
    n += 1
  })
  return n
}

export function allSteps(flow) {
  const out = []
  walkSteps(flow.steps, (step, path, index) => out.push({ step, path, index }))
  return out
}

// Rebuild the tree with `edit(list, path)` applied to every list (root and branches).
function mapLists(steps, edit, path = []) {
  const edited = edit(steps, path)
  return edited.map((step) => {
    if (!step.branches) return step
    return {
      ...step,
      branches: {
        yes: mapLists(step.branches.yes, edit, [...path, step.id, 'yes']),
        no: mapLists(step.branches.no, edit, [...path, step.id, 'no']),
      },
    }
  })
}

const samePath = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

export function insertStep(flow, path, index, step) {
  return {
    ...flow,
    steps: mapLists(flow.steps, (list, p) => {
      if (!samePath(p, path)) return list
      const i = Math.max(0, Math.min(index, list.length))
      return [...list.slice(0, i), step, ...list.slice(i)]
    }),
  }
}

export function updateStep(flow, stepId, patch) {
  return {
    ...flow,
    steps: mapLists(flow.steps, (list) =>
      list.map((s) => {
        if (s.id !== stepId) return s
        const next = { ...s, config: { ...s.config, ...(patch.config || {}) } }
        if (patch.branches) next.branches = patch.branches
        return next
      })
    ),
  }
}

export function removeStep(flow, stepId) {
  return { ...flow, steps: mapLists(flow.steps, (list) => list.filter((s) => s.id !== stepId)) }
}

export function moveStep(flow, stepId, delta) {
  return {
    ...flow,
    steps: mapLists(flow.steps, (list) => {
      const i = list.findIndex((s) => s.id === stepId)
      if (i < 0) return list
      const j = i + delta
      if (j < 0 || j >= list.length) return list
      const copy = list.slice()
      const [s] = copy.splice(i, 1)
      copy.splice(j, 0, s)
      return copy
    }),
  }
}

export function updateSettings(flow, patch) {
  return {
    ...flow,
    settings: {
      ...flow.settings,
      ...patch,
      connection: { ...flow.settings.connection, ...(patch.connection || {}) },
      trigger: { ...flow.settings.trigger, ...(patch.trigger || {}) },
    },
  }
}

// Human label for a step kind (neutral Lab vocabulary).
export const KIND_LABEL = {
  trigger: 'Trigger',
  lookup: 'Lookup',
  transform: 'Transform',
  condition: 'Condition',
  approval: 'Approval',
  send: 'Send',
  compose: 'Compose',
  store: 'Store',
  stop: 'Stop',
}

export const KIND_GLOSS = {
  trigger: 'something arrives, or a clock fires, and a run starts',
  lookup: 'read the reference table or history the run needs',
  transform: 'compute or normalize so the data is safe to compare',
  condition: 'branch the run on a rule someone owns',
  approval: 'a person decides, and the reply is captured',
  send: 'notify, route, or deliver to a person or queue',
  compose: 'assemble the deliverable from the record',
  store: 'write it, retain it, let it seed the next run',
  stop: 'end this record here; nothing after this step runs for it',
}
