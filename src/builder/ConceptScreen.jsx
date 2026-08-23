import { useMemo, useState } from 'react'
import { Button, Icon } from '../components/ui'
import { SKINS, getSkin } from '../runtime/skins/index.js'
import { createDayState } from '../runtime/engine.js'
import { createStep, insertStep, updateStep, removeStep, moveStep, allSteps } from '../runtime/flowModel.js'
import { conceptFlow, conceptToModule, runConcept, applySolution, placeStep } from '../runtime/concepts.js'
import { availableFields } from './fieldHints.js'
import FlowRail from './FlowRail.jsx'
import DataPanel from './DataPanel.jsx'
import RunPanel from './RunPanel.jsx'
import SettingsPanel from './SettingsPanel.jsx'
import { updateSettings } from '../runtime/flowModel.js'

// One concept, one screen. A rosetta: add the one step, run it on a tiny
// sample, then see the same step in every tool. A waypoint: a literacy
// exercise (read and fix the JSON, name a path, fix a type) run by the same
// engine. Passing the checks unlocks the build that needed it.

const TOOL_ORDER = ['powerAutomate', 'make', 'n8n', 'zapier', 'python', 'powerAppsCopilot', 'langgraph']
const TOOL_LABEL = { powerAutomate: 'Power Automate', make: 'Make', n8n: 'n8n', zapier: 'Zapier', python: 'Python', powerAppsCopilot: 'Power Apps / Copilot Studio', langgraph: 'LangGraph' }

function JsonEditor({ value, onChange, error, onReset }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">The record, as JSON - edit it</span>
        <button type="button" onClick={onReset} className="text-[11px] text-sf-subtle hover:text-sf-accent hover:underline">
          reset
        </button>
      </div>
      <textarea
        className={`min-h-[220px] w-full rounded-lg border bg-sf-surface-inset p-3 font-mono text-xs leading-relaxed text-sf-text focus:outline-none ${error ? 'border-sf-danger' : 'border-sf-border focus:border-sf-accent-border'}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {error ? <span className="text-[11px] text-sf-danger">{error}</span> : <span className="text-[11px] text-sf-complete-text">valid JSON</span>}
    </div>
  )
}

export default function ConceptScreen({ concept, skinId, onDone, onClose }) {
  const exercise = concept.exercise || 'add-step'
  const [flow, setFlow] = useState(() => conceptFlow(concept))
  const [recordText, setRecordText] = useState(() => (concept.brokenRecord ? JSON.stringify(concept.brokenRecord, null, 2) : ''))
  const [run, setRun] = useState(null)
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [insertAt, setInsertAt] = useState(null)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [runs, setRuns] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const skin = getSkin(skinId)

  let record = null
  let jsonError = null
  if (exercise === 'json-edit') {
    try {
      record = recordText.trim() ? JSON.parse(recordText) : null
      if (record === null) jsonError = 'Empty'
    } catch (e) {
      jsonError = e.message.replace(/^JSON\.parse: /, '')
    }
  }

  const moduleData = useMemo(() => conceptToModule(concept, record), [concept, record])
  const dayState = useMemo(() => createDayState(moduleData, 'day-1', {}), [moduleData])
  const ctx = { moduleData, flow }
  const givenIds = useMemo(() => new Set(allSteps(conceptFlow(concept)).map((s) => s.step.id)), [concept])
  const addKind = concept.add ? concept.add.kind : null

  function handleRun() {
    if (exercise === 'json-edit' && jsonError) return
    const res = runConcept(concept, { flow, record })
    setRun(res)
    setRuns((n) => n + 1)
    const trace = res.dayResult.traces[flow.id]
    setSelectedRecordId(trace && trace.records[0] ? trace.records[0].id : null)
  }

  function showMe() {
    const sol = applySolution(concept)
    setFlow(sol.flow)
    if (exercise === 'json-edit' && sol.record) setRecordText(JSON.stringify(sol.record, null, 2))
    setRevealed(true)
    setRun(null)
  }

  // ---- edits (add-step only)
  const pathKey = (p) => p.join('/')
  function pick(kind) {
    if (!insertAt) return
    const step = createStep(kind)
    setFlow((f) => insertStep(f, insertAt.path, insertAt.index, step))
    setInsertAt(null)
    setSelectedStepId(step.id)
    setRun(null)
  }
  const viewProps = {
    flow,
    skin,
    ctx,
    selectedStepId,
    onSelectStep: setSelectedStepId,
    insertAt,
    onOpenInsert: (path, index) => {
      setInsertAt({ path, index, key: pathKey(path) })
      setSelectedStepId(null)
    },
    onPick: pick,
    onCancelInsert: () => setInsertAt(null),
    onChangeStep: (id, patch) => {
      setFlow((f) => updateStep(f, id, patch))
      setRun(null)
    },
    onRemoveStep: (id) => {
      setFlow((f) => removeStep(f, id))
      setRun(null)
    },
    onMoveStep: (id, d) => setFlow((f) => moveStep(f, id, d)),
    stepStatus: null,
    hasRun: false,
    replayStepId: null,
    fieldsFor: (id) => availableFields(flow, moduleData, id),
    lockedIds: givenIds,
    paletteKinds: addKind ? [addKind] : null,
    allowTrigger: flow.steps.length === 0 || addKind === 'trigger',
    readOnly: exercise === 'json-edit',
  }

  // The step to show across tools: the learner's added step, else the solution's.
  const addedStep = exercise === 'add-step' ? allSteps(flow).map((s) => s.step).find((s) => !givenIds.has(s.id)) : null
  const showcaseStep = addedStep || (concept.solution && concept.solution.kind ? placeStep(conceptFlow(concept), createStep(concept.solution.kind, concept.solution.config || {}, 'showcase'), concept.solution.placement).steps.find((s) => s.id === 'showcase') || createStep(concept.solution.kind, concept.solution.config || {}, 'showcase') : null)
  const dialect = concept.dialect || {}
  const passed = !!(run && run.passed)
  const isRosetta = concept.kind === 'rosetta'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sf-bg text-left text-sf-text">
      <header className="flex flex-none items-center justify-between gap-3 border-b border-sf-border bg-sf-surface px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-sf-wide ${isRosetta ? 'bg-sf-context-weak text-sf-context-text' : 'bg-sf-info-weak text-sf-info'}`}>{isRosetta ? 'Rosetta' : 'Waypoint'}</span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-sf-text">{concept.label}</div>
            <div className="truncate text-[11px] text-sf-muted">{concept.gloss}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {exercise !== 'json-edit' && <Button variant="primary" size="md" icon="circle-play" onClick={handleRun}>Run</Button>}
          {exercise === 'json-edit' && <Button variant="primary" size="md" icon="circle-play" onClick={handleRun} disabled={!!jsonError}>Run</Button>}
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-sf-muted hover:bg-sf-surface-subtle hover:text-sf-text">
            <Icon name="x" size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid min-h-0 w-full max-w-[1680px] flex-1 grid-cols-12 gap-4 overflow-y-auto px-4 py-3">
        <section className="col-span-12 flex flex-col gap-3 lg:col-span-4">
          <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
            <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Why this exists</div>
            <p className="mt-1 text-xs leading-relaxed text-sf-body">{concept.why}</p>
            {concept.cue && <p className="mt-2 border-l-2 border-sf-accent-border pl-2 text-[11px] italic text-sf-muted">{concept.cue}</p>}
          </div>
          <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">The sample</div>
            {exercise === 'json-edit' ? (
              <>
                <JsonEditor value={recordText} onChange={(v) => { setRecordText(v); setRun(null) }} error={jsonError} onReset={() => setRecordText(JSON.stringify(concept.brokenRecord, null, 2))} />
                {concept.notes && (
                  <ul className="mt-2 list-disc pl-4 text-[11px] leading-relaxed text-sf-muted">
                    {concept.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <DataPanel dayState={dayState} moduleData={moduleData} />
            )}
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-3 lg:col-span-8">
          <div className="rounded-xl border border-sf-accent-border bg-sf-accent-weak px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-accent-text">Your task</div>
            <p className="text-sm text-sf-text">{concept.task}</p>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 rounded-xl border border-sf-border bg-sf-surface-subtle p-3 xl:col-span-6">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{exercise === 'settings' ? 'Flow settings' : 'The flow'}</span>
                {concept.notes && exercise !== 'json-edit' && <span className="text-[10px] text-sf-subtle">{concept.notes[0]}</span>}
              </div>
              {exercise === 'settings' ? (
                <SettingsPanel flow={flow} onChange={(patch) => { setFlow((f) => updateSettings(f, patch)); setRun(null) }} />
              ) : (
                <FlowRail {...viewProps} />
              )}
            </div>
            <div className="col-span-12 flex flex-col gap-2 xl:col-span-6">
              <div className="rounded-xl border border-sf-border bg-sf-surface p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Done when</span>
                  {run && <span className={`text-[10px] font-semibold ${passed ? 'text-sf-complete-text' : 'text-sf-muted'}`}>{run.results.filter((r) => r.passed).length} of {run.results.length}</span>}
                </div>
                <ul className="flex flex-col gap-1">
                  {(concept.checks || []).map((c) => {
                    const r = run ? run.results.find((x) => x.id === c.id) : null
                    const state = !r ? 'pending' : r.passed ? 'pass' : 'fail'
                    return (
                      <li key={c.id} className={`rounded-md border px-2 py-1.5 ${state === 'pass' ? 'border-sf-complete bg-sf-success-weak' : state === 'fail' ? 'border-sf-danger bg-sf-danger-weak' : 'border-sf-border bg-sf-surface'}`}>
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${state === 'pass' ? 'bg-sf-complete text-white' : state === 'fail' ? 'bg-sf-danger text-white' : 'border border-sf-border-strong'}`}>
                            {state === 'pass' && <Icon name="check" size={10} strokeWidth={3} />}
                            {state === 'fail' && <Icon name="x" size={10} strokeWidth={3} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-sf-text">{c.label}</div>
                            {r && !r.passed && <div className="mt-0.5 text-[11px] text-sf-danger">{r.detail}</div>}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-2 flex items-center justify-between">
                  {runs >= 2 && !passed && !revealed ? (
                    <button type="button" onClick={showMe} className="text-[11px] text-sf-subtle hover:text-sf-accent hover:underline">
                      Show me
                    </button>
                  ) : (
                    <span />
                  )}
                  {passed && (
                    <Button variant="success" size="sm" iconRight="arrow-right" onClick={() => onDone(concept.id)}>
                      Back to the build
                    </Button>
                  )}
                </div>
              </div>
              <div className="min-h-[160px] rounded-xl border border-sf-border bg-sf-surface p-3">
                <RunPanel run={run ? { buildId: 'concept', result: run.dayResult, checks: run.results, passed: run.passed, stale: false } : null} flow={flow} moduleData={moduleData} skin={skin} selectedRecordId={selectedRecordId} onSelectRecord={setSelectedRecordId} replay={null} />
              </div>
            </div>
          </div>

          {(showcaseStep || Object.keys(dialect).length > 0) && (
            <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{isRosetta ? 'The same step in every tool' : 'How each tool shows this'}</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {TOOL_ORDER.filter((t) => dialect[t] || SKINS.some((s) => s.id === t)).map((toolId) => {
                  const sk = SKINS.find((s) => s.id === toolId)
                  const d = showcaseStep && sk && sk.layout !== 'code' ? sk.describe(showcaseStep, ctx) : null
                  return (
                    <div key={toolId} className="rounded-lg border border-sf-border bg-sf-surface-subtle px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-sf-wide text-sf-muted">{TOOL_LABEL[toolId] || toolId}</div>
                      {d && <div className="text-xs font-semibold text-sf-text">{d.title}</div>}
                      {d && d.subtitle && <div className="truncate text-[11px] text-sf-muted" title={d.subtitle}>{d.subtitle}</div>}
                      {dialect[toolId] && <div className={`text-[11px] leading-snug text-sf-body ${d ? 'mt-1 border-t border-sf-border-subtle pt-1' : ''}`}>{dialect[toolId]}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
