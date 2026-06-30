import LessonWorkflowStrip from './LessonWorkflowStrip'

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

function CardHead({ num, title, sub, tone }) {
  const toneCls =
    { blue: 'bg-blue-600 text-white', green: 'bg-emerald-600 text-white' }[tone] ||
    'bg-gray-600 text-white'
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold ${toneCls}`}
      >
        {num}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function StepArrow() {
  return (
    <div className="hidden items-center justify-center text-gray-300 lg:flex">
      <span aria-hidden="true" className="text-xl">
        &rarr;
      </span>
    </div>
  )
}

// Step 1 of the reusable lesson template: prepare the user before the exercise.
// Lessons that define intro.mission render the Hybrid B "mission path" layout;
// lessons with intro.subtitle (but no mission) render the earlier artifact hero;
// others fall back to the original layout so unmigrated lessons are unchanged.
export default function LessonIntro({ lesson, onContinue }) {
  const intro = lesson.intro
  const missionPath = Boolean(intro.mission)
  const rich = Boolean(intro.subtitle)

  if (missionPath) {
    const came = intro.whatCameIn || {}
    const job = intro.yourJob || {}
    const unlocks = intro.unlocks || {}
    return (
      <div className="flex flex-col gap-4">
        {/* Mission statement: blocked until the note becomes a record */}
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon name="target" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-gray-900">{intro.mission}</p>
            {intro.missionSubtext && (
              <p className="mt-0.5 text-sm text-gray-500">{intro.missionSubtext}</p>
            )}
          </div>
        </div>

        {/* What came in -> Your job -> What this unlocks */}
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* Card 1: What came in */}
          <section className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
            <CardHead num="1" tone="blue" title="What came in" sub={came.label} />
            <div className="mt-3 flex flex-col gap-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Icon name="note" className="h-4 w-4" />
                  <span className="text-sm font-semibold">{came.noteTitle || 'Analyst Notes'}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{lesson.input}</p>
              </div>
              {came.flagCue && (
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="flag" className="h-4 w-4" />
                    <span className="text-sm font-semibold">{came.flagTitle || 'Trader Flag'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <Icon name="target" className="h-3 w-3" /> {came.flagCue}
                    </span>
                    {came.flagNote && <span className="text-xs text-gray-600">{came.flagNote}</span>}
                  </div>
                  {(came.flagType || came.flagRequestedBy) && (
                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 text-xs">
                      {came.flagType && (
                        <div>
                          <dt className="text-gray-400">Flag type</dt>
                          <dd className="font-medium text-gray-700">{came.flagType} &rsaquo;</dd>
                        </div>
                      )}
                      {came.flagRequestedBy && (
                        <div>
                          <dt className="text-gray-400">Requested by</dt>
                          <dd className="font-medium text-gray-700">{came.flagRequestedBy}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              )}
            </div>
          </section>

          <StepArrow />

          {/* Card 2: Your job (strongest card) */}
          <section className="flex flex-col rounded-lg border-2 border-blue-400 bg-white p-4 shadow-sm">
            <CardHead num="2" tone="blue" title="Your job" sub={job.label} />
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-blue-50 font-mono text-xs text-blue-600">
                {'{ }'}
              </span>
              <span className="text-base font-semibold text-blue-700">
                {job.artifact || `Create ${intro.artifactName}`}
              </span>
            </div>
            {job.description && <p className="mt-1 text-xs text-gray-500">{job.description}</p>}
            <ul className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
              {(job.signals || []).map((s) => (
                <li key={s.group} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-600">
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.group}</p>
                    {s.detail && <p className="text-xs text-gray-500">{s.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <StepArrow />

          {/* Card 3: Who reuses it (honest, still-waiting consumers) */}
          <section className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
            <CardHead num="3" tone="green" title="Who reuses it" sub={unlocks.label} />
            <ul className="mt-3 flex flex-col gap-3">
              {(unlocks.consumers || []).map((c) => (
                <li
                  key={c.name}
                  className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <Icon name={c.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      {c.status && (
                        <span className="inline-flex flex-none items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          {c.status}
                        </span>
                      )}
                    </div>
                    {c.needs && <p className="mt-0.5 text-xs text-gray-500">{c.needs}</p>}
                    {c.can && <p className="mt-1 text-xs font-medium text-emerald-700">{c.can}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Compact artifact shape + primary action */}
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gray-100 font-mono text-xs text-gray-500">
              {'{ }'}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Artifact preview{' '}
                <span className="font-normal normal-case text-gray-400">(skeleton)</span>
              </p>
              <pre className="mt-1 overflow-auto rounded-md bg-gray-50 px-2 py-1 font-mono text-[11px] leading-relaxed text-gray-600">
                {lesson.starterAnswer}
              </pre>
            </div>
          </div>
          {intro.artifactPreviewNote && (
            <p className="max-w-xs text-xs text-gray-500">{intro.artifactPreviewNote}</p>
          )}
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <button
              type="button"
              onClick={onContinue}
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start Building &rarr;
            </button>
            <span className="flex items-center gap-1 text-xs text-gray-400">
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
          <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">{intro.heading}</h2>
            <div className="mt-4 flex flex-col gap-4">
              {intro.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{section.body}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                JSON Example
              </h3>
              <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 font-mono text-sm text-gray-800">
                {intro.jsonExample}
              </pre>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <dl className="flex flex-col gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    You will produce
                  </dt>
                  <dd className="text-sm font-medium text-gray-800">{intro.artifactName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Skill you are practicing
                  </dt>
                  <dd className="text-sm font-medium text-gray-800">{intro.skill}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        <div>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue to Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5">
          {intro.concept && (
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Concept: {intro.concept}
            </span>
          )}
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            {intro.recordName || intro.heading}
          </h2>
          {intro.subtitle && <p className="mt-1 text-sm text-gray-500">{intro.subtitle}</p>}
          {intro.summary && <p className="mt-3 text-sm text-gray-700">{intro.summary}</p>}

          <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4">
            {intro.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Artifact preview: {intro.artifactName}
          </h3>
          <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 font-mono text-sm text-gray-800">
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
        <button
          type="button"
          onClick={onContinue}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Start Building &rarr;
        </button>
      </div>
    </div>
  )
}
