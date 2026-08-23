import CopilotPromptCard from './CopilotPromptCard'
import { Badge, Button, ScrollArea } from './ui'

// Exercise workspace for interactionType "runInspect" (operations lessons).
// Left: a run history for the module's own automation, with one failed step and
// its error. Right: the diagnosis form - which step failed, why, what to do, and
// where to re-run from. The learner answers by READING A RUN, not by recalling
// prose, which is what separates this from choiceCheck.
//
// The answer serializes as { fieldId: value }. See
// ENGINE_ADDITIONS_SPEC_OPERATIONS.md section 2.3.

// Badge tones are: progress, complete, context, locked, neutral. There is no
// 'warning' tone - it would silently fall back to neutral.
const STATUS_TONE = {
  succeeded: 'complete',
  failed: 'progress',
  skipped: 'locked',
  timedOut: 'progress',
  throttled: 'progress',
}

const STATUS_MARK = {
  succeeded: '✓',
  failed: '✗',
  skipped: '–',
  timedOut: '⧖',
  throttled: '≈',
}

function formatDuration(ms) {
  if (typeof ms !== 'number') return ''
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function RunInspectExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const validation = lesson.validation || {}
  const run = validation.run || {}
  const steps = run.steps || []
  const fields = validation.fields || []

  let values = {}
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) values = parsed
  } catch {
    values = {}
  }

  const hasResults = Boolean(results && results.length > 0)
  const resultByField = {}
  if (hasResults) {
    results.forEach((r) => {
      const match = r.id.match(/^inspect-(.+)$/)
      if (match) resultByField[match[1]] = r
    })
  }

  const failedFields = fields
    .map((field) => ({ field, result: resultByField[field.id] }))
    .filter((entry) => entry.result && !entry.result.passed)
  const primary = failedFields[0]
  const correctCount = fields.length - failedFields.length

  function setValue(fieldId, value) {
    onAnswerChange(JSON.stringify({ ...values, [fieldId]: value }))
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 short:gap-2 lg:grid-cols-12">
      {/* Left: the run history */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
              Run history
            </h3>
            <div className="flex items-center gap-1.5">
              {run.environment && <Badge tone="context">{run.environment}</Badge>}
              {run.status && (
                <Badge tone={STATUS_TONE[run.status] || 'neutral'}>{run.status}</Badge>
              )}
            </div>
          </div>
          <dl className="mt-1.5 grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 text-[11px] text-sf-body">
            <dt className="text-sf-subtle">Run</dt>
            <dd className="font-mono">{run.id}</dd>
            <dt className="text-sf-subtle">Trigger</dt>
            <dd>{run.trigger}</dd>
            <dt className="text-sf-subtle">Started</dt>
            <dd>{run.startedAt}</dd>
          </dl>

          <ScrollArea
            className={`mt-2 ${steps.length > 6 ? 'max-h-[300px] short:max-h-[200px]' : ''}`}
          >
            <ol className="flex flex-col gap-1">
              {steps.map((step) => {
                const bad = step.status !== 'succeeded' && step.status !== 'skipped'
                return (
                  <li
                    key={step.id}
                    className={`rounded-md border p-1.5 ${
                      bad
                        ? 'border-sf-warning bg-sf-progress-weak'
                        : 'border-sf-border-subtle bg-sf-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-sf-body">
                        <span aria-hidden="true" className="text-sf-subtle">
                          {STATUS_MARK[step.status] || '•'}
                        </span>
                        <span className="font-medium">{step.name}</span>
                      </span>
                      <span className="shrink-0 text-[10px] uppercase tracking-sf-wide text-sf-subtle">
                        {step.status}
                        {step.durationMs ? ` · ${formatDuration(step.durationMs)}` : ''}
                      </span>
                    </div>
                    {step.error && (
                      <p
                        title={step.error}
                        className="mt-1 truncate font-mono text-[10px] leading-snug text-sf-progress-text"
                      >
                        {step.error}
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          </ScrollArea>
        </div>

        <details className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <summary className="cursor-pointer text-sm text-sf-body">
            Need help? Show Copilot prompt
          </summary>
          <div className="mt-3">
            <CopilotPromptCard prompt={lesson.copilotPrompt} />
          </div>
        </details>
      </div>

      {/* Right: the diagnosis + bounded readiness feedback */}
      <div className="flex flex-col gap-3 short:gap-2 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Diagnose the run
          </h3>
          <div className="mt-2 flex flex-col gap-2 short:gap-1">
            {fields.map((field) => {
              const result = resultByField[field.id]
              const failed = Boolean(result && !result.passed)
              const ok = Boolean(result && result.passed)
              const options =
                field.kind === 'step'
                  ? steps.map((s) => ({ value: s.id, label: s.name }))
                  : (field.options || []).map((o) => ({ value: o, label: o }))
              return (
                <label
                  key={field.id}
                  className={`flex items-center justify-between gap-2 rounded-md border p-2 short:p-1.5 ${
                    failed
                      ? 'border-sf-warning bg-sf-progress-weak'
                      : ok
                        ? 'border-sf-complete bg-sf-success-weak'
                        : 'border-sf-border-subtle bg-sf-surface-subtle'
                  }`}
                >
                  <span className="text-xs font-semibold text-sf-body">{field.label}</span>
                  <select
                    value={values[field.id] || ''}
                    onChange={(event) => setValue(field.id, event.target.value)}
                    className="min-w-[10rem] max-w-[60%] rounded border border-sf-border-strong bg-sf-surface px-1.5 py-0.5 text-xs text-sf-body"
                  >
                    <option value="">Choose...</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              )
            })}
          </div>
          <div className="mt-3">
            <Button variant="primary" size="md" onClick={onValidate}>
              {lesson.validateLabel || 'Validate'}
            </Button>
          </div>
        </div>

        {hasResults &&
          (passed ? (
            <div className="rounded-xl border border-sf-complete bg-sf-success-weak p-3 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-complete-text">
                Workflow readiness
              </h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-sf-complete-text">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {fields.length} of {fields.length} diagnosis details captured
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {lesson.intro?.artifactName || 'The run diagnosis'} is recorded for the workflow.
                </li>
              </ul>
              <Button
                variant="success"
                size="md"
                iconRight="arrow-right"
                className="mt-3"
                onClick={onContinue}
              >
                Continue to Takeaway
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-sf-warning bg-sf-progress-weak p-3 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-progress-text">
                Workflow readiness
              </h3>
              {primary ? (
                <div className="mt-2 rounded-md border border-sf-warning bg-sf-surface p-3">
                  <p className="text-sm font-semibold text-sf-progress-text">
                    Fix this next: {primary.field.label}
                  </p>
                  <p className="mt-1 text-sm text-sf-body">{primary.result.message}</p>
                </div>
              ) : null}
              {failedFields.length > 1 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {failedFields.length - 1} more{' '}
                  {failedFields.length - 1 === 1 ? 'answer needs' : 'answers need'} another look -
                  they are highlighted above.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'✓'} {correctCount} of {fields.length} answers look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
