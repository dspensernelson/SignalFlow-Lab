import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react'
import { FlowConnector } from './FlowConnector'

// Signal-flow north-star: multiple raw inputs CONVERGE into a trusted artifact,
// which then FANS OUT into multiple downstream consumers. Connectors are curved
// SVG paths with arrowheads, measured from the real card positions, colored by
// DS edge semantics. Below lg it degrades to a stacked layout with vertical
// connectors so the same mental model still reads on narrow screens.
const TONE = {
  upstream: 'var(--sf-edge-upstream)', // amber — raw source signal
  downstream: 'var(--sf-edge-downstream)', // cyan — signal path forward
  completed: 'var(--sf-edge-completed)', // emerald — trusted/validated path
  reuse: 'var(--sf-edge-reuse)',
  muted: 'var(--sf-edge-muted)',
}

// Connectors support the layout; they should never out-shout the cards. Two
// intensities: 'primary' for the Takeaway (the moment the workflow actually
// changed) and 'subtle' everywhere else (context). Labels are opt-in and off
// by default so the color + placement carry the meaning without crowding.
const INTENSITY = {
  primary: { stroke: 1.75, marker: 6, opacity: 0.8, connector: 1.75, labels: true },
  subtle: { stroke: 1.25, marker: 5, opacity: 0.6, connector: 1.5, labels: false },
}

export function SignalFlowDiagram({
  inputs = [],
  center,
  consumers = [],
  inputTone = 'upstream',
  outputTone = 'completed',
  inputLabel,
  outputLabel,
  inputHeader,
  outputHeader,
  intensity = 'subtle',
  showLabels,
  gap = 60,
  className = '',
}) {
  const cfg = INTENSITY[intensity] || INTENSITY.subtle
  const labelsOn = showLabels ?? cfg.labels
  const wrapRef = useRef(null)
  const inRefs = useRef([])
  const midRef = useRef(null)
  const outRefs = useRef([])
  const [paths, setPaths] = useState([])
  const [labels, setLabels] = useState([])
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [horizontal, setHorizontal] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setHorizontal(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    const mid = midRef.current
    if (!wrap) return
    const base = wrap.getBoundingClientRect()
    setDims({ w: base.width, h: base.height })
    if (!horizontal || !mid) {
      setPaths([])
      setLabels([])
      return
    }
    const mr = mid.getBoundingClientRect()
    const left = { x: mr.left - base.left, y: mr.top - base.top + mr.height / 2 }
    const right = { x: mr.right - base.left, y: mr.top - base.top + mr.height / 2 }
    const nextPaths = []
    let maxInRight = 0
    inRefs.current.slice(0, inputs.length).forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const s = { x: r.right - base.left, y: r.top - base.top + r.height / 2 }
      maxInRight = Math.max(maxInRight, s.x)
      const dx = Math.max(22, (left.x - s.x) * 0.5)
      nextPaths.push({
        key: `in-${i}`,
        d: `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${left.x - dx} ${left.y}, ${left.x} ${left.y}`,
        tone: inputTone,
      })
    })
    let minOutLeft = base.width
    outRefs.current.slice(0, consumers.length).forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const t = { x: r.left - base.left, y: r.top - base.top + r.height / 2 }
      minOutLeft = Math.min(minOutLeft, t.x)
      const dx = Math.max(22, (t.x - right.x) * 0.5)
      nextPaths.push({
        key: `out-${i}`,
        d: `M ${right.x} ${right.y} C ${right.x + dx} ${right.y}, ${t.x - dx} ${t.y}, ${t.x} ${t.y}`,
        tone: outputTone,
      })
    })
    setPaths(nextPaths)
    const nextLabels = []
    if (labelsOn && inputLabel && inputs.length) {
      nextLabels.push({ x: (maxInRight + left.x) / 2, y: left.y, text: inputLabel.toUpperCase(), tone: inputTone })
    }
    if (labelsOn && outputLabel && consumers.length) {
      nextLabels.push({ x: (right.x + minOutLeft) / 2, y: right.y, text: outputLabel.toUpperCase(), tone: outputTone })
    }
    setLabels(nextLabels)
  }, [horizontal, inputTone, outputTone, inputLabel, outputLabel, labelsOn, inputs.length, consumers.length])

  useLayoutEffect(() => {
    measure()
    const id = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(id)
  }, [measure])

  useEffect(() => {
    const ro = new ResizeObserver(() => measure())
    if (wrapRef.current) ro.observe(wrapRef.current)
    if (midRef.current) ro.observe(midRef.current)
    inRefs.current.forEach((el) => el && ro.observe(el))
    outRefs.current.forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [measure])

  const tones = [...new Set([inputTone, outputTone])]

  // Stacked (narrow): inputs -> vertical connector -> artifact -> vertical connector -> consumers.
  if (!horizontal) {
    return (
      <div ref={wrapRef} className={['flex flex-col gap-3', className].join(' ')}>
        {inputs.length > 0 && (
          <>
            {inputHeader && (
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">{inputHeader}</h3>
            )}
            <div className="flex flex-col gap-3">
              {inputs.map((n, i) => (
                <div key={`in-${i}`}>{n}</div>
              ))}
            </div>
            <FlowConnector tone={inputTone} vertical length={28} weight={cfg.connector} label={labelsOn ? inputLabel : undefined} className="self-center" />
          </>
        )}
        <div>{center}</div>
        {consumers.length > 0 && (
          <>
            <FlowConnector tone={outputTone} vertical length={28} weight={cfg.connector} label={labelsOn ? outputLabel : undefined} className="self-center" />
            {outputHeader && (
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">{outputHeader}</h3>
            )}
            <div className="flex flex-col gap-3">
              {consumers.map((n, i) => (
                <div key={`out-${i}`}>{n}</div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div ref={wrapRef} className={['relative', className].join(' ')}>
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={dims.w}
        height={dims.h}
        aria-hidden="true"
      >
        <defs>
          {tones.map((tone) => (
            <marker
              key={tone}
              id={`sfd-${tone}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth={cfg.marker}
              markerHeight={cfg.marker}
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={TONE[tone]} />
            </marker>
          ))}
        </defs>
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke={TONE[p.tone]}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            opacity={cfg.opacity}
            markerEnd={`url(#sfd-${p.tone})`}
          />
        ))}
      </svg>

      <div
        className="relative grid items-center gap-y-3"
        style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)', columnGap: gap }}
      >
        <div className="flex flex-col justify-center gap-3">
          {inputHeader && (
            <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle">{inputHeader}</h3>
          )}
          {inputs.map((n, i) => (
            <div key={`in-${i}`} ref={(el) => (inRefs.current[i] = el)}>
              {n}
            </div>
          ))}
        </div>

        <div ref={midRef} className="flex items-center justify-center">
          {center}
        </div>

        <div className="flex flex-col justify-center gap-3">
          {outputHeader && (
            <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-subtle lg:text-right">
              {outputHeader}
            </h3>
          )}
          {consumers.map((n, i) => (
            <div key={`out-${i}`} ref={(el) => (outRefs.current[i] = el)}>
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Labels paint ON TOP of the cards (in the column gap) so the connector
          tone captions are never covered by an adjacent card. */}
      {labels.map((l, i) => (
        <span
          key={`lbl-${i}`}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-sf-surface px-1 text-[8px] font-semibold uppercase leading-none tracking-sf-wide"
          style={{ left: l.x, top: l.y, color: TONE[l.tone] }}
        >
          {l.text}
        </span>
      ))}
    </div>
  )
}
