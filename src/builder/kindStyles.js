// Visual identity per step kind, mapped onto the design system's node-type
// tokens so the builder reads as the same family as the canvas.

export const KIND_STYLE = {
  trigger: { icon: 'circle-play', color: 'var(--sf-type-source)' },
  lookup: { icon: 'database', color: 'var(--sf-type-reference)' },
  transform: { icon: 'braces', color: 'var(--sf-type-process)' },
  condition: { icon: 'git-branch', color: 'var(--sf-type-decision)' },
  approval: { icon: 'user-check', color: 'var(--sf-type-handoff)' },
  send: { icon: 'send', color: 'var(--sf-type-handoff)' },
  compose: { icon: 'file-text', color: 'var(--sf-type-artifact)' },
  store: { icon: 'archive', color: 'var(--sf-type-output)' },
  stop: { icon: 'minus', color: 'var(--sf-locked)' },
}

export function kindStyle(kind) {
  return KIND_STYLE[kind] || { icon: 'circle', color: 'var(--sf-border-strong)' }
}

export function tint(color, pct = 14) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

// Status of a step for the selected record after a run.
export const STATUS_STYLE = {
  succeeded: { icon: 'check', className: 'bg-sf-complete text-white' },
  failed: { icon: 'x', className: 'bg-sf-danger text-white' },
  skipped: { icon: 'minus', className: 'bg-sf-locked text-white' },
}
