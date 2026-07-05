import * as React from 'react'

export interface SectionLabelProps extends React.HTMLAttributes<HTMLElement> {
  /** Element tag. Default 'h4'. */
  as?: keyof JSX.IntrinsicElements
  /** 'sm' (10px) or 'xs' (9px). Default 'sm'. */
  size?: 'sm' | 'xs'
}

/** Tiny uppercase tracked eyebrow used to title panels/sections. */
export function SectionLabel(props: SectionLabelProps): JSX.Element
