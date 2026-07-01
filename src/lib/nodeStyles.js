// Shared node-type accent colors, used by the graph nodes and the detail panel
// so a selected object and its panel read as the same thing.
// Values are aligned to the SignalFlow Lab design system (tokens/node-types.css).
export const TYPE_COLOR = {
  source: '#f59e0b',
  reference: '#8b5cf6',
  artifact: '#0891b2',
  process: '#6366f1',
  decision: '#eab308',
  handoff: '#14b8a6',
  output: '#22c55e',
  archive: '#a8a29e',
}

// Trusted-artifact emphasis: only when type === 'artifact' AND the node is complete.
// Uses an emerald fill accent with a cyan border, per the design system.
export const TRUSTED_ARTIFACT = {
  accent: '#059669', // emerald-600
  border: '#06b6d4', // cyan-500
}

// Returns the accent color for a node, applying trusted-artifact emphasis when a
// completed artifact should read as validated/safe-to-reuse.
export function accentForNode(type, isComplete) {
  if (type === 'artifact' && isComplete) return TRUSTED_ARTIFACT.accent
  return TYPE_COLOR[type] || '#9ca3af'
}
