# Module 1 Hard - Own the Design - Overview

Status (2026-07-01): 3 of 17 lessons BUILT and playable; the tier is
intentionally a curated set, not necessarily all 17 nodes (see below).
Hard lessons live in src/data/lessons/ as `lesson-<node>-hard.json`, resolved
via tierLessonId (taskId + "-hard"), listed in BUILT_LESSON_IDS_BY_TIER.hard.
Hard progress/artifacts use signalflow_progress_hard / signalflow_artifacts_hard.
Keep ASCII-only.

## Tier posture

Easy validated values, Medium validated decisions, Hard validates DESIGNS.
The learner authors the rules, absorbs injected failures, and manages breaking
change. Where a design is genuinely the learner's choice (thresholds), the
validator deliberately checks SHAPE and GOVERNANCE (fields present, ordering,
rationale non-empty) rather than exact values - that is the pedagogy, not a
validation gap.

## Built lessons (3)

| Node | Lesson id | The design responsibility |
| --- | --- | --- |
| market-intake-record | lesson-intake-hard | Schema v2 migration: rename, reshape, version, lineage (migratedFrom) |
| threshold-policy | lesson-threshold-policy-hard | Design thresholds from 60 days of history; rationale must cite day counts |
| price-feed | lesson-price-feed-hard | Failure handling: late feed, quarantined malformed row, degraded brief, incident record |

Hard canon so far: intake v2 uses the EASY canon record (187/142, wind,
approval true) as its migration input. The policy-design lesson uses its own
60-day distribution fixture. The feed-failure lesson: expected 6:15, detected
6:20, arrived 6:42, SPP row malformed, quarantine, degraded brief, notify
Risk Desk Lead.

## Remaining to author - design notes (in priority order)

1. approval-route-hard: approver timeout - the deadline passes with NO
   response; learner executes the escalation ladder (template names the
   ladder: delegate, then Desk Head, then release-with-note per policy) and
   records the timeout + ladder step used (jsonFields).
2. variance-check-hard / risk-evaluation-hard: downstream of the degraded
   feed - compute under quarantine (SPP absent), propagate degraded status
   into the risk record so the brief can cite it (jsonDeltas).
3. morning-brief-hard: assemble the DEGRADED brief - an Incidents section
   sourced from the incident record; slots for what is missing and why
   (templateSlots with a hard shelf config).
4. distribution-archive-hard: retention design - learner chooses retention
   and defends it (jsonPolicy-style shape check with rationale, like the
   threshold design lesson).
5. THE CAPSTONE (biggest remaining engine work): solo rebuild outside the
   app. Learner recreates intake -> clean -> variance -> brief with local
   files and any tool (PowerShell, Python, Power Automate), then imports the
   four produced files; the app runs the existing validators against them.
   Requires an artifact-import surface (file picker -> validateAnswer per
   file). Specced at CURRICULUM_MASTER_PLAN.md Part 3.3; do this before
   calling Module 1 Hard complete.

Nodes that may NOT need a hard variant (decide deliberately): analyst-notes,
trader-flag, forecast-data, prior-day-reference, prior-day-brief-template -
their inspection/interpretation content does not deepen naturally into design
work; the hard tier can be a curated 10-12 lessons rather than a forced 17.
Record the decision in DECISION_LOG.md when made.
