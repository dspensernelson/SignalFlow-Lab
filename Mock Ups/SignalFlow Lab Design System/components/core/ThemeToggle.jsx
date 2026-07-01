import React from 'react'
import { Icon } from './Icon'

/*
 * Light / Dark theme toggle — the segmented control from the product top bar.
 * Controlled: pass `value` ('light' | 'dark') and `onChange`.
 */
export function ThemeToggle({ value = 'light', onChange, className = '', style }) {
  const options = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
  ]
  return (
    <div
      className={className}
      role="group"
      aria-label="Theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: 'var(--sf-radius-lg)',
        background: 'var(--sf-surface-inset)',
        border: '1px solid var(--sf-border)',
        ...style,
      }}
    >
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange && onChange(o.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--sf-radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--sf-font-sans)',
              fontSize: 'var(--sf-text-xs)',
              fontWeight: 'var(--sf-weight-medium)',
              background: active ? 'var(--sf-surface)' : 'transparent',
              color: active ? 'var(--sf-text)' : 'var(--sf-text-muted)',
              boxShadow: active ? 'var(--sf-shadow-sm)' : 'none',
              transition: 'background .15s ease, color .15s ease',
            }}
          >
            <Icon name={o.icon} size={14} />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
