// One-off migration: takeaway.realWorld v1 -> v2.
//
// v1: { soloRebuildPath, tools: { powerAutomate, zapier, python } }
// v2: { actionKind, soloRebuildPath, bestFit: [ { tool, how } ] }
//
// Source of truth is curriculum/<module>/realworld-map.json, keyed by taskId.
// Tier variants (-medium, -hard) inherit their family's entry, so a module
// authors ~17 families instead of ~40 lessons and tier consistency is free.
//
// SURGICAL BY DESIGN: this rewrites only the "realWorld": {...} span in the raw
// text. A JSON.parse + JSON.stringify round trip is NOT byte-identical for this
// repo (short arrays are kept on one line by hand), and would produce a ~240
// line diff per lesson that buries the actual change.
//
// Run once, verify `npm run check`, then DELETE this file (G2.1 precedent: the
// transfer-beat backfill script was removed after its commit).
//
// Usage: node scripts/migrate-realworld.mjs [--dry]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lessonsDir = path.join(root, 'src/data/lessons')
const dry = process.argv.includes('--dry')

const taxonomy = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/automationTaxonomy.json'), 'utf8')
)
const validKinds = new Set(taxonomy.actionKinds.map((k) => k.id))
const validTools = new Set(taxonomy.tools.map((t) => t.id))

const families = new Map()
for (const dir of fs.readdirSync(path.join(root, 'curriculum'))) {
  const file = path.join(root, 'curriculum', dir, 'realworld-map.json')
  if (!fs.existsSync(file)) continue
  const map = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const [taskId, entry] of Object.entries(map.tasks || {})) {
    if (families.has(taskId)) {
      console.error(`duplicate task family across modules: ${taskId}`)
      process.exit(1)
    }
    families.set(taskId, entry)
  }
}

const familyOf = (id) => id.replace(/-(medium|hard)$/, '')

// Find the span of the object value that starts at the '{' at or after `from`.
// Respects string literals and escapes so braces inside copy do not confuse it.
function objectSpan(text, from) {
  const start = text.indexOf('{', from)
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i += 1) {
    const c = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === '{') depth += 1
    else if (c === '}') {
      depth -= 1
      if (depth === 0) return { start, end: i + 1 }
    }
  }
  return null
}

// JSON string literal, matching the repo's escaping.
const q = (s) => JSON.stringify(s)

function renderRealWorld(entry, soloRebuildPath, indent) {
  const i0 = ' '.repeat(indent)
  const i1 = ' '.repeat(indent + 2)
  const i2 = ' '.repeat(indent + 4)
  const i3 = ' '.repeat(indent + 6)
  const lines = []
  lines.push('{')
  lines.push(`${i1}${q('actionKind')}: ${q(entry.actionKind)},`)
  lines.push(`${i1}${q('soloRebuildPath')}: ${q(soloRebuildPath)},`)
  lines.push(`${i1}${q('bestFit')}: [`)
  entry.bestFit.forEach((b, idx) => {
    const comma = idx === entry.bestFit.length - 1 ? '' : ','
    lines.push(`${i2}{`)
    lines.push(`${i3}${q('tool')}: ${q(b.tool)},`)
    lines.push(`${i3}${q('how')}: ${q(b.how)}`)
    lines.push(`${i2}}${comma}`)
  })
  lines.push(`${i1}]`)
  lines.push(`${i0}}`)
  return lines.join('\n')
}

let migrated = 0
let already = 0
const problems = []

for (const file of fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json')).sort()) {
  const full = path.join(lessonsDir, file)
  const raw = fs.readFileSync(full, 'utf8')
  const lesson = JSON.parse(raw)
  const rw = lesson.takeaway && lesson.takeaway.realWorld
  if (!rw) {
    problems.push(`${file}: no takeaway.realWorld`)
    continue
  }
  if (rw.actionKind && Array.isArray(rw.bestFit)) {
    already += 1
    continue
  }

  const fam = familyOf(lesson.id)
  const entry = families.get(fam)
  if (!entry) {
    problems.push(`${file}: no realworld-map entry for family "${fam}"`)
    continue
  }
  if (!validKinds.has(entry.actionKind)) {
    problems.push(`${file}: unknown actionKind "${entry.actionKind}"`)
    continue
  }
  const badTool = entry.bestFit.find((b) => !validTools.has(b.tool))
  if (badTool) {
    problems.push(`${file}: unknown tool "${badTool.tool}"`)
    continue
  }

  const key = raw.indexOf('"realWorld"')
  if (key === -1) {
    problems.push(`${file}: could not locate the "realWorld" key in the raw text`)
    continue
  }
  const span = objectSpan(raw, key)
  if (!span) {
    problems.push(`${file}: could not find the realWorld object span`)
    continue
  }

  // Indentation of the line the key sits on, so the closing brace lines up.
  const lineStart = raw.lastIndexOf('\n', key) + 1
  const indent = key - lineStart

  const next = raw.slice(0, span.start) +
    renderRealWorld(entry, rw.soloRebuildPath, indent) +
    raw.slice(span.end)

  // Safety: the rewrite must parse, and must change ONLY realWorld.
  let reparsed
  try {
    reparsed = JSON.parse(next)
  } catch (err) {
    problems.push(`${file}: rewrite did not parse (${err.message})`)
    continue
  }
  const before = JSON.parse(raw)
  delete before.takeaway.realWorld
  const after = JSON.parse(JSON.stringify(reparsed))
  delete after.takeaway.realWorld
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    problems.push(`${file}: rewrite altered something outside realWorld - refusing`)
    continue
  }
  const nrw = reparsed.takeaway.realWorld
  if (
    nrw.actionKind !== entry.actionKind ||
    nrw.soloRebuildPath !== rw.soloRebuildPath ||
    nrw.bestFit.length !== entry.bestFit.length
  ) {
    problems.push(`${file}: rewritten realWorld does not match the source entry`)
    continue
  }

  if (!dry) fs.writeFileSync(full, next, 'utf8')
  migrated += 1
}

console.log(`${dry ? '[dry run] ' : ''}migrated ${migrated}, already v2 ${already}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  problems.forEach((p) => console.log(`  ${p}`))
  process.exit(1)
}
