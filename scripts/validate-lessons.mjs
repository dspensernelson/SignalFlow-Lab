// Lesson regression harness. Run with: npm run test:lessons
//
// For every lesson in src/data/lessons/, validates a known-correct answer
// (must pass and produce an artifact) and a known-wrong answer (must fail and
// produce no artifact). choiceCheck lessons derive both answers from their
// question definitions; every other lesson requires an entry in
// scripts/lesson-fixtures.json. A lesson with no fixture is a FAILURE - new
// lessons must ship with fixtures.
//
// templateSlots lessons additionally assert the rendered artifact contains no
// leftover {{tokens}}.

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lessonsDir = path.join(root, 'src', 'data', 'lessons')

const { validateAnswer } = await import(
  'file://' + path.join(root, 'src', 'lib', 'validators.js').replace(/\\/g, '/')
)

const fixtures = JSON.parse(
  readFileSync(path.join(root, 'scripts', 'lesson-fixtures.json'), 'utf8')
)

function choiceCheckAnswers(lesson) {
  const correct = {}
  const wrong = {}
  lesson.validation.questions.forEach((q, i) => {
    correct[q.id] = q.correctOptionId
    wrong[q.id] =
      i === 0
        ? q.options.find((o) => o.id !== q.correctOptionId).id
        : q.correctOptionId
  })
  return { correct, wrong }
}

const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json'))
let failures = 0
let passed = 0

for (const file of files.sort()) {
  const lesson = JSON.parse(readFileSync(path.join(lessonsDir, file), 'utf8'))
  const id = lesson.id
  const problems = []

  let answers
  if (lesson.validation?.type === 'choiceCheck') {
    answers = choiceCheckAnswers(lesson)
  } else if (fixtures[id]) {
    answers = fixtures[id]
  } else {
    problems.push('no fixture in scripts/lesson-fixtures.json (required for non-choiceCheck lessons)')
  }

  if (answers) {
    const pass = validateAnswer(JSON.stringify(answers.correct), lesson.validation)
    const fail = validateAnswer(JSON.stringify(answers.wrong), lesson.validation)

    if (pass.passed !== true) {
      problems.push('correct answer did NOT pass:')
      pass.results.filter((r) => !r.passed).forEach((r) => problems.push(`    ${r.id}: ${r.message}`))
    }
    if (pass.passed === true && (pass.artifact === null || pass.artifact === undefined)) {
      problems.push('correct answer passed but produced no artifact')
    }
    if (fail.passed !== false) {
      problems.push('wrong answer PASSED (fixture too weak or validation too loose)')
    }
    if (fail.passed === false && fail.artifact !== null) {
      problems.push('wrong answer failed but still produced an artifact')
    }
    if (lesson.validation?.type === 'templateSlots' && pass.passed === true) {
      if (typeof pass.artifact !== 'string') {
        problems.push('templateSlots artifact is not a rendered string')
      } else if (pass.artifact.includes('{{')) {
        problems.push('rendered template still contains {{tokens}}')
      }
    }
  }

  if (problems.length > 0) {
    failures++
    console.log(`FAIL ${id}`)
    problems.forEach((p) => console.log(`  - ${p}`))
  } else {
    passed++
    console.log(`ok   ${id}`)
  }
}

// Fixtures pointing at lessons that no longer exist are stale.
const lessonIds = new Set(
  files.map((f) => JSON.parse(readFileSync(path.join(lessonsDir, f), 'utf8')).id)
)
for (const key of Object.keys(fixtures)) {
  if (key.startsWith('_')) continue
  if (!lessonIds.has(key)) {
    failures++
    console.log(`FAIL fixtures: "${key}" has no matching lesson file (stale fixture)`)
  }
}

console.log(`\n${passed} lessons ok, ${failures} failures (${files.length} lesson files)`)
process.exit(failures === 0 ? 0 : 1)
