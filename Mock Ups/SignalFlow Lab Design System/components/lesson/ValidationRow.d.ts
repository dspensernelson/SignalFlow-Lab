import * as React from 'react'

export interface ValidationRowProps {
  /** Field/check name (bolded). */
  label?: string
  /** Result message. */
  message: React.ReactNode
  /** Pass (green) vs fail (red). Default false. */
  passed?: boolean
  /** Corrective hint, shown only when not passed. */
  hint?: string
  className?: string
  style?: React.CSSProperties
}

/** One deterministic validation result row (pass/fail) for the lesson results pane. */
export function ValidationRow(props: ValidationRowProps): JSX.Element
