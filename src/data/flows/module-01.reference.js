// Reference solution for the Meridian builds. Used by the golden test (proves
// every build is passable, that the Day 1 flows fail Day 2, and that the Day 2
// flows fail Day 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'notes-flow': Flow, 'price-flow': Flow, 'brief-flow': Flow }
//
// Flows are cumulative: b4's price flow contains b2's and b3's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-01'

const one = (store, recordField, storeField, as, id) => createStep('lookup', { store, matchOn: [{ recordField, storeField }], as, mode: 'one' }, id)
const all = (store, as, id) => createStep('lookup', { store, matchOn: [], as, mode: 'all' }, id)

function notesSteps(level) {
  if (level < 1) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-notes-trigger')]
  return [createStep('trigger', { mode: 'event', source: 'desk-notes' }, 'ref-notes-trigger'), createStep('store', { store: 'intake-log' }, 'ref-notes-store')]
}

function priceSteps(level) {
  if (level < 2) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-price-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'price-feed' }, 'ref-price-trigger'), createStep('transform', { set: [{ field: 'price', expr: 'num(peakPrice)' }] }, 'ref-clean')]
  if (level >= 3) {
    steps.push(one('forecasts', 'hub', 'hub', 'forecast', 'ref-forecast'))
    steps.push(one('prior-day', 'hub', 'hub', 'prior', 'ref-prior'))
    steps.push(
      createStep(
        'transform',
        {
          set: [
            { field: 'vsForecast', expr: 'price - forecast.forecast' },
            { field: 'vsPriorDay', expr: 'price - prior.price' },
            { field: 'pctMove', expr: 'round(vsPriorDay / prior.price * 100, 1)' },
          ],
        },
        'ref-compare'
      )
    )
  }
  if (level >= 7) {
    const gap = createStep('condition', { rules: [{ left: 'pctMove', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-gap')
    gap.branches = {
      yes: [
        createStep('transform', { set: [{ field: 'status', expr: "'no data'" }] }, 'ref-gap-status'),
        createStep('send', { to: 'Risk Desk Lead', channel: 'email', subject: 'No move for {{hub}} today', body: 'The move for {{hub}} cannot be computed: today\'s price is "{{peakPrice}}" and yesterday\'s is "{{prior.price}}". It is marked no data in the brief.' }, 'ref-gap-send'),
        createStep('store', { store: 'hub-moves' }, 'ref-gap-store'),
        createStep('stop', {}, 'ref-gap-stop'),
      ],
      no: [],
    }
    steps.push(gap)
  }
  if (level >= 4) {
    steps.push(one('risk-policy', "'1.0.0'", 'version', 'policy', 'ref-policy'))
    steps.push(createStep('transform', { set: [{ field: 'status', expr: "if(abs(pctMove) >= policy.escalationThreshold, 'escalate', if(abs(pctMove) >= policy.routineThreshold, 'routine', 'normal'))" }] }, 'ref-classify'))
  }
  steps.push(createStep('store', { store: 'hub-moves' }, 'ref-price-store'))
  return steps
}

const BRIEF =
  '{{signoff}}\n# Meridian Morning Brief - {{day}}\n\nEscalations: {{escalations}}. Sign-off: {{approval.outcome}} {{approval.by}} {{approval.at}}\n\n## Hubs\n{{#each moves}}- {{hub}}: {{price}} ({{pctMove}}% vs yesterday, {{vsForecast}} vs forecast) - {{status}}\n{{/each}}\n## From the desk\n{{#each notes}}- {{from}} ({{hub}}): {{text}}\n{{/each}}'

function briefSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: '6:30 AM' }, 'ref-brief-trigger')]
  if (level < 5) return steps
  steps.push(all('hub-moves', 'moves', 'ref-moves'))
  steps.push(all('intake-log', 'notes', 'ref-notes'))
  steps.push(createStep('transform', { set: [{ field: 'escalations', expr: "count(moves, 'status', 'escalate')" }] }, 'ref-count'))
  const ask = createStep('condition', { rules: [{ left: 'escalations', op: '>', right: '0', rightKind: 'value' }], combine: 'all' }, 'ref-ask')
  const lane = [createStep('approval', { approver: 'Desk Manager', about: 'overnight moves' }, 'ref-approval')]
  if (level >= 8) {
    const unsigned = createStep('condition', { rules: [{ left: 'approval.outcome', op: '!=', right: 'approved', rightKind: 'value' }], combine: 'all' }, 'ref-unsigned')
    unsigned.branches = {
      yes: [
        createStep('transform', { set: [{ field: 'signoff', expr: "'PENDING SIGN-OFF'" }] }, 'ref-pending'),
        createStep('send', { to: 'Risk Desk Lead', channel: 'email', subject: 'No sign-off on the morning brief', body: 'The Desk Manager has not signed off on {{escalations}} escalated hub(s). The brief went out marked pending.' }, 'ref-pending-send'),
      ],
      no: [],
    }
    lane.push(unsigned)
  }
  ask.branches = { yes: lane, no: [] }
  steps.push(ask)
  steps.push(createStep('compose', { as: 'brief', template: BRIEF }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Trading Desk DL', channel: 'email', subject: 'Morning brief {{day}}', body: '{{brief}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'brief-archive' }, 'ref-archive'))
  if (level >= 6) steps.push(createStep('store', { store: 'prior-day', from: 'moves', mode: 'upsert', key: 'hub' }, 'ref-seed'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'notes-flow': createFlow({ id: 'notes-flow', moduleId: MODULE_ID, name: 'Desk notes', settings: defaultSettings(), steps: notesSteps(level) }),
    'price-flow': createFlow({ id: 'price-flow', moduleId: MODULE_ID, name: 'Overnight prices', settings: defaultSettings(), steps: priceSteps(level) }),
    'brief-flow': createFlow({ id: 'brief-flow', moduleId: MODULE_ID, name: 'The 6:30 AM brief', settings: defaultSettings(), steps: briefSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
