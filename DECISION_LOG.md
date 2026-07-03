# Decision Log

Short record of product and implementation decisions. Keep entries factual and brief.

## 2026-07-03 (module-02 Beacon - Step 7 Hard tier built)

- Built the Module 2 (Beacon Invoice Desk) HARD tier: 5 design drills that move
  the learner from applying rules to authoring them.
  - tolerance-policy-hard (jsonPolicy): design the price-tolerance band from 90
    days of variance history (84 benign under both legs, 6 overcharges over
    both); larger-of rule, v2.0.0, rationale must cite the data.
  - duplicate-check-hard (jsonPolicy): design the duplicate-detection rule from
    4 near-miss cases (true dup / resend-new-number / split-shipment / altered
    total); identity key + lookback + exact-vs-partial actions.
  - vendor-master-hard (jsonFields): change a vendor's bank details safely - a
    BEC fraud drill (verify by callback on the on-file number, dual approval,
    hold payments, status pending-verification).
  - three-way-match-hard (jsonDeltas): a 4-row tolerance-boundary battery that
    exercises the $25 floor vs 2% leg at and just past the inclusive edge.
  - payment-run-hard (templateSlots): ship a degraded pay-nothing run when the
    PO register is down (incident section, AP Manager sign-off).
- DECISION - no-scroll fix is STRUCTURAL, not content-gutting. Hard design
  drills legitimately need a long evidence narrative AND an 8-9 field guide, so
  the Exercise left column overflowed the page (measured left column 729px vs a
  ~643px grid budget; the source narrative alone was 364px). Rather than delete
  the evidence, the shared jsonEditor workbench (LessonExercise.jsx) now bounds
  each Exercise column to the viewport and lets ONLY the raw source narrative
  scroll internally; the live field-guide checklist, the editor, and the
  readiness callout stay fixed and fully visible. The change is additive
  (height caps on the lg breakpoint only), so short Module 1 lessons are
  unchanged and the previously borderline Module 1 threshold-policy-hard (484px
  source) is now robustly no-scroll too.
- VERIFIED live @1280x800 in the wrong-answer (tallest) state:
  document.documentElement.scrollHeight === clientHeight === 800 for all five
  new Hard lessons and for Module 1 threshold-policy-hard (regression check).
- Canon: added the three-way-match-hard boundary rows (variance deltas +
  variancePct pctMove round-2) as derivations/assertions. `npm run check` green
  (81 lessons linted, 98 canon assertions, 31 derivations, 81 fixtures ok,
  build clean). F7 per-project code-splitting still deferred to the Module 3
  block (bundle ~787 kB).

## 2026-07-02 (PM audit AUDIT_REPORT_2026-07-02.md - findings worked)

- Acted on the 2026-07-02 PM audit (verdict: shippable, no blockers). Copy and
  docs pass covering F1-F6, F8, F9, plus the F4 product decision.
- F1 (three-way-match easy taught the tolerance boundary wrong): removed the
  contradictory "and within 2%" language so the copy matches the larger-of
  rule where the band is the whole price test. No canon-asserted value changed.
- F2/F3 (positional lesson references): replaced "next lesson" / "previous
  lesson" / "Lesson 15" copy with named-task references (Market Intake Record,
  Approval Route, Morning Brief, Clean Price Data, Approval Template) across
  Module 1, matching Module 2's name-the-task convention.
- F4 (difficulty vs tier vocabulary collision): DECISION - adopt a single
  learner-facing vocabulary, the tier. The lesson header now shows the active
  tier ("Easy tier / Medium tier / Hard tier"), not the per-lesson difficulty
  word (Beginner/Intermediate). The `difficulty` field stays in lesson JSON and
  is still validated by lint VALID_DIFFICULTIES (backward compatible); it is
  simply no longer surfaced as a competing scale. LessonWorkspace now takes a
  `tier` prop from App.
- F5 (undefined domain terms): added one-line hub / $-per-MWh / settled glosses
  to the intake and clean-price-data INTROS only (not Exercise screens).
- F6 (cross-module distractor): invoice-inbox q3 option c "A trader to approve
  each email" -> "The Controller to read each email first" (Beacon-native).
  correctOptionId unchanged.
- F8: added .github/copilot-instructions.md (start at BUILDER_KICKOFF.md, obey
  AUTONOMY_CHARTER.md, run `npm run check`) + a pointer line atop AGENTS.md.
- F9 (doc staleness): refreshed LESSON_DESIGN_FRAMEWORK.md section 6 key files
  (per-project src/data/projects/<id>/ roots, __<id> storage-key namespacing,
  `npm run check` build block) and section 7 item 3 (Module 2 Easy+Medium DONE,
  Hard is the current frontier); VERIFICATION_PLAYBOOK.md (lint:map in the
  pipeline, per-project namespaced reset keys).
- Deferred: F7 (per-project code-splitting) scheduled as the first task of the
  Module 3 block; F1(c) 24.50/2.04% boundary drill folded into the Module 2
  Hard tier build; F10 = the Module 2 Hard tier itself.

## 2026-07-02 (module-02 Beacon - Step 7 Medium tier built)

- Authored the full Module 2 Medium tier: all 17 lessons wired, fixtured, and
  canon-checked. `npm run check` green: 76 lessons linted (0 errors/warnings),
  76 fixtures pass, 86 canon assertions + 23 derivations recomputed, build
  clean.
- Medium theme = a MESSY BATCH of 5 invoices where only INV-59001 is clean. The
  other four each carry one failure mode: INV-59002 price over tolerance,
  INV-58962 duplicate (already paid day-0), INV-59004 unknown vendor (V-1205 not
  in master), INV-59005 missing receipt (two-way only). Canon in
  curriculum/module-02/medium/_OVERVIEW.md.
- Validator spread now uses the row validators deferred from Easy: jsonRows x3
  (invoice-record 5 rows, duplicate-check 5 rows, match-decision 5 rows),
  jsonDeltas x1 (three-way-match, 3 matchable rows with per-row variance/pct/
  band/withinTolerance/qtyMatch), jsonFields x1 (payment-batch), templateSlots
  x2 (payment-run, remittance-advice), choiceCheck x10 for the inspection/
  handoff nodes. Booleans in row validators are checked as required non-numeric
  fields (normalize compare); numeric fields stay strict === on real numbers.
- Canon enforcement uses the resolver's [key=value] row finder: three-way-match
  variance/variancePct for INV-59002 (90 / 7.89) and INV-59005 (8 / 0.81) are
  recomputed by derivations from their PO/invoice totals; 17 assertions pin the
  per-row routes, reasons, duplicate flag, tolerance/qty outcomes, and the
  batch's held/total/count so no Medium lesson can drift from the batch canon.
- Verified live at 1280x800 in the wrong-answer (tallest) state: the 4-question
  choiceCheck (invoice-inbox-medium) and the 5-row jsonRows editor
  (invoice-record-medium) both measure document scrollHeight === clientHeight
  (800 === 800) - the no-scroll HARD RULE holds on the new surfaces.

## 2026-07-02 (module-02 Beacon - Steps 3-6 Easy tier built)

- Authored the full Module 2 Easy tier: all 17 lessons (one per map node),
  playbook Steps 3 (node audit), 4 (canon), 5-6 (build). `npm run check` green:
  59 lessons linted (0 errors/warnings), 59 lesson fixtures pass, 69 canon
  assertions + 18 derivations recomputed, build clean.
- Validator spread (Easy = the clean pattern): choiceCheck x9 for inspection/
  governance/handoff nodes (learners inspect references they do not own and log
  handoffs), jsonEditor/jsonFields x6 for the build/transformation/decision
  nodes (invoice-record, tolerance-policy, duplicate-check, three-way-match,
  match-decision, payment-batch), templateSlots x2 for the assembly outputs
  (payment-run.md, remittance-advice.md). Row-based validators (jsonRows/
  jsonDeltas) are deliberately deferred to Medium, where multiple invoices and
  failing cases make multi-row natural.
- Canon enforcement: variance (20.00) and variancePct (1.67) in three-way-match
  are recomputed by canon derivations from invoiceTotal 1220 / poTotal 1200;
  shared numbers (invoice total, quantity, unit price, tolerance 2%/$25, the
  duplicate/tolerance flags) are pinned by 11 canon assertions so no lesson can
  drift from curriculum/module-02/easy/_OVERVIEW.md.
- module-02 flipped from "planned" to "active" in src/data/projects.json (now
  selectable in the project switcher). Verified live at 1280x800: Beacon canvas
  renders its own map/goal/clock; a choiceCheck Exercise in the validated
  wrong-answer state measures document scrollHeight === clientHeight (800 ===
  800) - the no-scroll HARD RULE holds.
- CANVAS FIX (product): ProjectCanvas had three hardcoded Module-1 strings (the
  goal paragraph, the "6:15 AM CT" clock badge, and the project-name fallback).
  Made the goal and clock project-aware by reading `goal` and `clock` from the
  projects.json registry entry (fallback to the Meridian defaults), so each
  module shows its own header copy. Added goal+clock to module-01 and module-02
  registry entries.

## 2026-07-02 (module-02 Beacon - Step 2 map gate)

- Authored the Module 2 (Beacon Invoice Desk) workflow map per its ratified
  charter and MODULE_AUTHORING_PLAYBOOK.md Step 2. Data lives in
  src/data/projects/module-02/ (workflowNodes.json, workflowEdges.json,
  phases.json, lessonMeta.json). `npm run lint:map` green (17 nodes, 21 edges,
  0 errors/warnings); full `npm run check` green (no regression to module-01).
- Phases (5, per charter spine): Capture -> Reference Data -> Matching ->
  Exceptions and Approval -> Payment and Archive.
- The fork: match-decision (the single decision node) routes within-tolerance
  AND non-duplicate invoices to auto-approve-path, everything else to
  exception-queue.
- MAP DEVIATION (allowed at the gate; charter permits adding 1-2 nodes): added
  a 17th node payment-history (type reference) between the archive and the
  duplicate check. The charter's loop was payment-archive -> duplicate-check,
  but duplicate-check is a process; the map lint (and the doctrine) require the
  temporal loop to be archive -> reference/source. payment-history is the
  paid-invoice baseline the duplicate check reads, exactly mirroring Meridian's
  distribution-archive -> prior-day-reference -> variance-check. Loop is now
  payment-archive (archive) -> payment-history (reference) -> duplicate-check.
- Unlock tree (lessonMeta.LESSON_PREREQS): root invoice-inbox fans to
  vendor-master + po-register + invoice-record; two entry branches (document
  path, reference-data path) converge at three-way-match; all 17 task nodes
  reachable and acyclic; LESSON_PATH is a valid topological order.
- Lesson-type spread across the 17 nodes covers 7 of 8 types (inspection,
  build, governance, transformation, decision, handoff, assembly; only
  interpretation is unused) - meets the Step 3 >= 6 guardrail.
- module-02 stays status "planned" in src/data/projects.json (disabled "Coming
  soon" in the switcher) until its Easy tier is built; the lint scripts key off
  the on-disk data dir, so the map is validated now. Canon (Step 4) and lessons
  (Steps 5-6) come next.

## 2026-07-02 (multi-project engine - SPEC_MULTI_PROJECT.md)

- Shipped the multi-project engine that unblocks Modules 2-10. A registry
  `src/data/projects.json` (array order = build order; one active) lists all
  ten projects; only those with data on disk are selectable.
- Per-project data moved to `src/data/projects/<id>/` (workflowNodes.json,
  phases.json, workflowEdges.json, lessonMeta.json). module-01's files were
  relocated via `git mv` (byte-identical). `workflowNode.schema.json` stays in
  `src/data/` (doc-only).
- `src/lib/projects.js` is the new project layer: registry access, active-
  project persistence under `signalflow_project` (default module-01), static
  per-project data map, and `BUILT_LESSONS[projectId][tier]` (module-01's
  built-lesson lists moved here verbatim).
- `src/lib/progress.js` is now project-aware. Storage rule: module-01 keeps
  ALL legacy keys byte-for-byte (`signalflow_progress`, `signalflow_tier`,
  `signalflow_artifacts`, `+_<tier>` for non-easy); every other project
  namespaces as `signalflow_progress__<id>[_tier]` etc. The progress model and
  gating are unchanged - additive only.
- Header project name became a real dropdown (ProjectCanvas): active/complete
  project selected; planned projects disabled with "Coming soon". Switching a
  project behaves like switching a tier (swap working set, return to canvas,
  default = that project's unlock frontier). App.jsx, ArtifactViewer.jsx and
  LessonWorkflowStrip.jsx now resolve nodes/edges via getProjectData(project).
- `scripts/lint-map.mjs` and `scripts/lint-lessons.mjs` iterate every registry
  project with data (canon path `curriculum/<id>/canon.json`); fixtures stay
  global (lesson ids are unique). Gate stays green: 42 lessons, 0 errors, 58
  canon assertions, 16 derivations, 42 lesson tests pass, build clean.
- Verified live at 1280x800: seeded legacy key survives switch-away-and-back;
  switcher shows module-01 complete + disabled planned modules; per-project
  tier independence; no-scroll wrong-answer state intact; console clean.
- VERIFICATION_PLAYBOOK.md gained a project-switch check section (same PR).

## 2026-06-25

- Use React + Vite for the local app scaffold.
- Use Tailwind CSS for styling.
- Keep `signalflow-lab-mvp-spec-v2.md` as the source of truth.
- Keep the MVP limited to one complete lesson: Intake.
- Show Structure, Evaluate, Route, and Brief as workflow nodes, but do not build full lessons for them yet.
- Store runtime progress in `localStorage` under `signalflow_progress`.
- Store artifacts in `localStorage` under `signalflow_artifacts`.
- Use local JSON files for static node and lesson data.
- Avoid React Router for the MVP; use simple React state for view navigation.

## 2026-06-26

- Accepted the MVP baseline and froze MVP scope before starting next-direction work.
- New product direction: the process map is the curriculum.
- The canvas should evolve from a linear lesson row into a realistic workflow blueprint.
- Workflow nodes should explain provenance, real-world sources, access requirements, reuse, and solo rebuild paths.
- Lessons should remain short task bursts inside the larger map, using an Intro -> Exercise -> Takeaway flow.
- Do not add real integrations yet; represent real-world systems as explanatory metadata and local simulations.
- Product doctrine added: purpose, five guiding principles, progression model, map hierarchy, node taxonomy rule, selected node panel contract, and lesson quality bar.
- Current canvas model is a phase-banded dependency graph. Phases annotate the workflow; they should not visually cage it.
- Buildable progress is tied to task nodes and validated artifacts. Source/reference/context nodes can be inspected without being completed.
- `Market Intake Record` is the current buildable artifact node for `lesson-intake`.
- `Threshold Policy` is the second buildable node and teaches governance/config-as-rules through `lesson-threshold-policy`.
- `Clean Price Data` is the third buildable node and teaches normalization/type coercion through `lesson-clean-price-data`; added the additive `jsonRows` validator (top-level array, required row fields, numeric coercion, expected rows present) producing `clean-prices.json`.
- `Variance Check` is the fourth buildable node and teaches derived fields/deltas and material variance through `lesson-variance-check`; added the additive `jsonDeltas` validator (top-level array, expected hub rows present, required delta fields, numeric delta coercion, expected delta values, and an optional boolean `material` flag validated only when included) producing `variance-summary.json`. Chose to store an explicit artifact so Risk Evaluation later consumes an auditable signal instead of recomputing deltas.

## 2026-07-01 (curriculum master plan pass)

- Adopted the 10-module curriculum model: modules are SCENARIO-BASED (different
  business domains), each with easy/medium/hard tiers. Difficulty is depth on the
  SAME workflow map (easy = operate the pattern, medium = handle the mess, hard =
  own the design), not new territory. See CURRICULUM_MASTER_PLAN.md.
- End goal confirmed as personal mastery + portfolio product; commercialization
  stays parked.
- Module 1 Easy = the existing 17-node Meridian map, one lesson per node. The 13
  unbuilt lessons are fully scripted in curriculum/module-01/easy/ with complete
  lesson JSON, ready for a builder.
- Approved two new ADDITIVE interaction types to cover inspection/interpretation
  and assembly lesson types: choiceCheck (deterministic quiz minting a profile
  artifact) and templateSlots (fill a governed template from stored artifacts,
  rendering a string artifact). Spec: ENGINE_ADDITIONS_SPEC.md. Existing validator
  matching rules remain frozen.
- All other new lessons reuse existing validators (jsonDeltas for risk-evaluation
  and approval-decision, jsonPolicy for approval-template, jsonFields for the
  handoff/archive records).
- Canon data for Module 1 fixed in curriculum/module-01/easy/_OVERVIEW.md
  (hubs, prices, forecast, prior day, pct moves, approval at 6:41 AM by the Desk
  Manager, day-1/2/3 decision cases).
- Deferred per NODE_AUDIT: distribution-archive node split and risk-evaluation
  split stay single nodes through Module 1 Easy; revisit before Medium.

## 2026-07-02 (autonomy pass: charters, standing approvals, hardened gates)

- OWNER INSTRUCTION (recorded verbatim in intent): the builder should be able
  to run unattended and build everything; the owner does not need to be
  involved, but the idea must live on. This entry and AUTONOMY_CHARTER.md
  are that instruction made durable.
- RATIFIED: nine module charters (curriculum/charters/, modules 2-10), each
  fixing org, deliverable, roles, signature concepts, a draft map spine with
  the module's fork and temporal loop, tier postures, and engine needs.
  Scenario selection (DECISION_BOUNDARIES gate 2) is now pre-cleared for the
  whole curriculum.
- RATIFIED: AUTONOMY_CHARTER.md - the North Star, gate-by-gate standing
  decisions (pre-cleared / self-serve / prohibited), the source-precedence
  tie-breaker, the PARK protocol (OPEN_QUESTIONS.md), and the failure
  protocol. DECISION_BOUNDARIES.md and MODULE_AUTHORING_PLAYBOOK.md now
  point to it; BUILDER_KICKOFF.md is the builder entry point.
- RATIFIED: two engine specs under gate 7 - SPEC_ARTIFACT_IMPORT.md (the
  Module 1 capstone, attaching as lesson-approval-decision-hard with zero
  map/storage changes) and SPEC_MULTI_PROJECT.md (project registry,
  namespaced storage with Module 1 keeping legacy keys, header switcher).
- SETTLED (was deferred): NODE_AUDIT items 2-3 node splits - keep single
  dual-nature nodes, clarified in lesson copy, permanently. The map shape
  is stable.
- HARDENED GATES: scripts/lint-map.mjs (topology + unlock-tree invariants;
  now in `npm run check`); canon derivations (lint recomputes every derived
  number from its sources - 16 seeded); GitHub Actions CI running
  `npm run check` on every push; a module-report PR template.
- BUG FOUND BY THE NEW MAP LINT, FIXED: the temporal-loop edge
  (distribution-archive -> prior-day-reference) was documented in NODE_AUDIT,
  taught in two lessons, present in node metadata - and missing from
  workflowEdges.json. Added with label "seeds tomorrow" (additive map fix,
  logged per gate 3).

## 2026-07-02 (unlock tree + Phase 0 industrialization)

- PRODUCT DECISION (owner): gating changed from a linear chain to a BRANCHING
  TREE. One intro lesson (Analyst Notes) fans the board open 2-3 lessons at a
  time (LESSON_PREREQS in progress.js); a lesson unlocks when ALL its
  prerequisites complete; tiers collapse unbuilt prerequisites transitively
  (hard opens with intake + price-feed). Locked panels name every incomplete
  prerequisite.
- Phase 0 of CURRICULUM_MASTER_PLAN Part 8 is COMPLETE:
  scripts/validate-lessons.mjs + lesson-fixtures.json (41/41 lessons proven
  with correct/wrong answers), scripts/lint-lessons.mjs +
  curriculum/module-01/canon.json (58 drift-blocking assertions plus the
  authoring contract), `npm run check` as the commit bar,
  MODULE_AUTHORING_PLAYBOOK.md, DECISION_BOUNDARIES.md,
  VERIFICATION_PLAYBOOK.md.
- The lint's first run caught a real gap (the rich takeaway dialect carries
  its capability statement in takeaway.capability); the lint accepts both
  dialects now.
- Handoff posture: lesson implementation and verification are delegable to a
  secondary builder today; module AUTHORING is delegable with owner gates at
  charter, map, and wrap (per the playbook).

## 2026-07-02 (initial linear gating, superseded same day; formatting pass)

- SUPERSEDED: the bullet below describes the FIRST gating implementation this
  session (a strict linear chain, one READY lesson at a time). It was
  replaced the same day by the branching-tree redesign in the entry above
  ("unlock tree + Phase 0 industrialization") per an explicit product
  correction: the board should open gradually as a tree (one intro lesson
  fanning out 2-3 at a time), not a single forced chain. Current gating is
  LESSON_PREREQS in src/lib/progress.js; do not reintroduce the linear model.
  Kept here for history rather than deleted.
- (Historical) PRODUCT DECISION (owner): lessons are now FORCE-ORDERED. Exactly
  one lesson is READY at a time; completing it unlocks the next, following the
  pedagogical path from NODE_AUDIT item 7 (LESSON_PATH in progress.js). Each
  tier walks the same path filtered to its built lessons. This implements the
  doctrine's "completed artifacts unlock downstream tasks" for real, and it
  supersedes the old all-nodes-READY behavior. Locking is DERIVED, never
  stored: completed/in-progress statuses pass through, so existing saved
  progress keeps its completions.
- Locked lessons explain themselves: the node panel names the blocking
  lesson(s) ("Complete X to unlock"); the map shows only the unlocked
  frontier's Start buttons (1 at the very start, 2-3 as the tree fans out),
  which also resolves the 17-buttons visual-noise critique. (Under the
  superseded linear model this was always exactly one button; under the
  current branching tree it is 1-3 depending on how far the tree has opened.)
- Formatting/coloration: node cards show the lesson type instead of truncated
  mono filenames (filenames stay in the detail panel); the lesson-header
  clock chip went from amber to neutral (amber is reserved for
  attention/in-progress states); the tier switch gained a "Tier" label and
  per-tier tooltips noting separate progress.
- Deliberately NOT changed: quiz/template text sizes and card paddings (the
  no-scroll rule leaves zero slack in the tallest states), and the below-map
  dead space (node positions are data-driven; a map-layout pass is its own
  work item).

## 2026-07-01 (hard-tier curation pass)

- Hard tier is complete as a CURATED set of 7 design/failure drills; only
  the solo-rebuild capstone remains before Module 1 Hard is done.
- DECIDED: the five inspection-type nodes get no hard variant (their content
  does not deepen into design work), and variance-check-hard is folded into
  risk-evaluation-hard (compute + classify under quarantine in one drill).
- DECIDED: hard lessons are standalone drills, not one continuous morning.
  Three share the degraded-morning arc (price-feed -> risk-evaluation ->
  morning-brief); its canon (SPP quarantined, ERCOT 15.1 routine under
  ratified v2.0.0 bands 6/16) lives in curriculum/module-01/hard/_OVERVIEW.md.
- New lessons: risk-evaluation-hard (degraded-status propagation on every
  row), morning-brief-hard (incident in the deliverable; explained missing
  approval), distribution-archive-hard (retention designed from constraints;
  ordering rule: explainers outlive the explained).
- Verified live: hard shows 0 of 7; degraded brief renders and passes;
  no-scroll holds in the all-slots-failed state; no console errors.

## 2026-07-01 (medium-complete pass)

- Medium tier is COMPLETE: all 17 lessons built, smoke-tested, and verified
  live (no-scroll held for the medium quizzes and the 11-slot medium brief).
- Canon correction: intake-medium prices now MATCH the feed (peak 204,
  settled 151; the note conflict is 155 vs 151). The original 192/141 draft
  accidentally contradicted clean-prices-medium.
- Decision: exceptions stay FIELDS inside existing artifacts at Medium
  (droppedRowHub / missingForecastHub in the brief and closeout records); no
  new Intake Exceptions node. Revisit only if a future module needs exception
  queues.
- Medium design threads made deliberate: template lesson approves the Data
  Notes section the brief renders; approval-template-medium adds the delegate
  that approval-route-medium uses; routine-update-path-medium logs the
  version-flipped outcome (13.9 routine under v1.1.0, escalation under
  v1.0.0).
- Wave D polish applied to the four original lessons (capability statements;
  dual-materiality note in variance-check).
- Hard gained approval-route-hard (silence-driven escalation ladder with
  rung timestamps and an exhausted-ladder fallback): hard is 4 built.
- Note: production JS bundle passed 500 kB (all lesson JSON statically
  imported). Acceptable now; dynamic import per tier is the natural split
  later.

## 2026-07-01 (module-01-tiers implementation pass)

- Built all 13 remaining Module 1 Easy lessons: Easy is now 17/17 playable.
- Added two additive validators + workspaces: choiceCheck (inspection/
  interpretation quizzes minting source-profile artifacts) and templateSlots
  (assembly with an artifact shelf; renders a string artifact). jsonEditor
  path untouched; existing validator matching rules untouched.
- Added the difficulty-tier engine: signalflow_tier in localStorage, per-tier
  storage keys (easy keeps legacy keys), tierLessonId convention
  (taskId-medium / taskId-hard), tier-aware isBuildable, Easy/Medium/Hard
  switch in the canvas app bar. progress.js helpers default to the active
  tier so components did not need changes.
- Authored + built 7 Medium lessons on a new internally-consistent messier
  canon (conflicting notes, explicit nulls, dropped rows, policy v1.1.0 at
  6/14, WAUE hub, negative boundary case, out-of-office delegation). Canon
  recorded in curriculum/module-01/medium/_OVERVIEW.md.
- Authored + built 3 Hard lessons (intake schema v2 migration, threshold
  design from 60 days of history with cited rationale, price-feed failure
  handling). Deliberate choice: design lessons validate SHAPE + GOVERNANCE
  (ordering, non-empty rationale), not exact values - the values are the
  learner's design. Remaining hard work incl. the solo-rebuild capstone is
  scoped in curriculum/module-01/hard/_OVERVIEW.md.
- Smoke tests: every new lesson validated with a correct answer (passes,
  artifact stored) and a wrong answer (fails, bounded message).

## 2026-07-01 (visual / design-system pass)

- Adopted the design system in `Mock Ups/SignalFlow Lab Design System/` as the visual source of truth. Copied its tokens into `src/styles/tokens/` (palette, node-types, typography, spacing, semantic) and import them in `src/index.css` before the Tailwind directives.
- `tailwind.config.js` maps semantic and node-type tokens to `sf.*` utility classes backed by `var(--sf-*)`. Rule: do not use Tailwind `/opacity` modifiers on token colors; use the pre-made `-weak` fill tokens.
- Added a light (default) plus dark theme toggle persisted in localStorage under `signalflow_theme`; `src/lib/theme.js` applies `data-theme` on the document element. This is the third localStorage key alongside `signalflow_progress` and `signalflow_artifacts`.
- Introduced a small in-house UI primitive library under `src/components/ui/` (Button, Badge, Card, Chip, Icon, Stepper, Logo, ThemeToggle, CodeBlock, FlowConnector, SignalFlowDiagram, and more). We reskinned the existing app with these; we did not wholesale-copy the DS component bundle.
- Signal-flow is now the visual language: `SignalFlowDiagram` shows upstream inputs converging into the central artifact and fanning out to downstream consumers, colored by DS edge semantics (upstream/raw amber, downstream/signal cyan, completed/trusted emerald, locked slate dashed).
- Refined connector visual hierarchy so the artifact card is the hero: connectors have an `intensity` prop. Takeaway uses `primary` (the one strong flow moment); Intro, Artifact Viewer, and the workflow strip use `subtle` (thinner, label-free). Arrow strokes and arrowheads were reduced roughly 30-40 percent from the first branching pass.
- Flow labels (RAW SIGNAL / TRUSTED SIGNAL) render as HTML chips that paint on top of the cards with a surface-colored background, so they are never covered by an adjacent card in either theme.
- Reaffirmed the no-scroll hard rule as Exercise/workbench-only: the Exercise screen must not page-scroll at innerHeight >= 800 in the wrong-answer state. Intro and Takeaway may scroll. No visual change touched the Exercise diagram (there is none there), and all four lessons were re-verified at overflow 0.
- No logic, validators, lesson JSON, progress model, or localStorage keys changed during the visual passes. Deployment remains out of scope for these passes (the live Vercel site is from an earlier build).

## 2026-07-01 (module-01 capstone: artifactImport)

- Added the Module 1 solo-rebuild capstone `lesson-approval-decision-hard`, the eighth hard-tier lesson, on the `approval-decision` node. It ships the new `artifactImport` interaction/validator per `SPEC_ARTIFACT_IMPORT.md`: the learner rebuilds the four core pipeline files (market-intake.json, clean-prices.json, variance-summary.json, risk-evaluation.json) OUTSIDE the app in any tool, then proves the rebuild by importing each file.
- `artifactImport` is a COMPOSING validator, not a new matching rule: it parses the `{ key: rawText }` import map and dispatches each raw file through the existing frozen JSON validators (`jsonFields`, `jsonRows`, `jsonDeltas`) via `validateAnswer`. The four embedded `validation` blocks are the EASY-tier canon blocks copied verbatim, so the capstone grades against the real acceptance bar rather than a lighter one. On full pass it mints the composite `rebuilt-pipeline.json` artifact (`{ ...four sub-artifacts, rebuiltOutside: true }`).
- Prereqs are unchanged: `approval-decision` gates on `risk-evaluation`, which is built in the hard tier, so the capstone unlocks after `risk-evaluation-hard` completes (effective-prereq collapse handles the unbuilt intermediates).
- `ArtifactImportExercise.jsx` presents a two-column workbench: left = the rebuild runbook (bounded, internally scrollable) + collapsed Copilot prompt; right = four import rows (file picker via `FileReader.readAsText`, or a single-open paste textarea) + Validate + a bounded readiness card (per-row status chips plus one prioritized "Fix this next" callout).
- No-scroll HARD RULE honored: the tallest Exercise state (open paste textarea coexisting with the wrong-answer readiness card) overflowed by ~107px, so `handleValidate` now closes any open paste before grading and the paste textarea was trimmed to 3 rows. Verified at 1280x800 that the pre-validate paste-open, wrong-answer, and passed states all satisfy `scrollHeight === clientHeight === 800`; the Takeaway (allowed to scroll) shows the composite artifact.
- Lint contract extended additively: `artifactImport` added to `VALID_INTERACTIONS`/`VALID_VALIDATORS` with a shape rule (nonempty `imports`, each with `key`/`label` and a JSON-validator `type`); a regression fixture was added where each import value is the raw file text as a string.

## 2026-07-02 (module-01 wrap - MODULE 1 COMPLETE)

- Module 1 is COMPLETE across all three tiers: Easy 17/17, Medium 17/17, Hard 8/8. This closes work-queue item 2 (Module 1 wrap) from the autonomous build plan.
- Full-path playthrough verified live at 1280x800 per VERIFICATION_PLAYBOOK: (a) Easy fresh tier gates to the single intro root (`analyst-notes`); the intro lesson plays Intro -> Exercise -> Takeaway, wrong and correct states both hold `scrollHeight === clientHeight === 800`, completion records the `analyst-notes` artifact and unlocks exactly its two children (`trader-flag`, `price-feed`). (b) Medium fresh tier gates to its single root, stats read 0 of 17. (c) Hard fresh tier gates to its two collapsed roots (Market Intake Record + Price Feed), stats read 0 of 8 - the capstone is counted. Test progress/artifacts cleared afterward.
- Docs synced: README Current Status, LESSON_DESIGN_FRAMEWORK sections 6-7 (living handoff), all three curriculum/module-01 tier `_OVERVIEW.md` files, and this log.
- Wrote the Module 1 portfolio case study at `curriculum/module-01/CASE_STUDY.md` (the workflow, the three-tier depth model, the engine capabilities Module 1 forced into existence, and what a learner can demonstrably do after finishing).
- Tagged a release for the demoable Module 1 build. The app is demoable before Module 2 starts. Per AUTONOMY_CHARTER the per-module PR is opened as the owner review artifact and is NOT self-merged.
- NEXT (per the fixed queue): the multi-project engine (SPEC_MULTI_PROJECT.md) before authoring Module 2 (Beacon Invoice Desk) via MODULE_AUTHORING_PLAYBOOK.md.

