# Autonomy Charter

Standing owner approval for autonomous, unattended building of the full
10-module curriculum. Ratified 2026-07-02 by explicit owner instruction:
"I don't need to be involved but my idea does need to live on... let it
loose and it builds everything." This document is the owner's intent made
durable: it converts every gate in DECISION_BOUNDARIES.md into either a
PRE-CLEARED path, a SELF-SERVE protocol, or a PROHIBITION - so a builder
with no access to the owner can proceed indefinitely without inventing
product decisions. DECISION_BOUNDARIES.md remains in force; this charter is
the standing answer to its "stop and ask" for the work chartered here.

Keep this file ASCII-only. Amending THIS file is prohibited (see gate 9).

---

## 1. The North Star (the idea that must live on)

Every decision not covered by a rule below is made by asking which option
best serves these, in order:

1. TEACH INVARIANTS, NOT TOOLS. Every lesson exists to make the learner
   better at automation in ANY tool: one primary concept per lesson, a
   theory with a recognition cue, a capability statement about the system.
2. ARTIFACTS ARE PROGRESS. Learners produce named business objects a
   workflow visibly consumes. No badges, points, streaks, or gamification.
3. HONESTY OVER POLISH. Missing data gets nulls, degraded runs say so,
   quiet paths log, exceptions surface in deliverables. The curriculum
   practices what it teaches.
4. THE MAP IS THE CURRICULUM. Enterprise process workspace, not a course
   site. Local-first forever: no backend, no login, no telemetry, no AI
   grading, deterministic validation only.
5. FINISHED-FEELING ALWAYS. Every commit leaves the app demoable; every
   module ships complete with a case study before the next begins. This is
   a portfolio: depth and finish beat speed.

## 2. Gate-by-gate standing decisions

Numbering follows DECISION_BOUNDARIES.md "Owner-only decisions".

GATE 1 - Doctrine: FROZEN. PRODUCT_DOCTRINE.md, the no-scroll rule, the
artifact model, and the node taxonomy are not changed by anyone, including
under this charter. A situation that seems to require a doctrine change
goes to the PARK protocol (section 4), never to a workaround.

GATE 2 - Scenario selection and charters: PRE-CLEARED. The nine charters in
curriculum/charters/ are ratified. Build them in numeric order, one module
at a time. Within a ratified charter a builder MAY refine node names, add
or merge 1-2 nodes, and adjust lesson-type assignments at the map step
(logged in DECISION_LOG.md); a builder may NOT change the org, the role
list, the deliverable, the signature concept cluster, the fork's meaning,
or the temporal loop's meaning. No eleventh module: when module 10 ships,
the build phase of this charter is complete and the builder STOPS.

GATE 3 - Map shape: SELF-SERVE. A new module's map is approved when it
(a) conforms to its charter's spine and shape class, (b) passes
`npm run lint:map`, and (c) its derivation from the charter is logged in
DECISION_LOG.md. Editing an already-shipped module's map remains
prohibited except additive bug fixes, logged.

GATE 4 - New interaction types and validators: SELF-SERVE WITH SPEC AND
BUDGET. Existing validators' matching rules stay frozen forever. A new
interaction type or validator requires: a spec at ENGINE_ADDITIONS_SPEC.md
fidelity committed BEFORE the implementation; additive-only code; fixtures
and lint coverage in the same PR; and a budget of AT MOST ONE new
interaction type per module (the charters already flag the likely ones).
If a concept seems to need more, express it with existing types instead -
constraint is the design tool here.

GATE 5 - Tier curation: SELF-SERVE per each charter's tier-posture section,
logged. Defaults inherited from Module 1: easy covers every node; medium
covers every node with judgment-first postures; hard is a curated 6-8
design/failure drill set (inspection nodes usually excluded); every module
ends its hard tier with drills, not filler.

GATE 6 - Canon: SELF-SERVE before ratification, CONTROLLED after. A
module's canon is ratified when its lessons ship. After that, only
contradiction fixes are allowed, logged in DECISION_LOG.md with canon.json
updated in the same commit. Canon must satisfy the arithmetic rule: every
derived number is registered as a derivation in canon.json so the lint
recomputes it.

GATE 7 - Storage/progress semantics: PRE-CLEARED SPECS ONLY. Exactly two
changes are authorized: SPEC_MULTI_PROJECT.md and SPEC_ARTIFACT_IMPORT.md
(both committed and pre-approved). Implement them as written; deviations
that touch storage keys, the progress model, or gating behavior beyond
those specs are PROHIBITED - park instead.

GATE 8 - Outward-facing: PROHIBITED, with two exceptions: pushing to the
existing origin remote, and opening/updating PRs on the existing GitHub
repo (one PR per module, using the module report format in
MODULE_AUTHORING_PLAYBOOK.md step 8). No deploys, no new remotes, no
publishing, no external services. PRs may be opened but NOT merged by the
builder; unmerged PRs never block the next module (branch each module off
the previous module's branch).

GATE 9 - This charter: a builder may never amend AUTONOMY_CHARTER.md,
DECISION_BOUNDARIES.md, or PRODUCT_DOCTRINE.md. If reality contradicts
them, PARK the conflict.

## 3. The tie-breaker rule (when committed sources disagree)

Precedence, highest first:
1. This charter and DECISION_BOUNDARIES.md
2. The code and its checks (validators.js behavior, canon.json, lint output)
3. The ratified charter of the module in question
4. Tier _OVERVIEW.md files (canon prose)
5. MODULE_AUTHORING_PLAYBOOK.md / VERIFICATION_PLAYBOOK.md / specs
6. README.md and LESSON_DESIGN_FRAMEWORK.md sections 6-7 (status docs)
7. Older DECISION_LOG.md entries (history loses to all of the above)

On finding a disagreement: fix the LOWER-precedence source to match the
higher one, log it, and move on. Never leave a known contradiction
uncommitted.

## 4. The PARK protocol (what replaces "ask the owner")

When blocked by a prohibition, a genuine ambiguity this charter does not
resolve, or a repeated failure (see section 5):

1. Write the block into OPEN_QUESTIONS.md: what you were doing, the exact
   decision, 2-3 options with a recommendation, and what is parked.
2. Commit it. OPEN_QUESTIONS.md is the owner's asynchronous inbox.
3. Move to the next unblocked work item (another lesson, tier, wave, or
   module step). If an entire module is blocked, proceed to the next
   module's step 1 and note the dependency.
4. Never resolve a parked item by weakening a check, editing a frozen doc,
   or quietly guessing.

## 5. Failure and quality protocol

- `npm run check` green before EVERY commit, no exceptions. A red check is
  fixed by fixing the work, never by editing the check to pass (tooling
  improvements that STRENGTHEN checks are welcome).
- Live no-scroll verification per VERIFICATION_PLAYBOOK.md for every new or
  changed exercise surface, wrong-answer state first.
- Three failed attempts at the same problem = PARK it with notes rather
  than thrash.
- Every module ends with the full playbook Step 8 wrap (playthrough, docs
  sync, case study, release tag, PR with module report) before the next
  module's Step 1 begins.
- Clear all test progress/artifacts from localStorage after live testing.

## 6. Scope of this charter

Covers: Module 1 completion (capstone per SPEC_ARTIFACT_IMPORT.md, node-
split decisions RESOLVED as "keep single nodes, clarified in copy" - now a
settled decision, not an open one), modules 2-10 per their charters, the
engine work in the two pre-approved specs plus per-module budget under
gate 4, and all documentation/testing that serves those. Anything else -
new products, redesigns, integrations, deployment - is out of scope and
parks.
