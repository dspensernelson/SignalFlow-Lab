import { Icon } from './Icon'

const TONES = {
  default: 'text-sf-body',
  complete: 'text-sf-complete-text',
  ready: 'text-sf-ready-text',
  progress: 'text-sf-progress-text',
  locked: 'text-sf-muted',
  accent: 'text-sf-accent',
}

export function StatItem({ icon, value, label, tone = 'default', className = '', ...rest }) {
  const toneClass = TONES[tone] || TONES.default
  return (
    <div className={['inline-flex items-center gap-2', className].join(' ')} {...rest}>
      {icon && <Icon name={icon} size={18} className={toneClass} />}
      <div className="flex items-baseline gap-1.5">
        <span className={['text-xl font-semibold leading-none', toneClass].join(' ')}>{value}</span>
        {label && <span className="text-xs text-sf-muted">{label}</span>}
      </div>
    </div>
  )
}
