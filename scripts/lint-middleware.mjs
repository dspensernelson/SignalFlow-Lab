// Middleware-track lint. Run with: npm run lint:middleware (part of npm run check).
//
// The middleware track keeps its data in src/data/middleware/ (track.json,
// map.json, lessons/*.json, scenarios/*.json) and its acceptance checks in
// middleware/checks/<module>/test_<lesson>.py. None of the automation-track
// lints see that directory, so this script is the whole quality gate for the
// track's content:
//
//  1. track.json: module ids m0..m8, unique, contiguous order, non-empty
//     outcome/artifact/resources, an explain-it with 3-5 answered questions.
//  2. map.json: unique node ids, group refs resolve, edges resolve.
//  3. lessons: id == filename, id pattern m<mod>-<n>-<slug>, module exists,
//     order contiguous from 1 within the module, required fields, enums,
//     at most 2 build resources, a pytest check has its test file on disk,
//     a simulate scenario resolves, explain-only lessons carry explain-it.
//  4. scenarios: steps reference map nodes, kinds/statuses in enum,
//     durationMs 300-4000, payload present on request/response steps.
//  5. Copy is ASCII-only (error, not warning: this track starts clean).
//  6. Warnings: orphan scenarios, orphan check files.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'src', 'data', 'middleware')
const lessonsDir = path.join(dataDir, 'lessons')
const scenariosDir = path.join(dataDir, 'scenarios')
const checksDir = path.join(root, 'middleware', 'checks')

const CHECK_KINDS = new Set(['pytest', 'explain', 'none'])
const STEP_KINDS = new Set(['request', 'response', 'error', 'wait', 'hold', 'release', 'note'])
const STEP_STATUS = new Set(['ok', 'error', 'timeout', 'pending', 'held'])
const NODE_STATES = new Set(['active', 'ok', 'error', 'held', 'waiting', 'idle'])
const RESOURCE_TYPES = new Set(['course', 'docs', 'repo'])
const LESSON_ID = /^m[0-8]-\d+-[a-z0-9-]+$/

let errors = 0
let warnings = 0
function err(scope, msg) {
  errors += 1
  console.log(`ERROR ${scope}: ${msg}`)
}
function warn(scope, msg) {
  warnings += 1
  console.log(`warn  ${scope}: ${msg}`)
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function listJson(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
}

// Walks every string in a JSON value and reports the first non-ASCII char.
function checkAscii(scope, value, trail = '') {
  if (typeof value === 'string') {
    const m = value.match(/[^\x09\x0A\x0D\x20-\x7E]/)
    if (m) err(scope, `non-ASCII character ${JSON.stringify(m[0])} at ${trail || '(root)'}`)
    return
  }
  if (Array.isArray(value)) value.forEach((v, i) => checkAscii(scope, v, `${trail}[${i}]`))
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => checkAscii(scope, v, trail ? `${trail}.${k}` : k))
  }
}

function checkResource(scope, r, i) {
  if (!r || typeof r !== 'object') return err(scope, `resource[${i}] is not an object`)
  if (!RESOURCE_TYPES.has(r.type)) err(scope, `resource[${i}].type "${r.type}" not in ${[...RESOURCE_TYPES].join('|')}`)
  if (!r.label) err(scope, `resource[${i}].label missing`)
  if (!r.url || !/^https:\/\//.test(r.url)) err(scope, `resource[${i}].url must be an https URL`)
}

function checkExplainIt(scope, explainIt) {
  if (!explainIt || !Array.isArray(explainIt.questions)) return err(scope, 'explainIt.questions missing')
  const n = explainIt.questions.length
  if (n < 3 || n > 5) err(scope, `explainIt has ${n} questions (need 3-5)`)
  explainIt.questions.forEach((q, i) => {
    if (!q.q) err(scope, `explainIt.questions[${i}].q missing`)
    if (!q.modelAnswer) err(scope, `explainIt.questions[${i}].modelAnswer missing`)
  })
}

// ---- 1. track.json ---------------------------------------------------------

const track = readJson(path.join(dataDir, 'track.json'))
checkAscii('track.json', track)
if (track.id !== 'middleware') err('track.json', `id must be "middleware" (got "${track.id}")`)
const modules = Array.isArray(track.modules) ? track.modules : []
const moduleIds = new Set()
modules.forEach((m, i) => {
  const scope = `track.json module[${i}] ${m.id || '?'}`
  if (!/^m[0-8]$/.test(m.id || '')) err(scope, 'id must be m0..m8')
  if (moduleIds.has(m.id)) err(scope, 'duplicate module id')
  moduleIds.add(m.id)
  if (m.order !== i) err(scope, `order ${m.order} is not contiguous (expected ${i})`)
  if (m.id !== `m${i}`) err(scope, `id ${m.id} does not match its position m${i}`)
  ;['title', 'outcome', 'artifact'].forEach((k) => {
    if (!m[k]) err(scope, `${k} missing`)
  })
  if (!(m.hours > 0)) err(scope, 'hours must be positive')
  if (!Array.isArray(m.resources) || m.resources.length === 0) err(scope, 'resources must be non-empty')
  else m.resources.forEach((r, ri) => checkResource(scope, r, ri))
  checkExplainIt(scope, m.explainIt)
})
if (modules.length !== 9) err('track.json', `expected 9 modules, found ${modules.length}`)

// ---- 2. map.json -----------------------------------------------------------

const map = readJson(path.join(dataDir, 'map.json'))
checkAscii('map.json', map)
const mapNodeIds = new Set()
const groupIds = new Set((map.groups || []).map((g) => g.id))
;(map.nodes || []).forEach((n) => {
  if (mapNodeIds.has(n.id)) err('map.json', `duplicate node id ${n.id}`)
  mapNodeIds.add(n.id)
  if (n.group && !groupIds.has(n.group)) err('map.json', `node ${n.id} references unknown group ${n.group}`)
  if (typeof n.x !== 'number' || typeof n.y !== 'number') err('map.json', `node ${n.id} needs numeric x/y`)
})
;(map.edges || []).forEach((e, i) => {
  if (!mapNodeIds.has(e.from)) err('map.json', `edge[${i}].from ${e.from} unknown`)
  if (!mapNodeIds.has(e.to)) err('map.json', `edge[${i}].to ${e.to} unknown`)
})

// ---- 4. scenarios (read first so lessons can resolve them) -----------------

const scenarios = {}
listJson(scenariosDir).forEach((file) => {
  const scope = `scenarios/${file}`
  const s = readJson(path.join(scenariosDir, file))
  checkAscii(scope, s)
  if (s.id !== file.replace(/\.json$/, '')) err(scope, `id "${s.id}" does not match filename`)
  scenarios[s.id] = { ...s, _used: false }
  if (!s.title) err(scope, 'title missing')
  if (!Array.isArray(s.steps) || s.steps.length === 0) return err(scope, 'steps must be non-empty')
  const stepIds = new Set()
  s.steps.forEach((st, i) => {
    const ss = `${scope} step[${i}] ${st.id || '?'}`
    if (!st.id) err(ss, 'id missing')
    if (stepIds.has(st.id)) err(ss, 'duplicate step id')
    stepIds.add(st.id)
    if (!STEP_KINDS.has(st.kind)) err(ss, `kind "${st.kind}" not in ${[...STEP_KINDS].join('|')}`)
    if (!STEP_STATUS.has(st.status)) err(ss, `status "${st.status}" not in ${[...STEP_STATUS].join('|')}`)
    if (!st.label) err(ss, 'label missing')
    if (st.from && !mapNodeIds.has(st.from)) err(ss, `from ${st.from} is not a map node`)
    if (st.to && !mapNodeIds.has(st.to)) err(ss, `to ${st.to} is not a map node`)
    if ((st.kind === 'request' || st.kind === 'response' || st.kind === 'error') && (!st.from || !st.to)) {
      err(ss, `${st.kind} steps need from and to`)
    }
    if ((st.kind === 'request' || st.kind === 'response') && st.payload === undefined) err(ss, 'payload missing')
    if (typeof st.durationMs !== 'number' || st.durationMs < 300 || st.durationMs > 4000) {
      err(ss, `durationMs ${st.durationMs} outside 300-4000`)
    }
    Object.entries(st.nodeStates || {}).forEach(([nodeId, state]) => {
      if (!mapNodeIds.has(nodeId)) err(ss, `nodeStates.${nodeId} is not a map node`)
      if (!NODE_STATES.has(state)) err(ss, `nodeStates.${nodeId} "${state}" not in ${[...NODE_STATES].join('|')}`)
    })
  })
})

// ---- 3. lessons ------------------------------------------------------------

const lessonFiles = listJson(lessonsDir)
const lessons = []
lessonFiles.forEach((file) => {
  const scope = `lessons/${file}`
  const l = readJson(path.join(lessonsDir, file))
  checkAscii(scope, l)
  lessons.push(l)
  if (l.id !== file.replace(/\.json$/, '')) err(scope, `id "${l.id}" does not match filename`)
  if (!LESSON_ID.test(l.id || '')) err(scope, `id "${l.id}" does not match m<module>-<n>-<slug>`)
  if (!moduleIds.has(l.module)) err(scope, `module "${l.module}" is not in track.json`)
  if (l.id && l.module && !l.id.startsWith(`${l.module}-`)) err(scope, `id does not start with module "${l.module}-"`)
  if (!Number.isInteger(l.order) || l.order < 1) err(scope, 'order must be a positive integer')
  ;['title', 'concept', 'build', 'check'].forEach((k) => {
    if (!l[k]) err(scope, `${k} missing`)
  })
  if (!(l.estimateHours > 0)) err(scope, 'estimateHours must be positive')
  if (l.concept) {
    if (!l.concept.heading) err(scope, 'concept.heading missing')
    if (!Array.isArray(l.concept.paragraphs) || l.concept.paragraphs.length < 1 || l.concept.paragraphs.length > 5) {
      err(scope, 'concept.paragraphs must have 1-5 entries')
    }
    if (!l.concept.lowCodeEquivalent) err(scope, 'concept.lowCodeEquivalent missing')
  }
  if (l.pythonBlock) {
    if (!l.pythonBlock.title || !l.pythonBlock.code) err(scope, 'pythonBlock needs title and code')
    if (l.pythonBlock.resource) checkResource(`${scope} pythonBlock`, l.pythonBlock.resource, 0)
  }
  if (l.build) {
    const b = l.build
    if (!Array.isArray(b.files) || b.files.length === 0) err(scope, 'build.files must be non-empty')
    else b.files.forEach((f) => {
      if (!/^middleware\//.test(f)) err(scope, `build.files entry "${f}" must be under middleware/`)
    })
    if (!Array.isArray(b.spec) || b.spec.length < 1 || b.spec.length > 6) err(scope, 'build.spec must have 1-6 items')
    if (!Array.isArray(b.askClaudeFor) || b.askClaudeFor.length === 0) err(scope, 'build.askClaudeFor must be non-empty')
    if (!Array.isArray(b.writeYourself) || b.writeYourself.length === 0) err(scope, 'build.writeYourself must be non-empty')
    const res = Array.isArray(b.resources) ? b.resources : []
    if (res.length > 2) err(scope, `build.resources has ${res.length} entries (max 2)`)
    res.forEach((r, i) => checkResource(scope, r, i))
  }
  if (l.check) {
    if (!CHECK_KINDS.has(l.check.kind)) err(scope, `check.kind "${l.check.kind}" not in ${[...CHECK_KINDS].join('|')}`)
    if (l.check.lessonId !== l.id) err(scope, `check.lessonId "${l.check.lessonId}" must equal the lesson id`)
    if (!l.check.summary) err(scope, 'check.summary missing')
    if (l.check.kind === 'pytest') {
      if (!l.check.command) err(scope, 'check.command missing for a pytest check')
      const testFile = path.join(checksDir, l.module, `test_${l.id.replace(/-/g, '_')}.py`)
      if (!existsSync(testFile)) err(scope, `pytest check file missing: ${path.relative(root, testFile)}`)
    }
    if (l.check.kind === 'explain') checkExplainIt(scope, l.explainIt)
  }
  if (l.simulate) {
    const s = scenarios[l.simulate.scenarioId]
    if (!s) err(scope, `simulate.scenarioId "${l.simulate.scenarioId}" has no scenario file`)
    else s._used = true
  }
})

// Order contiguity within each module.
modules.forEach((m) => {
  const orders = lessons
    .filter((l) => l.module === m.id)
    .map((l) => l.order)
    .sort((a, b) => a - b)
  orders.forEach((o, i) => {
    if (o !== i + 1) err(`track ${m.id}`, `lesson orders ${orders.join(',')} are not contiguous from 1`)
  })
})

// ---- 6. orphans ------------------------------------------------------------

Object.values(scenarios).forEach((s) => {
  if (!s._used) warn(`scenarios/${s.id}.json`, 'not referenced by any lesson')
})
if (existsSync(checksDir)) {
  const lessonIds = new Set(lessons.map((l) => l.id))
  readdirSync(checksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^m[0-8]$/.test(d.name))
    .forEach((d) => {
      readdirSync(path.join(checksDir, d.name))
        .filter((f) => /^test_.*\.py$/.test(f))
        .forEach((f) => {
          const id = f.replace(/^test_/, '').replace(/\.py$/, '').replace(/_/g, '-')
          if (!lessonIds.has(id)) warn(`middleware/checks/${d.name}/${f}`, 'no lesson references this check')
        })
    })
}

const pytestCount = lessons.filter((l) => l.check?.kind === 'pytest').length
const simCount = lessons.filter((l) => l.simulate).length
console.log(
  `lint:middleware - ${modules.length} modules, ${lessons.length} lessons (${pytestCount} pytest checks, ${simCount} simulations), ${Object.keys(scenarios).length} scenarios, ${mapNodeIds.size} map nodes: ${errors} error(s), ${warnings} warning(s)`
)
process.exit(errors > 0 ? 1 : 0)
