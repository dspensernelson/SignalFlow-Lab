// Operate settings for a flow: the automation is its own system and needs a
// connection, an identity, a trigger cadence, and a failure plan. The engine
// reads retries and onFailure when a day injects a failure.

const inputCls = 'w-full rounded-md border border-sf-border bg-sf-surface px-2 py-1 text-xs text-sf-text focus:border-sf-accent-border focus:outline-none'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle'

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="text-[10px] leading-snug text-sf-subtle">{hint}</span>}
    </label>
  )
}

export default function SettingsPanel({ flow, onChange }) {
  const s = flow.settings
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-sf-body">
        <span className="font-semibold">{flow.name}</span> - the workflow is one system and the automation running it is another. This one needs credentials, a cadence, and a plan for the day a step fails.
      </p>
      <div className="rounded-lg border border-sf-border bg-sf-surface p-2.5">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Connection</div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="System">
            <select className={inputCls} value={s.connection.system} onChange={(e) => onChange({ connection: { system: e.target.value } })}>
              <option value="">choose...</option>
              <option>AP shared mailbox</option>
              <option>Your personal inbox</option>
              <option>The controller's desktop folder</option>
            </select>
          </Field>
          <Field label="Runs as">
            <select className={inputCls} value={s.connection.identity} onChange={(e) => onChange({ connection: { identity: e.target.value } })}>
              <option value="">choose...</option>
              <option value="service account">Service account</option>
              <option value="your own login">Your own login</option>
              <option value="shared password">A shared password in the flow</option>
            </select>
          </Field>
          <Field label="Secret" hint="a vault reference, never the token">
            <input className={`${inputCls} font-mono`} value={s.connection.secretRef} onChange={(e) => onChange({ connection: { secretRef: e.target.value } })} placeholder="vault://beacon/ap-mailbox" />
          </Field>
        </div>
      </div>
      <div className="rounded-lg border border-sf-border bg-sf-surface p-2.5">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Trigger cadence</div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Mode">
            <select className={inputCls} value={s.trigger.mode} onChange={(e) => onChange({ trigger: { mode: e.target.value } })}>
              <option value="event">event (push)</option>
              <option value="poll">poll on a timer</option>
              <option value="webhook">webhook</option>
              <option value="schedule">schedule</option>
            </select>
          </Field>
          <Field label="Check every (min)">
            <input type="number" min={1} className={inputCls} value={s.trigger.intervalMinutes} onChange={(e) => onChange({ trigger: { intervalMinutes: Number(e.target.value) } })} />
          </Field>
        </div>
      </div>
      <div className="rounded-lg border border-sf-border bg-sf-surface p-2.5">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">When a step fails</div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Retries" hint="0 gives up on a hiccup; 10 turns an outage into an attack">
            <input type="number" min={0} max={20} className={inputCls} value={s.retries} onChange={(e) => onChange({ retries: Math.max(0, Number(e.target.value) || 0) })} />
          </Field>
          <Field label="Then" hint="a failure nobody sees is the worst outcome available">
            <select className={inputCls} value={s.onFailure} onChange={(e) => onChange({ onFailure: e.target.value })}>
              <option value="skip">skip the record silently</option>
              <option value="dead-letter">dead-letter and alert</option>
              <option value="retry-forever">retry forever</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  )
}
