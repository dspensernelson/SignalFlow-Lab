// Flow-era export: the learner's finished work IS the flow. Three files per
// module: flow.json (every flow + settings + pass record), one Python script
// per flow, and a build sheet in the chosen tool's vocabulary.

import { renderPython } from '../runtime/codegen/python.js'
import { getSkin } from '../runtime/skins/index.js'
import { walkSteps } from '../runtime/flowModel.js'

function slugify(text) {
  return String(text || 'module')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildFlowExport({ moduleData, state, skinId = 'lab', exportedAt = new Date().toISOString() }) {
  const base = slugify(moduleData.title)
  const flows = Object.values(state.flows || {})
  const skin = getSkin(skinId)
  const json = JSON.stringify(
    {
      tool: 'SignalFlow Lab',
      module: moduleData.moduleId,
      title: moduleData.title,
      exportedAt,
      skin: skinId,
      flows: state.flows,
      passed: state.passed,
    },
    null,
    2
  )
  const python = flows.map((f) => ({ name: `${slugify(f.name)}.py`, text: renderPython(f, moduleData) }))

  const lines = []
  lines.push(`# ${moduleData.title} - build sheet (${skin.label})`)
  lines.push('')
  lines.push(`Exported ${exportedAt}. Steps are named as ${skin.label} would name them.`)
  lines.push('')
  for (const f of flows) {
    lines.push(`## ${f.name}`)
    lines.push('')
    let n = 0
    walkSteps(f.steps, (step, path) => {
      n += 1
      const d = skin.describe(step, { moduleData, flow: f })
      const indent = '  '.repeat(Math.floor(path.length / 2))
      const lane = path.length ? ` (${path[path.length - 1]} lane)` : ''
      lines.push(`${indent}${n}. ${d.title}${lane}`)
      if (d.subtitle) lines.push(`${indent}   ${d.subtitle}`)
    })
    const s = f.settings || {}
    lines.push('')
    lines.push(`Settings: connection ${s.connection && s.connection.system ? s.connection.system : '(none)'}; identity ${s.connection && s.connection.identity ? s.connection.identity : '(none)'}; trigger ${s.trigger ? s.trigger.mode : 'event'}; retries ${s.retries}; on failure ${s.onFailure}.`)
    lines.push('')
  }
  lines.push('## Builds')
  lines.push('')
  for (const b of moduleData.builds || []) {
    const rec = state.passed && state.passed[b.id]
    lines.push(`- ${b.title}: ${rec ? (rec.assisted ? 'passed (assisted)' : 'passed') : 'not yet'}`)
  }
  lines.push('')
  return { base, json, python, markdown: lines.join('\n') }
}
