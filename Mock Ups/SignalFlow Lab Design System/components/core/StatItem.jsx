import React from 'react'
import { Icon } from './Icon'

/*
 * Stat item — the icon + big number + label metric used in the header summary
 * and the bottom "Workflow Health" bar. `tone` colors the icon + number.
 */
const TONES = {
  default:  'var(--sf-text)',
  complete: 'var(--sf-complete)',
  ready:    'var(--sf-ready)',
  progress: 'var(--sf-progress)',
  locked:   'var(--sf-locked)',
  accent:   'var(--sf-accent)',
}

export function StatItem({ icon, value, label, tone = 'default', className = '', style, ...rest }) {
  const color = TONES[tone] || TONES.default
  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sf-space-2_5)', ...style }}
      {...rest}
    >
      {icon && (
        <span style={{ color, display: 'inline-flex' }}>
          <Icon name={icon} size={22} strokeWidth={2} />
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontFamily: 'var(--sf-font-sans)', fontSize: 'var(--sf-text-xl)', fontWeight: 'var(--sf-weight-semibold)', color }}>
          {value}
        </span>
        <span style={{ fontFamily: 'var(--sf-font-sans)', fontSize: 'var(--sf-text-xs)', color: 'var(--sf-text-muted)' }}>
          {label}
        </span>
      </span>
    </div>
  )
}
