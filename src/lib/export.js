// "Download everything I built" export. Gathers the trusted artifacts the
// learner produced in the active project + tier into two portable files: a
// machine-readable JSON bundle and a human-readable markdown summary. Purely
// client-side (Blob + anchor download), so it runs entirely in the browser.

import { STATUS } from './progress'

// Renders an artifact value as fenced code text. Artifacts are stored either as
// preformatted strings or as objects; objects are pretty-printed as JSON.
function artifactText(artifact) {
  return typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Builds the export payload for the active project/tier: only nodes that are
// complete AND have a saved artifact are included.
export function buildExport({ projectName, tier, tierLabel, nodes, progress, artifacts }) {
  const built = nodes.filter(
    (n) => progress[n.id] === STATUS.COMPLETE && artifacts[n.id] != null
  )
  const exportedAt = new Date().toISOString()

  const json = JSON.stringify(
    {
      tool: 'SignalFlow Lab',
      project: projectName,
      tier,
      exportedAt,
      artifactCount: built.length,
      artifacts: built.map((n) => ({
        id: n.id,
        label: n.label,
        name: n.artifactName || null,
        artifact: artifacts[n.id],
      })),
    },
    null,
    2
  )

  const lines = [
    `# ${projectName} - ${tierLabel} tier`,
    '',
    `Everything you built in SignalFlow Lab. Exported ${exportedAt}.`,
    '',
    `**${built.length}** trusted artifact${built.length === 1 ? '' : 's'}.`,
    '',
  ]
  for (const n of built) {
    lines.push(`## ${n.label}`)
    if (n.artifactName) lines.push('', `\`${n.artifactName}\``)
    lines.push('', '```', artifactText(artifacts[n.id]), '```', '')
  }
  const markdown = lines.join('\n')

  const base = `${slugify(projectName) || 'signalflow'}-${tier}-artifacts`
  return { json, markdown, base, count: built.length }
}

// Triggers a browser download of text content as a file.
export function downloadText(filename, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
