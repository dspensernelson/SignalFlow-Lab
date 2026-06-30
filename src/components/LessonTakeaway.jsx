import LessonWorkflowStrip from './LessonWorkflowStrip'

// Inline icons for the takeaway workflow diagram (stroke-based, currentColor).
function Icon({ name, className }) {
  if (name === 'bars') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <rect x="4" y="11" width="3.5" height="7" rx="0.5" />
        <rect x="10.25" y="7" width="3.5" height="11" rx="0.5" />
        <rect x="16.5" y="9" width="3.5" height="9" rx="0.5" />
      </svg>
    )
  }
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  }
  switch (name) {
    case 'note':
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v5h5" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common}>
          <path d="M6 21V4" />
          <path d="M6 4h11l-2 4 2 4H6" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'person':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
        </svg>
      )
    case 'doc':
      return (
        <svg {...common}>
          <rect x="6" y="3" width="12" height="18" rx="1.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      )
    default:
      return null
  }
}

// Horizontal flow connector, hidden when the diagram stacks on small screens.
function FlowArrow() {
  return (
    <div className="hidden items-center justify-center text-gray-300 lg:flex" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

const CONSUMER_ICON = {
  'risk-evaluation': { name: 'shield', color: 'text-violet-500' },
  'approval-decision': { name: 'person', color: 'text-slate-500' },
  'morning-brief': { name: 'doc', color: 'text-blue-500' },
}

// Step 3 of the lesson template: show what the workflow can do now.
// Lessons that define takeaway.capability + whatCameIn + consumers render the
// workflow-diagram layout (the artifact is now live in the flow); others fall
// back to the rich Before/After layout or the original list layout.
export default function LessonTakeaway({ lesson, artifact, onReturnToCanvas }) {
  const takeaway = lesson.takeaway
  const rich = Boolean(takeaway.capability)
  const consumerNotes = (takeaway.consumers || []).reduce((acc, c) => {
    if (c.nodeId) acc[c.nodeId] = c.note
    return acc
  }, {})

  if (!rich) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-green-300 bg-green-50 p-5">
          <h2 className="text-lg font-semibold text-green-900">{takeaway.heading}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {takeaway.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                <span aria-hidden="true">&#10003;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onReturnToCanvas()}
            className="mt-5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Return to Canvas
          </button>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Artifact produced
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-800">{takeaway.artifactName}</p>
          {artifact && (
            <pre className="mt-3 overflow-auto rounded-md bg-gray-50 p-3 text-sm text-gray-800">
              {typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)}
            </pre>
          )}
        </aside>
      </div>
    )
  }

  const came = lesson.intro?.whatCameIn
  const consumers = takeaway.consumers || []
  const diagram = rich && Boolean(came) && consumers.length > 0

  if (diagram) {
    const recordName = lesson.intro?.recordName || takeaway.heading
    const recordBanner = takeaway.recordBanner || 'First trusted structured record'
    const recordSummary = takeaway.recordSummary || lesson.intro?.concept
    const fieldCount =
      lesson.validation?.requiredFields?.length ||
      (artifact && typeof artifact === 'object' ? Object.keys(artifact).length : null)

    return (
      <div className="flex flex-col gap-4">
        {/* Workflow diagram: incoming signals -> the record you built -> consumers */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,5fr)_auto_minmax(0,6fr)_auto_minmax(0,5fr)]">
            {/* LEFT: what came in (quieter than the center) */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                What came in
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon name="note" className="h-4 w-4 flex-none text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{came.noteTitle}</p>
                    {came.noteSubtitle && (
                      <p className="text-[11px] text-gray-500">{came.noteSubtitle}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 rounded-md border border-dashed border-gray-200 bg-gray-50 p-2 font-mono text-[11px] leading-snug text-gray-600">
                  {lesson.input}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <Icon name="flag" className="h-4 w-4 flex-none text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{came.flagTitle}</p>
                    {came.flagSubtitle && (
                      <p className="text-[11px] text-gray-500">{came.flagSubtitle}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {came.flagCue && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {came.flagCue}
                    </span>
                  )}
                  {came.flagNote && (
                    <span className="text-[11px] text-gray-500">{came.flagNote}</span>
                  )}
                </div>
              </div>
            </div>

            <FlowArrow />

            {/* CENTER: the artifact you built - the visual payoff */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4 shadow-sm">
              <p className="text-center text-sm font-semibold text-emerald-800">{recordBanner}</p>
              <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-emerald-600 font-mono text-sm font-semibold text-white">
                    {'{ }'}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-emerald-900">{recordName}</p>
                    <p className="font-mono text-sm text-gray-700">{takeaway.artifactName}</p>
                  </div>
                </div>
                {recordSummary && <p className="mt-3 text-sm text-gray-500">{recordSummary}</p>}
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-emerald-600 text-sm text-white"
                  aria-hidden="true"
                >
                  &#10003;
                </span>
                <div className="text-sm leading-tight">
                  {fieldCount != null && (
                    <p className="font-medium text-emerald-900">
                      {fieldCount} of {fieldCount} fields captured
                    </p>
                  )}
                  <p className="text-emerald-700">JSON is valid</p>
                </div>
              </div>
            </div>

            <FlowArrow />

            {/* RIGHT: who reuses it (honest dependency language) */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:text-right">
                Who reuses it
              </h3>
              {consumers.map((c) => {
                const ic = CONSUMER_ICON[c.nodeId] || { name: 'doc', color: 'text-gray-500' }
                return (
                  <div
                    key={c.nodeId || c.name}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Icon name={ic.name} className={`mt-0.5 h-4 w-4 flex-none ${ic.color}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        {c.note && (
                          <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{c.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Capability statement - prominent, but secondary to the center node */}
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Icon name="bars" className="h-6 w-6 flex-none text-blue-600" />
          <p className="text-base font-semibold text-blue-900">{takeaway.capability}</p>
        </div>

        {/* Audit / provenance note */}
        {takeaway.auditNote && (
          <div className="flex items-start gap-2 px-1">
            <Icon name="shield" className="mt-0.5 h-4 w-4 flex-none text-gray-400" />
            <p className="text-xs text-gray-500">{takeaway.auditNote}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onReturnToCanvas()}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            &larr; Back to Map
          </button>
          {takeaway.nextNodeId && (
            <button
              type="button"
              onClick={() => onReturnToCanvas(takeaway.nextNodeId)}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next Node &rarr;
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Artifact + Complete badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
            {'{ }'}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{takeaway.artifactName}</p>
            <p className="text-xs text-gray-500">
              {lesson.intro?.recordName || takeaway.heading} &middot; created just now by you
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span aria-hidden="true">&#10003;</span> Complete
        </span>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Before</h3>
          <p className="mt-1 text-sm text-gray-700">{takeaway.before}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">After</h3>
          <p className="mt-1 text-sm text-emerald-900">{takeaway.after}</p>
        </div>
      </div>

      {/* Workflow map: created + honest consumer states */}
      <LessonWorkflowStrip
        nodeId={lesson.nodeId}
        mode="takeaway"
        directConsumers={lesson.intro?.directConsumers}
        consumerNotes={consumerNotes}
      />

      {/* Capability statement - the mission payoff */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-5 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
          The workflow can now do this
        </p>
        <p className="mt-1 text-lg font-semibold text-blue-900">{takeaway.capability}</p>
      </div>

      {/* Concept recap (secondary) */}
      {takeaway.points && takeaway.points.length > 0 && (
        <ul className="flex flex-col gap-1 px-1">
          {takeaway.points.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
              <span aria-hidden="true">&#10003;</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onReturnToCanvas()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          &larr; Back to Map
        </button>
        {takeaway.nextNodeId && (
          <button
            type="button"
            onClick={() => onReturnToCanvas(takeaway.nextNodeId)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Next Node &rarr;
          </button>
        )}
      </div>
    </div>
  )
}
