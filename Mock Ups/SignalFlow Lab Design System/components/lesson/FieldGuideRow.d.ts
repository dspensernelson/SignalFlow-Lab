import * as React from 'react'

export interface FieldGuideRowProps {
  /** Field name (rendered as a mono chip). */
  field: string
  /** JSON type label (string/boolean/number…). */
  type?: string
  /** Plain-language meaning. */
  meaning?: string
  /** Example value. */
  example?: React.ReactNode
  /** Teaching hint. */
  hint?: string
  /** Show the top divider. Default true; set false on the first row. */
  divider?: boolean
  className?: string
  style?: React.CSSProperties
}

/** One field reference row in a lesson's Field Guide. */
export function FieldGuideRow(props: FieldGuideRowProps): JSX.Element
