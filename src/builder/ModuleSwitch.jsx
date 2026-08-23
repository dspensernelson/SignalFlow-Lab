import { useState } from 'react'
import { Icon } from '../components/ui'

// Module switcher for the shell header. Runnable-flow modules first, then
// the worksheet modules still waiting to be ported, then planned ones.
export default function ModuleSwitch({ projects, value, flowModuleIds = [], hasData, onChange }) {
  const [open, setOpen] = useState(false)
  const active = projects.find((p) => p.id === value)
  const group = (p) => (flowModuleIds.includes(p.id) ? 0 : hasData(p.id) ? 1 : 2)
  const sorted = [...projects].sort((a, b) => group(a) - group(b))
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-sf-border bg-sf-surface-subtle px-2.5 py-1 text-left hover:border-sf-border-strong">
        <div className="leading-tight">
          <div className="text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Module</div>
          <div className="max-w-[200px] truncate text-sm font-semibold text-sf-text">{active ? active.name : value}</div>
        </div>
        <Icon name="chevron-down" size={14} className="text-sf-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full z-40 mt-1 w-80 rounded-xl border border-sf-border bg-sf-surface p-1.5 shadow-sf-lg">
            {sorted.map((p) => {
              const g = group(p)
              const disabled = g === 2
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false)
                    onChange(p.id)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${p.id === value ? 'bg-sf-accent-weak' : 'hover:bg-sf-surface-subtle'} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-md ${g === 0 ? 'bg-sf-accent text-white' : g === 1 ? 'bg-sf-surface-inset text-sf-muted' : 'border border-sf-border text-sf-subtle'}`}>
                    <Icon name={g === 0 ? 'circle-play' : g === 1 ? 'clipboard-list' : 'lock'} size={11} />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-xs font-semibold text-sf-text">{p.name}</span>
                    <span className="block truncate text-[10px] text-sf-subtle">{g === 0 ? 'runnable flows' : g === 1 ? 'worksheet lessons (porting next)' : 'planned'}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
