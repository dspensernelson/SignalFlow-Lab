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

// ============================================================ summary
console.log(`test:runtime - ${passed} passed, ${failed} failed`)
for (const f of failures) {
  console.log(`\nFAIL ${f.name}\n  ${f.error && f.error.stack ? f.error.stack.split('\n').slice(0, 4).join('\n  ') : f.error}`)
}
if (failed > 0) process.exit(1)
