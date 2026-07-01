import * as React from 'react'

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  /** A string, or any value (it will be JSON.stringified). */
  children: React.ReactNode
  /** Wrap long lines (for prose source notes). Default false. */
  wrap?: boolean
}

/** Inset mono well for JSON examples, artifact previews, and source notes. */
export function CodeBlock(props: CodeBlockProps): JSX.Element
