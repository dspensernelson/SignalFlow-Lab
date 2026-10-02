import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui'

// The donor-ops process map, driven by src/data/middleware/map.json and a
// simulation's derived node states. Same positioning approach as the
// automation canvas (absolute nodes on a fixed design canvas, scaled to fit)
// but with no progress, tiers, or lesson buttons: this map only shows a
// concept in motion. The active step's edge carries an SVG-animated packet.

const KIND_COLOR = {
  actor: 'var(--sf-type-handoff)',
  agent: 'var(--sf-type-process)',
  middleware: 'var(--sf-type-artifact)',
  system: 'var(--sf-type-output)',
}

const STATUS_STROKE = {
  ok: 'var(--sf-edge-completed)',
  error: 'var(--sf-danger)',
  timeout: 'var(--sf-danger)',
  held: 'var(--sf-warning)',
  pending: 'var(--sf-edge-downstream)',
}

const STATE_CLASS = {
  active: 'border-sf-accent ring-2 ring-sf-ring/40 bg-sf-surface',
  ok: 'border-sf-complete bg-sf-complete-weak',
  error: 'border-sf-danger bg-sf-danger-weak',
  held: 'border-sf-warning bg-sf-warning-weak',
  waiting: 'border-sf-progress border-dashed bg-sf-surface',
  idle: 'border-sf-border bg-sf-surface',
}

function center(n, w, h) {
  return { x: n.x + w / 2, y: n.y + h / 2 }
}

// Edge from the facing sides of two nodes, bowed so parallel edges stay apart.
function edgePath(a, b, w, h) {
  const ca = center(a, w, h)
  const cb = center(b, w, h)
  if (Math.abs(ca.x - cb.x) < w) {
    // vertical neighbours: leave from the bottom/top centre
    const down = cb.y > ca.y
    const sy = down ? a.y + h : a.y
    const ty = down ? b.y : b.y + h
    const dy = (ty - sy) * 0.5
    return `M ${ca.x} ${sy} C ${ca.x} ${sy + dy}, ${cb.x} ${ty - dy}, ${cb.x} ${ty}`
  }
  const rightward = cb.x > ca.x
  const sx = rightward ? a.x + w : a.x
  const tx = rightward ? b.x : b.x + w
  const dx = (tx - sx) * 0.5
  return `M ${sx} ${ca.y} C ${sx + dx} ${ca.y}, ${tx - dx} ${cb.y}, ${tx} ${cb.y}`
}

export default function MiddlewareMap({ map, nodeStates = {}, step = null, visitedEdges = new Set() }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const W = map.width
  const H = map.height
  const NW = map.nodeWidth
  const NH = map.nodeHeight

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const measure = () => setScale(Math.min(1, el.clientWidth / W, el.clientHeight / H))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [W, H])

  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]))
  const activeFrom = step?.from && step?.to && step.from !== step.to ? byId[step.from] : null
  const activeTo = activeFrom ? byId[step.to] : null
  const activePath = activeFrom && activeTo ? edgePath(activeFrom, activeTo, NW, NH) : null
  const activeStroke = STATUS_STROKE[step?.status] || 'var(--sf-edge-selected)'

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 origin-top-left"
        style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center' }}
      >
        {map.groups.map((g) => (
          <div
            key={g.id}
            className="absolute rounded-xl border border-dashed border-sf-border-strong bg-sf-surface-subtle/60"
            style={{ left: g.x, top: g.y, width: g.w, height: g.h }}
          >
            <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
              {g.label}
            </span>
          </div>
        ))}

        <svg className="absolute inset-0" width={W} height={H} aria-hidden="true">
          <defs>
            <marker id="mw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sf-edge-muted)" />
            </marker>
          </defs>
          {map.edges.map((e) => {
            const a = byId[e.from]
            const b = byId[e.to]
            if (!a || !b) return null
            const visited = visitedEdges.has(`${e.from}->${e.to}`)
            return (
              <path
                key={`${e.from}-${e.to}`}
                d={edgePath(a, b, NW, NH)}
                fill="none"
                stroke={visited ? 'var(--sf-edge-completed)' : 'var(--sf-edge-muted)'}
                strokeWidth={visited ? 2 : 1.5}
                strokeDasharray={visited ? undefined : '4 4'}
                markerEnd="url(#mw-arrow)"
                opacity={visited ? 0.9 : 0.7}
              />
            )
          })}
          {activePath && (
            <g key={step.id}>
              <path d={activePath} fill="none" stroke={activeStroke} strokeWidth={3} strokeLinecap="round" />
              <circle r={6} fill={activeStroke} stroke="var(--sf-surface)" strokeWidth={2}>
                <animateMotion dur={`${Math.max(step.durationMs || 1200, 400)}ms`} repeatCount="indefinite" path={activePath} />
              </circle>
            </g>
          )}
        </svg>

        {map.nodes.map((n) => {
          const state = nodeStates[n.id] || 'idle'
          const isEndpoint = step && (step.from === n.id || step.to === n.id)
          return (
            <div
              key={n.id}
              title={`${n.label}: ${n.sublabel || ''}`}
              className={[
                'absolute flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left shadow-sf-sm transition-colors',
                STATE_CLASS[state] || STATE_CLASS.idle,
                isEndpoint ? 'z-10' : '',
              ].join(' ')}
              style={{ left: n.x, top: n.y, width: NW, height: NH, borderLeftColor: KIND_COLOR[n.kind], borderLeftWidth: 4 }}
            >
              <Icon name={n.icon || 'circle'} size={16} className="shrink-0 text-sf-muted" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-xs font-semibold text-sf-text">{n.label}</div>
                <div className="truncate text-[10px] text-sf-muted">{n.sublabel}</div>
              </div>
              {state === 'held' && <Icon name="lock" size={12} className="ml-auto shrink-0 text-sf-warning" />}
              {state === 'error' && <Icon name="triangle-alert" size={12} className="ml-auto shrink-0 text-sf-danger" />}
              {state === 'ok' && <Icon name="check" size={12} className="ml-auto shrink-0 text-sf-complete" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
