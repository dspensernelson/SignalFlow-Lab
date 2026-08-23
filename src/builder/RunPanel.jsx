import { useState } from 'react'
import { Icon } from '../components/ui'
import { findStep } from '../runtime/flowModel.js'
import { kindStyle, STATUS_STYLE } from './kindStyles.js'

// The run: what happened to every record, step by step, and what the run
// left behind (stores, outbox, alerts). Select a record to light up its path
// on the flow.

function terminalBadge(rt, moduleData) {
  const t = rt.terminal || {}
  const storeLabel = (id) => {
    const d = (moduleData.stores || []).find((s) => s.id === id)
    return d ? d.label : id
  }
  if (t.type === 'store') {
    const def = (moduleData.stores || []).find((s) => s.id === t.target)
    const toneId = def && def.tone ? def.tone : 'neutral'
    const tone = toneId === 'good' ? 'bg-sf-complete-weak text-sf-complete-text' : toneId === 'hold' ? 'bg-sf-warning-weak text-sf-progress-text' : toneId === 'bad' ? 'bg-sf-danger-weak text-sf-danger' : 'bg-sf-info-weak text-sf-info'
    return { text: `-> ${storeLabel(t.target)}`, tone }
  }
  if (t.type === 'send') return { text: `-> sent to ${t.target}`, tone: 'bg-sf-info-weak text-sf-info' }
  if (t.type === 'failed') return { text: t.handled === 'dead-letter' ? 'FAILED - dead-lettered' : 'FAILED', tone: 'bg-sf-danger-weak text-sf-danger' }
  if (t.type === 'dropped') return { text: 'DROPPED silently', tone: 'bg-sf-danger-weak text-sf-danger' }
  return { text: 'nothing happened to it', tone: 'bg-sf-locked-weak text-sf-muted' }
}

export function JsonView({ value, maxHeight = 'max-h-64' }) {
  const text = JSON.stringify(value, null, 2)
  // Light syntax coloring: keys, strings, numbers, booleans/null.
  const parts = []
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] !== undefined) parts.push(<span key={parts.length} className={m[2] ? 'text-sf-accent-text' : 'text-sf-complete-text'}>{m[1]}</span>, m[2] || '')
    else if (m[3] !== undefined) parts.push(<span key={parts.length} className="text-sf-info">{m[3]}</span>)
    else parts.push(<span key={parts.length} className="text-sf-progress-text">{m[4]}</span>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return <pre className={`overflow-auto rounded-md bg-sf-surface-inset p-2 font-mono text-[11px] leading-relaxed text-sf-body ${maxHeight}`}>{parts}</pre>
}

function Table({ rows, fields, max = 6 }) {
  if (!rows.length) return <p className="px-2 py-1 text-[11px] text-sf-subtle">empty</p>
  const cols = (fields && fields.length ? fields : Object.keys(rows[0])).filter((c) => rows.some((r) => r[c] !== undefined && typeof r[c] !== 'object')).slice(0, 6)
  const shown = rows.slice(0, max)
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
          {shown.map((r, i) => (
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
      {rows.length > max && <p className="px-2 py-1 text-[10px] text-sf-subtle">+{rows.length - max} more</p>}
    </div>
  )
}

function Section({ title, count, children, defaultOpen = true, json }) {
  const [open, setOpen] = useState(defaultOpen)
  const [asJson, setAsJson] = useState(false)
  return (
    <div className="rounded-lg border border-sf-border bg-sf-surface">
      <div className="flex w-full items-center justify-between px-2.5 py-1.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-1 text-left">
          <span className="text-[11px] font-semibold text-sf-text">
            {title} {count !== undefined && <span className="ml-1 rounded-full bg-sf-surface-inset px-1.5 text-[10px] text-sf-muted">{count}</span>}
          </span>
        </button>
        <div className="flex items-center gap-1">
          {json !== undefined && open && (
            <button type="button" onClick={() => setAsJson((j) => !j)} className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${asJson ? 'bg-sf-accent text-white' : 'bg-sf-surface-inset text-sf-muted hover:text-sf-text'}`} title="Show as JSON">
              {'{ }'}
            </button>
          )}
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Toggle">
            <Icon name="chevron-down" size={12} className={`text-sf-muted transition-transform ${open ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>
      {open && <div className="border-t border-sf-border-subtle">{asJson && json !== undefined ? <div className="p-2"><JsonView value={json} /></div> : children}</div>}
    </div>
  )
}

export default function RunPanel({ run, flow, moduleData, skin, selectedRecordId, onSelectRecord, replay }) {
  const [recordAsJson, setRecordAsJson] = useState(false)
  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sf-border-strong px-4 py-10 text-center">
        <Icon name="circle-play" size={28} className="text-sf-muted" />
        <p className="text-sm font-medium text-sf-text">Nothing has run yet.</p>
        <p className="max-w-sm text-xs text-sf-muted">Press Run. Every record that arrives today will walk your flow step by step, and you will see where each one ends up.</p>
      </div>
    )
  }
  const trace = run.result.traces[flow.id]
  const records = trace ? trace.records : []
  const selected = records.find((r) => r.id === selectedRecordId) || records[0]
  const dayState = run.result.dayState
  const stores = run.result.stores
  const writtenStores = (moduleData.stores || []).filter((s) => (stores[s.id] || []).length && (s.daily || (stores[s.id] || []).length !== (dayState.stores[s.id] || []).length))
  const statusTone = { succeeded: 'bg-sf-complete-weak text-sf-complete-text', partial: 'bg-sf-warning-weak text-sf-progress-text', failed: 'bg-sf-danger-weak text-sf-danger', empty: 'bg-sf-locked-weak text-sf-muted' }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusTone[trace ? trace.status : 'empty']}`}>{trace ? trace.status : 'no trace'}</span>
        <span className="text-xs text-sf-muted">
          {flow.name} on {run.result.dayState.dayLabel}: {records.length} record{records.length === 1 ? '' : 's'}
          {replay && replay.active ? ' - running...' : ''}
        </span>
        {run.stale && <span className="rounded-full bg-sf-warning-weak px-2 py-0.5 text-[10px] font-semibold text-sf-progress-text">flow edited since this run</span>}
      </div>
      {trace && trace.log.length > 0 && (
        <div className="rounded-lg border border-sf-warning bg-sf-warning-weak px-3 py-2 text-xs text-sf-progress-text">
          {trace.log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Records</span>
            {records.map((r, idx) => {
              const b = terminalBadge(r, moduleData)
              const isSel = selected && selected.id === r.id
              const replayingThis = replay && replay.active && replay.recordIdx === idx
              const done = !replay || !replay.active || replay.recordIdx > idx
              return (
                <button key={r.id} type="button" onClick={() => onSelectRecord(r.id)} className={`flex flex-col gap-0.5 rounded-lg border px-2 py-1.5 text-left transition-colors ${isSel ? 'border-sf-accent-border bg-sf-accent-weak' : 'border-sf-border bg-sf-surface hover:border-sf-border-strong'} ${replayingThis ? 'ring-2 ring-sf-accent' : ''}`}>
                  <span className="text-xs font-semibold text-sf-text">{r.label}</span>
                  {done ? <span className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-medium ${b.tone}`}>{b.text}</span> : <span className="text-[10px] text-sf-subtle">{replayingThis ? 'running...' : 'waiting'}</span>}
                </button>
              )
            })}
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{recordAsJson ? 'Record as JSON' : `Path of ${selected ? selected.label : ''}`}</span>
              {selected && (!replay || !replay.active) && (
                <button type="button" onClick={() => setRecordAsJson((j) => !j)} className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${recordAsJson ? 'bg-sf-accent text-white' : 'bg-sf-surface-inset text-sf-muted hover:text-sf-text'}`} title="The record after the run, as JSON">
                  {'{ }'}
                </button>
              )}
            </div>
            {selected && recordAsJson && (!replay || !replay.active) && <JsonView value={selected.final} maxHeight="max-h-80" />}
            {selected && !(recordAsJson && (!replay || !replay.active)) && (
              <ol className="flex flex-col gap-1">
                {selected.steps.map((s, i) => {
                  const found = findStep(flow, s.stepId)
                  const title = found ? skin.describe(found.step, { moduleData, flow }).title : s.kind
                  const st = kindStyle(s.kind)
                  const ss = STATUS_STYLE[s.status] || STATUS_STYLE.skipped
                  const recIdx = records.indexOf(selected)
                  const visible = !replay || !replay.active || replay.recordIdx > recIdx || (replay.recordIdx === recIdx && replay.stepIdx >= i)
                  if (!visible) return null
                  return (
                    <li key={i} className="flex items-start gap-2 rounded-md bg-sf-surface px-2 py-1">
                      <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${ss.className}`}>
                        <Icon name={ss.icon} size={10} strokeWidth={3} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon name={st.icon} size={11} style={{ color: st.color }} />
                          <span className="truncate text-[11px] font-semibold text-sf-text">{title}</span>
                          {s.branch && <span className={`rounded px-1 text-[9px] font-bold uppercase ${s.branch === 'yes' ? 'bg-sf-complete-weak text-sf-complete-text' : 'bg-sf-warning-weak text-sf-progress-text'}`}>{s.branch}</span>}
                        </div>
                        {s.note && <div className={`text-[11px] ${s.status === 'failed' ? 'text-sf-danger' : 'text-sf-muted'}`}>{s.note}</div>}
                      </div>
                    </li>
                  )
                })}
                {selected.terminal && (!replay || !replay.active) && (
                  <li className="mt-0.5 text-[11px] text-sf-body">
                    <span className="font-semibold">Ends:</span> {terminalBadge(selected, moduleData).text}
                    {selected.terminal.stopped ? ' (stopped explicitly)' : ''}
                  </li>
                )}
              </ol>
            )}
          </div>
        </div>
      )}

      {(!replay || !replay.active) && (
        <>
          {writtenStores.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">After the run</span>
              {writtenStores.map((s) => (
                <Section key={s.id} title={s.label} count={(stores[s.id] || []).length} defaultOpen={s.daily} json={stores[s.id] || []}>
                  <Table rows={stores[s.id] || []} fields={s.fields} />
                </Section>
              ))}
            </div>
          )}
          {run.result.outbox.length > 0 && (
            <Section title="Outbox" count={run.result.outbox.length}>
              <ul className="flex flex-col divide-y divide-sf-border-subtle">
                {run.result.outbox.map((m, i) => (
                  <li key={i} className="px-2.5 py-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Icon name="send" size={11} className="text-sf-muted" />
                      <span className="font-semibold text-sf-text">To {m.to}</span>
                      <span className="text-sf-subtle">via {m.channel}</span>
                      <span className="ml-auto text-sf-subtle">{m.recordLabel}</span>
                    </div>
                    {m.subject && <div className="text-sf-body">{m.subject}</div>}
                    {m.body && <pre className="mt-0.5 whitespace-pre-wrap font-sans text-[10px] text-sf-muted">{m.body}</pre>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {run.result.alerts.length > 0 && (
            <Section title="Alerts to the on-call owner" count={run.result.alerts.length}>
              <ul className="flex flex-col divide-y divide-sf-border-subtle">
                {run.result.alerts.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-sf-danger">
                    <Icon name="triangle-alert" size={11} />
                    {a.message}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
