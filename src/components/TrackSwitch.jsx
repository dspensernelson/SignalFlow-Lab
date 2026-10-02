import { TRACKS, TRACK_LABELS } from '../lib/track'

const TRACK_HINTS = {
  automation: 'Automation - build workplace workflows one validated artifact at a time.',
  middleware: 'Middleware - build the tool layer between an LLM agent and real business systems.',
}

// Compact segmented control for the top-level track. Same styling as the
// tier switch so the header reads as one control family.
export default function TrackSwitch({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Learning track"
      className="inline-flex items-center rounded-full border border-sf-border bg-sf-surface-subtle p-0.5"
    >
      <span className="pl-2 pr-1 text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
        Track
      </span>
      {TRACKS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          aria-pressed={value === t}
          title={TRACK_HINTS[t]}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            value === t
              ? 'bg-sf-surface text-sf-text shadow-sf-sm'
              : 'text-sf-muted hover:text-sf-body'
          }`}
        >
          {TRACK_LABELS[t]}
        </button>
      ))}
    </div>
  )
}
