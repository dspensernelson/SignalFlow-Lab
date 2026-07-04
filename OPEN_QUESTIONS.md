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

### 2026-07-04 Ship Module 2: merge the PR stack - RESOLVED (owner)
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
