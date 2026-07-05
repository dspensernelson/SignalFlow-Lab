export function Chip({ mono = false, className = '', children, ...rest }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] leading-none',
        'bg-sf-surface-inset text-sf-muted',
        mono ? 'font-mono' : 'font-medium',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}
