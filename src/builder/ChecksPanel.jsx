import { useState } from 'react'
import { Button, Icon } from '../components/ui'

// The build: the situation, the outcome, the desk's rules, and its
// acceptance checks. Hints are graduated and a last resort: a question
// first, then a nudge that names the concept, then the steps.

function hintsOf(build) {
  const h = build.hints
  if (Array.isArray(h)) return { question: null, nudge: null, steps: h }
  return { question: (h && h.question) || null, nudge: (h && h.nudge) || null, steps: (h && h.steps) || [] }
}

export default function ChecksPanel({
  build,
  results,
  stale,
  passedRec,
  hintLevel = 0,
  onHint,
  onNext,
  hasNext,
  onLoadExample,
  canLoadExample,
  allDone,
  pending = [],
  conceptLabel,
  onOpenConcept,
  onSelectRecord,
  stepProblem = null,
  plain = (t) => t,
}) {
  const hints = hintsOf(build)
  const passedCount = results ? results.filter((r) => r.passed).length : 0
  const [showPassed, setShowPassed] = useState(false)
  // One prioritized problem, not a stack: a step that broke beats a check
  // that missed, because the check usually missed because the step broke.
  const firstFail = results && !stale ? build.checks.map((c) => results.find((x) => x.id === c.id)).find((r) => r && !r.passed) : null
  const fixNext = firstFail ? plain(stepProblem || firstFail.detail) : null
  const gated = pending.length > 0
  const sorted = results ? [...build.checks].sort((a, b) => {
    const ra = results.find((x) => x.id === a.id)
    const rb = results.find((x) => x.id === b.id)
    return (ra && !ra.passed ? 0 : 1) - (rb && !rb.passed ? 0 : 1)
  }) : build.checks
  // While something fails, show only what fails; passing checks fold into one line.
  const failingCount = results ? results.filter((r) => !r.passed).length : 0
  const collapsePassed = failingCount > 0 && passedCount > 0 && !showPassed
  const visible = collapsePassed ? sorted.slice(0, failingCount) : sorted

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-sf-text">{build.title}</h2>
          {passedRec && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${passedRec.assisted ? 'bg-sf-warning-weak text-sf-progress-text' : 'bg-sf-complete-weak text-sf-complete-text'}`}>
              <Icon name="check" size={10} strokeWidth={3} /> {passedRec.assisted ? 'passed (assisted)' : 'passed'}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-sf-body">{build.brief || build.outcome || build.goal}</p>
        {(build.goal || (build.constraints && build.constraints.length > 0)) && (
          <details className="group mt-1">
            <summary className="cursor-pointer list-none text-[11px] font-medium text-sf-subtle hover:text-sf-accent">
              <span className="group-open:hidden">More about this build</span>
              <span className="hidden group-open:inline">Less</span>
            </summary>
            <p className="mt-1 text-xs leading-relaxed text-sf-body">{build.goal}</p>
            {build.constraints && build.constraints.length > 0 && (
              <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-[11px] text-sf-muted">
                {build.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </details>
        )}
      </div>

      {gated && (
        <div className="rounded-lg border border-sf-context bg-sf-context-weak p-2.5">
          <div className="text-xs font-semibold text-sf-context-text">First, try {pending.length === 1 ? 'this' : `these ${pending.length}`}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pending.map((id, i) => (
              <Button key={id} variant={i === 0 ? 'primary' : 'neutral'} size="sm" iconRight={i === 0 ? 'arrow-right' : undefined} onClick={() => onOpenConcept(id)}>
                {conceptLabel ? conceptLabel(id) : id}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Done when</span>
          {results && (
            <span className={`text-[10px] font-semibold ${passedCount === results.length ? 'text-sf-complete-text' : 'text-sf-muted'}`}>
              {passedCount} of {results.length}
              {stale ? ' - run again' : ''}
            </span>
          )}
        </div>
        {fixNext && (
          <div className="mb-1.5 flex items-start gap-2 rounded-lg border border-sf-warning bg-sf-warning-weak px-2.5 py-2">
            <Icon name="arrow-right" size={13} className="mt-0.5 flex-none text-sf-progress-text" />
            <div className="min-w-0 text-xs leading-snug text-sf-text">
              <span className="font-semibold">Fix this next: </span>
              {fixNext}
            </div>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {visible.map((c) => {
            const r = results ? results.find((x) => x.id === c.id) : null
            const state = !r ? 'pending' : r.passed ? 'pass' : 'fail'
            const firstWhere = c.where ? Object.values(c.where)[0] : null
            const recordLabel = firstWhere !== null && firstWhere !== undefined && firstWhere !== '' ? String(firstWhere) : c.recordLabel || null
            return (
              <li key={c.id} title={r && state === 'fail' ? [r.detail, c.why].filter(Boolean).join(' - ') : undefined} className={`rounded-md border border-sf-border-subtle px-2 py-1.5 ${state === 'pass' ? 'bg-sf-success-weak' : 'bg-sf-surface'} ${stale ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${state === 'pass' ? 'bg-sf-complete text-white' : state === 'fail' ? 'bg-sf-danger text-white' : 'border border-sf-border-strong'}`}>
                    {state === 'pass' && <Icon name="check" size={10} strokeWidth={3} />}
                    {state === 'fail' && <Icon name="x" size={10} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-sf-text">
                      <span>{c.label}</span>
                      {recordLabel && onSelectRecord && state !== 'pending' && (
                        <button type="button" onClick={() => onSelectRecord(recordLabel)} className="rounded bg-sf-surface px-1 font-mono text-[10px] text-sf-accent hover:underline" title="Show this record's path">
                          {recordLabel}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {failingCount > 0 && passedCount > 0 && (
          <button type="button" onClick={() => setShowPassed((v) => !v)} className="mt-1 flex items-center gap-1.5 px-2 text-[11px] text-sf-complete-text hover:underline">
            <Icon name="check" size={11} strokeWidth={3} />
            {showPassed ? 'Hide passing' : `${passedCount} passing`}
          </button>
        )}
      </div>

      {!passedRec && hintLevel > 0 && (
        <div className="flex flex-col gap-1 rounded-lg bg-sf-surface-subtle px-2.5 py-2 text-xs text-sf-body">
          {hints.question && <p className="italic text-sf-text">{hints.question}</p>}
          {hintLevel >= 2 && hints.nudge && <p>{hints.nudge}</p>}
          {hintLevel >= 3 && hints.steps.length > 0 && (
            <ol className="flex list-decimal flex-col gap-0.5 pl-5 text-[11px] leading-relaxed">
              {hints.steps.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!passedRec && !gated && hintLevel < 3 && (
            <button type="button" onClick={() => onHint(hintLevel + 1)} className="text-[11px] font-medium text-sf-accent hover:underline">
              {hintLevel === 0 ? 'Hint' : 'Another hint'}
            </button>
          )}
          {canLoadExample && (
            <button type="button" onClick={onLoadExample} className="text-[11px] text-sf-subtle hover:text-sf-accent hover:underline" title="Replace your flows with the example solution through this build; the build is marked assisted">
              Show the answer
            </button>
          )}
        </div>
        {passedRec && hasNext && (
          <Button variant="success" size="sm" iconRight="arrow-right" onClick={onNext}>
            Next build
          </Button>
        )}
        {passedRec && !hasNext && allDone && <span className="text-xs font-semibold text-sf-complete-text">You built the {build.moduleTitle || 'whole desk'}.</span>}
      </div>
    </div>
  )
}
