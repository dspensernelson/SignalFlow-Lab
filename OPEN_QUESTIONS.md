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

## 2026-07-04 Ship Module 2: merge the PR stack (OWNER ACTION)
- Doing: G3 ship phase. All build/verify work for the Go-Live review and Module
  2 is complete on branch module-02-beacon and pushed; `npm run check` is green.
- Blocked on: merging the stacked PRs is an outward-facing OWNER action (Gate 8
  in the governance gates; the charter reserves deploy and PR-merge to the
  owner). A builder may push and open/update PRs but may not self-merge.
- Options:
  1. Owner merges the stack in order #1 -> #2 -> #3 (recommended - preserves the
     reviewed layering: Go-Live foundation, then doctrine, then Module 2).
  2. Owner squash-merges the branch as a single commit (loses the phased
     history but is faster).
  Recommendation: option 1.
- Parked: production deploy waits on this merge. No deploy happens until the
  owner acts.

## 2026-07-04 Ratify the Gate 8 deploy amendment (OWNER ACTION)
- Doing: G3 ship phase. The build is demoable and code-split; the only thing
  between it and a live deploy is authority.
- Blocked on: the current Gate 8 wording prohibits outward-facing actions
  (including deploy) except push and opening/updating PRs. Deploying Module 2
  needs the owner to ratify a narrow amendment that authorizes deploy after the
  PR stack merges.
- Options:
  1. Owner ratifies "builder may deploy the merged main after the PR stack lands
     and check is green" (recommended - unblocks future modules too).
  2. Owner keeps deploy fully manual and runs it themselves each release.
  Recommendation: option 1, scoped to green-check merged main only.
- Parked: the actual deploy. Until ratified and merged, the builder stops here.
