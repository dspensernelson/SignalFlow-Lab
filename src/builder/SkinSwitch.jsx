import { SKINS } from '../runtime/skins/index.js'

// Segmented control: the same flow, worn as each tool. Flipping it re-describes
// every step in that tool's vocabulary and changes the layout to match.
export default function SkinSwitch({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-sf-border bg-sf-surface-subtle p-0.5" role="group" aria-label="View as tool">
      <span className="hidden px-1.5 text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle 2xl:inline">View as</span>
      {SKINS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          aria-pressed={value === s.id}
          title={`See this flow as ${s.label}`}
          className={`whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-medium transition-colors ${
            value === s.id ? 'bg-sf-surface text-sf-text shadow-sf-sm' : 'text-sf-muted hover:text-sf-text'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
