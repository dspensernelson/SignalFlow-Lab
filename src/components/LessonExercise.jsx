import { useState } from 'react'
import ValidationResults from './ValidationResults'
import CopilotPromptCard from './CopilotPromptCard'
import FieldGuide from './FieldGuide'

// Step 2 of the lesson template: a three-area desktop workbench.
// Left: source note, instructions checklist, field guide.
// Middle: editable answer + validate (+ continue once passed).
// Right: validation results with field-level hints, then output preview.
export default function LessonExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  outputPreview,
  onContinue,
}) {
  const [checked, setChecked] = useState(() => lesson.instructions.map(() => false))

  const fieldHints = (lesson.fieldGuide || []).reduce((acc, f) => {
    acc[f.field] = f.hint
    return acc
  }, {})

  function toggleInstruction(index) {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      {/* Left: source, instructions checklist, field guide */}
      <div className="flex flex-col gap-4 lg:col-span-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {lesson.inputLabel || 'Source Note'}
          </h3>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            {lesson.input}
          </pre>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Instructions
          </h3>
          <ul className="mt-2 flex flex-col gap-1">
            {lesson.instructions.map((instruction, index) => (
              <li key={index}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={checked[index]}
                    onChange={() => toggleInstruction(index)}
                    className="mt-0.5"
                  />
                  <span className={checked[index] ? 'text-gray-400 line-through' : ''}>
                    {instruction}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <FieldGuide fields={lesson.fieldGuide} />
      </div>

      {/* Middle: editor + validate */}
      <div className="flex flex-col gap-4 lg:col-span-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label
            htmlFor="answer-editor"
            className="text-sm font-semibold uppercase tracking-wide text-gray-500"
          >
            Your Answer (JSON)
          </label>
          <textarea
            id="answer-editor"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            spellCheck={false}
            rows={14}
            className="mt-2 w-full rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="mt-3">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Validate
            </button>
          </div>
        </div>

        {passed && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">{lesson.successMessage}</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-3 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Continue to Takeaway
            </button>
          </div>
        )}

        <CopilotPromptCard prompt={lesson.copilotPrompt} />
      </div>

      {/* Right: validation results, field hints, output preview */}
      <div className="flex flex-col gap-4 lg:col-span-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          {results && results.length > 0 ? (
            <ValidationResults results={results} fieldHints={fieldHints} />
          ) : (
            <p className="text-sm text-gray-500">
              Validate your answer to see per-field results and hints here.
            </p>
          )}
        </div>

        {passed && outputPreview && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Output Preview
            </h3>
            <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 text-sm text-gray-800">
              {JSON.stringify(outputPreview, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
