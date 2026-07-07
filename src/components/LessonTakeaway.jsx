import LessonWorkflowStrip from './LessonWorkflowStrip'
import { Button, SignalFlowDiagram } from './ui'

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

const CONSUMER_ICON = {
  'risk-evaluation': { name: 'shield', color: 'text-sf-type-reference' },
  'approval-decision': { name: 'person', color: 'text-sf-muted' },
  'morning-brief': { name: 'doc', color: 'text-sf-accent' },
}

// Transfer beat: how this same step is rebuilt in the real world, by hand and in
// the three automation platforms learners are most likely to meet. Rendered on
// every takeaway layout (the Takeaway screen may scroll, so this is safe).
const REAL_WORLD_TOOLS = [
  ['Power Automate', 'powerAutomate'],
  ['Zapier', 'zapier'],
  ['Python', 'python'],
]

function RealWorldPanel({ realWorld }) {
  if (!realWorld) return null
  const tools = realWorld.tools || {}
  return (
    <section className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
      <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
        Take this to work
      </h3>
      {realWorld.soloRebuildPath && (
        <p className="mt-2 text-sm text-sf-body">{realWorld.soloRebuildPath}</p>
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {REAL_WORLD_TOOLS.map(([name, key]) =>
          tools[key] ? (
            <div key={key} className="rounded-lg border border-sf-border-subtle bg-sf-surface-subtle p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
                {name}
              </dt>
              <dd className="mt-1 text-xs leading-snug text-sf-body">{tools[key]}</dd>
            </div>
          ) : null
        )}
      </dl>
    </section>
  )
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
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-xl border border-sf-complete bg-sf-success-weak p-5 shadow-sf-sm">
            <h2 className="text-lg font-semibold text-sf-complete-text">{takeaway.heading}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {takeaway.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-sf-complete-text">
                  <span aria-hidden="true">&#10003;</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Button variant="success" size="md" className="mt-5" onClick={() => onReturnToCanvas()}>
              Return to Canvas
            </Button>
          </section>

          <aside className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
            <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
              Artifact produced
            </h3>
            <p className="mt-1 text-sm font-medium text-sf-text">{takeaway.artifactName}</p>
            {artifact && (
              <pre className="mt-3 overflow-auto rounded-md bg-sf-surface-subtle p-3 text-sm text-sf-body">
                {typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)}
              </pre>
            )}
          </aside>
        </div>
        <RealWorldPanel realWorld={takeaway.realWorld} />
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
      lesson.validation?.fields?.length ||
      (artifact && typeof artifact === 'object' ? Object.keys(artifact).length : null)

    return (
      <div className="flex flex-col gap-4">
        {/* Workflow diagram: incoming signals -> the record you built -> consumers */}
        <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm sm:p-5">
          <SignalFlowDiagram
            intensity="primary"
            inputTone="upstream"
            inputLabel="raw signal"
            inputHeader="What came in"
            outputTone="completed"
            outputLabel="trusted signal"
            outputHeader="Who reuses it"
            inputs={[
              (
                <div key="notes" className="rounded-lg border border-sf-border bg-sf-surface p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="note" className="h-4 w-4 flex-none text-sf-muted" />
                    <div>
                      <p className="text-sm font-semibold text-sf-text">{came.noteTitle}</p>
                      {came.noteSubtitle && (
                        <p className="text-[11px] text-sf-muted">{came.noteSubtitle}</p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 rounded-md border border-dashed border-sf-border bg-sf-surface-subtle p-2 font-mono text-[11px] leading-snug text-sf-muted">
                    {lesson.input}
                  </p>
                </div>
              ),
              came.flagTitle || came.flagCue ? (
                <div key="flag" className="rounded-lg border border-sf-border bg-sf-surface p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="flag" className="h-4 w-4 flex-none text-sf-muted" />
                    <div>
                      <p className="text-sm font-semibold text-sf-text">{came.flagTitle}</p>
                      {came.flagSubtitle && (
                        <p className="text-[11px] text-sf-muted">{came.flagSubtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {came.flagCue && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sf-warning bg-sf-progress-weak px-2 py-0.5 text-[11px] font-medium text-sf-progress-text">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sf-warning" />
                        {came.flagCue}
                      </span>
                    )}
                    {came.flagNote && (
                      <span className="text-[11px] text-sf-muted">{came.flagNote}</span>
                    )}
                  </div>
                </div>
              ) : null,
            ].filter(Boolean)}
            center={
              <div className="w-full rounded-xl border-2 border-sf-complete bg-sf-success-weak p-4 shadow-sf-sm">
                <p className="text-center text-sm font-semibold text-sf-complete-text">{recordBanner}</p>
                <div className="mt-3 rounded-lg border border-sf-trusted-border bg-sf-surface p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-sf-complete font-mono text-sm font-semibold text-white">
                      {'{ }'}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-sf-complete-text">{recordName}</p>
                      <p className="font-mono text-sm text-sf-body">{takeaway.artifactName}</p>
                    </div>
                  </div>
                  {recordSummary && <p className="mt-3 text-sm text-sf-muted">{recordSummary}</p>}
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sf-complete text-sm text-white"
                    aria-hidden="true"
                  >
                    &#10003;
                  </span>
                  <div className="text-sm leading-tight">
                    {fieldCount != null && (
                      <p className="font-medium text-sf-complete-text">
                        {fieldCount} of {fieldCount} fields captured
                      </p>
                    )}
                    <p className="text-sf-complete-text">JSON is valid</p>
                  </div>
                </div>
              </div>
            }
            consumers={consumers.map((c) => {
              const ic = CONSUMER_ICON[c.nodeId] || { name: 'doc', color: 'text-sf-muted' }
              return (
                <div key={c.nodeId || c.name} className="rounded-lg border border-sf-border bg-sf-surface p-3">
                  <div className="flex items-start gap-2">
                    <Icon name={ic.name} className={`mt-0.5 h-4 w-4 flex-none ${ic.color}`} />
                    <div>
                      <p className="text-sm font-semibold text-sf-text">{c.name}</p>
                      {c.note && (
                        <p className="mt-0.5 text-[11px] leading-snug text-sf-muted">{c.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          />
        </div>

        {/* Capability statement - prominent, but secondary to the center node */}
        <div className="flex items-center gap-3 rounded-xl border border-sf-accent-border bg-sf-accent-weak p-4">
          <Icon name="bars" className="h-6 w-6 flex-none text-sf-accent" />
          <p className="text-base font-semibold text-sf-accent-text">{takeaway.capability}</p>
        </div>

        {/* Audit / provenance note */}
        {takeaway.auditNote && (
          <div className="flex items-start gap-2 px-1">
            <Icon name="shield" className="mt-0.5 h-4 w-4 flex-none text-sf-subtle" />
            <p className="text-xs text-sf-muted">{takeaway.auditNote}</p>
          </div>
        )}

        <RealWorldPanel realWorld={takeaway.realWorld} />

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="neutral" size="md" icon="arrow-left" onClick={() => onReturnToCanvas()}>
            Back to Map
          </Button>
          {takeaway.nextNodeId && (
            <Button variant="primary" size="md" iconRight="arrow-right" onClick={() => onReturnToCanvas(takeaway.nextNodeId)}>
              Next Node
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Artifact + Complete badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-sf-surface-inset px-2 py-1 font-mono text-xs text-sf-body">
            {'{ }'}
          </span>
          <div>
            <p className="text-sm font-semibold text-sf-text">{takeaway.artifactName}</p>
            <p className="text-xs text-sf-muted">
              {lesson.intro?.recordName || takeaway.heading} &middot; created just now by you
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-sf-complete bg-sf-complete-weak px-2.5 py-0.5 text-xs font-medium text-sf-complete-text">
          <span aria-hidden="true">&#10003;</span> Complete
        </span>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-sf-border bg-sf-surface-subtle p-4">
          <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">Before</h3>
          <p className="mt-1 text-sm text-sf-body">{takeaway.before}</p>
        </div>
        <div className="rounded-xl border border-sf-complete bg-sf-success-weak p-4">
          <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-complete-text">After</h3>
          <p className="mt-1 text-sm text-sf-complete-text">{takeaway.after}</p>
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
      <div className="rounded-xl border border-sf-accent-border bg-sf-accent-weak p-5 text-center shadow-sf-sm">
        <p className="text-[11px] font-semibold uppercase tracking-sf-wide text-sf-accent-text">
          The workflow can now do this
        </p>
        <p className="mt-1 text-lg font-semibold text-sf-accent-text">{takeaway.capability}</p>
      </div>

      {/* Concept recap (secondary) */}
      {takeaway.points && takeaway.points.length > 0 && (
        <ul className="flex flex-col gap-1 px-1">
          {takeaway.points.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-sf-muted">
              <span aria-hidden="true">&#10003;</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      <RealWorldPanel realWorld={takeaway.realWorld} />

      <div className="flex flex-wrap gap-3">
        <Button variant="neutral" size="md" icon="arrow-left" onClick={() => onReturnToCanvas()}>
          Back to Map
        </Button>
        {takeaway.nextNodeId && (
          <Button variant="primary" size="md" iconRight="arrow-right" onClick={() => onReturnToCanvas(takeaway.nextNodeId)}>
            Next Node
          </Button>
        )}
      </div>
    </div>
  )
}
