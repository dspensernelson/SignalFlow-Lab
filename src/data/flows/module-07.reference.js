// Reference solution for the Depot builds. Used by the golden test (proves
// every build is passable, that the Day 1 flows fail Day 2, and that the Day 2
// flows fail Day 3) and by the builder's "Show the answer".
//
//   referenceFlowsFor(buildId) -> { 'order-flow': Flow, 'shipment-flow': Flow, 'digest-flow': Flow }

import { createFlow, createStep, defaultSettings } from '../../runtime/flowModel.js'

const MODULE_ID = 'module-07'

const one = (store, pairs, as, id) => createStep('lookup', { store, matchOn: pairs.map(([recordField, storeField]) => ({ recordField, storeField })), as, mode: 'one' }, id)
const set = (pairs, id) => createStep('transform', { set: pairs.map(([field, expr]) => ({ field, expr })) }, id)

function orderSteps(level) {
  const steps = [createStep('trigger', { mode: 'event', source: 'order-events' }, 'ref-o-trigger')]
  if (level >= 6) {
    steps.push(one('orders', [['orderId', 'orderId']], 'seen', 'ref-seen'))
    const dup = createStep('condition', { rules: [{ left: 'seen', op: 'exists', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-dup')
    dup.branches = { yes: [set([['event', "'placed (repeat)'"], ['state', 'seen.state']], 'ref-dup-note'), createStep('store', { store: 'rejected-events' }, 'ref-dup-log'), createStep('stop', {}, 'ref-dup-stop')], no: [] }
    steps.push(dup)
  }
  steps.push(createStep('lookup', { store: 'inventory-ledger', matchOn: [{ recordField: 'sku', storeField: 'sku' }], as: 'moves', mode: 'all' }, 'ref-moves'))
  steps.push(set([['onHand', "sum(moves, 'onHandDelta')"], ['committed', "sum(moves, 'committedDelta')"], ['available', 'onHand - committed']], 'ref-avail'))
  if (level >= 2) {
    const fits = createStep('condition', { rules: [{ left: 'qty', op: '<=', right: 'available', rightKind: 'field' }], combine: 'all' }, 'ref-fits')
    const yes = [set([['state', "'reserved'"], ['onHandDelta', '0'], ['committedDelta', 'qty'], ['reason', "'reserve'"]], 'ref-reserve'), createStep('store', { store: 'inventory-ledger' }, 'ref-reserve-store')]
    if (level >= 4) {
      yes.push(one('reorder-points', [['sku', 'sku']], 'point', 'ref-point'))
      yes.push(set([['position', 'available - qty']], 'ref-position'))
      const low = createStep('condition', { rules: [{ left: 'position', op: '<=', right: 'point.reorderPoint', rightKind: 'field' }], combine: 'all' }, 'ref-low')
      low.branches = {
        yes: [
          set([['reorderQty', 'point.reorderQty']], 'ref-reorder-qty'),
          createStep('store', { store: 'replenishments' }, 'ref-replenish'),
          createStep('send', { to: 'Inventory Planner', channel: 'email', subject: 'Reorder {{sku}}: position {{position}}', body: '{{sku}} is at {{position}} available after {{orderId}}. Reorder point {{point.reorderPoint}}; suggested quantity {{reorderQty}}.' }, 'ref-replenish-send'),
        ],
        no: [],
      }
      yes.push(low)
    }
    fits.branches = {
      yes,
      no: [
        set([['state', "'backordered'"]], 'ref-backorder'),
        createStep('store', { store: 'backorders' }, 'ref-backorder-store'),
        createStep('send', { to: 'Customer Service Rep', channel: 'email', subject: '{{orderId}} backordered', body: '{{customer}} ordered {{qty}} of {{sku}}; {{available}} available. Please give them a promise date.' }, 'ref-backorder-send'),
      ],
    }
    steps.push(fits)
  }
  steps.push(createStep('store', { store: 'orders', mode: 'upsert', key: 'orderId' }, 'ref-order-store'))
  return steps
}

function shipmentSteps(level) {
  if (level < 3) return [createStep('trigger', { mode: 'event', source: '' }, 'ref-s-trigger')]
  const steps = [createStep('trigger', { mode: 'event', source: 'shipment-events' }, 'ref-s-trigger'), one('orders', [['orderId', 'orderId']], 'order', 'ref-order')]
  if (level >= 7) {
    steps.push(one('state-machine', [['order.state', 'from'], ['event', 'to']], 'transition', 'ref-transition'))
    const illegal = createStep('condition', { rules: [{ left: 'transition', op: 'missing', right: '', rightKind: 'value' }], combine: 'all' }, 'ref-illegal')
    illegal.branches = {
      yes: [
        set([['state', 'order.state']], 'ref-keep-state'),
        createStep('store', { store: 'rejected-events' }, 'ref-reject'),
        createStep('send', { to: 'Warehouse Lead', channel: 'chat', subject: '{{orderId}}: {{event}} arrived while {{state}}', body: 'Event {{eventId}} says {{orderId}} is {{event}}, but the order is {{state}} and the state machine has no such move. Not applied.' }, 'ref-reject-send'),
        createStep('stop', {}, 'ref-reject-stop'),
      ],
      no: [],
    }
    steps.push(illegal)
  }
  steps.push(set([['state', 'event'], ['tracking', 'if(len(tracking) > 0, tracking, order.tracking)']], 'ref-state'))
  if (level >= 8) {
    const damaged = createStep('condition', { rules: [{ left: 'event', op: '==', right: 'damaged', rightKind: 'value' }], combine: 'all' }, 'ref-damaged')
    damaged.branches = {
      yes: [
        one('compensation-policy', [['event', 'event']], 'comp', 'ref-comp'),
        set([['state', "'compensated'"], ['sku', 'order.sku'], ['onHandDelta', '0'], ['committedDelta', 'order.qty'], ['reason', "'compensate'"], ['action', 'comp.action']], 'ref-compensate'),
        createStep('store', { store: 'inventory-ledger' }, 'ref-comp-ledger'),
        createStep('store', { store: 'compensations' }, 'ref-comp-log'),
        createStep('send', { to: 'Customer Service Rep', channel: 'email', subject: '{{orderId}} damaged in transit', body: '{{orderId}} for {{order.customer}} was reported damaged at {{at}}. Done: {{action}}. Please tell the customer.' }, 'ref-comp-send'),
      ],
      no: [],
    }
    steps.push(damaged)
  }
  steps.push(createStep('store', { store: 'orders', mode: 'update', key: 'orderId' }, 'ref-order-update'))
  return steps
}

function digestSteps(level) {
  const steps = [createStep('trigger', { mode: 'schedule', at: '6:00 PM' }, 'ref-d-trigger')]
  if (level < 5) return steps
  steps.push(createStep('lookup', { store: 'orders', matchOn: [], as: 'orders', mode: 'all' }, 'ref-orders'))
  steps.push(createStep('lookup', { store: 'replenishments', matchOn: [], as: 'reordersMade', mode: 'all' }, 'ref-reorders'))
  steps.push(set([['delivered', "count(orders, 'state', 'delivered')"], ['backordered', "count(orders, 'state', 'backordered')"], ['compensated', "count(orders, 'state', 'compensated')"], ['reorders', 'len(reordersMade)']], 'ref-counts'))
  steps.push(createStep('compose', { as: 'digest', template: '# Depot fulfillment digest - {{day}}\n\nDelivered: {{delivered}}. Backordered: {{backordered}}. Compensated: {{compensated}}. Reorders: {{reorders}}.\n\n{{#each orders}}- {{orderId}} {{sku}} x{{qty}}: {{state}} {{tracking}}\n{{/each}}' }, 'ref-compose'))
  steps.push(createStep('send', { to: 'Ops DL', channel: 'email', subject: 'Fulfillment digest {{day}}', body: '{{digest}}' }, 'ref-send'))
  steps.push(createStep('store', { store: 'digest-archive' }, 'ref-archive'))
  return steps
}

const LEVEL = { b1: 1, b2: 2, b3: 3, b4: 4, b5: 5, b6: 6, b7: 7, b8: 8 }

export function referenceFlowsFor(buildId) {
  const level = LEVEL[buildId] || 1
  return {
    'order-flow': createFlow({ id: 'order-flow', moduleId: MODULE_ID, name: 'Order placed', settings: defaultSettings(), steps: orderSteps(level) }),
    'shipment-flow': createFlow({ id: 'shipment-flow', moduleId: MODULE_ID, name: 'Shipment events', settings: defaultSettings(), steps: shipmentSteps(level) }),
    'digest-flow': createFlow({ id: 'digest-flow', moduleId: MODULE_ID, name: 'The 6:00 PM digest', settings: defaultSettings(), steps: digestSteps(level) }),
  }
}

export const REFERENCE_BUILD_IDS = Object.keys(LEVEL)
