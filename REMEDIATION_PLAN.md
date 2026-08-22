# Remediation Plan - from audit findings to a corrected curriculum

Date: 2026-08-22. Owner: Spenser. Status: RATIFIED (owner approved 2026-08-22),
extended the same day with Phases 4b and 5 (Ecosystem Literacy Plan).
Keep this file PURE ASCII. Use " - " instead of em-dashes.

## A and B

STATE A (verified against git and live code, 2026-08-22):
- Modules 1-3 complete and live (120 lessons); Module 4 Easy tier stranded
  on feat/module-04-relay; PR #7 (Module 1 opening arc) open since 07-07.
- 53% of lessons are jsonEditor; in 24 of 31 exact-match lessons every
  expected answer appears verbatim in the input (transcription).
- jsonPolicy validator passes a policy that violates every stated design
  constraint (probed: 18/18 checks green on garbage). Other validators
  (handoffForm, tagSource, templateSlots, jsonDeltas, artifactImport)
  are UNAUDITED.
- One domain gloss in the entire curriculum. Module 2 uses three-way
  match / tolerance / PO / receipt 17-23 times each, undefined. Module 3
  uses SLA (8 lessons), provisioning (13), escalation (9), undefined.
- Difficulty field uses 4 words for 3 tiers (Beginner/Intermediate vs
  Medium/Hard split across modules).
- NEXT_SESSION_PROMPT.md describes a pre-Module-3 world. No human has
  completed any module end to end.

STATE B:
- Every lesson answer requires a decision within a tier-budgeted giveaway
  allowance (Hard = zero). Every validator evaluates substance, proven by
  committed garbage-answer fixtures. Every domain term is taught before
  first use, enforced by lint. Module order ladders known -> unknown.
  All of the above live in `npm run check`. Docs match git. A human
  playtest of the opening module is logged. Modules 4-10 build on the
  corrected pattern under an amended playbook.

## Principle that shapes everything

Written gates were honored with total fidelity (no-scroll, ASCII,
choiceCheck cap). Verbal intent left zero trace (anti-transcription).
Therefore: NO fix in this plan is complete until it is enforced by a
script in `npm run check` or a numbered charter gate. A principle that
is not a lint is a wish.

## Phase 0 - Close the July 7 loop (owner + builder, ~half day)

0.1 Decide PR #7 now, not later. It re-storyboards Module 1's opening
    with tagSource openers - it moves in this plan's direction and
    collides with Phase 3 if left open. Review; merge or close; log.
0.2 Park feat/module-04-relay explicitly: DECISION_LOG entry "do not
    merge until Phase 1 lints pass over its lessons." Note its
    projects.json wrongly claims module-04 active; fix on rebase.
0.3 Rewrite NEXT_SESSION_PROMPT.md from verified git state.
0.4 npm audit fix; npm run check must stay green.
0.5 Script-normalize the difficulty field to one vocabulary
    (Easy/Medium/Hard) across all 120 lessons + any UI that reads it.
GATE: check green; no doc asserts anything git contradicts.

## Phase 1 - Encode the constraints (builder, 1-2 days)

1.1 Giveaway lint (DONE 2026-08-22, scripts/lint-giveaway.mjs): for exact-match
    validations, measure the fraction of expected values appearing
    verbatim in input+scenario. Budgets: Easy <= 60%, Medium <= 30%,
    Hard = 0. First run reports baseline (warn); ratchets to hard-error
    per tier as Phase 3 clears it. Wire into `npm run check`.
1.2 Glossary lint (DONE 2026-08-22, scripts/lint-glossary.mjs): each module ships
    curriculum/module-XX/glossary.json (terms it introduces, with the
    lesson that teaches each). Lint errors when a lesson uses a term
    no earlier-or-same-module glossary entry has taught. Seed term
    lists from the audit (M1: hub, $/MWh, settled; M2: PO, receipt,
    invoice, three-way match, tolerance, overcharge, duplicate, BEC;
    M3: SLA, provisioning, escalation, idempotent, degraded, loaner,
    fan-in).
1.3 Validator audit (DONE 2026-08-22, scripts/test-validators.mjs): for EVERY validation
    type, a committed wrong-but-well-formed fixture that MUST fail
    validation. jsonPolicy's garbage-policy probe becomes fixture #1.
    Types that pass garbage get documented in VALIDATOR_AUDIT.md and
    become Phase 2's worklist.
1.4 Charter amendments (owner ratifies): (a) playtest gate - a module
    is not COMPLETE until a human end-to-end run is logged; (b) the two
    lints join the standing "never weaken a check" rules; (c) the
    giveaway budget and glossary requirement are added to
    MODULE_AUTHORING_PLAYBOOK.md as authoring steps, so modules 4-10
    are born compliant.
GATE: lints + validator fixtures run in `npm run check`; baseline
committed; charter amended.

### Phase 1 measured baselines (2026-08-22)

- Validator audit: only `jsonPolicy` is hollow (11 lessons). The other EIGHT
  validators - jsonFields, jsonRows, jsonDeltas, choiceCheck, templateSlots,
  tagSource, handoffForm, artifactImport - all REJECT structurally-valid
  garbage. This narrows Phase 2 from "audit everything" to one validator.
- Giveaway baseline (share of graded values verbatim in what the learner reads):
  EASY avg 81% (15/25 fully given away), MEDIUM avg 72% (10/24), HARD avg 77%
  (6/12, all 12 over budget). The curve is not merely flat across tiers - HARD
  gives away MORE than MEDIUM. Phase 3 worst-first order comes straight from
  `npm run lint:giveaway`.
- Glossary baseline: 38 terms declared across 3 modules; 111 uses-before-teaching
  across 17 terms. Biggest offenders are cross-module: "escalation" used in 26
  lessons before module-03 teaches it, "exception" 17, "gate" 11, "duplicate" 7,
  "SLA" 4. Fix in Phase 4.2 by re-homing each term to the module where it is
  FIRST used, not where it is most central.

## Phase 2 - Make validation judge substance (builder, 2-4 days)

2.1 jsonPolicy -> simulation. Lessons supply the evidence they already
    narrate (e.g. the 84-benign / 6-overcharge variance set with PO
    sizes). Validator runs the learner's thresholds against the data
    and requires the stated outcome (84 pass, 6 caught). Deterministic,
    so it honors the no-AI-grading doctrine. ~11 jsonPolicy lessons.
2.2 Rationale fields get a citation check (must reference the decisive
    facts, e.g. "84", "6", larger-of), not prose grading. Honest about
    its weakness; logged as such.
2.3 Fix every other validator the Phase 1 audit flagged.
GATE: test-validators green MEANS every validator rejects its garbage
fixture. The tolerance-policy probe from the audit must now fail.

## Phase 3 - Retrofit content, worst first (builder, 3-5 days)

3.1 Hard tier (20 lessons): every giveaway becomes derive-from-evidence.
    The answer must be a FUNCTION of the input, not a substring. Use the
    Phase 1 lint report as the worklist (starts: escalation-path-hard,
    accounts-task-hard, approval-route-hard, intake-hard,
    price-feed-hard). Ratchet lint to hard-error at Hard tier.
3.2 Medium tier: same treatment to <= 30%.
3.3 Easy tier: mostly UNCHANGED. Transcription is a legitimate first
    rung (JSON syntax, fields, types). The defect was that it never
    faded, not that it exists.
3.4 Scaffold fading: fieldGuide attention.source spans (which quote the
    answer's location) hidden at Medium, absent at Hard.
3.5 Preserve the realWorld transfer beat on every touched lesson
    (currently 120/120 - do not regress it).
GATE: giveaway lint hard-error at Hard and Medium budgets; check green;
live no-scroll verification per standing rules on touched surfaces.

## Phase 4 - The ladder: vocabulary, then order (builder + owner, 2-4 days)

4.1 Rosetta openings, one per module: state the workflow in a domain the
    learner already owns, then swap in the real one. Beacon: the couch
    order / delivery slip / bill = three-way match. Harbor: your own
    first day = provisioning + SLA. Meridian: a household power bill's
    peak vs settled usage. NOTE: audit showed NO module is glossary-free
    (Harbor: SLA x8, provisioning x13) - all three get one.
4.2 Populate glossary.json per module; flip glossary lint to hard-error.
4.3 Reorder: Harbor -> slot 1, Beacon -> 2, Meridian -> 3. This is NOT
    just projects.json: audit and port first-module scaffolding (Harbor's
    record lessons already carry jsonExample intros - verify coverage of
    Wave A), re-point moduleSkeleton.json recurrence entries to the new
    order, verify the unlock tree, smoke the live app at both standard
    viewports.
4.4 OWNER PLAYTEST: Spenser completes the new opening module end to end;
    findings logged in DECISION_LOG; drag points fixed before Phase 5.
GATE: playtest logged; recurrence cards reference only prior modules in
the NEW order; check green; production smoke per Gate 8.

## Phase 4b - Ecosystem literacy (owner ratified 2026-08-22)

Closes the operating-layer gap: 0-1 of 120 lessons taught error handling, run
history, credentials, testing, triggers, environments, rate limits, PII, or
when-NOT-to-automate. See DECISION_LOG 2026-08-22 and
ENGINE_ADDITIONS_SPEC_OPERATIONS.md.

4b.0 SPEC AND RATIFY (DONE 2026-08-22). src/data/automationTaxonomy.json
    (nine action kinds, seven-tool roster, opsTopics, run vocabulary);
    ENGINE_ADDITIONS_SPEC_OPERATIONS.md committed BEFORE any code per Gate 4;
    amendments to AUTONOMY_CHARTER (Gate 4 exemption, Gate 2 ops mandate,
    Gate 3 one-time additive exception), LESSON_DESIGN_FRAMEWORK (no LIVE
    integrations), MODULE_AUTHORING_PLAYBOOK (Steps 2/2a/2b/7b/7c/8),
    CURRICULUM_MASTER_PLAN (ninth move + crosswalk), charters/_INDEX,
    DECISION_LOG.
4b.1 realWorld v2 (DONE 2026-08-22). Per-module curriculum/<module>/realworld-map.json keyed by
    taskId (~50 task families, not 136 lessons); one-off
    scripts/migrate-realworld.mjs, deleted after running (G2.1 precedent);
    lints `realworld-shape`, `realworld-tier-consistency`,
    `realworld-rotation` replacing the transfer-beat check; LessonTakeaway
    panel v2 (kind chip + gloss + 2-3 best-fit cards + collapsed "same move in
    the other tools" dialect strip); LessonIntro kind chip; App -> ProjectCanvas
    -> NodeDetail lessons prop and the ecosystem block moved above the 11px
    stack; ToolMapModal built from lesson data; delete the two TOOL_MAP.md
    files; LESSON_AUTHORING_TEMPLATE contract update.
4b.2 Engine. Two additive validators (connectorConfig composes handoffForm;
    runInspect is the handoffForm algorithm over a run log); two components
    (React.lazy so the LessonWorkspace chunk stays flat); LessonExercise
    branches; lint shapes; fixtures; garbage fixtures in the Phase 1.3 harness;
    giveaway lint taught both shapes; VERIFICATION_PLAYBOOK.
4b.3 Operations nodes for modules 1-3. Map edits x3 (node, archive edge,
    phase, lessonMeta, column re-spacing); moduleSkeleton `operate` stage plus
    a row for every module INCLUDING anchor module-01 in the same commit, and
    the HumanMoments "seven-stage" copy becomes data-driven; 9 lessons (3 per
    module) with canon assertions, glossary entries, fixtures; lint-map
    `ops-node` + `skeleton-row`; lint-lessons `ops-coverage`; NODE_AUDIT rows.
4b.4 OWNER PLAYTEST of one Operations node end to end, all three tiers.
    Findings logged in DECISION_LOG; drag points fixed before Phase 5.

GATE: `npm run check` green with every new rule as an ERROR; a map with no
Operations node goes RED; a v1-shaped realWorld lesson goes RED; live
wrong-answer no-scroll at 1280x800 AND 1366x650 for both new surfaces.

## Phase 5 - Resume the build (ongoing)

5.1 Un-park module-04: rebase onto main, run all new lints, fix flagged
    lessons, migrate its 16 lessons to realWorld v2, add its Operations node
    (its last column is full at 6 nodes, so place in the `routing` column and
    log the deviation) plus the Easy ops lesson, correct its projects.json
    status claim, then build Medium/Hard under the amended playbook. One PR,
    owner merges. Do this in ONE session immediately after 4b.3 - projects.js,
    the App loaders, moduleSkeleton, and the new lints all collide on rebase.
5.2 Modules 5-10 proceed only under the amended playbook (Rosetta step,
    glossary step, giveaway budgets, substance validators, playtest
    gate).
5.3 HORIZON (spec before any build): artifact chaining - lesson N+1
    consumes the learner's real artifact from lesson N. Write
    SPEC_ARTIFACT_CHAINING.md first; it must resolve accepted-value
    canonicalization (variance like "$187" vs "187/MWh" propagating
    downstream), localStorage state and re-runs, and unlock-tree
    branches. This is the differentiating feature and the riskiest;
    it does not start until the spec survives a red-team pass.

## Sequencing rules

- Phase 0 before everything (PR #7 collides with Phase 3 otherwise).
- Phase 1 before Phases 2-4 (encode the constraint before fixing to it).
- Phase 4.3 (reorder) after 4.1-4.2 (vocabulary makes any order safer;
  reorder without the glossary work just moves the problem).
- Module 4 does not merge before Phase 1 exists, and not before 4b.1 and
  4b.2 (otherwise it imports the v1 realWorld shape and lands with no
  Operations node).
- Phase 4b after Phases 0-2 (the giveaway and glossary lints must exist first,
  so the two new interaction types are born covered rather than retrofitted).
- 4b.1 and 4b.2 may overlap across two sessions (disjoint files); 4b.3 needs
  both.

## Effort

Phases 0-3: roughly one focused week of sessions. Phase 4: 2-4 days
plus the owner playtest. Total to State B (through Phase 4): ~2-3 weeks
part-time. Phase 5 is the normal build cadence resumed.

## Decision log entries this plan requires from the owner

1. Ratify or amend this plan (this file moves PROPOSED -> RATIFIED).
2. PR #7: merge or close.
3. Charter amendments in 1.4 (playtest gate, new lints as standing rules).
4. The reorder in 4.3 (it changes the public product).
5. DONE 2026-08-22: Gate 4 exemption for connectorConfig + runInspect; the
   Operations node mandate (Gate 2); the one-time additive map change to
   shipped modules 1-3 (Gate 3); retiring TOOL_MAP.md in favor of the
   generated in-app view; the "no LIVE integrations" clarification.
