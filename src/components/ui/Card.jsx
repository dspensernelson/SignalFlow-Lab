const TONES = {
  default: 'bg-sf-surface border-sf-border',
  success: 'bg-sf-success-weak border-sf-complete',
  warning: 'bg-sf-warning-weak border-sf-warning',
  info: 'bg-sf-info-weak border-sf-info',
  subtle: 'bg-sf-surface-subtle border-sf-border-subtle',
}

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({
  tone = 'default',
  padding = 'md',
  accent,
  shadow = true,
  className = '',
  style,
  children,
  ...rest
}) {
  const accentStyle = accent
    ? { borderLeftColor: accent, borderLeftWidth: 4 }
    : null
  return (
    <div
      className={[
        'rounded-xl border transition-colors',
        TONES[tone] || TONES.default,
        PADDING[padding],
        shadow ? 'shadow-sf-sm' : '',
        className,
      ].join(' ')}
      style={{ ...accentStyle, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
