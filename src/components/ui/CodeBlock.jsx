import { SectionLabel } from './SectionLabel'

export function CodeBlock({ children, wrap = false, label, className = '', style, ...rest }) {
  const text = typeof children === 'string' ? children : JSON.stringify(children, null, 2)
  return (
    <div className={className}>
      {label && <SectionLabel className="mb-1.5">{label}</SectionLabel>}
      <pre
        className={[
          'rounded-md border border-sf-border-subtle bg-sf-surface-subtle p-3',
          'font-mono text-sm leading-relaxed text-sf-body',
          wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre',
        ].join(' ')}
        style={style}
        {...rest}
      >
        {text}
      </pre>
    </div>
  )
}
