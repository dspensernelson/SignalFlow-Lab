import { Icon } from '../components/ui'
import { kindStyle, tint, STATUS_STYLE } from './kindStyles.js'
import Palette from './Palette.jsx'
import StepEditor from './StepEditor.jsx'
import { findStep } from '../runtime/flowModel.js'

// Horizontal line: the Make and n8n layouts. Modules sit on a line left to
// right; a Router/IF fans out into two rows that rejoin. The selected node's
// editor opens beneath the line.

const pathKey = (path) => path.join('/')

function Connector({ onOpen, open, skin, onPick, onCancel }) {
  return (
    <div className="relative flex h-full min-w-[28px] items-center justify-center self-stretch">
      <span className="absolute left-0 right-0 top-1/2 h-px bg-sf-border-strong" aria-hidden="true" />
      <button
        type="button"
        onClick={onOpen}
        aria-label="Add a step here"
        title="Add a step here"
        className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full border bg-sf-surface text-sf-muted transition-all hover:border-sf-accent-border hover:text-sf-accent ${open ? 'border-sf-accent-border text-sf-accent' : 'border-sf-border'}`}
      >
        <Icon name="plus" size={9} strokeWidth={3} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-[420px] -translate-x-1/2">
          <Palette skin={skin} onPick={onPick} onCancel={onCancel} />
        </div>
      )}
    </div>
  )
}

function Node({ step, skin, ctx, selected, status, dimmed, replaying, onSelect, shape }) {
  const st = kindStyle(step.kind)
  const d = skin.describe(step, ctx)
  const statusStyle = status ? STATUS_STYLE[status.status] : null
  const round = shape === 'circle'
  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${d.title}\n${d.subtitle}${status ? `\n${status.note}` : ''}`}
      className={`relative flex flex-none flex-col items-center gap-1 ${dimmed ? 'opacity-40' : ''}`}
      style={{ width: round ? 92 : 148 }}
    >
      <span
        className={`relative flex items-center justify-center border-2 bg-sf-surface transition-all ${round ? 'h-14 w-14 rounded-full' : 'h-12 w-full rounded-lg px-2'} ${selected ? 'shadow-sf-md' : 'shadow-sf-sm'} ${replaying ? 'ring-4 ring-sf-accent/40' : ''}`}
        style={{ borderColor: selected ? 'var(--sf-accent)' : st.color, background: round ? tint(st.color, 22) : undefined }}
      >
        <span className="flex items-center gap-1.5" style={{ color: st.color }}>
          <Icon name={st.icon} size={round ? 20 : 16} />
          {!round && <span className="truncate text-left text-[11px] font-semibold text-sf-text">{d.title}</span>}
        </span>
        {statusStyle && (
          <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full ${statusStyle.className}`}>
            <Icon name={statusStyle.icon} size={10} strokeWidth={3} />
          </span>
        )}
      </span>
      {round && <span className="line-clamp-2 w-full text-center text-[10px] font-semibold leading-tight text-sf-text">{d.title}</span>}
      {!round && <span className="line-clamp-1 w-full text-center text-[10px] leading-tight text-sf-muted">{d.subtitle}</span>}
    </button>
  )
}

export default function FlowLine(props) {
  const { flow, skin, ctx, selectedStepId, onSelectStep, insertAt, onOpenInsert, onPick, onCancelInsert, onChangeStep, onRemoveStep, stepStatus, hasRun, replayStepId, fieldsFor } = props
  const shape = skin.id === 'make' ? 'circle' : 'rect'

  function renderList(list, path, depth) {
    const key = pathKey(path)
    const items = []
    list.forEach((step, index) => {
      const isTrigger = step.kind === 'trigger' && depth === 0 && index === 0
      if (!isTrigger) {
        items.push(<Connector key={`c-${key}-${index}`} skin={skin} open={!!insertAt && insertAt.key === key && insertAt.index === index} onOpen={() => onOpenInsert(path, index)} onPick={onPick} onCancel={onCancelInsert} />)
      }
      const status = stepStatus ? stepStatus[step.id] : null
      items.push(
        <Node key={step.id} step={step} skin={skin} ctx={ctx} shape={shape} selected={selectedStepId === step.id} status={status} dimmed={hasRun && !status && !replayStepId} replaying={replayStepId === step.id} onSelect={() => onSelectStep(selectedStepId === step.id ? null : step.id)} />
      )
      if (step.kind === 'condition') {
        const d = skin.describe(step, ctx)
        const labels = d.branchLabels || { yes: 'yes', no: 'no' }
        items.push(
          <div key={`lanes-${step.id}`} className="flex flex-col gap-2 border-l border-dashed border-sf-border-strong pl-1">
            {['yes', 'no'].map((b) => (
              <div key={b} className="flex items-center">
                <span className={`mr-1 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${b === 'yes' ? 'bg-sf-complete-weak text-sf-complete-text' : 'bg-sf-warning-weak text-sf-progress-text'}`}>{labels[b]}</span>
                <div className="flex items-center">{renderList(step.branches[b], [...path, step.id, b], depth + 1)}</div>
              </div>
            ))}
          </div>
        )
      }
    })
    items.push(<Connector key={`c-${key}-end`} skin={skin} open={!!insertAt && insertAt.key === key && insertAt.index === list.length} onOpen={() => onOpenInsert(path, list.length)} onPick={onPick} onCancel={onCancelInsert} />)
    return items
  }

  const sel = selectedStepId ? findStep(flow, selectedStepId) : null

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-sf-border bg-sf-surface-subtle p-4" style={{ backgroundImage: 'radial-gradient(var(--sf-border) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        <div className="flex min-w-max items-center">{renderList(flow.steps, [], 0)}</div>
      </div>
      {sel && (
        <div className="rounded-xl border border-sf-accent-border bg-sf-surface p-3 shadow-sf-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-sf-text">{skin.describe(sel.step, ctx).title}</span>
            <div className="flex items-center gap-1">
              {sel.step.kind !== 'trigger' && (
                <button type="button" onClick={() => onRemoveStep(sel.step.id)} className="rounded p-1 text-sf-muted hover:bg-sf-danger-weak hover:text-sf-danger" aria-label="Remove step" title="Remove step">
                  <Icon name="x" size={13} />
                </button>
              )}
              <button type="button" onClick={() => onSelectStep(null)} className="rounded p-1 text-sf-muted hover:bg-sf-surface-subtle" aria-label="Close editor">
                <Icon name="chevron-down" size={13} />
              </button>
            </div>
          </div>
          <StepEditor step={sel.step} moduleData={ctx.moduleData} fields={fieldsFor(sel.step.id)} onChange={(patch) => onChangeStep(sel.step.id, patch)} />
        </div>
      )}
    </div>
  )
}
