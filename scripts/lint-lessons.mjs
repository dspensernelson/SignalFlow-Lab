// Lesson lint. Run with: npm run lint:lessons
//
// Enforces the authoring contract (LESSON_AUTHORING_TEMPLATE.md) and the
// module canon (curriculum/module-01/canon.json) on every lesson JSON, so a
// builder cannot drift from the doctrine or the shared numbers without the
// check going red. Checks:
//
//  1. Identity: lesson id matches its filename; nodeId exists on the map;
//     tier suffix matches its BUILT_LESSON_IDS_BY_TIER registration; the
//     node's taskId names the easy lesson.
//  2. Structure: required fields, known interactionType and validator,
//     intro sections in range, instructions present, takeaway points >= 3.
//  3. Capability statement: the LAST takeaway point starts with
//     "The workflow can now".
//  4. Interaction shape: choiceCheck 3-5 questions x exactly 3 options with
//     a valid correctOptionId, explain text, and artifactOnPass; templateSlots
//     slots<->{{tokens}} match exactly, each slot has label/hint and an
//     expected or accepted, shelf entries are complete; tagSource 3-6 fields
//     with >= fields+1 segments and every correctSegmentId on the source;
//     handoffForm 2-5 fields, each select/text with expected-or-accepted and
//     select answers present in options; jsonEditor lessons have a fieldGuide
//     row for every validated field and a parseable starterAnswer.
//  5. Canon: every assertion in curriculum/module-01/canon.json holds.
//  6. choiceCheck cap: no more than ~1-in-4 lessons per module are choiceCheck
//     (module-02 grandfathered as a warning; all other modules are an error).
//
// Non-ASCII characters in lesson copy are reported as warnings (repo docs are
// ASCII-only by rule; lesson copy should stay close to it).

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lessonsDir = path.join(root, 'src', 'data', 'lessons')
const registry = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'projects.json'), 'utf8'))
const projectsSource = readFileSync(path.join(root, 'src', 'lib', 'projects.js'), 'utf8')
const taxonomy = JSON.parse(
  readFileSync(path.join(root, 'src', 'data', 'automationTaxonomy.json'), 'utf8')
)
const ACTION_KINDS = new Set(taxonomy.actionKinds.map((k) => k.id))
const ROSTER_TOOLS = new Set(taxonomy.tools.map((t) => t.id))
const ROTATION = taxonomy.rotation

const VALID_INTERACTIONS = ['jsonEditor', 'choiceCheck', 'templateSlots', 'artifactImport', 'tagSource', 'handoffForm', 'connectorConfig', 'runInspect']
const VALID_VALIDATORS = ['jsonFields', 'jsonPolicy', 'jsonRows', 'jsonDeltas', 'choiceCheck', 'templateSlots', 'artifactImport', 'tagSource', 'handoffForm', 'connectorConfig', 'runInspect']
const CONNECTOR_KINDS = ['select', 'text', 'number', 'secretRef']
const RUN_STATUSES = new Set(taxonomy.runVocabulary.stepStatuses)
const RUN_ENVIRONMENTS = new Set(taxonomy.runVocabulary.environments)
const RUN_CAUSES = new Set(taxonomy.runVocabulary.failureCauses)
const RUN_REMEDIATIONS = new Set(taxonomy.runVocabulary.remediations)
const OPS_TOPICS = new Set(taxonomy.opsTopics)
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Medium', 'Hard']

// Lessons are global (flat, unique ids); each is registered to exactly one
// project via BUILT_LESSONS in src/lib/projects.js. Nodes and canon are per
// project (src/data/projects/<id>/, curriculum/<id>/canon.json). projects.js
// imports app JSON, so it cannot be imported directly under plain node - we
// extract the per-project tier lists from its source instead.
function projectBlock(source, projectId) {
  const start = source.indexOf(`'${projectId}':`)
  if (start === -1) return ''
  const braceStart = source.indexOf('{', start)
  if (braceStart === -1) return ''
  let depth = 0
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(braceStart, i + 1)
    }
  }
  return ''
}
function extractTierIds(block, tier) {
  const m = block.match(new RegExp(`${tier}:\\s*\\[([^\\]]*)\\]`, 's'))
  if (!m) return []
  return Array.from(m[1].matchAll(/'([^']+)'/g)).map((x) => x[1])
}

// Projects that have a data directory on disk.
const builtStart = projectsSource.indexOf('BUILT_LESSONS = {')
const builtSource = builtStart === -1 ? projectsSource : projectsSource.slice(builtStart)
const PROJECTS = []
const lessonToProject = {}
for (const p of registry) {
  const nodesPath = path.join(root, 'src', 'data', 'projects', p.id, 'workflowNodes.json')
  if (!existsSync(nodesPath)) continue
  const nodes = JSON.parse(readFileSync(nodesPath, 'utf8'))
  const canonPath = path.join(root, 'curriculum', p.id, 'canon.json')
  const canon = existsSync(canonPath)
    ? JSON.parse(readFileSync(canonPath, 'utf8'))
    : { assertions: [], derivations: [] }
  const block = projectBlock(builtSource, p.id)
  const tierIds = {
    easy: extractTierIds(block, 'easy'),
    medium: extractTierIds(block, 'medium'),
    hard: extractTierIds(block, 'hard'),
  }
  PROJECTS.push({ id: p.id, nodes, canon, tierIds })
  for (const tier of ['easy', 'medium', 'hard']) {
    tierIds[tier].forEach((lid) => { lessonToProject[lid] = p.id })
  }
}
const projectById = Object.fromEntries(PROJECTS.map((p) => [p.id, p]))

// Path resolver: dot segments, [index], and [key=value] finders.
function resolvePath(obj, pathExpr) {
  const segments = pathExpr.split('.')
  let current = obj
  for (const seg of segments) {
    if (current === undefined || current === null) return undefined
    const match = seg.match(/^([\w]+)(?:\[([^\]]+)\])?$/)
    if (!match) return undefined
    current = current[match[1]]
    if (match[2] !== undefined) {
      if (!Array.isArray(current)) return undefined
      if (/^\d+$/.test(match[2])) {
        current = current[Number(match[2])]
      } else {
        const [key, value] = match[2].split('=')
        current = current.find((item) => String(item?.[key]) === value)
      }
    }
  }
  return current
}

const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json'))
let errors = 0
let warnings = 0

function err(id, msg) {
  errors++
  console.log(`ERROR ${id}: ${msg}`)
}
function warn(id, msg) {
  warnings++
  console.log(`warn  ${id}: ${msg}`)
}

const lessonsById = {}

for (const file of files.sort()) {
  const lesson = JSON.parse(readFileSync(path.join(lessonsDir, file), 'utf8'))
  const id = lesson.id || file
  lessonsById[id] = lesson

  // 1. Identity
  if (`${lesson.id}.json` !== file) err(id, `id does not match filename "${file}"`)
  const tier = id.endsWith('-medium') ? 'medium' : id.endsWith('-hard') ? 'hard' : 'easy'
  const projectId = lessonToProject[id]
  const proj = projectId ? projectById[projectId] : null
  const nodes = proj ? proj.nodes : []
  if (!proj) {
    err(id, `not registered in any project's BUILT_LESSONS (src/lib/projects.js)`)
  } else if (!proj.tierIds[tier].includes(id)) {
    err(id, `not registered in BUILT_LESSONS.${projectId}.${tier} (src/lib/projects.js)`)
  }
  const node = nodes.find((n) => n.id === lesson.nodeId)
  if (!node) err(id, `nodeId "${lesson.nodeId}" not found in ${projectId || 'any'} workflowNodes.json`)
  if (node && tier === 'easy' && node.taskId !== id) {
    err(id, `node taskId "${node.taskId}" should equal the easy lesson id`)
  }
  if (node && tier !== 'easy' && id !== `${node.taskId}-${tier}`) {
    err(id, `id should be "${node.taskId}-${tier}" per the tier naming convention`)
  }

  // 2. Structure
  for (const field of ['title', 'skill', 'scenario', 'input', 'successMessage']) {
    if (typeof lesson[field] !== 'string' || !lesson[field].trim()) err(id, `missing or empty "${field}"`)
  }
  if (!VALID_DIFFICULTIES.includes(lesson.difficulty)) err(id, `difficulty "${lesson.difficulty}" not in ${VALID_DIFFICULTIES.join('/')}`)
  if (!Array.isArray(lesson.instructions) || lesson.instructions.length === 0) err(id, 'instructions missing or empty')
  if (!VALID_INTERACTIONS.includes(lesson.interactionType)) err(id, `unknown interactionType "${lesson.interactionType}"`)
  if (!VALID_VALIDATORS.includes(lesson.validation?.type)) err(id, `unknown validation.type "${lesson.validation?.type}"`)
  if (!lesson.intro?.heading) err(id, 'intro.heading missing')
  const sections = lesson.intro?.sections
  if (!Array.isArray(sections) || sections.length < 2 || sections.length > 5) {
    err(id, `intro.sections should have 2-5 entries (has ${sections?.length ?? 0})`)
  } else if (sections.some((s) => !s.title || !s.body)) {
    err(id, 'every intro section needs a title and body')
  }
  const points = lesson.takeaway?.points
  if (!Array.isArray(points) || points.length < 3) {
    err(id, `takeaway.points should have >= 3 entries (has ${points?.length ?? 0})`)
  } else {
    // 3. Capability statement - either the rich dialect's takeaway.capability
    // or the last takeaway point must carry it.
    const capability = lesson.takeaway?.capability
    const hasCapability =
      (typeof capability === 'string' && /^The workflow can now /.test(capability)) ||
      /^The workflow can now /.test(points[points.length - 1])
    if (!hasCapability) {
      err(id, 'Capability Statement missing: takeaway.capability or the last takeaway point must start "The workflow can now ..."')
    }
  }
  if (!lesson.takeaway?.artifactName) err(id, 'takeaway.artifactName missing')

  // opsTopics belongs only to Operations lessons and must use taxonomy values.
  if (lesson.opsTopics !== undefined) {
    if (!Array.isArray(lesson.opsTopics) || lesson.opsTopics.length === 0) {
      err(id, 'opsTopics must be a non-empty array when present')
    } else {
      for (const t of lesson.opsTopics) {
        if (!OPS_TOPICS.has(t)) err(id, `opsTopics value "${t}" is not in automationTaxonomy.json`)
      }
    }
  }

  // 3b. Transfer beat v2 (realworld-shape): every takeaway names the KIND of
  // action this step is (from src/data/automationTaxonomy.json) plus 2-3
  // best-fit tools with a concrete how. The v1 fixed powerAutomate/zapier/
  // python triple is retired - see DECISION_LOG 2026-08-22.
  const rw = lesson.takeaway?.realWorld
  if (!rw || typeof rw !== 'object') {
    err(id, 'takeaway.realWorld missing (actionKind + soloRebuildPath + bestFit)')
  } else {
    if (rw.tools) {
      err(id, 'takeaway.realWorld.tools is the legacy v1 shape; run node scripts/migrate-realworld.mjs')
    }
    if (typeof rw.soloRebuildPath !== 'string' || !rw.soloRebuildPath.trim()) {
      err(id, 'takeaway.realWorld.soloRebuildPath missing or empty')
    }
    if (!rw.actionKind || !ACTION_KINDS.has(rw.actionKind)) {
      err(id, `takeaway.realWorld.actionKind "${rw.actionKind}" is not an id in automationTaxonomy.json`)
    }
    const bf = rw.bestFit
    if (!Array.isArray(bf)) {
      err(id, 'takeaway.realWorld.bestFit must be an array')
    } else {
      if (bf.length < ROTATION.bestFitMin || bf.length > ROTATION.bestFitMax) {
        err(id, `takeaway.realWorld.bestFit has ${bf.length} entries (need ${ROTATION.bestFitMin}-${ROTATION.bestFitMax})`)
      }
      const seen = new Set()
      for (const b of bf) {
        if (!b || !ROSTER_TOOLS.has(b.tool)) {
          err(id, `takeaway.realWorld.bestFit tool "${b?.tool}" is not in the roster`)
          continue
        }
        if (seen.has(b.tool)) err(id, `takeaway.realWorld.bestFit repeats tool "${b.tool}"`)
        seen.add(b.tool)
        if (typeof b.how !== 'string' || !b.how.trim()) {
          err(id, `takeaway.realWorld.bestFit["${b.tool}"].how missing or empty`)
        }
      }
    }
  }

  // 4. Interaction shape
  if (lesson.interactionType === 'choiceCheck') {
    const qs = lesson.validation?.questions
    if (!Array.isArray(qs) || qs.length < 3 || qs.length > 5) {
      err(id, `choiceCheck needs 3-5 questions (has ${qs?.length ?? 0})`)
    } else {
      qs.forEach((q, i) => {
        if (!Array.isArray(q.options) || q.options.length !== 3) err(id, `question ${i + 1} must have exactly 3 options`)
        else if (!q.options.some((o) => o.id === q.correctOptionId)) err(id, `question ${i + 1} correctOptionId "${q.correctOptionId}" matches no option`)
        if (!q.explain || !q.explain.trim()) err(id, `question ${i + 1} needs explain text`)
      })
    }
    if (!lesson.validation?.artifactOnPass || typeof lesson.validation.artifactOnPass !== 'object') {
      err(id, 'choiceCheck needs validation.artifactOnPass (the minted profile artifact)')
    }
  } else if (lesson.interactionType === 'templateSlots') {
    const template = lesson.validation?.template || ''
    const slots = lesson.validation?.slots || []
    const tokens = Array.from(template.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1])
    const slotIds = slots.map((s) => s.id)
    tokens.filter((t) => !slotIds.includes(t)).forEach((t) => err(id, `template token {{${t}}} has no slot definition`))
    slotIds.filter((s) => !tokens.includes(s)).forEach((s) => err(id, `slot "${s}" never appears in the template`))
    slots.forEach((s) => {
      if (!s.label || !s.hint) err(id, `slot "${s.id}" needs label and hint`)
      if (s.numeric && typeof s.expected !== 'number') err(id, `numeric slot "${s.id}" needs a numeric expected value`)
      if (!s.numeric && s.expected === undefined && !Array.isArray(s.accepted)) err(id, `slot "${s.id}" needs expected or accepted`)
    })
    const shelf = lesson.shelf
    if (!Array.isArray(shelf) || shelf.length === 0) err(id, 'templateSlots lessons need a shelf config')
    else shelf.forEach((item) => {
      if (!item.nodeId || !item.artifactName || !item.producedBy) err(id, 'each shelf entry needs nodeId, artifactName, producedBy')
      else if (!nodes.some((n) => n.id === item.nodeId)) err(id, `shelf nodeId "${item.nodeId}" not on the map`)
    })
  } else if (lesson.interactionType === 'artifactImport') {
    const imports = lesson.validation?.imports
    const jsonValidators = ['jsonFields', 'jsonPolicy', 'jsonRows', 'jsonDeltas']
    if (!Array.isArray(imports) || imports.length === 0) {
      err(id, 'artifactImport needs a nonempty validation.imports array')
    } else {
      imports.forEach((imp, i) => {
        if (!imp.key || !imp.label) err(id, `import ${i + 1} needs key and label`)
        if (!imp.validation || !jsonValidators.includes(imp.validation.type)) {
          err(id, `import "${imp.key ?? i + 1}" validation.type must be one of ${jsonValidators.join(', ')}`)
        }
      })
    }
    if (typeof lesson.starterAnswer !== 'string') err(id, 'artifactImport lessons need a starterAnswer string')
    else {
      try {
        JSON.parse(lesson.starterAnswer)
      } catch {
        err(id, 'starterAnswer is not valid JSON')
      }
    }
  } else if (lesson.interactionType === 'tagSource') {
    const segments = lesson.validation?.source?.segments
    const flds = lesson.validation?.fields
    if (!Array.isArray(flds) || flds.length < 3 || flds.length > 6) {
      err(id, `tagSource needs 3-6 fields (has ${flds?.length ?? 0})`)
    }
    if (!Array.isArray(segments) || segments.length === 0) {
      err(id, 'tagSource needs a nonempty validation.source.segments array')
    } else if (Array.isArray(flds) && segments.length < flds.length + 1) {
      err(id, `tagSource needs at least fields+1 segments (has ${segments.length} for ${flds.length} fields)`)
    }
    if (Array.isArray(flds) && Array.isArray(segments)) {
      const segIds = new Set(segments.map((s) => s.id))
      flds.forEach((f, i) => {
        if (!f.id || !f.label) err(id, `tagSource field ${i + 1} needs id and label`)
        if (!segIds.has(f.correctSegmentId)) err(id, `tagSource field "${f.id ?? i + 1}" correctSegmentId "${f.correctSegmentId}" matches no segment`)
        if (!f.explain || !f.explain.trim()) err(id, `tagSource field "${f.id ?? i + 1}" needs explain text`)
      })
      segments.forEach((s, i) => {
        if (!s.id || typeof s.text !== 'string' || !s.text.trim()) err(id, `tagSource segment ${i + 1} needs id and text`)
      })
    }
  } else if (lesson.interactionType === 'handoffForm') {
    const flds = lesson.validation?.fields
    if (!Array.isArray(flds) || flds.length < 2 || flds.length > 5) {
      err(id, `handoffForm needs 2-5 fields (has ${flds?.length ?? 0})`)
    } else {
      flds.forEach((f, i) => {
        if (!f.id || !f.label) err(id, `handoffForm field ${i + 1} needs id and label`)
        if (f.kind !== 'select' && f.kind !== 'text') err(id, `handoffForm field "${f.id ?? i + 1}" kind must be "select" or "text"`)
        const hasExpected = f.expected !== undefined
        const hasAccepted = Array.isArray(f.accepted) && f.accepted.length > 0
        if (!hasExpected && !hasAccepted) err(id, `handoffForm field "${f.id ?? i + 1}" needs expected or accepted`)
        if (!f.explain || !f.explain.trim()) err(id, `handoffForm field "${f.id ?? i + 1}" needs explain text`)
        if (f.kind === 'select') {
          const opts = Array.isArray(f.options) ? f.options : []
          if (opts.length === 0) err(id, `handoffForm select field "${f.id ?? i + 1}" needs options`)
          const answers = hasAccepted ? f.accepted : hasExpected ? [f.expected] : []
          answers.forEach((a) => {
            if (!opts.includes(a)) err(id, `handoffForm select field "${f.id ?? i + 1}" answer "${a}" is not in options`)
          })
        }
      })
    }
  } else if (lesson.interactionType === 'connectorConfig') {
    // 2-3 groups, 4-8 fields TOTAL (its own bound; handoffForm's 2-5 is
    // untouched), valid kinds, expected-or-accepted, numbers carrying exactly
    // one of expected or range.
    const groups = lesson.validation?.groups
    if (!Array.isArray(groups) || groups.length < 2 || groups.length > 3) {
      err(id, `connectorConfig needs 2-3 groups (has ${groups?.length ?? 0})`)
    } else {
      const seenGroup = new Set()
      const seenField = new Set()
      const flat = []
      for (const g of groups) {
        if (!g.id || !g.label) err(id, 'connectorConfig group needs id and label')
        if (seenGroup.has(g.id)) err(id, `connectorConfig duplicate group id "${g.id}"`)
        seenGroup.add(g.id)
        if (!Array.isArray(g.fields) || g.fields.length === 0) {
          err(id, `connectorConfig group "${g.id}" has no fields`)
          continue
        }
        flat.push(...g.fields)
      }
      if (flat.length < 4 || flat.length > 8) {
        err(id, `connectorConfig needs 4-8 fields total (has ${flat.length})`)
      }
      for (const f of flat) {
        if (!f.id || !f.label) { err(id, 'connectorConfig field needs id and label'); continue }
        if (seenField.has(f.id)) err(id, `connectorConfig duplicate field id "${f.id}"`)
        seenField.add(f.id)
        if (!CONNECTOR_KINDS.includes(f.kind)) {
          err(id, `connectorConfig field "${f.id}" kind must be one of ${CONNECTOR_KINDS.join('/')}`)
        }
        if (!f.explain || !f.explain.trim()) err(id, `connectorConfig field "${f.id}" needs explain text`)
        if (f.kind === 'number') {
          const hasExpected = typeof f.expected === 'number'
          const hasRange = Boolean(f.range && typeof f.range.min === 'number' && typeof f.range.max === 'number')
          if (hasExpected === hasRange) {
            err(id, `connectorConfig number field "${f.id}" needs exactly one of expected or range`)
          }
          if (hasRange && f.range.min > f.range.max) {
            err(id, `connectorConfig field "${f.id}" range min exceeds max`)
          }
        } else {
          const answers = Array.isArray(f.accepted) && f.accepted.length > 0
            ? f.accepted
            : f.expected !== undefined ? [f.expected] : []
          if (answers.length === 0) err(id, `connectorConfig field "${f.id}" needs expected or accepted`)
          if (f.kind === 'select') {
            const opts = Array.isArray(f.options) ? f.options : []
            if (opts.length < 2) err(id, `connectorConfig select "${f.id}" needs at least 2 options`)
            answers.forEach((a) => {
              if (!opts.includes(a)) err(id, `connectorConfig select "${f.id}" answer "${a}" is not in options`)
            })
          }
        }
      }
    }
  } else if (lesson.interactionType === 'runInspect') {
    // A real run with something to diagnose, fields bound to real step ids,
    // cause/action drawn from the taxonomy, and the giveaway rule: an error
    // message may not name its own cause.
    const run = lesson.validation?.run
    const flds = lesson.validation?.fields
    if (!run) {
      err(id, 'runInspect needs validation.run')
    } else {
      for (const k of ['id', 'environment', 'trigger', 'startedAt', 'status']) {
        if (!run[k]) err(id, `runInspect run missing "${k}"`)
      }
      if (run.environment && !RUN_ENVIRONMENTS.has(run.environment)) {
        err(id, `runInspect environment "${run.environment}" is not in the taxonomy`)
      }
      const steps = run.steps
      if (!Array.isArray(steps) || steps.length < 3 || steps.length > 8) {
        err(id, `runInspect needs 3-8 steps (has ${steps?.length ?? 0})`)
      } else {
        const seen = new Set()
        steps.forEach((st) => {
          if (!st.id || !st.name) err(id, 'runInspect step needs id and name')
          if (seen.has(st.id)) err(id, `runInspect duplicate step id "${st.id}"`)
          seen.add(st.id)
          if (!RUN_STATUSES.has(st.status)) {
            err(id, `runInspect step "${st.id}" status "${st.status}" is not in the taxonomy`)
          }
        })
        if (!steps.some((st) => st.status !== 'succeeded')) {
          err(id, 'runInspect run has no failed step - there is nothing to diagnose')
        }
      }
    }
    if (!Array.isArray(flds) || flds.length < 2 || flds.length > 5) {
      err(id, `runInspect needs 2-5 fields (has ${flds?.length ?? 0})`)
    } else {
      const stepIds = new Set((run?.steps || []).map((st) => st.id))
      flds.forEach((f) => {
        if (!f.id || !f.label) { err(id, 'runInspect field needs id and label'); return }
        if (f.kind !== 'step' && f.kind !== 'select') {
          err(id, `runInspect field "${f.id}" kind must be "step" or "select"`)
        }
        if (!f.explain || !f.explain.trim()) err(id, `runInspect field "${f.id}" needs explain text`)
        const answers = Array.isArray(f.accepted) && f.accepted.length > 0
          ? f.accepted
          : f.expected !== undefined ? [f.expected] : []
        if (answers.length === 0) err(id, `runInspect field "${f.id}" needs expected or accepted`)
        if (f.kind === 'step') {
          answers.forEach((a) => {
            if (!stepIds.has(a)) err(id, `runInspect field "${f.id}" answer "${a}" is not a step id`)
          })
        } else {
          const opts = Array.isArray(f.options) ? f.options : []
          if (opts.length < 2) err(id, `runInspect select "${f.id}" needs at least 2 options`)
          answers.forEach((a) => {
            if (!opts.includes(a)) err(id, `runInspect select "${f.id}" answer "${a}" is not in options`)
          })
          const vocab = f.id === 'cause' ? RUN_CAUSES : f.id === 'action' ? RUN_REMEDIATIONS : null
          if (vocab) {
            opts.forEach((o) => {
              if (!vocab.has(o)) err(id, `runInspect "${f.id}" option "${o}" is not in the taxonomy vocabulary`)
            })
          }
        }
      })
      const cause = flds.find((f) => f.id === 'cause')
      if (cause?.expected) {
        const needle = String(cause.expected).replace(/-/g, ' ').toLowerCase()
        ;(run?.steps || []).forEach((st) => {
          if (st.error && st.error.replace(/-/g, ' ').toLowerCase().includes(needle)) {
            err(id, `runInspect step "${st.id}" error names its own cause ("${cause.expected}") - the learner must infer it from the symptom`)
          }
        })
      }
    }
  } else {
    // jsonEditor
    const guide = lesson.fieldGuide
    if (!Array.isArray(guide) || guide.length === 0) err(id, 'jsonEditor lessons need a fieldGuide')
    else {
      guide.forEach((f) => {
        if (!f.field || !f.meaning || !f.type || !f.hint) err(id, `fieldGuide entry "${f.field}" needs field/meaning/type/hint`)
      })
      const guideFields = new Set(guide.map((f) => f.field))
      const validated =
        lesson.validation.requiredFields || lesson.validation.rowFields || []
      validated
        .filter((f) => !guideFields.has(f))
        .forEach((f) => err(id, `validated field "${f}" has no fieldGuide row`))
    }
    if (typeof lesson.starterAnswer !== 'string') err(id, 'jsonEditor lessons need a starterAnswer string')
    else {
      try {
        JSON.parse(lesson.starterAnswer)
      } catch {
        err(id, 'starterAnswer is not valid JSON')
      }
    }
  }

  // Non-ASCII warning (copy should stay ASCII-adjacent like the docs)
  const raw = JSON.stringify(lesson)
  const nonAscii = raw.match(/[^\x20-\x7E]/g)
  if (nonAscii) warn(id, `${nonAscii.length} non-ASCII character(s) in lesson copy (e.g. ${JSON.stringify(nonAscii[0])})`)
}

// Registration completeness: every registered id has a file.
for (const p of PROJECTS) {
  for (const [tier, ids] of Object.entries(p.tierIds)) {
    ids.filter((lid) => !lessonsById[lid]).forEach((lid) => {
      errors++
      console.log(`ERROR registration: BUILT_LESSONS.${p.id}.${tier} lists "${lid}" but no lesson file exists`)
    })
  }
}

// choiceCheck cap (anti-slop, work order 2026-07-04): no more than ~1-in-4
// lessons per module may be choiceCheck, so the quiz interaction cannot become
// the default. module-02 (47.5%) predates the rule and is grandfathered as a
// WARNING; every other module must hold the 25% cap (ERROR). module-01 left
// the grandfathered set on 2026-07-06 when the opening-arc re-storyboard
// converted analyst-notes and price-feed to tagSource (now 10/42 = 23.8%).
const CHOICECHECK_CAP = 0.25
const CHOICECHECK_GRANDFATHERED = new Set(['module-02'])
for (const p of PROJECTS) {
  const ids = [...p.tierIds.easy, ...p.tierIds.medium, ...p.tierIds.hard]
    .filter((lid) => lessonsById[lid])
  if (ids.length === 0) continue
  const choiceCount = ids.filter((lid) => lessonsById[lid].interactionType === 'choiceCheck').length
  const ratio = choiceCount / ids.length
  if (ratio > CHOICECHECK_CAP) {
    const pct = (ratio * 100).toFixed(1)
    const cap = `${choiceCount}/${ids.length} = ${pct}% (cap ${CHOICECHECK_CAP * 100}%)`
    if (CHOICECHECK_GRANDFATHERED.has(p.id)) {
      warn(`${p.id} choiceCheck`, `${cap} - grandfathered; do not add more choiceCheck lessons here`)
    } else {
      err(`${p.id} choiceCheck`, `${cap} - exceeds the per-module choiceCheck cap; use another interaction type`)
    }
  }
}

// 6b. realworld-tier-consistency: tier variants of one task teach the same
// KIND of action. If easy says this step is a lookup and hard says it is a
// condition, one of them is wrong about what the step IS.
for (const p of PROJECTS) {
  const byFamily = {}
  for (const lid of [...p.tierIds.easy, ...p.tierIds.medium, ...p.tierIds.hard]) {
    const lesson = lessonsById[lid]
    if (!lesson) continue
    const fam = lid.replace(/-(medium|hard)$/, '')
    const kind = lesson.takeaway?.realWorld?.actionKind
    if (!kind) continue
    ;(byFamily[fam] || (byFamily[fam] = [])).push({ lid, kind })
  }
  for (const [fam, rows] of Object.entries(byFamily)) {
    const kinds = [...new Set(rows.map((r) => r.kind))]
    if (kinds.length > 1) {
      err(`${p.id} ${fam}`, `tier variants disagree on actionKind: ${rows.map((r) => `${r.lid}=${r.kind}`).join(', ')}`)
    }
  }
}

// 6c. realworld-rotation: the tool roster must actually rotate by relevance.
// Without this the mapping silently collapses back to one house tool on every
// lesson, which is the v1 failure (120 identical powerAutomate/zapier/python
// rows). Requires breadth across the module and caps any single tool's share.
for (const p of PROJECTS) {
  const ids = [...p.tierIds.easy, ...p.tierIds.medium, ...p.tierIds.hard]
    .filter((lid) => lessonsById[lid])
  if (ids.length === 0) continue
  const counts = {}
  for (const lid of ids) {
    const bf = lessonsById[lid].takeaway?.realWorld?.bestFit
    if (!Array.isArray(bf)) continue
    for (const tool of new Set(bf.map((b) => b.tool))) {
      counts[tool] = (counts[tool] || 0) + 1
    }
  }
  const present = Object.keys(counts).length
  if (present < ROTATION.minToolsPerModule) {
    err(`${p.id} realworld-rotation`, `only ${present} of ${ROSTER_TOOLS.size} roster tools appear (need >= ${ROTATION.minToolsPerModule})`)
  }
  for (const [tool, n] of Object.entries(counts)) {
    const share = n / ids.length
    if (share > ROTATION.maxToolSharePerModule) {
      err(`${p.id} realworld-rotation`, `${tool} appears in ${n}/${ids.length} = ${(share * 100).toFixed(1)}% of lessons (cap ${ROTATION.maxToolSharePerModule * 100}%)`)
    }
  }
}

// 6d. ops-coverage: every module ships Operations lessons in ALL THREE tiers,
// spending connectorConfig and runInspect, and together covering the required
// operating topics. Scripted, not prose: the Step 7a capstone and the TOOL_MAP
// appendix were prose-only mandates and both lapsed after two modules.
const OPS_COVERAGE_EXEMPT = new Set()
for (const p of PROJECTS) {
  if (OPS_COVERAGE_EXEMPT.has(p.id)) continue
  const all = [...p.tierIds.easy, ...p.tierIds.medium, ...p.tierIds.hard].filter((lid) => lessonsById[lid])
  if (all.length === 0) continue
  const opsLessons = all.map((lid) => lessonsById[lid]).filter((l) => Array.isArray(l.opsTopics))
  if (opsLessons.length === 0) {
    err(`${p.id} ops-coverage`, 'no Operations lessons found (playbook Step 7c requires one per tier)')
    continue
  }
  for (const tier of ['easy', 'medium', 'hard']) {
    const inTier = p.tierIds[tier].filter((lid) => lessonsById[lid]?.opsTopics)
    if (inTier.length === 0) err(`${p.id} ops-coverage`, `no Operations lesson in the ${tier} tier`)
  }
  const types = new Set(opsLessons.map((l) => l.interactionType))
  for (const required of ['connectorConfig', 'runInspect']) {
    if (!types.has(required)) {
      err(`${p.id} ops-coverage`, `Operations lessons do not spend "${required}" (playbook Step 7c)`)
    }
  }
  const covered = new Set(opsLessons.flatMap((l) => l.opsTopics))
  for (const topic of taxonomy.opsTopicsRequired) {
    if (!covered.has(topic)) {
      err(`${p.id} ops-coverage`, `no Operations lesson covers the required topic "${topic}"`)
    }
  }
}

// 5a. Canon derivations: recompute derived numbers from their sources so an
// internally-consistent-but-wrong figure cannot ship.
let assertionCount = 0
let derivationCount = 0
for (const proj of PROJECTS) {
  const canon = proj.canon
  derivationCount += (canon.derivations || []).length
  assertionCount += (canon.assertions || []).length
  for (const d of canon.derivations || []) {
    const lesson = lessonsById[d.lesson]
    if (!lesson) {
      errors++
      console.log(`ERROR canon derivation targets missing lesson "${d.lesson}"`)
      continue
    }
    let expected
    if (d.op === 'delta') expected = d.a - d.b
    else if (d.op === 'pctMove') expected = ((d.a - d.b) / d.b) * 100
    else {
      errors++
      console.log(`ERROR canon derivation for ${d.lesson}: unknown op "${d.op}"`)
      continue
    }
    if (typeof d.round === 'number') {
      const f = Math.pow(10, d.round)
      expected = Math.round(expected * f) / f
    }
    const actual = resolvePath(lesson, d.path)
    if (actual !== expected) {
      errors++
      console.log(`ERROR canon derivation: ${d.lesson} ${d.path} should be ${expected} (${d.op} of ${d.a}, ${d.b}) - actual: ${JSON.stringify(actual)}`)
    }
  }

  // 5b. Canon assertions
  for (const a of canon.assertions || []) {
    const lesson = lessonsById[a.lesson]
    if (!lesson) {
      errors++
      console.log(`ERROR canon: assertion targets missing lesson "${a.lesson}"`)
      continue
    }
    const actual = resolvePath(lesson, a.path)
    let ok
    if (a.op === 'includes') ok = Array.isArray(actual) && actual.includes(a.value)
    else ok = typeof a.value === 'number' || typeof a.value === 'boolean' ? actual === a.value : String(actual) === String(a.value)
    if (!ok) {
      errors++
      console.log(`ERROR canon: ${a.lesson} ${a.path} ${a.op} ${JSON.stringify(a.value)} - actual: ${JSON.stringify(actual)}`)
    }
  }
}

console.log(`\n${files.length} lessons linted: ${errors} errors, ${warnings} warnings (${assertionCount} canon assertions, ${derivationCount} derivations recomputed)`)
process.exit(errors === 0 ? 0 : 1)
