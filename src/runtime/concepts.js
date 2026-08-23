// Concepts: rosettas (one step kind, seen in every tool) and waypoints
// (literacy: JSON, fields, types, lists). A concept is data
// (src/data/rosettas/*.json, src/data/waypoints/*.json) that the SAME engine
// runs as a synthetic one-build module.
//
//   conceptToModule(concept) -> moduleData
//   conceptFlow(concept, { added, settings, placement }) -> Flow
//   applySolution(concept) -> { flow, moduleData }      (for tests + "show me")
//   runConcept(concept, { flow, record }) -> { results, passed, dayResult }

import { createFlow, createStep, defaultSettings, insertStep } from './flowModel.js'
import { runModule } from './engine.js'
import { evaluateChecks, allPassed } from './checks.js'

export const CONCEPT_DAY = 'day-1'
export const CONCEPT_FLOW = 'concept'
export const CONCEPT_BUILD = 'concept'

const clone = (v) => JSON.parse(JSON.stringify(v))

// Assign stable ids to given steps (and their branch steps) so the UI can key them.
function withIds(steps, prefix) {
  return (steps || []).map((s, i) => {
    const id = `${prefix}-${i}`
    const step = createStep(s.kind, s.config || {}, id)
    if (s.kind === 'condition') {
      step.branches = {
        yes: withIds(s.branches ? s.branches.yes : [], `${id}-yes`),
        no: withIds(s.branches ? s.branches.no : [], `${id}-no`),
      }
    }
    return step
  })
}

export function conceptToModule(concept, record) {
  const sample = concept.sample || {}
  const day = clone(sample.day || {})
  // json-edit: the learner's edited record replaces the first source row.
  if (record && concept.exercise === 'json-edit') {
    const srcId = (sample.sources && sample.sources[0] && sample.sources[0].id) || Object.keys(day.sources || {})[0]
    if (srcId) {
      day.sources = day.sources || {}
      const rows = (day.sources[srcId] || []).slice()
      rows[0] = clone(record)
      day.sources[srcId] = rows
    }
  }
  return {
    moduleId: `concept-${concept.id}`,
    title: concept.label,
    owners: sample.owners || [],
    sources: clone(sample.sources || []),
    stores: clone(sample.stores || []),
    flows: [{ id: CONCEPT_FLOW, name: concept.label }],
    days: [{ id: CONCEPT_DAY, label: 'Sample', description: concept.task || '', sources: day.sources || {}, seeds: day.seeds || {}, approvals: day.approvals || {}, failures: day.failures || [] }],
    builds: [{ id: CONCEPT_BUILD, dayId: CONCEPT_DAY, flowId: CONCEPT_FLOW, title: concept.label, goal: concept.task || '', hints: { steps: [] }, checks: clone(concept.checks || []), mapNodes: [], requires: [] }],
  }
}

export function givenSteps(concept) {
  return withIds(concept.given, 'given')
}

// The flow the learner starts from: given steps, default settings.
export function conceptFlow(concept, settings) {
  return createFlow({ id: CONCEPT_FLOW, moduleId: `concept-${concept.id}`, name: concept.label, settings: settings || defaultSettings(), steps: givenSteps(concept) })
}

// Where an added step goes: by default the end of the root list; a
// `placement` on the solution (stop rosetta) names a lane of a given condition.
export function placeStep(flow, step, placement) {
  if (placement && placement.lane && typeof placement.conditionIndex === 'number') {
    const cond = flow.steps[placement.conditionIndex]
    if (cond && cond.branches) {
      const idx = typeof placement.index === 'number' ? placement.index : cond.branches[placement.lane].length
      return insertStep(flow, [cond.id, placement.lane], idx, step)
    }
  }
  return insertStep(flow, [], flow.steps.length, step)
}

// Build the solution flow + module for a concept (tests, and "show me").
export function applySolution(concept) {
  const sol = concept.solution || {}
  let flow = conceptFlow(concept)
  let record = null
  if (concept.exercise === 'settings') {
    flow = { ...flow, settings: { ...flow.settings, ...(sol.settings || {}) } }
  } else if (concept.exercise === 'json-edit') {
    record = sol.record || null
  } else if (sol.kind) {
    const step = createStep(sol.kind, sol.config || {}, 'solution')
    if (sol.kind === 'condition' && sol.branches) {
      step.branches = { yes: withIds(sol.branches.yes, 'solution-yes'), no: withIds(sol.branches.no, 'solution-no') }
    }
    flow = placeStep(flow, step, sol.placement)
  }
  return { flow, record, moduleData: conceptToModule(concept, record) }
}

export function runConcept(concept, { flow, record } = {}) {
  const moduleData = conceptToModule(concept, record)
  const theFlow = flow || conceptFlow(concept)
  const all = runModule([theFlow], moduleData, CONCEPT_DAY)
  const dayResult = all.byDay[CONCEPT_DAY]
  const results = evaluateChecks(moduleData.builds[0].checks, dayResult, dayResult.dayState, [theFlow])
  return { results, passed: allPassed(results), dayResult, moduleData }
}

// Ids of concepts a build needs that are not yet passed.
export function missingConcepts(build, conceptProgress) {
  return (build.requires || []).filter((id) => !(conceptProgress && conceptProgress[id]))
}
