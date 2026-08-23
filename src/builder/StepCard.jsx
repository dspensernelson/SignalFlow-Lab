import { Icon } from '../components/ui'
import { kindStyle, tint, STATUS_STYLE } from './kindStyles.js'
import StepEditor from './StepEditor.jsx'

// One step in the rail. Shows the skin's title/subtitle, the run status for
// the selected record (after a run), and - when selected - its editor inline.
export default function StepCard({
  step,
  skin,
  ctx,
  number,
  selected,
  runStatus, // { status, note, attempt } | null
  visited, // whether the selected record touched this step
  hasRun,
  replaying,
  onSelect,
  onChange,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  fields,
}) {
  const st = kindStyle(step.kind)
  const d = skin.describe(step, ctx)
  const dimmed = hasRun && !visited && !replaying
  const statusStyle = runStatus ? STATUS_STYLE[runStatus.status] : null
  return (
    <div
      className={`group rounded-xl border bg-sf-surface transition-all ${selected ? 'border-sf-accent-border shadow-sf-md' : 'border-sf-border shadow-sf-sm hover:border-sf-border-strong'} ${dimmed ? 'opacity-45' : ''} ${replaying ? 'ring-2 ring-sf-accent' : ''}`}
      style={{ borderLeftWidth: 4, borderLeftColor: st.color }}
    >
      <div className="flex cursor-pointer items-start gap-2.5 px-3 py-2" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}>
        <span className="relative mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg" style={{ background: tint(st.color, 18), color: st.color }}>
          <Icon name={st.icon} size={14} />
          {statusStyle && (
            <span className={`absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ${statusStyle.className}`} title={runStatus.note}>
              <Icon name={statusStyle.icon} size={9} strokeWidth={3} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {number !== undefined && <span className="text-[10px] font-bold text-sf-subtle">{number}.</span>}
            <span className="truncate text-sm font-semibold text-sf-text">{d.title}</span>
            {runStatus && runStatus.attempt > 1 && (
              <span className="rounded-full bg-sf-progress-weak px-1.5 py-0.5 text-[9px] font-bold uppercase text-sf-progress-text">retried</span>
            )}
          </div>
          <div className="truncate text-[11px] text-sf-muted" title={d.subtitle}>
            {d.subtitle}
          </div>
          {runStatus && runStatus.note && (
            <div className={`mt-1 line-clamp-2 text-[11px] ${runStatus.status === 'failed' ? 'text-sf-danger' : 'text-sf-body'}`} title={runStatus.note}>
              {runStatus.note}
            </div>
          )}
        </div>
        <div className={`flex flex-none items-center gap-0.5 ${selected ? '' : 'opacity-0 group-hover:opacity-100'}`} onClick={(e) => e.stopPropagation()}>
          {onMove && (
            <>
              <button type="button" disabled={!canMoveUp} onClick={() => onMove(-1)} className="rounded p-1 text-sf-muted hover:bg-sf-surface-subtle disabled:opacity-30" aria-label="Move up" title="Move up">
                <Icon name="chevron-down" size={12} className="rotate-180" />
              </button>
              <button type="button" disabled={!canMoveDown} onClick={() => onMove(1)} className="rounded p-1 text-sf-muted hover:bg-sf-surface-subtle disabled:opacity-30" aria-label="Move down" title="Move down">
                <Icon name="chevron-down" size={12} />
              </button>
            </>
          )}
          {onRemove && (
            <button type="button" onClick={onRemove} className="rounded p-1 text-sf-muted hover:bg-sf-danger-weak hover:text-sf-danger" aria-label="Remove step" title="Remove step">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>
      {selected && (
        <div className="border-t border-sf-border-subtle bg-sf-surface-subtle px-3 py-2.5">
          <StepEditor step={step} moduleData={ctx.moduleData} fields={fields} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
