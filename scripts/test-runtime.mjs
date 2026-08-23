// Runtime test suite. Run with: npm run test:runtime
//
// Covers src/runtime/*: the expression evaluator, flow model, engine, checks,
// skins, python codegen, and the Beacon golden tests (the reference solution
// passes every build on its day; the Day 1 flow FAILS Day 2 - the break-it
// mechanism is proven, not assumed).

import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imp = (rel) => import('file://' + path.join(root, rel).replace(/\\/g, '/'))

let passed = 0
let failed = 0
const failures = []
async function test(name, fn) {
  try {
    await fn()
    passed += 1
  } catch (e) {
    failed += 1
    failures.push({ name, error: e })
  }
}
const eq = assert.deepEqual
const ok = assert.ok
const throws = assert.throws

// ============================================================ expr
const { parseExpr, evalExpr, exprToPython, exprPaths, ExprError } = await imp('src/runtime/expr.js')

await test('expr: arithmetic precedence', () => {
  eq(evalExpr('1 + 2 * 3'), 7)
  eq(evalExpr('(1 + 2) * 3'), 9)
  eq(evalExpr('10 / 4'), 2.5)
  eq(evalExpr('-3 + 5'), 2)
  eq(evalExpr('7 % 4'), 3)
})
await test('expr: paths and missing', () => {
  const rec = { invoiceTotal: 1220, po: { poTotal: 1200 } }
  eq(evalExpr('invoiceTotal - po.poTotal', rec), 20)
  eq(evalExpr('po.missing', rec), undefined)
  eq(evalExpr('invoiceTotal - po.missing', rec), null)
  eq(evalExpr('nope.deeper', rec), undefined)
})
await test('expr: strings, bools, null', () => {
  eq(evalExpr("'duplicate'"), 'duplicate')
  eq(evalExpr('"a" + "b"'), 'ab')
  eq(evalExpr('true and false'), false)
  eq(evalExpr('true or false'), true)
  eq(evalExpr('not false'), true)
  eq(evalExpr('null'), null)
})
await test('expr: comparisons', () => {
  const rec = { variance: 20, band: 25, qty: 500, qtyRecv: 500, s: 'clear', flag: true, po: null }
  eq(evalExpr('variance <= band', rec), true)
  eq(evalExpr('qty == qtyRecv', rec), true)
  eq(evalExpr("s == 'clear'", rec), true)
  eq(evalExpr('flag == true', rec), true)
  eq(evalExpr('po == null', rec), true)
  eq(evalExpr('missing == null', rec), true)
  eq(evalExpr('missing < 5', rec), false)
  eq(evalExpr('variance <= band and qty == qtyRecv', rec), true)
  eq(evalExpr('not (variance <= band)', rec), false)
})
await test('expr: functions', () => {
  eq(evalExpr('max(1200 * 0.02, 25)'), 25)
  eq(evalExpr('max(po.poTotal * 0.02, 25)', { po: {} }), null)
  eq(evalExpr('min(3, 9)'), 3)
  eq(evalExpr('abs(-4)'), 4)
  eq(evalExpr('round(1.6666, 2)'), 1.67)
  eq(evalExpr('len(items)', { items: [1, 2, 3] }), 3)
  eq(evalExpr("sum(items, 'total')", { items: [{ total: 1 }, { total: 2.5 }] }), 3.5)
  eq(evalExpr("num('$1,220.00')"), 1220)
  eq(evalExpr("upper('ab')"), 'AB')
  eq(evalExpr("trim('  x ')"), 'x')
  eq(evalExpr("concat('INV-', n)", { n: 5 }), 'INV-5')
  eq(evalExpr('exists(po)', { po: null }), false)
  eq(evalExpr('coalesce(a, b, 3)', { a: null }), 3)
  eq(evalExpr("if(x > 1, 'big', 'small')", { x: 2 }), 'big')
})
await test('expr: parse errors are ExprError', () => {
  throws(() => parseExpr('1 +'), ExprError)
  throws(() => parseExpr('foo('), ExprError)
  throws(() => parseExpr('a = b'), ExprError)
  throws(() => parseExpr('nope(1)'), ExprError)
  throws(() => parseExpr(''), ExprError)
})
await test('expr: paths + python', () => {
  eq(exprPaths('invoiceTotal - po.poTotal'), ['invoiceTotal', 'po.poTotal'])
  eq(exprToPython('invoiceTotal - po.poTotal'), 'rec["invoiceTotal"] - g(rec, "po.poTotal")')
  eq(exprToPython('max(po.poTotal * 0.02, 25)'), 'max(g(rec, "po.poTotal") * 0.02, 25)')
  eq(exprToPython('a <= b and c == d'), 'rec["a"] <= rec["b"] and rec["c"] == rec["d"]')
  eq(exprToPython("'x'"), '"x"')
  eq(exprToPython('(a + b) * c'), '(rec["a"] + rec["b"]) * rec["c"]')
})

// ============================================================ flowModel
const fm = await imp('src/runtime/flowModel.js')
const eng = await imp('src/runtime/engine.js')

await test('flowModel: create/insert/update/remove/move are immutable', () => {
  const t = fm.createStep('trigger', { source: 'inbox' }, 't1')
  const l = fm.createStep('lookup', { store: 'po', matchOn: [{ recordField: 'po', storeField: 'po' }] }, 'l1')
  const c = fm.createStep('condition', {}, 'c1')
  let flow = fm.createFlow({ id: 'f', moduleId: 'm', name: 'F', steps: [t] })
  const f2 = fm.insertStep(flow, [], 1, l)
  ok(flow.steps.length === 1 && f2.steps.length === 2)
  const f3 = fm.insertStep(f2, [], 2, c)
  const s = fm.createStep('store', { store: 'batch' }, 's1')
  const f4 = fm.insertStep(f3, ['c1', 'yes'], 0, s)
  eq(fm.getList(f4, ['c1', 'yes']).map((x) => x.id), ['s1'])
  eq(fm.findStep(f4, 's1').path, ['c1', 'yes'])
  eq(fm.stepCount(f4), 4)
  const f5 = fm.updateStep(f4, 's1', { config: { store: 'held' } })
  eq(fm.findStep(f5, 's1').step.config.store, 'held')
  eq(fm.findStep(f4, 's1').step.config.store, 'batch')
  const f6 = fm.removeStep(f5, 'l1')
  eq(f6.steps.map((x) => x.id), ['t1', 'c1'])
  const f7 = fm.moveStep(f3, 'c1', -1)
  eq(f7.steps.map((x) => x.id), ['t1', 'c1', 'l1'])
  eq(fm.moveStep(f3, 't1', -1).steps.map((x) => x.id), ['t1', 'l1', 'c1'])
})

// ---- a tiny module for engine tests
const MOD = {
  moduleId: 'test',
  sources: [{ id: 'inbox', label: 'Inbox', labelField: 'invoiceNumber' }],
  stores: [
    { id: 'po-register', label: 'PO Register', keyField: 'poNumber' },
    { id: 'history', label: 'History', keyField: 'invoiceNumber' },
    { id: 'batch', label: 'Batch', daily: true },
    { id: 'held', label: 'Held' },
  ],
  days: [
    {
      id: 'd1',
      label: 'Day 1',
      sources: { inbox: [{ invoiceNumber: 'INV-1', poNumber: 'PO-1', total: 1220 }] },
      seeds: { 'po-register': [{ poNumber: 'PO-1', poTotal: 1200 }], history: [{ invoiceNumber: 'INV-0', total: 5 }] },
      approvals: { 'AP Manager': { outcome: 'approved', at: '2:30 PM' } },
      failures: [],
    },
    {
      id: 'd2',
      label: 'Day 2',
      sources: { inbox: [{ invoiceNumber: 'INV-2', poNumber: 'PO-2', total: 100 }, { invoiceNumber: 'INV-1', poNumber: 'PO-1', total: 1220 }] },
      seeds: { 'po-register': [{ poNumber: 'PO-2', poTotal: 100 }] },
      failures: [{ stepKind: 'lookup', store: 'po-register', cause: 'auth-expired', failAttempts: 1, message: 'token rejected' }],
    },
  ],
}

function refFlow(settings) {
  return fm.createFlow({
    id: 'main',
    moduleId: 'test',
    name: 'main',
    settings: settings || fm.defaultSettings(),
    steps: [
      fm.createStep('trigger', { source: 'inbox' }, 't'),
      fm.createStep('lookup', { store: 'po-register', matchOn: [{ recordField: 'poNumber', storeField: 'poNumber' }], as: 'po' }, 'l'),
      fm.createStep('lookup', { store: 'history', matchOn: [{ recordField: 'invoiceNumber', storeField: 'invoiceNumber' }], as: 'prior' }, 'lh'),
      fm.createStep('transform', { set: [{ field: 'variance', expr: 'total - po.poTotal' }, { field: 'band', expr: 'max(po.poTotal * 0.02, 25)' }] }, 'x'),
      {
        ...fm.createStep('condition', { rules: [{ left: 'variance', op: '<=', right: 'band', rightKind: 'field' }, { left: 'prior', op: 'missing' }], combine: 'all' }, 'c'),
        branches: {
          yes: [fm.createStep('store', { store: 'batch' }, 'sb'), fm.createStep('store', { store: 'history' }, 'sh')],
          no: [fm.createStep('send', { to: 'Procurement Lead', subject: 'Held {{invoiceNumber}}', body: 'variance {{variance}}' }, 'sn'), fm.createStep('store', { store: 'held' }, 'sx')],
        },
      },
    ],
  })
}

await test('engine: day state merges seeds by keyField', () => {
  const s1 = eng.createDayState(MOD, 'd1')
  eq(s1.stores['po-register'].length, 1)
  const s2 = eng.createDayState(MOD, 'd2', { ...s1.stores, history: [...s1.stores.history, { invoiceNumber: 'INV-1' }] })
  eq(s2.stores['po-register'].map((r) => r.poNumber), ['PO-1', 'PO-2'])
  eq(s2.stores.history.length, 2)
  eq(s2.sources.inbox.rows.length, 2)
})

await test('engine: happy path trace, branch, stores, outbox', () => {
  const state = eng.createDayState(MOD, 'd1')
  const res = eng.runFlow(refFlow(), state)
  const rec = res.trace.records[0]
  eq(res.trace.status, 'succeeded')
  eq(rec.label, 'INV-1')
  eq(rec.steps.map((s) => s.kind), ['trigger', 'lookup', 'lookup', 'transform', 'condition', 'store', 'store'])
  eq(rec.steps[4].branch, 'yes')
  eq(rec.final.variance, 20)
  eq(rec.final.band, 25)
  eq(rec.final.prior, null)
  eq(rec.terminal, { type: 'store', target: 'history', stopped: false })
  eq(res.stores.batch.length, 1)
  eq(res.stores.history.length, 2)
  eq(res.outbox.length, 0)
  ok(rec.steps[1].note.includes('matched "PO-1"'))
  ok(rec.steps[2].note.includes('no match'))
  ok(rec.steps[4].note.includes('=> YES'))
})

await test('engine: no-branch records send and the note is legible', () => {
  const state = eng.createDayState(MOD, 'd1')
  const flow = refFlow()
  flow.steps[3].config.set[1].expr = '1'
  const res = eng.runFlow(flow, state)
  const rec = res.trace.records[0]
  eq(rec.steps[4].branch, 'no')
  eq(res.outbox[0].to, 'Procurement Lead')
  eq(res.outbox[0].subject, 'Held INV-1')
  eq(res.outbox[0].body, 'variance 20')
  eq(rec.terminal, { type: 'store', target: 'held', stopped: false })
})

await test('engine: transform shows null with missing path; bad expr fails the step', () => {
  const state = eng.createDayState(MOD, 'd1')
  const flow = refFlow()
  flow.steps[3].config.set[0].expr = 'total - po.nope'
  let res = eng.runFlow(flow, state)
  ok(res.trace.records[0].steps[3].note.includes('variance = null (po.nope missing)'))
  flow.steps[3].config.set[0].expr = 'total -'
  res = eng.runFlow(flow, state)
  eq(res.trace.records[0].steps[3].status, 'failed')
  eq(res.trace.records[0].terminal.type, 'failed')
  eq(res.trace.status, 'failed')
})

await test('engine: missing trigger / missing source', () => {
  const state = eng.createDayState(MOD, 'd1')
  let res = eng.runFlow(fm.createFlow({ id: 'x', steps: [] }), state)
  eq(res.trace.status, 'empty')
  ok(res.trace.log[0].includes('No trigger'))
  res = eng.runFlow(fm.createFlow({ id: 'x', steps: [fm.createStep('trigger', { source: 'nope' })] }), state)
  ok(res.trace.log[0].includes('not connected'))
})

await test('engine: approval + compose + schedule trigger + store from array', () => {
  const state = eng.createDayState(MOD, 'd1')
  const day1 = eng.runFlow(refFlow(), state)
  const runFlow = fm.createFlow({
    id: 'run',
    steps: [
      fm.createStep('trigger', { mode: 'schedule', at: '2:30 PM' }),
      fm.createStep('lookup', { store: 'batch', mode: 'all', as: 'batch', matchOn: [{ recordField: 'day', storeField: 'day' }] }),
      fm.createStep('transform', { set: [{ field: 'count', expr: 'len(batch)' }, { field: 'total', expr: "sum(batch, 'total')" }] }),
      fm.createStep('approval', { approver: 'AP Manager', about: 'payment run' }),
      fm.createStep('compose', { template: 'Run {{day}}: {{count}} invoices, {{total}}\n{{#each batch}}- {{invoiceNumber}} {{total}}\n{{/each}}Approved: {{approval.outcome}}', as: 'doc' }),
      fm.createStep('store', { store: 'history', from: 'batch' }),
    ],
  })
  // lookup all with a non-matching pair would return nothing; use a matching trick: match on nothing -> we allow mode all to ignore pairs? No: require pairs. Use 'always' by matching day to day after tagging.
  runFlow.steps[1].config.matchOn = [{ recordField: 'nothing', storeField: 'nothing' }]
  const res = eng.runFlow(runFlow, { ...state, stores: day1.stores })
  const rec = res.trace.records[0]
  eq(rec.label, 'Scheduled run 2:30 PM')
  eq(rec.final.count, 1)
  eq(rec.final.total, 1220)
  eq(rec.final.approval.outcome, 'approved')
  ok(rec.final.doc.startsWith('Run d1: 1 invoices, 1220\n- INV-1 1220\nApproved: approved'))
  eq(res.stores.history.length, 3)
})

await test('engine: failure injection - retries recover, zero retries fails, policy matters', () => {
  const s1 = eng.createDayState(MOD, 'd1')
  const d1 = eng.runFlow(refFlow(), s1)
  const s2 = eng.createDayState(MOD, 'd2', d1.stores)
  // zero retries, skip -> dropped silently
  let res = eng.runFlow(refFlow(), s2)
  eq(res.trace.status, 'failed')
  eq(res.trace.records[0].terminal.type, 'dropped')
  ok(res.trace.records[0].steps[1].note.includes('auth-expired'))
  // zero retries, dead-letter -> failed but visible
  res = eng.runFlow(refFlow({ ...fm.defaultSettings(), onFailure: 'dead-letter' }), s2)
  eq(res.trace.records[0].terminal.handled, 'dead-letter')
  eq(res.alerts.length, 2)
  eq(res.stores['dead-letter'].length, 2)
  // retries 2 -> recovers, attempt recorded, INV-1 is now a duplicate (in history) -> held
  res = eng.runFlow(refFlow({ ...fm.defaultSettings(), retries: 2, onFailure: 'dead-letter' }), s2)
  eq(res.trace.status, 'succeeded')
  eq(res.trace.records[0].steps[1].attempt, 2)
  ok(res.trace.records[0].steps[1].note.includes('recovered on attempt 2'))
  const dup = res.trace.records.find((r) => r.label === 'INV-1')
  eq(dup.terminal.target, 'held')
  eq(res.stores.batch.map((r) => r.invoiceNumber), ['INV-2'])
})

await test('engine: runDay chains stores across flows; runModule carries days', () => {
  const second = fm.createFlow({ id: 'second', steps: [fm.createStep('trigger', { mode: 'schedule', at: '3 PM' }), fm.createStep('lookup', { store: 'batch', mode: 'all', as: 'b', matchOn: [{ recordField: 'x', storeField: 'x' }] }), fm.createStep('store', { store: 'history', from: 'b' })] })
  const s1 = eng.createDayState(MOD, 'd1')
  const res = eng.runDay([refFlow(), second], s1)
  eq(Object.keys(res.traces), ['main', 'second'])
  eq(res.stores.history.length, 3)
  const all = eng.runModule([refFlow({ ...fm.defaultSettings(), retries: 1 })], MOD, 'd2')
  eq(Object.keys(all.byDay), ['d1', 'd2'])
  eq(all.byDay.d2.status, 'succeeded')
  eq(all.stores.held.length, 1)
})

await test('engine: renderTemplate', () => {
  eq(eng.renderTemplate('Hi {{name}} {{missing}}!', { name: 'A' }), 'Hi A !')
  eq(eng.renderTemplate('{{ total * 2 }}', { total: 3 }), '6')
  eq(eng.renderTemplate('{{#each rows}}[{{n}}]{{/each}}', { rows: [{ n: 1 }, { n: 2 }] }), '[1][2]')
})

// ============================================================ checks
const chk = await imp('src/runtime/checks.js')

await test('checks: store/record/outbox/status kinds with legible detail', () => {
  const s1 = eng.createDayState(MOD, 'd1')
  const rr = eng.runDay([refFlow()], s1)
  const results = chk.evaluateChecks(
    [
      { id: 'a', kind: 'storeContains', store: 'batch', where: { invoiceNumber: 'INV-1' }, label: 'paid' },
      { id: 'b', kind: 'storeMissing', store: 'held', where: { invoiceNumber: 'INV-1' }, label: 'not held' },
      { id: 'c', kind: 'storeCount', store: 'batch', equals: 1, label: 'one' },
      { id: 'd', kind: 'storeSum', store: 'batch', field: 'total', equals: 1220, label: 'sum' },
      { id: 'e', kind: 'recordField', where: { invoiceNumber: 'INV-1' }, field: ['nope.x', 'po.poTotal'], equals: 1200, label: 'po' },
      { id: 'f', kind: 'outboxContains', to: 'Procurement Lead', label: 'sent', count: 0 },
      { id: 'g', kind: 'runStatus', flowId: 'main', equals: 'succeeded', label: 'ok' },
      { id: 'h', kind: 'storeMissing', store: 'batch', where: { invoiceNumber: 'INV-1' }, why: 'it is a test', label: 'should fail' },
      { id: 'i', kind: 'storeContains', store: 'held', where: { invoiceNumber: 'INV-1' }, label: 'should fail too' },
      { id: 'j', kind: 'settingEquals', flowId: 'main', path: 'onFailure', equals: 'dead-letter', label: 'policy' },
      { id: 'k', kind: 'settingInRange', flowId: 'main', path: 'retries', min: 1, max: 5, label: 'retries' },
    ],
    rr,
    s1,
    [refFlow()]
  )
  const byId = Object.fromEntries(results.map((r) => [r.id, r]))
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) ok(byId[id].passed, `${id}: ${byId[id].detail}`)
  ok(!byId.h.passed)
  ok(byId.h.detail.includes('INV-1 IS in batch - it is a test') && byId.h.detail.includes('Path: trigger -> lookup(po-register)'))
  ok(!byId.i.passed)
  ok(byId.i.detail.includes('it was written to history'))
  ok(!byId.j.passed && byId.j.detail.includes('expected "dead-letter"'))
  ok(!byId.k.passed && byId.k.detail.includes('between 1 and 5'))
})

await test('checks: fieldsContain, stepRetried, alertSent', () => {
  const s1 = eng.createDayState(MOD, 'd1')
  const d1 = eng.runFlow(refFlow(), s1)
  const s2 = eng.createDayState(MOD, 'd2', d1.stores)
  const rr = eng.runDay([refFlow({ ...fm.defaultSettings(), retries: 1 })], s2)
  const results = chk.evaluateChecks(
    [
      { id: 'a', kind: 'stepRetried', stepKind: 'lookup', store: 'po-register', label: 'retried' },
      { id: 'b', kind: 'alertSent', label: 'alert' },
    ],
    rr,
    s2,
    []
  )
  ok(results[0].passed && results[0].detail.includes('recovered on attempt 2'))
  ok(!results[1].passed)
  const rr0 = eng.runDay([refFlow({ ...fm.defaultSettings(), onFailure: 'dead-letter' })], s2)
  const r2 = chk.evaluateChecks([{ id: 'b', kind: 'alertSent', label: 'alert' }], rr0, s2, [])
  ok(r2[0].passed)
})

// ============================================================ skins + codegen
const { SKINS, getSkin } = await imp('src/runtime/skins/index.js')
const { renderPython } = await imp('src/runtime/codegen/python.js')

await test('skins: every skin describes every kind; palettes differ by tool', () => {
  eq(SKINS.map((s) => s.id), ['lab', 'powerAutomate', 'make', 'n8n', 'zapier', 'python'])
  for (const skin of SKINS) {
    for (const kind of fm.STEP_KINDS) {
      const d = skin.describe(fm.createStep(kind), { moduleData: MOD })
      ok(d && typeof d.title === 'string' && d.title.length > 0, `${skin.id}/${kind} title`)
      ok(typeof skin.paletteLabel(kind) === 'string' && skin.paletteLabel(kind).length > 0, `${skin.id}/${kind} palette`)
    }
  }
  ok(getSkin('powerAutomate').paletteLabel('transform') !== getSkin('lab').paletteLabel('transform'))
  ok(getSkin('make').describe(fm.createStep('condition'), {}).title.includes('Router'))
  eq(getSkin('nope').id, 'lab')
})

// ============================================================ Beacon golden
const MOD2 = JSON.parse(readFileSync(path.join(root, 'src/data/flows/module-02.json'), 'utf8'))
const { referenceFlowsFor, REFERENCE_BUILD_IDS } = await imp('src/data/flows/module-02.reference.js')

function runBuild(flowsMap, build) {
  const flows = Object.values(flowsMap)
  const all = eng.runModule(flows, MOD2, build.dayId)
  const dayRes = all.byDay[build.dayId]
  return chk.evaluateChecks(build.checks, dayRes, dayRes.dayState, flows)
}
const failing = (results) => results.filter((r) => !r.passed).map((r) => `${r.id}: ${r.detail}`).join('\n    ')

await test('golden: module-02 data is well-formed', () => {
  eq(MOD2.builds.map((b) => b.id), REFERENCE_BUILD_IDS)
  for (const b of MOD2.builds) {
    ok(MOD2.days.some((d) => d.id === b.dayId), `${b.id} day`)
    ok(MOD2.flows.some((f) => f.id === b.flowId), `${b.id} flow`)
    ok(b.checks.length > 0 && b.hints.steps.length > 0 && b.hints.question && b.hints.nudge && b.goal && b.outcome && Array.isArray(b.constraints) && Array.isArray(b.requires), `${b.id} content`)
    for (const c of b.checks) ok(chk.CHECK_KINDS.includes(c.kind), `${b.id}/${c.id} kind ${c.kind}`)
  }
})

for (const build of MOD2.builds) {
  await test(`golden: reference passes ${build.id} (${build.title})`, () => {
    const results = runBuild(referenceFlowsFor(build.id), build)
    ok(chk.allPassed(results), `\n    ${failing(results)}`)
  })
}

await test('golden: the Day 1 flow (b3) FAILS Day 2 - it pays the duplicate and the unknown vendor', () => {
  const b4 = MOD2.builds.find((b) => b.id === 'b4')
  const results = runBuild(referenceFlowsFor('b3'), b4)
  ok(!chk.allPassed(results))
  const byId = Object.fromEntries(results.map((r) => [r.id, r]))
  ok(!byId['b4-dup-not-paid'].passed && byId['b4-dup-not-paid'].detail.includes('INV-58962 IS in payment-batch'))
  ok(!byId['b4-vendor-not-paid'].passed)
  ok(byId['b4-paid'].passed)
  ok(byId['b4-price-not-paid'].passed)
})

await test('golden: the b5 flow with zero retries FAILS Day 3; b6 settings recover it', () => {
  const b6 = MOD2.builds.find((b) => b.id === 'b6')
  const results = runBuild(referenceFlowsFor('b5'), b6)
  const byId = Object.fromEntries(results.map((r) => [r.id, r]))
  ok(!byId['b6-run'].passed && !byId['b6-paid'].passed && !byId['b6-retry'].passed)
  ok(byId['b6-paid'].detail.includes('dropped silently'))
  ok(chk.allPassed(runBuild(referenceFlowsFor('b6'), b6)))
})

await test('golden: each reference level still passes the earlier builds of its day', () => {
  const b1 = MOD2.builds.find((b) => b.id === 'b1')
  const b4 = MOD2.builds.find((b) => b.id === 'b4')
  ok(chk.allPassed(runBuild(referenceFlowsFor('b3'), b1)))
  ok(chk.allPassed(runBuild(referenceFlowsFor('b6'), b4)))
})

await test('codegen: python renders the reference flow and compiles', async () => {
  const flow = referenceFlowsFor('b6')['invoice-flow']
  const code = renderPython(flow, MOD2)
  ok(code.includes('def process_invoice_intake_and_match(rec, stores, outbox, approvals):'))
  ok(code.includes('rec["variance"] = rec["invoiceTotal"] - g(rec, "po.poTotal")'))
  ok(code.includes('if (rec["priorPayment"] is not None):'))
  ok(code.includes('return  # Stop'))
  ok(code.includes('for rec in sources["invoice-inbox"]:'))
  const run = renderPython(referenceFlowsFor('b6')['run-flow'], MOD2)
  ok(run.includes('for row in rec["batch"] or []:'))
  const { execFileSync } = await import('node:child_process')
  const { writeFileSync, mkdtempSync } = await import('node:fs')
  const os = await import('node:os')
  let python = null
  for (const cand of ['python3', 'python']) {
    try {
      execFileSync(cand, ['--version'], { stdio: 'ignore' })
      python = cand
      break
    } catch {
      // try next
    }
  }
  if (!python) return
  const dir = mkdtempSync(path.join(os.tmpdir(), 'sf-py-'))
  for (const [name, src] of [['invoice.py', code], ['run.py', run]]) {
    const f = path.join(dir, name)
    writeFileSync(f, src)
    execFileSync(python, ['-c', `import ast,sys; ast.parse(open(sys.argv[1]).read())`, f], { stdio: 'pipe' })
  }
})

// ============================================================ flowProgress (pure parts)
const fp = await imp('src/lib/flowProgress.js')

await test('flowProgress: v1 -> v2 migration keeps flows and converts passed booleans', () => {
  const fresh = fp.initialFlowState(MOD2)
  const migrated = fp.migrateFlowState({ version: 1, flows: { 'invoice-flow': { id: 'invoice-flow', steps: [] } }, passed: { b1: true, b2: true }, activeBuildId: 'b3', skin: 'make' }, fresh)
  eq(migrated.version, 2)
  eq(migrated.passed.b1, { at: null, hintsUsed: 0, runs: 0, assisted: false })
  ok(migrated.flows['run-flow'], 'missing flow restored')
  eq(migrated.flows['invoice-flow'].steps.length, 0)
  eq(migrated.skin, 'make')
  eq(migrated.introSeen, false)
  eq(fp.migrateFlowState(null, fresh), fresh)
})

await test('flowProgress: build unlock needs the previous pass AND the required concepts', () => {
  const builds = [{ id: 'b1', requires: ['trigger'] }, { id: 'b2', requires: [] }, { id: 'b3', requires: ['condition'] }]
  ok(!fp.isBuildUnlocked(builds, 0, {}, {}))
  ok(fp.isBuildUnlocked(builds, 0, {}, { trigger: { at: 1 } }))
  ok(!fp.isBuildUnlocked(builds, 1, {}, { trigger: 1 }))
  ok(fp.isBuildUnlocked(builds, 1, { b1: { at: 1 } }, {}))
  ok(!fp.isBuildUnlocked(builds, 2, { b1: 1, b2: 1 }, {}))
  ok(fp.isBuildUnlocked(builds, 2, { b1: 1, b2: 1 }, { condition: 1 }))
  eq(fp.pendingConcepts(builds[2], {}), ['condition'])
  ok(!fp.isBuildUnlocked(builds, 3, {}, {}))
})

await test('flowProgress: node status from builds', () => {
  const mod = { builds: [{ id: 'b1', mapNodes: ['a', 'b'] }, { id: 'b2', mapNodes: ['b', 'c'] }, { id: 'b3', mapNodes: ['d'] }] }
  let st = fp.nodeStatusFromBuilds(mod, {}, 'b1')
  eq(st, { a: 'active', b: 'active', c: 'locked', d: 'locked' })
  st = fp.nodeStatusFromBuilds(mod, { b1: { assisted: false } }, 'b2')
  eq(st, { a: 'complete', b: 'active', c: 'active', d: 'locked' })
  st = fp.nodeStatusFromBuilds(mod, { b1: { assisted: false }, b2: { assisted: true } }, 'b3')
  eq(st, { a: 'complete', b: 'assisted', c: 'assisted', d: 'active' })
  eq(fp.nodeBuilds(mod, 'b').map((b) => b.id), ['b1', 'b2'])
  eq(fp.markConceptPassed({ version: 1, passed: {} }, 'lookup', 'module-02', 5).passed.lookup, { at: 5, moduleId: 'module-02' })
})

// ============================================================ concepts (rosettas + waypoints)
const { readdirSync } = await import('node:fs')
const cpt = await imp('src/runtime/concepts.js')
const CONCEPT_FILES = []
for (const [dir, kind] of [['src/data/rosettas', 'rosetta'], ['src/data/waypoints', 'waypoint']]) {
  for (const f of readdirSync(path.join(root, dir)).filter((x) => x.endsWith('.json')).sort()) {
    CONCEPT_FILES.push({ kind, file: `${dir}/${f}`, concept: { kind, ...JSON.parse(readFileSync(path.join(root, dir, f), 'utf8')) } })
  }
}
const CONCEPT_IDS = new Set(CONCEPT_FILES.map((c) => c.concept.id))

await test('concepts: files are well-formed and ids match filenames', () => {
  ok(CONCEPT_FILES.length >= 16, `found ${CONCEPT_FILES.length}`)
  for (const { file, concept } of CONCEPT_FILES) {
    ok(file.endsWith(`/${concept.id}.json`), `${file} id mismatch`)
    for (const k of ['label', 'gloss', 'why', 'task', 'sample', 'checks', 'exercise', 'introducedBy']) ok(concept[k] !== undefined, `${file} missing ${k}`)
    ok(Array.isArray(concept.checks) && concept.checks.length >= 1, `${file} checks`)
    ok(/^[\x00-\x7F]*$/.test(JSON.stringify(concept)), `${file} is not ASCII`)
    for (const c of concept.checks) ok(chk.CHECK_KINDS.includes(c.kind), `${file} check kind ${c.kind}`)
  }
})

for (const { file, concept } of CONCEPT_FILES) {
  await test(`concept: ${concept.id} - solution passes, starting point does not`, () => {
    const sol = cpt.applySolution(concept)
    const withSolution = cpt.runConcept(concept, { flow: sol.flow, record: sol.record })
    ok(withSolution.passed, `${file} solution fails:\n    ${withSolution.results.filter((r) => !r.passed).map((r) => `${r.id}: ${r.detail}`).join('\n    ')}`)
    const baselineRecord = concept.exercise === 'json-edit' ? concept.brokenRecord : null
    const baseline = cpt.runConcept(concept, { flow: cpt.conceptFlow(concept), record: baselineRecord })
    ok(!baseline.passed, `${file} passes without doing anything`)
  })
}

await test('concepts: every build.requires in module-02 names an existing concept', () => {
  for (const b of MOD2.builds) for (const id of b.requires || []) ok(CONCEPT_IDS.has(id), `${b.id} requires unknown concept ${id}`)
  // Every step kind used by the Beacon reference has a rosetta.
  const kinds = new Set()
  for (const f of Object.values(referenceFlowsFor('b6'))) fm.walkSteps(f.steps, (st) => kinds.add(st.kind))
  for (const k of kinds) ok(CONCEPT_IDS.has(k) || k === 'trigger', `no rosetta for step kind ${k}`)
})

// ============================================================ summary
console.log(`test:runtime - ${passed} passed, ${failed} failed`)
for (const f of failures) {
  console.log(`\nFAIL ${f.name}\n  ${f.error && f.error.stack ? f.error.stack.split("\n").slice(0, 12).join('\n  ') : f.error}`)
}
if (failed > 0) process.exit(1)
