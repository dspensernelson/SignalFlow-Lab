import React from 'react'

/*
 * Concept chip / tag — the muted pills used for lesson concepts and inline tags.
 * `mono` renders a field name or filename in the code font.
 */
export function Chip({ children, mono = false, className = '', style, ...rest }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: 'var(--sf-radius-sm)',
        background: 'var(--sf-surface-inset)',
        color: 'var(--sf-text-muted)',
        fontFamily: mono ? 'var(--sf-font-mono)' : 'var(--sf-font-sans)',
        fontSize: 'var(--sf-text-10)',
        fontWeight: mono ? 'var(--sf-weight-normal)' : 'var(--sf-weight-medium)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
