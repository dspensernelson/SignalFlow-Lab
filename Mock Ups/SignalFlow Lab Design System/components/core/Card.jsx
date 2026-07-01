import React from 'react'

/*
 * Surface card — the workspace panel primitive. Hairline border, soft radius,
 * subtle shadow. `accent` adds the left type-color strip the node-detail panel
 * uses; `tone` tints the whole card for success/notice surfaces.
 */
const TONES = {
  default: { bg: 'var(--sf-surface)', border: 'var(--sf-border)' },
  success: { bg: 'var(--sf-success-weak)', border: 'var(--sf-green-300)' },
  warning: { bg: 'var(--sf-warning-weak)', border: 'var(--sf-amber-300)' },
  info:    { bg: 'var(--sf-info-weak)', border: 'var(--sf-indigo-200)' },
  subtle:  { bg: 'var(--sf-surface-subtle)', border: 'var(--sf-border)' },
}

const PADS = { sm: 'var(--sf-space-3)', md: 'var(--sf-space-4)', lg: 'var(--sf-space-5)' }

export function Card({
  children,
  tone = 'default',
  padding = 'md',
  accent,
  shadow = true,
  className = '',
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.default
  return (
    <div
      className={className}
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderLeft: accent ? `var(--sf-border-accent) solid ${accent}` : `1px solid ${t.border}`,
        borderRadius: 'var(--sf-radius-xl)',
        padding: PADS[padding] || PADS.md,
        boxShadow: shadow ? 'var(--sf-shadow-sm)' : 'none',
        color: 'var(--sf-text-body)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
