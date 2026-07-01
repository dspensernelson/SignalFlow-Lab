import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface tint. Default 'default' (white/ink). */
  tone?: 'default' | 'success' | 'warning' | 'info' | 'subtle'
  /** Inner padding. Default 'md'. */
  padding?: 'sm' | 'md' | 'lg'
  /** Left type-accent strip color (e.g. var(--sf-type-artifact)). */
  accent?: string
  /** Drop the soft shadow. Default true (shadow on). */
  shadow?: boolean
}

/**
 * The workspace panel primitive: hairline border, soft radius, subtle shadow.
 * @startingPoint section="Surfaces" subtitle="Card panel with tones & accent" viewport="700x220"
 */
export function Card(props: CardProps): JSX.Element
