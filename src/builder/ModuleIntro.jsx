import { Button, Icon, Modal } from '../components/ui'

// The welcome: one sentence of world, the job, and the days ahead. People and
// tables sit behind a disclosure for when the learner wants them; the Data tab
// shows every table as it stands today.
export default function ModuleIntro({ moduleData, open, onStart, onClose, firstTime }) {
  const world = moduleData.world || {}
  const stores = moduleData.stores || []
  const days = moduleData.days || []
  const roles = world.roles || (moduleData.owners || []).map((name) => ({ name, does: '' }))
  return (
    <Modal open={open} onClose={onClose} labelledBy="module-intro-title" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-5 text-left">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{moduleData.org || ''}</div>
          <h2 id="module-intro-title" className="text-2xl font-semibold text-sf-text">{moduleData.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-sf-body">{world.oneLiner || moduleData.intro}</p>
        </div>

        {world.deliverable && (
          <div className="flex items-center gap-3 rounded-xl border border-sf-accent-border bg-sf-accent-weak px-4 py-3">
            <Icon name="clock" size={18} className="flex-none text-sf-accent" />
            <div className="text-sm text-sf-text">
              <span className="text-sf-muted">You owe </span>
              <span className="font-semibold">{world.deliverable}</span>
            </div>
          </div>
        )}

        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {days.map((d, i) => {
            const [head, ...rest] = d.label.split(' - ')
            const tail = rest.join(' - ')
            return (
              <li key={d.id} className="rounded-xl border border-sf-border bg-sf-surface-subtle px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{head || `Day ${i + 1}`}</div>
                <div className="text-sm font-medium text-sf-text">{tail ? tail[0].toUpperCase() + tail.slice(1) : d.label}</div>
              </li>
            )
          })}
        </ol>

        <details className="group rounded-xl border border-sf-border px-3 py-2">
          <summary className="cursor-pointer list-none text-xs font-medium text-sf-muted hover:text-sf-accent">
            <span className="group-open:hidden">Who works here, and what tables exist</span>
            <span className="hidden group-open:inline">Hide</span>
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ul className="flex flex-col gap-1.5 text-xs">
              {roles.map((r) => (
                <li key={r.name}>
                  <div className="font-semibold text-sf-text">{r.name}</div>
                  {r.does && <div className="text-[11px] text-sf-muted">{r.does.split('. ')[0].replace(/\.$/, '')}.</div>}
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-1.5 text-xs">
              {stores.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <Icon name="database" size={12} className="mt-0.5 flex-none text-sf-muted" />
                  <span>
                    <span className="font-semibold text-sf-text">{s.label}</span>
                    {s.owner && <span className="text-sf-subtle"> - {s.owner}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <div className="flex justify-end">
          <Button variant="primary" size="md" iconRight="arrow-right" onClick={onStart}>
            {firstTime ? 'Start building' : 'Back to the build'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
