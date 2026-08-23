import { Button, Icon, Modal } from '../components/ui'

// The world before the work: who, what arrives, what tables exist, what you
// owe and by when, the days ahead. Shown before Build 1 and from the header.
export default function ModuleIntro({ moduleData, open, onStart, onClose, firstTime }) {
  const world = moduleData.world || {}
  const sources = moduleData.sources || []
  const stores = moduleData.stores || []
  const days = moduleData.days || []
  const builds = moduleData.builds || []
  return (
    <Modal open={open} onClose={onClose} labelledBy="module-intro-title" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-4 text-left">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{moduleData.org || ''}</div>
          <h2 id="module-intro-title" className="text-xl font-semibold text-sf-text">{moduleData.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-sf-body">{world.oneLiner || moduleData.intro}</p>
          {world.stakes && <p className="mt-1 text-xs text-sf-muted">{world.stakes}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-sf-border bg-sf-surface-subtle p-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Who is here</div>
            <ul className="flex flex-col gap-1 text-xs">
              {(world.roles || (moduleData.owners || []).map((name) => ({ name, does: '' }))).map((r) => (
                <li key={r.name} className="flex gap-2">
                  <span className="w-40 flex-none font-semibold text-sf-text">{r.name}</span>
                  <span className="text-sf-body">{r.does}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-sf-border bg-sf-surface-subtle p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">What you owe, and when</div>
              <p className="text-xs font-semibold text-sf-text">{world.deliverable || ''}</p>
              {world.clock && <p className="mt-1 text-[11px] text-sf-body">{world.clock}</p>}
            </div>
            <div className="rounded-lg border border-sf-border bg-sf-surface-subtle p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">What arrives</div>
              {sources.map((s) => (
                <div key={s.id} className="text-xs">
                  <span className="font-semibold text-sf-text">{s.label}</span>
                  <span className="text-sf-muted"> - {s.description}</span>
                  {s.fields && <div className="mt-0.5 flex flex-wrap gap-1">{s.fields.map((f) => <span key={f} className="rounded bg-sf-surface-inset px-1 font-mono text-[10px] text-sf-muted">{f}</span>)}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-sf-border bg-sf-surface-subtle p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">The tables you can read and write</div>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] md:grid-cols-2">
            {stores.map((s) => (
              <li key={s.id} className="flex gap-2">
                <Icon name="database" size={12} className="mt-0.5 flex-none text-sf-muted" />
                <span>
                  <span className="font-semibold text-sf-text">{s.label}</span>
                  {s.owner && <span className="text-sf-subtle"> ({s.owner})</span>}
                  <span className="text-sf-body"> - {s.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-sf-border bg-sf-surface-subtle p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">The days ahead - {builds.length} builds</div>
          <ol className="flex flex-col gap-0.5 text-[11px] text-sf-body">
            {days.map((d) => (
              <li key={d.id}>
                <span className="font-semibold text-sf-text">{d.label}</span>
                <span className="text-sf-muted"> - {builds.filter((b) => b.dayId === d.id).map((b) => b.title).join(', ')}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-sf-subtle">You can reopen this any time from "World" in the header. The Data tab shows every table as it stands today.</p>
          <Button variant="primary" size="md" iconRight="arrow-right" onClick={onStart}>
            {firstTime ? 'Start building' : 'Back to the build'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
