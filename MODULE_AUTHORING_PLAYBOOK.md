# Module Authoring Playbook

The repeatable procedure that turns a scenario name (e.g. "Beacon Invoice
Desk") into a playable module. Module 1 was built by inventing this method;
every later module FOLLOWS it. Work the steps in order; each ends with a GATE
that must pass before the next step starts. Steps marked OWNER GATE stop for
the product owner - a builder never decides those alone (see
DECISION_BOUNDARIES.md).

AUTONOMOUS MODE (2026-07-02): under AUTONOMY_CHARTER.md the owner gates are
pre-answered - Step 1 charters for modules 2-10 are ratified in
curriculum/charters/; Step 2 map approval = charter conformance + `npm run
lint:map` + a DECISION_LOG entry; Step 8's owner review = the PR module
report (.github/PULL_REQUEST_TEMPLATE.md), opened but not merged by the
builder. Everything else in this playbook applies unchanged.

Keep this file ASCII-only. Companion docs: CURRICULUM_MASTER_PLAN.md (what
each module teaches), LESSON_AUTHORING_TEMPLATE.md (per-lesson contract),
LESSON_DESIGN_FRAMEWORK.md (pedagogy), ENGINE_ADDITIONS_SPEC.md (interaction
contracts), VERIFICATION_PLAYBOOK.md (how to prove it works).

---

## Step 1 - Scenario charter (OWNER GATE)

Write one page: the fictional org, the recurring deliverable, the deadline
pressure, the 4-8 named roles (people AND lists/channels - never invent more
mid-module), and the module's SIGNATURE CONCEPT CLUSTER from
CURRICULUM_MASTER_PLAN.md Part 2 (what this module teaches that no earlier
module did).

GATE: owner approves the charter. The scenario, roles, and signature cluster
are frozen for the module.

## Step 2 - Workflow map design (OWNER GATE)

Design the node graph. Guardrails, learned from Module 1:

- 15-18 nodes across 5 phases (fewer reads thin; more will not fit the canvas).
- Node taxonomy: source / reference / artifact / process / decision / handoff
  / output / archive. Every node is a THING or an ACTION, never both
  (PRODUCT_DOCTRINE taxonomy rule).
- Exactly ONE true fork (a decision with two downstream branches) and exactly
  ONE temporal loop (an archive-type node feeding a reference-type node
  across runs). More of either confuses the map; zero of either loses the
  routing and loop lessons.
- Every node teaches ONE concept no other node in the module owns. If two
  nodes share a concept, merge or re-scope them.
- Respect fan-in ordering: high-fan-in nodes (the assembly output) sit late;
  sources and references sit early.
- Draft the UNLOCK TREE alongside the map: one intro lesson (usually the
  first source) fanning out 2-3 lessons per completion, converging with the
  workflow's own dependencies. The map DAG and the unlock tree should rhyme
  but need not be identical (the unlock tree is pedagogy, the map is truth).

Deliverables: nodes/edges/phases JSON drafts + the LESSON_PREREQS tree.
GATE: owner approves the map shape and unlock tree.

### Step 2a - Recurrence map (one row per module)

Add this module's entry to src/data/moduleSkeleton.json: `org`, `deliverable`,
and a `map` naming the ONE representative node label for each of the seven
shared skeleton stages (intake, reference, transform, decision, handoff,
assembly, archive). This is what powers the once-per-module "you have seen this
shape before" card (module-02+), which lines the new module up against the
Meridian anchor stage for stage. Use the map to sanity-check the design: if a
stage has no clean representative node, the map is probably missing an invariant
(fix the map, not the card). module-01 (Meridian) is the anchor and shows no
card.

## Step 3 - Node audit

Write the module's NODE_AUDIT-style document (copy Module 1's NODE_AUDIT.md
structure): per node - type, thing/action, lesson type (inspection /
interpretation / build / transformation / decision / handoff / assembly /
governance), concepts, learner practice, lab version, dependencies,
downstream reuse, governance note, open risk. Close with the summary matrix,
the artifact build order, and the full learner path.

GATE: every node has exactly one lesson type and one primary concept; the
lesson-type spread covers at least 6 of the 8 types; the audit lists which
nodes get medium/hard variants (hard is a CURATED set - inspection nodes
usually do not deepen into design work).

## Step 4 - Canon

Author the numbers BEFORE any lesson copy. Three artifacts:

1. Per-tier prose canon in curriculum/<module>/<tier>/_OVERVIEW.md: every
   value, role, time, threshold, and artifact name, plus the tier's story
   spine (the clock).
2. curriculum/<module>/canon.json: machine-checkable assertions for every
   number that appears in MORE THAN ONE lesson (see Module 1's file for the
   path syntax). This is what prevents the drift that bit Module 1 twice.
3. Difficulty postures: Easy = operate the pattern (values are given);
   Medium = handle the mess (its OWN messier canon: conflicts, nulls, gaps,
   changed rules); Hard = own the design (drills; validators check shape +
   governance, values are the learner's choice).

Canon rules learned the hard way:
- Any value stated by two sources (a note and a feed) must AGREE unless the
  disagreement IS the lesson - and then the resolution rule must be stated.
- Derived numbers must actually derive: recompute every pct/delta by hand.
- Boundary cases are deliberate: include one exactly-at-threshold value and
  one negative/large-magnitude value per rule being taught.
- Tiers are separate universes but reuse the same roles and artifact names.

GATE: canon.json assertions written; a second pass re-derives every computed
value; the owner spot-checks the story spine.

## Step 5 - Lesson scripts

One script file per lesson in curriculum/<module>/easy/ following Module 1's
format exactly: header (lesson type, interaction, validator, artifact,
difficulty, clock, build wave), THEORY (invariant, mental-model shift,
recognition cue), condensed artifact + learning contracts, the COMPLETE
lesson JSON, wiring notes, acceptance checklist. The lesson JSON must be
paste-ready - a builder transcribes, never invents.

Choose validators in this order: existing six (jsonFields, jsonPolicy,
jsonRows, jsonDeltas, choiceCheck, templateSlots) > new validator (needs an
ENGINE_ADDITIONS_SPEC-grade spec + owner approval). Reuse quirks are
documented in ENGINE_ADDITIONS_SPEC.md section 4 - read it before writing
validation blocks.

GATE: scripts complete for the tier; every script's lesson JSON passes a
dry-run of the authoring checklist in LESSON_AUTHORING_TEMPLATE.md.

## Step 6 - Build waves

Split lessons into waves: Wave A = no engine changes, Wave B+ = per new
engine capability. One work session per lesson or small batch. Per lesson:

1. Create src/data/lessons/<id>.json from the script (transcribe exactly).
2. Register: App.jsx import + LESSONS entry; BUILT_LESSON_IDS_BY_TIER in
   src/lib/progress.js; node taskId (easy) - tier variants follow the
   `<taskId>-<tier>` naming convention.
3. Add the lesson's fixture to scripts/lesson-fixtures.json (correct +
   wrong answer). choiceCheck lessons need no fixture.
4. Add canon.json assertions for any shared numbers the lesson states.
5. Run `npm run check` (eslint + lesson lint + lesson tests + build). All
   green before commit.

GATE per wave: check green, plus live verification per VERIFICATION_PLAYBOOK
(the no-scroll rule in the wrong-answer state is NON-NEGOTIABLE and only
provable in a browser).

## Step 7 - Tier passes

Medium and Hard repeat steps 4-6 with their own canon and postures. Hard is
curated: pick the 6-8 nodes whose content deepens into design/failure work;
log the curation decision in DECISION_LOG.md.

### Step 7a - Solo-rebuild capstone (MANDATORY)

Every module MUST ship exactly one Hard-tier solo-rebuild capstone. It is not
optional and it is not a normal lesson: it is the proof the learner can rebuild
the module's spine WITHOUT the app.

- Shape: an `artifactImport` lesson that asks the learner to rebuild the module's
  four spine artifacts (extract, normalize/dedupe, derive/reconcile, decide) in
  any tool of their choice and import each one. Mirror the reference
  implementations `lesson-approval-decision-hard` (Module 1) and
  `lesson-match-decision-hard` (Module 2).
- Attach it to the module's decision-fork node (the late node where the run is
  proven trustworthy), as the Hard-tier variant of that node's task.
- Each imported file is graded by the SAME validator that graded it in its
  easy-tier lesson - the acceptance bar does not move. Add a fixtures entry
  (correct + wrong) so `test:lessons` exercises the real validator.
- The capstone still carries a `takeaway.realWorld` beat like every lesson.

### Step 7b - Interaction budget (SPEND-OR-JUSTIFY)

Each module has an interaction-type budget: it should SPEND all four exercise
types (choiceCheck, jsonEditor, templateSlots, artifactImport) across its tiers,
or JUSTIFY in DECISION_LOG.md why a type is absent. A module that reuses only
one or two interaction types is a design smell - variety is what keeps the
recurring workflow shape from feeling like a worksheet. The artifactImport
budget is always spent by the mandatory Step 7a capstone.

## Step 8 - Module wrap (OWNER GATE)

- Full-path playthrough on every tier (VERIFICATION_PLAYBOOK end-to-end
  recipe).
- Docs sync: README status, LESSON_DESIGN_FRAMEWORK sections 6-7 (the
  living handoff), DECISION_LOG entries, tier overviews marked complete.
- Write the module case study (portfolio artifact).
- Tag a release. The app must be demoable before the next module starts.

---

## Failure modes this playbook exists to prevent

Observed while building Module 1 - do not repeat:

1. CANON DRIFT: two lessons stating different values for the same fact
   (intake prices vs feed prices). Prevented by step 4 + canon.json.
2. TIMELINE CONTRADICTIONS across lessons meant to share a morning.
   Prevented by the story spine + declaring which lessons share an arc.
3. VALIDATOR MISMATCH: authoring validation a validator cannot express
   (arrays in jsonPolicy nonEmpty, booleans outside approvalRequired in
   jsonFields). Prevented by ENGINE_ADDITIONS_SPEC section 4 + fixtures.
4. NO-SCROLL VIOLATIONS: every new exercise surface shipped over 800px on
   its first draft. Prevented by budgeting copy small and verifying the
   WRONG-ANSWER state live before commit.
5. SILENT PRODUCT DECISIONS: a builder inventing roles, nodes, or rules
   mid-lesson. Prevented by the charter freeze + DECISION_BOUNDARIES.md.
