// Reusable validation engine. Each validator returns the shared result shape:
// { passed: boolean, results: [{ id, label, passed, message }], artifact: object|string|null }
//
// For this build pass only `jsonFields` is implemented. The others are stubs to
// keep the engine extensible (csvColumns, ruleBuilder, markdownChecklist).

function normalize(value) {
  return String(value).trim().toLowerCase()
}

const TRUE_STRINGS = ['true', 'yes', 'y', '1']
const FALSE_STRINGS = ['false', 'no', 'n', '0']

// Coerces a user value to a boolean, or null if it cannot be interpreted.
function coerceBoolean(value) {
  if (typeof value === 'boolean') return value
  const normalized = normalize(value)
  if (TRUE_STRINGS.includes(normalized)) return true
  if (FALSE_STRINGS.includes(normalized)) return false
  return null
}

function jsonFields(answer, validation) {
  // 1. Parse the user answer as JSON.
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }

  const { requiredFields = [], expected = {}, acceptedValues = {} } = validation
  const results = []

  // 3. Presence checks for all required fields run first.
  const presence = {}
  requiredFields.forEach((field) => {
    const present = Object.prototype.hasOwnProperty.call(parsed, field)
    presence[field] = present
    results.push({
      id: `present-${field}`,
      label: `Field present: ${field}`,
      passed: present,
      message: present ? `"${field}" is present.` : `Missing field: "${field}".`,
    })
  })

  // 4 & 5. Value checks — only for fields that are present.
  requiredFields.forEach((field) => {
    if (!presence[field]) return

    const userValue = parsed[field]

    // Boolean-coerced expected value (e.g. approvalRequired).
    if (field === 'approvalRequired') {
      const coerced = coerceBoolean(userValue)
      const target = expected[field]
      if (coerced === null) {
        results.push({
          id: `value-${field}`,
          label: `Value correct: ${field}`,
          passed: false,
          message: `"${field}" must be true or false.`,
        })
      } else {
        const passed = coerced === target
        results.push({
          id: `value-${field}`,
          label: `Value correct: ${field}`,
          passed,
          message: passed
            ? `"${field}" is correct.`
            : `"${field}" should be ${target}.`,
        })
      }
      return
    }

    // Exact expected value (normalized): e.g. hub.
    if (Object.prototype.hasOwnProperty.call(expected, field)) {
      const passed = normalize(userValue) === normalize(expected[field])
      results.push({
        id: `value-${field}`,
        label: `Value correct: ${field}`,
        passed,
        message: passed
          ? `"${field}" is correct.`
          : `"${field}" should be "${expected[field]}".`,
      })
      return
    }

    // Accepted alternative values (normalized): e.g. peakPrice.
    if (Object.prototype.hasOwnProperty.call(acceptedValues, field)) {
      const accepted = acceptedValues[field].map(normalize)
      const passed = accepted.includes(normalize(userValue))
      results.push({
        id: `value-${field}`,
        label: `Value correct: ${field}`,
        passed,
        message: passed
          ? `"${field}" is correct.`
          : `"${field}" does not match an accepted value.`,
      })
    }
  })

  const passed = results.every((r) => r.passed)

  return {
    passed,
    results,
    // 7. Artifact comes from the user's submitted answer, only when everything passes.
    artifact: passed ? parsed : null,
  }
}

// Governance / config-as-rules validator. Config-driven and additive: it does
// NOT touch jsonFields. Checks valid JSON, required fields present, configured
// numeric fields are real numbers, configured text fields are non-empty, and an
// optional ordering rule (one threshold must exceed another).
function jsonPolicy(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }

  const {
    requiredFields = [],
    numericFields = [],
    nonEmptyFields = [],
    ordering = null,
  } = validation
  const results = []

  // 1. Presence checks for all required fields.
  const presence = {}
  requiredFields.forEach((field) => {
    const present = Object.prototype.hasOwnProperty.call(parsed, field)
    presence[field] = present
    results.push({
      id: `present-${field}`,
      label: `Field present: ${field}`,
      passed: present,
      message: present ? `"${field}" is present.` : `Missing field: "${field}".`,
    })
  })

  // 2. Numeric checks: threshold values must be real numbers, not strings.
  numericFields.forEach((field) => {
    if (!presence[field]) return
    const value = parsed[field]
    const isNumber = typeof value === 'number' && Number.isFinite(value)
    results.push({
      id: `value-${field}`,
      label: `Numeric value: ${field}`,
      passed: isNumber,
      message: isNumber
        ? `"${field}" is a number.`
        : `"${field}" must be a number (no quotes, no % sign).`,
    })
  })

  // 3. Non-empty checks: governance text fields must be filled in.
  nonEmptyFields.forEach((field) => {
    if (!presence[field]) return
    const value = parsed[field]
    const filled = typeof value === 'string' && value.trim().length > 0
    results.push({
      id: `value-${field}`,
      label: `Value set: ${field}`,
      passed: filled,
      message: filled ? `"${field}" is set.` : `"${field}" must not be empty.`,
    })
  })

  // 4. Ordering rule: e.g. escalationThreshold must exceed routineThreshold.
  if (ordering && ordering.greater && ordering.than) {
    const high = parsed[ordering.greater]
    const low = parsed[ordering.than]
    const bothNumbers =
      typeof high === 'number' &&
      Number.isFinite(high) &&
      typeof low === 'number' &&
      Number.isFinite(low)
    const passedOrder = bothNumbers && high > low
    results.push({
      id: `rule-ordering`,
      label: 'Threshold ordering',
      passed: passedOrder,
      message: passedOrder
        ? `"${ordering.greater}" is greater than "${ordering.than}".`
        : `"${ordering.greater}" must be greater than "${ordering.than}".`,
    })
  }

  const passed = results.every((r) => r.passed)

  return {
    passed,
    results,
    artifact: passed ? parsed : null,
  }
}

// Normalization / transformation validator. Config-driven and additive: it does
// NOT touch jsonFields or jsonPolicy. Checks valid JSON, a top-level array, that
// each expected row (matched by keyField) is present, that configured numeric
// fields are real numbers (not strings like "$187/MWh"), and that values match
// the expected normalized result.
function jsonRows(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }

  const {
    rowFields = [],
    numericFields = [],
    keyField = 'id',
    expectedRows = [],
  } = validation
  const results = []

  // 1. Top-level must be an array of rows.
  const isArray = Array.isArray(parsed)
  results.push({
    id: 'top-level-array',
    label: 'Top-level array',
    passed: isArray,
    message: isArray
      ? 'The answer is a JSON array of rows.'
      : 'The answer must be a JSON array of price rows.',
  })
  if (!isArray) {
    return { passed: false, results, artifact: null }
  }

  // Index the user's rows by their normalized key field.
  const byKey = {}
  parsed.forEach((row) => {
    if (
      row &&
      typeof row === 'object' &&
      !Array.isArray(row) &&
      Object.prototype.hasOwnProperty.call(row, keyField)
    ) {
      byKey[normalize(row[keyField])] = row
    }
  })

  // 2. Each expected row must be present, complete, numeric, and correct.
  expectedRows.forEach((expected) => {
    const keyVal = expected[keyField]
    const row = byKey[normalize(keyVal)]
    const present = Boolean(row)
    results.push({
      id: `present-${keyVal}`,
      label: `Row present: ${keyVal}`,
      passed: present,
      message: present ? `Row for "${keyVal}" is present.` : `Missing row for "${keyVal}".`,
    })
    if (!present) return

    rowFields.forEach((field) => {
      if (field === keyField) return
      const hasField = Object.prototype.hasOwnProperty.call(row, field)
      const value = row[field]
      const expectedVal = expected[field]
      const isNumericField = numericFields.includes(field)

      let passed
      let message
      if (!hasField) {
        passed = false
        message = `"${keyVal}" is missing "${field}".`
      } else if (isNumericField && !(typeof value === 'number' && Number.isFinite(value))) {
        passed = false
        message = `"${keyVal}" ${field} must be a number, not a string with $ or /MWh.`
      } else if (isNumericField && value !== expectedVal) {
        passed = false
        message = `"${keyVal}" ${field} should be ${expectedVal}.`
      } else if (!isNumericField && normalize(value) !== normalize(expectedVal)) {
        passed = false
        message = `"${keyVal}" ${field} should be "${expectedVal}".`
      } else {
        passed = true
        message = `"${keyVal}" ${field} is correct.`
      }

      results.push({
        id: `value-${keyVal}-${field}`,
        label: `${keyVal} ${field}`,
        passed,
        message,
      })
    })
  })

  const passed = results.every((r) => r.passed)

  return {
    passed,
    results,
    artifact: passed ? parsed : null,
  }
}

// Derived-values / variance validator. Config-driven and additive: it does NOT
// touch jsonFields, jsonPolicy, or jsonRows. Checks valid JSON, a top-level
// array, that each expected row (matched by keyField) is present, that required
// fields are present, that configured numeric delta fields are real numbers
// (not strings), that delta values match the expected derived value, and that an
// optional boolean flag (e.g. material variance) is correct ONLY when included.
function jsonDeltas(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }

  const {
    keyField = 'id',
    requiredFields = [],
    numericFields = [],
    optionalBooleanFields = [],
    expectedRows = [],
  } = validation
  const results = []

  // 1. Top-level must be an array of rows.
  const isArray = Array.isArray(parsed)
  results.push({
    id: 'top-level-array',
    label: 'Top-level array',
    passed: isArray,
    message: isArray
      ? 'The answer is a JSON array of variance rows.'
      : 'The answer must be a JSON array of variance rows.',
  })
  if (!isArray) {
    return { passed: false, results, artifact: null }
  }

  // Index the user's rows by their normalized key field.
  const byKey = {}
  parsed.forEach((row) => {
    if (
      row &&
      typeof row === 'object' &&
      !Array.isArray(row) &&
      Object.prototype.hasOwnProperty.call(row, keyField)
    ) {
      byKey[normalize(row[keyField])] = row
    }
  })

  // 2. Each expected row must be present, complete, numeric, and correct.
  expectedRows.forEach((expected) => {
    const keyVal = expected[keyField]
    const row = byKey[normalize(keyVal)]
    const present = Boolean(row)
    results.push({
      id: `present-${keyVal}`,
      label: `Row present: ${keyVal}`,
      passed: present,
      message: present ? `Row for "${keyVal}" is present.` : `Missing row for "${keyVal}".`,
    })
    if (!present) return

    // Required fields present (key field is implicitly present via the match).
    requiredFields.forEach((field) => {
      if (field === keyField) return
      const hasField = Object.prototype.hasOwnProperty.call(row, field)
      const value = row[field]
      const expectedVal = expected[field]
      const isNumericField = numericFields.includes(field)

      let passed
      let message
      if (!hasField) {
        passed = false
        message = `"${keyVal}" is missing "${field}".`
      } else if (isNumericField && !(typeof value === 'number' && Number.isFinite(value))) {
        passed = false
        message = `"${keyVal}" ${field} must be a number, not a string.`
      } else if (isNumericField && value !== expectedVal) {
        passed = false
        message = `"${keyVal}" ${field} should be ${expectedVal}.`
      } else if (!isNumericField && normalize(value) !== normalize(expectedVal)) {
        passed = false
        message = `"${keyVal}" ${field} should be "${expectedVal}".`
      } else {
        passed = true
        message = `"${keyVal}" ${field} is correct.`
      }

      results.push({
        id: `value-${keyVal}-${field}`,
        label: `${keyVal} ${field}`,
        passed,
        message,
      })
    })

    // Optional boolean flags: validated ONLY when the learner includes them.
    optionalBooleanFields.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(row, field)) return
      const value = row[field]
      const expectedVal = expected[field]
      const isBool = typeof value === 'boolean'
      const passed = isBool && value === expectedVal
      results.push({
        id: `value-${keyVal}-${field}`,
        label: `${keyVal} ${field}`,
        passed,
        message: !isBool
          ? `"${keyVal}" ${field} must be true or false (a real boolean).`
          : passed
            ? `"${keyVal}" ${field} is correct.`
            : `"${keyVal}" ${field} should be ${expectedVal}.`,
      })
    })
  })

  const passed = results.every((r) => r.passed)

  return {
    passed,
    results,
    artifact: passed ? parsed : null,
  }
}

// Inspection/interpretation quiz validator. Config-driven and additive: it does
// NOT touch the JSON validators. The answer is a JSON string of
// { questionId: optionId }. Each question yields one result row; wrong answers
// show the question's explain text without revealing the correct option. On
// pass, the artifact is the author-defined artifactOnPass object (a source
// profile), so inspection lessons still mint a stored artifact.
function choiceCheck(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    parsed = {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { questions = [], artifactOnPass = null } = validation
  const results = []

  questions.forEach((question, index) => {
    const chosen = parsed[question.id]
    let passed = false
    let message
    if (chosen === undefined || chosen === null || chosen === '') {
      message = `Answer question ${index + 1} before validating.`
    } else if (chosen === question.correctOptionId) {
      passed = true
      message = 'Correct.'
    } else {
      message = question.explain
    }
    results.push({
      id: `choice-${question.id}`,
      label: `Question ${index + 1}`,
      passed,
      message,
    })
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  return {
    passed,
    results,
    artifact: passed ? artifactOnPass : null,
  }
}

// Assembly validator. Config-driven and additive. The answer is a JSON string
// of { slotId: value }. Numeric slots compare as numbers; text slots compare
// normalized against expected/accepted. On pass, the artifact is the template
// string with every {{slotId}} token replaced by the learner's value - a
// rendered document, stored as a string artifact.
function templateSlots(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    parsed = {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { slots = [], template = '' } = validation
  const results = []

  slots.forEach((slot) => {
    const raw = parsed[slot.id]
    const strVal = raw === undefined || raw === null ? '' : String(raw).trim()
    let passed = false
    let message
    if (!strVal) {
      message = `Fill in: ${slot.label}.${slot.hint ? ` ${slot.hint}` : ''}`
    } else if (slot.numeric) {
      const num = Number(strVal)
      passed = Number.isFinite(num) && num === slot.expected
      message = passed
        ? `${slot.label} matches the source artifact.`
        : `${slot.label} does not match the source artifact.${slot.hint ? ` ${slot.hint}` : ''}`
    } else {
      const acceptedList =
        slot.accepted || (slot.expected !== undefined ? [slot.expected] : [])
      passed = acceptedList.map(normalize).includes(normalize(strVal))
      message = passed
        ? `${slot.label} matches the source artifact.`
        : `${slot.label} does not match the source artifact.${slot.hint ? ` ${slot.hint}` : ''}`
    }
    results.push({
      id: `slot-${slot.id}`,
      label: slot.label,
      passed,
      message,
    })
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  let artifact = null
  if (passed) {
    artifact = template
    slots.forEach((slot) => {
      const value = String(parsed[slot.id]).trim()
      artifact = artifact.split(`{{${slot.id}}}`).join(value)
    })
  }

  return {
    passed,
    results,
    artifact,
  }
}

// Capstone composition validator. Additive: it does NOT touch any existing
// validator - it COMPOSES them. The learner rebuilds the pipeline OUTSIDE the
// app (any tool) and proves it by importing the files their rebuild produced;
// each file is graded by the EXISTING easy-tier validator for that artifact.
// The answer is a JSON string of { key: rawFileText }, where each rawFileText
// is the raw text of one imported file. On pass, the artifact maps each key to
// its parsed artifact plus rebuiltOutside: true.
function artifactImport(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    parsed = {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { imports = [] } = validation
  const results = []
  const artifact = {}

  imports.forEach((imp) => {
    const rawText = parsed[imp.key]
    const hasText = typeof rawText === 'string' && rawText.trim().length > 0
    if (!hasText) {
      results.push({
        id: `import-${imp.key}`,
        label: imp.label,
        passed: false,
        message: `Import ${imp.label} before validating.`,
      })
      return
    }
    // Grade the imported file with the EXISTING validator for that artifact.
    const inner = validateAnswer(rawText, imp.validation)
    inner.results.forEach((r) => {
      results.push({
        id: `${imp.key}:${r.id}`,
        label: `${imp.label} - ${r.label}`,
        passed: r.passed,
        message: r.message,
      })
    })
    if (inner.passed) artifact[imp.key] = inner.artifact
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  return {
    passed,
    results,
    artifact: passed ? { ...artifact, rebuiltOutside: true } : null,
  }
}

// Inspection-by-tagging validator (additive). Replaces choiceCheck trivia on
// inspection/provenance nodes: the learner assigns each required FIELD to the
// source SEGMENT that holds its value. The answer is a JSON string of
// { fieldId: segmentId }. Each field yields one result row; wrong answers show
// the field's explain text without revealing the correct segment id. On pass,
// the artifact is the author-defined artifactOnPass object, or an auto-built
// map of field.id -> tagged segment TEXT, so inspection still mints an artifact.
function tagSource(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { source = {}, fields = [], artifactOnPass = null } = validation
  const segments = source.segments || []
  const segmentText = {}
  segments.forEach((segment) => {
    segmentText[segment.id] = segment.text
  })
  const results = []

  fields.forEach((field) => {
    const chosen = parsed[field.id]
    let passed = false
    let message
    if (chosen === undefined || chosen === null || chosen === '') {
      message = `Tag "${field.label}" in the source before validating.`
    } else if (chosen === field.correctSegmentId) {
      passed = true
      message = 'Correct.'
    } else {
      message = field.explain
    }
    results.push({
      id: `tag-${field.id}`,
      label: field.label,
      passed,
      message,
    })
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  let artifact = null
  if (passed) {
    if (artifactOnPass) {
      artifact = artifactOnPass
    } else {
      artifact = {}
      fields.forEach((field) => {
        artifact[field.id] = segmentText[parsed[field.id]]
      })
    }
  }

  return { passed, results, artifact }
}

// Handoff-record validator (additive). Replaces choiceCheck on handoff nodes:
// the learner fills a small fixed form (who/what/when) describing the handoff.
// The answer is a JSON string of { fieldId: value }. Each field yields one
// result row; a value passes when normalize(value) matches normalize(expected)
// or is in the normalized accepted list. On pass, the artifact is the
// author-defined artifactOnPass, or an auto-built map of field.id -> value.
function handoffForm(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { fields = [], artifactOnPass = null } = validation
  const results = []

  fields.forEach((field) => {
    const raw = parsed[field.id]
    const value = raw === undefined || raw === null ? '' : String(raw).trim()
    let passed = false
    let message
    if (value === '') {
      message = `Fill in: ${field.label}.`
    } else {
      const accepted =
        field.accepted || (field.expected !== undefined ? [field.expected] : [])
      passed = accepted.map(normalize).includes(normalize(value))
      message = passed ? 'Correct.' : field.explain
    }
    results.push({
      id: `field-${field.id}`,
      label: field.label,
      passed,
      message,
    })
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  let artifact = null
  if (passed) {
    if (artifactOnPass) {
      artifact = artifactOnPass
    } else {
      artifact = {}
      fields.forEach((field) => {
        artifact[field.id] = String(parsed[field.id]).trim()
      })
    }
  }

  return { passed, results, artifact }
}

// Connector-configuration validator (additive). Operations interaction: the
// learner configures how the automation CONNECTS, what TRIGGERS it, and what it
// does when a step FAILS. See ENGINE_ADDITIONS_SPEC_OPERATIONS.md section 1.
//
// The answer is a flat JSON string of { fieldId: value } (the component
// flattens its groups on serialize). Select/text/secretRef fields are delegated
// to the frozen handoffForm matcher by COMPOSITION - the same technique
// artifactImport uses - so no existing matching rule is duplicated or changed.
// Only numeric fields are matched here, because handoffForm has no numeric kind.
function connectorConfig(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { groups = [], artifactOnPass = null } = validation
  const flat = groups.flatMap((g) => (g.fields || []).map((f) => ({ ...f, groupId: g.id })))
  const delegated = flat.filter((f) => f.kind !== 'number')
  const numeric = flat.filter((f) => f.kind === 'number')

  // 1. Delegate every non-numeric field to handoffForm, then re-prefix its ids.
  const byId = {}
  if (delegated.length > 0) {
    const sub = handoffForm(answer, { fields: delegated })
    for (const row of sub.results) {
      const fieldId = row.id.replace(/^field-/, '')
      byId[fieldId] = { ...row, id: `cfg-${fieldId}` }
    }
  }

  // 2. Numeric fields: must be real numbers, and match expected or sit in range.
  for (const field of numeric) {
    const raw = parsed[field.id]
    const value = raw === undefined || raw === null ? '' : String(raw).trim()
    let passed = false
    let message
    if (value === '') {
      message = `Fill in: ${field.label}.`
    } else {
      const n = Number(value)
      if (!Number.isFinite(n)) {
        message = `${field.label} must be a number (no quotes, no units).`
      } else if (field.expected !== undefined) {
        passed = n === field.expected
        message = passed ? 'Correct.' : field.explain
      } else if (field.range) {
        passed = n >= field.range.min && n <= field.range.max
        message = passed ? 'Correct.' : field.explain
      } else {
        passed = true
        message = 'Correct.'
      }
    }
    byId[field.id] = { id: `cfg-${field.id}`, label: field.label, passed, message }
  }

  // 3. Report rows in the order the form shows them.
  const results = flat.map((f) => byId[f.id]).filter(Boolean)
  const passed = results.length > 0 && results.every((r) => r.passed)

  let artifact = null
  if (passed) {
    if (artifactOnPass) {
      artifact = artifactOnPass
    } else {
      artifact = {}
      for (const g of groups) {
        artifact[g.id] = {}
        for (const f of g.fields || []) {
          const raw = parsed[f.id]
          artifact[g.id][f.id] = f.kind === 'number' ? Number(raw) : String(raw).trim()
        }
      }
    }
  }

  return { passed, results, artifact }
}

// Run-inspection validator (additive). Operations interaction: the learner reads
// a run history with a failed step, identifies the step, classifies the cause,
// and chooses the remediation. See ENGINE_ADDITIONS_SPEC_OPERATIONS.md section 2.
//
// Deliberately the handoffForm algorithm over a different PRESENTATION: the
// teaching lives in the run log the component renders, not in a new matching
// rule. The answer is a JSON string of { fieldId: value }.
function runInspect(answer, validation) {
  let parsed
  try {
    parsed = JSON.parse(answer)
  } catch {
    return {
      passed: false,
      results: [
        {
          id: 'json-parse',
          label: 'Valid JSON',
          passed: false,
          message: 'Your answer is not valid JSON. Check for missing quotes, commas, or braces.',
        },
      ],
      artifact: null,
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const { fields = [], run = {}, artifactOnPass = null } = validation
  const results = []

  fields.forEach((field) => {
    const raw = parsed[field.id]
    const value = raw === undefined || raw === null ? '' : String(raw).trim()
    let passed = false
    let message
    if (value === '') {
      message =
        field.kind === 'step'
          ? 'Pick the step in the run history before validating.'
          : `Fill in: ${field.label}.`
    } else {
      const accepted =
        field.accepted || (field.expected !== undefined ? [field.expected] : [])
      passed = accepted.map(normalize).includes(normalize(value))
      message = passed ? 'Correct.' : field.explain
    }
    results.push({ id: `inspect-${field.id}`, label: field.label, passed, message })
  })

  const passed = results.length > 0 && results.every((r) => r.passed)

  let artifact = null
  if (passed) {
    if (artifactOnPass) {
      artifact = artifactOnPass
    } else {
      artifact = { runId: run.id, environment: run.environment }
      fields.forEach((field) => {
        artifact[field.id] = String(parsed[field.id]).trim()
      })
    }
  }

  return { passed, results, artifact }
}

const validators = {
  jsonFields,
  jsonPolicy,
  jsonRows,
  jsonDeltas,
  choiceCheck,
  templateSlots,
  artifactImport,
  tagSource,
  handoffForm,
  connectorConfig,
  runInspect,
  // Stubs for future build passes.
  csvColumns: null,
  ruleBuilder: null,
  markdownChecklist: null,
}

// Runs the validator named by validation.type.
export function validateAnswer(answer, validation) {
  const validator = validators[validation.type]
  if (typeof validator !== 'function') {
    return {
      passed: false,
      results: [
        {
          id: 'unsupported',
          label: 'Validator',
          passed: false,
          message: `Validator "${validation.type}" is not implemented yet.`,
        },
      ],
      artifact: null,
    }
  }
  return validator(answer, validation)
}

export default validateAnswer
