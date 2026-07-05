import { Icon } from './Icon'

// Directional signal-flow connector used between cards/sections so the
// source -> artifact -> consumer movement reads explicitly (not tiny glyphs).
// Tones map to the DS edge semantics.
const TONE = {
  upstream: 'var(--sf-edge-upstream)', // amber — raw source signal
  downstream: 'var(--sf-edge-downstream)', // cyan — signal path forward
  completed: 'var(--sf-edge-completed)', // emerald — trusted/validated path
  trusted: 'var(--sf-artifact-trusted)', // emerald — trusted artifact
  muted: 'var(--sf-edge-muted)', // slate — idle/future
}

export function FlowConnector({
  tone = 'downstream',
  label,
  vertical = false,
  length = 46,
  weight = 1.75,
  className = '',
  ...rest
}) {
  const color = TONE[tone] || TONE.downstream

  if (vertical) {
    const end = length
    return (
      <div className={['flex flex-col items-center justify-center', className].join(' ')} aria-hidden="true" {...rest}>
        <svg width="18" height={end} viewBox={`0 0 18 ${end}`} fill="none">
          <line x1="9" y1="2" x2="9" y2={end - 8} stroke={color} strokeWidth={weight} strokeLinecap="round" />
          <path
            d={`M5 ${end - 10} L9 ${end - 2} L13 ${end - 10}`}
            stroke={color}
            strokeWidth={weight}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label && (
          <span className="mt-1 text-[9px] font-medium uppercase tracking-sf-wide opacity-80" style={{ color }}>
            {label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={['flex flex-col items-center justify-center', className].join(' ')} aria-hidden="true" {...rest}>
      {label && (
        <span className="mb-1 text-[9px] font-medium uppercase tracking-sf-wide opacity-80" style={{ color }}>
          {label}
        </span>
      )}
      <svg width={length} height="16" viewBox={`0 0 ${length} 16`} fill="none">
        <line x1="2" y1="8" x2={length - 7} y2="8" stroke={color} strokeWidth={weight} strokeLinecap="round" />
        <path
          d={`M${length - 11} 3.5 L${length - 2} 8 L${length - 11} 12.5`}
          stroke={color}
          strokeWidth={weight}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// Small inline directional pill (icon + label) for section headers like
// "Depends on" (upstream) / "Feeds into" (downstream).
export function FlowTag({ tone = 'downstream', direction = 'right', label, className = '' }) {
  const color = TONE[tone] || TONE.downstream
  const icon = direction === 'left' ? 'arrow-left' : direction === 'down' ? 'chevron-down' : 'arrow-right'
  return (
    <span
      className={['inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-sf-wide', className].join(' ')}
      style={{ color }}
    >
      <Icon name={icon} size={12} strokeWidth={2.5} />
      {label}
    </span>
  )
}
