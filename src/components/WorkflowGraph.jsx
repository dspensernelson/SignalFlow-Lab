import { useEffect, useRef, useState } from 'react'
import { STATUS, deriveNodeStatus, derivePhaseStatus, isBuildable } from '../lib/progress'
import { TYPE_COLOR } from '../lib/nodeStyles'
import { Icon } from './ui'

const NODE_W = 190
const NODE_H = 84
const HEADER_H = 50
const STAGE_H = 592
const DESIGN_W = 1230
const DESIGN_H = HEADER_H + STAGE_H
const REGION_PAD = 18

const TYPE_LABEL = {
  source: 'Source',
  reference: 'Reference',
  artifact: 'Artifact',
  process: 'Process',
  decision: 'Decision',
  handoff: 'Handoff',
  output: 'Output',
  archive: 'Archive',
}

// Node-type identity icons (DS mapping) shown in each node's type row.
const TYPE_ICON = {
  source: 'file-text',
  reference: 'shield',
  artifact: 'braces',
  process: 'line-chart',
  decision: 'user-check',
  handoff: 'send',
  output: 'file-text',
  archive: 'archive',
}

// Base look by status + type, WITHOUT a ring (rings are reserved for relationships).
function nodeClasses(status, type) {
  if (status === STATUS.CONTEXT) {
    return type === 'reference'
      ? 'border-sf-type-reference bg-sf-context-weak text-sf-text'
      : 'border-sf-type-source bg-sf-progress-weak text-sf-text'
  }
  if (status === STATUS.READY) return 'border-sf-accent-border bg-sf-surface text-sf-text'
  if (status === STATUS.IN_PROGRESS) return 'border-sf-progress bg-sf-surface text-sf-text'
  if (status === STATUS.COMPLETE) {
    return type === 'artifact'
      ? 'border-sf-trusted-border bg-sf-trusted-weak text-sf-text'
      : 'border-sf-complete bg-sf-complete-weak text-sf-text'
  }
  return 'border-sf-border bg-sf-surface-subtle text-sf-muted'
}

// World-view phase status: complete if every covered node is complete, ready
// if any is ready, else locked/context.
function phaseStatusFrom(phase, statusById) {
  const ids = phase.nodeIds || []
  const sts = ids.map((id) => statusById[id]).filter(Boolean)
  if (sts.length === 0) return STATUS.CONTEXT
  const covered = sts.filter((st) => st !== STATUS.CONTEXT)
  if (covered.length === 0) return STATUS.CONTEXT
  if (covered.every((st) => st === STATUS.COMPLETE)) return STATUS.COMPLETE
  if (covered.some((st) => st === STATUS.READY || st === STATUS.IN_PROGRESS)) return STATUS.READY
  return STATUS.LOCKED
}

const PHASE_DOT_VAR = {
  [STATUS.READY]: 'var(--sf-ready)',
  [STATUS.IN_PROGRESS]: 'var(--sf-progress)',
  [STATUS.COMPLETE]: 'var(--sf-complete)',
  [STATUS.LOCKED]: 'var(--sf-locked)',
  [STATUS.CONTEXT]: 'var(--sf-locked)',
}

// Curved connector. Same-column edges bow into the right gutter so they never
// cross the nodes stacked in their column; cross-phase edges flow left to right.
function edgePath(s, t) {
  if (s.x === t.x) {
    const x = s.x + NODE_W
    const sy = s.y + NODE_H / 2
    const ty = t.y + NODE_H / 2
    const bow = 28
    return `M ${x} ${sy} C ${x + bow} ${sy}, ${x + bow} ${ty}, ${x} ${ty}`
  }
  const sx = s.x + NODE_W
  const sy = s.y + NODE_H / 2
  const tx = t.x
  const ty = t.y + NODE_H / 2
  const dx = (tx - sx) * 0.5
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`
}

// Edge colors reference the design-system edge tokens.
const EDGE_COLOR = {
  muted: 'var(--sf-edge-muted)',
  downstream: 'var(--sf-edge-downstream)',
  upstream: 'var(--sf-edge-upstream)',
  completed: 'var(--sf-edge-completed)',
}

const LEGEND = [
  { kind: 'arrow', color: 'var(--sf-edge-upstream)', label: 'Upstream / raw signal' },
  { kind: 'arrow', color: 'var(--sf-edge-downstream)', label: 'Downstream / signal path' },
  { kind: 'arrow', color: 'var(--sf-edge-completed)', label: 'Completed / trusted path' },
  { kind: 'arrow-dashed', color: 'var(--sf-edge-muted)', label: 'Locked / future' },
]

export default function WorkflowGraph({
  nodes,
  phases,
  edges,
  progress,
  selectedNodeId,
  onSelect,
  onStart,
  onContinue,
  onViewArtifact,
  // World-view mode: status and actions come from the builder's progress
  // instead of the worksheet progress model.
  statusById: statusOverride = null,
  actionFor = null,
}) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = (w) => setScale(Math.min(1, w / DESIGN_W))
    measure(el.clientWidth)
    const ro = new ResizeObserver((entries) => measure(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const statusById = statusOverride || Object.fromEntries(nodes.map((n) => [n.id, deriveNodeStatus(n, progress)]))
  const worldMode = Boolean(statusOverride)
  // Node positions in stage space (offset below the phase header band).
  const pos = Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y + HEADER_H }]))

  const upstreamIds = new Set(edges.filter((e) => e.to === selectedNodeId).map((e) => e.from))
  const downstreamIds = new Set(edges.filter((e) => e.from === selectedNodeId).map((e) => e.to))
  const selectedNode = byId[selectedNodeId]
  const relatedPhaseId = selectedNode?.phaseId
  const hasSelection = Boolean(selectedNodeId)

  return (
    <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
      <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height: DESIGN_H * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
        >
          {/* Phase regions — subtle annotations, no caging borders */}
          {phases.map((phase, i) => {
            const colNode = nodes.find((n) => n.phaseId === phase.id)
            if (!colNode) return null
            const left = colNode.x - REGION_PAD
            const related = phase.id === relatedPhaseId
            const phaseStatus = worldMode ? phaseStatusFrom(phase, statusById) : derivePhaseStatus(phase, progress)
            const bg = related
              ? 'var(--sf-phase-band-sel)'
              : i % 2 === 0
                ? 'var(--sf-phase-band)'
                : 'transparent'
            return (
              <div
                key={phase.id}
                className="absolute rounded-2xl transition-colors"
                style={{ left, top: 0, width: NODE_W + REGION_PAD * 2, height: DESIGN_H, backgroundColor: bg }}
              >
                <div className="px-3 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: PHASE_DOT_VAR[phaseStatus] }}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-sf-widest ${
                        related ? 'text-sf-accent-text' : 'text-sf-subtle'
                      }`}
                    >
                      Phase {phase.order}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 text-xs font-medium leading-tight ${
                      related ? 'text-sf-body' : 'text-sf-muted'
                    }`}
                  >
                    {phase.title.replace(/^Phase \d+: /, '')}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Edge layer */}
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width={DESIGN_W} height={DESIGN_H} aria-hidden="true">
            <defs>
              {Object.entries(EDGE_COLOR).map(([key, color]) => (
                <marker
                  key={key}
                  id={`arrow-${key}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill={color} />
                </marker>
              ))}
            </defs>
            {edges.map((edge) => {
              const s = pos[edge.from]
              const t = pos[edge.to]
              if (!s || !t) return null
              const isUp = edge.to === selectedNodeId
              const isDown = edge.from === selectedNodeId
              const connected = isUp || isDown
              const sourceComplete = statusById[edge.from] === STATUS.COMPLETE
              const targetLocked = statusById[edge.to] === STATUS.LOCKED
              let color = 'muted'
              let dashed = false
              if (isDown) color = 'downstream'
              else if (isUp) color = 'upstream'
              else if (sourceComplete) color = 'completed'
              else if (targetLocked) dashed = true
              const dim = hasSelection && !connected
              const strokeColor = EDGE_COLOR[color]
              const strokeWidth = connected ? 3 : sourceComplete ? 2 : 1.75
              const opacity = connected
                ? 1
                : dashed
                  ? dim ? 0.4 : 0.6
                  : sourceComplete
                    ? dim ? 0.7 : 0.9
                    : dim ? 0.3 : 0.6
              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={edgePath(s, t)}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={dashed ? '5 6' : undefined}
                  opacity={opacity}
                  markerEnd={`url(#arrow-${color})`}
                  style={connected ? { filter: `drop-shadow(0 0 3px ${strokeColor})` } : undefined}
                >
                  <title>{`${byId[edge.from].label} ${edge.label} ${byId[edge.to].label}`}</title>
                </path>
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const p = pos[node.id]
            const status = statusById[node.id]
            const selected = node.id === selectedNodeId
            const isUp = upstreamIds.has(node.id)
            const isDown = downstreamIds.has(node.id)
            const related = selected || isUp || isDown
            const isComplete = status === STATUS.COMPLETE
            let ring = ''
            if (selected) ring = 'ring-2 ring-offset-2 ring-offset-sf-surface ring-sf-ring'
            else if (isDown) ring = 'ring-2 ring-offset-1 ring-offset-sf-surface ring-sf-type-artifact'
            else if (isUp) ring = 'ring-2 ring-offset-1 ring-offset-sf-surface ring-sf-type-source'
            const worldAction = worldMode && actionFor ? actionFor(node) : null
            const buildable = worldMode ? Boolean(worldAction) : isBuildable(node)
            // Playable nodes always stay legible: relationship-dimming only applies
            // to non-playable context nodes, so a buildable lesson never looks disabled.
            const dimmed = !related && !buildable
            let action = null
            if (worldMode) {
              if (worldAction && !worldAction.disabled) {
                action = { label: worldAction.label, run: worldAction.onClick, cls: status === STATUS.COMPLETE ? 'bg-sf-complete text-white hover:opacity-90' : 'bg-sf-accent text-white hover:bg-sf-accent-hover' }
              }
            } else if (buildable && status === STATUS.READY) {
              action = { label: 'Start lesson', run: () => onStart(node.id), cls: 'bg-sf-accent text-white hover:bg-sf-accent-hover' }
            } else if (buildable && status === STATUS.IN_PROGRESS) {
              action = { label: 'Continue', run: () => onContinue(node.id), cls: 'bg-sf-progress text-white hover:opacity-90' }
            } else if (buildable && status === STATUS.COMPLETE) {
              action = { label: 'View', run: () => onViewArtifact(node.id), cls: 'bg-sf-complete text-white hover:opacity-90' }
            }
            const eyebrowColor =
              isComplete && node.type === 'artifact'
                ? 'var(--sf-artifact-trusted)'
                : TYPE_COLOR[node.type] || '#9ca3af'
            return (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(node.id)
                  }
                }}
                aria-pressed={selected}
                title={node.label}
                className={`absolute flex cursor-pointer flex-col rounded-xl border p-2.5 text-left shadow-sf-sm transition ${nodeClasses(
                  status,
                  node.type
                )} ${ring} ${dimmed ? 'opacity-45' : ''}`}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Icon name={TYPE_ICON[node.type] || 'braces'} size={13} strokeWidth={2} style={{ color: eyebrowColor }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-sf-wide"
                      style={{ color: eyebrowColor }}
                    >
                      {TYPE_LABEL[node.type] || node.type}
                    </span>
                  </span>
                  {isComplete && (
                    <Icon
                      name="circle-check"
                      size={14}
                      strokeWidth={2.25}
                      style={{ color: node.type === 'artifact' ? 'var(--sf-artifact-trusted)' : 'var(--sf-complete)' }}
                    />
                  )}
                </div>
                <span className="mt-1 text-sm font-semibold leading-tight">{node.label}</span>
                <div className="mt-auto flex items-center justify-between gap-1.5">
                  {/* Filenames live in the detail panel; truncated mono text on
                      cards read as clutter. Show the lesson kind instead. */}
                  {node.lesson?.type ? (
                    <span className="text-[10px] capitalize text-sf-muted">{node.lesson.type}</span>
                  ) : (
                    <span />
                  )}
                  {action && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        action.run()
                      }}
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold shadow-sf-sm transition ${action.cls}`}
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-sf-muted">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
              <line
                x1="1"
                y1="5"
                x2="18"
                y2="5"
                stroke={item.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={item.kind === 'arrow-dashed' ? '3 3' : undefined}
              />
              <path d="M17 1.5 L24 5 L17 8.5" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
