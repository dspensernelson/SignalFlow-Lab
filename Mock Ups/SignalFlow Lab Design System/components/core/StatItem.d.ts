import * as React from 'react'
import type { IconName } from './Icon'

export interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading icon. */
  icon?: IconName
  /** The metric value (number or short string). */
  value: React.ReactNode
  /** Caption under the value. */
  label: React.ReactNode
  /** Colors the icon + value. Default 'default'. */
  tone?: 'default' | 'complete' | 'ready' | 'progress' | 'locked' | 'accent'
}

/** Icon + value + label metric (header summary, Workflow Health bar). */
export function StatItem(props: StatItemProps): JSX.Element
