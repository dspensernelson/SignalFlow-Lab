import nodes from '../data/workflowNodes.json'
import edges from '../data/workflowEdges.json'

// Focused, local "what you built and who reuses it" strip.
// Derives the neighborhood from the real workflow graph (not a linear chain):
//   upstream sources  ->  this node  ->  direct consumers
//
// mode = 'overview' (intro): neutral, current node highlighted as "You build this".
// mode = 'takeaway': current node = Created; each consumer is honestly labeled
//   "Ready to build" or "Still needs other inputs" based on its other dependencies.
const nodeById = nodes.reduce((acc, n) => {
  acc[n.id] = n
  return acc
}, {})

function labelFor(id) {
  return nodeById[id]?.label || id
}

function Chip({ label, sublabel, tone }) {
  const tones = {
    current: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    currentOverview: 'border-blue-300 bg-blue-50 text-blue-900',
    waiting: 'border-slate-200 bg-slate-50 text-slate-600',
    ready: 'border-blue-200 bg-blue-50 text-blue-800',
    context: 'border-gray-200 bg-white text-gray-600',
  }
  return (
    <div className={`min-w-[120px] rounded-md border px-3 py-2 text-center ${tones[tone]}`}>
      <p className="text-xs font-semibold leading-tight">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] leading-tight opacity-80">{sublabel}</p>}
    </div>
  )
}

function Arrow() {
  return (
    <span aria-hidden="true" className="px-1 text-gray-300">
      &rarr;
    </span>
  )
}

export default function LessonWorkflowStrip({ nodeId, mode = 'overview', directConsumers, consumerNotes }) {
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
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Who reuses it</h3>
        <p className="mt-1 text-xs text-gray-500">
          {labelFor(nodeId)} is now available to these steps:
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {downstream.map((id) => (
            <div
              key={id}
              className={`rounded-md border border-l-2 border-gray-200 bg-gray-50 p-3 ${
                consumerTone(id) === 'ready' ? 'border-l-blue-400' : 'border-l-slate-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-800">{labelFor(id)}</p>
              <p className="mt-1 text-xs text-gray-500">{consumerSublabel(id)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const currentTone = mode === 'takeaway' ? 'current' : 'currentOverview'
  const currentSub = mode === 'takeaway' ? 'Created' : 'You build this'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {mode === 'takeaway' ? 'What you built, and who reuses it' : 'Workflow context'}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-y-3">
        {upstream.map((id) => (
          <div key={id} className="flex items-center">
            <Chip label={labelFor(id)} tone="context" />
            <Arrow />
          </div>
        ))}

        <Chip label={labelFor(nodeId)} sublabel={currentSub} tone={currentTone} />

        {downstream.length > 0 && <Arrow />}

        {downstream.map((id, index) => (
          <div key={id} className="flex items-center">
            <Chip label={labelFor(id)} sublabel={consumerSublabel(id)} tone={consumerTone(id)} />
            {index < downstream.length - 1 && <span className="px-1 text-gray-200">/</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
