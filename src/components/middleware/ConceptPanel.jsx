import { Button, Card, CodeBlock, SectionLabel } from '../ui'
import { ResourceList } from './ModuleLanding'

// The Concept beat: the one idea this lesson teaches, its low-code
// equivalent, and the Python the lesson needs. This screen may scroll.
export default function ConceptPanel({ lesson, module, onContinue }) {
  const c = lesson.concept
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-2">
      <div>
        <SectionLabel>Concept</SectionLabel>
        <h2 className="mt-0.5 text-xl font-semibold text-sf-text">{c.heading}</h2>
      </div>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-sf-body">
        {c.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <Card tone="subtle" padding="sm" className="text-sm text-sf-body">
        <SectionLabel size="xs" className="mb-1">You have built this before, in low-code</SectionLabel>
        {c.lowCodeEquivalent}
      </Card>
      {lesson.pythonBlock && (
        <Card padding="md" className="flex flex-col gap-2">
          <SectionLabel>{lesson.pythonBlock.title}</SectionLabel>
          {lesson.pythonBlock.intro && <p className="text-sm text-sf-body">{lesson.pythonBlock.intro}</p>}
          <CodeBlock>{lesson.pythonBlock.code}</CodeBlock>
          {lesson.pythonBlock.resource && <ResourceList resources={[lesson.pythonBlock.resource]} compact />}
        </Card>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-sf-border-subtle pt-3">
        <span className="text-xs text-sf-muted">
          Module {module.order}.{lesson.order} - about {lesson.estimateHours} h
        </span>
        <Button variant="primary" size="sm" iconRight="arrow-right" onClick={onContinue}>
          Open the workbench
        </Button>
      </div>
    </div>
  )
}
