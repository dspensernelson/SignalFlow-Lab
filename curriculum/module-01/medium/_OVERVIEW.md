# Module 1 Medium - Handle the Mess - Overview

Status (2026-07-02): ALL 17 LESSONS BUILT AND PLAYABLE. Module 1 is COMPLETE
across all three tiers (Easy 17, Medium 17, Hard 8).
Verified live: medium quizzes and the medium brief hold the no-scroll rule in
wrong-answer states; the brief renders with its Data Notes section.
Medium lessons live in src/data/lessons/ as `lesson-<node>-medium.json`,
resolved by the tier engine via tierLessonId (taskId + "-medium") and listed in
BUILT_LESSON_IDS_BY_TIER.medium in src/lib/progress.js. Medium progress and
artifacts use suffixed localStorage keys (signalflow_progress_medium,
signalflow_artifacts_medium). Keep ASCII-only.

## Tier posture

Easy validated VALUES; Medium validates DECISIONS. Every Medium lesson gives
the learner a judgment the Easy tier never required: which source wins, what
to do with missing data, how to survive a rule change, how to catch the
boundary case that hand-rolled automations miss. Scaffolding is reduced:
starter answers are empty shapes ("{}" or "[]"), field guides give hints but
no worked examples.

## Medium canon (single source of truth - a different, messier morning)

- Notes: two conflicting analyst notes (5:40 AM and 6:05 AM); the LATER note
  is authoritative (desk rule). Generation status stated nowhere -> null.
- Intake record: hub ERCOT, peak 204, settled 151 (corrected from the 5:40
  note's 155), generationFlag null, approvalRequired true,
  authoritativeNoteTime 6:05 AM. (Canon correction 2026-07-01: intake prices
  now MATCH the feed - the original 192/141 draft accidentally contradicted
  clean-prices.)
- Raw feed: duplicate ERCOT row; SPP decimal 98.5 with stray space; MISO row
  missing its settled value (DROPPED per desk rule); new hub WAUE.
- Clean prices: ERCOT 204/151, SPP 98.5/90, WAUE 63/58. (MISO excluded.)
- Threshold Policy v1.1.0: routine 6, escalation 14 (raised from 5/12 via an
  email chain where the first proposal was superseded; changeNote required;
  owner Risk Desk Lead, approver Desk Manager).
- References: forecast ERCOT 188, SPP 100, WAUE (no forecast - model does not
  know the new hub); prior day ERCOT 176, SPP 97, WAUE 59.
- Variance (both references required; WAUE excluded): ERCOT vsForecast 16,
  vsPriorDay 28; SPP vsForecast -1.5, vsPriorDay 1.5.
- Risk (learner computes, desk rounding = 1 decimal): ERCOT 15.9 escalate,
  SPP 1.5 normal, WAUE 6.8 routine (WAUE classifiable day-over-day even
  though excluded from variance - different steps, different requirements).
- Decision cases: day-1 +15.9 escalate; day-2 -14.0 escalate (negative
  boundary - the absolute-value bug); day-3 +13.9 routine; day-4 -5.8 routine.
- Approval: Desk Manager out of office; named delegate Deputy Desk Manager
  approves at 6:47 AM; substitution true, reason out-of-office. Deputy's ops
  note: flag the WAUE forecast gap.

## Built lessons (17 of 17)

| Node | Lesson id | The judgment it adds |
| --- | --- | --- |
| analyst-notes | lesson-analyst-notes-medium | Source authority: later-wins, nulls, superseded-note retention |
| trader-flag | lesson-trader-flag-medium | Signal lifecycle: persistence, clearing owner, fail-toward-review |
| market-intake-record | lesson-intake-medium | Source authority + explicit nulls |
| price-feed | lesson-price-feed-medium | Contract judgment: dupe vs violation vs new-key risk vs mess |
| forecast-data | lesson-forecast-data-medium | Reference gaps: diagnose, exclude, route to owner |
| prior-day-reference | lesson-prior-day-reference-medium | Coverage mechanics: self-populating vs owned; loop fragility |
| clean-price-data | lesson-clean-price-data-medium | Dedupe + drop poisoned rows |
| threshold-policy | lesson-threshold-policy-medium | Version through change + changeNote |
| variance-check | lesson-variance-check-medium | Partial computation, honest exclusion |
| risk-evaluation | lesson-risk-evaluation-medium | Derive AND classify under changed rule |
| approval-template | lesson-approval-template-medium | Amend a governed format: add delegate, v1.1.0 |
| approval-decision | lesson-approval-decision-medium | Magnitude vs direction (absolute-value bug) |
| approval-route | lesson-approval-route-medium | Delegation + substitution record |
| routine-update-path | lesson-routine-update-path-medium | Version-aware logging (flipped-outcome counterfactual) |
| prior-day-brief-template | lesson-prior-day-brief-template-medium | Template change management (Data Notes, v1.1.0) |
| morning-brief | lesson-morning-brief-medium | Assembly with exception surfacing + lineage slots |
| distribution-archive | lesson-distribution-archive-medium | Exception-aware closeout: route anomalies to owners |

## Decisions made while completing the tier

- Exceptions stay FIELDS inside existing artifacts at Medium (droppedRowHub,
  missingForecastHub in the brief and closeout records) rather than a new
  Intake Exceptions node. No map changes at this tier; revisit a first-class
  exceptions artifact only if a future module needs exception QUEUES.
- The medium morning-brief teaches lineage slots: two values (dropped hub,
  missing-forecast hub) are derived from what is ABSENT between artifacts,
  not looked up directly. Keep this pattern - it is the tier's capstone move.
- The template thread is deliberate: prior-day-brief-template-medium approves
  the Data Notes section that morning-brief-medium then renders, and
  approval-template-medium adds the delegate that approval-route-medium uses.
  Medium lessons corroborate each other the way governance artifacts should.
