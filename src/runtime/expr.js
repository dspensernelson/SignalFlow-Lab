// Expression mini-language for transform steps and check arguments.
//
// Deliberately small: numbers, strings, booleans, null, dotted field paths,
// arithmetic, comparisons, and/or/not, and a fixed set of functions. No eval,
// no prototype access, no assignment. Missing fields evaluate to undefined
// and arithmetic on null/undefined yields null, so a renamed upstream field
// shows up as a null result the learner can see rather than a NaN.

export class ExprError extends Error {
  constructor(message, pos) {
    super(message)
    this.name = 'ExprError'
    this.pos = pos
  }
}

// ---------------------------------------------------------------- tokenizer

const KEYWORDS = new Set(['and', 'or', 'not', 'true', 'false', 'null'])

function tokenize(src) {
  const tokens = []
  let i = 0
  const s = String(src)
  while (i < s.length) {
    const ch = s[i]
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1
      continue
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) {
      let j = i
      while (j < s.length && /[0-9._]/.test(s[j])) j += 1
      const raw = s.slice(i, j).replace(/_/g, '')
      if (!/^\d*\.?\d+$|^\d+\.?\d*$/.test(raw)) throw new ExprError(`Bad number "${raw}"`, i)
      tokens.push({ t: 'num', v: Number(raw), pos: i })
      i = j
      continue
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1
      let out = ''
      while (j < s.length && s[j] !== ch) {
        if (s[j] === '\\' && j + 1 < s.length) {
          out += s[j + 1]
          j += 2
        } else {
          out += s[j]
          j += 1
        }
      }
      if (j >= s.length) throw new ExprError('Unterminated string', i)
      tokens.push({ t: 'str', v: out, pos: i })
      i = j + 1
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < s.length && /[A-Za-z0-9_.]/.test(s[j])) j += 1
      const word = s.slice(i, j)
      if (word.endsWith('.')) throw new ExprError(`Field path "${word}" ends with a dot`, i)
      if (KEYWORDS.has(word)) tokens.push({ t: 'kw', v: word, pos: i })
      else tokens.push({ t: 'id', v: word, pos: i })
      i = j
      continue
    }
    const two = s.slice(i, i + 2)
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
      tokens.push({ t: 'op', v: two === '&&' ? 'and' : two === '||' ? 'or' : two, pos: i })
      i += 2
      continue
    }
    if ('+-*/%<>(),!'.includes(ch)) {
      tokens.push({ t: 'op', v: ch === '!' ? 'not' : ch, pos: i })
      i += 1
      continue
    }
    if (ch === '=') throw new ExprError('Use == to compare (single = is not assignment here)', i)
    throw new ExprError(`Unexpected character "${ch}"`, i)
  }
  tokens.push({ t: 'eof', pos: s.length })
  return tokens
}

// ------------------------------------------------------------------- parser

const BIN_PREC = {
  or: 1,
  and: 2,
  '==': 4,
  '!=': 4,
  '<': 4,
  '<=': 4,
  '>': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
}

export function parseExpr(src) {
  if (src === null || src === undefined || String(src).trim() === '') {
    throw new ExprError('Expression is empty', 0)
  }
  const toks = tokenize(src)
  let k = 0
  const peek = () => toks[k]
  const next = () => toks[k++]
  const expectOp = (v) => {
    const t = next()
    if (t.t !== 'op' || t.v !== v) throw new ExprError(`Expected "${v}"`, t.pos)
  }

  function parsePrimary() {
    const t = next()
    if (t.t === 'num') return { t: 'num', v: t.v }
    if (t.t === 'str') return { t: 'str', v: t.v }
    if (t.t === 'kw') {
      if (t.v === 'true') return { t: 'bool', v: true }
      if (t.v === 'false') return { t: 'bool', v: false }
      if (t.v === 'null') return { t: 'null' }
      if (t.v === 'not') return { t: 'un', op: 'not', e: parseBinary(3) }
      throw new ExprError(`Unexpected "${t.v}"`, t.pos)
    }
    if (t.t === 'op' && t.v === '(') {
      const e = parseBinary(0)
      expectOp(')')
      return e
    }
    if (t.t === 'op' && t.v === '-') return { t: 'un', op: '-', e: parseBinary(7) }
    if (t.t === 'op' && t.v === 'not') return { t: 'un', op: 'not', e: parseBinary(3) }
    if (t.t === 'id') {
      if (peek().t === 'op' && peek().v === '(') {
        next()
        const args = []
        if (!(peek().t === 'op' && peek().v === ')')) {
          for (;;) {
            args.push(parseBinary(0))
            if (peek().t === 'op' && peek().v === ',') {
              next()
              continue
            }
            break
          }
        }
        expectOp(')')
        if (!FUNCS[t.v]) throw new ExprError(`Unknown function "${t.v}"`, t.pos)
        return { t: 'call', name: t.v, args }
      }
      return { t: 'path', p: t.v.split('.') }
    }
    if (t.t === 'eof') throw new ExprError('Expression ended early', t.pos)
    throw new ExprError(`Unexpected "${t.v}"`, t.pos)
  }

  function parseBinary(minPrec) {
    let left = parsePrimary()
    for (;;) {
      const t = peek()
      const op = t.t === 'op' || t.t === 'kw' ? t.v : null
      const prec = op ? BIN_PREC[op] : undefined
      if (prec === undefined || prec < minPrec || prec === 0) break
      if (t.t === 'kw' && !(op === 'and' || op === 'or')) break
      next()
      const right = parseBinary(prec + 1)
      left = { t: 'bin', op, l: left, r: right }
    }
    return left
  }

  const ast = parseBinary(0)
  const tail = peek()
  if (tail.t !== 'eof') throw new ExprError(`Unexpected "${tail.v}" after expression`, tail.pos)
  return ast
}

// ---------------------------------------------------------------- evaluate

const isNil = (v) => v === null || v === undefined
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

function toNumber(v) {
  if (isNum(v)) return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[$,\s]/g, '')
    if (cleaned === '' || cleaned === '-') return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  if (typeof v === 'boolean') return v ? 1 : 0
  return null
}

function looseEquals(a, b) {
  if (isNil(a) && isNil(b)) return true
  if (isNil(a) || isNil(b)) return false
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    const ab = typeof a === 'boolean' ? a : String(a).toLowerCase() === 'true'
    const bb = typeof b === 'boolean' ? b : String(b).toLowerCase() === 'true'
    return ab === bb
  }
  const na = toNumber(a)
  const nb = toNumber(b)
  if (na !== null && nb !== null && (isNum(a) || isNum(b))) return na === nb
  return String(a).trim() === String(b).trim()
}

function compare(op, a, b) {
  if (op === '==') return looseEquals(a, b)
  if (op === '!=') return !looseEquals(a, b)
  if (isNil(a) || isNil(b)) return false
  const na = toNumber(a)
  const nb = toNumber(b)
  let res
  if (na !== null && nb !== null) res = na - nb
  else res = String(a).localeCompare(String(b))
  if (op === '<') return res < 0
  if (op === '<=') return res <= 0
  if (op === '>') return res > 0
  return res >= 0
}

function arith(op, a, b) {
  if (op === '+' && (typeof a === 'string' || typeof b === 'string')) {
    if (isNil(a) || isNil(b)) return null
    return String(a) + String(b)
  }
  const na = toNumber(a)
  const nb = toNumber(b)
  if (na === null || nb === null) return null
  if (op === '+') return na + nb
  if (op === '-') return na - nb
  if (op === '*') return na * nb
  if (op === '/') return nb === 0 ? null : na / nb
  if (op === '%') return nb === 0 ? null : na % nb
  return null
}

const truthy = (v) => !isNil(v) && v !== false && v !== 0 && v !== ''

const FUNCS = {
  max: (...a) => (a.some(isNil) || a.length === 0 ? null : Math.max(...a.map(toNumber))),
  min: (...a) => (a.some(isNil) || a.length === 0 ? null : Math.min(...a.map(toNumber))),
  abs: (a) => (isNil(a) ? null : Math.abs(toNumber(a))),
  round: (a, n = 0) => {
    if (isNil(a)) return null
    const f = Math.pow(10, toNumber(n) || 0)
    return Math.round(toNumber(a) * f) / f
  },
  len: (a) => (isNil(a) ? 0 : Array.isArray(a) || typeof a === 'string' ? a.length : 0),
  count: (a) => (isNil(a) ? 0 : Array.isArray(a) ? a.length : 0),
  sum: (arr, field) => {
    if (!Array.isArray(arr)) return null
    let total = 0
    for (const row of arr) {
      const v = field ? getPath(row, String(field).split('.')) : row
      const n = toNumber(v)
      if (n === null) return null
      total += n
    }
    return total
  },
  num: (a) => (isNil(a) ? null : toNumber(a)),
  upper: (a) => (isNil(a) ? null : String(a).toUpperCase()),
  lower: (a) => (isNil(a) ? null : String(a).toLowerCase()),
  trim: (a) => (isNil(a) ? null : String(a).trim()),
  concat: (...a) => a.map((x) => (isNil(x) ? '' : String(x))).join(''),
  exists: (a) => !isNil(a),
  coalesce: (...a) => {
    for (const x of a) if (!isNil(x)) return x
    return null
  },
  if: (c, a, b) => (truthy(c) ? a : b),
}

function getPath(obj, parts) {
  let cur = obj
  for (const p of parts) {
    if (isNil(cur)) return undefined
    if (typeof cur !== 'object') return undefined
    if (!Object.prototype.hasOwnProperty.call(cur, p)) return undefined
    cur = cur[p]
  }
  return cur
}

function evalAst(ast, scope) {
  switch (ast.t) {
    case 'num':
    case 'str':
    case 'bool':
      return ast.v
    case 'null':
      return null
    case 'path':
      return getPath(scope, ast.p)
    case 'un': {
      const v = evalAst(ast.e, scope)
      if (ast.op === '-') return isNil(v) ? null : -toNumber(v)
      return !truthy(v)
    }
    case 'bin': {
      if (ast.op === 'and') return truthy(evalAst(ast.l, scope)) && truthy(evalAst(ast.r, scope))
      if (ast.op === 'or') return truthy(evalAst(ast.l, scope)) || truthy(evalAst(ast.r, scope))
      const a = evalAst(ast.l, scope)
      const b = evalAst(ast.r, scope)
      if (ast.op in { '==': 1, '!=': 1, '<': 1, '<=': 1, '>': 1, '>=': 1 }) return compare(ast.op, a, b)
      return arith(ast.op, a, b)
    }
    case 'call':
      return FUNCS[ast.name](...ast.args.map((x) => evalAst(x, scope)))
    default:
      throw new ExprError('Bad expression node', 0)
  }
}

export function evalExpr(srcOrAst, scope = {}) {
  const ast = typeof srcOrAst === 'string' ? parseExpr(srcOrAst) : srcOrAst
  return evalAst(ast, scope)
}

// Paths referenced by an expression (for editor hints and codegen).
export function exprPaths(srcOrAst) {
  const ast = typeof srcOrAst === 'string' ? parseExpr(srcOrAst) : srcOrAst
  const out = []
  ;(function walk(n) {
    if (n.t === 'path') out.push(n.p.join('.'))
    else if (n.t === 'un') walk(n.e)
    else if (n.t === 'bin') {
      walk(n.l)
      walk(n.r)
    } else if (n.t === 'call') n.args.forEach(walk)
  })(ast)
  return out
}

// ------------------------------------------------------------------ python

const PY_FUNCS = {
  max: (a) => `max(${a.join(', ')})`,
  min: (a) => `min(${a.join(', ')})`,
  abs: (a) => `abs(${a[0]})`,
  round: (a) => `round(${a.join(', ')})`,
  len: (a) => `len(${a[0]} or [])`,
  count: (a) => `len(${a[0]} or [])`,
  sum: (a, raw) =>
    raw[1] && raw[1].t === 'str' ? `sum(g(r, "${raw[1].v}") for r in ${a[0]})` : `sum(${a[0]})`,
  num: (a) => `num(${a[0]})`,
  upper: (a) => `str(${a[0]}).upper()`,
  lower: (a) => `str(${a[0]}).lower()`,
  trim: (a) => `str(${a[0]}).strip()`,
  concat: (a) => a.map((x) => `str(${x})`).join(' + '),
  exists: (a) => `(${a[0]} is not None)`,
  coalesce: (a) => `coalesce(${a.join(', ')})`,
  if: (a) => `(${a[1]} if ${a[0]} else ${a[2]})`,
}

const PY_PREC = { or: 1, and: 2, '==': 4, '!=': 4, '<': 4, '<=': 4, '>': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 }

export function exprToPython(srcOrAst, recVar = 'rec') {
  const ast = typeof srcOrAst === 'string' ? parseExpr(srcOrAst) : srcOrAst
  function emit(n, parentPrec = 0) {
    switch (n.t) {
      case 'num':
        return String(n.v)
      case 'str':
        return JSON.stringify(n.v)
      case 'bool':
        return n.v ? 'True' : 'False'
      case 'null':
        return 'None'
      case 'path':
        return n.p.length === 1 ? `${recVar}["${n.p[0]}"]` : `g(${recVar}, "${n.p.join('.')}")`
      case 'un':
        return n.op === '-' ? `-${emit(n.e, 7)}` : `not ${emit(n.e, 3)}`
      case 'bin': {
        const prec = PY_PREC[n.op]
        const s = `${emit(n.l, prec)} ${n.op} ${emit(n.r, prec + 1)}`
        return prec < parentPrec ? `(${s})` : s
      }
      case 'call': {
        const args = n.args.map((a) => emit(a, 0))
        return PY_FUNCS[n.name](args, n.args)
      }
      default:
        return '???'
    }
  }
  return emit(ast, 0)
}

export function safeParse(src) {
  try {
    return { ast: parseExpr(src), error: null }
  } catch (e) {
    return { ast: null, error: e.message }
  }
}
