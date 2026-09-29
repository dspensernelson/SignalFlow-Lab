// Flow-module lint. Run with: npm run lint:flows
//
// Every runnable-flow module (src/data/flows/module-XX.json) is data: a world,
// sources, stores, days, and builds with acceptance checks and concept gates.
// This lint holds the authoring invariants so a module cannot ship half-formed:
//   1. shape: moduleId matches the file; world, owners, sources, stores, flows,
//      days, builds present; ASCII only
//   2. days: in order clean -> mess -> failure (>= 2 days; 3 expected)
//   3. builds: dayId/flowId resolve; >= 3 checks; >= 1 mapNodes; goal, outcome,
//      hints {question, nudge, steps}; constraints array; requires array
//   4. checks: kind is a known check kind; store/source ids referenced exist;
//      every check has an id, label (and why)
//   5. requires: every concept id has a file in src/data/rosettas or
//      src/data/waypoints
//   6. failures: stepKind is a real step kind; store ids exist
//   7. map coverage: handled by lint-map (mapNodes vs workflowNodes)
//   8. canon: curriculum/<id>/canon.json (format "flows") holds - facts about
//      the raw day data, and about the reference solution's run of the whole
//      module (every day, stores carried forward)
// The golden behaviour (reference passes every build; the previous build fails
// the mess day) lives in scripts/test-runtime.mjs.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imp = (rel) => import('file://' + path.join(root, rel).replace(/\\/g, '/'))
const { CHECK_KINDS } = await imp('src/runtime/checks.js')
const { STEP_KINDS } = await imp('src/runtime/flowModel.js')
const { runModule, getPath } = await imp('src/runtime/engine.js')

const flowsDir = path.join(root, 'src', 'data', 'flows')
const conceptIds = new Set()
for (const dir of ['rosettas', 'waypoints']) {
  const d = path.join(root, 'src', 'data', dir)
  if (!existsSync(d)) continue
  for (const f of readdirSync(d)) if (f.endsWith('.json')) conceptIds.add(f.replace(/\.json$/, ''))
}

let errors = 0
let warnings = 0
const files = readdirSync(flowsDir).filter((f) => /^module-\d+\.json$/.test(f)).sort()

for (const file of files) {
  const raw = readFileSync(path.join(flowsDir, file), 'utf8')
  const m = JSON.parse(raw)
  const id = file.replace(/\.json$/, '')
  const err = (msg) => { errors += 1; console.log(`ERROR [${id}] ${msg}`) }
  const warn = (msg) => { warnings += 1; console.log(`warn  [${id}] ${msg}`) }

  // 1. shape
  if (m.moduleId !== id) err(`moduleId "${m.moduleId}" does not match file name`)
  if (!/^[\x00-\x7F]*$/.test(raw)) err('file is not ASCII-only')
  for (const k of ['world', 'owners', 'sources', 'stores', 'flows', 'days', 'builds']) if (!m[k]) err(`missing "${k}"`)
  const world = m.world || {}
  for (const k of ['oneLiner', 'roles', 'deliverable', 'clock']) if (!world[k]) err(`world.${k} missing`)
  const sourceIds = new Set((m.sources || []).map((s) => s.id))
  const storeIds = new Set((m.stores || []).map((s) => s.id))
  const flowIds = new Set((m.flows || []).map((f) => f.id))
  const dayIds = (m.days || []).map((d) => d.id)
  for (const s of m.stores || []) if (!s.label) err(`store ${s.id} has no label`)
  for (const s of m.sources || []) if (!s.labelField) err(`source ${s.id} has no labelField`)

  // 2. days
  if (dayIds.length < 2) err(`needs at least 2 days (clean, mess); has ${dayIds.length}`)
  if (dayIds.length < 3) warn('no failure day (day 3) yet')
  for (const d of m.days || []) {
    for (const src of Object.keys(d.sources || {})) if (!sourceIds.has(src)) err(`day ${d.id} sources names unknown source "${src}"`)
    for (const st of Object.keys(d.seeds || {})) if (!storeIds.has(st)) err(`day ${d.id} seeds names unknown store "${st}"`)
    for (const f of d.failures || []) {
      if (f.stepKind && !STEP_KINDS.includes(f.stepKind)) err(`day ${d.id} failure names unknown step kind "${f.stepKind}"`)
      if (f.store && !storeIds.has(f.store)) err(`day ${d.id} failure names unknown store "${f.store}"`)
      if (!f.cause) err(`day ${d.id} failure has no cause`)
    }
  }

  // 3. builds
  const builds = m.builds || []
  if (builds.length === 0) err('no builds')
  let lastDayIdx = -1
  for (const b of builds) {
    const dIdx = dayIds.indexOf(b.dayId)
    if (dIdx === -1) err(`build ${b.id} dayId "${b.dayId}" is not a day`)
    if (dIdx < lastDayIdx) err(`build ${b.id} goes back to an earlier day (builds must follow day order)`)
    lastDayIdx = Math.max(lastDayIdx, dIdx)
    if (!flowIds.has(b.flowId)) err(`build ${b.id} flowId "${b.flowId}" is not a flow`)
    if (!b.title || !b.goal) err(`build ${b.id} needs title and goal`)
    if (!b.outcome) err(`build ${b.id} needs an outcome sentence`)
    if (!Array.isArray(b.constraints)) err(`build ${b.id} needs a constraints array`)
    if (!b.hints || Array.isArray(b.hints) || !b.hints.question || !b.hints.nudge || !Array.isArray(b.hints.steps) || !b.hints.steps.length) err(`build ${b.id} hints must be {question, nudge, steps[]}`)
    if (!Array.isArray(b.requires)) err(`build ${b.id} needs a requires array (may be empty)`)
    if (!Array.isArray(b.mapNodes) || b.mapNodes.length === 0) err(`build ${b.id} needs mapNodes`)
    if (!Array.isArray(b.checks) || b.checks.length < 3) err(`build ${b.id} needs at least 3 checks`)
    // 4. checks
    const seen = new Set()
    for (const c of b.checks || []) {
      if (!c.id) err(`build ${b.id} has a check without id`)
      if (seen.has(c.id)) err(`build ${b.id} duplicate check id ${c.id}`)
      seen.add(c.id)
      if (!c.label) err(`build ${b.id} check ${c.id} has no label`)
      if (!c.why) warn(`build ${b.id} check ${c.id} has no why`)
      if (!CHECK_KINDS.includes(c.kind)) err(`build ${b.id} check ${c.id} unknown kind "${c.kind}"`)
      if (c.store && !storeIds.has(c.store)) err(`build ${b.id} check ${c.id} names unknown store "${c.store}"`)
      if (c.flowId && !flowIds.has(c.flowId)) err(`build ${b.id} check ${c.id} names unknown flow "${c.flowId}"`)
    }
    // 5. requires
    for (const r of b.requires || []) if (!conceptIds.has(r)) err(`build ${b.id} requires unknown concept "${r}" (no file in src/data/rosettas or src/data/waypoints)`)
  }
  // 8. canon
  const canonPath = path.join(root, 'curriculum', id, 'canon.json')
  let canonCount = 0
  if (!existsSync(canonPath)) warn('no curriculum canon.json')
  else {
    const canon = JSON.parse(readFileSync(canonPath, 'utf8'))
    if (canon.format !== 'flows') err('canon.json is not format "flows" (the per-lesson canon was retired with the worksheets)')
    const refPath = path.join(flowsDir, `${id}.reference.js`)
    let byDay = null
    if (!existsSync(refPath)) err(`no ${id}.reference.js to run the canon against`)
    else {
      const ref = await imp(`src/data/flows/${id}.reference.js`)
      const last = builds[builds.length - 1]
      byDay = runModule(Object.values(ref.referenceFlowsFor(last.id)), m, dayIds[dayIds.length - 1]).byDay
    }
    const same = (a, b) => (typeof a === 'number' || typeof b === 'number' ? Math.abs(Number(a) - Number(b)) < 0.005 : String(a) === String(b))
    const matches = (row, where) => Object.entries(where || {}).every(([k, v]) => same(getPath(row, k), v))
    for (const a of canon.assertions || []) {
      canonCount += 1
      const tag = `canon ${a.kind} ${a.day} ${JSON.stringify(a.where || a.label)}${a.field ? ` .${a.field}` : ''}`
      const day = (m.days || []).find((d) => d.id === a.day)
      if (!day) { err(`${tag}: unknown day`); continue }
      if (a.kind === 'data') {
        const rows = a.source ? (day.sources || {})[a.source] : (day.seeds || {})[a.seed]
        const row = (rows || []).find((r) => matches(r, a.where))
        if (!row) err(`${tag}: no such row in ${a.source || a.seed}`)
        else if (!same(getPath(row, a.field), a.equals)) err(`${tag} is ${JSON.stringify(getPath(row, a.field))}, canon says ${JSON.stringify(a.equals)}`)
        continue
      }
      if (!byDay || !byDay[a.day]) continue
      const res = byDay[a.day]
      if (a.kind === 'record') {
        const traces = a.flow ? [res.traces[a.flow]].filter(Boolean) : Object.values(res.traces)
        const rt = traces.flatMap((t) => t.records).find((r) => r.label === a.label)
        if (!rt) err(`${tag}: no record with that label in the reference run`)
        else if (!same(getPath(rt.final, a.field), a.equals)) err(`${tag} is ${JSON.stringify(getPath(rt.final, a.field))} in the reference run, canon says ${JSON.stringify(a.equals)}`)
      } else if (a.kind === 'store') {
        const rows = (res.stores[a.store] || []).filter((r) => matches(r, a.where))
        if (a.count !== undefined && rows.length !== a.count) err(`${tag}: ${a.store} has ${rows.length} matching rows in the reference run, canon says ${a.count}`)
        if (a.exists && rows.length === 0) err(`${tag}: not in ${a.store} in the reference run`)
        if (a.field !== undefined) {
          if (!rows.length) err(`${tag}: no matching row in ${a.store}`)
          else if (!same(getPath(rows[0], a.field), a.equals)) err(`${tag} is ${JSON.stringify(getPath(rows[0], a.field))} in the reference run, canon says ${JSON.stringify(a.equals)}`)
        }
      } else err(`${tag}: unknown canon kind`)
    }
  }
  console.log(`flow lint [${id}]: ${dayIds.length} days, ${builds.length} builds, ${builds.reduce((n, b) => n + (b.checks || []).length, 0)} checks, ${canonCount} canon facts`)
}

// Concept files: shape.
for (const dir of ['rosettas', 'waypoints']) {
  const d = path.join(root, 'src', 'data', dir)
  if (!existsSync(d)) continue
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json'))) {
    const raw = readFileSync(path.join(d, f), 'utf8')
    const c = JSON.parse(raw)
    const err = (msg) => { errors += 1; console.log(`ERROR [${dir}/${f}] ${msg}`) }
    if (c.id !== f.replace(/\.json$/, '')) err('id does not match file name')
    if (!/^[\x00-\x7F]*$/.test(raw)) err('not ASCII-only')
    for (const k of ['label', 'gloss', 'why', 'task', 'sample', 'checks', 'exercise', 'introducedBy']) if (c[k] === undefined) err(`missing ${k}`)
    if (!['add-step', 'settings', 'json-edit'].includes(c.exercise)) err(`unknown exercise "${c.exercise}"`)
    for (const chk of c.checks || []) if (!CHECK_KINDS.includes(chk.kind)) err(`check ${chk.id} unknown kind "${chk.kind}"`)
    if (c.exercise === 'add-step' && !(c.add && STEP_KINDS.includes(c.add.kind))) err('add-step needs add.kind = a step kind')
    if (c.exercise === 'json-edit' && !c.brokenRecord) err('json-edit needs brokenRecord')
  }
}

console.log(`\nflow lint: ${files.length} module(s), ${conceptIds.size} concept(s), ${errors} errors, ${warnings} warnings`)
process.exit(errors === 0 ? 0 : 1)
