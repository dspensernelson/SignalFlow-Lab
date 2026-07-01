import React from 'react'
import { Icon } from './Icon'

export function Stepper({ steps = [], current = 0, className = '', ...rest }) {
  return (
    <div className={['inline-flex items-center gap-1.5', className].join(' ')} {...rest}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={label}>
            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                done
                  ? 'border-transparent bg-sf-success-weak text-sf-complete-text'
                  : active
                    ? 'border-transparent bg-sf-accent-weak text-sf-accent-text'
                    : 'border-sf-border bg-sf-surface text-sf-muted',
              ].join(' ')}
            >
              {done ? (
                <Icon name="check" size={12} strokeWidth={2.5} />
              ) : (
                <span
                  className={[
                    'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                    active ? 'bg-sf-accent text-white' : 'bg-sf-surface-inset text-sf-muted',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
              )}
              {label}
            </span>
            {i < steps.length - 1 && <Icon name="chevron-right" size={14} className="text-sf-subtle" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
