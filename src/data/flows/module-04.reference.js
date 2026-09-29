// Reference solution for the Relay builds. Used by the golden test (proves
// every build is passable, that the Day 1 flows fail Day 2, and that the Day 2
// flows fail Day 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'triage-flow': Flow, 'resolution-flow': Flow, 'digest-flow': Flow }
//
// Flows are cumulative: b3's triage flow contains b1's and b2's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-04'

const lookup = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'one' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function triageSteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'ticket-inbox' }, 'ref-t-trigger'), lookup('intent-taxonomy', [['symptom', 'symptom']], 'intent', 'ref-intent')]
  steps.push(set([['category', level >= 6 ? "coalesce(intent.category, 'unclassified')" : 'intent.category']], 'ref-classify'))
  if (level >= 6) {
    const unknown = createStep('condition', { rules: [{ left: 'intent', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-unknown')
    unknown.branches = { yes: [createStep('send', { to: 'Queue Lead', channel: 'email', subject: 'Unclassified: {{ticketId}}', body: '{{ticketId}} ({{subject}}) reports "{{symptom}}", which the taxonomy does not know. It is in triage-review.' }, 'ref-unknown-send')], no: [] }
    steps.push(unknown)
  }
  if (level >= 2) {
    steps.push(lookup('priority-matrix', [['impact', 'impact'], ['urgency', 'urgency']], 'matrix', 'ref-matrix'))
    steps.push(set([['priority', 'matrix.priority']], 'ref-priority'))
  }
  if (level >= 3) {
    steps.push(lookup('routing-table', [['category', 'category']], 'route', 'ref-route'))
    steps.push(set([['queue', 'route.queue']], 'ref-queue'))
    const p1 = createStep('condition', { rules: [{ left: 'priority', op: '==', right: 'P1', rightKind: 'value' }], combine: 'all' }, 'ref-p1')
    const lane = [
      createStep('send', { to: 'Tier-2 Engineer', channel: 'chat', subject: 'P1 {{ticketId}}: {{subject}}', body: 'P1 for {{from}}: {{subject}}. Acknowledge to take it.' }, 'ref-page'),
      createStep('approval', { approver: 'Tier-2 Engineer', about: 'P1 {{ticketId}}' }, 'ref-ack'),
      set([['escalatedTo', "'Tier-2 Engineer'"]], 'ref-esc-to'),
    ]
    if (level >= 8) {
      const unacked = createStep('condition', { rules: [{ left: 'approval.outcome', op: '!=', right: 'acknowledged', rightKind: 'value' }], combine: 'all' }, 'ref-unacked')
      unacked.branches = {
        yes: [
          createStep('send', { to: 'Duty Manager', channel: 'chat', subject: 'P1 {{ticketId}} not acknowledged by Tier-2', body: 'Nobody has acknowledged P1 {{ticketId}} ({{subject}}). You are next on the ladder.' }, 'ref-duty'),
          set([['escalatedTo', "'Duty Manager'"]], 'ref-esc-up'),
        ],
        no: [],
      }
      lane.push(unacked)
    }
    lane.push(createStep('store', { store: 'escalations' }, 'ref-esc-store'))
    p1.branches = { yes: lane, no: [createStep('store', { store: 'queue-assignments' }, 'ref-assign')] }
    steps.push(p1)
  }
  steps.push(createStep('store', { store: 'ticket-log' }, 'ref-log'))
  return steps
}

function resolutionSteps(level) {
  if (level < 4) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-r-trigger')]
  const steps = [
    createStep('trigger', { mode: 'event', source: 'resolutions' }, 'ref-r-trigger'),
    lookup('ticket-log', [['ticketId', 'ticketId']], 'ticket', 'ref-ticket'),
    lookup('sla-targets', [['ticket.priority', 'priority']], 'sla', 'ref-sla'),
    set(level >= 7 ? [['breached', 'minutes > sla.minutes'], ['misrouted', "workedCategory != ticket.category and ticket.category != 'unclassified'"]] : [['breached', 'minutes > sla.minutes']], 'ref-sla-check'),
  ]
  if (level >= 7) {
    const mis = createStep('condition', { rules: [{ left: 'misrouted', op: '==', right: 'true', rightKind: 'value' }], combine: 'all' }, 'ref-mis')
    mis.branches = {
      yes: [
        createStep('send', { to: 'Support Ops Analyst', channel: 'email', subject: 'Misroute: {{ticketId}}', body: '{{ticketId}} was triaged {{ticket.category}} and worked as {{workedCategory}} ({{fix}}). The taxonomy may need a change.' }, 'ref-mis-send'),
        createStep('store', { store: 'misroutes' }, 'ref-mis-log'),
      ],
      no: [],
    }
    steps.push(mis)
  }
  steps.push(createStep('store', { store: 'ticket-log', mode: 'update', key: 'ticketId' }, 'ref-resolve'))
  return steps
}

function digestSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: '5:00 PM' }, 'ref-d-trigger')]
  if (level < 5) return steps
  const counts = [['total', 'len(tickets)'], ['p1', "count(tickets, 'priority', 'P1')"], ['breaches', "count(tickets, 'breached', true)"]]
  if (level >= 7) counts.push(['misroutes', "count(tickets, 'misrouted', true)"])
  steps.push(createStep('lookup', { store: 'ticket-log', matchOn: [], as: 'tickets', mode: 'all' }, 'ref-tickets'))
  steps.push(set(counts, 'ref-counts'))
  steps.push(createStep('compose', { as: 'digest', template: '# Relay queue digest - {{day}}\n\nTickets: {{total}}. P1: {{p1}}. SLA breaches: {{breaches}}. Misroutes: {{misroutes}}.\n\n{{#each tickets}}- {{ticketId}} {{priority}} {{category}} -> {{queue}}{{/each}}' }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Support DL', channel: 'email', subject: 'Queue digest {{day}}', body: '{{digest}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'triage-archive' }, 'ref-archive'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'triage-flow': createFlow({ id: 'triage-flow', moduleId: MODULE_ID, name: 'Ticket triage', settings: defaultSettings(), steps: triageSteps(level) }),
    'resolution-flow': createFlow({ id: 'resolution-flow', moduleId: MODULE_ID, name: 'Resolutions', settings: defaultSettings(), steps: resolutionSteps(level) }),
    'digest-flow': createFlow({ id: 'digest-flow', moduleId: MODULE_ID, name: 'The 5:00 PM digest', settings: defaultSettings(), steps: digestSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
