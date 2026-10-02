import { Badge, Button, Card, Chip, Icon, SectionLabel } from '../ui'
import { explainComplete, moduleSummary } from '../../lib/middlewareProgress'

const STATUS_BADGE = {
  locked: { tone: 'locked', icon: 'lock', label: 'Locked' },
  ready: { tone: 'ready', icon: 'circle-play', label: 'Ready' },
  passed: { tone: 'complete', icon: 'check', label: 'Passed' },
  skipped: { tone: 'needs-inputs', icon: 'arrow-right', label: 'Skipped' },
  failed: { tone: 'progress', icon: 'triangle-alert', label: 'Check failing' },
}

const RESOURCE_LABEL = { course: 'Course', docs: 'Docs', repo: 'Repo' }

export function ResourceList({ resources = [], compact = false }) {
  if (!resources.length) return null
  return (
    <ul className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {resources.map((r) => (
        <li key={r.url + r.label} className="flex items-start gap-2 text-sm leading-snug">
          <Chip className="mt-0.5 shrink-0">{RESOURCE_LABEL[r.type] || r.type}</Chip>
          <a href={r.url} target="_blank" rel="noreferrer" className="text-sf-accent hover:underline">
            {r.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function CheckKind({ lesson }) {
  const kind = lesson.check?.kind
  if (kind === 'pytest') return <Chip mono>pytest</Chip>
  if (kind === 'explain') return <Chip>explain-it</Chip>
  return <Chip>mark done</Chip>
}

export default function ModuleLanding({ module, lessons, progress, statusOf, onOpenLesson, onBack }) {
  const summary = moduleSummary(progress, lessons.map((l) => l.id))
  const explainDone = explainComplete(progress, module.id, module.explainIt?.questions?.length || 0)
  const lastLesson = lessons[lessons.length - 1]
  const lastStatus = lastLesson ? statusOf(lastLesson.id) : 'locked'
  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-4 py-5">
      <Button variant="link" size="sm" icon="arrow-left" onClick={onBack} className="w-fit">
        All modules
      </Button>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-1">
          <SectionLabel>Module {module.order} - {module.weeks} weeks, about {module.hours} hours</SectionLabel>
          <h1 className="text-2xl font-semibold text-sf-text">{module.title}</h1>
          <p className="text-sm text-sf-body">
            <span className="font-medium text-sf-text">Outcome.</span> {module.outcome}
          </p>
          <p className="text-sm text-sf-muted">
            <span className="font-medium text-sf-text">You will have built:</span> {module.artifact}
          </p>
        </div>
        <Card tone="subtle" padding="sm" className="flex shrink-0 flex-col gap-1 text-sm">
          <span className="font-medium text-sf-text">
            {summary.passed} passed{summary.skipped ? `, ${summary.skipped} skipped` : ''} of {summary.total} lessons
          </span>
          <span className="text-xs text-sf-muted">
            Explain-it: {explainDone ? 'answered' : 'not yet'}
          </span>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section>
          <SectionLabel className="mb-2">Lessons, in order</SectionLabel>
          <ol className="flex flex-col gap-2">
            {lessons.length === 0 && (
              <li className="rounded-md border border-dashed border-sf-border p-3 text-sm text-sf-muted">
                Lessons for this module are being authored.
              </li>
            )}
            {lessons.map((l) => {
              const status = statusOf(l.id)
              const b = STATUS_BADGE[status] || STATUS_BADGE.locked
              const locked = status === 'locked'
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => onOpenLesson(l.id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      locked
                        ? 'cursor-not-allowed border-sf-border bg-sf-surface-subtle text-sf-muted'
                        : 'border-sf-border bg-sf-surface hover:border-sf-accent-border hover:bg-sf-surface-subtle',
                    ].join(' ')}
                  >
                    <span className="w-8 shrink-0 font-mono text-xs text-sf-subtle">{module.order}.{l.order}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-sf-text">{l.title}</span>
                      <span className="block truncate text-xs text-sf-muted">{l.concept?.heading}</span>
                    </span>
                    <span className="hidden items-center gap-1.5 sm:flex">
                      {l.simulate && <Chip>simulate</Chip>}
                      <CheckKind lesson={l} />
                      <Chip>{l.estimateHours} h</Chip>
                    </span>
                    <Badge tone={b.tone} icon={b.icon}>{b.label}</Badge>
                    {!locked && <Icon name="chevron-right" size={14} className="text-sf-subtle" />}
                  </button>
                </li>
              )
            })}
            {lastLesson && module.explainIt && (
              <li>
                <button
                  type="button"
                  disabled={lastStatus === 'locked'}
                  onClick={() => onOpenLesson(lastLesson.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left',
                    lastStatus === 'locked'
                      ? 'cursor-not-allowed border-sf-border text-sf-muted'
                      : 'border-sf-border-strong hover:bg-sf-surface-subtle',
                  ].join(' ')}
                >
                  <span className="w-8 shrink-0 text-sf-subtle"><Icon name="user-check" size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-sf-text">Explain-it check</span>
                    <span className="block text-xs text-sf-muted">
                      {module.explainIt.questions.length} questions, answered in your own words at the end of lesson {module.order}.{lastLesson.order}
                    </span>
                  </span>
                  <Badge tone={explainDone ? 'complete' : 'neutral'} icon={explainDone ? 'check' : 'circle-help'}>
                    {explainDone ? 'Answered' : 'Open'}
                  </Badge>
                </button>
              </li>
            )}
          </ol>
        </section>
        <aside className="flex flex-col gap-4">
          <Card padding="md" className="flex flex-col gap-2">
            <SectionLabel>Free resources for this module</SectionLabel>
            <ResourceList resources={module.resources} />
          </Card>
          {module.layers && (
            <Card tone="subtle" padding="sm" className="flex flex-col gap-1">
              <SectionLabel size="xs">Skill layer</SectionLabel>
              <span className="text-sm text-sf-body">{module.layers.join(', ')}</span>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
