import React from 'react'
import { Icon } from './Icon'

/*
 * SignalFlow Lab button.
 * Variants mirror the product's action language: primary (blue), success
 * (emerald), warning (amber), neutral (hairline border), ghost, and link.
 */
const SIZES = {
  sm: { padding: '6px 12px', fontSize: 'var(--sf-text-xs)', gap: '6px', icon: 14, radius: 'var(--sf-radius-md)' },
  md: { padding: '8px 16px', fontSize: 'var(--sf-text-sm)', gap: '8px', icon: 16, radius: 'var(--sf-radius-lg)' },
}

function variantStyle(variant) {
  switch (variant) {
    case 'success':
      return { background: 'var(--sf-success)', color: '#fff', border: '1px solid transparent', '--hov': 'var(--sf-emerald-700)' }
    case 'warning':
      return { background: 'var(--sf-progress)', color: '#fff', border: '1px solid transparent', '--hov': 'var(--sf-amber-600)' }
    case 'neutral':
      return { background: 'var(--sf-surface)', color: 'var(--sf-text-body)', border: '1px solid var(--sf-border-strong)', '--hov': 'var(--sf-surface-subtle)' }
    case 'ghost':
      return { background: 'transparent', color: 'var(--sf-text-body)', border: '1px solid transparent', '--hov': 'var(--sf-surface-subtle)' }
    case 'link':
      return { background: 'transparent', color: 'var(--sf-accent-text)', border: '1px solid transparent', padding: '0', '--hov': 'transparent' }
    case 'primary':
    default:
      return { background: 'var(--sf-accent)', color: '#fff', border: '1px solid transparent', '--hov': 'var(--sf-accent-hover)' }
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md
  const v = variantStyle(variant)
  const isLink = variant === 'link'

  const [hover, setHover] = React.useState(false)
  const bg = hover && !disabled && v['--hov'] !== 'transparent' ? v['--hov'] : v.background

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        display: isLink ? 'inline-flex' : fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: isLink ? 0 : s.padding,
        fontFamily: 'var(--sf-font-sans)',
        fontSize: s.fontSize,
        fontWeight: 'var(--sf-weight-semibold)',
        lineHeight: 1.1,
        color: v.color,
        background: bg,
        border: v.border,
        borderRadius: isLink ? 0 : s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textDecoration: isLink && hover && !disabled ? 'underline' : 'none',
        boxShadow: variant === 'neutral' || variant === 'primary' ? 'var(--sf-shadow-sm)' : 'none',
        transition: 'background .15s ease, opacity .15s ease, color .15s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </button>
  )
}
