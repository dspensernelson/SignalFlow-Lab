import { Icon } from './Icon'

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
}

const VARIANTS = {
  primary: 'bg-sf-accent text-white hover:bg-sf-accent-hover shadow-sf-sm',
  success: 'bg-sf-complete text-white hover:opacity-90',
  warning: 'bg-sf-warning text-white hover:opacity-90',
  neutral: 'bg-sf-surface text-sf-body border border-sf-border-strong hover:bg-sf-surface-subtle',
  ghost: 'bg-transparent text-sf-body border border-sf-border hover:bg-sf-surface-subtle',
  link: 'bg-transparent text-sf-accent hover:underline !px-0 !py-0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const iconSize = size === 'sm' ? 14 : 16
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sf-ring focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        SIZES[size],
        VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  )
}
