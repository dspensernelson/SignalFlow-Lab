import * as React from 'react'

export type IconName =
  | 'file-text' | 'flag' | 'database' | 'braces' | 'activity' | 'line-chart'
  | 'shield' | 'triangle-alert' | 'user-check' | 'send' | 'archive'
  | 'workflow' | 'git-branch' | 'layers'
  | 'circle-check' | 'circle-check-big' | 'circle-play' | 'clock' | 'lock'
  | 'rotate-cw' | 'check' | 'x' | 'copy' | 'plus' | 'minus'
  | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'chevron-right'
  | 'maximize' | 'circle-help' | 'clipboard-list' | 'sun' | 'moon' | 'circle'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Which glyph to render. */
  name: IconName
  /** Square px size. Default 16. */
  size?: number
  /** Stroke weight. Default 2. */
  strokeWidth?: number
}

/** Line icon from the curated Lucide subset; inherits `currentColor`. */
export function Icon(props: IconProps): JSX.Element | null

/** Every available icon name, for tooling/specimens. */
export const ICON_NAMES: IconName[]
