import React from 'react'
import { Icon } from './Icon'

/*
 * Status / lesson badge — the small rounded-full pill the product uses to mark
 * a node's progress or a lesson's maturity. Tone maps to a semantic token pair.
 */
const TONES = {
  context:  { bg: 'var(--sf-context-weak)',  fg: 'var(--sf-context-text)' },
  locked:   { bg: 'var(--sf-locked-weak)',   fg: 'var(--sf-text-muted)' },
  ready:    { bg: 'var(--sf-ready-weak)',     fg: 'var(--sf-ready-text)' },
  progress: { bg: 'var(--sf-progress-weak)',  fg: 'var(--sf-progress-text)' },
  complete: { bg: 'var(--sf-complete-weak)',  fg: 'var(--sf-complete-text)' },
  info:     { bg: 'var(--sf-info-weak)',      fg: 'var(--sf-info)' },
  neutral:  { bg: 'var(--sf-surface-inset)',  fg: 'var(--sf-text-muted)' },
}

export function Badge({ children, tone = 'neutral', icon, className = '', style, ...rest }) {
  const t = TONES[tone] || TONES.neutral
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--sf-radius-full)',
        background: t.bg,
        color: t.fg,
        fontFamily: 'var(--sf-font-sans)',
        fontSize: 'var(--sf-text-9)',
        fontWeight: 'var(--sf-weight-semibold)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={11} strokeWidth={2.5} />}
      {children}
    </span>
  )
}
