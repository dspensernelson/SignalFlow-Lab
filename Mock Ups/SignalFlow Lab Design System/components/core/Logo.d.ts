import * as React from 'react'

export interface LogoProps {
  /** Square px size of the bars glyph. Default 28. */
  size?: number
  /** Show the wordmark beside the glyph. Default true. */
  showWordmark?: boolean
  /** Wordmark text. Default "SignalFlow Lab". */
  wordmark?: string
  /** Render the wordmark as an uppercase tracked label (header style). Default false. */
  uppercase?: boolean
  /** Glyph color. Default var(--sf-accent). */
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * SignalFlow Lab brand mark: signal-bars glyph + optional wordmark.
 * @startingPoint section="Brand" subtitle="Logo lockup, glyph + wordmark" viewport="360x80"
 */
export function Logo(props: LogoProps): JSX.Element
