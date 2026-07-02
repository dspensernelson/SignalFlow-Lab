# SignalFlow Lab - Curriculum Master Plan

This is the long-range plan for SignalFlow Lab: the theory behind the product, the
10-module curriculum, the easy/medium/hard difficulty model, the engine roadmap, and
the ten-year horizons. It extends (does not replace) PRODUCT_DOCTRINE.md,
PROCESS_MAP_CURRICULUM_DIRECTION.md, LESSON_DESIGN_FRAMEWORK.md, and NODE_AUDIT.md.

Decisions recorded here (2026-07-01, confirmed with the product owner):

1. Modules are SCENARIO-BASED. Each of the 10 modules is a different business
   workflow in a different domain. Module 1 is Meridian Morning Market Brief.
2. Difficulty is DEPTH, not new territory. Easy/medium/hard reuse the same workflow
   map per module; what deepens is mess, judgment, and design responsibility.
3. The engine may grow NEW INTERACTION TYPES when a lesson type needs one, specified
   precisely enough for a junior/small-model builder (see ENGINE_ADDITIONS_SPEC.md).
4. The end goal is PERSONAL MASTERY + PORTFOLIO. The product must always be
   explainable, demoable, and finished-feeling at every milestone. Commercial reuse
   (client training, authoring platform) stays optional and parked.

Keep this file ASCII-only.

---

## Part 1 - The theory of the product

### 1.1 What the app believes about learning automation

Most automation training teaches TOOLS (click here in Power Automate). SignalFlow Lab
teaches the INVARIANTS underneath every tool. A learner who finishes a module should
be able to walk into any automation platform and already know what to look for,
because every platform is a skin over the same eight moves:

1.  Work enters as messy signals (sources).
2.  Signals must become structured, named, trusted objects (artifacts).
3.  Rules must live outside the logic that applies them (config/policy).
4.  Data must be normalized before math or comparison is safe (data quality).
5.  Derived signals should be computed once and stored, not recomputed (auditability).
6.  Decisions are explicit branches with owned thresholds (routing).
7.  Humans stay in the loop at governed points, and their responses are captured
    as records (handoffs).
8.  Outputs are assembled from upstream artifacts, delivered, retained, and fed back
    as tomorrow's inputs (assembly + the loop).

The pedagogy is constructionist: the learner does not read about these moves, they
PERFORM each move once, on a realistic business workflow, producing a named artifact
that the rest of the workflow visibly consumes. The map is the curriculum; artifacts
are the unit of progress; every takeaway ends with a Capability Statement about the
SYSTEM ("The workflow can now ..."), not the learner.

### 1.2 Why this makes someone "way better at automation"

Transfer happens when the learner can name the pattern independent of the surface.
Every lesson therefore carries a THEORY section (see the lesson scripts) with three
parts:

- The invariant: the domain-free automation principle the node embodies.
- The mental-model shift: the before/after in how the learner sees work.
- The recognition cue: how to spot this pattern in any future workflow or tool.

Example (Market Intake Record): the invariant is "automation cannot act on a
paragraph; the first job of any pipeline is to mint a trusted structured record."
The shift is from "I am learning JSON" to "I am the intake service." The cue is
"whenever a process starts from an email/chat/note, look for (or build) the intake
record - if there is not one, that is where the automation starts."

### 1.3 The three-tier difficulty theory (applies to every module)

Same map, three postures:

- EASY - "Operate the pattern." The learner executes each move with scaffolding:
  clean-ish single input, field guide, starter answer, forgiving validation. Goal:
  the learner can perform and NAME all eight moves. (This is the tier being built.)
- MEDIUM - "Handle the mess." Inputs conflict, fields go missing, formats drift.
  The learner decides what is trustworthy, flags exceptions explicitly (null +
  exception record instead of guessing), names schema fields themselves, and works
  with fewer hints and stricter validation. New exception-path nodes appear on the
  map. Goal: judgment - knowing what to do when the happy path breaks.
- HARD - "Own the design." The learner sets the thresholds and defends them in a
  governance record, migrates a schema through a versioned breaking change, absorbs
  injected failures (late feed, malformed rows, approver timeout), and finishes with
  a solo-rebuild capstone: recreate the pipeline OUTSIDE the app (scripts or a
  low-code tool) against a provided acceptance checklist. Goal: authorship - the
  learner can design, not just run, the workflow.

Rule of thumb: Easy validates VALUES, Medium validates DECISIONS, Hard validates
DESIGNS. All three stay deterministic (no AI grading): medium/hard determinism comes
from constrained decision spaces (enumerated exception codes, fixed failure
scenarios, checklist-based capstone acceptance), not free-text judging.

### 1.4 What each module tier unlocks (progress semantics)

- Completing Easy of module N unlocks Medium of module N and Easy of module N+1.
- Difficulty tiers of one module share the map; the map renders tier-specific nodes
  (exception paths on Medium, failure/versioning nodes on Hard) as an overlay.
- A module is "mastered" when Hard's capstone checklist passes.

---

## Part 2 - The 10-module catalog (scenario-based)

Each module is a fictional org + one end-to-end workflow, roughly 15-18 nodes across
5 phases, built with the same hierarchy (Project -> Phase -> Node -> Task ->
Artifact -> Concept) and the same lesson types (inspection, interpretation, build,
transformation, decision, handoff, assembly, governance). Concepts RECUR across
modules on purpose; each module adds one signature concept cluster nothing before it
had. The order is a deliberate concept ladder.

| # | Module (org + workflow) | Domain | Signature concept cluster (new here) |
| - | --- | --- | --- |
| 1 | Meridian Morning Market Brief | Energy trading ops | The eight moves themselves: structured data, normalization, config-as-rules, derived signals, branching, human-in-the-loop, assembly, the daily loop |
| 2 | Beacon Invoice Desk | Accounts payable | Matching and exceptions: document extraction, 2/3-way match, tolerances, duplicate detection, exception queues, vendor master data |
| 3 | Harbor Onboarding | HR / IT provisioning | Orchestration: parallel branches, task states, completion gates, SLAs, idempotency (safe re-runs), checklists as state |
| 4 | Relay Ticket Triage | Customer support ops | Classification and queues: intent taxonomies, priority matrices, routing tables, escalation ladders, feedback from outcomes |
| 5 | Ledger Month-End Close | Finance / accounting | Time and dependencies: schedules and calendars, dependency chains, reconciliation, segregation of duties, sign-off controls |
| 6 | Compass CRM Hygiene | Sales operations | Data quality at scale: dedupe and merge, survivorship rules, enrichment via external lookup, scoring rules, batch vs record-at-a-time |
| 7 | Depot Order Flow | Supply chain / e-comm | Events and state: triggers vs schedules, webhooks, state machines, reorder points, compensating actions when a step fails mid-flight |
| 8 | Sentinel Evidence Locker | Risk / compliance | Governance depth: evidence collection, immutability, retention policy, attestations, access reviews, audit-first design |
| 9 | Studio Campaign Ops | Marketing operations | Templating and fan-out: content templates at scale, versioned assets, approval chains, multi-channel distribution, tracking codes |
| 10 | Watchtower Incident Response | IT operations | Observability and resilience: alert thresholds, runbooks as automation, paging handoffs, postmortem records, the improvement loop. Capstone: design-your-own-workflow mode |

Notes:

- Modules 2-10 are named and scoped here so the ladder is fixed, but each gets its
  own NODE_AUDIT-style document before any of its lessons are authored. Do not
  author module 2+ lessons from this table alone.
- Module 10 Hard ends the whole curriculum with the learner designing a new
  workflow map from a plain-language business brief - the final proof of transfer.
- Every module keeps the Meridian invariants (intake record, policy object,
  clean data, decision, handoff, assembly, archive loop) so the recurring shape
  itself becomes the deepest lesson: all workflows are the same workflow.

### 2.1 Per-module workflow spines (one line each, for later expansion)

1. Meridian: overnight notes/prices -> intake record -> clean data -> policy ->
   variance -> risk -> approval branch -> brief -> distribute/archive -> loop.
2. Beacon: invoice PDFs/emails -> invoice record -> PO + receipt lookup -> match ->
   tolerance policy -> exception queue or auto-approve -> payment run -> remittance
   -> vendor statement loop.
3. Harbor: signed offer -> onboarding record -> parallel provisioning (accounts,
   hardware, access, payroll) -> gate check -> day-one checklist -> 30-day review
   loop.
4. Relay: inbound tickets -> triage record -> classification -> priority matrix ->
   queue routing -> SLA timers -> escalation branch -> resolution record ->
   satisfaction loop.
5. Ledger: trial balance + subledgers -> close calendar -> reconciliations ->
   adjusting entries -> review sign-offs -> reporting package -> archive ->
   next-period carryforward.
6. Compass: raw CRM export -> dedupe candidates -> merge decisions (survivorship
   policy) -> enrichment lookups -> lead score -> territory routing -> hygiene
   report loop.
7. Depot: order events -> order record -> inventory check -> reserve/backorder
   branch -> pick/pack/ship states -> exception compensation -> delivery
   confirmation -> reorder-point loop.
8. Sentinel: control catalog -> evidence requests -> collection tasks -> evidence
   records (immutable) -> reviewer attestation -> findings branch -> audit package
   -> retention schedule.
9. Studio: campaign brief -> asset templates -> content records -> approval chain ->
   channel fan-out (email/social/web) -> tracking codes -> performance rollup ->
   next-campaign template loop.
10. Watchtower: telemetry -> alert thresholds (policy) -> incident record ->
    runbook automation -> paging handoff -> resolution -> postmortem record ->
    threshold-tuning loop.

---

## Part 3 - Module 1 across the three tiers

### 3.1 Module 1 Easy - COMPLETE (2026-07-01)

17 lessons = the 17 nodes on the existing map, in the pedagogical order fixed in
NODE_AUDIT.md item 7. ALL 17 ARE BUILT AND PASSING on the module-01-tiers
branch, implemented from the scripts in curriculum/module-01/easy/. The two new
interaction types (choiceCheck, templateSlots) are implemented per
ENGINE_ADDITIONS_SPEC.md; every other lesson reuses the four original
validators unchanged. Remaining Easy work is polish only (Wave D deltas in
curriculum/module-01/easy/BUILT_LESSON_AUDITS.md).

### 3.2 Module 1 Medium - "Handle the mess" (7 of 17 built; canon + status in curriculum/module-01/medium/_OVERVIEW.md)

Same map plus three new exception-path nodes. Planned deltas per area:

- Intake: TWO analyst notes that partially conflict (different settled prices), plus
  a note with a missing generation status. Learner must pick the authoritative
  source (timestamps decide), set missing values to null, and produce a new
  exception record artifact (exceptions.json) listing what could not be trusted.
  New node: Intake Exceptions (artifact).
- Data: price rows now include a duplicate hub row, a blank cell, and a
  European-format number ("1.234,50"). Learner dedupes, coerces, and flags.
- Policy: thresholds arrive as a forwarded email chain with a superseded value;
  learner must version the policy 1.1.0 and record what changed and why
  (changeNote field).
- Evaluation: one hub has no forecast; variance must emit an explicit
  "insufficient-data" status instead of a number.
- Routing: approver is out of office; learner routes to the recorded delegate
  (delegation is in the approval template) and logs the substitution.
- Assembly: brief must include an Exceptions section sourced from exceptions.json.
- Scaffolding removed: no starter answers; field guides list field names only (no
  examples); validation error messages name the check, not the fix.

New validator work for Medium: null-tolerant expected values and an
enumerated-exception-code check (additive; specify before building).

### 3.3 Module 1 Hard - "Own the design" (3 built; status + remaining in curriculum/module-01/hard/_OVERVIEW.md)

Same map plus versioning/failure overlays:

- Design: learner sets routine/escalation thresholds themselves from a quarter of
  historical daily moves (provided as a fixture) and must produce a
  policy-rationale.json (chosen values + which historical days would have
  escalated - deterministic given the fixture).
- Migration: intake schema v2 renames generationFlag to operatingSignal and adds
  units. Learner writes a migration map and upgrades stored artifacts; downstream
  lessons validate against v2.
- Failure injection (fixed scenarios): price feed arrives 40 minutes late (learner
  chooses and logs the degraded-brief path); one malformed row must be quarantined,
  not dropped silently; approver does not respond by deadline (escalation ladder).
- Capstone: rebuild the pipeline outside the app - a provided runbook walks the
  learner through recreating intake -> clean -> variance -> brief with local files
  and any tool they choose (PowerShell, Python, Power Automate). The app validates
  by importing the learner's produced files and running the existing validators
  against them. Acceptance = all four imported artifacts pass.

---

## Part 4 - Engine roadmap

The engine grows only when a lesson type demands it. Order of work:

1. NOW (Module 1 Easy): choiceCheck + templateSlots interaction types
   (ENGINE_ADDITIONS_SPEC.md), lesson registration for 13 new lessons, fixtures for
   price-feed and forecast-data, taskId wiring in workflowNodes.json.
2. Module 1 Medium: null-tolerant validation options, exception-code check,
   difficulty selector (per-module tier switch; progress keyed by module+tier),
   map overlays for tier-specific nodes.
3. Module 1 Hard: artifact import (file upload -> run validators), schema-version
   awareness in ArtifactViewer, scenario/failure flags in lesson JSON.
4. Module 2 readiness: multi-project support - a project switcher, per-project
   node/edge/phase data, per-project localStorage namespacing
   (signalflow_progress_m2 etc.), and a module registry JSON.
5. Authoring pipeline (Modules 3+): a lesson-lint script (node) that validates
   lesson JSON against the authoring checklist (required fields, capability
   statement present, validator config well-formed, ASCII-only) so new content
   cannot drift from the doctrine.
6. Portfolio layer (any time after Module 2): export artifact bundle (zip of the
   learner's artifacts + a generated "what I built" summary), a read-only demo mode
   seeded with completed progress, and short per-module case-study writeups.

Standing constraints (never change without a DECISION_LOG entry): local-first
(no backend/login), deterministic validation (no AI grading), the no-scroll
exercise rule at innerHeight >= 800, no gamification, ASCII-only repo docs,
validators are additive (never change existing matching rules).

---

## Part 5 - Ten-year horizons

The end goal is personal mastery + a portfolio-grade product, so every horizon ends
in a demoable, finished state - no horizon leaves the app half-migrated.

- H1 (2026-2027) - Module 1 complete. Easy fully built (17/17), then Medium
  authored + built, then Hard incl. the solo-rebuild capstone. Deliverable: one
  perfect module proving the whole pedagogy, plus a written case study.
- H2 (2027-2029) - Prove the engine is domain-agnostic. Multi-project support;
  author and build Modules 2 (Beacon) and 3 (Harbor) at Easy; backfill their
  Medium/Hard as the difficulty engine matures. Deliverable: three modules, a
  module registry, and the lesson-lint pipeline.
- H3 (2029-2032) - Breadth. Modules 4-6 all tiers; authoring tooling mature enough
  that a module takes weeks, not months; optional hosted read-only demo for the
  portfolio. Deliverable: six modules and a public demo.
- H4 (2032-2036) - Completion. Modules 7-10 all tiers; Module 10 capstone
  (design-your-own-workflow) ships; full-curriculum export ("everything I built").
  Optional exits, only if wanted then: open-source the engine, package as client
  training, or add an authoring UI. None is required by this plan.

Cadence assumption: this is a nights-and-weekends product. The plan survives long
pauses because every unit of work (one lesson, one tier, one module) leaves the app
consistent and demoable.

---

## Part 6 - Conformance assessment (app vs docs, 2026-07-01)

Verdict: the app is ON TRACK with its documentation. Specific findings:

Aligned:
- The map-is-the-curriculum model is implemented (phase-banded DAG, clickable
  nodes, node detail contract, lesson launch from nodes).
- The 4 built lessons follow the authoring template: business-first intros,
  one primary concept each, deterministic additive validators, artifact-producing,
  capability-statement takeaways (intake explicitly; others end map-connected).
- Progress/artifact model matches doctrine (localStorage, derived statuses).
- The no-scroll rule is documented in all three governing docs as required.

Gaps this plan closes:
- 13 of 17 Module 1 Easy lessons unbuilt -> scripted now in curriculum/.
- Inspection/interpretation/assembly lesson types had no interaction type ->
  ENGINE_ADDITIONS_SPEC.md.
- price-feed and forecast-data lack fixtures (NODE_AUDIT item 10) -> fixtures are
  embedded in their lesson scripts.
- No module/difficulty structure existed in the docs -> Parts 1-3 above.

Gaps deferred (tracked, intentional):
- Distribution / Archive thing/action ambiguity (NODE_AUDIT item 3): keep the
  single node through Module 1 Easy; the lesson script clarifies the dual role in
  copy. Revisit the node split before Medium.
- Risk Evaluation dual nature (NODE_AUDIT item 2): same treatment.
- Two intro dialects exist (lesson-intake's rich intro vs the simple heading/
  sections shape). New lessons use the simple shape; migrating all lessons to the
  rich shape is a polish pass, not a blocker.
- Threshold Policy materiality (percent, day-over-day) vs Variance Check
  materiality (absolute 10 vs forecast) are DIFFERENT rules that look similar.
  Risk Evaluation's lesson copy teaches the distinction explicitly (it is a real
  workplace phenomenon: overlapping rules owned by different steps).

---

## Part 7 - How to execute with a small-model builder

Hand work to the builder in this order, one work packet at a time:

1. ENGINE_ADDITIONS_SPEC.md (implement choiceCheck + templateSlots + registration).
2. curriculum/module-01/easy/_OVERVIEW.md (read-only context; canon data lives here).
3. Lesson scripts in build-wave order (each file is self-contained):
   - Wave A (no new engine): 10-risk-evaluation, 11-approval-template,
     12-approval-decision, 13-approval-route, 14-routine-update-path,
     17-distribution-archive.
   - Wave B (needs choiceCheck): 01-analyst-notes, 02-trader-flag, 04-price-feed,
     05-forecast-data, 06-prior-day-reference, 15-prior-day-brief-template.
   - Wave C (needs templateSlots): 16-morning-brief.
   - Wave D: BUILT_LESSON_AUDITS.md polish deltas (optional, lowest priority).
4. After each lesson: run the acceptance checklist at the bottom of its script,
   then lint + build, then verify the no-scroll rule on the Exercise screen in the
   wrong-answer state.

Builder prompt preamble (use verbatim):

```text
You are building one lesson in SignalFlow Lab. Read, in order:
PRODUCT_DOCTRINE.md, ENGINE_ADDITIONS_SPEC.md,
curriculum/module-01/easy/_OVERVIEW.md, and the single lesson script named below.
Implement EXACTLY what the lesson script specifies. Do not invent copy, fields,
or validation rules. Do not modify existing validators' matching rules. Prefer
data/JSON changes over component changes. Keep repo docs ASCII-only. When done,
run npm run lint and npm run build, and verify the Exercise screen does not
page-scroll at innerHeight >= 800 after validating a WRONG answer.
Lesson script: curriculum/module-01/easy/<file>.md
```

---

## Part 8 - Execution sequence from 2026-07 (from here to the end)

Written after Module 1 reached Easy 17/17, Medium 17/17, Hard 7/7 drills, with
tiers and forced lesson ordering live. This sequence supersedes the coarser
milestones in Part 5 where they overlap. The gating insight from building
Module 1: IMPLEMENTATION is already delegable, AUTHORING is not - so the next
work is the five artifacts that make authoring checkable, before any Module 2
content exists.

### Phase 0 - Industrialize (before any new content; ~sessions, not months)

0.1 Commit the regression harness: scripts/validate-lessons.mjs + one fixtures
    file per lesson (correct answer + wrong answer), run as
    `npm run test:lessons`. Every future change must keep it green.
0.2 Canon as data: curriculum/module-01/<tier>/canon.json holding every number,
    role, time, and artifact name; plus scripts/lint-lessons.mjs that
    cross-checks each lesson JSON against canon and the authoring checklist
    (one primary concept, capability statement last, honest difficulty label,
    ASCII, validator config well-formed).
0.3 MODULE_AUTHORING_PLAYBOOK.md: the repeatable procedure scenario -> map
    (15-18 nodes, one true fork, one temporal loop, fan-in ordering, one
    concept per node) -> NODE_AUDIT -> canon.json -> lesson scripts -> build
    waves, with an acceptance gate per step and explicit stop-and-ask-owner
    points.
0.4 DECISION_BOUNDARIES.md: what a builder may never decide alone (doctrine,
    scenario selection, node taxonomy, new interaction types, validator
    changes, map shape).
0.5 Verification playbook: the no-scroll eval snippets and artifact-seeding
    recipes as a committed script/doc, so live verification is not tribal.

### Phase 1 - Finish Module 1 (the capstone)

1.1 Spec the artifact-import surface at ENGINE_ADDITIONS_SPEC fidelity
    (file picker -> validateAnswer per imported file; storage; UI states).
1.2 Build the solo-rebuild capstone lesson + runbook. Module 1 Hard is then
    COMPLETE and Module 1 is the finished proof of the whole pedagogy.
1.3 Module 1 wrap: decide the deferred node splits (NODE_AUDIT items 2-3),
    write the Module 1 case study (portfolio artifact), and cut a tagged
    release.

### Phase 2 - Prove the engine is domain-agnostic (Module 2)

2.1 Engine: multi-project support, specced first (project registry, per-module
    node/edge/phase data, per-module+tier storage namespacing, project
    switcher).
2.2 Author Module 2 (Beacon Invoice Desk) STRICTLY through the playbook -
    this run is as much a test of the playbook as of the module. Fix the
    playbook wherever it was ambiguous.
2.3 Module 2 Easy built and verified; Medium/Hard authored with the same
    tier method (canon per tier, judgment/design postures).
2.4 Housekeeping now due: per-module dynamic imports (bundle passed 500 kB
    with one module; it will not survive ten), and the rich-intro migration
    (bring all lessons to lesson-intake's intro dialect).

### Phase 3 - Cadence (Modules 3-9)

One module at a time, always: playbook -> owner gate on the map/audit ->
canon -> scripts -> waves -> tiers -> case study -> release. Each module also
lands its signature engine need (M3 parallel task states, M4 queue/routing UI,
M5 calendar/dependency view, M7 event/trigger simulation, M8 immutable
records, M9 fan-out preview) - each specced before built. Expected steady
state: a module per 1-2 quarters of nights-and-weekends once the pipeline is
warm; H3/H4 dates in Part 5 remain the honest outer envelope.

### Phase 4 - The summit (Module 10 + capstone mode)

Watchtower (incident response), then the final proof of transfer:
design-your-own-workflow mode - the learner gets a plain-language business
brief and builds a map, canon, and artifacts the engine validates with the
same machinery. Full-curriculum export ("everything I built") closes the
portfolio story. Optional exits (open-sourcing, client training, authoring
UI) stay optional, per the charter.

### Standing rules for every phase

- Every unit of work leaves the app demoable (no half-migrations).
- Tests and lint green before every commit; live no-scroll verification for
  any exercise-surface change.
- New engine capability = spec first, at ENGINE_ADDITIONS_SPEC fidelity.
- Owner gates: scenario choice, map shape, doctrine changes, tier curation.
- DECISION_LOG entry for anything that changes product behavior.
