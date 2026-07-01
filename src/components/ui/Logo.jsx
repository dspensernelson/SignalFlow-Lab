// SignalFlow Lab brand lockup: a four-bar "live signal" glyph + wordmark.
export function Logo({ size = 24, showWordmark = true, wordmark = 'SignalFlow Lab', uppercase = false, className = '', ...rest }) {
  const bars = [0.45, 0.75, 1, 0.6]
  return (
    <span className={['inline-flex items-center gap-2', className].join(' ')} {...rest}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        {bars.map((h, i) => {
          const x = 2 + i * (24 * 0.16 + 24 * 0.06)
          const height = 20 * h
          return (
            <rect
              key={i}
              x={x}
              y={22 - height}
              width={24 * 0.16}
              height={height}
              rx={1}
              fill="var(--sf-accent)"
              opacity={0.55 + h * 0.45}
            />
          )
        })}
      </svg>
      {showWordmark && (
        <span
          className={[
            'font-bold text-sf-text',
            uppercase ? 'uppercase tracking-sf-wide text-sm' : 'text-base',
          ].join(' ')}
        >
          {wordmark}
        </span>
      )}
    </span>
  )
}
