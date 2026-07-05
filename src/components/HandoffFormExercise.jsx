import CopilotPromptCard from './CopilotPromptCard'
import { Button } from './ui'

// Exercise workspace for interactionType "handoffForm" (handoff lessons).
// Left: the situation the handoff responds to. Right: a compact fixed form -
// one labeled row per field (native <select> or slim text input) capturing the
// who/what/when of the handoff, plus the standard bounded readiness feedback.
// The answer is serialized as { fieldId: value } and validated by the
// handoffForm validator.
export default function HandoffFormExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const validation = lesson.validation || {}
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
      const match = r.id.match(/^field-(.+)$/)
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
      {/* Left: the situation the handoff responds to */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {lesson.inputLabel || 'Source Material'}
          </h3>
          <pre className="mt-1 whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 text-sm text-sf-body">
            {lesson.input}
          </pre>
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

      {/* Right: the handoff form + bounded readiness feedback */}
      <div className="flex flex-col gap-3 short:gap-2 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Capture the handoff record
          </h3>
          <div className="mt-2 flex flex-col gap-2 short:gap-1">
            {fields.map((field) => {
              const result = resultByField[field.id]
              const failed = Boolean(result && !result.passed)
              const ok = Boolean(result && result.passed)
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
                  {field.kind === 'select' ? (
                    <select
                      value={values[field.id] || ''}
                      onChange={(event) => setValue(field.id, event.target.value)}
                      className="min-w-[9rem] max-w-[60%] rounded border border-sf-border-strong bg-sf-surface px-1.5 py-0.5 text-xs text-sf-body"
                    >
                      <option value="">Choose...</option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={values[field.id] || ''}
                      onChange={(event) => setValue(field.id, event.target.value)}
                      placeholder={field.label}
                      className="min-w-[9rem] max-w-[60%] rounded border border-sf-border-strong bg-sf-surface px-1.5 py-0.5 text-xs text-sf-body"
                    />
                  )}
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
                  <span aria-hidden="true">{'\u2713'}</span>
                  {fields.length} of {fields.length} handoff details captured
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'\u2713'}</span>
                  {lesson.intro?.artifactName || 'The handoff record'} is recorded for the workflow.
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
                  {failedFields.length - 1 === 1 ? 'detail needs' : 'details need'} another look - they
                  are highlighted above.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'\u2713'} {correctCount} of {fields.length} details look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
