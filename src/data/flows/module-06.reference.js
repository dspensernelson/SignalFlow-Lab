// Reference solution for the Compass builds. Used by the golden test (proves
// every build is passable, that the Week 1 flows fail Week 2, and that the
// Week 2 flows fail Week 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'dedupe-flow': Flow, 'score-flow': Flow, 'report-flow': Flow }
//
// Flows are cumulative: b2's dedupe flow contains b1's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-06'

const one = (store, recordField, storeField, as, id) => createStep('lookup', { store, matchOn: [{ recordField, storeField }], as, mode: 'one' }, id)
const all = (store, as, id) => createStep('lookup', { store, matchOn: [], as, mode: 'all' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function dedupeSteps(level) {
  const steps = [
    createStep('trigger', { mode: 'event', source: 'crm-export' }, 'ref-dd-trigger'),
    set([['matchKey', 'lower(trim(email))']], 'ref-key'),
    one('golden-records', 'matchKey', 'matchKey', 'existing', 'ref-existing'),
    set([['isDuplicate', 'exists(existing)']], 'ref-isdup'),
  ]
  if (level < 2) return steps
  if (level >= 6) steps.push(one('match-key-policy', "'1.0.0'", 'version', 'policy', 'ref-policy'))
  const dup = createStep('condition', { rules: [{ left: 'existing', op: 'exists', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-dup')
  const lane = []
  if (level >= 6) {
    lane.push(set([['confidence', 'if(lower(name) == lower(existing.name), policy.sameNamePoints, policy.differentNamePoints)']], 'ref-confidence'))
    const unsure = createStep('condition', { rules: [{ left: 'confidence', op: '<', right: 'policy.autoMergeThreshold', rightKind: 'field' }], combine: 'all' }, 'ref-unsure')
    unsure.branches = {
      yes: [
        createStep('store', { store: 'review-queue' }, 'ref-review'),
        createStep('send', { to: 'Data Steward', channel: 'email', subject: 'Review: {{accountId}} vs {{existing.accountId}}', body: '{{name}} ({{accountId}}) shares an email with {{existing.name}} ({{existing.accountId}}). Confidence {{confidence}}. Merge or keep both?' }, 'ref-review-send'),
        createStep('stop', {}, 'ref-review-stop'),
      ],
      no: [],
    }
    lane.push(unsure)
  }
  if (level >= 7) lane.push(set([['phone', 'if(len(phone) > 0, phone, existing.phone)'], ['region', 'if(len(region) > 0, region, existing.region)']], 'ref-survive'))
  lane.push(set([['mergedFrom', 'accountId'], ['accountId', 'existing.accountId']], 'ref-lineage'))
  lane.push(createStep('store', { store: 'merge-log' }, 'ref-merge-log'))
  dup.branches = { yes: lane, no: [] }
  steps.push(dup)
  steps.push(createStep('store', { store: 'golden-records', mode: 'upsert', key: 'matchKey' }, 'ref-golden'))
  return steps
}

function scoreSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Mon 8:30 AM' }, 'ref-sc-trigger')]
  if (level < 3) return steps
  steps.push(all('golden-records', 'book', 'ref-book'))
  const each = createStep('foreach', { list: 'book' }, 'ref-each')
  const body = [one('vendor-data', 'domain', 'domain', 'vendor', 'ref-vendor'), one('scoring-model', "'1.0.0'", 'version', 'model', 'ref-model'), set([['employees', 'num(vendor.employees)'], ['industry', 'vendor.industry']], 'ref-enrich')]
  if (level >= 8) {
    const bad = createStep('condition', { rules: [{ left: 'employees', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-bad')
    bad.branches = {
      yes: [
        set([['band', "'unscored'"]], 'ref-unscored'),
        createStep('send', { to: 'Sales Ops Analyst', channel: 'email', subject: 'Vendor data unreadable for {{domain}}', body: 'The Enrichment Vendor returned employees "{{vendor.employees}}" and industry "{{vendor.industry}}" for {{name}} ({{domain}}). It is marked unscored until someone checks.' }, 'ref-bad-send'),
        createStep('store', { store: 'lead-scores' }, 'ref-bad-store'),
        createStep('stop', {}, 'ref-bad-stop'),
      ],
      no: [],
    }
    body.push(bad)
  }
  body.push(
    set(
      [
        ['score', 'if(employees >= model.bigCompanyMin, model.bigCompanyPoints, 0) + if(industry == model.targetIndustry, model.industryPoints, 0) + if(len(phone) > 0, model.phonePoints, 0)'],
        ['band', "if(score >= model.hotCutoff, 'hot', if(score >= model.warmCutoff, 'warm', 'cold'))"],
      ],
      'ref-score'
    )
  )
  body.push(createStep('store', { store: 'lead-scores' }, 'ref-score-store'))
  if (level >= 4) {
    body.push(one('territory-rules', 'region', 'region', 'rules', 'ref-territory'))
    const hot = createStep('condition', { rules: [{ left: 'band', op: '==', right: 'hot', rightKind: 'value' }], combine: 'all' }, 'ref-hot')
    hot.branches = {
      yes: [
        set([['territory', 'rules.territory'], ['owner', 'rules.owner']], 'ref-route'),
        createStep('send', { to: 'AE Team DL', channel: 'email', subject: 'Hot lead: {{name}} ({{territory}})', body: '{{name}} scored {{score}}. {{employees}} employees, {{industry}}. Phone {{phone}}.' }, 'ref-route-send'),
        createStep('store', { store: 'routed-leads' }, 'ref-route-store'),
      ],
      no: [],
    }
    body.push(hot)
  }
  each.branches = { each: body }
  steps.push(each)
  return steps
}

function reportSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Mon 9:00 AM' }, 'ref-rp-trigger')]
  if (level < 5) return steps
  steps.push(all('lead-scores', 'scores', 'ref-scores'), all('merge-log', 'mergesMade', 'ref-merges'), all('review-queue', 'pending', 'ref-pending'))
  steps.push(set([['records', 'len(scores)'], ['merges', 'len(mergesMade)'], ['reviews', 'len(pending)'], ['hot', "count(scores, 'band', 'hot')"]], 'ref-counts'))
  steps.push(createStep('compose', { as: 'report', template: '# Compass hygiene report - {{day}}\n\nRecords in the book: {{records}}. Merges this week: {{merges}}. Waiting for the steward: {{reviews}}. Hot leads: {{hot}}.\n\n{{#each scores}}- {{name}}: {{score}} {{band}}\n{{/each}}' }, 'ref-compose'))
  steps.push(createStep('send', { to: 'RevOps Manager', channel: 'email', subject: 'Hygiene report {{day}}', body: '{{report}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'hygiene-archive' }, 'ref-archive'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'dedupe-flow': createFlow({ id: 'dedupe-flow', moduleId: MODULE_ID, name: 'Match and merge', settings: defaultSettings(), steps: dedupeSteps(level) }),
    'score-flow': createFlow({ id: 'score-flow', moduleId: MODULE_ID, name: 'Enrich and score', settings: defaultSettings(), steps: scoreSteps(level) }),
    'report-flow': createFlow({ id: 'report-flow', moduleId: MODULE_ID, name: 'The Monday report', settings: defaultSettings(), steps: reportSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
