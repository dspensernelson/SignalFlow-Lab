import * as React from 'react'
import type { IconName } from './Icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Action emphasis. Default 'primary'. */
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'ghost' | 'link'
  /** Default 'md'. */
  size?: 'sm' | 'md'
  /** Leading icon name. */
  icon?: IconName
  /** Trailing icon name (e.g. 'arrow-right'). */
  iconRight?: IconName
  /** Stretch to container width. */
  fullWidth?: boolean
}

/**
 * Primary action control for SignalFlow Lab.
 * @startingPoint section="Controls" subtitle="Button variants & sizes" viewport="700x180"
 */
export function Button(props: ButtonProps): JSX.Element
