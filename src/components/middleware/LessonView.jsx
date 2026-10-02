import { useState } from 'react'
import { Badge, Button, Card, Chip, Icon, SectionLabel, Stepper } from '../ui'
import ConceptPanel from './ConceptPanel'
import Workbench from './Workbench'
import ExplainItForm from './ExplainItForm'
import { explainAnswers, explainComplete } from '../../lib/middlewareProgress'

const STATUS_BADGE = {
  locked: { tone: 'locked', icon: 'lock', label: 'Locked' },
  ready: { tone: 'ready', icon: 'circle-play', label: 'Ready' },
  passed: { tone: 'complete', icon: 'check', label: 'Passed' },
  skipped: { tone: 'needs-inputs', icon: 'arrow-right', label: 'Skipped' },
  failed: { tone: 'progress', icon: 'triangle-alert', label: 'Check failing' },
}

// One lesson: Concept -> Workbench -> Explain it (or Done). The Workbench step
// is the bounded, no-scroll screen; Concept and the last step may scroll.
export default function LessonView({
  lesson,
  module,
  moduleLessons,
  status,
  progress,
  checks,
  onRefreshChecks,
  onSkip,
  onMarkDone,
  onSaveExplain,
  onExplainPassed,
  onBack,
  nextLessonId,
  nextStatus,
  onOpenLesson,
  simulation = null,
}) {
  const [step, setStep] = useState('concept') // 'concept' | 'workbench' | 'finish'

  const isLastInModule = moduleLessons[moduleLessons.length - 1]?.id === lesson.id
  const lessonExplain = lesson.check.kind === 'explain' ? { key: lesson.id, data: lesson.explainIt } : null
  const moduleExplain = isLastInModule && module.explainIt ? { key: module.id, data: module.explainIt } : null
  const finishLabel = lessonExplain || moduleExplain ? 'Explain it' : 'Done'
  const STEPS = ['Concept', 'Workbench', finishLabel]
  const stepIndex = { concept: 0, workbench: 1, finish: 2 }[step]
  const badge = STATUS_BADGE[status] || STATUS_BADGE.ready
  const result = checks.results?.[lesson.id] || null
  const nextOpen = nextLessonId && nextStatus && nextStatus !== 'locked'

  function saveLessonExplain(answers) {
    onSaveExplain(lesson.id, answers)
    const n = lesson.explainIt.questions.length
    if (Object.keys(answers).filter((k) => String(answers[k]).trim()).length >= n) onExplainPassed()
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-3 text-left text-sf-text ${step === 'workbench' ? 'h-full min-h-0' : ''} short:gap-2 short:py-2`}>
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="link" size="sm" icon="arrow-left" onClick={onBack} className="shrink-0">
            Module {module.order}
          </Button>
          <h1 className="truncate text-xl font-semibold text-sf-text short:text-lg">
            <span className="mr-2 font-mono text-sm text-sf-subtle">{module.order}.{lesson.order}</span>
            {lesson.title}
          </h1>
          <Badge tone={badge.tone} icon={badge.icon}>{badge.label}</Badge>
          <Chip className="hidden sm:inline-flex">{lesson.estimateHours} h</Chip>
        </div>
        <Stepper steps={STEPS} current={stepIndex} aria-label="Lesson beats" />
      </header>

      {step === 'concept' && (
        <ConceptPanel lesson={lesson} module={module} onContinue={() => setStep('workbench')} />
      )}

      {step === 'workbench' && (
        <>
          <div className="min-h-0 flex-1">
            <Workbench
              lesson={lesson}
              status={status}
              result={result}
              checks={checks}
              onRefresh={onRefreshChecks}
              onSkip={onSkip}
              onMarkDone={onMarkDone}
              simulation={simulation}
            />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3">
            <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => setStep('concept')}>
              Concept
            </Button>
            <div className="flex items-center gap-2">
              {(status === 'passed' || status === 'skipped') && nextOpen && (
                <Button variant="neutral" size="sm" iconRight="arrow-right" onClick={() => onOpenLesson(nextLessonId)}>
                  Next lesson
                </Button>
              )}
              <Button variant="primary" size="sm" iconRight="arrow-right" onClick={() => setStep('finish')}>
                {finishLabel}
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 'finish' && (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 py-2">
          {lessonExplain && (
            <Card padding="lg">
              <ExplainItForm
                title={lesson.title}
                intro="This lesson is checked by explaining it. Answer each question as if a client asked."
                questions={lessonExplain.data.questions}
                initialAnswers={explainAnswers(progress, lessonExplain.key)}
                onSave={saveLessonExplain}
              />
            </Card>
          )}
          {moduleExplain && (
            <Card padding="lg">
              <ExplainItForm
                title={`Module ${module.order}: ${module.title}`}
                intro="You finished the module's builds. Practice explaining them to a client."
                questions={moduleExplain.data.questions}
                initialAnswers={explainAnswers(progress, moduleExplain.key)}
                onSave={(answers) => onSaveExplain(moduleExplain.key, answers)}
              />
            </Card>
          )}
          <Card tone="subtle" padding="md" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name={status === 'passed' ? 'circle-check-big' : 'circle'} size={18} className={status === 'passed' ? 'text-sf-complete' : 'text-sf-muted'} />
              <SectionLabel as="span">Where you are</SectionLabel>
            </div>
            <p className="text-sm text-sf-body">
              {status === 'passed' && 'This lesson is passed.'}
              {status === 'skipped' && 'This lesson is recorded as skipped. Its check can still be run later.'}
              {(status === 'ready' || status === 'failed') && 'This lesson is not passed yet: run its check (or skip) on the Workbench step.'}
              {moduleExplain && !explainComplete(progress, module.id, moduleExplain.data.questions.length) && ' The module explain-it above is still unanswered.'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => setStep('workbench')}>
                Workbench
              </Button>
              <Button variant="neutral" size="sm" onClick={onBack}>
                Module {module.order}
              </Button>
              {nextLessonId && (
                <Button
                  variant="primary"
                  size="sm"
                  iconRight="arrow-right"
                  disabled={!nextOpen}
                  onClick={() => onOpenLesson(nextLessonId)}
                  title={nextOpen ? 'Open the next lesson' : 'Pass or skip this lesson to unlock the next'}
                >
                  Next lesson
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
