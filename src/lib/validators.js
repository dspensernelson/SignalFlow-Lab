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

const validators = {
  jsonFields,
  jsonPolicy,
  jsonRows,
  jsonDeltas,
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
