// Reference solution for the Ledger builds. Used by the golden test (proves
// every build is passable, that the Month 1 flows fail Month 2, and that the
// Month 2 flows fail Month 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'recon-flow': Flow, 'review-flow': Flow, 'package-flow': Flow }
//
// Flows are cumulative: b2's recon flow contains b1's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-05'

const one = (store, recordField, storeField, as, id) => createStep('lookup', { store, matchOn: [{ recordField, storeField }], as, mode: 'one' }, id)
const all = (store, as, id) => createStep('lookup', { store, matchOn: [], as, mode: 'all' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function reconSteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'account-balances' }, 'ref-recon-trigger'), one('prior-period-balances', 'accountCode', 'accountCode', 'prior', 'ref-prior')]
  const sets = [['difference', 'bookBalance - externalBalance'], ['movement', 'bookBalance - prior.balance']]
  if (level >= 2) sets.push(['amount', 'abs(difference)'])
  steps.push(set(sets, 'ref-diff'))
  if (level >= 8) {
    const gap = createStep('condition', { rules: [{ left: 'difference', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-gap')
    gap.branches = {
      yes: [
        set([['status', "'unreconciled'"]], 'ref-gap-status'),
        createStep('send', { to: 'Treasury Desk', channel: 'email', subject: 'No bank balance for {{account}} this month', body: '{{account}} ({{accountCode}}) arrived with no balance from the {{externalSource}}. It is marked unreconciled in the close package until the feed posts.' }, 'ref-gap-send'),
        createStep('store', { store: 'recon-results' }, 'ref-gap-store'),
        createStep('stop', {}, 'ref-gap-stop'),
      ],
      no: [],
    }
    steps.push(gap)
  }
  if (level >= 2) {
    steps.push(one('recon-policy', "'1.0.0'", 'version', 'policy', 'ref-policy'))
    const mat = createStep('condition', { rules: [{ left: 'amount', op: '>=', right: 'policy.materiality', rightKind: 'field' }], combine: 'all' }, 'ref-material')
    mat.branches = {
      yes: [
        set([['entryId', "concat('JE-', accountCode)"], ['reason', "concat('reconciling difference vs ', externalSource)"], ['status', "'adjusted'"]], 'ref-entry'),
        createStep('store', { store: 'adjustments' }, 'ref-adjust'),
      ],
      no: [set([['status', "'passed'"]], 'ref-passed-status'), createStep('store', { store: 'passed-items' }, 'ref-pass')],
    }
    steps.push(mat)
  }
  steps.push(createStep('store', { store: 'recon-results' }, 'ref-recon-store'))
  return steps
}

function reviewSteps(level) {
  if (level < 3) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-review-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'reviews' }, 'ref-review-trigger')]
  if (level >= 6) {
    steps.push(one('adjustments', 'entryId', 'entryId', 'entry', 'ref-entry-lookup'))
    const self = createStep('condition', { rules: [{ left: 'reviewer', op: '==', right: 'entry.preparer', rightKind: 'field' }], combine: 'all' }, 'ref-self')
    self.branches = {
      yes: [
        set([['decision', "'blocked - self-review'"]], 'ref-block'),
        createStep('store', { store: 'adjustments', mode: 'update', key: 'entryId' }, 'ref-block-store'),
        createStep('send', { to: 'Controller', channel: 'email', subject: 'Self-review blocked: {{entryId}}', body: '{{reviewer}} prepared {{entryId}} and tried to review it. The review was not recorded; someone else must sign.' }, 'ref-block-send'),
        createStep('stop', {}, 'ref-block-stop'),
      ],
      no: [],
    }
    steps.push(self)
  }
  steps.push(set([['reviewedBy', 'reviewer']], 'ref-reviewed'))
  steps.push(createStep('store', { store: 'adjustments', mode: 'update', key: 'entryId' }, 'ref-sign'))
  return steps
}

const PACKAGE =
  '# Close package - {{day}}\n{{aggregationFlag}}\nCertified: {{approval.outcome}} by {{approval.by}} {{approval.at}}\n\n## Reconciliations\n{{#each recons}}- {{account}}: book {{bookBalance}}, outside {{externalBalance}}, difference {{difference}}, movement {{movement}} - {{status}}\n{{/each}}\n## Adjustments ({{adjustmentCount}})\n{{#each entries}}- {{entryId}} {{account}} {{amount}}: {{reason}} (prepared {{preparer}}, reviewed {{reviewedBy}}: {{decision}})\n{{/each}}\n## Passed items (total {{passedTotal}})\n{{#each passed}}- {{account}} {{amount}}\n{{/each}}'

function packageSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: 'WD5 4:00 PM' }, 'ref-pkg-trigger')]
  if (level < 4) return steps
  steps.push(all('recon-results', 'recons', 'ref-recons'), all('adjustments', 'entries', 'ref-entries'), all('passed-items', 'passed', 'ref-passed'))
  steps.push(set([['adjustmentCount', 'len(entries)'], ['passedTotal', "sum(passed, 'amount')"]], 'ref-totals'))
  if (level >= 7) {
    steps.push(one('recon-policy', "'1.0.0'", 'version', 'policy', 'ref-pkg-policy'))
    const agg = createStep('condition', { rules: [{ left: 'passedTotal', op: '>=', right: 'policy.materiality', rightKind: 'field' }], combine: 'all' }, 'ref-agg')
    agg.branches = {
      yes: [
        set([['aggregationFlag', "'PASSED ITEMS AGGREGATE ABOVE MATERIALITY'"]], 'ref-agg-flag'),
        createStep('send', { to: 'Senior Accountant', channel: 'email', subject: 'Passed items total {{passedTotal}}', body: 'The passed items this month add up to {{passedTotal}}, at or above materiality. Revisit them before certification.' }, 'ref-agg-send'),
      ],
      no: [],
    }
    steps.push(agg)
  }
  steps.push(createStep('approval', { approver: 'Controller', about: 'close package' }, 'ref-certify'))
  steps.push(createStep('compose', { as: 'package', template: PACKAGE }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Finance DL', channel: 'email', subject: 'Close package {{day}}', body: '{{package}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'close-archive' }, 'ref-archive'))
  if (level >= 5) {
    const roll = createStep('foreach', { list: 'recons' }, 'ref-roll')
    roll.branches = { each: [set([['balance', 'bookBalance']], 'ref-roll-balance'), createStep('store', { store: 'prior-period-balances', mode: 'upsert', key: 'accountCode' }, 'ref-roll-store')] }
    steps.push(roll)
  }
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'recon-flow': createFlow({ id: 'recon-flow', moduleId: MODULE_ID, name: 'Reconcile', settings: defaultSettings(), steps: reconSteps(level) }),
    'review-flow': createFlow({ id: 'review-flow', moduleId: MODULE_ID, name: 'Sign-offs', settings: defaultSettings(), steps: reviewSteps(level) }),
    'package-flow': createFlow({ id: 'package-flow', moduleId: MODULE_ID, name: 'The Workday 5 package', settings: defaultSettings(), steps: packageSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
