# Module 1 Medium - Handle the Mess - Overview

Status (2026-07-01): 7 of 17 lessons BUILT and playable; 10 remain to author.
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
- Intake record: hub ERCOT, peak 192, settled 141 (corrected from 145),
  generationFlag null, approvalRequired true, authoritativeNoteTime 6:05 AM.
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

## Built lessons (7)

| Node | Lesson id | The judgment it adds |
| --- | --- | --- |
| market-intake-record | lesson-intake-medium | Source authority + explicit nulls |
| clean-price-data | lesson-clean-price-data-medium | Dedupe + drop poisoned rows |
| threshold-policy | lesson-threshold-policy-medium | Version through change + changeNote |
| variance-check | lesson-variance-check-medium | Partial computation, honest exclusion |
| risk-evaluation | lesson-risk-evaluation-medium | Derive AND classify under changed rule |
| approval-decision | lesson-approval-decision-medium | Magnitude vs direction (absolute-value bug) |
| approval-route | lesson-approval-route-medium | Delegation + substitution record |

## Remaining to author (10) - design notes

- analyst-notes / trader-flag / price-feed / forecast-data /
  prior-day-reference / prior-day-brief-template (choiceCheck): medium quizzes
  should present a JUDGMENT scenario per question (e.g. which of two sources
  wins; is this drift within contract) rather than identification questions.
- approval-template: medium = extend the template with the delegate field the
  route lesson relies on (jsonPolicy; add nonEmpty delegate + version 1.1.0).
- routine-update-path: medium = log a day where escalation was AVOIDED only
  because of the raised threshold (13.9 under v1.1.0) and cite the policy
  version in the entry (jsonFields).
- morning-brief: medium = templateSlots against the medium canon, including a
  Data Notes slot for the WAUE forecast gap and the MISO dropped row (needs a
  medium shelf config; all values from medium-tier artifacts).
- distribution-archive: medium = archive record plus explicit exception
  summary fields (what was dropped/excluded today and where it was reported).

Known engine gap for later: exceptions.json as a first-class artifact (the
Medium sketch in CURRICULUM_MASTER_PLAN.md Part 3.2 proposed an Intake
Exceptions node). Current medium lessons TEACH exclusion/exception behavior
but do not yet store a separate exception artifact. Decide before authoring
the remaining medium lessons whether to add that node or keep exceptions as
fields inside existing artifacts.
