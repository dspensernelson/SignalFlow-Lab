import CopilotPromptCard from './CopilotPromptCard'
import ChoiceCheckExercise from './ChoiceCheckExercise'
import TemplateSlotsExercise from './TemplateSlotsExercise'
import ArtifactImportExercise from './ArtifactImportExercise'
import { Button } from './ui'

// The editor renders one JSON field per line; these constants match the
// textarea's padding (p-3 = 12px) and line-height (leading-6 = 24px) so each
// inline rail chip aligns to the line it refers to.
const LINE_HEIGHT = 24
const PADDING_TOP = 12

// Compact inline pass/fail chip, shown in the rail beside its JSON line.
function Callout({ passed, message, hint }) {
  return (
    <div
      title={hint ? `${message} \u2014 ${hint}` : message}
      className={`flex items-center gap-1 truncate rounded-md border px-2 py-0.5 text-[11px] leading-tight ${
        passed
          ? 'border-sf-complete bg-sf-success-weak text-sf-complete-text'
          : 'border-sf-danger bg-sf-danger-weak text-sf-danger'
      }`}
    >
      <span aria-hidden="true">{passed ? '\u2713' : '\u2717'}</span>
      <span className="truncate">{message}</span>
    </div>
  )
}

// Three-state indicator for the "Fields to capture" checklist:
//   empty   = not attempted / missing
//   correct = present and trusted
//   warning = present but not the trusted value yet
function StateIcon({ state }) {
  if (state === 'correct') {
    return (
      <span
        className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-sf-complete-weak text-[10px] font-bold text-sf-complete-text"
        aria-label="correct"
      >
        {'\u2713'}
      </span>
    )
  }
  if (state === 'warning') {
    return (
      <span
        className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-sf-progress-weak text-[10px] font-bold text-sf-progress-text"
        aria-label="needs attention"
      >
        !
      </span>
    )
  }
  return (
    <span
      className="mt-0.5 h-4 w-4 flex-none rounded-full border border-sf-border-strong"
      aria-label="not captured"
    />
  )
}

// Step 2 of the lesson template: a quiet, task-focused two-panel workbench.
// Left: source material + a three-state "Fields to capture" checklist.
// Right: the JSON workspace and a readiness block that leads with the field
// that needs attention (with a targeted, source-grounded hint) and quietly
// summarizes the checks that already pass.
export default function LessonExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  // Non-editor interaction types render their own workspaces; the JSON-editor
  // workbench below stays untouched for jsonEditor lessons.
  if (lesson.interactionType === 'choiceCheck') {
    return (
      <ChoiceCheckExercise
        lesson={lesson}
        answer={answer}
        onAnswerChange={onAnswerChange}
        onValidate={onValidate}
        results={results}
        passed={passed}
        onContinue={onContinue}
      />
    )
  }
  if (lesson.interactionType === 'templateSlots') {
    return (
      <TemplateSlotsExercise
        lesson={lesson}
        answer={answer}
        onAnswerChange={onAnswerChange}
        onValidate={onValidate}
        results={results}
        passed={passed}
        onContinue={onContinue}
      />
    )
  }
  if (lesson.interactionType === 'artifactImport') {
    return (
      <ArtifactImportExercise
        lesson={lesson}
        answer={answer}
        onAnswerChange={onAnswerChange}
        onValidate={onValidate}
        results={results}
        passed={passed}
        onContinue={onContinue}
      />
    )
  }

  const fields = lesson.fieldGuide || []
  const came = lesson.intro?.whatCameIn
  const hasResults = Boolean(results && results.length > 0)
  const recordName = lesson.intro?.recordName || 'This record'
  const editorLabel = lesson.intro?.artifactName || 'Your answer (JSON)'

  // Group the checklist by business signal, preserving first-seen order.
  const grouped = fields.some((f) => f.group)
  const fieldGroups = []
  fields.forEach((f) => {
    const name = f.group || ''
    let g = fieldGroups.find((x) => x.name === name)
    if (!g) {
      g = { name, items: [] }
      fieldGroups.push(g)
    }
    g.items.push(f)
  })

  const jsonParseFailed = hasResults && results.some((r) => r.id === 'json-parse')

  // Parse the current answer so we can tell a blank field (not attempted) from
  // a present-but-wrong one.
  let parsedAnswer = null
  try {
    parsedAnswer = JSON.parse(answer)
  } catch {
    parsedAnswer = null
  }

  // Index the presence/value checks per field.
  const byField = {}
  if (hasResults && !jsonParseFailed) {
    results.forEach((r) => {
      const match = r.id.match(/^(present|value)-(.+)$/)
      if (!match) return
      byField[match[2]] = byField[match[2]] || {}
      byField[match[2]][match[1]] = r
    })
  }

  function fieldState(field) {
    if (!hasResults || jsonParseFailed) return 'empty'
    const entry = byField[field]
    if (!entry) return 'empty'
    if (entry.present && !entry.present.passed) return 'empty' // key missing
    const raw = parsedAnswer ? parsedAnswer[field] : undefined
    if (typeof raw === 'string' && raw.trim() === '') return 'empty' // blank
    if (entry.value && !entry.value.passed) return 'warning' // present but wrong
    return 'correct'
  }

  const stateByField = {}
  fields.forEach((f) => {
    stateByField[f.field] = fieldState(f.field)
  })

  const requiredFieldNames = hasResults
    ? results.filter((r) => r.id.startsWith('present-')).map((r) => r.id.slice('present-'.length))
    : []
  const totalRequired = requiredFieldNames.length
  const correctCount = requiredFieldNames.filter((name) => fieldState(name) === 'correct').length

  // Fields that need fixing: missing key, or present but not the trusted value.
  const attentionItems = []
  if (hasResults && !jsonParseFailed) {
    fields.forEach((f) => {
      const entry = byField[f.field]
      if (!entry) return
      const missing = Boolean(entry.present && !entry.present.passed)
      if (missing) {
        attentionItems.push({ field: f.field, missing: true, attention: f.attention })
      } else if (stateByField[f.field] === 'warning') {
        attentionItems.push({ field: f.field, missing: false, attention: f.attention })
      }
    })
  }

  const attentionCount = attentionItems.length
  const headline =
    attentionCount === 1
      ? 'Almost ready. One field needs a better signal before downstream steps can trust this record.'
      : 'Not ready yet. Fix the next field, then validate again.'

  // Inline rail: align each field's pass/fail chip to the JSON line it sits on.
  // Fields missing from the JSON have no line, so they stack just beneath the
  // closing brace.
  const answerLines = answer.split('\n')
  const lineIndexForField = (field) =>
    answerLines.findIndex((line) => new RegExp(`"${field}"\\s*:`).test(line))
  const fieldStatuses = []
  if (hasResults && !jsonParseFailed) {
    fields.forEach((f) => {
      const entry = byField[f.field]
      if (!entry) return
      const ok =
        (entry.present ? entry.present.passed : true) &&
        (entry.value ? entry.value.passed : true)
      let message
      if (entry.present && !entry.present.passed) message = entry.present.message
      else if (entry.value && !entry.value.passed) message = entry.value.message
      else message = 'Looks good'
      fieldStatuses.push({
        field: f.field,
        passed: ok,
        message,
        hint: f.lookFor || f.hint,
        idx: lineIndexForField(f.field),
      })
    })
    let missingSlot = 0
    const missingBase = PADDING_TOP + answerLines.length * LINE_HEIGHT
    fieldStatuses.forEach((s) => {
      if (s.idx >= 0) {
        s.top = PADDING_TOP + s.idx * LINE_HEIGHT
      } else {
        s.top = missingBase + missingSlot * LINE_HEIGHT
        missingSlot += 1
      }
    })
  }

  // Lead the readiness card with the single highest-priority field so the
  // feedback area stays a fixed, on-screen size no matter how many fields fail.
  const primary = attentionItems[0]
  const primaryLead = primary
    ? primary.missing
      ? `${primary.field} is missing from the record.`
      : `${primary.field} needs ${primary.attention?.needs || 'a value the workflow can trust'}.`
    : null

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
      {/* Left: source + three-state fields-to-capture checklist */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {came ? 'What came in' : lesson.inputLabel || 'Source Note'}
          </h3>
          {came?.noteTitle && (
            <p className="mt-2 text-xs font-semibold text-sf-body">{came.noteTitle}</p>
          )}
          <pre className="mt-1 whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 text-sm text-sf-body">
            {lesson.input}
          </pre>
          {came?.flagCue && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-sf-warning bg-sf-progress-weak px-3 py-2">
              <span className="inline-flex items-center rounded-full border border-sf-warning bg-sf-surface px-2 py-0.5 text-xs font-medium text-sf-progress-text">
                {came.flagCue}
              </span>
              {came.flagNote && <span className="text-xs text-sf-progress-text">{came.flagNote}</span>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Fields to capture
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {fieldGroups.map((group) => (
              <div key={group.name || 'fields'}>
                {grouped && group.name && (
                  <p className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">
                    {group.name}
                  </p>
                )}
                <ul className="mt-1 flex flex-col gap-1.5">
                  {group.items.map((f) => {
                    const state = stateByField[f.field]
                    const textClass =
                      state === 'correct'
                        ? 'text-sf-subtle'
                        : state === 'warning'
                          ? 'text-sf-progress-text'
                          : 'text-sf-body'
                    return (
                      <li key={f.field} className="flex items-start gap-2 text-sm">
                        <StateIcon state={state} />
                        <span className={textClass}>
                          <span className="font-mono text-[13px]">{f.field}</span>
                          {(f.lookFor || f.hint) && (
                            <span
                              className={state === 'warning' ? 'text-sf-progress-text' : 'text-sf-muted'}
                            >
                              {' '}
                              &mdash; {f.lookFor || f.hint}
                            </span>
                          )}
                          {state === 'warning' && primary && f.field === primary.field && (
                            <span className="mt-0.5 block text-xs font-medium text-sf-progress-text">
                              Present, but not the trusted value yet.
                            </span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: workspace + readiness + optional helper */}
      <div className="flex flex-col gap-3 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <label htmlFor="answer-editor" className="font-mono text-sm font-semibold text-sf-body">
            {editorLabel}
          </label>
          {lesson.editorHelper && (
            <p className="mt-1 text-xs text-sf-muted">{lesson.editorHelper}</p>
          )}
          <div className="mt-2 flex items-stretch gap-3">
            <textarea
              id="answer-editor"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              spellCheck={false}
              rows={7}
              className="flex-1 rounded-md border border-sf-border-strong bg-sf-surface p-3 font-mono text-sm leading-6 text-sf-text focus:border-sf-accent focus:outline-none focus:ring-1 focus:ring-sf-ring"
            />
            {hasResults && (
              <div className="relative w-40 flex-none">
                {jsonParseFailed ? (
                  <div className="absolute inset-x-0" style={{ top: PADDING_TOP }}>
                    <Callout passed={false} message="Not valid JSON yet" />
                  </div>
                ) : (
                  fieldStatuses.map((s) => (
                    <div key={s.field} className="absolute inset-x-0" style={{ top: s.top }}>
                      <Callout
                        passed={s.passed}
                        message={s.field}
                        hint={s.passed ? 'Looks good' : s.message}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
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
                  {correctCount} of {totalRequired} required fields captured
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'\u2713'}</span>JSON is valid
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'\u2713'}</span>
                  {recordName} is ready for downstream reuse.
                </li>
              </ul>
              <Button variant="success" size="md" iconRight="arrow-right" className="mt-3" onClick={onContinue}>
                Continue to Takeaway
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-sf-warning bg-sf-progress-weak p-3 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-progress-text">
                Workflow readiness
              </h3>

              {jsonParseFailed ? (
                <div className="mt-2 rounded-md border border-sf-warning bg-sf-surface p-3">
                  <p className="text-sm font-semibold text-sf-progress-text">Needs attention: valid JSON</p>
                  <p className="mt-1 text-sm text-sf-body">
                    Your answer is not valid JSON yet. Check for missing quotes, commas, or braces.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-sf-body">{headline}</p>

                  {primary && (
                    <div className="mt-2 rounded-md border border-sf-warning bg-sf-surface p-3">
                      <p className="text-sm font-semibold text-sf-progress-text">
                        Fix this next: <span className="font-mono">{primary.field}</span>
                      </p>
                      <p className="mt-1 text-sm text-sf-body">{primaryLead}</p>
                      {primary.attention?.source && (
                        <p className="mt-1 text-xs text-sf-muted">
                          Look for:{' '}
                          <span className="italic">&ldquo;{primary.attention.source}.&rdquo;</span>
                        </p>
                      )}
                      {primary.attention?.shape && (
                        <p className="mt-0.5 text-xs text-sf-muted">
                          Expected shape:{' '}
                          <span className="font-mono text-sf-body">
                            &ldquo;{primary.attention.shape}.&rdquo;
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {attentionCount > 1 && (
                    <p className="mt-2 text-xs text-sf-progress-text">
                      {attentionCount - 1} more{' '}
                      {attentionCount - 1 === 1 ? 'field is' : 'fields are'} flagged beside the
                      editor lines.
                    </p>
                  )}

                  {correctCount > 0 && (
                    <p className="mt-2 text-xs text-sf-progress-text">
                      {'\u2713'} {correctCount} of {totalRequired} fields look good
                    </p>
                  )}
                </>
              )}
            </div>
          ))}

        <details className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <summary className="cursor-pointer text-sm text-sf-body">
            Need help? Show Copilot prompt
          </summary>
          <div className="mt-3">
            <CopilotPromptCard prompt={lesson.copilotPrompt} />
          </div>
        </details>
      </div>
    </div>
  )
}
