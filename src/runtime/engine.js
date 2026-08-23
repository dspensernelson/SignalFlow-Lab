// The flow engine: runs a flow over a day's data and produces a trace.
//
//   createDayState(moduleData, dayId, carriedStores) -> dayState
//   runFlow(flow, dayState) -> { trace, stores, outbox, alerts }
//   runDay(flows, dayState) -> { traces, stores, outbox, alerts, status }
//   runModule(flows, moduleData, upToDayId) -> { byDay: {dayId: runDayResult}, stores }
//
// Everything is deterministic and pure: the same flow and data always give
// the same trace. A trace records, per record, every step it touched, with a
// status and a human-readable note, plus where it ended up (terminal). That
// is what makes failure legible: "INV-58962 ended in payment-batch; its path
// never touched payment-history."

import { evalExpr, safeParse, exprPaths } from './expr.js'

const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)))
const isNil = (v) => v === null || v === undefined

export function getPath(obj, pathStr) {
  if (!pathStr) return undefined
  let cur = obj
  for (const p of String(pathStr).split('.')) {
    if (isNil(cur) || typeof cur !== 'object') return undefined
    if (!Object.prototype.hasOwnProperty.call(cur, p)) return undefined
    cur = cur[p]
  }
  return cur
}

export function setPath(obj, pathStr, value) {
  const parts = String(pathStr).split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (isNil(cur[parts[i]]) || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

function looseEq(a, b) {
  if (isNil(a) && isNil(b)) return true
  if (isNil(a) || isNil(b)) return false
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(String(a).replace(/[$,\s]/g, ''))
    const nb = Number(String(b).replace(/[$,\s]/g, ''))
    if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return String(a).toLowerCase() === String(b).toLowerCase()
  }
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}

export function coerceLiteral(raw) {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') return raw
  const s = raw.trim()
  if (s === '') return ''
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1)
  return s
}

export function fmt(v) {
  if (v === undefined) return 'missing'
  if (v === null) return 'null'
  if (typeof v === 'string') return `"${v}"`
  if (Array.isArray(v)) return `[${v.length} rows]`
  if (typeof v === 'object') return '{...}'
  return String(v)
}

// ------------------------------------------------------------- templates
// {{ expr }} evaluates an expression against the record; {{#each path}} ...
// {{/each}} repeats its body once per row with the row as scope.

export function renderTemplate(template, scope) {
  if (!template) return ''
  let out = String(template)
  out = out.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_m, expr, body) => {
    let rows
    try {
      rows = evalExpr(expr.trim(), scope)
    } catch {
      return `[each: bad expression "${expr.trim()}"]`
    }
    if (!Array.isArray(rows)) return ''
    return rows.map((row) => renderTemplate(body, { ...row, _parent: scope })).join('')
  })
  out = out.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, expr) => {
    try {
      const v = evalExpr(expr, scope)
      if (isNil(v)) return ''
      if (typeof v === 'object') return JSON.stringify(v)
      return String(v)
    } catch (e) {
      return `[${e.message}]`
    }
  })
  return out
}

// ------------------------------------------------------------- day state

export function createDayState(moduleData, dayId, carriedStores = {}) {
  const day = moduleData.days.find((d) => d.id === dayId)
  if (!day) throw new Error(`Unknown day "${dayId}"`)
  const storeDefs = Object.fromEntries((moduleData.stores || []).map((s) => [s.id, s]))
  const stores = clone(carriedStores) || {}
  for (const def of moduleData.stores || []) {
    // Working queues (a day's payment batch, the exception queue) start empty
    // each day; history-style stores carry forward.
    if (!stores[def.id] || def.daily) stores[def.id] = []
  }
  for (const [storeId, rows] of Object.entries(day.seeds || {})) {
    if (!stores[storeId]) stores[storeId] = []
    const keyField = storeDefs[storeId] && storeDefs[storeId].keyField
    for (const row of rows) {
      const exists = keyField
        ? stores[storeId].some((r) => looseEq(getPath(r, keyField), getPath(row, keyField)))
        : stores[storeId].some((r) => JSON.stringify(r) === JSON.stringify(row))
      if (!exists) stores[storeId].push(clone(row))
    }
  }
  const sources = {}
  for (const def of moduleData.sources || []) {
    sources[def.id] = { id: def.id, label: def.label, labelField: def.labelField, rows: clone((day.sources || {})[def.id] || []) }
  }
  return {
    dayId,
    dayLabel: day.label,
    sources,
    stores,
    approvals: clone(day.approvals || {}),
    failures: clone(day.failures || []),
    storeDefs,
  }
}

// ------------------------------------------------------------- engine core

// Where a record ended up: the last successful store/send, unless it failed.
function finishTerminal(rt) {
  if (rt.terminal) return
  for (let i = rt.steps.length - 1; i >= 0; i -= 1) {
    const s = rt.steps[i]
    if (s.status === 'succeeded' && (s.kind === 'store' || s.kind === 'send')) {
      rt.terminal = { type: s.kind, target: s.target, stopped: !!rt.stopped }
      return
    }
  }
  rt.terminal = { type: 'end', stopped: !!rt.stopped }
}

export function runFlow(flow, dayState) {
  const stores = clone(dayState.stores) || {}
  const outbox = []
  const alerts = []
  const log = []
  const settings = flow.settings || { retries: 0, onFailure: 'skip' }
  const trace = { flowId: flow.id, flowName: flow.name, status: 'empty', records: [], log }

  const trigger = flow.steps[0]
  if (!trigger || trigger.kind !== 'trigger') {
    log.push('No trigger: a flow starts with a Trigger step. Nothing ran.')
    return { trace, stores, outbox, alerts }
  }

  // Records the trigger emits.
  let seeds
  if (trigger.config.mode === 'schedule') {
    seeds = [{ record: { runId: `${dayState.dayId}-run`, scheduledAt: trigger.config.at || '', day: dayState.dayId }, label: `Scheduled run ${trigger.config.at || ''}`.trim() }]
  } else {
    const src = dayState.sources[trigger.config.source]
    if (!src) {
      log.push(`Trigger source "${trigger.config.source || '(none)'}" is not connected. Nothing arrived.`)
      return { trace, stores, outbox, alerts }
    }
    seeds = src.rows.map((row, i) => ({ record: clone(row), label: String(getPath(row, src.labelField) || `${src.label} ${i + 1}`) }))
    if (seeds.length === 0) log.push(`Nothing arrived in ${src.label} today.`)
  }

  const ctx = { stores, outbox, alerts, settings, dayState }

  for (const seed of seeds) {
    const rt = { id: seed.label, label: seed.label, steps: [], terminal: null, final: null }
    rt.steps.push({ stepId: trigger.id, kind: 'trigger', status: 'succeeded', note: trigger.config.mode === 'schedule' ? `fired at ${trigger.config.at || 'schedule'}` : `arrived in ${dayState.sources[trigger.config.source].label}` })
    const record = seed.record
    runList(flow.steps.slice(1), record, rt, ctx)
    finishTerminal(rt)
    rt.final = clone(record)
    trace.records.push(rt)
  }

  const anyFailed = trace.records.some((r) => r.terminal.type === 'failed' || r.terminal.type === 'dropped')
  const allFailed = trace.records.length > 0 && trace.records.every((r) => r.terminal.type === 'failed' || r.terminal.type === 'dropped')
  trace.status = trace.records.length === 0 ? 'empty' : allFailed ? 'failed' : anyFailed ? 'partial' : 'succeeded'
  return { trace, stores, outbox, alerts }
}

// Execute a list of steps against a record. Returns true if the record is done
// (it failed, or hit a Stop); false if it reached the end of the list and the
// caller should continue with whatever follows (branches rejoin).
function runList(steps, record, rt, ctx) {
  for (const step of steps) {
    const entry = { stepId: step.id, kind: step.kind, status: 'succeeded', note: '' }
    rt.steps.push(entry)
    const failure = matchFailure(step, ctx.dayState.failures)
    if (failure) {
      const attemptsAvailable = 1 + (Number(ctx.settings.retries) || 0)
      if (failure.failAttempts >= attemptsAvailable) {
        entry.status = 'failed'
        entry.attempt = attemptsAvailable
        entry.note = `${failure.cause}: ${failure.message || 'the call failed'} (gave up after ${attemptsAvailable} attempt${attemptsAvailable === 1 ? '' : 's'})`
        applyFailurePolicy(step, record, rt, ctx, failure)
        return true
      }
      entry.attempt = failure.failAttempts + 1
      entry.note = `recovered on attempt ${failure.failAttempts + 1} after ${failure.cause}; `
    }
    let result
    try {
      result = execStep(step, record, rt, ctx)
    } catch (e) {
      result = { status: 'failed', note: e.message }
    }
    entry.status = result.status
    entry.note = (entry.note || '') + (result.note || '')
    if (result.target) entry.target = result.target
    if (result.branch) entry.branch = result.branch
    if (result.status === 'failed') {
      rt.terminal = { type: 'failed', target: step.id }
      return true
    }
    if (result.stop) {
      rt.stopped = true
      return true
    }
    if (step.kind === 'condition') {
      const list = step.branches ? step.branches[result.branch] || [] : []
      const done = runList(list, record, rt, ctx)
      if (done) return true
      // Branches rejoin: the record continues with the steps after the condition.
    }
  }
  return false
}

function matchFailure(step, failures) {
  for (const f of failures || []) {
    if (f.stepKind && f.stepKind !== step.kind) continue
    if (f.store && step.config.store !== f.store) continue
    if (f.source && step.config.source !== f.source) continue
    if (f.to && step.config.to !== f.to) continue
    return f
  }
  return null
}

function applyFailurePolicy(step, record, rt, ctx, failure) {
  const policy = ctx.settings.onFailure || 'skip'
  if (policy === 'dead-letter') {
    if (!ctx.stores['dead-letter']) ctx.stores['dead-letter'] = []
    ctx.stores['dead-letter'].push({ recordLabel: rt.label, stepId: step.id, cause: failure.cause, record: clone(record) })
    ctx.alerts.push({ to: 'on-call owner', cause: failure.cause, recordLabel: rt.label, stepId: step.id, message: `${rt.label} failed at ${step.kind} (${failure.cause}); parked in dead-letter` })
    rt.terminal = { type: 'failed', target: step.id, handled: 'dead-letter' }
    rt.steps[rt.steps.length - 1].note += '; parked in dead-letter and the on-call owner was alerted'
  } else if (policy === 'retry-forever') {
    rt.terminal = { type: 'failed', target: step.id, handled: 'retry-forever' }
    rt.steps[rt.steps.length - 1].note += '; retrying forever - this run will hang until someone notices'
  } else {
    rt.terminal = { type: 'dropped', target: step.id, handled: 'skip' }
    rt.steps[rt.steps.length - 1].note += '; dropped silently - nobody was told'
  }
}

function execStep(step, record, rt, ctx) {
  const c = step.config || {}
  switch (step.kind) {
    case 'trigger':
      return { status: 'failed', note: 'a trigger can only be the first step' }

    case 'lookup': {
      if (!c.store) return { status: 'failed', note: 'no store chosen' }
      const rows = ctx.stores[c.store]
      if (!rows) return { status: 'failed', note: `store "${c.store}" does not exist` }
      const pairs = (c.matchOn || []).filter((p) => p.recordField && p.storeField)
      const as = c.as || c.store
      if (pairs.length === 0 && c.mode !== 'all') return { status: 'failed', note: 'no match fields set - which field of the record matches which column?' }
      const leftVals = pairs.map((p) => recordValue(record, p.recordField))
      const matches = rows.filter((row) => pairs.every((p, i) => looseEq(leftVals[i], getPath(row, p.storeField))))
      const keyDesc = pairs.map((p, i) => `${p.recordField}=${fmt(leftVals[i])}`).join(', ')
      if (c.mode === 'all') {
        record[as] = clone(matches)
        return { status: 'succeeded', note: `${matches.length} row${matches.length === 1 ? '' : 's'} from ${c.store}${pairs.length ? ` where ${keyDesc}` : ''} -> ${as}`, target: c.store }
      }
      if (matches.length === 0) {
        record[as] = null
        return { status: 'succeeded', note: `no match in ${c.store} for ${keyDesc} -> ${as} = null`, target: c.store }
      }
      record[as] = clone(matches[0])
      const label = ctx.dayState.storeDefs[c.store] && ctx.dayState.storeDefs[c.store].keyField ? fmt(getPath(matches[0], ctx.dayState.storeDefs[c.store].keyField)) : '1 row'
      return { status: 'succeeded', note: `matched ${label} in ${c.store} -> ${as}`, target: c.store }
    }

    case 'transform': {
      const sets = (c.set || []).filter((s) => s.field)
      if (sets.length === 0) return { status: 'failed', note: 'nothing to set' }
      const notes = []
      for (const s of sets) {
        const { ast, error } = safeParse(s.expr)
        if (error) return { status: 'failed', note: `${s.field}: ${error}` }
        const missing = exprPaths(ast).filter((p) => getPath(record, p) === undefined)
        const value = evalExpr(ast, record)
        setPath(record, s.field, value === undefined ? null : value)
        if (isNil(value) && missing.length) notes.push(`${s.field} = null (${missing.join(', ')} missing)`)
        else notes.push(`${s.field} = ${fmt(value)}`)
      }
      return { status: 'succeeded', note: notes.join(', ') }
    }

    case 'condition': {
      const rules = (c.rules || []).filter((r) => r.left)
      if (rules.length === 0) return { status: 'failed', note: 'no rule set' }
      const results = []
      const notes = []
      for (const r of rules) {
        let left
        try {
          left = evalExpr(r.left, record)
        } catch (e) {
          return { status: 'failed', note: `rule "${r.left}": ${e.message}` }
        }
        let right = null
        if (r.op !== 'exists' && r.op !== 'missing') {
          if (r.rightKind === 'field') {
            try {
              right = evalExpr(r.right, record)
            } catch (e) {
              return { status: 'failed', note: `rule "${r.right}": ${e.message}` }
            }
          } else right = coerceLiteral(r.right)
        }
        const pass = evalRule(left, r.op, right)
        results.push(pass)
        const rhs = r.op === 'exists' || r.op === 'missing' ? '' : ` ${fmt(right)}`
        notes.push(`${r.left} ${r.op}${rhs} (${r.left} is ${fmt(left)}) -> ${pass ? 'true' : 'false'}`)
      }
      const pass = c.combine === 'any' ? results.some(Boolean) : results.every(Boolean)
      return { status: 'succeeded', note: notes.join('; ') + ` => ${pass ? 'YES' : 'NO'}`, branch: pass ? 'yes' : 'no' }
    }

    case 'approval': {
      if (!c.approver) return { status: 'failed', note: 'no approver named' }
      const reply = ctx.dayState.approvals[c.approver]
      const outcome = reply ? reply.outcome : 'no-reply'
      record.approval = { by: c.approver, outcome, at: reply ? reply.at || '' : '', about: c.about || '' }
      return { status: 'succeeded', note: reply ? `${c.approver} replied "${outcome}"${reply.at ? ` at ${reply.at}` : ''}` : `${c.approver} did not reply -> approval.outcome = "no-reply"` }
    }

    case 'send': {
      if (!c.to) return { status: 'failed', note: 'no recipient' }
      const msg = { to: c.to, channel: c.channel || 'email', subject: renderTemplate(c.subject, record), body: renderTemplate(c.body, record), recordLabel: rt.label, flowStepId: step.id }
      ctx.outbox.push(msg)
      return { status: 'succeeded', note: `sent to ${c.to} via ${msg.channel}${msg.subject ? `: "${msg.subject}"` : ''}`, target: c.to }
    }

    case 'compose': {
      const as = c.as || 'body'
      record[as] = renderTemplate(c.template, record)
      return { status: 'succeeded', note: `${as} = ${record[as].length} chars` }
    }

    case 'stop':
      return { status: 'succeeded', note: 'stopped here - nothing after this runs for this record', stop: true }

    case 'store': {
      if (!c.store) return { status: 'failed', note: 'no store chosen' }
      if (!ctx.stores[c.store]) ctx.stores[c.store] = []
      const target = ctx.stores[c.store]
      let rows
      if (c.from) {
        const v = getPath(record, c.from)
        if (!Array.isArray(v)) return { status: 'failed', note: `${c.from} is ${fmt(v)}, not a list` }
        rows = v
      } else rows = [record]
      let written = 0
      for (const row of rows) {
        const copy = clone(row)
        if (c.mode === 'upsert' && c.key) {
          const i = target.findIndex((r) => looseEq(getPath(r, c.key), getPath(copy, c.key)))
          if (i >= 0) target[i] = copy
          else target.push(copy)
        } else target.push(copy)
        written += 1
      }
      return { status: 'succeeded', note: `wrote ${written} row${written === 1 ? '' : 's'} to ${c.store}`, target: c.store }
    }

    default:
      return { status: 'failed', note: `unknown step kind "${step.kind}"` }
  }
}

// A lookup's record-side value: a field path, or a literal/expression like '1.0.0'.
function recordValue(record, src) {
  const direct = getPath(record, src)
  if (direct !== undefined) return direct
  try {
    return evalExpr(src, record)
  } catch {
    return undefined
  }
}

function evalRule(left, op, right) {
  switch (op) {
    case 'exists':
      return !isNil(left)
    case 'missing':
      return isNil(left)
    case '==':
      return looseEq(left, right)
    case '!=':
      return !looseEq(left, right)
    case 'contains':
      if (Array.isArray(left)) return left.some((x) => looseEq(x, right))
      return !isNil(left) && String(left).toLowerCase().includes(String(right).toLowerCase())
    default: {
      if (isNil(left) || isNil(right)) return false
      const a = Number(String(left).replace(/[$,\s]/g, ''))
      const b = Number(String(right).replace(/[$,\s]/g, ''))
      const numeric = Number.isFinite(a) && Number.isFinite(b)
      const cmp = numeric ? a - b : String(left).localeCompare(String(right))
      if (op === '<') return cmp < 0
      if (op === '<=') return cmp <= 0
      if (op === '>') return cmp > 0
      if (op === '>=') return cmp >= 0
      return false
    }
  }
}

// ------------------------------------------------------------- day + module

export function runDay(flows, dayState) {
  let stores = dayState.stores
  const traces = {}
  const outbox = []
  const alerts = []
  const order = ['succeeded', 'empty', 'partial', 'failed']
  let worst = 'empty'
  for (const flow of flows) {
    const res = runFlow(flow, { ...dayState, stores })
    traces[flow.id] = res.trace
    stores = res.stores
    outbox.push(...res.outbox)
    alerts.push(...res.alerts)
    if (order.indexOf(res.trace.status) > order.indexOf(worst)) worst = res.trace.status
    if (res.trace.status === 'succeeded' && worst === 'empty') worst = 'succeeded'
  }
  return { traces, stores, outbox, alerts, status: worst, dayId: dayState.dayId }
}

// Run every day up to and including upToDayId, carrying stores forward.
export function runModule(flows, moduleData, upToDayId) {
  const byDay = {}
  let carried = {}
  for (const day of moduleData.days) {
    const state = createDayState(moduleData, day.id, carried)
    const res = runDay(flows, state)
    byDay[day.id] = { ...res, dayState: state }
    carried = res.stores
    if (day.id === upToDayId) break
  }
  return { byDay, stores: carried }
}
