# Runnable Flows Slice - Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship a clickable vertical slice of the runnable-flow builder on Beacon (module 2): assemble, run, break/fix across three days, six tool skins, with a deterministic runtime proven by tests.

**Architecture:** A pure-JS runtime (`src/runtime/`) with no React dependency: an expression evaluator, a flow engine that walks records through steps and produces a trace, and a checks evaluator that turns a trace into pass/fail business facts. A React builder (`src/builder/`) renders the flow in skins, edits steps with forms, replays the trace, and shows checks. Module content is data (`src/data/flows/module-02.json`) plus a reference solution used by a golden test.

**Tech Stack:** React 19, Vite, Tailwind with the existing `sf-*` tokens, Node test scripts (`node scripts/test-runtime.mjs`) in the style of the repo's other gates. No new dependencies.

## Global Constraints

- ASCII-only docs and data; use " - " not em-dashes.
- No backend, no network, no AI; everything deterministic.
- `npm run check` must stay green; add `test:runtime` to it.
- Do not delete or alter the existing lesson path in the slice.
- Use existing UI primitives from `src/components/ui/` and `sf-*` classes.
- Runtime modules must be importable from Node (ESM, no DOM) so the test script can run them.

---

## Interfaces (pinned; every task uses these names)

```js
// src/runtime/expr.js
parseExpr(src) -> ast                       // throws ExprError(message)
evalExpr(srcOrAst, scope) -> value          // missing path -> undefined; arithmetic on null/undefined -> null
exprToPython(srcOrAst, recVar='rec') -> string

// src/runtime/flowModel.js
STEP_KINDS = ['trigger','lookup','transform','condition','approval','send','compose','store']
createStep(kind, configPatch={}) -> { id, kind, config, branches? }   // condition gets branches {yes:[], no:[]}
defaultConfig(kind) -> config
defaultSettings() -> { connection:{system:'',identity:'',secretRef:''}, trigger:{mode:'event',intervalMinutes:15}, retries:0, onFailure:'skip' }
createFlow({ id, moduleId, name, steps=[], settings }) -> Flow
getList(flow, path) -> Step[]               // path: [] root, or [stepId, 'yes'|'no']
findStep(flow, stepId) -> { step, path, index } | null
insertStep(flow, path, index, step) -> Flow
updateStep(flow, stepId, patch) -> Flow     // patch merges into config; patch.branches replaces
removeStep(flow, stepId) -> Flow
moveStep(flow, stepId, delta) -> Flow
walkSteps(steps, fn(step, path, index))
stepCount(flow) -> number

// src/runtime/engine.js
createDayState(day, carriedStores={}) -> { dayId, sources, stores, approvals, failures }
runFlow(flow, dayState) -> { trace, stores, outbox, alerts }     // pure; returns new stores
runDay(flows, dayState) -> { traces: {flowId: trace}, stores, outbox, alerts, status }
// trace = { flowId, status:'succeeded'|'failed'|'partial'|'empty', records:[RecordTrace], log:[string] }
// RecordTrace = { id, label, steps:[{ stepId, kind, status:'succeeded'|'failed'|'skipped', note, branch?, attempt? }],
//                 terminal:{ type:'store'|'send'|'end'|'failed'|'dropped', target? }, final: object }

// src/runtime/checks.js
evaluateChecks(checks, runResult, dayState) -> [{ id, label, passed, detail }]
// check kinds: storeContains, storeMissing, storeCount, storeSum, recordField, outboxContains, runStatus, alertSent

// src/runtime/skins/index.js
SKINS -> [{ id, label, layout:'rail'|'line'|'code', describe(step, ctx) -> { title, subtitle }, paletteLabel(kind) -> string }]
getSkin(id)
// src/runtime/codegen/python.js
renderPython(flow, moduleData) -> string

// src/lib/flowProgress.js
loadFlowState(moduleId) / saveFlowState(moduleId, state) / clearFlowState(moduleId)
// state = { flows:{flowId:Flow}, passed:{buildId:true}, activeBuildId }

// src/data/flows/module-02.json shape
{ moduleId, title, intro, sources:[{id,label,labelField,description}], stores:[{id,label,keyField,description}],
  flows:[{id,name,description}], days:[{id,label,description,sources:{srcId:rows},seeds:{storeId:rows},approvals:{},failures:[]}],
  builds:[{id,dayId,flowId,title,goal,hints:[],mapNodes:[],checks:[]}] }
```

---

### Task 1: Expression evaluator

**Files:** Create `src/runtime/expr.js`, `scripts/test-runtime.mjs` (shared by later tasks; tiny assert harness).

- [ ] Write failing tests: arithmetic precedence, dotted paths, missing path -> undefined, null arithmetic -> null, strings, comparisons, and/or/not, functions (max min abs round len sum num upper lower trim concat exists coalesce), parse error surfaces as ExprError, exprToPython for a few cases.
- [ ] Run `node scripts/test-runtime.mjs` - fails (module missing).
- [ ] Implement tokenizer + Pratt parser + evaluator + Python printer.
- [ ] Tests pass. Commit `feat(runtime): expression evaluator`.

### Task 2: Flow model + engine

**Files:** Create `src/runtime/flowModel.js`, `src/runtime/engine.js`. Extend test script.

- [ ] Failing tests: createStep/insert/update/remove/move immutability; engine: trigger emits rows; lookup one/all/null; transform sets fields and notes null; condition routes yes/no and terminal; approval reads day reply; send renders to outbox; compose; store append/upsert/from-array; failure injection with retries 0 vs 2; onFailure dead-letter vs skip; runDay chains stores across flows.
- [ ] Implement. Tests pass. Commit `feat(runtime): flow model and engine`.

### Task 3: Checks

**Files:** Create `src/runtime/checks.js`. Extend tests.

- [ ] Failing tests for each check kind, including `detail` explanations that cite the record's terminal and path for storeContains/storeMissing failures.
- [ ] Implement. Tests pass. Commit `feat(runtime): acceptance checks`.

### Task 4: Beacon module data + reference solution + golden test

**Files:** Create `src/data/flows/module-02.json`, `src/data/flows/module-02.reference.json`. Extend tests.

- [ ] Author days 1-3 (sources, seeds, approvals, failures) and builds 1-6 with checks from the spec section 6, using the Medium canon values.
- [ ] Author reference flows per build (cumulative), as `{ buildId: { flows } }`.
- [ ] Golden tests: for each build, the reference flows for that build pass all its checks on its day (carrying stores from earlier days via the reference flows); the build-3 reference run on Day 2 FAILS build-4 checks (pays INV-58962 and INV-59004); build-5 reference with retries 0 FAILS build-6 checks, with retries 3 passes.
- [ ] Tests pass. Commit `feat(flows): Beacon module days, builds, checks, reference solution`.

### Task 5: Skins + Python codegen

**Files:** Create `src/runtime/skins/{lab,powerAutomate,make,n8n,zapier,index}.js`, `src/runtime/codegen/python.js`. Extend tests.

- [ ] Failing tests: each skin describes every kind with non-empty title; palette labels differ across skins for transform; renderPython(reference build-4 flow) contains `def run(` and the variance expression.
- [ ] Implement. Tests pass. Commit `feat(runtime): tool skins and python codegen`.

### Task 6: Flow progress storage

**Files:** Create `src/lib/flowProgress.js`.

- [ ] Implement load/save/clear under key `signalflow_flows__<moduleId>` with a version field; defaults seed an empty flow per module flow id with one trigger step. Commit.

### Task 7: Builder UI

**Files:** Create `src/builder/BuilderWorkspace.jsx`, `FlowRail.jsx`, `FlowLine.jsx`, `StepCard.jsx`, `StepEditor.jsx`, `Palette.jsx`, `RunPanel.jsx`, `ChecksPanel.jsx`, `CodeView.jsx`, `SkinSwitch.jsx`, `DataPanel.jsx`, `SettingsPanel.jsx`.

- [ ] BuilderWorkspace: state = flow state (from storage), active build, skin, last run, replay cursor. Runs `runDay` with stores carried from re-running earlier days' flows (deterministic: rerun days 1..N-1 with the current flows to carry state), evaluates active build checks, marks passed, unlocks next build.
- [ ] FlowRail (vertical, for rail skins) and FlowLine (horizontal, for line skins) render steps via skin.describe with "+" insert points opening the Palette; condition shows yes/no lanes.
- [ ] StepEditor forms per kind using selects populated from module data (sources, stores, approvers, owners, store fields) and text inputs for expressions/templates with inline parse errors.
- [ ] RunPanel: record chips with terminal badges, selected record path with per-step status and notes, stores tables, outbox, alerts; replay highlight in the flow view.
- [ ] ChecksPanel: goal, checks with pass/fail and detail, "Next build" button when passed, "Load example solution" link.
- [ ] CodeView for the python skin. SkinSwitch segmented control.
- [ ] Verify in the browser: build Day 1 by hand, run, flip skins, Day 2 breaks, fix, Day 3 settings. Commit `feat(builder): runnable flow builder UI`.

### Task 8: Wire into the app

**Files:** Modify `src/App.jsx`, `src/components/ProjectCanvas.jsx`; `package.json` (add `test:runtime` to `check`).

- [ ] App view `'builder'`; canvas app bar gets a "Build it" button when `hasFlowModule(project)`; back returns to canvas. `npm run check` green. Commit `feat(app): Build it entry point`.

### Task 9: Docs and PR

- [ ] README "Runnable flows (slice)" section; DECISION_LOG entry; push branch; open PR as the owner review artifact (do not self-merge).
