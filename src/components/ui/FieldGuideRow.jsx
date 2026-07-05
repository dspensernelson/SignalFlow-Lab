export function FieldGuideRow({ field, type, meaning, example, hint, divider = true, className = '', ...rest }) {
  return (
    <div
      className={[
        divider ? 'border-t border-sf-border-subtle pt-2.5 mt-2.5 first:border-t-0 first:pt-0 first:mt-0' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      <div className="flex items-center justify-between gap-2">
        <code className="rounded bg-sf-surface-inset px-1.5 py-0.5 font-mono text-xs text-sf-body">{field}</code>
        {type && <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{type}</span>}
      </div>
      {meaning && <p className="mt-1 text-sm leading-snug text-sf-body">{meaning}</p>}
      {example && (
        <p className="mt-0.5 font-mono text-xs text-sf-muted">
          {example}
        </p>
      )}
      {hint && (
        <p className="mt-0.5 text-xs text-sf-muted">
          <span className="font-semibold">Hint:</span> {hint}
        </p>
      )}
    </div>
  )
}
