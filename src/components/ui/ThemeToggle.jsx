import { Icon } from './Icon'

// Segmented Light/Dark control. Controlled: parent flips the theme in onChange.
export function ThemeToggle({ value = 'light', onChange, className = '', ...rest }) {
  const options = [
    { key: 'light', icon: 'sun', label: 'Light' },
    { key: 'dark', icon: 'moon', label: 'Dark' },
  ]
  return (
    <div
      className={[
        'inline-flex items-center gap-0.5 rounded-lg border border-sf-border bg-sf-surface-inset p-0.5',
        className,
      ].join(' ')}
      role="group"
      aria-label="Theme"
      {...rest}
    >
      {options.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange && onChange(opt.key)}
            aria-pressed={active}
            className={[
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active ? 'bg-sf-surface text-sf-text shadow-sf-sm' : 'text-sf-muted hover:text-sf-body',
            ].join(' ')}
          >
            <Icon name={opt.icon} size={13} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
