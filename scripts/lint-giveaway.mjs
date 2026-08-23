// Giveaway lint. Run with: npm run lint:giveaway
//
// REMEDIATION_PLAN Phase 1.1. Measures how much of a lesson's answer the
// learner can obtain by copying rather than by deciding.
//
// WHY THIS EXISTS
//
// The owner has pushed against find-the-string-and-type-it since early in the
// project. That intent was never written into a check, and a 2026-08-22 audit
// measured the result: in 24 of 31 exact-match lessons, EVERY expected value
// appeared verbatim in the lesson input. Hard-tier lessons scored the same as
// Easy ones (lesson-escalation-path-hard: 5 of 5 verbatim). Meanwhile the rules
// that WERE scripted - no-scroll, ASCII-only, the choiceCheck cap - were
// honored with total fidelity across 120 lessons.
//
// The lesson of that asymmetry is the reason for this file: a principle that is
// not a lint is a wish.
//
// WHAT IT MEASURES
//
// For every validator that compares against authored expected values, the share
// of those values that appear verbatim in what the learner can read (the input
// and the scenario). A high share means the task is transcription. It does not
// mean the lesson is bad - at Easy tier, copying a value into a named field is
// a legitimate first rung that teaches JSON shape, field names, and types. The
// defect the audit found is that the share NEVER FADES: difficulty should mean
// less help, not just messier prose.
//
// Hence a per-tier budget that ratchets to zero.
//
// THE RATCHET
//
// Tiers listed in ENFORCED_TIERS are hard errors. The rest report as warnings
// so the baseline is visible without turning `npm run check` red on day one.
// REMEDIATION_PLAN Phase 3 retrofits content worst-first and moves tiers into
// ENFORCED_TIERS as it clears them: hard, then medium. Easy keeps a generous
// budget permanently and is enforced last, if at all.
//
// Never widen a budget to make a lesson pass. Rewrite the lesson so the answer
// is a FUNCTION of the input rather than a SUBSTRING of it: give a price series
// instead of "settled near $142", an approval chain instead of "approved by the
// Controller". That is what the framework already calls designing backwards.

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lessonsDir = path.join(root, 'src', 'data', 'lessons')
const projectsSource = readFileSync(path.join(root, 'src', 'lib', 'projects.js'), 'utf8')

// Share of expected values that may appear verbatim in what the learner reads.
const GIVEAWAY_BUDGET = { easy: 0.6, medium: 0.3, hard: 0.0 }

// Tiers where the budget is a HARD ERROR. Phase 3 adds 'hard', then 'medium'.
// Adding a tier here is the definition of done for that tier's retrofit.
const ENFORCED_TIERS = new Set()

// Values shorter than this are too common to be evidence of a giveaway
// ("0", "no", "1"). Counting them would produce false positives.
const MIN_VALUE_LEN = 3

let errors = 0
let warnings = 0
const err = (id, msg) => {
  console.log(`ERROR ${id}: ${msg}`)
  errors += 1
}
const warn = (id, msg) => {
  console.log(`warn  ${id}: ${msg}`)
  warnings += 1
}

// Tier registration comes from BUILT_LESSONS in src/lib/projects.js, the same
// source lint-lessons.mjs reads.
function tierOf(lessonId) {
  if (/-hard$/.test(lessonId)) return 'hard'
  if (/-medium$/.test(lessonId)) return 'medium'
  return 'easy'
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

// Every value the learner is graded against, per validator type. Booleans are
// excluded (true/false are trivially present in any text). Row keys are
// excluded: they identify which row to work on, they are not the answer.
function expectedValues(v) {
  const out = []
  const push = (x) => {
    if (x === null || x === undefined) return
    if (typeof x === 'boolean') return
    const s = String(x)
    if (s.length < MIN_VALUE_LEN) return
    out.push(s)
  }
  switch (v.type) {
    case 'jsonFields':
      for (const val of Object.values(v.expected || {})) push(val)
      for (const list of Object.values(v.acceptedValues || {})) {
        // A field with alternatives is given away if ANY alternative is present.
        if (Array.isArray(list) && list.length) out.push(list.map(String))
      }
      break
    case 'jsonRows':
    case 'jsonDeltas':
      for (const row of v.expectedRows || []) {
        for (const [k, val] of Object.entries(row)) {
          if (k === v.keyField) continue
          push(val)
        }
      }
      break
    case 'templateSlots':
      for (const s of v.slots || []) {
        if (Array.isArray(s.accepted) && s.accepted.length) out.push(s.accepted.map(String))
        else push(s.expected)
      }
      break
    case 'handoffForm':
    case 'connectorConfig': {
      const fields =
        v.type === 'connectorConfig'
          ? (v.groups || []).flatMap((g) => g.fields || [])
          : v.fields || []
      for (const f of fields) {
        // Select answers are visible in the options by design; only free text
        // and numeric thresholds can be given away by the source material.
        if (f.kind === 'select') continue
        if (Array.isArray(f.accepted) && f.accepted.length) out.push(f.accepted.map(String))
        else push(f.expected)
      }
      break
    }
    case 'runInspect':
      // Step ids are structural; the cause/remediation are selects. The
      // giveaway rule for runInspect is enforced in lint-lessons (the error
      // text may not contain the expected cause verbatim).
      break
    default:
      break
  }
  return out
}

// What the learner can read on the exercise screen.
function haystackOf(lesson) {
  const parts = [lesson.input, lesson.scenario]
  if (lesson.validation?.source?.segments) {
    parts.push(lesson.validation.source.segments.map((s) => s.text).join(' '))
  }
  return norm(parts.filter(Boolean).join(' \n '))
}

const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json')).sort()
const rows = []

for (const file of files) {
  const lesson = JSON.parse(readFileSync(path.join(lessonsDir, file), 'utf8'))
  const v = lesson.validation
  if (!v?.type) continue
  const values = expectedValues(v)
  if (values.length === 0) continue

  const hay = haystackOf(lesson)
  if (!hay) continue

  let given = 0
  const givenValues = []
  for (const val of values) {
    const alternatives = Array.isArray(val) ? val : [val]
    const hit = alternatives.find((a) => a.length >= MIN_VALUE_LEN && hay.includes(norm(a)))
    if (hit) {
      given += 1
      givenValues.push(hit)
    }
  }
  const share = given / values.length
  rows.push({
    id: lesson.id,
    tier: tierOf(lesson.id),
    type: v.type,
    given,
    total: values.length,
    share,
    sample: givenValues.slice(0, 3),
  })
}

// Report worst-first within each tier.
const byTier = { easy: [], medium: [], hard: [] }
for (const r of rows) byTier[r.tier].push(r)

console.log('giveaway lint: share of graded values that appear verbatim in what the learner reads')
console.log('')

for (const tier of ['easy', 'medium', 'hard']) {
  const list = byTier[tier].sort((a, b) => b.share - a.share)
  if (!list.length) continue
  const budget = GIVEAWAY_BUDGET[tier]
  const enforced = ENFORCED_TIERS.has(tier)
  const over = list.filter((r) => r.share > budget)
  const avg = list.reduce((s, r) => s + r.share, 0) / list.length
  const full = list.filter((r) => r.share === 1).length
  console.log(
    `  ${tier.toUpperCase()}: ${list.length} lessons, avg ${(avg * 100).toFixed(0)}%, ` +
      `${full} fully given away, budget ${(budget * 100).toFixed(0)}% ` +
      `(${enforced ? 'ENFORCED' : 'baseline only'}) - ${over.length} over budget`
  )
  for (const r of over.slice(0, enforced ? over.length : 5)) {
    const msg =
      `${r.given}/${r.total} graded values (${(r.share * 100).toFixed(0)}%) are verbatim in the ` +
      `input at ${r.tier} tier (budget ${(budget * 100).toFixed(0)}%) [${r.type}]` +
      (r.sample.length ? ` e.g. "${r.sample[0]}"` : '')
    if (enforced) err(r.id, msg)
    else warn(r.id, msg)
  }
  if (!enforced && over.length > 5) {
    console.log(`        ... and ${over.length - 5} more (baseline; see REMEDIATION_PLAN Phase 3)`)
  }
  console.log('')
}

console.log(
  `giveaway lint: ${rows.length} lessons measured, ${errors} errors, ${warnings} warnings` +
    ` (enforced tiers: ${ENFORCED_TIERS.size ? [...ENFORCED_TIERS].join(', ') : 'none yet - ratchet in Phase 3'})`
)
if (errors > 0) process.exitCode = 1
