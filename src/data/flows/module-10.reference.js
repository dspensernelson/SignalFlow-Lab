// Reference solution for the Watchtower builds. Used by the golden test
// (proves every build is passable, that the Month 1 flows fail Month 2, and
// that the Month 2 flows fail Month 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'telemetry-flow', 'runbook-flow', 'postmortem-flow' }

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-10'

const one = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'one' }, id)
const allWhere = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'all' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function telemetrySteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'telemetry' }, 'ref-t-trigger'), one('alert-thresholds', [['service', 'service'], ['metric', 'metric']], 'threshold', 'ref-threshold')]
  const trip = createStep('condition', { rules: [{ left: 'value', op: '>=', right: 'threshold.limit', rightKind: 'field' }], combine: 'all' }, 'ref-trip')
  const lane = [set([['limit', 'threshold.limit']], 'ref-limit'), createStep('store', { store: 'alert-events' }, 'ref-alert')]
  if (level >= 6) {
    lane.push(one('incidents', [['service', 'service'], ['metric', 'metric'], ["'open'", 'status']], 'open', 'ref-open'))
    const storm = createStep('condition', { rules: [{ left: 'open', op: 'exists', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-storm')
    storm.branches = { yes: [set([['incidentId', 'open.incidentId'], ['alertCount', 'open.alertCount + 1'], ['minute', 'open.minute']], 'ref-absorb'), createStep('store', { store: 'incidents', mode: 'update', key: 'incidentId' }, 'ref-absorb-store'), createStep('stop', {}, 'ref-absorb-stop')], no: [] }
    lane.push(storm)
  }
  if (level >= 2) {
    lane.push(one('severity-matrix', [['threshold.impact', 'impact'], ['threshold.scope', 'scope']], 'sev', 'ref-sev'))
    lane.push(set([['incidentId', "concat(service, '-', metric, '-', minute)"], ['severity', 'sev.severity'], ['status', "'open'"], ['alertCount', '1']], 'ref-incident'))
    const page = createStep('condition', { rules: [{ left: 'sev.page', op: '==', right: 'true', rightKind: 'value' }], combine: 'all' }, 'ref-page')
    const paging = [
      createStep('send', { to: 'On-call Engineer', channel: 'chat', subject: '{{severity}} {{service}} {{metric}} {{value}}{{unit}}', body: '{{incidentId}}: {{service}} {{metric}} is {{value}}{{unit}} against a limit of {{limit}}. Acknowledge to take it.' }, 'ref-page-send'),
      createStep('approval', { approver: 'On-call Engineer', about: '{{incidentId}}' }, 'ref-ack'),
      set([['pagedTo', "'On-call Engineer'"]], 'ref-paged-to'),
    ]
    if (level >= 8) {
      const unacked = createStep('condition', { rules: [{ left: 'approval.outcome', op: '!=', right: 'acknowledged', rightKind: 'value' }], combine: 'all' }, 'ref-unacked')
      unacked.branches = { yes: [createStep('send', { to: 'Incident Commander', channel: 'chat', subject: '{{severity}} {{service}}: no acknowledgement from the on-call', body: '{{incidentId}} was paged to the On-call Engineer and not acknowledged. You are next on the ladder.' }, 'ref-ic-send'), set([['pagedTo', "'Incident Commander'"]], 'ref-ic')], no: [] }
      paging.push(unacked)
    }
    paging.push(createStep('send', { to: 'Status Page', channel: 'web', subject: 'Investigating {{service}} {{metric}}', body: 'We are investigating elevated {{metric}} on {{service}}. Updates to follow.' }, 'ref-status-investigating'))
    page.branches = { yes: paging, no: [createStep('store', { store: 'watch-log' }, 'ref-watch')] }
    lane.push(page)
    lane.push(createStep('store', { store: 'incidents', mode: 'upsert', key: 'incidentId' }, 'ref-incident-store'))
  }
  trip.branches = { yes: lane, no: [] }
  steps.push(trip)
  return steps
}

function runbookSteps(level) {
  if (level < 3) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-r-trigger')]
  const steps = [
    createStep('trigger', { mode: 'event', source: 'responder-actions' }, 'ref-r-trigger'),
    one('incidents', [['incidentId', 'incidentId']], 'incident', 'ref-r-incident'),
    one('runbook-library', [['incident.service', 'service'], ['step', 'step']], 'runbook', 'ref-runbook'),
    set([['action', 'runbook.action']], 'ref-action'),
    createStep('store', { store: 'executions' }, 'ref-execution'),
  ]
  if (level >= 7) {
    const dev = createStep('condition', { rules: [{ left: 'outcome', op: '==', right: 'deviated', rightKind: 'value' }], combine: 'all' }, 'ref-deviated')
    dev.branches = { yes: [createStep('store', { store: 'deviations' }, 'ref-deviation'), createStep('send', { to: 'SRE Lead', channel: 'email', subject: 'Runbook {{incident.service}} step {{step}} deviated: {{note}}', body: 'During {{incidentId}}, {{by}} reported step {{step}} ("{{action}}") did not match reality: {{note}}. The runbook needs an edit.' }, 'ref-deviation-send')], no: [] }
    steps.push(dev)
  }
  const resolve = createStep('condition', { rules: [{ left: 'step', op: '==', right: 'resolve', rightKind: 'value' }], combine: 'all' }, 'ref-resolve')
  resolve.branches = {
    yes: [set([['status', "'resolved'"], ['resolvedMinute', 'minute'], ['mttr', 'minute - incident.minute']], 'ref-close'), createStep('store', { store: 'incidents', mode: 'update', key: 'incidentId' }, 'ref-close-store'), createStep('send', { to: 'Status Page', channel: 'web', subject: 'Resolved {{incident.service}}', body: '{{incident.service}} {{incident.metric}} is back to normal as of minute {{minute}}: {{note}}' }, 'ref-status-resolved')],
    no: [],
  }
  steps.push(resolve)
  return steps
}

function postmortemSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Month end' }, 'ref-p-trigger')]
  if (level < 4) return steps
  steps.push(allWhere('incidents', [["'resolved'", 'status']], 'resolved', 'ref-resolved'))
  const each = createStep('foreach', { list: 'resolved' }, 'ref-pm-each')
  const body = [allWhere('executions', [['incidentId', 'incidentId']], 'steps', 'ref-pm-steps'), set([['stepsTaken', 'len(steps)']], 'ref-pm-fields'), createStep('store', { store: 'postmortems', mode: 'upsert', key: 'incidentId' }, 'ref-pm-store'), set([['status', "'closed'"]], 'ref-pm-close'), createStep('store', { store: 'incidents', mode: 'update', key: 'incidentId' }, 'ref-pm-close-store')]
  if (level >= 5) {
    body.push(one('alert-thresholds', [['service', 'service'], ['metric', 'metric']], 'threshold', 'ref-pm-threshold'))
    body.push(set([['item', "concat('review ', service, ' ', metric, ' threshold')"], ['owner', "'Service Owner'"], ['dueDay', '14'], ['limit', 'threshold.limit']], 'ref-pm-actions'))
    body.push(createStep('store', { store: 'action-items' }, 'ref-action-item'))
    body.push(createStep('store', { store: 'tuning-proposals' }, 'ref-proposal'))
    body.push(createStep('send', { to: 'Service Owner', channel: 'email', subject: 'Review {{service}} {{metric}} limit {{limit}}: {{severity}}, {{mttr}} min', body: '{{incidentId}} tripped the {{service}} {{metric}} limit of {{limit}} and absorbed {{alertCount}} alert(s); {{severity}}, resolved in {{mttr}} minutes. Please review the threshold by day {{dueDay}}.' }, 'ref-proposal-send'))
  }
  each.branches = { each: body }
  steps.push(each)
  steps.push(set([['incidents', 'len(resolved)'], ['totalMttr', "sum(resolved, 'mttr')"]], 'ref-report-counts'))
  steps.push(createStep('compose', { as: 'report', template: '# Watchtower reliability report - {{day}}\n\nIncidents: {{incidents}}. Total minutes to resolve: {{totalMttr}}.\n\n{{#each resolved}}- {{incidentId}} {{severity}}: {{mttr}} min, {{alertCount}} alert(s), paged {{pagedTo}}\n{{/each}}' }, 'ref-report'))
  steps.push(createStep('send', { to: 'Engineering DL', channel: 'email', subject: 'Reliability report {{day}}', body: '{{report}}' }, 'ref-report-send'))
  steps.push(createStep('store', { store: 'reliability-archive' }, 'ref-report-archive'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'telemetry-flow': createFlow({ id: 'telemetry-flow', moduleId: MODULE_ID, name: 'Telemetry', settings: defaultSettings(), steps: telemetrySteps(level) }),
    'runbook-flow': createFlow({ id: 'runbook-flow', moduleId: MODULE_ID, name: 'Runbook steps', settings: defaultSettings(), steps: runbookSteps(level) }),
    'postmortem-flow': createFlow({ id: 'postmortem-flow', moduleId: MODULE_ID, name: 'Month end', settings: defaultSettings(), steps: postmortemSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
