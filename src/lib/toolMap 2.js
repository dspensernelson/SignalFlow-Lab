// Tool map derivation: turn this project's nodes + built lessons into one row
// per workflow step (what KIND of action it is, which tools fit, how you'd do
// it by hand), plus a markdown rendering of the same table.
//
// This replaces the hand-written curriculum/<module>/TOOL_MAP.md appendix,
// which lapsed after two modules (module-03 shipped without one) and never
// rendered in the app. Deriving it from lesson data means it cannot go stale
// or go missing. See DECISION_LOG 2026-08-22.

import taxonomy from '../data/automationTaxonomy.json'

export const TOOL_LABEL = Object.fromEntries(taxonomy.tools.map((t) => [t.id, t.label]))
export const ACTION_KIND = Object.fromEntries(taxonomy.actionKinds.map((k) => [k.id, k]))

// One row per task-bearing node, in map order, using the lesson for the tier
// the learner is currently in (falling back to the easy lesson).
export function buildToolMapRows({ nodes, lessons, tierLessonId, tier }) {
  if (!lessons) return []
  const rows = []
  for (const node of nodes) {
    if (!node.taskId) continue
    const lesson =
      lessons[tierLessonId ? tierLessonId(node.taskId, tier) : node.taskId] ||
      lessons[node.taskId]
    const rw = lesson?.takeaway?.realWorld
    if (!rw) continue
    rows.push({
      nodeId: node.id,
      step: node.label,
      actionKind: rw.actionKind,
      bestFit: Array.isArray(rw.bestFit) ? rw.bestFit : [],
      byHand: rw.soloRebuildPath || '',
    })
  }
  return rows
}

export function toolMapMarkdown(projectName, rows) {
  const lines = [
    `# Tool map - ${projectName}`,
    '',
    'GENERATED from lesson data by SignalFlow Lab. Do not edit by hand.',
    '',
    'The tool names are illustrative. The skill is recognizing which KIND of',
    'action each step needs; the specific product is interchangeable.',
    '',
    '| Step | Kind of action | Best-fit tools | By hand |',
    '| --- | --- | --- | --- |',
  ]
  for (const r of rows) {
    const kind = ACTION_KIND[r.actionKind]
    const tools = r.bestFit.map((b) => TOOL_LABEL[b.tool] || b.tool).join(', ')
    const byHand = r.byHand.replace(/\|/g, '/')
    lines.push(`| ${r.step} | ${kind ? kind.label : r.actionKind} | ${tools} | ${byHand} |`)
  }
  lines.push('')
  lines.push('## The shape every workflow repeats')
  lines.push('')
  for (const k of taxonomy.actionKinds) {
    lines.push(`- **${k.label}** - ${k.gloss}`)
  }
  lines.push('')
  return lines.join('\n')
}
