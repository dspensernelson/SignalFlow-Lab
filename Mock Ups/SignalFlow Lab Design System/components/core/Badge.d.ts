import * as React from 'react'
import type { IconName } from './Icon'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status/lesson tone → semantic color pair. Default 'neutral'. */
  tone?: 'context' | 'locked' | 'ready' | 'progress' | 'complete' | 'info' | 'neutral'
  /** Optional leading icon. */
  icon?: IconName
}

/** Small rounded-full status pill (node progress, lesson maturity). */
export function Badge(props: BadgeProps): JSX.Element
