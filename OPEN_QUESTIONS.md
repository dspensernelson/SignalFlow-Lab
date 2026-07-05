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

(No open questions at this time.)

---

## RESOLVED

### 2026-07-05 Ship main: merge the PR stack - RESOLVED (owner, ACTUALLY LANDED)
The owner chose "ship it now" (AskUserQuestion, PM session). This time the
merge really landed on origin/main - verify with `git ls-remote origin main`
(no longer 792c8b2). Mechanic: all three PRs retargeted to base main; main
fast-forwarded to the module-02-beacon tip (main was a strict ancestor, so a
clean FF, no merge commits); all reviewed history (Modules 1-2, G0-G3,
anti-slop) now on main; PRs #1/#2/#3 closed as merged. See DECISION_LOG
2026-07-05. Remaining step-0 work (production smoke test on the live URL at
1280x800 + 1366x650, README live URL) belongs to the builder now that main
carries the product. NOTE: the earlier (2026-07-04) "merged to main" record
was FALSE - the merge had not landed; this entry supersedes it.

### 2026-07-05 Anti-slop: new interaction types - RESOLVED (owner: APPROVE BOTH)
The owner approved BOTH `tagSource` and `handoffForm`
(ENGINE_ADDITIONS_SPEC_INSPECTION_HANDOFF.md), with a Gate 4 budget note:
anti-slop interaction types are exempt from the one-per-module cap (they
target two different node kinds and serve the whole curriculum); the normal
"one new concept per module" budget resumes after these two. The builder may
implement both per the spec and use them in Module 3 to meet the choiceCheck
cap. See DECISION_LOG 2026-07-05.

### 2026-07-04 Ratify the Gate 8 deploy amendment - RESOLVED (owner)
The owner ratified option 1: the builder may deploy the app to the existing
Vercel project from main only, after a merge, when `npm run check` is green
on main, followed by the production smoke test and a log entry. AUTONOMY_
CHARTER gate 8 amended accordingly.

### 2026-07-04 Ratify the Gate 8 deploy amendment - RESOLVED (owner)
The owner ratified option 1: the builder may deploy the app to the existing
Vercel project from main only, after a merge, when `npm run check` is green
on main, followed by the production smoke test and a log entry. AUTONOMY_
CHARTER gate 8 amended accordingly.
