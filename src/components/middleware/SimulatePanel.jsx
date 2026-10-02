import { Badge, Button, Chip, CodeBlock, Icon, ScrollArea, SectionLabel } from '../ui'
import MiddlewareMap from './MiddlewareMap'
import { useSimulation } from './useSimulation'

const STATUS_BADGE = {
  ok: { tone: 'complete', label: 'OK' },
  error: { tone: 'needs-inputs', label: 'Error' },
  timeout: { tone: 'needs-inputs', label: 'Timeout' },
  pending: { tone: 'progress', label: 'Pending' },
  held: { tone: 'context', label: 'Held' },
}

const KIND_LABEL = {
  request: 'Request',
  response: 'Response',
  error: 'Failure',
  wait: 'Wait',
  hold: 'Held',
  release: 'Released',
  note: 'Note',
}

function Controls({ sim }) {
  const n = sim.steps.length
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button variant="primary" size="sm" icon={sim.playing ? 'minus' : 'circle-play'} onClick={sim.playing ? sim.pause : sim.play}>
        {sim.playing ? 'Pause' : sim.atEnd ? 'Replay' : 'Play'}
      </Button>
      <Button variant="neutral" size="sm" icon="arrow-left" onClick={sim.stepBack} disabled={sim.index < 0} title="Back one step">
        Back
      </Button>
      <Button variant="neutral" size="sm" iconRight="arrow-right" onClick={sim.stepForward} disabled={sim.atEnd} title="Forward one step">
        Step
      </Button>
      <Button variant="ghost" size="sm" icon="rotate-cw" onClick={sim.reset} disabled={sim.index < 0}>
        Reset
      </Button>
      <span className="ml-1 font-mono text-[11px] text-sf-muted">
        {sim.index < 0 ? `0 / ${n}` : `${sim.index + 1} / ${n}`}
      </span>
    </div>
  )
}

function Inspector({ sim }) {
  const s = sim.step
  if (!s) {
    return (
      <div className="flex h-full flex-col items-start gap-2 p-3 text-sm text-sf-muted">
        <SectionLabel>Payload inspector</SectionLabel>
        <p>Press Play, or Step, to watch one request cross the map. Each hop shows the exact JSON at that point.</p>
      </div>
    )
  }
  const badge = STATUS_BADGE[s.status] || STATUS_BADGE.ok
  const counters = Object.entries(sim.counters || {})
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Chip>{KIND_LABEL[s.kind] || s.kind}</Chip>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
        {counters.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1">
            {counters.map(([k, v]) => (
              <Chip key={k} mono>{k}={String(v)}</Chip>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 text-sm font-medium leading-snug text-sf-text">{s.label}</div>
      {s.payload !== undefined && (
        <ScrollArea className="min-h-0 flex-1" fadeClass="from-sf-surface" hint="More payload">
          <CodeBlock label={s.payloadTitle} wrap className="text-xs" style={{ fontSize: 11, lineHeight: 1.45 }}>
            {s.payload}
          </CodeBlock>
        </ScrollArea>
      )}
      {s.annotate && (
        <p className="shrink-0 flex items-start gap-1.5 text-xs leading-snug text-sf-body">
          <Icon name="sparkles" size={12} className="mt-0.5 shrink-0 text-sf-accent" />
          <span>{s.annotate}</span>
        </p>
      )}
    </div>
  )
}

// The Simulate beat: scenario title + controls over the map, the payload
// inspector beside it. Bounded to its grid cell; the inspector scrolls.
export default function SimulatePanel({ map, scenario }) {
  const sim = useSimulation(scenario)
  return (
    <section className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] short:gap-2">
      <div className="flex min-h-0 flex-col rounded-xl border border-sf-border bg-sf-surface shadow-sf-sm">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-sf-border-subtle px-3 py-2">
          <div className="min-w-0">
            <SectionLabel>Simulate</SectionLabel>
            <div className="truncate text-sm font-medium text-sf-text">{scenario.title}</div>
          </div>
          <Controls sim={sim} />
        </header>
        <div className="min-h-0 flex-1 p-2">
          <MiddlewareMap map={map} nodeStates={sim.nodeStates} step={sim.step} visitedEdges={sim.visitedEdges} />
        </div>
      </div>
      <aside className="hidden min-h-0 rounded-xl border border-sf-border bg-sf-surface shadow-sf-sm lg:block">
        <Inspector sim={sim} />
      </aside>
    </section>
  )
}
