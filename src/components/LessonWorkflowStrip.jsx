import { getProjectData, loadProject } from '../lib/projects'
import { SignalFlowDiagram } from './ui'

// Focused, local "what you built and who reuses it" strip.
// Derives the neighborhood from the real workflow graph (not a linear chain):
//   upstream sources  ->  this node  ->  direct consumers
//
// mode = 'overview' (intro): neutral, current node highlighted as "You build this".
// mode = 'takeaway': current node = Created; each consumer is honestly labeled
//   "Ready to build" or "Still needs other inputs" based on its other dependencies.

function Chip({ label, sublabel, tone, className = '' }) {
  const tones = {
    current: 'border-sf-complete bg-sf-complete-weak text-sf-complete-text',
    currentOverview: 'border-sf-accent-border bg-sf-accent-weak text-sf-accent-text',
    waiting: 'border-sf-border bg-sf-surface-subtle text-sf-muted',
    ready: 'border-sf-accent-border bg-sf-accent-weak text-sf-accent-text',
    context: 'border-sf-border bg-sf-surface text-sf-body',
  }
  return (
    <div className={`min-w-[120px] rounded-md border px-3 py-2 text-center ${tones[tone]} ${className}`}>
      <p className="text-xs font-semibold leading-tight">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] leading-tight opacity-80">{sublabel}</p>}
    </div>
  )
}

export default function LessonWorkflowStrip({ nodeId, mode = 'overview', directConsumers, consumerNotes }) {
  const { nodes, edges } = getProjectData(loadProject())
  const nodeById = nodes.reduce((acc, n) => {
    acc[n.id] = n
    return acc
  }, {})
  const labelFor = (id) => nodeById[id]?.label || id

  const upstream = edges.filter((e) => e.to === nodeId).map((e) => e.from)
  const downstream =
    directConsumers && directConsumers.length > 0
      ? directConsumers
      : edges.filter((e) => e.from === nodeId).map((e) => e.to)

  // A consumer is "ready to build" only if this artifact is its sole input.
  function consumerTone(consumerId) {
    if (mode !== 'takeaway') return 'context'
    const incoming = edges.filter((e) => e.to === consumerId).length
    return incoming > 1 ? 'waiting' : 'ready'
  }

  function consumerSublabel(consumerId) {
    if (mode !== 'takeaway') return null
    if (consumerNotes && consumerNotes[consumerId]) return consumerNotes[consumerId]
    return consumerTone(consumerId) === 'waiting' ? 'Still needs other inputs' : 'Ready to build'
  }

  // Takeaway: a compact consumer-card list (no linear arrow path that wraps awkwardly).
  if (mode === 'takeaway') {
    return (
      <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
        <h3 className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Who reuses it</h3>
        <p className="mt-1 text-xs text-sf-muted">
          {labelFor(nodeId)} is now available to these steps:
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {downstream.map((id) => (
            <div
              key={id}
              className={`rounded-md border border-l-2 border-sf-border bg-sf-surface-subtle p-3 ${
                consumerTone(id) === 'ready' ? 'border-l-sf-accent-border' : 'border-l-sf-border-strong'
              }`}
            >
              <p className="text-sm font-semibold text-sf-body">{labelFor(id)}</p>
              <p className="mt-1 text-xs text-sf-muted">{consumerSublabel(id)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const currentTone = mode === 'takeaway' ? 'current' : 'currentOverview'
  const currentSub = mode === 'takeaway' ? 'Created' : 'You build this'

  return (
    <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
      <h3 className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
        {mode === 'takeaway' ? 'What you built, and who reuses it' : 'Workflow context'}
      </h3>
      <div className="mt-3">
        <SignalFlowDiagram
          inputTone="upstream"
          inputLabel="feeds"
          outputTone="downstream"
          outputLabel="reused by"
          gap={48}
          inputs={upstream.map((id) => (
            <Chip key={id} label={labelFor(id)} tone="context" className="w-full" />
          ))}
          center={<Chip label={labelFor(nodeId)} sublabel={currentSub} tone={currentTone} className="w-full" />}
          consumers={downstream.map((id) => (
            <Chip key={id} label={labelFor(id)} sublabel={consumerSublabel(id)} tone={consumerTone(id)} className="w-full" />
          ))}
        />
      </div>
    </div>
  )
}
