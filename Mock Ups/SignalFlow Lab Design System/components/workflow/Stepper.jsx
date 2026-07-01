import React from 'react'
import { Icon } from '../core/Icon'

/*
 * Stepper — the Intro → Exercise → Takeaway progress pills from the lesson
 * workspace. Pass ordered `steps` and the active index.
 */
export function Stepper({ steps = [], current = 0, className = '', style }) {
  return (
    <ol
      className={className}
      aria-label="Lesson steps"
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sf-space-2)', listStyle: 'none', margin: 0, padding: 0 }}
    >
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const colors = active
          ? { border: 'var(--sf-accent)', bg: 'var(--sf-accent-weak)', fg: 'var(--sf-accent-text)' }
          : done
            ? { border: 'var(--sf-green-300)', bg: 'var(--sf-success-weak)', fg: 'var(--sf-complete-text)' }
            : { border: 'var(--sf-border)', bg: 'var(--sf-surface)', fg: 'var(--sf-text-muted)' }
        return (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sf-space-2)' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--sf-radius-full)',
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              color: colors.fg,
              fontFamily: 'var(--sf-font-sans)',
              fontSize: 'var(--sf-text-xs)',
              fontWeight: 'var(--sf-weight-medium)',
            }}>
              <span style={{ display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
                {done ? <Icon name="check" size={13} strokeWidth={2.5} /> : i + 1}
              </span>
              {label}
            </span>
            {i < steps.length - 1 && (
              <span style={{ color: 'var(--sf-text-subtle)', display: 'inline-flex' }}>
                <Icon name="arrow-right" size={14} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
