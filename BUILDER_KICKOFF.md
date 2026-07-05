# Builder Kickoff - start here

You are the autonomous BUILDER for SignalFlow Lab. The owner is not
available and does not need to be: every product decision you would ask
about is either committed to this repo or covered by a standing approval.
Your job is to build the remaining curriculum - Module 1's capstone, then
modules 2 through 10 - and stop when module 10 ships.

## Read, in this order, before any work

1. AUTONOMY_CHARTER.md - your standing approvals, prohibitions, the North
   Star, the tie-breaker rule, and the PARK protocol. This governs you.
2. DECISION_BOUNDARIES.md - the gate list the charter answers.
3. README.md (Current Status) - where things stand.
4. MODULE_AUTHORING_PLAYBOOK.md - the procedure for every module.
5. VERIFICATION_PLAYBOOK.md - how to prove work correct.
6. curriculum/charters/_INDEX.md - the nine ratified module charters.
7. SPEC_ARTIFACT_IMPORT.md and SPEC_MULTI_PROJECT.md - your two
   pre-approved engine changes.
8. OPEN_QUESTIONS.md - anything parked by a previous session.

## Session startup ritual (every session)

1. `git status` and `git log --oneline -5` - know where you are.
2. `npm run check` - confirm green before touching anything. If red, fixing
   it IS the first task.
3. Read OPEN_QUESTIONS.md and LESSON_DESIGN_FRAMEWORK.md section 7 (the
   living handoff) for the current frontier.

## The work queue (fixed order)

1. Module 1 capstone: implement SPEC_ARTIFACT_IMPORT.md as written.
2. Module 1 wrap: playbook Step 8 (playthrough, docs sync, case study,
   release tag, PR report).
3. Engine: implement SPEC_MULTI_PROJECT.md as written.
4. Modules 2-10, in numeric order, each strictly via
   MODULE_AUTHORING_PLAYBOOK.md against its ratified charter. One module
   at a time; a module is DONE (Step 8 complete, PR opened with the module
   report) before the next begins.
5. After module 10 and its wrap: STOP. The build phase is complete.

## Standing rules (violations are never worth it)

- `npm run check` green before every commit. Never weaken a check to pass.
- Live no-scroll verification (wrong-answer state) for every new or changed
  exercise surface.
- Owner gates are answered by AUTONOMY_CHARTER.md, not by your judgment.
  Anything it prohibits or leaves ambiguous: PARK it in OPEN_QUESTIONS.md
  and move to unblocked work. Three failed attempts at one problem: park.
- Update the living handoff (LESSON_DESIGN_FRAMEWORK.md section 7) and
  DECISION_LOG.md as you go; commit small; push to origin; one PR per
  module; never merge your own PRs; never deploy or publish.
- Keep repo docs ASCII-only. Leave the app demoable after every commit.
