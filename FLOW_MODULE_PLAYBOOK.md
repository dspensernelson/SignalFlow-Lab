# Flow Module Playbook

How to build (or port) a module as runnable flows. This replaces
MODULE_AUTHORING_PLAYBOOK.md for everything a learner does; that document and
the worksheet lint gates still govern module-01 until it is ported.

Worked examples: Beacon (`src/data/flows/module-02.json`) and Harbor
(`src/data/flows/module-03.json`). Read one end to end before starting.

## The shape of a module

- A WORLD: one org, a job with a deadline, 5-7 named roles, the tables
  (stores) the work reads and writes, and what arrives (sources).
- 2-3 FLOWS the learner builds (event-triggered and scheduled).
- 3 DAYS: Day 1 clean (the pattern is visible), Day 2 the mess (the Day 1
  flow visibly does the wrong thing), Day 3 it breaks or goes quiet (an
  operations failure, or silence that no event will ever catch).
- 6-8 BUILDS, each on one day and one flow, each with 3-5 CHECKS phrased as
  business facts ("Sam has exactly 4 tasks, not 8"), never as answer keys.

## Design rules (owner direction, 2026-09-29)

- Simple and polished. Minimal text on screen. If a sentence is not needed
  to act, it goes behind a disclosure or it goes.
- Every build has a `brief`: one short line, shown first. `goal`,
  `constraints` and the hints sit behind "More" and "Hint".
- One prioritized "Fix this next" line, never a stack of red explanations.
  The builder picks it (the step that broke, else the first missed check);
  authors keep check `detail`-producing data legible (table labels, record
  labels people can read).
- A day must break the previous day's flow. If the Day 1 flow passes Day 2,
  Day 2 is not teaching anything. The golden test proves it.
- Revisiting never turns a build red: the finished reference must pass
  every earlier build's checks (golden test). Avoid exact counts that a
  later build legitimately changes.
- New step kinds or engine features only when the module cannot be built
  without them; each one gets a rosetta (the same step in every tool).

## Steps

1. World + days + builds: `src/data/flows/module-XX.json`. Copy the shape of
   module-03. ASCII only, " - " not em-dashes.
2. Reference: `src/data/flows/module-XX.reference.js` exporting
   `referenceFlowsFor(buildId)` (cumulative levels) and
   `REFERENCE_BUILD_IDS`. This powers "Show the answer" and the tests.
3. Concepts: every `requires` id needs `src/data/rosettas/<id>.json` or
   `src/data/waypoints/<id>.json`. New ones: `add.kind` is the step taught,
   `add.also` lists any steps it needs inside it (a Condition's lanes, a
   For each's body). The concept test proves the solution passes and the
   empty start does not.
4. Map: every task node in `src/data/projects/<id>/workflowNodes.json` is
   named by some build's `mapNodes` (lint-map). A node no build makes is
   removed from the map, not faked.
5. Wire it: add the module to `FLOW_MODULE_LOADERS` in `src/App.jsx`.
6. Retire the worksheets: delete the module's lessons, lesson registry,
   `lessonMeta.json`, fixtures in `scripts/lesson-fixtures.json`, and its
   `BUILT_LESSONS` block in `src/lib/projects.js`.
7. Glossary: `curriculum/<id>/glossary.json` `teachesIn` names build ids.
8. Canon: `curriculum/<id>/canon.json` with `"format": "flows"` - facts
   about the raw data (`kind: data`) and the finished reference run
   (`kind: record`, `kind: store`). lint-flows enforces it.
9. Golden tests in `scripts/test-runtime.mjs`: reference passes each build;
   day N-1 flows fail day N (assert the specific checks); finished desk
   passes every build; Python codegen parses.
10. Walk it in a browser as a learner (concept screens by hand, every build,
    two tool views, dark mode, 1280x720). Fix what reads badly.
11. `npm run check` green. Log the decision in DECISION_LOG.md.

## Engine reference (what a module can use today)

Steps: trigger (event / schedule), lookup (one / all rows, multi-field
match), transform (expressions), condition (yes / no lanes that rejoin),
for each (body per item; outer record is `parent`; Stop ends one item),
approval, send, compose (`{{field}}`, `{{#each list}}`), store (add / add or
replace / update the existing row; keys may be `a, b`; `from` a list), stop.

Expressions: arithmetic, comparisons, and/or/not, dotted paths, and max min
abs round len count sum num upper lower trim concat exists coalesce if.

Flow settings: retries, on-failure (skip / dead-letter / retry-forever).
Day failures inject errors into a step kind + store.

Checks: storeContains, storeMissing, storeCount, storeSum, recordField,
outboxContains, runStatus, alertSent, stepRetried, settingInRange,
settingEquals.
