// Tool skins: the same flow, described in each tool's idiom.
//
//   getSkin(id).describe(step, ctx) -> { title, subtitle, branchLabels? }
//   getSkin(id).paletteLabel(kind) -> string
//   layout: 'rail' (vertical cards), 'line' (horizontal nodes), 'code'

import { labSkin } from './lab.js'
import { powerAutomateSkin } from './powerAutomate.js'
import { makeSkin } from './make.js'
import { n8nSkin } from './n8n.js'
import { zapierSkin } from './zapier.js'

export const pythonSkin = {
  id: 'python',
  label: 'Python',
  layout: 'code',
  family: 'pro-code',
  paletteLabel(kind) {
    return {
      trigger: 'entry point (for rec in inbox)',
      lookup: 'find_one / find_all',
      transform: 'assignment',
      condition: 'if / else',
      approval: 'ask_approval()',
      send: 'send()',
      compose: 'render()',
      store: 'list.append()',
      stop: 'return',
    }[kind]
  },
  describe(step) {
    return labSkin.describe(step)
  },
}

export const SKINS = [labSkin, powerAutomateSkin, makeSkin, n8nSkin, zapierSkin, pythonSkin]

export function getSkin(id) {
  return SKINS.find((s) => s.id === id) || labSkin
}
