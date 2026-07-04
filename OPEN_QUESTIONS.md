# Open Questions - the owner's asynchronous inbox

Parked items per AUTONOMY_CHARTER.md section 4. A builder adds an entry
when blocked by a prohibition or an ambiguity the charter does not resolve,
then moves to unblocked work. The owner reviews at leisure; answered items
get their resolution logged in DECISION_LOG.md and are removed from here.

Entry format:

```
## [date] Short title
- Doing: what was in progress
- Blocked on: the exact decision
- Options: 2-3, with a recommendation
- Parked: what work is waiting on this
```

## 2026-07-04 main does NOT actually contain the reviewed history (SHIP BLOCKED)
- Doing: queue step 0 - ship main, smoke-test the live URL, add it to README.
- Blocked on: git reality contradicts the recorded state. `git ls-remote origin
  main` returns 792c8b2 "Initial commit" - the same as the very first commit.
  All ~41 reviewed commits (G0-G3, Modules 1-2) live ONLY on branch
  module-02-beacon, and PRs #1, #2, #3 are ALL still OPEN against main. The
  RESOLVED note below and the builder prompt both state the stack was
  fast-forwarded/merged to main, but that never landed on origin. Merging is an
  OWNER-only action (Gate 8: "merging remains an owner action"; standing rule
  "never self-merge"), so the builder cannot complete it. Deploying now would
  ship the empty initial commit, not the product.
- Options:
  1. Owner merges the stack to main - fast-forward main to the module-02-beacon
     tip (main is a strict ancestor, so it is a clean FF), or merge PRs
     #1 -> #2 -> #3 in order. RECOMMENDED: it is exactly what the RESOLVED note
     already intended; nothing else changed.
  2. Owner amends Gate 8 to delegate this one fast-forward push to the builder.
     Not recommended - reopens a frozen gate for a one-time action.
  3. Leave main at the initial commit and never deploy. Not recommended - real
     users would get an empty MVP.
- Parked: all of queue step 0 (production deploy, live-URL smoke test at
  1280x800 + 1366x650, README live URL). Steps 1 (anti-slop pass) and 2
  (Module 3) are branch-local on module-02-beacon and do NOT depend on the
  deploy, so work continues there now. Run step 0 as soon as main carries the
  reviewed history.

(No other open questions at this time.)

## 2026-07-04 Anti-slop: approve new interaction type(s) (OWNER GATE)
- Doing: queue step 1A - break the choiceCheck monopoly (currently module-01
  28.6% and module-02 47.5% choiceCheck; combined ~38%). Spec written at
  ENGINE_ADDITIONS_SPEC fidelity: ENGINE_ADDITIONS_SPEC_INSPECTION_HANDOFF.md,
  proposing two ADDITIVE deterministic interaction types - `tagSource` (tag
  which source spans are which fields, for inspection nodes) and `handoffForm`
  (capture the who/what/when of a handoff, for handoff nodes).
- Blocked on: the work order makes a new interaction type an OWNER GATE
  (spec-then-park), and Gate 4 also budgets AT MOST ONE new interaction type per
  module. Need the owner to approve (a) whether to build new type(s) at all,
  (b) which - tagSource, handoffForm, or both, and (c) if both, whether to waive
  the one-per-module Gate 4 budget for the anti-slop initiative (they target two
  different node kinds and span modules).
- Options:
  1. Approve BOTH with a budget note "anti-slop interaction types are exempt
     from the one-per-module cap; still one NEW concept per module thereafter."
     Recommended - gives inspection AND handoff an active alternative, the
     fastest path to the ~25% cap.
  2. Approve ONE now (tagSource has the bigger effect: inspection nodes are the
     most numerous choiceCheck users), build the other later under a normal
     per-module budget.
  3. Approve NEITHER; hit the cap using only existing types (jsonEditor/
     templateSlots/artifactImport) for inspection/handoff nodes. Cheapest, but
     the quiz-feel critique is only partly addressed.
- Parked: building either component/validator (spec is ready to implement on
  approval). NOT parked and proceeding now: the map-gate choiceCheck cap
  (grandfathering module-01/02, erroring for module-03+) and Module 3, which can
  meet the cap with existing types under option 3 if approval does not arrive.

(No further open questions at this time.)

---

## RESOLVED

### 2026-07-04 Ship Module 2: merge the PR stack - RESOLVED (owner) [SEE OPEN ABOVE]
NOTE 2026-07-04 (builder): this resolution was recorded as done, but git shows
the merge never landed on origin/main (still at the initial commit, all PRs
still OPEN). Re-opened as the SHIP BLOCKED question above; the merge is still
pending an owner action.

The owner authorized the merge. Resolution: the stack was perfectly linear
(main a clean ancestor of module-02-beacon, all PRs MERGEABLE/CLEAN), so PRs
#2 and #3 were retargeted to base main and main was fast-forwarded to the
module-02-beacon tip - all reviewed history landed on main with no merge
commits, and all three PRs closed as merged. Recorded in DECISION_LOG
2026-07-04.

### 2026-07-04 Ratify the Gate 8 deploy amendment - RESOLVED (owner)
The owner ratified option 1: the builder may deploy the app to the existing
Vercel project from main only, after a merge, when `npm run check` is green
on main, followed by the production smoke test and a log entry. AUTONOMY_
CHARTER gate 8 amended accordingly.
