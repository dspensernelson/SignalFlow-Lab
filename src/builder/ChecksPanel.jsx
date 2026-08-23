import { useState } from 'react'
import { Button, Icon } from '../components/ui'

// The build: what you are making, why, and the desk's acceptance checks. A
// check is a business fact the run must make true, not an answer key.
export default function ChecksPanel({ build, index, total, results, stale, passed, onNext, hasNext, onLoadExample, allDone }) {
  const [hintsOpen, setHintsOpen] = useState(false)
  const passedCount = results ? results.filter((r) => r.passed).length : 0
  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Build {index + 1} of {total}
          </span>
          {passed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sf-complete-weak px-2 py-0.5 text-[10px] font-bold uppercase text-sf-complete-text">
              <Icon name="check" size={10} strokeWidth={3} /> passed
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-sf-text">{build.title}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-sf-body">{build.goal}</p>
      </div>

      <div className="rounded-lg border border-sf-border bg-sf-surface">
        <button type="button" onClick={() => setHintsOpen((o) => !o)} className="flex w-full items-center justify-between px-2.5 py-1.5 text-left">
          <span className="text-[11px] font-semibold text-sf-text">How to build it</span>
          <Icon name="chevron-down" size={12} className={`text-sf-muted transition-transform ${hintsOpen ? '' : '-rotate-90'}`} />
        </button>
        {hintsOpen && (
          <ol className="flex list-decimal flex-col gap-1 border-t border-sf-border-subtle py-2 pl-7 pr-3 text-[11px] leading-relaxed text-sf-body">
            {build.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Done when</span>
          {results && (
            <span className={`text-[10px] font-semibold ${passedCount === results.length ? 'text-sf-complete-text' : 'text-sf-muted'}`}>
              {passedCount} of {results.length}
              {stale ? ' (run again to refresh)' : ''}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-1">
          {build.checks.map((c) => {
            const r = results ? results.find((x) => x.id === c.id) : null
            const state = !r ? 'pending' : r.passed ? 'pass' : 'fail'
            return (
              <li key={c.id} className={`rounded-md border px-2 py-1.5 ${state === 'pass' ? 'border-sf-complete bg-sf-success-weak' : state === 'fail' ? 'border-sf-danger bg-sf-danger-weak' : 'border-sf-border bg-sf-surface'} ${stale ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${state === 'pass' ? 'bg-sf-complete text-white' : state === 'fail' ? 'bg-sf-danger text-white' : 'border border-sf-border-strong'}`}>
                    {state === 'pass' && <Icon name="check" size={10} strokeWidth={3} />}
                    {state === 'fail' && <Icon name="x" size={10} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-sf-text">{c.label}</div>
                    {r && state === 'fail' && <div className="mt-0.5 text-[11px] leading-snug text-sf-danger">{r.detail}</div>}
                    {r && state === 'pass' && r.detail && <div className="mt-0.5 text-[11px] leading-snug text-sf-complete-text">{r.detail}</div>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onLoadExample} className="text-[11px] text-sf-subtle hover:text-sf-accent hover:underline" title="Replace your flows with the example solution through this build">
          Stuck? Load the example for this build
        </button>
        {passed && hasNext && (
          <Button variant="success" size="sm" iconRight="arrow-right" onClick={onNext}>
            Next build
          </Button>
        )}
        {passed && !hasNext && allDone && <span className="text-xs font-semibold text-sf-complete-text">You built the Beacon desk.</span>}
      </div>
    </div>
  )
}
