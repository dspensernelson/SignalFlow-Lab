import { SectionLabel } from '../ui'
import BuildPanel from './BuildPanel'
import CheckStatusPanel from './CheckStatusPanel'
import SimulatePanel from './SimulatePanel'
import { MAP, SCENARIOS } from '../../data/middleware/index.js'

// The Exercise-equivalent for this track, and the screen the no-scroll rule
// applies to: Simulate (map + inspector) on top, Build and Check below, every
// region bounded and scrolling internally. Lessons without a scenario get a
// short explanation in the Simulate slot instead.
export default function Workbench({ lesson, status, result, checks, onRefresh, onSkip, onMarkDone }) {
  const scenario = lesson.simulate ? SCENARIOS[lesson.simulate.scenarioId] : null
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,5fr)_minmax(0,4fr)] gap-3 short:gap-2">
      <div className="min-h-0">
        {scenario ? (
          <SimulatePanel map={MAP} scenario={scenario} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-sf-border bg-sf-surface-subtle p-4 text-center">
            <div className="max-w-md">
              <SectionLabel className="mb-1">Simulate</SectionLabel>
              <p className="text-sm text-sf-muted">
                No simulation for this lesson: it is a setup or build-only step. Go straight to Build.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] short:gap-2">
        <BuildPanel build={lesson.build} />
        <CheckStatusPanel
          lesson={lesson}
          status={status}
          result={result}
          checks={checks}
          onRefresh={onRefresh}
          onSkip={onSkip}
          onMarkDone={onMarkDone}
        />
      </div>
    </div>
  )
}
