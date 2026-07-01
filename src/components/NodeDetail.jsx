import { STATUS, isBuildable } from '../lib/progress'
import { TYPE_COLOR } from '../lib/nodeStyles'
import { Badge, Button, Chip, SectionLabel, Icon } from './ui'

const TYPE_LABEL = {
  source: 'Source object',
  reference: 'Reference object',
  artifact: 'Artifact',
  process: 'Process step',
  decision: 'Decision point',
  handoff: 'Handoff',
  output: 'Output',
  archive: 'Archive',
}

const STATUS_BADGE = {
  [STATUS.CONTEXT]: { label: 'Context', tone: 'context' },
  [STATUS.LOCKED]: { label: 'Upcoming', tone: 'locked' },
  [STATUS.READY]: { label: 'Ready', tone: 'ready' },
  [STATUS.IN_PROGRESS]: { label: 'In progress', tone: 'progress' },
  [STATUS.COMPLETE]: { label: 'Complete', tone: 'complete' },
}

// Interaction maturity of the lesson, separate from buildable progress status.
const LESSON_STATUS = {
  now: { label: 'Interactive now', tone: 'info' },
  intent: { label: 'Lesson defined', tone: 'neutral' },
  later: { label: 'Coming later', tone: 'locked' },
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

function Chips({ items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="border-t border-sf-border-subtle pt-1.5">
      <SectionLabel size="xs">{title}</SectionLabel>
      <div className="mt-0.5 text-[11px] leading-snug text-sf-body">{children}</div>
    </div>
  )
}

function Inline({ items }) {
  if (!items || items.length === 0) return <span className="text-sf-subtle">—</span>
  return <span>{items.join(' · ')}</span>
}

function LinkChips({ items, onSelect, color }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      {items.map((it, i) => (
        <span key={it.id} className="inline-flex items-baseline">
          <button
            type="button"
            title={it.edge}
            onClick={() => onSelect(it.id)}
            className="text-left font-medium hover:underline"
            style={{ color }}
          >
            {it.label}
          </button>
          {i < items.length - 1 && <span className="ml-1.5 text-sf-subtle">·</span>}
        </span>
      ))}
    </div>
  )
}

// Compact branching signal-flow: N inputs converge into this node, which fans
// out to M downstream consumers. Reinforces the app-wide mental model in the panel.
function MiniFlow({ inCount, outCount, accent }) {
  if (!inCount && !outCount) return null
  const W = 300
  const H = 44
  const cy = 22
  const nx1 = 122
  const nx2 = 178
  const up = 'var(--sf-edge-upstream)'
  const down = 'var(--sf-edge-downstream)'
  const spread = (n) => {
    const k = Math.min(n, 4)
    if (k <= 1) return [cy]
    const gap = Math.min(12, 30 / (k - 1))
    const start = cy - (gap * (k - 1)) / 2
    return Array.from({ length: k }, (_, i) => start + i * gap)
  }
  const inYs = spread(inCount)
  const outYs = spread(outCount)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <marker id="mf-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={up} />
        </marker>
        <marker id="mf-down" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={down} />
        </marker>
      </defs>
      {inYs.map((y, i) => (
        <g key={`in-${i}`}>
          <circle cx="8" cy={y} r="3" fill={up} />
          <path d={`M 12 ${y} C 62 ${y}, 86 ${cy}, ${nx1} ${cy}`} fill="none" stroke={up} strokeWidth="1.75" strokeLinecap="round" markerEnd="url(#mf-up)" />
        </g>
      ))}
      <rect x={nx1} y={cy - 11} width={nx2 - nx1} height="22" rx="5" fill="var(--sf-surface)" stroke={accent} strokeWidth="2" />
      {outYs.map((y, i) => (
        <g key={`out-${i}`}>
          <path d={`M ${nx2} ${cy} C ${nx2 + 40} ${cy}, ${W - 46} ${y}, ${W - 12} ${y}`} fill="none" stroke={down} strokeWidth="1.75" strokeLinecap="round" markerEnd="url(#mf-down)" />
          <circle cx={W - 6} cy={y} r="3" fill={down} />
        </g>
      ))}
    </svg>
  )
}

export default function NodeDetail({
  node,
  status,
  phase,
  nodesById,
  edges,
  onSelect,
  onStart,
  onContinue,
  onViewArtifact,
  onRestart,
}) {
  if (!node) {
    return (
      <div className="rounded-xl border border-sf-border bg-sf-surface p-4 text-xs text-sf-muted shadow-sf-sm lg:h-full">
        Select a node in the workflow map to inspect it.
      </div>
    )
  }

  const buildable = isBuildable(node)
  const lesson = node.lesson
  const isComplete = status === STATUS.COMPLETE
  const accent = isComplete && node.type === 'artifact' ? 'var(--sf-artifact-trusted)' : TYPE_COLOR[node.type] || '#9ca3af'
  // Right-side badge: progress status when buildable, otherwise lesson maturity.
  const rightBadge = buildable
    ? STATUS_BADGE[status] || STATUS_BADGE[STATUS.LOCKED]
    : LESSON_STATUS[lesson?.status] || LESSON_STATUS.later

  const feedsInto = edges
    .filter((e) => e.from === node.id)
    .map((e) => ({ id: e.to, label: nodesById[e.to]?.label || e.to, edge: e.label }))
  const dependsOn = edges
    .filter((e) => e.to === node.id)
    .map((e) => ({ id: e.from, label: nodesById[e.from]?.label || e.from, edge: e.label }))

  return (
    <div
      className="flex flex-col gap-1 rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm"
      style={{ borderLeftColor: accent, borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-sf-wide" style={{ color: accent }}>
            {TYPE_LABEL[node.type] || node.type}
          </p>
          <h3 className="text-sm font-bold leading-tight text-sf-text">{node.label}</h3>
          {node.artifactName && (
            <p className="font-mono text-[10px] text-sf-muted">{node.artifactName}</p>
          )}
          {phase && (
            <p className="text-[10px] text-sf-muted">
              Phase {phase.order} · {phase.title.replace(/^Phase \d+: /, '')}
            </p>
          )}
          {lesson && (
            <Chip className="mt-1 font-semibold">{capitalize(lesson.type)} lesson</Chip>
          )}
        </div>
        <Badge tone={rightBadge.tone}>{rightBadge.label}</Badge>
      </div>

      {/* Action zone — kept at the top so the primary action is always visible */}
      <div className="border-b border-sf-border-subtle pb-2">
        {buildable && status === STATUS.READY && (
          <Button variant="primary" size="sm" fullWidth iconRight="arrow-right" onClick={() => onStart(node.id)}>
            Start lesson
          </Button>
        )}

        {buildable && status === STATUS.IN_PROGRESS && (
          <div className="flex gap-2">
            <Button variant="warning" size="sm" className="flex-1" onClick={() => onContinue(node.id)}>
              Continue lesson
            </Button>
            <Button variant="neutral" size="sm" onClick={() => onRestart(node.id)}>
              Restart
            </Button>
          </div>
        )}

        {buildable && status === STATUS.COMPLETE && (
          <div className="flex gap-2">
            <Button variant="success" size="sm" className="flex-1" onClick={() => onViewArtifact(node.id)}>
              View artifact
            </Button>
            <Button variant="neutral" size="sm" onClick={() => onRestart(node.id)}>
              Restart
            </Button>
          </div>
        )}

        {!buildable && lesson && (
          <p className="rounded-lg bg-sf-surface-subtle px-2.5 py-1.5 text-[11px] leading-snug text-sf-body">
            {lesson.status === 'intent'
              ? `${capitalize(lesson.type)} lesson — intent is defined; the interaction is coming in a later pass.`
              : `${capitalize(lesson.type)} lesson — planned for a later pass${phase ? `, in ${phase.title.replace(/^Phase \d+: /, '')}` : ''}.`}
          </p>
        )}
      </div>

      {(dependsOn.length > 0 || feedsInto.length > 0) && (
        <div className="border-b border-sf-border-subtle pb-2">
          <SectionLabel size="xs">Signal flow</SectionLabel>
          <div className="mt-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-sf-wide">
            <span style={{ color: 'var(--sf-edge-upstream)' }}>
              {dependsOn.length} input{dependsOn.length === 1 ? '' : 's'}
            </span>
            <span style={{ color: 'var(--sf-edge-downstream)' }}>
              {feedsInto.length} reuse{feedsInto.length === 1 ? '' : 's'}
            </span>
          </div>
          <MiniFlow inCount={dependsOn.length} outCount={feedsInto.length} accent={accent} />
        </div>
      )}

      <p className="text-[11px] leading-snug text-sf-body">{node.description}</p>

      {lesson?.intent && <Section title="What you'll do">{lesson.intent}</Section>}
      {lesson?.concepts?.length > 0 && (
        <Section title="Concepts">
          <Chips items={lesson.concepts} />
        </Section>
      )}

      <Section title="In the lab">{node.labVersion || '—'}</Section>
      <Section title="At work">
        <Inline items={node.realWorldSources} />
      </Section>
      <Section title="Access you'd need">
        <Inline items={node.accessNeeded} />
      </Section>
      <Section title="Rebuild it solo">
        <Inline items={node.soloRebuildPath} />
      </Section>
      {node.governanceNote && <Section title="Governance">{node.governanceNote}</Section>}

      <Section title="Depends on">
        {dependsOn.length === 0 ? (
          <span className="text-sf-subtle">Entry point</span>
        ) : (
          <div className="flex items-start gap-1.5">
            <Icon name="arrow-left" size={12} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: 'var(--sf-edge-upstream)' }} />
            <LinkChips items={dependsOn} onSelect={onSelect} color="var(--sf-edge-upstream)" />
          </div>
        )}
      </Section>
      <Section title="Feeds into">
        {feedsInto.length === 0 ? (
          <span className="text-sf-subtle">Nothing downstream</span>
        ) : (
          <div className="flex items-start gap-1.5">
            <Icon name="arrow-right" size={12} strokeWidth={2.5} className="mt-0.5 shrink-0" style={{ color: 'var(--sf-edge-downstream)' }} />
            <LinkChips items={feedsInto} onSelect={onSelect} color="var(--sf-edge-downstream)" />
          </div>
        )}
      </Section>
    </div>
  )
}
