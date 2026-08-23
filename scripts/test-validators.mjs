// Validator audit. Run with: npm run test:validators
//
// REMEDIATION_PLAN Phase 1.3. `test:lessons` already proves each lesson has a
// correct answer that passes and a wrong answer that fails. It does NOT prove
// the validator judges SUBSTANCE rather than SHAPE.
//
// The difference matters. A 2026-08-22 probe submitted this to the Hard-tier
// drill "Design the Tolerance Policy from Vendor History":
//
//   { policyName: "x", version: "x", owner: "x", approver: "x",
//     priceTolerancePct: 9999, priceToleranceAbs: 0,
//     toleranceBasis: "smaller of the two, whatever", qtyTolerance: 500,
//     rationale: "no reason at all" }
//
// That policy catches ZERO of the 6 overcharges the lesson asks the learner to
// catch, and breaks the exact-quantity rule outright. It passed 18 of 18
// checks, because jsonPolicy validates presence, numeric-ness, and
// non-emptiness - never the values.
//
// This harness synthesises, for every lesson, an answer that is STRUCTURALLY
// VALID (right fields, right types, right row keys, ordering rules respected)
// but SUBSTANTIVELY WRONG, and asserts the validator rejects it. A validator
// that passes its own garbage is hollow: it is grading the learner's typing,
// not their thinking.
//
// Known-hollow types are listed in HOLLOW_ALLOWLIST with the reason and the
// remediation step that will fix them. The allow-list is the debt register: it
// keeps the check green while making the debt impossible to forget. Removing a
// type from it is the definition of done for REMEDIATION_PLAN Phase 2.

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lessonsDir = path.join(root, 'src', 'data', 'lessons')

const { validateAnswer } = await import(
  'file://' + path.join(root, 'src', 'lib', 'validators.js').replace(/\\/g, '/')
)

// Validation types that are KNOWN to pass structurally-valid garbage today.
// Each entry must name why and which plan step retires it.
const HOLLOW_ALLOWLIST = {
  jsonPolicy:
    'checks presence + numeric-ness + non-emptiness only, never the values. ' +
    'REMEDIATION_PLAN 2.1 replaces it with a simulation that runs the learner ' +
    "thresholds against the evidence the lesson already states (e.g. 84 benign " +
    'variances pass, 6 overcharges caught). Until then, Hard-tier design drills ' +
    'grade shape, not design.',
}

const GARBAGE_STRING = 'ZZ-NOT-THE-ANSWER'
const GARBAGE_NUMBER = 987654

// A value that is the right TYPE but definitely not the right VALUE.
function wrongLike(value) {
  if (typeof value === 'boolean') return !value
  if (typeof value === 'number') return GARBAGE_NUMBER
  return GARBAGE_STRING
}

// Build a structurally-valid, substantively-wrong answer for one validation
// spec. Returns null when the type has no meaningful garbage form.
function garbageFor(validation, lesson) {
  const v = validation
  switch (v.type) {
    case 'jsonFields': {
      const out = {}
      for (const f of v.requiredFields || []) {
        const exp = v.expected?.[f]
        out[f] = exp !== undefined ? wrongLike(exp) : GARBAGE_STRING
      }
      return out
    }
    case 'jsonPolicy': {
      const out = {}
      for (const f of v.requiredFields || []) out[f] = GARBAGE_STRING
      for (const f of v.numericFields || []) out[f] = GARBAGE_NUMBER
      for (const f of v.nonEmptyFields || []) out[f] = GARBAGE_STRING
      // Respect the ordering rule so we are testing substance, not shape.
      if (v.ordering?.greater && v.ordering?.than) {
        out[v.ordering.greater] = GARBAGE_NUMBER
        out[v.ordering.than] = 1
      }
      return out
    }
    case 'jsonRows':
    case 'jsonDeltas': {
      const key = v.keyField
      const fields = v.rowFields || v.requiredFields || []
      return (v.expectedRows || []).map((row) => {
        const out = {}
        for (const f of fields) {
          if (f === key) out[f] = row[key]
          else out[f] = row[f] !== undefined ? wrongLike(row[f]) : GARBAGE_STRING
        }
        return out
      })
    }
    case 'choiceCheck': {
      const out = {}
      for (const q of v.questions || []) {
        const wrong = (q.options || []).find((o) => o.id !== q.correctOptionId)
        if (wrong) out[q.id] = wrong.id
      }
      return out
    }
    case 'templateSlots': {
      const out = {}
      for (const s of v.slots || []) out[s.id] = s.numeric ? GARBAGE_NUMBER : GARBAGE_STRING
      return out
    }
    case 'tagSource': {
      const out = {}
      const segs = v.source?.segments || []
      for (const f of v.fields || []) {
        const wrong = segs.find((s) => s.id !== f.correctSegmentId)
        out[f.id] = wrong ? wrong.id : GARBAGE_STRING
      }
      return out
    }
    case 'handoffForm': {
      const out = {}
      for (const f of v.fields || []) {
        if (f.kind === 'select') {
          const ok = new Set([f.expected, ...(f.accepted || [])].filter(Boolean).map(String))
          const wrong = (f.options || []).find((o) => !ok.has(String(o)))
          out[f.id] = wrong !== undefined ? wrong : GARBAGE_STRING
        } else {
          out[f.id] = GARBAGE_STRING
        }
      }
      return out
    }
    case 'connectorConfig': {
      // Shape-valid: every field present, numbers are numbers, selects are real
      // options. Substance-wrong: the raw secret pasted, and the first non-answer
      // option chosen everywhere.
      const out = {}
      for (const g of v.groups || []) {
        for (const f of g.fields || []) {
          if (f.kind === 'number') {
            out[f.id] = f.range ? f.range.max + 1000 : GARBAGE_NUMBER
          } else if (f.kind === 'select') {
            const ok = new Set([f.expected, ...(f.accepted || [])].filter(Boolean).map(String))
            const bad = (f.options || []).find((o) => !ok.has(String(o)))
            out[f.id] = bad !== undefined ? bad : GARBAGE_STRING
          } else {
            out[f.id] = GARBAGE_STRING
          }
        }
      }
      return out
    }
    case 'runInspect': {
      // Shape-valid: a real step id and real options. Substance-wrong: blames a
      // step that was only skipped, and picks the wrong cause and remedy.
      const out = {}
      const steps = v.run?.steps || []
      for (const f of v.fields || []) {
        if (f.kind === 'step') {
          const wrong = steps.find((st) => st.id !== f.expected)
          out[f.id] = wrong ? wrong.id : GARBAGE_STRING
        } else {
          const ok = new Set([f.expected, ...(f.accepted || [])].filter(Boolean).map(String))
          const bad = (f.options || []).find((o) => !ok.has(String(o)))
          out[f.id] = bad !== undefined ? bad : GARBAGE_STRING
        }
      }
      return out
    }
    case 'artifactImport': {
      // Composes other validators: garbage each import with its own rule.
      const out = {}
      for (const imp of v.imports || []) {
        const g = garbageFor(imp.validation, lesson)
        if (g !== null) out[imp.key] = JSON.stringify(g)
      }
      return out
    }
    default:
      return null
  }
}

const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json')).sort()
const hollowByType = {}
const skipped = []
let checked = 0

for (const file of files) {
  const lesson = JSON.parse(readFileSync(path.join(lessonsDir, file), 'utf8'))
  const v = lesson.validation
  if (!v?.type) continue
  const garbage = garbageFor(v, lesson)
  if (garbage === null) {
    skipped.push(`${lesson.id} (${v.type}: no garbage form)`)
    continue
  }
  checked += 1
  let result
  try {
    result = validateAnswer(JSON.stringify(garbage), v)
  } catch (err) {
    console.log(`ERROR ${lesson.id}: validator threw on garbage - ${err.message}`)
    process.exitCode = 1
    continue
  }
  if (result.passed) {
    ;(hollowByType[v.type] || (hollowByType[v.type] = [])).push(lesson.id)
  }
  if (result.passed && result.artifact === null) {
    console.log(`ERROR ${lesson.id}: passed but minted no artifact (contract violation)`)
    process.exitCode = 1
  }
}

const hollowTypes = Object.keys(hollowByType).sort()
const undocumented = hollowTypes.filter((t) => !HOLLOW_ALLOWLIST[t])

console.log('')
console.log(`validator audit: ${checked} lessons probed with structurally-valid garbage`)
if (skipped.length) console.log(`  skipped: ${skipped.length}`)

for (const t of hollowTypes) {
  const ids = hollowByType[t]
  const tag = HOLLOW_ALLOWLIST[t] ? 'KNOWN-HOLLOW' : 'HOLLOW'
  console.log('')
  console.log(`  ${tag}: ${t} accepted garbage in ${ids.length} lesson(s)`)
  console.log(`    e.g. ${ids.slice(0, 4).join(', ')}${ids.length > 4 ? ', ...' : ''}`)
  if (HOLLOW_ALLOWLIST[t]) console.log(`    why: ${HOLLOW_ALLOWLIST[t]}`)
}

const solid = ['jsonFields', 'jsonRows', 'jsonDeltas', 'choiceCheck', 'templateSlots', 'tagSource', 'handoffForm', 'artifactImport', 'connectorConfig', 'runInspect']
  .filter((t) => !hollowTypes.includes(t))
console.log('')
console.log(`  rejects garbage (judges substance): ${solid.join(', ') || 'none'}`)

if (undocumented.length) {
  console.log('')
  console.log(`FAIL: ${undocumented.length} validator type(s) pass garbage and are NOT in HOLLOW_ALLOWLIST:`)
  undocumented.forEach((t) => console.log(`  ${t}`))
  console.log('Either fix the validator, or add it to the allow-list with a reason and a plan step.')
  process.exitCode = 1
} else if (hollowTypes.length) {
  console.log('')
  console.log(`OK (with ${hollowTypes.length} documented debt): every other validator rejects its garbage.`)
} else {
  console.log('')
  console.log('OK: every validator rejects structurally-valid garbage.')
}
