import * as React from 'react'

export interface StepperProps {
  /** Ordered step labels. */
  steps: string[]
  /** Active step index (0-based). Earlier steps render as done. Default 0. */
  current?: number
  className?: string
  style?: React.CSSProperties
}

/** Horizontal step pills for the lesson flow (Intro → Exercise → Takeaway). */
export function Stepper(props: StepperProps): JSX.Element
