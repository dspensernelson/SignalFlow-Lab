import * as React from 'react'

export interface ThemeToggleProps {
  /** Current theme. Default 'light'. */
  value?: 'light' | 'dark'
  /** Called with the next theme id when a segment is clicked. */
  onChange?: (value: 'light' | 'dark') => void
  className?: string
  style?: React.CSSProperties
}

/** Segmented Light/Dark control from the product top bar (controlled). */
export function ThemeToggle(props: ThemeToggleProps): JSX.Element
