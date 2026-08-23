// Reference solution for the Beacon builds. Used by the golden test (proves
// every build is passable and that the Day 1 flow really fails Day 2) and by
// the builder's "load the example for this build" escape hatch.
//
//   referenceFlowsFor(buildId) -> { 'invoice-flow': Flow, 'run-flow': Flow }
//
// Flows are cumulative: b3's invoice flow contains b1's and b2's steps.

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-02'

function holdLane(reason, owner, subject, id) {
  return [
    createStep('transform', { set: [{ field: 'reason', expr: `'${reason}'` }] }, `${id}-reason`),
    createStep('send', { to: owner, channel: 'email', subject, body: 'Invoice {{invoiceNumber}} from {{vendorName}} ({{vendorId}}) for {{invoiceTotal}} is on hold: {{reason}}. PO {{poNumber}}.' }, `${id}-send`),
    createStep('store', { store: 'exception-queue' }, `${id}-store`),
    createStep('stop', {}, `${id}-stop`),
  ]
}

function invoiceSteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'invoice-inbox' }, 'ref-trigger')]
  if (level >= 4) {
    steps.push(createStep('lookup', { store: 'vendor-master', matchOn: [{ recordField: 'vendorId', storeField: 'vendorId' }], as: 'vendor', mode: 'one' }, 'ref-vendor'))
    steps.push(
      createStep(
        'lookup',
        {
          store: 'payment-history',
          matchOn: [
            { recordField: 'invoiceNumber', storeField: 'invoiceNumber' },
            { recordField: 'vendorId', storeField: 'vendorId' },
            { recordField: 'invoiceTotal', storeField: 'invoiceTotal' },
          ],
          as: 'priorPayment',
          mode: 'one',
        },
        'ref-history'
      )
    )
  }
  steps.push(createStep('lookup', { store: 'po-register', matchOn: [{ recordField: 'poNumber', storeField: 'poNumber' }], as: 'po', mode: 'one' }, 'ref-po'))
  steps.push(createStep('lookup', { store: 'receipt-log', matchOn: [{ recordField: 'poNumber', storeField: 'poNumber' }], as: 'receipt', mode: 'one' }, 'ref-receipt'))
  if (level >= 2) {
    steps.push(createStep('lookup', { store: 'tolerance-policy', matchOn: [{ recordField: "'1.0.0'", storeField: 'version' }], as: 'policy', mode: 'one' }, 'ref-policy'))
    steps.push(
      createStep(
        'transform',
        {
          set: [
            { field: 'variance', expr: 'invoiceTotal - po.poTotal' },
            { field: 'variancePct', expr: 'round(variance / po.poTotal * 100, 2)' },
            { field: 'band', expr: 'max(po.poTotal * policy.pricePct / 100, policy.priceAbs)' },
            { field: 'qtyMatch', expr: 'receipt.quantityReceived == po.quantityOrdered' },
          ],
        },
        'ref-compute'
      )
    )
  }
  if (level >= 4) {
    const dup = createStep('condition', { rules: [{ left: 'priorPayment', op: 'exists', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-guard-dup')
    dup.branches = { yes: holdLane('duplicate - already paid', 'AP Clerk', 'Duplicate invoice {{invoiceNumber}}', 'ref-dup'), no: [] }
    const vendor = createStep('condition', { rules: [{ left: 'vendor', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-guard-vendor')
    vendor.branches = { yes: holdLane('vendor not in master', 'Vendor Relations Desk', 'Unknown vendor on {{invoiceNumber}}', 'ref-vend'), no: [] }
    const receipt = createStep('condition', { rules: [{ left: 'receipt', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-guard-receipt')
    receipt.branches = { yes: holdLane('missing receipt', 'Receiving Desk', 'No receipt for {{poNumber}}', 'ref-rcpt'), no: [] }
    steps.push(dup, vendor, receipt)
  }
  if (level >= 3) {
    const decide = createStep(
      'condition',
      {
        rules: [
          { left: 'variance', op: '<=', right: 'band', rightKind: 'field' },
          { left: 'qtyMatch', op: '==', right: 'true', rightKind: 'value' },
        ],
        combine: 'all',
      },
      'ref-decide'
    )
    decide.branches = {
      yes: [createStep('store', { store: 'payment-batch' }, 'ref-pay')],
      no: [
        createStep('transform', { set: [{ field: 'reason', expr: "'price over tolerance'" }] }, 'ref-price-reason'),
        createStep('send', { to: 'Procurement Lead', channel: 'email', subject: 'Price check on {{invoiceNumber}}', body: 'Invoice {{invoiceNumber}} bills {{invoiceTotal}} against PO {{poNumber}} at {{po.poTotal}}: variance {{variance}} exceeds the {{band}} band. Please verify the PO price.' }, 'ref-price-send'),
        createStep('store', { store: 'exception-queue' }, 'ref-price-store'),
      ],
    }
    steps.push(decide)
  }
  return steps
}

function runSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: '2:30 PM' }, 'ref-run-trigger')]
  if (level >= 5) {
    steps.push(createStep('lookup', { store: 'payment-batch', matchOn: [], as: 'batch', mode: 'all' }, 'ref-run-batch'))
    steps.push(createStep('transform', { set: [{ field: 'count', expr: 'len(batch)' }, { field: 'total', expr: "sum(batch, 'invoiceTotal')" }] }, 'ref-run-totals'))
    steps.push(createStep('approval', { approver: 'AP Manager', about: 'payment run' }, 'ref-run-approval'))
    const gate = createStep('condition', { rules: [{ left: 'approval.outcome', op: '==', right: 'approved', rightKind: 'value' }], combine: 'all' }, 'ref-run-gate')
    gate.branches = {
      yes: [
        createStep('compose', { as: 'runDoc', template: '# Beacon Payment Run - {{day}}\n\nApproved by {{approval.by}} at {{approval.at}} (cutoff 3:00 PM).\n\nInvoices in run: {{count}}\nRun total: {{total}}\n\n{{#each batch}}- {{invoiceNumber}} {{vendorName}} ({{vendorId}}) {{invoiceTotal}}\n{{/each}}\nDelivered to Payables DL at the cutoff.' }, 'ref-run-compose'),
        createStep('send', { to: 'Payables DL', channel: 'email', subject: 'Payment run {{day}} - {{count}} invoices, {{total}}', body: '{{runDoc}}' }, 'ref-run-send'),
        createStep('store', { store: 'payment-run-archive' }, 'ref-run-archive'),
        createStep('store', { store: 'payment-history', from: 'batch' }, 'ref-run-history'),
      ],
      no: [
        createStep('send', { to: 'AP Clerk', channel: 'email', subject: 'Payment run {{day}} NOT approved', body: 'The AP Manager replied {{approval.outcome}}. Nothing was paid.' }, 'ref-run-reject'),
        createStep('stop', {}, 'ref-run-stop'),
      ],
    }
    steps.push(gate)
  }
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  const settings = level >= 6 ? { ...defaultSettings(), retries: 3, onFailure: 'dead-letter', connection: { system: 'AP shared mailbox', identity: 'service account', secretRef: 'vault://beacon/ap-mailbox' }, trigger: { mode: 'poll', intervalMinutes: 15 } } : defaultSettings()
  return {
    'invoice-flow': createFlow({ id: 'invoice-flow', moduleId: MODULE_ID, name: 'Invoice intake and match', settings, steps: invoiceSteps(level) }),
    'run-flow': createFlow({ id: 'run-flow', moduleId: MODULE_ID, name: 'The 2:30 PM payment run', settings: defaultSettings(), steps: runSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
