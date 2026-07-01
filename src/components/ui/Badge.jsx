import { Icon } from './Icon'

const TONES = {
  ready: 'bg-sf-ready-weak text-sf-ready-text',
  progress: 'bg-sf-progress-weak text-sf-progress-text',
  complete: 'bg-sf-complete-weak text-sf-complete-text',
  context: 'bg-sf-context-weak text-sf-context-text',
  locked: 'bg-sf-locked-weak text-sf-muted',
  neutral: 'bg-sf-surface-inset text-sf-muted',
  info: 'bg-sf-info-weak text-sf-info',
  'needs-inputs': 'bg-sf-needs-inputs-weak text-sf-needs-inputs-text',
  trusted: 'bg-sf-trusted-weak text-sf-trusted-text',
}

export function Badge({ tone = 'neutral', icon, className = '', children, ...rest }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-[9px] font-bold uppercase tracking-sf-wide leading-none',
        TONES[tone] || TONES.neutral,
        className,
      ].join(' ')}
      {...rest}
    >
      {icon && <Icon name={icon} size={10} strokeWidth={2.5} />}
      {children}
    </span>
  )
}
