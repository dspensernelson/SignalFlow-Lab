import React from 'react'
import { Icon } from '../core/Icon'

/*
 * ValidationRow — one deterministic check result, pass (green) or fail (red),
 * with an optional hint shown only on failure. Used in the lesson's results pane.
 */
export function ValidationRow({ label, message, passed = false, hint, className = '', style }) {
  const skin = passed
    ? { border: 'var(--sf-green-300)', bg: 'var(--sf-success-weak)', fg: 'var(--sf-complete-text)' }
    : { border: 'var(--sf-red-200)', bg: 'var(--sf-danger-weak)', fg: 'var(--sf-danger)' }
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 12px',
        borderRadius: 'var(--sf-radius-md)',
        border: `1px solid ${skin.border}`,
        background: skin.bg,
        color: skin.fg,
        fontFamily: 'var(--sf-font-sans)',
        fontSize: 'var(--sf-text-sm)',
        ...style,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ display: 'inline-flex', marginTop: '1px' }}>
          <Icon name={passed ? 'check' : 'x'} size={15} strokeWidth={2.5} />
        </span>
        <span style={{ lineHeight: 'var(--sf-leading-snug)' }}>
          {label && <span style={{ fontWeight: 'var(--sf-weight-semibold)' }}>{label}: </span>}
          {message}
        </span>
      </span>
      {!passed && hint && (
        <span style={{ paddingLeft: '23px', fontSize: 'var(--sf-text-xs)', color: 'var(--sf-danger)' }}>
          Hint: {hint}
        </span>
      )}
    </div>
  )
}
