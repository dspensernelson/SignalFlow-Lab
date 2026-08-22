import LessonWorkflowStrip from './LessonWorkflowStrip'
import { Button, SignalFlowDiagram } from './ui'
import { ActionKindChip } from './LessonTakeaway'

// Small inline icon set so the mission path reads like a work-order screen
// without pulling in an icon dependency. Unknown names render nothing.
function Icon({ name, className = 'h-4 w-4' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  switch (name) {
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )
    case 'note':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common}>
          <path d="M6 21V4" />
          <path d="M6 4h10l-2 3 2 3H6" />
        </svg>
      )
    case 'market':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.4 2.5 15.6 0 18" />
          <path d="M12 3c-2.5 2.4-2.5 15.6 0 18" />
        </svg>
      )
    case 'price':
      return (
        <svg {...common}>
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M16 7c0-1.7-1.8-3-4-3s-4 1.1-4 2.8c0 3.7 8 2 8 5.6C16 14.9 14.2 16 12 16s-4-1.3-4-3" />
        </svg>
      )
    case 'operating':
      return (
        <svg {...common}>
          <path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" />
          <path d="M3 12h16a2.5 2.5 0 1 1-2.5 2.5" />
          <path d="M3 16h9a2.5 2.5 0 1 1-2.5 2.5" />
        </svg>
      )
    case 'control':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        </svg>
      )
    case 'risk':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'approval':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
        </svg>
      )
    case 'brief':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v4h4" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      )
    default:
      return null
  }
}

// Step 1 of the reusable lesson template: prepare the user before the exercise.
// Lessons that define intro.mission render the Hybrid B "mission path" layout;
// lessons with intro.subtitle (but no mission) render the earlier artifact hero;
// others fall back to the original layout so unmigrated lessons are unchanged.
export default function LessonIntro({ lesson, onContinue }) {
  const intro = lesson.intro
  const missionPath = Boolean(intro.mission)
  const rich = Boolean(intro.subtitle)
  // The kind-of-action chip is the one concept label every lesson carries
  // (intro.concept is authored on only one lesson). It names what this step IS
  // in any tool, and its tooltip carries the gloss - see automationTaxonomy.json.
  const actionKind = lesson.takeaway?.realWorld?.actionKind

  if (missionPath) {
    const came = intro.whatCameIn || {}
    const job = intro.yourJob || {}
    const unlocks = intro.unlocks || {}
    return (
      <div className="flex flex-col gap-4">
        {actionKind && (
          <div className="flex flex-wrap items-center gap-2">
            <ActionKindChip actionKind={actionKind} />
          </div>
        )}
        {/* Mission statement: blocked until the note becomes a record */}
        <div className="flex items-start gap-3 rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
          <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sf-accent-weak text-sf-accent">
            <Icon name="target" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-sf-text">{intro.mission}</p>
            {intro.missionSubtext && (
              <p className="mt-0.5 text-sm text-sf-muted">{intro.missionSubtext}</p>
            )}
          </div>
        </div>

        {/* What came in -> Your job -> Who reuses it (branching signal flow) */}
        <SignalFlowDiagram
          inputTone="upstream"
          inputLabel="raw signal"
          inputHeader="What came in"
          outputTone="downstream"
          outputLabel="reused by"
          outputHeader="Who reuses it"
          inputs={[
            (
              <div key="notes" className="rounded-md border border-sf-border bg-sf-surface-subtle p-3">
                <div className="flex items-center gap-2 text-sf-body">
                  <Icon name="note" className="h-4 w-4" />
                  <span className="text-sm font-semibold">{came.noteTitle || 'Analyst Notes'}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-sf-muted">{lesson.input}</p>
              </div>
            ),
            came.flagCue ? (
              <div key="flag" className="rounded-md border border-sf-border bg-sf-surface p-3">
                <div className="flex items-center gap-2 text-sf-body">
                  <Icon name="flag" className="h-4 w-4" />
                  <span className="text-sm font-semibold">{came.flagTitle || 'Trader Flag'}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-sf-warning bg-sf-progress-weak px-2 py-0.5 text-xs font-medium text-sf-progress-text">
                    <Icon name="target" className="h-3 w-3" /> {came.flagCue}
                  </span>
                  {came.flagNote && <span className="text-xs text-sf-muted">{came.flagNote}</span>}
                </div>
                {(came.flagType || came.flagRequestedBy) && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-sf-border-subtle pt-2 text-xs">
                    {came.flagType && (
                      <div>
                        <dt className="text-sf-subtle">Flag type</dt>
                        <dd className="font-medium text-sf-body">{came.flagType} &rsaquo;</dd>
                      </div>
                    )}
                    {came.flagRequestedBy && (
                      <div>
                        <dt className="text-sf-subtle">Requested by</dt>
                        <dd className="font-medium text-sf-body">{came.flagRequestedBy}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            ) : null,
          ].filter(Boolean)}
          center={
            <div className="w-full rounded-xl border-2 border-sf-accent-border bg-sf-surface p-4 shadow-sf-md">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-sf-text">Your job</p>
                {job.label && <span className="text-[11px] text-sf-subtle">{job.label}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-sf-accent-weak font-mono text-xs text-sf-accent">
                  {'{ }'}
                </span>
                <span className="text-base font-semibold text-sf-accent-text">
                  {job.artifact || `Create ${intro.artifactName}`}
                </span>
              </div>
              {job.description && <p className="mt-1 text-xs text-sf-muted">{job.description}</p>}
              <ul className="mt-3 flex flex-col gap-3 border-t border-sf-border-subtle pt-3">
                {(job.signals || []).map((s) => (
                  <li key={s.group} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-sf-surface-inset text-sf-body">
                      <Icon name={s.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-sf-text">{s.group}</p>
                      {s.detail && <p className="text-xs text-sf-muted">{s.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          }
          consumers={(unlocks.consumers || []).map((c) => (
            <div key={c.name} className="rounded-md border border-sf-border bg-sf-surface p-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-sf-complete-weak text-sf-complete-text">
                  <Icon name={c.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-sf-text">{c.name}</p>
                    {c.status && (
                      <span className="inline-flex flex-none items-center rounded-full border border-sf-border bg-sf-surface-subtle px-2 py-0.5 text-[11px] font-medium text-sf-muted">
                        {c.status}
                      </span>
                    )}
                  </div>
                  {c.needs && <p className="mt-0.5 text-xs text-sf-muted">{c.needs}</p>}
                  {c.can && <p className="mt-1 text-xs font-medium text-sf-complete-text">{c.can}</p>}
                </div>
              </div>
            </div>
          ))}
        />

        {/* Compact artifact shape + primary action */}
        <div className="flex flex-col gap-3 rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-sf-surface-inset font-mono text-xs text-sf-muted">
              {'{ }'}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
                Artifact preview{' '}
                <span className="font-normal normal-case text-sf-subtle">(skeleton)</span>
              </p>
              <pre className="mt-1 overflow-auto rounded-md bg-sf-surface-subtle px-2 py-1 font-mono text-[11px] leading-relaxed text-sf-muted">
                {lesson.starterAnswer}
              </pre>
            </div>
          </div>
          {intro.artifactPreviewNote && (
            <p className="max-w-xs text-xs text-sf-muted">{intro.artifactPreviewNote}</p>
          )}
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <Button variant="primary" size="md" iconRight="arrow-right" onClick={onContinue}>
              Start Building
            </Button>
            <span className="flex items-center gap-1 text-xs text-sf-subtle">
              <Icon name="control" className="h-3 w-3" /> You can validate in the next step
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (!rich) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-xl border border-sf-border bg-sf-surface p-5 shadow-sf-sm">
            {actionKind && <ActionKindChip actionKind={actionKind} className="mb-3" />}
            <h2 className="text-lg font-semibold text-sf-text">{intro.heading}</h2>
            <div className="mt-4 flex flex-col gap-4">
              {intro.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-sf-text">{section.title}</h3>
                  <p className="mt-1 text-sm text-sf-body">{section.body}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
                JSON Example
              </h3>
              <pre className="mt-2 overflow-auto rounded-md bg-sf-surface-subtle p-3 font-mono text-sm text-sf-body">
                {intro.jsonExample}
              </pre>
            </div>
            <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
              <dl className="flex flex-col gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
                    You will produce
                  </dt>
                  <dd className="text-sm font-medium text-sf-text">{intro.artifactName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
                    Skill you are practicing
                  </dt>
                  <dd className="text-sm font-medium text-sf-text">{intro.skill}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        <LessonWorkflowStrip nodeId={lesson.nodeId} mode="overview" />

        <div>
          <Button variant="primary" size="md" onClick={onContinue}>
            Continue to Exercise
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-sf-border bg-sf-surface p-5 shadow-sf-sm">
          <div className="flex flex-wrap items-center gap-2">
            {intro.concept && (
              <span className="inline-flex items-center rounded-full border border-sf-accent-border bg-sf-accent-weak px-2.5 py-0.5 text-xs font-medium text-sf-accent-text">
                Concept: {intro.concept}
              </span>
            )}
            {actionKind && <ActionKindChip actionKind={actionKind} />}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-sf-text">
            {intro.recordName || intro.heading}
          </h2>
          {intro.subtitle && <p className="mt-1 text-sm text-sf-muted">{intro.subtitle}</p>}
          {intro.summary && <p className="mt-3 text-sm text-sf-body">{intro.summary}</p>}

          <div className="mt-4 flex flex-col gap-4 border-t border-sf-border-subtle pt-4">
            {intro.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-sf-text">{section.title}</h3>
                <p className="mt-1 text-sm text-sf-body">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
          <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Artifact preview: {intro.artifactName}
          </h3>
          <pre className="mt-2 overflow-auto rounded-md bg-sf-surface-subtle p-3 font-mono text-sm text-sf-body">
            {lesson.starterAnswer}
          </pre>
        </aside>
      </div>

      <LessonWorkflowStrip
        nodeId={lesson.nodeId}
        mode="overview"
        directConsumers={intro.directConsumers}
      />

      <div>
        <Button variant="primary" size="md" iconRight="arrow-right" onClick={onContinue}>
          Start Building
        </Button>
      </div>
    </div>
  )
}
