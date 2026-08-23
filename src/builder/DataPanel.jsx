import { useState } from 'react'
import { Icon } from '../components/ui'

// Today's world: what arrives, and what the reference tables hold before the
// run. Read-only. The learner reads this the way they would read the systems
// at work: to find out what fields exist and what the data looks like.

function Table({ rows, fields }) {
  if (!rows.length) return <p className="px-2 py-1 text-[11px] text-sf-subtle">empty</p>
  const cols = (fields && fields.length ? fields : Object.keys(rows[0])).filter((c) => rows.some((r) => r[c] !== undefined && typeof r[c] !== 'object'))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-[9px] uppercase tracking-sf-wide text-sf-subtle">
            {cols.map((c) => (
              <th key={c} className="px-2 py-1 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-sf-border-subtle">
              {cols.map((c) => (
                <td key={c} className="px-2 py-1 font-mono text-sf-body">
                  {r[c] === undefined || r[c] === null ? <span className="text-sf-subtle">-</span> : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Block({ title, subtitle, count, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="rounded-lg border border-sf-border bg-sf-surface">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-sf-text">{title}</span>
          <span className="ml-1 rounded-full bg-sf-surface-inset px-1.5 text-[10px] text-sf-muted">{count}</span>
          {subtitle && <div className="truncate text-[10px] text-sf-subtle">{subtitle}</div>}
        </div>
        <Icon name="chevron-down" size={12} className={`flex-none text-sf-muted transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="border-t border-sf-border-subtle">{children}</div>}
    </div>
  )
}

export default function DataPanel({ dayState, moduleData }) {
  const day = moduleData.days.find((d) => d.id === dayState.dayId)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-sf-body">{day ? day.description : ''}</p>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Arrives today</span>
      {(moduleData.sources || []).map((s) => (
        <Block key={s.id} title={s.label} subtitle={s.description} count={dayState.sources[s.id].rows.length} defaultOpen>
          <Table rows={dayState.sources[s.id].rows} fields={s.fields} />
        </Block>
      ))}
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Tables before the run</span>
      {(moduleData.stores || []).map((s) => (
        <Block key={s.id} title={s.label} subtitle={`${s.owner ? `Owned by ${s.owner}. ` : ''}${s.description || ''}`} count={(dayState.stores[s.id] || []).length}>
          <Table rows={dayState.stores[s.id] || []} fields={s.fields} />
        </Block>
      ))}
    </div>
  )
}
