import { Icon } from '../components/ui'
import StepCard from './StepCard.jsx'
import Palette from './Palette.jsx'

// Vertical rail: the Lab, Power Automate, and Zapier layouts. Steps stack top
// to bottom; a Condition opens two lanes beneath it (yes / no) that rejoin.
// "+" insertion points sit between steps and at the end of every lane.

function InsertPoint({ open, onOpen, onPick, onCancel, skin, compact, kinds, allowTrigger }) {
  if (open) {
    return (
      <div className="py-1.5">
        <Palette skin={skin} onPick={onPick} onCancel={onCancel} kinds={kinds} allowTrigger={allowTrigger} />
      </div>
    )
  }
  return (
    <div className={`group/ins relative flex items-center justify-center ${compact ? 'h-5' : 'h-6'}`}>
      <span className="absolute inset-y-0 left-[22px] w-px bg-sf-border" aria-hidden="true" />
      <button
        type="button"
        onClick={onOpen}
        aria-label="Add a step here"
        title="Add a step here"
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-sf-border bg-sf-surface text-sf-muted opacity-60 transition-all hover:border-sf-accent-border hover:text-sf-accent hover:opacity-100 group-hover/ins:opacity-100"
      >
        <Icon name="plus" size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

const pathKey = (path) => path.join('/')

export default function FlowRail(props) {
  const { flow, skin, ctx, selectedStepId, onSelectStep, insertAt, onOpenInsert, onPick, onCancelInsert, onChangeStep, onRemoveStep, onMoveStep, stepStatus, hasRun, replayStepId, fieldsFor, lockedIds, paletteKinds, allowTrigger, readOnly = false } = props
  let counter = 0

  function renderList(list, path, depth) {
    const key = pathKey(path)
    const items = []
    list.forEach((step, index) => {
      const isTrigger = step.kind === 'trigger' && depth === 0 && index === 0
      const locked = isTrigger || (lockedIds && lockedIds.has(step.id))
      if (!isTrigger && !readOnly) {
        items.push(
          <InsertPoint
            key={`ins-${key}-${index}`}
            skin={skin}
            compact={depth > 0}
            open={!!insertAt && insertAt.key === key && insertAt.index === index}
            onOpen={() => onOpenInsert(path, index)}
            onPick={onPick}
            onCancel={onCancelInsert}
            kinds={paletteKinds}
            allowTrigger={allowTrigger && depth === 0 && index === 0}
          />
        )
      }
      counter += 1
      const status = stepStatus ? stepStatus[step.id] : null
      items.push(
        <StepCard
          key={step.id}
          step={step}
          skin={skin}
          ctx={ctx}
          number={skin.numbered ? counter : undefined}
          selected={selectedStepId === step.id}
          runStatus={status || null}
          visited={!!status}
          hasRun={hasRun}
          replaying={replayStepId === step.id}
          onSelect={() => onSelectStep(selectedStepId === step.id ? null : step.id)}
          onChange={(patch) => onChangeStep(step.id, patch)}
          onRemove={locked ? null : () => onRemoveStep(step.id)}
          onMove={locked ? null : (delta) => onMoveStep(step.id, delta)}
          canMoveUp={index > (depth === 0 ? 1 : 0)}
          canMoveDown={index < list.length - 1}
          fields={fieldsFor(step.id)}
        />
      )
      if (step.kind === 'condition') {
        const d = skin.describe(step, ctx)
        const labels = d.branchLabels || { yes: 'If yes', no: 'If no' }
        items.push(
          <div key={`lanes-${step.id}`} className="ml-4 flex flex-col gap-1 border-l-2 border-dashed border-sf-border pl-3 pt-1">
            {['yes', 'no'].map((b) => (
              <div key={b} className="rounded-lg border border-sf-border-subtle bg-sf-surface-subtle/60 px-2 pb-1 pt-1.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className={`inline-flex h-2 w-2 rounded-full ${b === 'yes' ? 'bg-sf-complete' : 'bg-sf-warning'}`} aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-sf-wide text-sf-muted">{labels[b]}</span>
                  {step.branches[b].length === 0 && <span className="text-[10px] text-sf-subtle">- empty, the record continues below</span>}
                </div>
                <div className="flex flex-col">{renderList(step.branches[b], [...path, step.id, b], depth + 1)}</div>
              </div>
            ))}
          </div>
        )
      }
    })
    if (!readOnly) items.push(
      <InsertPoint
        key={`ins-${key}-end`}
        skin={skin}
        compact={depth > 0}
        open={!!insertAt && insertAt.key === key && insertAt.index === list.length}
        onOpen={() => onOpenInsert(path, list.length)}
        onPick={onPick}
        onCancel={onCancelInsert}
        kinds={paletteKinds}
        allowTrigger={allowTrigger && depth === 0 && list.length === 0}
      />
    )
    return items
  }

  return <div className="flex flex-col">{renderList(flow.steps, [], 0)}</div>
}
