import { useEffect, useRef, useState } from 'react'
import { STATUS, deriveNodeStatus, derivePhaseStatus, isBuildable } from '../lib/progress'
import { TYPE_COLOR } from '../lib/nodeStyles'

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

// Base look by status + type, WITHOUT a ring (rings are reserved for relationships).
function nodeBase(status, type) {
  if (status === STATUS.CONTEXT) {
    return type === 'reference'
      ? 'border-violet-200 bg-violet-50 text-violet-950'
      : 'border-amber-300 bg-amber-50 text-amber-950'
  }
  if (status === STATUS.READY) return 'border-blue-400 bg-white text-gray-900'
  if (status === STATUS.IN_PROGRESS) return 'border-amber-400 bg-white text-gray-900'
  if (status === STATUS.COMPLETE) return 'border-emerald-400 bg-emerald-50 text-gray-900'
  return 'border-gray-200 bg-gray-50 text-gray-400'
}

const PHASE_DOT = {
  [STATUS.READY]: 'bg-blue-500',
  [STATUS.IN_PROGRESS]: 'bg-amber-500',
  [STATUS.COMPLETE]: 'bg-emerald-500',
  [STATUS.LOCKED]: 'bg-gray-300',
  [STATUS.CONTEXT]: 'bg-gray-300',
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

const EDGE_COLOR = {
  slate: '#cbd5e1',
  blue: '#3b82f6',
  amber: '#f59e0b',
  emerald: '#10b981',
}

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
  const statusById = Object.fromEntries(nodes.map((n) => [n.id, deriveNodeStatus(n, progress)]))
  // Node positions in stage space (offset below the phase header band).
  const pos = Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y + HEADER_H }]))

  const upstreamIds = new Set(edges.filter((e) => e.to === selectedNodeId).map((e) => e.from))
  const downstreamIds = new Set(edges.filter((e) => e.from === selectedNodeId).map((e) => e.to))
  const selectedNode = byId[selectedNodeId]
  const relatedPhaseId = selectedNode?.phaseId

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
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
            const phaseStatus = derivePhaseStatus(phase, progress)
            const bg = related ? 'bg-blue-50' : i % 2 === 0 ? 'bg-slate-50/70' : 'bg-transparent'
            return (
              <div
                key={phase.id}
                className={`absolute rounded-2xl transition-colors ${bg}`}
                style={{ left, top: 0, width: NODE_W + REGION_PAD * 2, height: DESIGN_H }}
              >
                <div className="px-3 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${PHASE_DOT[phaseStatus]}`} />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest ${
                        related ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      Phase {phase.order}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 text-xs font-medium leading-tight ${
                      related ? 'text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {phase.title.replace(/^Phase \d+: /, '')}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Edge layer */}
          <svg className="pointer-events-none absolute inset-0" width={DESIGN_W} height={DESIGN_H} aria-hidden="true">
            <defs>
              {Object.entries(EDGE_COLOR).map(([key, color]) => (
                <marker
                  key={key}
                  id={`arrow-${key}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
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
              let color = 'slate'
              if (isDown) color = 'blue'
              else if (isUp) color = 'amber'
              else if (statusById[edge.from] === STATUS.COMPLETE) color = 'emerald'
              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={edgePath(s, t)}
                  fill="none"
                  stroke={EDGE_COLOR[color]}
                  strokeWidth={connected ? 2.5 : 1.5}
                  opacity={connected ? 1 : 0.45}
                  markerEnd={`url(#arrow-${color})`}
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
            let ring = ''
            if (selected) ring = 'ring-2 ring-offset-2 ring-blue-600'
            else if (isDown) ring = 'ring-2 ring-blue-400'
            else if (isUp) ring = 'ring-2 ring-amber-400'
            const buildable = isBuildable(node)
            // Playable nodes always stay legible: relationship-dimming only applies
            // to non-playable context nodes, so a buildable lesson never looks disabled.
            const dimmed = !related && !buildable
            let action = null
            if (buildable && status === STATUS.READY) {
              action = { label: 'Start lesson', run: () => onStart(node.id), cls: 'bg-blue-600 text-white hover:bg-blue-700' }
            } else if (buildable && status === STATUS.IN_PROGRESS) {
              action = { label: 'Continue', run: () => onContinue(node.id), cls: 'bg-amber-500 text-white hover:bg-amber-600' }
            } else if (buildable && status === STATUS.COMPLETE) {
              action = { label: 'View', run: () => onViewArtifact(node.id), cls: 'bg-emerald-600 text-white hover:bg-emerald-700' }
            }
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
                className={`absolute flex cursor-pointer flex-col rounded-xl border p-2.5 text-left shadow-sm transition ${nodeBase(
                  status,
                  node.type
                )} ${ring} ${dimmed ? 'opacity-45' : ''}`}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: TYPE_COLOR[node.type] || '#9ca3af' }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                      {TYPE_LABEL[node.type] || node.type}
                    </span>
                  </span>
                  {status === STATUS.COMPLETE && (
                    <span className="text-emerald-600" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <span className="mt-1 text-sm font-semibold leading-tight">{node.label}</span>
                <div className="mt-auto flex items-center justify-between gap-1.5">
                  {node.artifactName ? (
                    <span className="truncate font-mono text-[10px] opacity-70">{node.artifactName}</span>
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
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold shadow-sm transition ${action.cls}`}
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

      {/* Relationship legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm ring-2 ring-blue-600" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-amber-500" />
          Depends on (upstream)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-blue-500" />
          Feeds into (downstream)
        </span>
      </div>
    </div>
  )
}
