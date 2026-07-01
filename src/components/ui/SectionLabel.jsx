const SIZES = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
}

export function SectionLabel({ as: Tag = 'h4', size = 'sm', className = '', children, ...rest }) {
  return (
    <Tag
      className={[
        'font-semibold uppercase tracking-sf-wide text-sf-subtle',
        SIZES[size] || SIZES.sm,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
