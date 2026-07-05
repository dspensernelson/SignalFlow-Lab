import { Icon } from './Icon'

export function ValidationRow({ label, message, passed, hint, className = '', ...rest }) {
  return (
    <div
      className={[
        'rounded-md border px-3 py-2',
        passed
          ? 'border-sf-complete bg-sf-success-weak'
          : 'border-sf-danger bg-sf-danger-weak',
        className,
      ].join(' ')}
      {...rest}
    >
      <div className="flex items-start gap-2">
        <Icon
          name={passed ? 'circle-check' : 'x'}
          size={15}
          strokeWidth={2.25}
          className={passed ? 'text-sf-complete-text mt-0.5' : 'text-sf-danger mt-0.5'}
        />
        <div className="min-w-0">
          {label && (
            <span className={['text-[10px] font-semibold uppercase tracking-sf-wide', passed ? 'text-sf-complete-text' : 'text-sf-danger'].join(' ')}>
              {label}
            </span>
          )}
          <p className={['text-sm leading-snug', passed ? 'text-sf-complete-text' : 'text-sf-danger'].join(' ')}>{message}</p>
          {!passed && hint && <p className="mt-0.5 text-xs text-sf-muted">{hint}</p>}
        </div>
      </div>
    </div>
  )
}
