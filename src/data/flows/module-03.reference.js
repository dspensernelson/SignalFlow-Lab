// Reference solution for the Harbor builds. Used by the golden test (proves
// every build is passable, that the Day 1 flows really fail Day 2, and that
// the Day 2 flows really fail Day 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'offer-flow': Flow, 'update-flow': Flow, 'sweep-flow': Flow }
//
// Flows are cumulative: b4's update flow contains b3's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-03'

const one = (store, recordField, storeField, as) => createStep('lookup', { store, matchOn: [{ recordField, storeField }], as, mode: 'one' }, `ref-${as}`)

function offerSteps(level) {
  const safe = level >= 5
  const steps = [
    createStep('trigger', { mode: 'event', source: 'signed-offers' }, 'ref-offer-trigger'),
    one('role-profiles', 'role', 'role', 'profile'),
    createStep('store', safe ? { store: 'onboarding-records', mode: 'upsert', key: 'hireId' } : { store: 'onboarding-records' }, 'ref-record'),
  ]
  if (level >= 2) {
    steps.push(createStep('lookup', { store: 'sla-policy', matchOn: [], as: 'sla', mode: 'all' }, 'ref-sla'))
    const each = createStep('foreach', { list: 'sla' }, 'ref-plan')
    each.branches = {
      each: [
        createStep('transform', { set: [{ field: 'hireId', expr: 'parent.hireId' }, { field: 'due', expr: "concat('SD-', daysBefore)" }, { field: 'state', expr: "'pending'" }] }, 'ref-plan-row'),
        createStep('store', safe ? { store: 'task-board', mode: 'upsert', key: 'hireId, taskId' } : { store: 'task-board' }, 'ref-plan-store'),
      ],
    }
    steps.push(each)
  }
  return steps
}

function updateSteps(level) {
  if (level < 3) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-update-trigger')]
  const steps = [
    createStep('trigger', { mode: 'event', source: 'task-updates' }, 'ref-update-trigger'),
    createStep('store', { store: 'task-board', mode: 'update', key: 'hireId, taskId' }, 'ref-update'),
  ]
  if (level >= 6) {
    const blocked = createStep('condition', { rules: [{ left: 'state', op: '==', right: 'blocked', rightKind: 'value' }], combine: 'all' }, 'ref-blocked')
    blocked.branches = {
      yes: [
        createStep('send', { to: 'People Ops Lead', channel: 'email', subject: 'Blocked: {{taskId}} for {{hireId}}', body: '{{taskId}} for {{hireId}} is blocked: {{note}} (reported by {{by}}).' }, 'ref-blocked-send'),
        createStep('store', { store: 'escalations' }, 'ref-blocked-log'),
      ],
      no: [],
    }
    steps.push(blocked)
  }
  if (level >= 4) {
    steps.push(createStep('lookup', { store: 'task-board', matchOn: [{ recordField: 'hireId', storeField: 'hireId' }], as: 'tasks', mode: 'all' }, 'ref-tasks'))
    steps.push(createStep('transform', { set: [{ field: 'done', expr: "count(tasks, 'state', 'done')" }] }, 'ref-count'))
    const gate = createStep('condition', { rules: [{ left: 'done', op: '==', right: 'len(tasks)', rightKind: 'field' }], combine: 'all' }, 'ref-gate')
    gate.branches = {
      yes: [
        one('onboarding-records', 'hireId', 'hireId', 'hire'),
        createStep('compose', { as: 'package', template: '# Day-One Package - {{hire.name}}\n\nRole: {{hire.role}}\nStarts: {{hire.startDate}}\nReadiness: Day-One Ready\n\n{{#each tasks}}- {{taskId}}: {{state}} ({{owner}}, due {{due}})\n{{/each}}' }, 'ref-compose'),
        createStep('send', { to: 'Hiring Manager', channel: 'email', subject: '{{hire.name}} is Day-One Ready', body: '{{package}}' }, 'ref-send'),
        createStep('store', { store: 'day-one-packages' }, 'ref-archive'),
      ],
      no: [],
    }
    steps.push(gate)
  }
  return steps
}

function sweepSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: '5:00 PM' }, 'ref-sweep-trigger')]
  if (level >= 7) {
    steps.push(createStep('lookup', { store: 'task-board', matchOn: [], as: 'tasks', mode: 'all' }, 'ref-sweep-tasks'))
    const each = createStep('foreach', { list: 'tasks' }, 'ref-sweep-each')
    const late = createStep('condition', { rules: [{ left: 'state', op: '!=', right: 'done', rightKind: 'value' }], combine: 'all' }, 'ref-sweep-late')
    late.branches = {
      yes: [
        createStep('send', { to: 'People Ops Lead', channel: 'email', subject: 'Not done at 5 PM: {{taskId}} for {{hireId}}', body: '{{taskId}} for {{hireId}} is {{state}} at the 5 PM check (owner {{owner}}, due {{due}}).' }, 'ref-sweep-send'),
        createStep('store', { store: 'escalations' }, 'ref-sweep-log'),
      ],
      no: [],
    }
    each.branches = { each: [late] }
    steps.push(each)
  }
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'offer-flow': createFlow({ id: 'offer-flow', moduleId: MODULE_ID, name: 'New hire intake', settings: defaultSettings(), steps: offerSteps(level) }),
    'update-flow': createFlow({ id: 'update-flow', moduleId: MODULE_ID, name: 'Task updates', settings: defaultSettings(), steps: updateSteps(level) }),
    'sweep-flow': createFlow({ id: 'sweep-flow', moduleId: MODULE_ID, name: 'The 5:00 PM check', settings: defaultSettings(), steps: sweepSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
