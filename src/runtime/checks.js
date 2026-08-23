// Acceptance checks: business facts a run must make true.
//
//   evaluateChecks(checks, runResult, dayState, flows) -> [{ id, label, passed, detail }]
//
// runResult comes from engine.runDay. Checks never look at the learner's
// flow shape (except settingEquals); they look at what the run DID: what is
// in which store, who got a message, what status the run ended in. When a
// check fails the detail explains it in the trace's terms, citing the record's
// path and where it ended up.

import { getPath, fmt } from './engine.js'

const isNil = (v) => v === null || v === undefined

function looseEq(a, b) {
  if (isNil(a) && isNil(b)) return true
  if (isNil(a) || isNil(b)) return false
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(String(a).replace(/[$,\s]/g, ''))
    const nb = Number(String(b).replace(/[$,\s]/g, ''))
    if (Number.isFinite(na) && Number.isFinite(nb)) return Math.abs(na - nb) < 0.005
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') return String(a).toLowerCase() === String(b).toLowerCase()
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}

function matchesWhere(row, where) {
  if (!where) return true
  return Object.entries(where).every(([k, v]) => looseEq(getPath(row, k), v))
}

function matchesFields(row, fields) {
  const misses = []
  for (const [k, v] of Object.entries(fields || {})) {
    const actual = getPath(row, k)
    const okv = Array.isArray(v) ? v.some((x) => looseEq(actual, x)) : looseEq(actual, v)
    if (!okv) misses.push(`${k} is ${fmt(actual)} (expected ${Array.isArray(v) ? v.map(fmt).join(' or ') : fmt(v)})`)
  }
  return misses
}

function whereLabel(where) {
  if (!where) return 'the record'
  const vals = Object.values(where)
  return vals.length ? String(vals[0]) : 'the record'
}

export function describePath(recordTrace) {
  return (recordTrace.steps || [])
    .map((s) => {
      let t = s.kind
      if (s.target) t += `(${s.target})`
      if (s.branch) t += ` -> ${s.branch.toUpperCase()}`
      if (s.status === 'failed') t += ' [FAILED]'
      return t
    })
    .join(' -> ')
}

export function describeTerminal(recordTrace) {
  const t = recordTrace.terminal || { type: 'end' }
  if (t.type === 'store') return `it was written to ${t.target}`
  if (t.type === 'send') return `it ended with a send to ${t.target}`
  if (t.type === 'failed') return `it FAILED at a step${t.handled ? ` (${t.handled})` : ''}`
  if (t.type === 'dropped') return 'it was dropped silently by a failed step'
  if (t.branch) return `it fell off the end of the ${t.branch.toUpperCase()} branch with nothing done to it`
  return 'it fell off the end of the flow with nothing done to it'
}

// Find the trace of the record a `where` describes, in any flow.
function findRecordTrace(runResult, where) {
  const label = whereLabel(where)
  for (const trace of Object.values(runResult.traces || {})) {
    for (const r of trace.records || []) {
      if (matchesWhere(r.final, where) || r.label === label) return r
    }
  }
  return null
}

function explainRecord(runResult, where) {
  const rt = findRecordTrace(runResult, where)
  if (!rt) return `No record matching ${whereLabel(where)} ever entered a run. Did the trigger see it?`
  return `${rt.label}: ${describeTerminal(rt)}. Path: ${describePath(rt)}.`
}

function rowsLabel(rows, keyGuess) {
  return rows
    .map((r) => {
      const k = keyGuess || ['invoiceNumber', 'runId', 'recordLabel', 'id', 'poNumber', 'vendorId'].find((f) => !isNil(getPath(r, f)))
      return k ? String(getPath(r, k)) : '(row)'
    })
    .join(', ')
}

const HANDLERS = {
  storeContains(c, rr) {
    const rows = rr.stores[c.store] || []
    const hits = rows.filter((r) => matchesWhere(r, c.where))
    if (hits.length === 0) return { passed: false, detail: `${whereLabel(c.where)} is not in ${c.store}. ${explainRecord(rr, c.where)}` }
    if (c.fields) {
      const misses = matchesFields(hits[0], c.fields)
      if (misses.length) return { passed: false, detail: `${whereLabel(c.where)} is in ${c.store}, but ${misses.join('; ')}.` }
    }
    if (c.fieldsContain) {
      for (const [k, v] of Object.entries(c.fieldsContain)) {
        const actual = getPath(hits[0], k)
        const needles = Array.isArray(v) ? v : [v]
        const hit = !isNil(actual) && needles.some((n) => String(actual).toLowerCase().includes(String(n).toLowerCase()))
        if (!hit) return { passed: false, detail: `${whereLabel(c.where)} is in ${c.store}, but ${k} is ${fmt(actual)} - expected it to mention ${needles.map((n) => `"${n}"`).join(' or ')}.` }
      }
    }
    const withText = c.fields ? ` with ${Object.entries(c.fields).map(([k, v]) => `${k} = ${fmt(Array.isArray(v) ? v[0] : v)}`).join(', ')}` : c.fieldsContain ? ` (${Object.entries(c.fieldsContain).map(([k]) => `${k} = ${fmt(getPath(hits[0], k))}`).join(', ')})` : ''
    return { passed: true, detail: `${whereLabel(c.where)} is in ${c.store}${withText}.` }
  },
  storeMissing(c, rr) {
    const rows = rr.stores[c.store] || []
    const hits = rows.filter((r) => matchesWhere(r, c.where))
    if (hits.length) return { passed: false, detail: `${whereLabel(c.where)} IS in ${c.store}${c.why ? ` - ${c.why}` : ''}. ${explainRecord(rr, c.where)}` }
    return { passed: true, detail: `${whereLabel(c.where)} is not in ${c.store}.` }
  },
  storeCount(c, rr) {
    const rows = (rr.stores[c.store] || []).filter((r) => matchesWhere(r, c.where))
    const n = rows.length
    if (n !== c.equals) return { passed: false, detail: `${c.store} has ${n} row${n === 1 ? '' : 's'} (expected ${c.equals})${n ? `: ${rowsLabel(rows, c.keyField)}` : ''}.` }
    return { passed: true, detail: `${c.store} has ${n} row${n === 1 ? '' : 's'}${n ? `: ${rowsLabel(rows, c.keyField)}` : ''}.` }
  },
  storeSum(c, rr) {
    const rows = (rr.stores[c.store] || []).filter((r) => matchesWhere(r, c.where))
    let total = 0
    for (const r of rows) {
      const v = Number(getPath(r, c.field))
      if (!Number.isFinite(v)) return { passed: false, detail: `a row in ${c.store} has a non-numeric ${c.field} (${fmt(getPath(r, c.field))}).` }
      total += v
    }
    const passed = Math.abs(total - c.equals) < 0.005
    return { passed, detail: `${c.store} ${c.field} totals ${total.toFixed(2)}${passed ? '' : ` (expected ${Number(c.equals).toFixed(2)})`}.` }
  },
  recordField(c, rr) {
    const rt = findRecordTrace(rr, c.where)
    if (!rt) return { passed: false, detail: `No record matching ${whereLabel(c.where)} ran. Did the trigger see it?` }
    const fieldList = Array.isArray(c.field) ? c.field : [c.field]
    const fieldUsed = fieldList.find((f) => !isNil(getPath(rt.final, f))) || fieldList[0]
    const actual = getPath(rt.final, fieldUsed)
    if (c.exists) {
      const passed = !isNil(actual)
      return { passed, detail: passed ? `${rt.label}.${fieldUsed} is ${fmt(actual)}.` : `${rt.label}.${fieldUsed} is ${fmt(actual)}. ${describeTerminal(rt)}. Path: ${describePath(rt)}.` }
    }
    const accepted = c.oneOf || [c.equals]
    const passed = accepted.some((v) => looseEq(actual, v))
    const fieldNames = fieldList.length > 1 ? `${fieldUsed} (or ${fieldList.filter((f) => f !== fieldUsed).join(' / ')})` : fieldUsed
    return { passed, detail: passed ? `${rt.label}.${fieldUsed} = ${fmt(actual)}.` : `${rt.label}.${fieldNames} is ${fmt(actual)}, expected ${accepted.map(fmt).join(' or ')}. Path: ${describePath(rt)}.` }
  },
  outboxContains(c, rr) {
    const msgs = (rr.outbox || []).filter((m) => {
      if (c.to && !looseEq(m.to, c.to)) return false
      if (c.contains && !`${m.subject} ${m.body}`.toLowerCase().includes(String(c.contains).toLowerCase())) return false
      if (c.recordLabel && !looseEq(m.recordLabel, c.recordLabel)) return false
      return true
    })
    const n = msgs.length
    const want = c.count
    const passed = want === undefined ? n >= 1 : n === want
    const who = c.to ? ` to ${c.to}` : ''
    const about = c.recordLabel ? ` about ${c.recordLabel}` : ''
    const txt = c.contains ? ` mentioning "${c.contains}"` : ''
    if (passed) return { passed, detail: `${n} message${n === 1 ? '' : 's'}${who}${about}${txt}.` }
    return { passed, detail: `${n} message${n === 1 ? '' : 's'}${who}${about}${txt} (expected ${want === undefined ? 'at least 1' : want}). Outbox has ${rr.outbox.length} message${rr.outbox.length === 1 ? '' : 's'}${rr.outbox.length ? ': ' + rr.outbox.map((m) => `${m.to} (${m.recordLabel})`).join(', ') : ''}.` }
  },
  runStatus(c, rr) {
    const status = c.flowId ? (rr.traces[c.flowId] ? rr.traces[c.flowId].status : 'missing') : rr.status
    const passed = status === c.equals
    return { passed, detail: `${c.flowId ? `flow ${c.flowId}` : 'the run'} ended ${status}${passed ? '' : ` (expected ${c.equals})`}.` }
  },
  alertSent(c, rr) {
    const n = (rr.alerts || []).length
    const passed = c.count === undefined ? n >= 1 : n === c.count
    return { passed, detail: n ? `${n} alert${n === 1 ? '' : 's'} to the on-call owner.` : 'no alert was raised - the failure was invisible.' }
  },
  stepRetried(c, rr) {
    for (const trace of Object.values(rr.traces || {})) {
      if (c.flowId && trace.flowId !== c.flowId) continue
      for (const r of trace.records || []) {
        for (const s of r.steps || []) {
          if (c.stepKind && s.kind !== c.stepKind) continue
          if (c.store && s.target !== c.store) continue
          if (s.attempt && s.attempt > 1) return { passed: true, detail: `${r.label}: ${s.note}` }
        }
      }
    }
    return { passed: false, detail: 'no step recovered on a retry. Either nothing failed, or the flow gave up on the first attempt.' }
  },
  settingInRange(c, rr, ds, flows) {
    const flow = (flows || []).find((f) => f.id === c.flowId) || (flows || [])[0]
    if (!flow) return { passed: false, detail: 'no flow' }
    const actual = Number(getPath(flow.settings, c.path))
    const passed = Number.isFinite(actual) && actual >= c.min && actual <= c.max
    return { passed, detail: `${c.path} is ${fmt(getPath(flow.settings, c.path))}${passed ? '' : ` (expected between ${c.min} and ${c.max})`}.` }
  },
  settingEquals(c, rr, ds, flows) {
    const flow = (flows || []).find((f) => f.id === c.flowId) || (flows || [])[0]
    if (!flow) return { passed: false, detail: 'no flow' }
    const actual = getPath(flow.settings, c.path)
    const passed = looseEq(actual, c.equals)
    return { passed, detail: `${c.path} is ${fmt(actual)}${passed ? '' : ` (expected ${fmt(c.equals)})`}.` }
  },
}

export const CHECK_KINDS = Object.keys(HANDLERS)

export function evaluateChecks(checks, runResult, dayState, flows) {
  return (checks || []).map((c) => {
    const h = HANDLERS[c.kind]
    if (!h) return { id: c.id, label: c.label, passed: false, detail: `unknown check kind "${c.kind}"` }
    try {
      const r = h(c, runResult, dayState, flows)
      return { id: c.id, label: c.label, passed: !!r.passed, detail: r.detail || '' }
    } catch (e) {
      return { id: c.id, label: c.label, passed: false, detail: `check error: ${e.message}` }
    }
  })
}

export function allPassed(results) {
  return results.length > 0 && results.every((r) => r.passed)
}
