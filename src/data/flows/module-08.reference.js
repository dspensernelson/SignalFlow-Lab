// Reference solution for the Sentinel builds. Used by the golden test (proves
// every build is passable, that the Q1 flows fail Q2, and that the Q2 flows
// fail Q3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'request-flow': Flow, 'evidence-flow': Flow, 'package-flow': Flow }

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-08'

const one = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'one' }, id)
const all = (store, as, id) => createStep('lookup', { store, matchOn: [], as, mode: 'all' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function requestSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Q day 1' }, 'ref-rq-trigger')]
  if (level < 1) return steps
  steps.push(one('quarter', [["'current'", 'key']], 'q', 'ref-q'), all('control-catalog', 'controls', 'ref-controls'))
  const each = createStep('foreach', { list: 'controls' }, 'ref-rq-each')
  each.branches = {
    each: [
      set([['period', 'parent.q.period'], ['asOfDay', 'parent.q.asOfDay']], 'ref-rq-fields'),
      createStep('store', { store: 'evidence-requests', mode: 'upsert', key: 'controlId' }, 'ref-rq-store'),
      createStep('send', { to: 'Control Owners', channel: 'email', subject: '{{controlId}} evidence for {{period}} due by day {{asOfDay}}', body: 'To the {{owner}}: please submit evidence that {{name}} operated in {{period}}, with your attestation, by day {{asOfDay}}.' }, 'ref-rq-send'),
    ],
  }
  steps.push(each)
  return steps
}

function evidenceSteps(level) {
  if (level < 2) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-ev-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'evidence-submissions' }, 'ref-ev-trigger'), one('control-catalog', [['controlId', 'controlId']], 'control', 'ref-control')]
  if (level >= 7) {
    steps.push(one('evidence-records', [['controlId', 'controlId'], ['period', 'period']], 'prior', 'ref-prior'))
    steps.push(set([['version', 'coalesce(prior.version, 0) + 1'], ['supersedes', "coalesce(prior.hash, '')"]], 'ref-version'))
    steps.push(createStep('store', { store: 'evidence-records' }, 'ref-record'))
  } else {
    steps.push(createStep('store', { store: 'evidence-records', mode: 'upsert', key: 'controlId' }, 'ref-record'))
  }
  if (level >= 3) {
    steps.push(one('evidence-requests', [['controlId', 'controlId']], 'request', 'ref-request'))
    steps.push(createStep('approval', { approver: 'Internal Auditor', about: 'countersign {{controlId}}' }, 'ref-countersign'))
    const rules = [{ left: 'attested', op: '==', right: 'true', rightKind: 'value' }, { left: 'approval.outcome', op: '==', right: 'countersigned', rightKind: 'value' }]
    if (level >= 6) {
      steps.push(set([['ageDays', 'request.asOfDay - collectedDay'], ['fresh', 'ageDays <= control.freshnessDays'], ['attested', 'attestedPeriod == period']], 'ref-judge'))
      rules.unshift({ left: 'fresh', op: '==', right: 'true', rightKind: 'value' })
    } else {
      steps.push(set([['attested', 'len(attestedBy) > 0']], 'ref-judge'))
    }
    const decide = createStep('condition', { rules, combine: 'all' }, 'ref-decide')
    decide.branches = {
      yes: [createStep('store', { store: 'pass-log' }, 'ref-pass')],
      no: [
        set([['reason', level >= 6 ? "if(fresh == false, 'stale evidence', 'attested to the wrong period')" : "'not attested or not countersigned'"], ['owner', 'control.owner'], ['deadlineDay', 'request.asOfDay + 30']], 'ref-finding'),
        createStep('store', { store: 'findings-log' }, 'ref-finding-store'),
        createStep('send', { to: 'Control Owners', channel: 'email', subject: 'Finding on {{controlId}}: {{reason}}', body: 'To the {{owner}}: the {{period}} evidence for {{controlId}} ({{hash}}) is insufficient - {{reason}}. Remediate by day {{deadlineDay}}.' }, 'ref-finding-send'),
      ],
    }
    steps.push(decide)
  }
  return steps
}

function packageSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Q last day' }, 'ref-pk-trigger')]
  if (level < 4) return steps
  if (level >= 8) {
    steps.push(one('quarter', [["'current'", 'key']], 'q', 'ref-pk-q'), all('control-catalog', 'controls', 'ref-pk-controls'))
    const each = createStep('foreach', { list: 'controls' }, 'ref-coverage')
    const missing = createStep('condition', { rules: [{ left: 'evidence', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-missing')
    missing.branches = {
      yes: [
        set([['reason', "'no evidence'"], ['deadlineDay', 'parent.q.asOfDay + 30']], 'ref-gap'),
        createStep('store', { store: 'findings-log' }, 'ref-gap-store'),
        createStep('send', { to: 'Compliance Analyst', channel: 'email', subject: 'No evidence for {{controlId}} in {{parent.q.period}}', body: '{{name}} ({{controlId}}, {{owner}}) has no evidence on record for {{parent.q.period}}. It is a finding in the package; please chase the owner.' }, 'ref-gap-send'),
      ],
      no: [],
    }
    each.branches = { each: [one('evidence-records', [['controlId', 'controlId'], ['parent.q.period', 'period']], 'evidence', 'ref-coverage-lookup'), missing] }
    steps.push(each)
  }
  steps.push(all('evidence-records', 'records', 'ref-records'), all('pass-log', 'passed', 'ref-passed'), all('findings-log', 'open', 'ref-open'))
  steps.push(one('retention-schedule', [["'evidence'", 'recordClass']], 'retention', 'ref-retention'))
  steps.push(set([['passes', 'len(passed)'], ['findings', 'len(open)'], ['retainYears', 'retention.years']], 'ref-counts'))
  steps.push(createStep('compose', { as: 'package', template: '# Sentinel audit package - {{day}}\n\nPasses: {{passes}}. Findings: {{findings}}. Retained {{retainYears}} years.\n\n## Evidence\n{{#each records}}- {{controlId}} {{period}} {{hash}} v{{version}} (collected day {{collectedDay}}, attested by {{attestedBy}})\n{{/each}}\n## Findings\n{{#each open}}- {{controlId}}: {{reason}} - {{owner}} by day {{deadlineDay}}\n{{/each}}' }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Audit DL', channel: 'email', subject: 'Audit package {{day}}', body: '{{package}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'audit-archive' }, 'ref-archive'))
  if (level >= 5) {
    const each = createStep('foreach', { list: 'records' }, 'ref-expiry')
    each.branches = { each: [one('control-catalog', [['controlId', 'controlId']], 'control', 'ref-expiry-control'), set([['nextDueDay', 'collectedDay + control.freshnessDays']], 'ref-next-due'), createStep('store', { store: 'evidence-calendar', mode: 'upsert', key: 'controlId' }, 'ref-calendar')] }
    steps.push(each)
  }
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'request-flow': createFlow({ id: 'request-flow', moduleId: MODULE_ID, name: 'Quarter start', settings: defaultSettings(), steps: requestSteps(level) }),
    'evidence-flow': createFlow({ id: 'evidence-flow', moduleId: MODULE_ID, name: 'Evidence arrives', settings: defaultSettings(), steps: evidenceSteps(level) }),
    'package-flow': createFlow({ id: 'package-flow', moduleId: MODULE_ID, name: 'Quarter end', settings: defaultSettings(), steps: packageSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
