import { useState } from 'react'
import { Icon } from '../components/ui'
import { SKINS } from '../runtime/skins/index.js'

// "View as" menu: the same flow, worn as each tool. Picking one re-describes
// every step in that tool's vocabulary and changes the layout to match.
export default function SkinSwitch({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const active = SKINS.find((s) => s.id === value) || SKINS[0]
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} title="See this flow in another tool" className="flex items-center gap-1.5 rounded-lg border border-sf-border bg-sf-surface px-2.5 py-1.5 text-xs hover:border-sf-border-strong">
        <span className="text-sf-subtle">View as</span>
        <span className="font-semibold text-sf-text">{active.label}</span>
        <Icon name="chevron-down" size={13} className="text-sf-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-sf-border bg-sf-surface p-1 shadow-sf-lg">
            {SKINS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="menuitemradio"
                aria-checked={value === s.id}
                onClick={() => {
                  onChange(s.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${value === s.id ? 'bg-sf-accent-weak font-semibold text-sf-text' : 'text-sf-body hover:bg-sf-surface-subtle'}`}
              >
                {s.label}
                {value === s.id && <Icon name="check" size={12} className="text-sf-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
