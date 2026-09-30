// Reference solution for the Studio builds. Used by the golden test (proves
// every build is passable, that the Week 1 flows fail Week 2, and that the
// Week 2 flows fail Week 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'brief-flow', 'edit-flow', 'review-flow', 'rollup-flow' }

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-09'

const one = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'one' }, id)
const allWhere = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'all' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function briefSteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'campaign-briefs' }, 'ref-b-trigger'), set([['version', '1'], ['status', "'draft'"]], 'ref-record-fields'), createStep('store', { store: 'content-records', mode: 'upsert', key: 'campaignId' }, 'ref-record')]
  if (level >= 2) {
    steps.push(one('tracking-policy', [["'1.0.0'", 'version']], 'policy', 'ref-policy'), allWhere('rendition-rules', [], 'rules', 'ref-rules'))
    const each = createStep('foreach', { list: 'rules' }, 'ref-render')
    each.branches = {
      each: [
        set(
          [
            ['campaignId', 'parent.campaignId'],
            ['version', '1'],
            ['text', "concat(prefix, parent.headline, '. ', parent.product, ', now ', parent.price, '. ', parent.offer, suffix)"],
            ['code', "concat(parent.policy.prefix, '-', parent.campaignId, '-', channel)"],
            ['fits', 'len(text) <= maxLength'],
          ],
          'ref-rendition'
        ),
        createStep('store', { store: 'renditions', mode: 'upsert', key: 'campaignId, channel' }, 'ref-rendition-store'),
      ],
    }
    steps.push(each)
  }
  return steps
}

function editSteps(level) {
  if (level < 3) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-e-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'rendition-edits' }, 'ref-e-trigger')]
  if (level >= 8) {
    steps.push(one('content-records', [['campaignId', 'campaignId']], 'record', 'ref-e-record'))
    const drift = createStep('condition', { rules: [{ left: 'text', op: 'contains', right: 'record.price', rightKind: 'field' }], combine: 'all' }, 'ref-drift')
    drift.branches = {
      yes: [],
      no: [
        set([['reason', "'price does not match the record'"]], 'ref-drift-reason'),
        createStep('store', { store: 'rejected-edits' }, 'ref-drift-store'),
        createStep('send', { to: 'Campaign Manager', channel: 'email', subject: 'Rejected edit on {{campaignId}} {{channel}}: {{reason}}', body: '{{by}} edited the {{channel}} rendition of {{campaignId}} to: "{{text}}". The record says the price is {{record.price}}. The edit was not applied.' }, 'ref-drift-send'),
        createStep('stop', {}, 'ref-drift-stop'),
      ],
    }
    steps.push(drift)
  }
  steps.push(createStep('store', { store: 'renditions', mode: 'update', key: 'campaignId, channel' }, 'ref-edit-store'))
  return steps
}

function reviewSteps(level) {
  if (level < 4) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-r-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'reviews' }, 'ref-r-trigger'), one('content-records', [['campaignId', 'campaignId']], 'record', 'ref-r-record')]
  const approved = createStep('condition', { rules: [{ left: 'decision', op: '==', right: 'approved', rightKind: 'value' }], combine: 'all' }, 'ref-approved')
  const launch = createStep('condition', { rules: [{ left: 'count', op: '==', right: '3', rightKind: 'value' }], combine: 'all' }, 'ref-launch')
  const fanout = createStep('foreach', { list: 'rends' }, 'ref-fanout')
  fanout.branches = {
    each: [
      one('send-schedule', [['channel', 'channel']], 'sched', 'ref-sched'),
      set([['sendAt', 'sched.sendAt'], ['launchedOn', 'parent.reviewId'], ['version', 'parent.record.version']], 'ref-launch-fields'),
      createStep('store', { store: 'launch-package', mode: 'upsert', key: 'campaignId, channel' }, 'ref-package'),
      createStep('send', { to: 'Channel Specialist', channel: 'email', subject: 'Launch {{campaignId}} {{channel}} at {{sendAt}}', body: 'Approved v{{version}}. Code {{code}}. Text: {{text}}' }, 'ref-launch-send'),
    ],
  }
  launch.branches = {
    yes: [set([['status', "'approved'"]], 'ref-status'), createStep('store', { store: 'content-records', mode: 'update', key: 'campaignId' }, 'ref-status-store'), allWhere('renditions', [['campaignId', 'campaignId']], 'rends', 'ref-rends'), fanout],
    no: [],
  }
  approved.branches = {
    yes: [
      createStep('store', { store: 'approvals' }, 'ref-approval-store'),
      allWhere('approvals', [['campaignId', 'campaignId']], 'done', 'ref-done'),
      set([['count', level >= 6 ? "count(done, 'version', record.version)" : 'len(done)']], 'ref-count'),
      launch,
    ],
    no: [
      set([['version', 'record.version + 1']], 'ref-bump'),
      createStep('store', { store: 'content-records', mode: 'update', key: 'campaignId' }, 'ref-bump-store'),
      createStep('store', { store: 'rework-log' }, 'ref-rework'),
      createStep('send', { to: 'Copywriter', channel: 'email', subject: '{{campaignId}} back to you: {{decision}} by {{reviewer}}', body: '{{note}} The message is now version {{version}}; the chain starts again.' }, 'ref-rework-send'),
    ],
  }
  steps.push(approved)
  return steps
}

function rollupSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'Fri 4:00 PM' }, 'ref-ru-trigger')]
  if (level < 5) return steps
  steps.push(allWhere('performance-events', [], 'events', 'ref-events'))
  const each = createStep('foreach', { list: 'events' }, 'ref-join')
  const body = [one('renditions', [['code', 'code']], 'rendition', 'ref-rendition-lookup')]
  if (level >= 7) {
    const miss = createStep('condition', { rules: [{ left: 'rendition', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-miss')
    miss.branches = {
      yes: [
        createStep('store', { store: 'unmatched-events' }, 'ref-miss-store'),
        createStep('send', { to: 'Channel Specialist', channel: 'email', subject: 'Unmatched code {{code}} on {{channel}}: {{clicks}} clicks', body: 'Event {{eventId}} carries code {{code}}, which matches no rendition. Its {{clicks}} clicks are not in the rollup. Codes come from the policy: STU-<campaign>-<channel>.' }, 'ref-miss-send'),
        createStep('stop', {}, 'ref-miss-stop'),
      ],
      no: [],
    }
    body.push(miss)
  }
  body.push(set([['campaignId', 'rendition.campaignId']], 'ref-join-fields'), createStep('store', { store: 'rollup-rows' }, 'ref-row'))
  each.branches = { each: body }
  steps.push(each)
  const totals = [['totalClicks', "sum(events, 'clicks')"]]
  if (level >= 7) {
    steps.push(allWhere('unmatched-events', [], 'misses', 'ref-misses'))
    totals.push(['unmatched', 'len(misses)'])
  }
  steps.push(set(totals, 'ref-totals'))
  steps.push(createStep('compose', { as: 'rollup', template: '# Studio rollup - {{day}}\n\nTotal clicks: {{totalClicks}}. Unmatched events: {{unmatched}}.\n\n{{#each events}}- {{channel}} {{code}}: {{clicks}} clicks, {{opens}} opens\n{{/each}}' }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Marketing DL', channel: 'email', subject: 'Friday rollup {{day}}', body: '{{rollup}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'campaign-archive' }, 'ref-archive'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'brief-flow': createFlow({ id: 'brief-flow', moduleId: MODULE_ID, name: 'Brief lands', settings: defaultSettings(), steps: briefSteps(level) }),
    'edit-flow': createFlow({ id: 'edit-flow', moduleId: MODULE_ID, name: 'Channel edits', settings: defaultSettings(), steps: editSteps(level) }),
    'review-flow': createFlow({ id: 'review-flow', moduleId: MODULE_ID, name: 'Reviews', settings: defaultSettings(), steps: reviewSteps(level) }),
    'rollup-flow': createFlow({ id: 'rollup-flow', moduleId: MODULE_ID, name: 'The Friday rollup', settings: defaultSettings(), steps: rollupSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
