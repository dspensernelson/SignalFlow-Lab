import React from 'react'

/*
 * Section label — the tiny uppercase tracked eyebrow used to title panels and
 * sections all over the product ("WORKFLOW MAP", "PURPOSE", "CONCEPTS").
 */
export function SectionLabel({ children, as = 'h4', size = 'sm', className = '', style, ...rest }) {
  const Tag = as
  const fontSize = size === 'xs' ? 'var(--sf-text-9)' : 'var(--sf-text-10)'
  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        fontFamily: 'var(--sf-font-sans)',
        fontSize,
        fontWeight: 'var(--sf-weight-semibold)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--sf-tracking-wide)',
        color: 'var(--sf-text-subtle)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
