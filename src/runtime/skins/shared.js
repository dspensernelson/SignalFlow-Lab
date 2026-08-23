// Shared helpers for tool skins: label resolution and neutral config summaries.

export function storeLabel(ctx, storeId) {
  const def = ctx && ctx.moduleData && (ctx.moduleData.stores || []).find((s) => s.id === storeId)
  return def ? def.label : storeId || '(no store)'
}

export function sourceLabel(ctx, sourceId) {
  const def = ctx && ctx.moduleData && (ctx.moduleData.sources || []).find((s) => s.id === sourceId)
  return def ? def.label : sourceId || '(no source)'
}

export function ruleText(rule) {
  if (!rule || !rule.left) return '(no rule)'
  if (rule.op === 'exists') return `${rule.left} exists`
  if (rule.op === 'missing') return `${rule.left} is missing`
  const rhs = rule.rightKind === 'field' ? rule.right : /^[-\d.]+$|^(true|false|null)$/.test(String(rule.right).trim()) ? rule.right : `"${rule.right}"`
  return `${rule.left} ${rule.op} ${rhs}`
}

export function rulesText(config) {
  const rules = (config.rules || []).filter((r) => r.left)
  if (rules.length === 0) return '(no rule yet)'
  return rules.map(ruleText).join(config.combine === 'any' ? ' OR ' : ' AND ')
}

export function matchText(config) {
  const pairs = (config.matchOn || []).filter((p) => p.recordField && p.storeField)
  if (pairs.length === 0) return '(no match fields)'
  return pairs.map((p) => `${p.storeField} = ${p.recordField}`).join(' and ')
}

export function setText(config, max = 3) {
  const sets = (config.set || []).filter((s) => s.field)
  if (sets.length === 0) return '(nothing set)'
  const shown = sets.slice(0, max).map((s) => `${s.field} = ${s.expr || '?'}`)
  return shown.join(', ') + (sets.length > max ? `, +${sets.length - max} more` : '')
}

export function setFields(config) {
  return (config.set || []).filter((s) => s.field).map((s) => s.field)
}

export function truncate(s, n = 60) {
  const t = String(s || '')
  return t.length > n ? t.slice(0, n - 1) + '...' : t
}
