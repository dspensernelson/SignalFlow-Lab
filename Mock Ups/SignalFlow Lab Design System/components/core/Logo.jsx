import React from 'react'

/*
 * SignalFlow Lab brand mark — an equalizer / "signal bars" glyph in brand blue,
 * recreated from the product's reference screenshots (the repo ships no logo
 * file of its own). Pair with the "SignalFlow Lab" wordmark.
 */
export function Logo({
  size = 28,
  showWordmark = true,
  wordmark = 'SignalFlow Lab',
  uppercase = false,
  color = 'var(--sf-accent)',
  className = '',
  style,
}) {
  // Four bars of varying height, like a live signal / equalizer.
  const bars = [
    { x: 1, y: 9, h: 11 },
    { x: 7, y: 4, h: 16 },
    { x: 13, y: 12, h: 8 },
    { x: 19, y: 6, h: 14 },
  ]
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sf-space-2_5)', ...style }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={4}
            height={b.h}
            rx={1.5}
            fill={color}
            opacity={i === 1 ? 1 : 0.55 + i * 0.12}
          />
        ))}
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--sf-font-sans)',
            fontWeight: 'var(--sf-weight-semibold)',
            fontSize: uppercase ? 'var(--sf-text-sm)' : 'var(--sf-text-lg)',
            letterSpacing: uppercase ? 'var(--sf-tracking-widest)' : '-0.01em',
            textTransform: uppercase ? 'uppercase' : 'none',
            color: 'var(--sf-text)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {wordmark}
        </span>
      )}
    </span>
  )
}
