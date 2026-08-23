import { STEP_KINDS, KIND_GLOSS } from '../runtime/flowModel.js'
import { Icon } from '../components/ui'
import { kindStyle, tint } from './kindStyles.js'

// The step palette, shown inline at an insertion point. Labels follow the
// active skin, so in the Power Automate view a Transform is offered as
// "Compose" - the invariant wears the tool's costume even while you build.
export default function Palette({ skin, onPick, onCancel, allowTrigger = false, kinds: onlyKinds = null }) {
  const kinds = STEP_KINDS.filter((k) => (allowTrigger || k !== 'trigger') && (!onlyKinds || onlyKinds.includes(k)))
  return (
    <div className="rounded-xl border border-sf-accent-border bg-sf-surface p-2 shadow-sf-md">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Add a step</span>
        <button type="button" onClick={onCancel} className="rounded p-0.5 text-sf-muted hover:bg-sf-surface-subtle hover:text-sf-text" aria-label="Close palette">
          <Icon name="x" size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {kinds.map((kind) => {
          const st = kindStyle(kind)
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onPick(kind)}
              title={KIND_GLOSS[kind]}
              className="flex items-start gap-2 rounded-lg border border-sf-border bg-sf-surface px-2 py-1.5 text-left transition-colors hover:border-sf-accent-border hover:bg-sf-accent-weak"
            >
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md" style={{ background: tint(st.color, 18), color: st.color }}>
                <Icon name={st.icon} size={12} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-xs font-semibold text-sf-text">{skin.paletteLabel(kind)}</span>
                {skin.id !== 'lab' && <span className="block text-[10px] text-sf-subtle">{kind}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
