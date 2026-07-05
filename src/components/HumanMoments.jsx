import { Modal, Button, Icon } from './ui'

// First-run welcome: what SignalFlow Lab is, in three beats, shown once ever.
const WELCOME_BULLETS = [
  'Build a real workplace automation on a live dependency map. Click any node to see how that piece gets built and reused downstream.',
  'Every lesson hands you a trusted artifact that flows into the next step. Nothing you make is throwaway.',
  'Three depths per map: operate the pattern, handle the mess, own the design. Switch tiers anytime, each keeps its own progress.',
]

export function WelcomeModal({ open, onDismiss }) {
  return (
    <Modal open={open} onClose={onDismiss} labelledBy="welcome-title" describedBy="welcome-body">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sf-accent-weak text-sf-accent-text">
          <Icon name="sparkles" size={18} />
        </span>
        <h2 id="welcome-title" className="text-lg font-semibold text-sf-text">
          Welcome to SignalFlow Lab
        </h2>
      </div>
      <ul id="welcome-body" className="mt-4 flex flex-col gap-3">
        {WELCOME_BULLETS.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm text-sf-body">
            <Icon name="circle-check" size={16} className="mt-0.5 shrink-0 text-sf-accent" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-end">
        <Button variant="primary" size="sm" iconRight="arrow-right" onClick={onDismiss}>
          Start building
        </Button>
      </div>
    </Modal>
  )
}

// Celebrates finishing every buildable task in the active tier. Offers the
// "download everything I built" export and a nudge to the next tier. Shown once
// per completed tier (per project).
export function TierCompleteModal({
  open,
  tierLabel,
  builtCount,
  nextTierLabel,
  onExport,
  onNextTier,
  onDismiss,
}) {
  return (
    <Modal open={open} onClose={onDismiss} labelledBy="tier-done-title" describedBy="tier-done-body">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sf-complete-weak text-sf-complete-text">
          <Icon name="circle-check-big" size={20} />
        </span>
        <h2 id="tier-done-title" className="text-lg font-semibold text-sf-text">
          You built the whole {tierLabel} workflow
        </h2>
      </div>
      <p id="tier-done-body" className="mt-3 text-sm text-sf-body">
        All {builtCount} task{builtCount === 1 ? '' : 's'} built, start to finish. Take your work
        with you, or go deeper.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button variant="primary" size="sm" icon="download" onClick={onExport}>
          Download everything I built
        </Button>
        {nextTierLabel && (
          <Button variant="neutral" size="sm" iconRight="arrow-right" onClick={onNextTier}>
            Try the {nextTierLabel} tier
          </Button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 text-sm font-medium text-sf-muted transition-colors hover:text-sf-body"
        >
          Keep exploring
        </button>
      </div>
    </Modal>
  )
}

// "You have seen this shape before." Shown once per module (module-02+), the
// first time a learner enters a module that maps onto the shared workflow
// skeleton. Data-driven from src/data/moduleSkeleton.json: it lines this
// module's real nodes up against the Meridian anchor, stage for stage, so the
// recurring shape itself becomes visible ("all workflows are the same
// workflow"). One card per module.
export function RecurrenceModal({ open, skeleton, anchorModule, thisModule, onDismiss }) {
  if (!open || !skeleton || !anchorModule || !thisModule) return null
  return (
    <Modal
      open={open}
      onClose={onDismiss}
      maxWidth="max-w-2xl"
      labelledBy="recurrence-title"
      describedBy="recurrence-body"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sf-accent-weak text-sf-accent-text">
          <Icon name="rotate-cw" size={18} />
        </span>
        <h2 id="recurrence-title" className="text-lg font-semibold text-sf-text">
          You have seen this shape before
        </h2>
      </div>
      <p id="recurrence-body" className="mt-3 text-sm text-sf-body">
        {anchorModule.org}&rsquo;s {anchorModule.deliverable} and {thisModule.org}&rsquo;s{' '}
        {thisModule.deliverable} are the same seven-stage workflow. Only the names change &mdash;
        learn the shape once and you can rebuild it anywhere.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-sf-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-sf-surface-subtle text-xs uppercase tracking-wide text-sf-muted">
              <th className="px-3 py-2 font-semibold">Stage</th>
              <th className="px-3 py-2 font-semibold">{anchorModule.org} (Module 1)</th>
              <th className="px-3 py-2 font-semibold">{thisModule.org} (this module)</th>
            </tr>
          </thead>
          <tbody>
            {skeleton.map((s) => (
              <tr key={s.id} className="border-t border-sf-border align-top">
                <td className="px-3 py-2">
                  <div className="font-medium text-sf-text">{s.stage}</div>
                  <div className="text-xs text-sf-muted">{s.gloss}</div>
                </td>
                <td className="px-3 py-2 text-sf-body">{anchorModule.map[s.id]}</td>
                <td className="px-3 py-2 font-medium text-sf-text">{thisModule.map[s.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="primary" size="sm" iconRight="arrow-right" onClick={onDismiss}>
          Build the same shape
        </Button>
      </div>
    </Modal>
  )
}
