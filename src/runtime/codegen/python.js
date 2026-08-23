// Python code generation: the learner's flow as a readable script.
//
//   renderPython(flow, moduleData) -> string
//
// The point is transfer, not execution fidelity: a learner should be able to
// read this and recognize every step they assembled. It is deliberately plain
// Python (dicts, lists, functions) with a tiny helper section at the top.

import { exprToPython, safeParse } from '../expr.js'

function pyLit(v) {
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return String(v)
  return JSON.stringify(String(v))
}

function coerce(raw) {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  return s
}

function pyExpr(src) {
  const { ast, error } = safeParse(src)
  if (error) return `None  # could not parse "${src}": ${error}`
  return exprToPython(ast, 'rec')
}

function pyRule(rule) {
  const left = pyExpr(rule.left)
  if (rule.op === 'exists') return `${left} is not None`
  if (rule.op === 'missing') return `${left} is None`
  const right = rule.rightKind === 'field' ? pyExpr(rule.right) : pyLit(coerce(rule.right))
  if (rule.op === 'contains') return `${right} in (${left} or [])`
  return `${left} ${rule.op} ${right}`
}

function ident(s) {
  return String(s || 'x').replace(/[^A-Za-z0-9_]/g, '_').replace(/^(\d)/, '_$1')
}

function slug(s) {
  return String(s || '').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'flow'
}

function renderList(steps, indent, lines, ctx) {
  const pad = '    '.repeat(indent)
  if (steps.length === 0) {
    lines.push(`${pad}pass`)
    return
  }
  for (const step of steps) {
    const c = step.config || {}
    switch (step.kind) {
      case 'lookup': {
        const pairs = (c.matchOn || []).filter((p) => p.recordField && p.storeField)
        const kw = pairs.map((p) => `${ident(p.storeField)}=${pyExpr(p.recordField)}`).join(', ')
        const fn = c.mode === 'all' ? 'find_all' : 'find_one'
        lines.push(`${pad}# Lookup: ${c.store || '?'}`)
        lines.push(`${pad}rec[${pyLit(c.as || c.store)}] = ${fn}(stores[${pyLit(c.store)}], ${kw})`)
        break
      }
      case 'transform':
        lines.push(`${pad}# Transform`)
        for (const s of (c.set || []).filter((x) => x.field)) lines.push(`${pad}rec[${pyLit(s.field)}] = ${pyExpr(s.expr)}`)
        break
      case 'condition': {
        const rules = (c.rules || []).filter((r) => r.left)
        const joiner = c.combine === 'any' ? ' or ' : ' and '
        const cond = rules.length ? rules.map((r) => `(${pyRule(r)})`).join(joiner) : 'False'
        lines.push(`${pad}# Condition`)
        lines.push(`${pad}if ${cond}:`)
        renderList(step.branches ? step.branches.yes : [], indent + 1, lines, ctx)
        if (step.branches && step.branches.no && step.branches.no.length) {
          lines.push(`${pad}else:`)
          renderList(step.branches.no, indent + 1, lines, ctx)
        }
        break
      }
      case 'approval':
        lines.push(`${pad}# Approval: a person decides; store the reply on the record`)
        lines.push(`${pad}rec["approval"] = ask_approval(approvals, ${pyLit(c.approver)}, about=${pyLit(c.about || '')})`)
        break
      case 'send':
        lines.push(`${pad}# Send`)
        lines.push(`${pad}send(outbox, to=${pyLit(c.to)}, channel=${pyLit(c.channel || 'email')},`)
        lines.push(`${pad}     subject=render(${pyLit(c.subject || '')}, rec), body=render(${pyLit(c.body || '')}, rec))`)
        break
      case 'compose':
        lines.push(`${pad}# Compose`)
        lines.push(`${pad}rec[${pyLit(c.as || 'body')}] = render(${pyLit(c.template || '')}, rec)`)
        break
      case 'store':
        lines.push(`${pad}# Store: ${c.store || '?'}`)
        if (c.from) {
          lines.push(`${pad}for row in rec[${pyLit(c.from)}] or []:`)
          lines.push(`${pad}    stores[${pyLit(c.store)}].append(dict(row))`)
        } else if (c.mode === 'upsert' && c.key) {
          lines.push(`${pad}upsert(stores[${pyLit(c.store)}], dict(rec), key=${pyLit(c.key)})`)
        } else {
          lines.push(`${pad}stores[${pyLit(c.store)}].append(dict(rec))`)
        }
        break
      case 'stop':
        lines.push(`${pad}return  # Stop: this record is done`)
        break
      default:
        lines.push(`${pad}# (${step.kind})`)
    }
  }
}

const HELPERS = `
def g(rec, path):
    """Read a dotted path like "po.poTotal"; None if any part is missing."""
    cur = rec
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def num(v):
    """Parse "$1,220.00" -> 1220.0; None if it is not a number."""
    if v is None:
        return None
    try:
        return float(str(v).replace("$", "").replace(",", "").strip())
    except ValueError:
        return None


def coalesce(*vals):
    return next((v for v in vals if v is not None), None)


def find_one(rows, **match):
    """First row whose columns equal the given values, else None."""
    for row in rows:
        if all(str(row.get(k)) == str(v) for k, v in match.items()):
            return dict(row)
    return None


def find_all(rows, **match):
    return [dict(row) for row in rows if all(str(row.get(k)) == str(v) for k, v in match.items())]


def upsert(rows, row, key):
    for i, existing in enumerate(rows):
        if existing.get(key) == row.get(key):
            rows[i] = row
            return
    rows.append(row)


def render(template, rec):
    """Fill {{field}} placeholders from the record (dotted paths allowed)."""
    import re
    return re.sub(r"\\{\\{\\s*([\\w.]+)\\s*\\}\\}", lambda m: str(g(rec, m.group(1)) or ""), template)


def ask_approval(approvals, approver, about=""):
    """In production this waits for a person; here it reads the recorded reply."""
    reply = approvals.get(approver) or {"outcome": "no-reply", "at": ""}
    return {"by": approver, "outcome": reply["outcome"], "at": reply.get("at", ""), "about": about}


def send(outbox, to, channel, subject, body):
    outbox.append({"to": to, "channel": channel, "subject": subject, "body": body})
`

export function renderPython(flow, moduleData) {
  const lines = []
  const name = slug(flow.name)
  const trigger = flow.steps[0] && flow.steps[0].kind === 'trigger' ? flow.steps[0] : null
  const sourceDef = trigger && (moduleData.sources || []).find((s) => s.id === trigger.config.source)
  lines.push(`# ${flow.name} - generated from your SignalFlow build`)
  lines.push(`# Same workflow, written as a script. Each comment names the step you assembled.`)
  lines.push(`# (Small helpers - g, num, find_one, render, send - are defined at the bottom.)`)
  lines.push(``)
  lines.push(``)
  lines.push(`def process_${name}(rec, stores, outbox, approvals):`)
  lines.push(`    """One record through the flow. Returns when the record reaches a terminal step."""`)
  renderList(flow.steps.slice(trigger ? 1 : 0), 1, lines, { moduleData })
  lines.push(``)
  lines.push(``)
  lines.push(`def run_${name}(sources, stores, outbox, approvals, day="today"):`)
  if (!trigger) {
    lines.push(`    # No trigger yet: nothing starts this flow.`)
    lines.push(`    return`)
  } else if (trigger.config.mode === 'schedule') {
    lines.push(`    # Trigger: scheduled at ${trigger.config.at || '?'} (cron / Task Scheduler calls this)`)
    lines.push(`    rec = {"runId": f"{day}-run", "scheduledAt": ${pyLit(trigger.config.at || '')}, "day": day}`)
    lines.push(`    process_${name}(rec, stores, outbox, approvals)`)
  } else {
    lines.push(`    # Trigger: each new record in ${sourceDef ? sourceDef.label : trigger.config.source || '?'}`)
    lines.push(`    for rec in sources[${pyLit(trigger.config.source)}]:`)
    lines.push(`        process_${name}(dict(rec), stores, outbox, approvals)`)
  }
  lines.push(``)
  lines.push(``)
  lines.push(`# ---- helpers -------------------------------------------------------------`)
  lines.push(HELPERS.trim())
  lines.push(``)
  lines.push(``)
  lines.push(`if __name__ == "__main__":`)
  lines.push(`    import json, sys`)
  lines.push(`    data = json.load(open(sys.argv[1]))  # {"sources": {...}, "stores": {...}, "approvals": {...}}`)
  lines.push(`    outbox = []`)
  lines.push(`    run_${name}(data["sources"], data["stores"], outbox, data.get("approvals", {}))`)
  lines.push(`    print(json.dumps({"stores": data["stores"], "outbox": outbox}, indent=2))`)
  lines.push(``)
  return lines.join('\n')
}
