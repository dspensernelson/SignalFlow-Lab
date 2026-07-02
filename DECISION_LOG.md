# Decision Log

Short record of product and implementation decisions. Keep entries factual and brief.

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
