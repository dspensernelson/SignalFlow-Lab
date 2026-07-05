import CopilotPromptCard from './CopilotPromptCard'
import { Button } from './ui'

// Exercise workspace for interactionType "choiceCheck" (inspection and
// interpretation lessons). Left: the source material under inspection.
// Right: a fixed set of single-choice questions answered against that source,
// plus the standard bounded readiness feedback. The answer is serialized as
// { questionId: optionId } and validated by the choiceCheck validator.
export default function ChoiceCheckExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const questions = lesson.validation?.questions || []

  let selections = {}
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) selections = parsed
  } catch {
    selections = {}
  }

  const hasResults = Boolean(results && results.length > 0)
  const resultByQuestion = {}
  if (hasResults) {
    results.forEach((r) => {
      const match = r.id.match(/^choice-(.+)$/)
      if (match) resultByQuestion[match[1]] = r
    })
  }

  const failedQuestions = questions
    .map((q, index) => ({ question: q, index, result: resultByQuestion[q.id] }))
    .filter((entry) => entry.result && !entry.result.passed)
  const primary = failedQuestions[0]
  const correctCount = questions.length - failedQuestions.length

  function select(questionId, optionId) {
    onAnswerChange(JSON.stringify({ ...selections, [questionId]: optionId }))
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 short:gap-2 lg:grid-cols-12">
      {/* Left: the source material being inspected */}
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

      {/* Right: questions + bounded readiness feedback */}
      <div className="flex flex-col gap-3 short:gap-2 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm short:p-2">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Inspection questions
          </h3>
          {/* Two-per-row grid keeps 4-5 questions + readiness on screen at 800px
              (no-scroll rule), including the wrong-answer state. */}
          <div className="mt-2 grid grid-cols-1 gap-2 short:gap-1 md:grid-cols-2">
            {questions.map((question, index) => {
              const result = resultByQuestion[question.id]
              const failed = Boolean(result && !result.passed)
              const ok = Boolean(result && result.passed)
              return (
                <fieldset
                  key={question.id}
                  className={`rounded-md border p-2 ${
                    failed
                      ? 'border-sf-warning bg-sf-progress-weak'
                      : ok
                        ? 'border-sf-complete bg-sf-success-weak'
                        : 'border-sf-border-subtle bg-sf-surface-subtle'
                  }`}
                >
                  <legend className="px-1 text-xs font-semibold text-sf-body">
                    {index + 1}. {question.prompt}
                  </legend>
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-1.5 rounded px-1 py-0.5 text-xs leading-snug text-sf-body hover:bg-sf-surface"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={selections[question.id] === option.id}
                          onChange={() => select(question.id, option.id)}
                          className="mt-0.5 accent-current"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
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
                  {questions.length} of {questions.length} questions answered correctly
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {lesson.intro?.artifactName || 'The profile'} is recorded for the workflow.
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
                    Fix this next: question {primary.index + 1}
                  </p>
                  <p className="mt-1 text-sm text-sf-body">{primary.result.message}</p>
                </div>
              ) : null}
              {failedQuestions.length > 1 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {failedQuestions.length - 1} more{' '}
                  {failedQuestions.length - 1 === 1 ? 'question needs' : 'questions need'} another
                  look - they are highlighted above.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'✓'} {correctCount} of {questions.length} questions look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
