# Runnable Flows - design spec

Date: 2026-08-22. Status: PROPOSED, with a clickable slice built on the
`feat/runnable-flows` branch so the owner can react to the thing rather than
to this document. Answers REIMAGINE_BRIEF.md. ASCII only; " - " not em-dashes.

## 1. The problem in one sentence

The app has one verb, `validateAnswer(value) == author's value`, so every one
of 129 lessons is type-a-value or pick-a-value and nothing the learner makes
ever runs. The world around that verb (scenarios, messes, canon numbers, map
nodes, tool dialects) is good and stays.

## 2. The new verb

    run(flow, dayData) -> trace

A learner assembles a FLOW out of typed STEPS, runs it against the module's
scenario data for the current DAY, and watches every record walk the steps.
A build is passed when the desk's acceptance CHECKS hold on the resulting run
(the right invoices paid, the right ones held, the right people notified),
not when a value matches an answer key. The next day brings input that
defeats the flow; the learner sees where and fixes it. The same flow renders
in six real tools' idioms.

Everything is deterministic and runs in the browser. No backend, no AI, no
accounts. The owner decisions in brief section 5 therefore default to
"keep" and the design does not depend on changing them.

## 3. Capabilities mapped to mechanisms

| Brief capability | Mechanism |
|---|---|
| A. Assemble | Step palette + flow rail. Steps are the taxonomy's nine action kinds, configured with small forms (not raw JSON). The flow is a real object (`flow.json`) the learner can export. |
| B. Run | `engine.run(flow, day)` executes every record through every step, producing a per-record, per-step trace with status, before/after, and a note. The UI replays it step by step. |
| C. Break and fix | Modules are organized as DAYS. Day 1 is the clean pattern; Day 2 is the charter's messy batch; Day 3 injects an operations failure (auth-expired, schema change). Checks that passed yesterday fail today, and the trace shows exactly which record went where. |
| D. Flip the tool skin | A skin switch renders the identical flow as Lab, Power Automate, Make, n8n, Zapier, or Python. Titles and config summaries come from `automationTaxonomy.json` dialects plus per-kind phrasing; the Python skin is generated code. |

## 4. Approaches considered

A. In-browser deterministic runtime with a step builder (RECOMMENDED).
   Pros: all four capabilities; honors local-first, offline, no-AI; the
   existing canon becomes runtime fixtures unchanged; low-code audience
   (Power Automate users) and pro-code audience both served via skins.
   Cons: the engine is a bespoke mini-tool; realism is "field-shaped", not
   the literal product UI.

B. Embed/link real tools (n8n, Make free tiers) with templates and import the
   learner's exports. Pros: maximal realism. Cons: needs accounts and
   network, cannot run inside the app, grading is not deterministic, breaks
   local-first. Rejected for the core; fine as a later "take it outside" step
   (the existing artifactImport idea).

C. Code-first sandbox (Pyodide in the browser). Pros: real execution. Cons:
   skews to pro-code and loses the Power Automate learner; skins are hard
   when code is primary. Rejected as the core; kept as the Python skin, and
   "run the generated Python for real" is a credible later stretch.

## 5. The model

### 5.1 Flow

    Flow { id, moduleId, name, settings: OperateSettings, steps: Step[] }
    Step { id, kind, config, branches? }      // branches only on condition
    OperateSettings { connection: {system, identity, secretRef},
                      trigger: {mode, intervalMinutes},
                      retries: number, onFailure: 'dead-letter'|'skip'|'retry-forever' }

Step kinds and config (forms edit these; the learner never types JSON):

| kind | config | runtime effect on a record |
|---|---|---|
| trigger | source, mode (event/schedule/poll) | emits the day's records from `source` (or one run record for schedule) |
| lookup | store, matchOn: [{recordField, storeField}], as, mode: one/all | attaches `record[as]` = matching store row(s) or null |
| transform | set: [{field, expr}] | evaluates expressions; supports dotted paths, numbers, strings, + - * /, max min abs round len sum num upper lower trim, comparisons |
| condition | rules: [{left, op, right}], combine: all/any, branches: {yes: Step[], no: Step[]} | routes the record down one branch; branches are terminal (no rejoin), as in Zapier Paths and Power Automate If yes / If no |
| approval | approver, about | reads the day's simulated reply for that approver and stores `record.approval = {by, outcome, at}` |
| send | to, channel, subject, body (template) | appends a rendered message to the run's outbox |
| compose | template, as | renders a template from the record into `record[as]` |
| store | store, from: record or an array field, mode: append/upsert, key | writes rows into a named store; stores persist across days (day 1's paid invoices are day 2's duplicate baseline) |

Operate is not a step; it is flow settings. The engine consults them when a
day's data injects a failure (e.g. `failures: [{step kind lookup, store
po-register, cause auth-expired, failsFirst: 1}]`): with retries >= 1 the
lookup recovers and the trace shows the retry; with 0 the record fails and
`onFailure` decides whether it is dead-lettered (visible) or dropped.

### 5.2 Day data

    Day { id, label, sources: {sourceId: rows[]}, stores: {storeId: rows[]} (seeds),
          approvals: {approver: {outcome, at}}, failures: [], builds: [BuildStage] }

Sources are what triggers emit; stores are what lookups read and stores
write. Store state carries forward from the previous day's run, then the
day's seeds are merged in.

### 5.3 Builds and checks

A module is a sequence of builds. Each build names an outcome and a list of
checks. Checks are the desk's acceptance tests, phrased as business facts:

    { id, label, kind: storeContains | storeMissing | storeCount | storeSum |
      recordField | outboxContains | runStatus, ...args }

A build passes when all its checks pass on the current run. Checks are data
in the module file, so authoring a module is authoring days + checks; there
is no validator per lesson.

When a check fails the panel shows why in the trace's terms: "INV-58962
landed in payment-batch. Its path: Trigger -> Lookup PO -> ... -> Store. It
was never compared to Payment History."

### 5.4 Skins

    skins/<tool>.js: describe(step, skin) -> { title, subtitle, badge }
    codegen/python.js: render(flow) -> string

The palette also speaks the active skin (in the Power Automate skin the
transform step is offered as "Compose", in Make as "Set variable"). The Lab
skin is the neutral vocabulary. Power Apps / Copilot Studio and LangGraph
are deferred until a module needs them.

### 5.5 Progression and the map

The canvas stays as the module's world view. Each build maps to map nodes;
passing a build completes those nodes. Node panels (what it is at work,
access, solo rebuild) are unchanged. The three-tier system collapses into
days: Day 1 operates the pattern, Day 2 handles the mess, Day 3 owns the
failure - the same flow, growing. Progress = the flow JSON plus per-build
status in localStorage.

The learner's finished work IS the flow: exportable as `flow.json`, as a
Python script, and as a per-tool build sheet.

## 6. What the slice builds (module 2, Beacon Invoice Desk)

Beacon is the slice because "you paid the same invoice twice" is legible to
anyone. Six builds across three days:

1. Day 1 - Capture and look up: trigger on Invoice Inbox, look up the PO and
   the receipt by PO number. Checks: INV-58831 carries po.poTotal 1200 and
   receipt.quantityReceived 500.
2. Day 1 - Compute the match: variance, variancePct, band = max(2% of PO,
   25), qtyMatch. Checks: 20 / 1.67 / 25 / true.
3. Day 1 - Decide and route: condition on tolerance and quantity; yes ->
   store payment-batch; no -> store exception-queue + send to owner. Checks:
   batch has INV-58831 only, exception queue empty.
4. Day 2 - The mess: five invoices. The Day 1 flow pays the duplicate and the
   unknown vendor. Learner adds lookups against payment-history and
   vendor-master and the conditions that hold them, tags reasons, routes
   each hold to its owner. Checks: batch = INV-59001 only, total 1200; four
   holds with the right reasons; four sends to the right owners.
5. Day 2 - The 2:30 run: second flow on a schedule; read the batch; approval
   by the AP Manager; compose the run; send to Payables DL; archive; append
   paid invoices to payment-history. Checks: run doc says 1 invoice / 1200;
   payment-history now contains INV-59001.
6. Day 3 - It breaks in production: the PO register rejects the first call
   (auth-expired). With zero retries the run fails. Learner sets retries and
   dead-letter-and-alert in flow settings; run recovers. Checks: run status
   succeeded, retry visible, alert sent on the injected hard failure.

Skins in the slice: Lab, Power Automate, Make, n8n, Zapier, Python.

## 7. Code shape

    src/runtime/expr.js        expression parser + evaluator (no eval)
    src/runtime/engine.js      run(flow, dayState) -> trace
    src/runtime/checks.js      evaluate(checks, trace) -> results
    src/runtime/flowModel.js   step factories, ids, config validation, helpers
    src/runtime/codegen/python.js
    src/runtime/skins/{lab,powerAutomate,make,n8n,zapier}.js + index.js
    src/builder/BuilderWorkspace.jsx   layout + state (flow, day, skin, run)
    src/builder/FlowRail.jsx           vertical rail (lab/PA/zapier skins)
    src/builder/FlowLine.jsx           horizontal line (make/n8n skins)
    src/builder/StepEditor.jsx         per-kind forms
    src/builder/Palette.jsx
    src/builder/RunPanel.jsx           replay, record trace, stores, outbox
    src/builder/ChecksPanel.jsx
    src/builder/CodeView.jsx
    src/data/flows/module-02.json      world data: days, stores, builds, checks
    src/lib/flowProgress.js            localStorage for flow + build status
    scripts/test-runtime.mjs           engine/expr/checks unit tests +
                                       golden: reference flow passes all builds,
                                       naive flow fails Day 2 (proves break-it)

Entry point: a "Build it" button on the canvas for modules that have a flow
file; the existing lesson path is untouched in the slice so nothing live
regresses. `npm run check` gains `test:runtime`.

## 8. Rules this design retires or changes (for the owner)

- "A lesson is complete when a validator matches the learner's value" ->
  a build is complete when the run satisfies the desk's checks.
- The no-scroll workbench rule does not apply to the builder; a flow rail
  and a run trace need to scroll. The rule can stay for any surviving
  worksheet screens.
- Tiers become days. Per-tier storage keys are not used by the builder.
- Lint gates that measure worksheet problems (giveaway, choiceCheck cap)
  are irrelevant to builds and can go when the worksheet lessons go.

## 9. Decisions surfaced to the owner (with defaults used in the slice)

- Local-first, no backend: KEPT. Nothing here needs a server.
- Deterministic, offline, no AI: KEPT. Checks are outcome assertions.
- Curriculum: the slice leads with Beacon because it is the most legible
  scenario; the ten-module plan and order are untouched. Recommend
  deciding module order after the owner reacts to the slice.
- What the finished work is: a runnable flow plus its exports. This is the
  change the brief asks for and the slice embodies it.
- Whether the 129 worksheet lessons survive: the slice does not delete
  anything. Recommend porting modules 1 and 3 to flows and retiring the
  worksheet path once the owner says the slice feels like building.

## 10. How we know it worked

The owner opens Beacon, clicks Build it, assembles Day 1, runs it, sees the
batch fill, flips to Power Automate and Make, then hits Day 2 and watches the
duplicate get paid. If he says some version of "that felt like building an
automation", this is the direction. If not, the branch is disposable.
