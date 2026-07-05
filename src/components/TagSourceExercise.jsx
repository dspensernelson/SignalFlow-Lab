import CopilotPromptCard from './CopilotPromptCard'
import { Button } from './ui'

// Exercise workspace for interactionType "tagSource" (inspection lessons).
// Left: the raw source, broken into readable candidate segments (chips).
// Right: one row per required field, each bound to a source segment via a
// native <select> (accessibility-safe, keyboard-native), plus the standard
// bounded readiness feedback. The answer is serialized as { fieldId: segmentId }
// and validated by the tagSource validator.
export default function TagSourceExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const validation = lesson.validation || {}
  const source = validation.source || {}
  const segments = source.segments || []
  const fields = validation.fields || []

  let bindings = {}
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) bindings = parsed
  } catch {
    bindings = {}
  }

  const hasResults = Boolean(results && results.length > 0)
  const resultByField = {}
  if (hasResults) {
    results.forEach((r) => {
      const match = r.id.match(/^tag-(.+)$/)
      if (match) resultByField[match[1]] = r
    })
  }

  const failedFields = fields
    .map((field) => ({ field, result: resultByField[field.id] }))
    .filter((entry) => entry.result && !entry.result.passed)
  const primary = failedFields[0]
  const correctCount = fields.length - failedFields.length

  function bind(fieldId, segmentId) {
    onAnswerChange(JSON.stringify({ ...bindings, [fieldId]: segmentId }))
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 short:gap-2 lg:grid-cols-12">
      {/* Left: the raw source under inspection, as readable segment chips */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {source.label || lesson.inputLabel || 'Source Material'}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {segments.map((segment) => (
              <span
                key={segment.id}
                className="rounded-md border border-sf-border-subtle bg-sf-surface-subtle px-2 py-0.5 text-xs text-sf-body"
              >
                {segment.text}
              </span>
            ))}
          </div>
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

      {/* Right: field-to-segment bindings + bounded readiness feedback */}
      <div className="flex flex-col gap-3 short:gap-2 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Tag each field to its source
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
                  <select
                    value={bindings[field.id] || ''}
                    onChange={(event) => bind(field.id, event.target.value)}
                    className="min-w-[9rem] max-w-[60%] rounded border border-sf-border-strong bg-sf-surface px-1.5 py-0.5 text-xs text-sf-body"
                  >
                    <option value="">Choose segment...</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.text}
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
                  <span aria-hidden="true">{'\u2713'}</span>
                  {fields.length} of {fields.length} fields tagged correctly
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'\u2713'}</span>
                  {lesson.intro?.artifactName || 'The field map'} is recorded for the workflow.
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
                  {failedFields.length - 1 === 1 ? 'field needs' : 'fields need'} another look - they
                  are highlighted above.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'\u2713'} {correctCount} of {fields.length} fields look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
