import React from 'react'

/*
 * FieldGuideRow — one entry in a lesson's Field Guide: the field name (mono
 * chip), its JSON type, plain-language meaning, an example, and a hint.
 */
export function FieldGuideRow({ field, type, meaning, example, hint, divider = true, className = '', style }) {
  return (
    <div
      className={className}
      style={{
        paddingTop: divider ? 'var(--sf-space-3)' : 0,
        borderTop: divider ? '1px solid var(--sf-border-subtle)' : 'none',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sf-space-2)' }}>
        <code style={{
          padding: '2px 6px',
          borderRadius: 'var(--sf-radius-sm)',
          background: 'var(--sf-surface-inset)',
          fontFamily: 'var(--sf-font-mono)',
          fontSize: 'var(--sf-text-xs)',
          color: 'var(--sf-text)',
        }}>
          {field}
        </code>
        {type && (
          <span style={{
            fontSize: 'var(--sf-text-10)',
            fontWeight: 'var(--sf-weight-medium)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--sf-tracking-wide)',
            color: 'var(--sf-text-subtle)',
          }}>
            {type}
          </span>
        )}
      </div>
      {meaning && (
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--sf-font-sans)', fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-body)', lineHeight: 'var(--sf-leading-snug)' }}>
          {meaning}
        </p>
      )}
      {example != null && (
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--sf-font-sans)', fontSize: 'var(--sf-text-xs)', color: 'var(--sf-text-muted)' }}>
          Example: <span style={{ fontFamily: 'var(--sf-font-mono)', color: 'var(--sf-text-body)' }}>{example}</span>
        </p>
      )}
      {hint && (
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--sf-font-sans)', fontSize: 'var(--sf-text-xs)', color: 'var(--sf-text-muted)' }}>
          Hint: {hint}
        </p>
      )}
    </div>
  )
}
