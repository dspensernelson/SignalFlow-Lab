import { STATUS, isBuildable } from '../lib/progress'
import { TYPE_COLOR } from '../lib/nodeStyles'

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
  [STATUS.CONTEXT]: { label: 'Context', className: 'bg-violet-100 text-violet-700' },
  [STATUS.LOCKED]: { label: 'Upcoming', className: 'bg-gray-200 text-gray-600' },
  [STATUS.READY]: { label: 'Ready', className: 'bg-blue-100 text-blue-700' },
  [STATUS.IN_PROGRESS]: { label: 'In progress', className: 'bg-amber-100 text-amber-700' },
  [STATUS.COMPLETE]: { label: 'Complete', className: 'bg-emerald-100 text-emerald-700' },
}

// Interaction maturity of the lesson, separate from buildable progress status.
const LESSON_STATUS = {
  now: { label: 'Interactive now', className: 'bg-blue-100 text-blue-700' },
  intent: { label: 'Lesson defined', className: 'bg-slate-100 text-slate-600' },
  later: { label: 'Coming later', className: 'bg-gray-100 text-gray-500' },
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

function Chips({ items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c) => (
        <span key={c} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
          {c}
        </span>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-1.5">
      <h4 className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{title}</h4>
      <div className="mt-0.5 text-[11px] leading-snug text-gray-700">{children}</div>
    </div>
  )
}

function Inline({ items }) {
  if (!items || items.length === 0) return <span className="text-gray-400">—</span>
  return <span>{items.join(' · ')}</span>
}

function LinkChips({ items, onSelect, className }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      {items.map((it, i) => (
        <span key={it.id} className="inline-flex items-baseline">
          <button
            type="button"
            title={it.edge}
            onClick={() => onSelect(it.id)}
            className={`text-left hover:underline ${className}`}
          >
            {it.label}
          </button>
          {i < items.length - 1 && <span className="ml-1.5 text-gray-300">·</span>}
        </span>
      ))}
    </div>
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
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500 lg:h-full">
        Select a node in the workflow map to inspect it.
      </div>
    )
  }

  const buildable = isBuildable(node)
  const lesson = node.lesson
  const accent = TYPE_COLOR[node.type] || '#9ca3af'
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
      className="flex flex-col gap-1 rounded-xl border border-l-4 border-gray-200 bg-white p-3"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
            {TYPE_LABEL[node.type] || node.type}
          </p>
          <h3 className="text-sm font-bold leading-tight text-gray-900">{node.label}</h3>
          {phase && (
            <p className="text-[10px] text-gray-500">
              Phase {phase.order} · {phase.title.replace(/^Phase \d+: /, '')}
            </p>
          )}
          {lesson && (
            <span className="mt-1 inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-700">
              {capitalize(lesson.type)} lesson
            </span>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${rightBadge.className}`}>
          {rightBadge.label}
        </span>
      </div>

      {/* Action zone — kept at the top so the primary action is always visible */}
      <div className="border-b border-gray-100 pb-2">
        {buildable && status === STATUS.READY && (
          <button
            type="button"
            onClick={() => onStart(node.id)}
            className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Start lesson
          </button>
        )}

        {buildable && status === STATUS.IN_PROGRESS && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onContinue(node.id)}
              className="flex-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Continue lesson
            </button>
            <button
              type="button"
              onClick={() => onRestart(node.id)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Restart
            </button>
          </div>
        )}

        {buildable && status === STATUS.COMPLETE && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onViewArtifact(node.id)}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View artifact
            </button>
            <button
              type="button"
              onClick={() => onRestart(node.id)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Restart
            </button>
          </div>
        )}

        {!buildable && lesson && (
          <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] leading-snug text-slate-700">
            {lesson.status === 'intent'
              ? `${capitalize(lesson.type)} lesson — intent is defined; the interaction is coming in a later pass.`
              : `${capitalize(lesson.type)} lesson — planned for a later pass${phase ? `, in ${phase.title.replace(/^Phase \d+: /, '')}` : ''}.`}
          </p>
        )}
      </div>

      <p className="text-[11px] leading-snug text-gray-600">{node.description}</p>

      {lesson?.intent && (
        <Section title="What you'll do">{lesson.intent}</Section>
      )}
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
      {node.governanceNote && (
        <Section title="Governance">{node.governanceNote}</Section>
      )}

      <Section title="Depends on">
        {dependsOn.length === 0 ? (
          <span className="text-gray-400">Entry point</span>
        ) : (
          <LinkChips items={dependsOn} onSelect={onSelect} className="font-medium text-amber-700" />
        )}
      </Section>
      <Section title="Feeds into">
        {feedsInto.length === 0 ? (
          <span className="text-gray-400">Nothing downstream</span>
        ) : (
          <LinkChips items={feedsInto} onSelect={onSelect} className="font-medium text-blue-700" />
        )}
      </Section>
    </div>
  )
}
