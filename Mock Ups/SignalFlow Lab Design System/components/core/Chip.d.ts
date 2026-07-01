import * as React from 'react'

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Render in the mono font (field names, filenames). Default false. */
  mono?: boolean
}

/** Muted concept tag used for lesson concepts and inline labels. */
export function Chip(props: ChipProps): JSX.Element
