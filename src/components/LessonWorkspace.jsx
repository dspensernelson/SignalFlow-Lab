import { useState } from 'react'
import LessonIntro from './LessonIntro'
import LessonExercise from './LessonExercise'
import LessonTakeaway from './LessonTakeaway'
import { validateAnswer } from '../lib/validators'

// Reusable lesson template: a three-step click-through flow.
const STEPS = [
  { id: 'intro', label: 'Intro' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'takeaway', label: 'Takeaway' },
]

export default function LessonWorkspace({ lesson, onPass, onReturnToCanvas }) {
  const [step, setStep] = useState('intro')
  const [answer, setAnswer] = useState(lesson.starterAnswer)
  const [results, setResults] = useState([])
  const [passed, setPassed] = useState(false)
  const [outputPreview, setOutputPreview] = useState(null)

  const currentIndex = STEPS.findIndex((s) => s.id === step)

  function handleValidate() {
    const result = validateAnswer(answer, lesson.validation)
    setResults(result.results)
    setPassed(result.passed)

    if (result.passed) {
      setOutputPreview(result.artifact)
      onPass(lesson.nodeId, result.artifact)
    } else {
      setOutputPreview(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 text-left">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onReturnToCanvas}
            className="w-fit text-sm text-blue-600 hover:underline"
          >
            &larr; Back to Canvas
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{lesson.title}</h1>
          <p className="text-sm text-gray-500">
            {lesson.difficulty} &middot; {lesson.skill}
          </p>
        </div>

        <ol className="flex flex-wrap items-center gap-2" aria-label="Lesson steps">
          {STEPS.map((s, index) => {
            const isCurrent = s.id === step
            const isDone = index < currentIndex
            return (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDone
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  <span aria-hidden="true">{isDone ? '✓' : index + 1}</span>
                  {s.label}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="text-gray-300" aria-hidden="true">
                    &rarr;
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </header>

      {step === 'intro' && (
        <LessonIntro lesson={lesson} onContinue={() => setStep('exercise')} />
      )}

      {step === 'exercise' && (
        <LessonExercise
          lesson={lesson}
          answer={answer}
          onAnswerChange={setAnswer}
          onValidate={handleValidate}
          results={results}
          passed={passed}
          outputPreview={outputPreview}
          onContinue={() => setStep('takeaway')}
        />
      )}

      {step === 'takeaway' && (
        <LessonTakeaway
          lesson={lesson}
          artifact={outputPreview}
          onReturnToCanvas={onReturnToCanvas}
        />
      )}
    </div>
  )
}
