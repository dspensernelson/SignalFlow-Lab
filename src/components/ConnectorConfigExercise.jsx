import CopilotPromptCard from './CopilotPromptCard'
import { Button, ScrollArea } from './ui'

// Exercise workspace for interactionType "connectorConfig" (operations lessons).
// Left: the system setup sheet, including the raw secret AND its vault
// reference, so pasting the raw value is a real temptation. Right: a grouped
// configuration form - connection, trigger, failure behavior - in a 2-column
// grid so 8 fields occupy roughly the height handoffForm's 5 rows do.
//
// The answer serializes FLAT as { fieldId: value }; the connectorConfig
// validator flattens the groups the same way. See
// ENGINE_ADDITIONS_SPEC_OPERATIONS.md section 1.3.
export default function ConnectorConfigExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const validation = lesson.validation || {}
  const groups = validation.groups || []
  const fields = groups.flatMap((g) => (g.fields || []).map((f) => ({ ...f, groupId: g.id })))

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
      const match = r.id.match(/^cfg-(.+)$/)
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

  function renderControl(field) {
    const shared =
      'w-full rounded border border-sf-border-strong bg-sf-surface px-1.5 py-0.5 text-xs text-sf-body'
    if (field.kind === 'select') {
      return (
        <select
          value={values[field.id] || ''}
          onChange={(event) => setValue(field.id, event.target.value)}
          className={shared}
        >
          <option value="">Choose...</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }
    if (field.kind === 'number') {
      return (
        <input
          type="number"
          inputMode="numeric"
          value={values[field.id] ?? ''}
          onChange={(event) => setValue(field.id, event.target.value)}
          placeholder={field.range ? `${field.range.min}-${field.range.max}` : field.label}
          className={shared}
        />
      )
    }
    if (field.kind === 'secretRef') {
      return (
        <div className="flex items-center gap-1">
          <span aria-hidden="true" className="text-xs text-sf-subtle">
            {'\u{1F512}'}
          </span>
          <input
            type="text"
            value={values[field.id] || ''}
            onChange={(event) => setValue(field.id, event.target.value)}
            placeholder="a reference, not the value"
            className={shared}
          />
        </div>
      )
    }
    return (
      <input
        type="text"
        value={values[field.id] || ''}
        onChange={(event) => setValue(field.id, event.target.value)}
        placeholder={field.label}
        className={shared}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 short:gap-2 lg:grid-cols-12">
      {/* Left: the system setup sheet */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {lesson.inputLabel || 'System setup sheet'}
          </h3>
          <ScrollArea className="mt-1 max-h-[400px] short:max-h-[210px]">
            <pre className="whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 text-sm text-sf-body">
              {lesson.input}
            </pre>
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

      {/* Right: grouped configuration + bounded readiness feedback */}
      <div className="flex flex-col gap-3 short:gap-2 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Configure the connection
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-2 short:gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <fieldset
                key={group.id}
                className="rounded-md border border-sf-border-subtle p-2 short:p-1"
              >
                <legend className="px-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
                  {group.label}
                </legend>
                <div className="flex flex-col gap-1.5 short:gap-0.5">
                  {(group.fields || []).map((field) => {
                    const result = resultByField[field.id]
                    const failed = Boolean(result && !result.passed)
                    const ok = Boolean(result && result.passed)
                    return (
                      <label
                        key={field.id}
                        className={`flex flex-col gap-0.5 rounded-md border p-1.5 short:p-1 ${
                          failed
                            ? 'border-sf-warning bg-sf-progress-weak'
                            : ok
                              ? 'border-sf-complete bg-sf-success-weak'
                              : 'border-sf-border-subtle bg-sf-surface-subtle'
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-sf-body">
                          {field.label}
                        </span>
                        {renderControl(field)}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
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
                  {fields.length} of {fields.length} configuration details set
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {lesson.intro?.artifactName || 'The connector config'} is recorded for the
                  workflow.
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
                  {failedFields.length - 1 === 1 ? 'setting needs' : 'settings need'} another look -
                  they are highlighted above.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'✓'} {correctCount} of {fields.length} settings look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
