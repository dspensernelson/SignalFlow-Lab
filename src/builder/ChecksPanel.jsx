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
  index,
  total,
  dayLabel,
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
}) {
  const hints = hintsOf(build)
  const passedCount = results ? results.filter((r) => r.passed).length : 0
  const gated = pending.length > 0
  const sorted = results ? [...build.checks].sort((a, b) => {
    const ra = results.find((x) => x.id === a.id)
    const rb = results.find((x) => x.id === b.id)
    return (ra && !ra.passed ? 0 : 1) - (rb && !rb.passed ? 0 : 1)
  }) : build.checks

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Build {index + 1} of {total}
          </span>
          {dayLabel && <span className="rounded-full bg-sf-surface-inset px-2 py-0.5 text-[10px] font-medium text-sf-muted">{dayLabel}</span>}
          {passedRec && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${passedRec.assisted ? 'bg-sf-warning-weak text-sf-progress-text' : 'bg-sf-complete-weak text-sf-complete-text'}`}>
              <Icon name="check" size={10} strokeWidth={3} /> {passedRec.assisted ? 'passed (assisted)' : 'passed'}
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-sf-text">{build.title}</h2>
        {build.outcome && <p className="mt-0.5 text-xs font-semibold text-sf-text">{build.outcome}</p>}
        <p className="mt-0.5 text-xs leading-relaxed text-sf-body">{build.goal}</p>
        {build.constraints && build.constraints.length > 0 && (
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {build.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-sf-body">
                <Icon name="shield" size={11} className="mt-0.5 flex-none text-sf-muted" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {gated && (
        <div className="rounded-lg border border-sf-context bg-sf-context-weak p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-context-text">Before this build</div>
          <p className="mt-0.5 text-[11px] text-sf-body">This build uses {pending.length === 1 ? 'a concept' : `${pending.length} concepts`} you have not met yet. Each one is a two-minute sample you run yourself, then see in every tool.</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {pending.map((id, i) => (
              <li key={id} className="flex items-center justify-between gap-2 rounded-md bg-sf-surface px-2 py-1">
                <span className="text-xs font-medium text-sf-text">{conceptLabel ? conceptLabel(id) : id}</span>
                <Button variant={i === 0 ? 'primary' : 'neutral'} size="sm" iconRight="arrow-right" onClick={() => onOpenConcept(id)}>
                  {i === 0 ? 'Start' : 'Open'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Done when</span>
          {results && (
            <span className={`text-[10px] font-semibold ${passedCount === results.length ? 'text-sf-complete-text' : 'text-sf-muted'}`}>
              {passedCount} of {results.length}
              {stale ? ' (run again to refresh)' : ''}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-1">
          {sorted.map((c) => {
            const r = results ? results.find((x) => x.id === c.id) : null
            const state = !r ? 'pending' : r.passed ? 'pass' : 'fail'
            const recordLabel = c.where ? String(Object.values(c.where)[0]) : c.recordLabel || null
            return (
              <li key={c.id} className={`rounded-md border px-2 py-1.5 ${state === 'pass' ? 'border-sf-complete bg-sf-success-weak' : state === 'fail' ? 'border-sf-danger bg-sf-danger-weak' : 'border-sf-border bg-sf-surface'} ${stale ? 'opacity-70' : ''}`}>
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
                    {r && state === 'fail' && <div className="mt-0.5 text-[11px] leading-snug text-sf-danger">{r.detail}</div>}
                    {r && state === 'fail' && c.why && <div className="mt-0.5 text-[11px] leading-snug text-sf-body">Why it matters: {c.why}</div>}
                    {r && state === 'pass' && r.detail && <div className="mt-0.5 text-[11px] leading-snug text-sf-complete-text">{r.detail}</div>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {!passedRec && (
        <div className="rounded-lg border border-sf-border bg-sf-surface p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Stuck?</span>
            <span className="text-[10px] text-sf-subtle">{hintLevel === 0 ? 'Try the data first' : `hint ${hintLevel} of 3`}</span>
          </div>
          {hintLevel >= 1 && hints.question && <p className="mt-1 text-xs italic text-sf-text">{hints.question}</p>}
          {hintLevel >= 2 && hints.nudge && <p className="mt-1 text-xs text-sf-body">{hints.nudge}</p>}
          {hintLevel >= 3 && hints.steps.length > 0 && (
            <ol className="mt-1 flex list-decimal flex-col gap-0.5 pl-5 text-[11px] leading-relaxed text-sf-body">
              {hints.steps.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ol>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            {hintLevel < 3 && (
              <button type="button" onClick={() => onHint(hintLevel + 1)} className="text-[11px] font-medium text-sf-accent hover:underline">
                {hintLevel === 0 ? (hints.question ? 'Ask me a question' : 'Show me the steps') : hintLevel === 1 ? (hints.nudge ? 'Give me a nudge' : 'Show me the steps') : 'Show me the steps'}
              </button>
            )}
            {hintLevel >= 1 && hintLevel < 3 && !hints.question && !hints.nudge && null}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        {canLoadExample ? (
          <button type="button" onClick={onLoadExample} className="text-[11px] text-sf-subtle hover:text-sf-accent hover:underline" title="Replace your flows with the example solution through this build; the build is marked assisted">
            Load the example (marks this build assisted)
          </button>
        ) : (
          <span />
        )}
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
