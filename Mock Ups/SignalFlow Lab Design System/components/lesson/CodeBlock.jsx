import React from 'react'

/*
 * CodeBlock — the inset mono well the product uses for JSON examples, artifact
 * previews, and source notes. `wrap` keeps prose notes from overflowing.
 */
export function CodeBlock({ children, wrap = false, label, className = '', style, ...rest }) {
  return (
    <pre
      className={className}
      style={{
        margin: 0,
        padding: 'var(--sf-space-3)',
        borderRadius: 'var(--sf-radius-md)',
        background: 'var(--sf-surface-subtle)',
        border: '1px solid var(--sf-border-subtle)',
        color: 'var(--sf-text-body)',
        fontFamily: 'var(--sf-font-mono)',
        fontSize: 'var(--sf-text-sm)',
        lineHeight: 'var(--sf-leading-snug)',
        whiteSpace: wrap ? 'pre-wrap' : 'pre',
        overflow: 'auto',
        ...style,
      }}
      {...rest}
    >
      {typeof children === 'string' ? children : JSON.stringify(children, null, 2)}
    </pre>
  )
}
