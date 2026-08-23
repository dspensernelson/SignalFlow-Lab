import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Icon, Logo, ThemeToggle } from '../components/ui'
import { createStep, insertStep, updateStep, removeStep, moveStep, updateSettings } from '../runtime/flowModel.js'
import { runModule } from '../runtime/engine.js'
import { evaluateChecks, allPassed } from '../runtime/checks.js'
import { getSkin } from '../runtime/skins/index.js'
import { loadFlowState, saveFlowState, clearFlowState, initialFlowState } from '../lib/flowProgress.js'
import { availableFields } from './fieldHints.js'
import SkinSwitch from './SkinSwitch.jsx'
import FlowRail from './FlowRail.jsx'
import FlowLine from './FlowLine.jsx'
import CodeView from './CodeView.jsx'
import RunPanel from './RunPanel.jsx'
import ChecksPanel from './ChecksPanel.jsx'
import DataPanel from './DataPanel.jsx'
import SettingsPanel from './SettingsPanel.jsx'

// The runnable-flow builder. One module, several builds across several days.
// Left: the flow (in the chosen tool's skin). Right: the build's goal and
// checks, and the run / data / settings panels.

// Replay pacing: slow enough to watch, fast enough that a 5-invoice day
// finishes in about three seconds.
const REPLAY_TOTAL_MS = 3000
const REPLAY_MIN_MS = 45
const REPLAY_MAX_MS = 160

export default function BuilderWorkspace({ moduleData, loadReference, theme, onToggleTheme, onBack }) {
  const [state, setState] = useState(() => loadFlowState(moduleData))
  const builds = moduleData.builds
  const buildIndex = Math.max(
    0,
    builds.findIndex((b) => b.id === state.activeBuildId)
  )
  const build = builds[buildIndex]
  const [activeFlowId, setActiveFlowId] = useState(build.flowId)
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [insertAt, setInsertAt] = useState(null)
  const [run, setRun] = useState(null)
  const [replay, setReplay] = useState(null)
  const [replayClock, setReplayClock] = useState(0)
  const [tab, setTab] = useState('run')
  const [buildMenu, setBuildMenu] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const replayTimer = useRef(null)

  const flowOrder = moduleData.flows.map((f) => f.id)
  const flows = flowOrder.map((id) => state.flows[id]).filter(Boolean)
  const flow = state.flows[activeFlowId] || flows[0]
  const skin = getSkin(state.skin)
  const ctx = { moduleData, flow }

  useEffect(() => {
    saveFlowState(moduleData.moduleId, state)
  }, [state, moduleData.moduleId])

  // Today's pre-run world for the Data panel (carrying stores from earlier days).
  const dayState = useMemo(() => {
    const all = runModule(flows, moduleData, build.dayId)
    return all.byDay[build.dayId].dayState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.flows, moduleData, build.dayId])

  const updateFlow = useCallback(
    (fn) => {
      setState((s) => ({ ...s, flows: { ...s.flows, [flow.id]: fn(s.flows[flow.id]) } }))
      setRun((r) => (r ? { ...r, stale: true } : r))
    },
    [flow.id]
  )

  function stopReplay() {
    if (replayTimer.current) {
      clearInterval(replayTimer.current)
      replayTimer.current = null
    }
    setReplay(null)
  }

  useEffect(() => () => stopReplay(), [])

  function handleRun() {
    stopReplay()
    const all = runModule(flows, moduleData, build.dayId)
    const dayRes = all.byDay[build.dayId]
    const checks = evaluateChecks(build.checks, dayRes, dayRes.dayState, flows)
    const passed = allPassed(checks)
    const trace = dayRes.traces[flow.id]
    setRun({ buildId: build.id, result: dayRes, checks, passed, stale: false })
    setSelectedRecordId(trace && trace.records[0] ? trace.records[0].id : null)
    setSelectedStepId(null)
    setInsertAt(null)
    setTab('run')
    if (passed) setState((s) => ({ ...s, passed: { ...s.passed, [build.id]: true } }))
    // Replay: walk every record through its steps, one step per tick. The
    // position is derived from elapsed time (not a counter), so a lost timer
    // can never leave the UI stuck in "Running...".
    const lens = trace ? trace.records.map((r) => r.steps.length) : []
    const total = lens.reduce((a, b) => a + b, 0)
    if (total > 0) {
      const tick = Math.max(REPLAY_MIN_MS, Math.min(REPLAY_MAX_MS, Math.round(REPLAY_TOTAL_MS / total)))
      const startedAt = Date.now()
      setReplay({ startedAt, total, tick, lens })
      setReplayClock(startedAt)
      replayTimer.current = setInterval(() => {
        setReplayClock(Date.now())
      }, tick)
    }
  }

  // Stop ticking once the replay has run its course.
  const replayElapsedSteps = replay ? Math.floor((replayClock - replay.startedAt) / replay.tick) : 0
  useEffect(() => {
    if (replay && replayElapsedSteps >= replay.total && replayTimer.current) {
      clearInterval(replayTimer.current)
      replayTimer.current = null
    }
  }, [replay, replayElapsedSteps])

  function goToBuild(idx) {
    const b = builds[idx]
    if (!b) return
    setState((s) => ({ ...s, activeBuildId: b.id }))
    setActiveFlowId(b.flowId)
    setRun(null)
    stopReplay()
    setSelectedStepId(null)
    setInsertAt(null)
    setBuildMenu(false)
  }

  function isUnlocked(idx) {
    return idx === 0 || !!state.passed[builds[idx - 1].id]
  }

  function handleLoadExample() {
    if (!loadReference) return
    const ok = window.confirm(`Replace your flows with the example solution through "${build.title}"? Your current steps will be overwritten.`)
    if (!ok) return
    const ref = loadReference(build.id)
    setState((s) => ({ ...s, flows: { ...s.flows, ...ref } }))
    setRun(null)
    setSelectedStepId(null)
  }

  function handleResetModule() {
    const ok = window.confirm('Start this module over? This clears every flow you built here.')
    if (!ok) return
    clearFlowState(moduleData.moduleId)
    const fresh = initialFlowState(moduleData)
    setState(fresh)
    setActiveFlowId(builds[0].flowId)
    setRun(null)
    stopReplay()
    setSelectedStepId(null)
  }

  // ---- flow edits
  const pathKey = (p) => p.join('/')
  function openInsert(path, index) {
    setInsertAt({ path, index, key: pathKey(path) })
    setSelectedStepId(null)
  }
  function pick(kind) {
    if (!insertAt) return
    const step = createStep(kind)
    updateFlow((f) => insertStep(f, insertAt.path, insertAt.index, step))
    setInsertAt(null)
    setSelectedStepId(step.id)
  }
  const changeStep = (stepId, patch) => updateFlow((f) => updateStep(f, stepId, patch))
  const remove = (stepId) => {
    updateFlow((f) => removeStep(f, stepId))
    if (selectedStepId === stepId) setSelectedStepId(null)
  }
  const move = (stepId, delta) => updateFlow((f) => moveStep(f, stepId, delta))
  const fieldsFor = (stepId) => availableFields(flow, moduleData, stepId)

  // ---- run-derived view state for the active flow
  const trace = run && !run.stale ? run.result.traces[flow.id] : run ? run.result.traces[flow.id] : null
  const records = trace ? trace.records : []
  // Where the replay cursor is right now, or null once it has finished.
  let replayPos = null
  if (replay && replayElapsedSteps < replay.total) {
    let acc = 0
    for (let r = 0; r < replay.lens.length; r += 1) {
      if (replayElapsedSteps < acc + replay.lens[r]) {
        replayPos = { recordIdx: r, stepIdx: replayElapsedSteps - acc }
        break
      }
      acc += replay.lens[r]
    }
  }
  const replayView = replayPos ? { active: true, ...replayPos, total: replay.total } : null
  // While replaying, follow the record being replayed.
  const followRecord = replayPos && records[replayPos.recordIdx] ? records[replayPos.recordIdx] : null
  const selectedRecord = followRecord || records.find((r) => r.id === selectedRecordId) || records[0] || null
  let stepStatus = null
  if (selectedRecord) {
    stepStatus = {}
    const selIdx = records.indexOf(selectedRecord)
    const upto = replayPos ? (replayPos.recordIdx === selIdx ? replayPos.stepIdx : replayPos.recordIdx > selIdx ? Infinity : -1) : Infinity
    selectedRecord.steps.forEach((s, i) => {
      if (i <= upto) stepStatus[s.stepId] = { status: s.status, note: s.note, attempt: s.attempt }
    })
  }
  const replayStepId = replayPos && records[replayPos.recordIdx] && records[replayPos.recordIdx].steps[replayPos.stepIdx] ? records[replayPos.recordIdx].steps[replayPos.stepIdx].stepId : null

  const day = moduleData.days.find((d) => d.id === build.dayId)
  const passedNow = !!state.passed[build.id]
  const allDone = builds.every((b) => state.passed[b.id])
  const viewProps = { flow, skin, ctx, selectedStepId, onSelectStep: setSelectedStepId, insertAt, onOpenInsert: openInsert, onPick: pick, onCancelInsert: () => setInsertAt(null), onChangeStep: changeStep, onRemoveStep: remove, onMoveStep: move, stepStatus, hasRun: !!trace, replayStepId, fieldsFor }

  return (
    <div className="flex h-screen flex-col bg-sf-bg text-left text-sf-text">
      <header className="flex-none border-b border-sf-border bg-sf-surface">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden whitespace-nowrap xl:inline-flex">
              <Logo size={20} uppercase wordmark="SignalFlow Lab" />
            </span>
            <span className="hidden h-6 w-px bg-sf-border xl:inline-block" />
            <Button variant="link" size="sm" icon="arrow-left" onClick={onBack} className="whitespace-nowrap">
              Canvas
            </Button>
            <div className="relative">
              <button type="button" onClick={() => setBuildMenu((o) => !o)} className="flex min-w-[260px] items-center gap-2 rounded-lg border border-sf-border bg-sf-surface-subtle px-2.5 py-1 text-left hover:border-sf-border-strong">
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
                    {moduleData.title} - build {buildIndex + 1} of {builds.length}
                  </div>
                  <div className="truncate text-sm font-semibold text-sf-text">{build.title}</div>
                </div>
                <Icon name="chevron-down" size={14} className="text-sf-muted" />
              </button>
              {buildMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setBuildMenu(false)} aria-hidden="true" />
                  <div className="absolute left-0 top-full z-40 mt-1 w-80 rounded-xl border border-sf-border bg-sf-surface p-1.5 shadow-sf-lg">
                    {builds.map((b, i) => {
                      const unlocked = isUnlocked(i)
                      const d = moduleData.days.find((x) => x.id === b.dayId)
                      return (
                        <button key={b.id} type="button" disabled={!unlocked} onClick={() => goToBuild(i)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${b.id === build.id ? 'bg-sf-accent-weak' : 'hover:bg-sf-surface-subtle'} disabled:cursor-not-allowed disabled:opacity-50`}>
                          <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${state.passed[b.id] ? 'bg-sf-complete text-white' : unlocked ? 'border border-sf-accent-border text-sf-accent' : 'border border-sf-border text-sf-subtle'}`}>{state.passed[b.id] ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}</span>
                          <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-xs font-semibold text-sf-text">{b.title}</span>
                            <span className="block truncate text-[10px] text-sf-subtle">{d ? d.label : b.dayId}</span>
                          </span>
                          {!unlocked && <Icon name="lock" size={12} className="text-sf-subtle" />}
                        </button>
                      )
                    })}
                    <div className="mt-1 border-t border-sf-border-subtle pt-1">
                      <button type="button" onClick={handleResetModule} className="w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-sf-muted hover:bg-sf-surface-subtle">
                        Start this module over
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-sf-border bg-sf-surface-subtle px-2.5 py-1 text-xs font-medium text-sf-muted xl:inline-flex">
              <Icon name="clock" size={13} />
              {day ? day.label : build.dayId}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <SkinSwitch value={state.skin} onChange={(id) => setState((s) => ({ ...s, skin: id }))} />
            {onToggleTheme && <ThemeToggle value={theme} onChange={onToggleTheme} />}
            <Button variant="primary" size="md" icon="circle-play" onClick={handleRun} disabled={!!replayView} title={`Run every flow for ${day ? day.label : 'today'}`}>
              {replayView ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-0 w-full max-w-[1680px] flex-1 grid-cols-12 gap-4 px-4 py-3">
        {/* Left: the flow */}
        <section className="col-span-12 flex min-h-0 flex-col lg:col-span-6 xl:col-span-5">
          <div className="mb-2 flex flex-none items-center gap-1">
            {moduleData.flows.map((f) => (
              <button key={f.id} type="button" onClick={() => { setActiveFlowId(f.id); setSelectedStepId(null); setInsertAt(null) }} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${activeFlowId === f.id ? 'bg-sf-surface text-sf-text shadow-sf-sm' : 'text-sf-muted hover:text-sf-text'}`} title={f.description}>
                <Icon name="workflow" size={13} />
                {f.name}
                {f.id === build.flowId && <span className="h-1.5 w-1.5 rounded-full bg-sf-accent" title="This build works on this flow" />}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-sf-border bg-sf-surface-subtle p-3">
            {skin.layout === 'code' ? <CodeView flow={flow} moduleData={moduleData} /> : skin.layout === 'line' ? <FlowLine {...viewProps} /> : <FlowRail {...viewProps} />}
          </div>
        </section>

        {/* Right: build + run */}
        <section className="col-span-12 flex min-h-0 flex-col gap-3 lg:col-span-6 xl:col-span-7">
          <div className="max-h-[55%] flex-none overflow-y-auto rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
            <ChecksPanel build={build} index={buildIndex} total={builds.length} results={run && run.buildId === build.id ? run.checks : null} stale={!!(run && run.stale)} passed={passedNow} hasNext={buildIndex < builds.length - 1} onNext={() => goToBuild(buildIndex + 1)} onLoadExample={loadReference ? handleLoadExample : null} allDone={allDone} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-sf-border bg-sf-surface shadow-sf-sm">
            <div className="flex flex-none items-center gap-1 border-b border-sf-border px-2 pt-1.5">
              {[
                ['run', 'Run', 'circle-play'],
                ['data', 'Data', 'database'],
                ['settings', 'Settings', 'shield'],
              ].map(([id, label, icon]) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-semibold ${tab === id ? 'border-sf-accent text-sf-text' : 'border-transparent text-sf-muted hover:text-sf-text'}`}>
                  <Icon name={icon} size={13} />
                  {label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {tab === 'run' && <RunPanel run={run} flow={flow} moduleData={moduleData} skin={skin} selectedRecordId={selectedRecord ? selectedRecord.id : null} onSelectRecord={setSelectedRecordId} replay={replayView} />}
              {tab === 'data' && <DataPanel dayState={dayState} moduleData={moduleData} />}
              {tab === 'settings' && <SettingsPanel flow={flow} onChange={(patch) => updateFlow((f) => updateSettings(f, patch))} />}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
