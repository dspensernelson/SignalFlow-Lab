import { useState } from 'react'
import LessonIntro from './LessonIntro'
import LessonExercise from './LessonExercise'
import LessonTakeaway from './LessonTakeaway'
import { validateAnswer } from '../lib/validators'
import { Stepper, Button, Icon } from './ui'

// Reusable lesson template: a three-step click-through flow.
const STEPS = [
  { id: 'intro', label: 'Intro' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'takeaway', label: 'Takeaway' },
]

export default function LessonWorkspace({ lesson, tier, onPass, onReturnToCanvas }) {
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-left text-sf-text short:gap-2 short:py-2">
      <header className="flex flex-col gap-2 short:gap-1">
        <div className="flex flex-col gap-1 short:gap-0">
          <Button variant="link" size="sm" icon="arrow-left" onClick={onReturnToCanvas} className="w-fit">
            Back to Canvas
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-sf-text short:text-lg">{lesson.title}</h1>
            {lesson.clock && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sf-border bg-sf-surface-subtle px-2.5 py-0.5 text-xs font-medium text-sf-muted short:hidden">
                <Icon name="clock" size={12} />
                {lesson.clock}
              </span>
            )}
          </div>
          {lesson.subtitle && <p className="text-sm text-sf-body short:hidden">{lesson.subtitle}</p>}
          <p className="text-xs text-sf-subtle short:hidden">
            {tier ? `${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier` : lesson.difficulty} &middot; {lesson.skill}
          </p>
        </div>

        <Stepper steps={STEPS.map((s) => s.label)} current={currentIndex} aria-label="Lesson steps" />
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
