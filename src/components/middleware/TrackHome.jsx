import { Badge, Button, Card, Icon, SectionLabel, StatItem } from '../ui'
import { moduleSummary } from '../../lib/middlewareProgress'

const LAYER_TONE = 'neutral'

function ModuleCard({ module, lessons, summary, firstStatus, onOpen }) {
  const complete = summary.total > 0 && summary.done === summary.total
  const started = summary.done > 0
  const tone = complete ? 'success' : started ? 'info' : 'default'
  return (
    <Card tone={tone} padding="md" className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel size="xs">Module {module.order} - {module.weeks} wk - {module.hours} h</SectionLabel>
          <h3 className="mt-0.5 text-base font-semibold leading-snug text-sf-text">{module.title}</h3>
        </div>
        {complete ? (
          <Badge tone="complete" icon="check">Done</Badge>
        ) : started ? (
          <Badge tone="progress" icon="activity">In progress</Badge>
        ) : firstStatus === 'ready' ? (
          <Badge tone="ready" icon="circle-play">Ready</Badge>
        ) : (
          <Badge tone="locked" icon="lock">Locked</Badge>
        )}
      </div>
      <p className="text-sm leading-snug text-sf-body">{module.outcome}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-sf-muted">
          {summary.passed} passed{summary.skipped ? `, ${summary.skipped} skipped` : ''} of {summary.total}
          {lessons.length === 0 ? ' (lessons coming)' : ''}
        </span>
        <Button variant={firstStatus === 'locked' && !started ? 'ghost' : 'neutral'} size="sm" iconRight="arrow-right" onClick={onOpen}>
          Open
        </Button>
      </div>
      {module.layers && (
        <div className="flex flex-wrap gap-1">
          {module.layers.map((l) => (
            <Badge key={l} tone={LAYER_TONE}>{l}</Badge>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function TrackHome({ track, modules, progress, lessonsForModule, statusOf, onOpenModule, onContinue, frontierLessonId }) {
  const all = modules.flatMap((m) => lessonsForModule(m.id).map((l) => l.id))
  const total = moduleSummary(progress, all)
  const hours = modules.reduce((n, m) => n + (m.hours || 0), 0)
  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-3xl flex-col gap-1">
          <h1 className="text-2xl font-semibold text-sf-text">{track.name}</h1>
          <p className="text-sm text-sf-muted">{track.tagline}</p>
          <p className="text-sm text-sf-body">
            <span className="font-medium text-sf-text">{track.scenario.org}.</span> {track.scenario.summary}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
          <StatItem icon="clipboard-list" tone="accent" value={`${total.done} of ${total.total}`} label="lessons done" />
          <StatItem icon="clock" value={`${hours} h`} label="about 20 weeks at 10 h/wk" />
          {frontierLessonId && (
            <Button variant="primary" size="sm" iconRight="arrow-right" onClick={onContinue}>
              Continue
            </Button>
          )}
        </div>
      </div>

      <Card tone="subtle" padding="sm" className="flex items-center gap-3 text-sm text-sf-body">
        <Icon name="sparkles" size={16} className="shrink-0 text-sf-accent" />
        <span>
          Every lesson has three beats: <span className="font-medium text-sf-text">Simulate</span> the concept on the
          donor-ops map, <span className="font-medium text-sf-text">Build</span> it in <code className="font-mono text-xs">middleware/</code> with
          Claude Code, and <span className="font-medium text-sf-text">Check</span> it with a pytest run that unlocks the next lesson.
          The sellable outcome for a client: {track.scenario.clientOutcome}
        </span>
      </Card>

      <section>
        <SectionLabel className="mb-3">Modules, in order</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const lessons = lessonsForModule(m.id)
            return (
              <ModuleCard
                key={m.id}
                module={m}
                lessons={lessons}
                summary={moduleSummary(progress, lessons.map((l) => l.id))}
                firstStatus={lessons[0] ? statusOf(lessons[0].id) : 'locked'}
                onOpen={() => onOpenModule(m.id)}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
