import { useState } from 'react'
import { CONDITION_OPS } from '../runtime/flowModel.js'
import { safeParse } from '../runtime/expr.js'
import { Icon } from '../components/ui'
import { storeFields } from './fieldHints.js'

// Functions the expression language offers, for the palette beside each
// expression input. Kept in sync with FUNCS in src/runtime/expr.js.
const FUNCTIONS = [
  { name: 'max', sig: 'max(a, b, ...)', ex: 'max(po.poTotal * 0.02, 25)' },
  { name: 'min', sig: 'min(a, b, ...)', ex: 'min(qty, 100)' },
  { name: 'abs', sig: 'abs(x)', ex: 'abs(variance)' },
  { name: 'round', sig: 'round(x, decimals)', ex: 'round(variance / po.poTotal * 100, 2)' },
  { name: 'len', sig: 'len(list)', ex: 'len(batch)' },
  { name: 'sum', sig: "sum(list, 'field')", ex: "sum(batch, 'invoiceTotal')" },
  { name: 'num', sig: 'num(text)', ex: "num('$1,220.00')" },
  { name: 'upper', sig: 'upper(text)', ex: 'upper(hub)' },
  { name: 'lower', sig: 'lower(text)', ex: 'lower(email)' },
  { name: 'trim', sig: 'trim(text)', ex: 'trim(vendorName)' },
  { name: 'concat', sig: 'concat(a, b, ...)', ex: "concat('SD-', days)" },
  { name: 'exists', sig: 'exists(x)', ex: 'exists(receipt)' },
  { name: 'coalesce', sig: 'coalesce(a, b, ...)', ex: 'coalesce(po.total, 0)' },
  { name: 'if', sig: 'if(test, a, b)', ex: "if(variance <= band, 'ok', 'over')" },
]

function PickerButton({ label, icon, children, title }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex-none">
      <button type="button" onClick={() => setOpen((o) => !o)} title={title} aria-label={title} className={`flex h-6 items-center gap-0.5 rounded-md border px-1 text-[10px] ${open ? 'border-sf-accent-border text-sf-accent' : 'border-sf-border text-sf-muted hover:text-sf-text'}`}>
        {icon && <Icon name={icon} size={11} />}
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full z-40 mt-1 max-h-64 w-72 overflow-y-auto rounded-lg border border-sf-border bg-sf-surface p-1 shadow-sf-lg" onClick={() => setOpen(false)}>
            {children}
          </div>
        </>
      )}
    </div>
  )
}

// Per-kind configuration forms. Every input edits plain config; the learner
// never types JSON. Expressions get an inline parse check so a typo is caught
// before a run, not during it.

const inputCls = 'w-full rounded-md border border-sf-border bg-sf-surface px-2 py-1 text-xs text-sf-text placeholder:text-sf-subtle focus:border-sf-accent-border focus:outline-none'
const selectCls = inputCls
const labelCls = 'block text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle'

function Field({ label, children, hint }) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="text-[10px] text-sf-subtle">{hint}</span>}
    </label>
  )
}

function RowButton({ onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-sf-muted hover:bg-sf-surface-subtle hover:text-sf-text">
      <Icon name={icon} size={12} />
    </button>
  )
}

function ExprInput({ value, onChange, list, placeholder, fields = [], functions = false }) {
  const { error } = value && value.trim() ? safeParse(value) : { error: null }
  const insert = (text) => onChange(value && value.trim() && !/[\s(+\-*/,=<>]$/.test(value) ? `${value} ${text}` : `${value || ''}${text}`)
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-start gap-1">
        <input className={`${inputCls} font-mono ${error ? 'border-sf-danger' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} list={list} placeholder={placeholder} spellCheck={false} />
        {fields.length > 0 && (
          <PickerButton label="field" icon="braces" title="Insert a field that exists at this point">
            {fields.map((f) => (
              <button key={f} type="button" onClick={() => insert(f)} className="block w-full rounded px-2 py-1 text-left font-mono text-[11px] text-sf-body hover:bg-sf-surface-subtle">
                {f}
              </button>
            ))}
          </PickerButton>
        )}
        {functions && (
          <PickerButton label="fn" title="Insert a function">
            {FUNCTIONS.map((f) => (
              <button key={f.name} type="button" onClick={() => insert(f.sig.replace(/\(.*$/, '('))} className="block w-full rounded px-2 py-1 text-left hover:bg-sf-surface-subtle">
                <span className="font-mono text-[11px] text-sf-text">{f.sig}</span>
                <span className="block font-mono text-[10px] text-sf-subtle">{f.ex}</span>
              </button>
            ))}
          </PickerButton>
        )}
      </div>
      {error && <span className="text-[10px] text-sf-danger">{error}</span>}
    </div>
  )
}

export default function StepEditor({ step, moduleData, fields, onChange }) {
  const c = step.config || {}
  const set = (patch) => onChange({ config: { ...c, ...patch } })
  const listId = `fields-${step.id}`
  const datalist = (
    <datalist id={listId}>
      {fields.map((f) => (
        <option key={f} value={f} />
      ))}
    </datalist>
  )
  const owners = moduleData.owners || []

  switch (step.kind) {
    case 'trigger':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Starts when">
            <select className={selectCls} value={c.mode} onChange={(e) => set({ mode: e.target.value })}>
              <option value="event">something arrives</option>
              <option value="schedule">a clock fires</option>
            </select>
          </Field>
          {c.mode === 'schedule' ? (
            <Field label="At">
              <input className={inputCls} value={c.at || ''} onChange={(e) => set({ at: e.target.value })} placeholder="2:30 PM" />
            </Field>
          ) : (
            <Field label="Source">
              <select className={selectCls} value={c.source || ''} onChange={(e) => set({ source: e.target.value })}>
                <option value="">Choose a source...</option>
                {(moduleData.sources || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )

    case 'lookup': {
      const cols = storeFields(moduleData, c.store)
      const pairs = c.matchOn && c.matchOn.length ? c.matchOn : [{ recordField: '', storeField: '' }]
      const setPair = (i, patch) => set({ matchOn: pairs.map((p, j) => (j === i ? { ...p, ...patch } : p)) })
      return (
        <div className="flex flex-col gap-2">
          {datalist}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Read from">
              <select className={selectCls} value={c.store || ''} onChange={(e) => set({ store: e.target.value })}>
                <option value="">Choose a table...</option>
                {(moduleData.stores || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Return">
              <select className={selectCls} value={c.mode || 'one'} onChange={(e) => set({ mode: e.target.value })}>
                <option value="one">one matching row</option>
                <option value="all">all matching rows</option>
              </select>
            </Field>
            <Field label="Attach as" hint="the name later steps use, e.g. po">
              <input className={`${inputCls} font-mono`} value={c.as || ''} onChange={(e) => set({ as: e.target.value })} placeholder={c.store || 'name'} />
            </Field>
          </div>
          <div className="flex flex-col gap-1">
            <span className={labelCls}>Match where {c.mode === 'all' ? '(leave empty for every row)' : ''}</span>
            {pairs.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <select className={`${selectCls} flex-1`} value={p.storeField} onChange={(e) => setPair(i, { storeField: e.target.value })}>
                  <option value="">table column...</option>
                  {cols.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  {p.storeField && !cols.includes(p.storeField) && <option value={p.storeField}>{p.storeField}</option>}
                </select>
                <span className="text-xs text-sf-muted">=</span>
                <div className="flex-1">
                  <ExprInput value={p.recordField} onChange={(v) => setPair(i, { recordField: v })} list={listId} placeholder="record field, or 'literal'" fields={fields} />
                </div>
                <RowButton icon="x" label="Remove match" onClick={() => set({ matchOn: pairs.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <button type="button" onClick={() => set({ matchOn: [...pairs, { recordField: '', storeField: '' }] })} className="w-fit text-[11px] font-medium text-sf-accent hover:underline">
              + another match field
            </button>
          </div>
        </div>
      )
    }

    case 'transform': {
      const sets = c.set && c.set.length ? c.set : [{ field: '', expr: '' }]
      const setRow = (i, patch) => set({ set: sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
      return (
        <div className="flex flex-col gap-1.5">
          {datalist}
          {sets.map((s, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <input className={`${inputCls} w-36 flex-none font-mono`} value={s.field} onChange={(e) => setRow(i, { field: e.target.value })} placeholder="field name" spellCheck={false} />
              <span className="pt-1 text-xs text-sf-muted">=</span>
              <div className="flex-1">
                <ExprInput value={s.expr} onChange={(v) => setRow(i, { expr: v })} list={listId} placeholder="invoiceTotal - po.poTotal" fields={fields} functions />
              </div>
              <RowButton icon="x" label="Remove" onClick={() => set({ set: sets.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => set({ set: [...sets, { field: '', expr: '' }] })} className="text-[11px] font-medium text-sf-accent hover:underline">
              + set another field
            </button>
            <span className="text-[10px] text-sf-subtle">text in 'quotes'; and / or / not; the fn button lists the functions</span>
          </div>
        </div>
      )
    }

    case 'condition': {
      const rules = c.rules && c.rules.length ? c.rules : [{ left: '', op: '==', right: '', rightKind: 'value' }]
      const setRule = (i, patch) => set({ rules: rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
      return (
        <div className="flex flex-col gap-1.5">
          {datalist}
          {rules.map((r, i) => {
            const noRight = r.op === 'exists' || r.op === 'missing'
            return (
              <div key={i} className="flex items-start gap-1.5">
                {i > 0 && <span className="w-9 flex-none pt-1 text-[10px] font-semibold uppercase text-sf-subtle">{c.combine === 'any' ? 'or' : 'and'}</span>}
                {i === 0 && <span className="w-9 flex-none pt-1 text-[10px] font-semibold uppercase text-sf-subtle">if</span>}
                <div className="flex-1">
                  <ExprInput value={r.left} onChange={(v) => setRule(i, { left: v })} list={listId} placeholder="field" fields={fields} />
                </div>
                <select className={`${selectCls} w-24 flex-none font-mono`} value={r.op} onChange={(e) => setRule(i, { op: e.target.value })}>
                  {CONDITION_OPS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                {!noRight && (
                  <>
                    <div className="flex-1">
                      {r.rightKind === 'field' ? (
                        <ExprInput value={r.right} onChange={(v) => setRule(i, { right: v })} list={listId} placeholder="field" fields={fields} />
                      ) : (
                        <input className={inputCls} value={r.right} onChange={(e) => setRule(i, { right: e.target.value })} placeholder="value" />
                      )}
                    </div>
                    <div className="flex h-6 flex-none overflow-hidden rounded-md border border-sf-border text-[10px] font-semibold uppercase" role="group" aria-label="Compare to">
                      {['value', 'field'].map((k) => (
                        <button key={k} type="button" onClick={() => setRule(i, { rightKind: k })} title={k === 'field' ? 'Compare to another field of the record' : 'Compare to a typed value'} className={`px-1.5 ${r.rightKind === k ? 'bg-sf-accent text-white' : 'text-sf-muted hover:bg-sf-surface-subtle'}`}>
                          {k}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <RowButton icon="x" label="Remove rule" onClick={() => set({ rules: rules.filter((_, j) => j !== i) })} />
              </div>
            )
          })}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set({ rules: [...rules, { left: '', op: '==', right: '', rightKind: 'value' }] })} className="text-[11px] font-medium text-sf-accent hover:underline">
              + another rule
            </button>
            {rules.length > 1 && (
              <label className="flex items-center gap-1 text-[10px] text-sf-muted">
                require
                <select className="rounded border border-sf-border bg-sf-surface px-1 py-0.5 text-[10px]" value={c.combine || 'all'} onChange={(e) => set({ combine: e.target.value })}>
                  <option value="all">all rules</option>
                  <option value="any">any rule</option>
                </select>
              </label>
            )}
          </div>
        </div>
      )
    }

    case 'approval':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ask">
            <input className={inputCls} list={`owners-${step.id}`} value={c.approver || ''} onChange={(e) => set({ approver: e.target.value })} placeholder="AP Manager" />
            <datalist id={`owners-${step.id}`}>
              {owners.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </Field>
          <Field label="About" hint="the reply lands on approval.outcome">
            <input className={inputCls} value={c.about || ''} onChange={(e) => set({ about: e.target.value })} placeholder="payment run" />
          </Field>
        </div>
      )

    case 'send':
      return (
        <div className="flex flex-col gap-2">
          {datalist}
          <div className="grid grid-cols-3 gap-2">
            <Field label="To">
              <input className={inputCls} list={`owners-${step.id}`} value={c.to || ''} onChange={(e) => set({ to: e.target.value })} placeholder="Procurement Lead" />
              <datalist id={`owners-${step.id}`}>
                {owners.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </Field>
            <Field label="Via">
              <select className={selectCls} value={c.channel || 'email'} onChange={(e) => set({ channel: e.target.value })}>
                <option value="email">email</option>
                <option value="chat">chat message</option>
                <option value="queue">work queue</option>
              </select>
            </Field>
            <Field label="Subject">
              <input className={inputCls} value={c.subject || ''} onChange={(e) => set({ subject: e.target.value })} placeholder="Hold on {{invoiceNumber}}" />
            </Field>
          </div>
          <Field label="Body" hint="{{field}} fills in from the record; {{#each list}}...{{/each}} repeats">
            <textarea className={`${inputCls} min-h-[56px] font-mono`} value={c.body || ''} onChange={(e) => set({ body: e.target.value })} placeholder="Invoice {{invoiceNumber}} is on hold: {{reason}}" spellCheck={false} />
          </Field>
        </div>
      )

    case 'compose':
      return (
        <div className="flex flex-col gap-2">
          <Field label="Save as" hint="a field later steps can send or store">
            <input className={`${inputCls} w-40 font-mono`} value={c.as || ''} onChange={(e) => set({ as: e.target.value })} placeholder="body" />
          </Field>
          <Field label="Template" hint="{{field}} fills in; {{#each batch}}- {{invoiceNumber}}{{/each}} repeats; {{ sum(batch, 'invoiceTotal') }} computes">
            <textarea className={`${inputCls} min-h-[96px] font-mono`} value={c.template || ''} onChange={(e) => set({ template: e.target.value })} spellCheck={false} />
          </Field>
        </div>
      )

    case 'store':
      return (
        <div className="grid grid-cols-3 gap-2">
          {datalist}
          <Field label="Write to">
            <select className={selectCls} value={c.store || ''} onChange={(e) => set({ store: e.target.value })}>
              <option value="">Choose a table...</option>
              {(moduleData.stores || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="How">
            <select className={selectCls} value={c.mode || 'append'} onChange={(e) => set({ mode: e.target.value })}>
              <option value="append">append a row</option>
              <option value="upsert">upsert by key</option>
            </select>
          </Field>
          {c.mode === 'upsert' ? (
            <Field label="Key field">
              <input className={`${inputCls} font-mono`} value={c.key || ''} onChange={(e) => set({ key: e.target.value })} list={listId} placeholder="invoiceNumber" />
            </Field>
          ) : (
            <Field label="Rows from" hint="blank = this record; or a list field">
              <input className={`${inputCls} font-mono`} value={c.from || ''} onChange={(e) => set({ from: e.target.value })} list={listId} placeholder="(this record)" />
            </Field>
          )}
        </div>
      )

    case 'stop':
      return <p className="text-xs text-sf-muted">Nothing to configure. A record that reaches this step is finished: nothing after it runs for that record. Use it at the end of a hold lane so a held invoice is never also paid.</p>

    default:
      return null
  }
}
