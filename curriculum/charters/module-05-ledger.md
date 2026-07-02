# Module 5 Charter - Ledger Month-End Close (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Ledger Retail closes its books monthly. The close package is due to the
Controller by end of Workday 5, and every task in it has predecessors: you
cannot reconcile cash before the bank feed posts, cannot book adjustments
before reconciliations flag them, cannot certify before sign-offs land.
The learner builds close automation where TIME AND DEPENDENCIES are the
material: calendars as code, dependency chains, and controls that prove who
approved what.

## The deliverable

`close-package.md` - the Workday-5 close package: reconciliation results,
adjustments booked with reasons, sign-offs captured, exceptions carried
forward - certified by the Controller.

## Named roles (FIXED - never invent more)

Staff Accountant (works reconciliations), Senior Accountant (reviews and
signs), Controller (certifies; owns the close calendar), FP&A Analyst
(consumes the package), Treasury Desk (owns the bank feed), Finance DL
(receives the package). Auditors appear only as a later consumer, never an
actor.

## Signature concept cluster (new here)

Close calendars as dependency graphs (task X waits on task Y), workday-
relative scheduling, reconciliation as a control, materiality-driven
adjustment decisions, segregation of duties (preparer cannot be reviewer),
sign-off chains as records.

## Recurring concepts (deepened)

Baselines (prior period), thresholds (materiality echoes M1), version-aware
logging, handoffs, assembly, archive loops.

## Draft map spine

Phases: Calendar and Prep -> Reconciliation -> Adjustments -> Review and
Sign-off -> Package and Carryforward.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| trial-balance | source | inspection | The TB extract; period cutoff |
| bank-feed | source | inspection | External feed; posting lag |
| close-calendar | reference | governance | The dependency graph with workday deadlines |
| prior-period-balances | reference | inspection | Opening balances = last close's archive |
| recon-policy | reference | governance | Unreconciled-difference thresholds |
| cash-recon | artifact | transformation | Book vs bank; aging the differences |
| accrual-recon | artifact | transformation | A second recon; same discipline, new account |
| variance-analysis | process | transformation | Period-over-period movements vs expectations |
| materiality-decision | decision | decision | Adjust now vs pass with disclosure note |
| adjustment-entries | artifact | build | Journal entries with reason and preparer |
| passed-items-log | handoff | handoff | The quiet path: immaterial items still logged |
| signoff-route | handoff | handoff | Preparer -> reviewer chain; SoD enforced |
| review-checklist | reference | governance | What a reviewer must attest to |
| close-package | output | assembly | The Workday-5 package |
| controller-certification | handoff | handoff | Final certification captured |
| close-archive | archive | handoff | Retention; seeds next period's openings |

(16 nodes.)

## The fork

materiality-decision: difference at or above materiality -> adjustment-
entries; below -> passed-items-log. Boundary teaching: materiality is a
governed number, exactly-at adjusts, and passed items ACCUMULATE - three
immaterial items can sum past materiality (the aggregation trap).

## The temporal loop

close-archive -> prior-period-balances: this close's certified numbers are
next period's openings. The strongest version of the loop yet - the entire
next run stands on it.

## Unlock root and early branches

Root: trial-balance. Fans to bank-feed + close-calendar; recon branch and
calendar/policy branch converge at materiality-decision.

## Tier postures

- Easy: two reconciliations, one clean adjustment, sign-offs land on time.
- Medium: a bank item that will not clear (aging judgment), a preparer
  attempting self-review (SoD block), a calendar dependency slipping a day.
- Hard (curated drills): design materiality from account history; the close
  when the bank feed dies on Workday 2 (degraded close, estimated cash);
  the aggregation trap drill; retention design for workpapers (audit floor).

## Engine needs (self-serve under AUTONOMY_CHARTER)

None expected beyond existing types. The dependency-calendar lesson should
be attempted with jsonDeltas (task/dependsOn/workday rows) before any new
type is considered.

## Canon guidance

Amounts in whole dollars; workday-relative dates (WD1-WD5); account names
from a fixed five-account list; materiality a single dollar figure. Cross-
lesson numbers into curriculum/module-05/canon.json.
