# Module 1 Hard - Own the Design - Overview

Status (2026-07-01, third pass): 7 lessons BUILT and playable. DECIDED: the
hard tier is a CURATED set - the seven design/failure drills below plus the
future solo-rebuild capstone; the five inspection-type nodes (analyst-notes,
trader-flag, forecast-data, prior-day-reference, prior-day-brief-template)
deliberately get no hard variant, since their content does not deepen into
design work. Hard lessons are standalone DRILLS, not one continuous morning:
intake/threshold/approval-ladder each carry their own scenario, while
price-feed, risk-evaluation, and morning-brief share the degraded-morning arc.
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

## Built lessons (7)

| Node | Lesson id | The design responsibility |
| --- | --- | --- |
| market-intake-record | lesson-intake-hard | Schema v2 migration: rename, reshape, version, lineage (migratedFrom) |
| threshold-policy | lesson-threshold-policy-hard | Design thresholds from 60 days of history; rationale must cite day counts |
| price-feed | lesson-price-feed-hard | Failure handling: late feed, quarantined malformed row, degraded brief, incident record |
| approval-route | lesson-approval-route-hard | Timeout design: silence-driven escalation ladder, rung timestamps, exhausted-ladder fallback |
| risk-evaluation | lesson-risk-evaluation-hard | Computing under quarantine; degraded-status propagation on every row |
| morning-brief | lesson-morning-brief-hard | Degraded-mode output: incident in the deliverable, explained missing approval |
| distribution-archive | lesson-distribution-archive-hard | Retention design from constraints; explainers outlive the explained |

Degraded-morning arc canon (price-feed -> risk-evaluation -> morning-brief):
feed expected 6:15, arrived 6:42; SPP row malformed -> QUARANTINED (not
dropped, expected back). Surviving rows: ERCOT 198/149, MISO 81/76. Prior
day: ERCOT 172, MISO 77. Ratified Threshold Policy v2.0.0: routine 6,
escalate 16. pctMoves: ERCOT 15.1 (routine - would have escalated under the
old 12), MISO 5.2 (normal). No escalation -> brief releases without approval,
marked degraded, with an Incidents section.

Hard canon so far: intake v2 uses the EASY canon record (187/142, wind,
approval true) as its migration input. The policy-design lesson uses its own
60-day distribution fixture. The feed-failure lesson: expected 6:15, detected
6:20, arrived 6:42, SPP row malformed, quarantine, degraded brief, notify
Risk Desk Lead.

Hard canon addition (approval-route-hard): ladder = 10 minutes of silence per
rung; request 6:30 -> delegate 6:40 -> Desk Head 6:50 -> approved 6:55;
exhausted fallback = release marked UNAPPROVED with incident (template
v2.0.0 names the ladder).

## Remaining to author

1. THE CAPSTONE (the only remaining hard item; biggest engine work): solo
   rebuild outside the app. Learner recreates intake -> clean -> variance ->
   brief with local files and any tool (PowerShell, Python, Power Automate),
   then imports the four produced files; the app runs the existing validators
   against them. Requires an artifact-import surface (file picker ->
   validateAnswer per file). Specced at CURRICULUM_MASTER_PLAN.md Part 3.3;
   Module 1 Hard is complete when the capstone ships.
2. Optional, decide later: variance-check-hard was folded into
   risk-evaluation-hard (compute + classify under quarantine in one lesson);
   clean-price-data and the routing decision likewise have no separate hard
   drill. Add them only if a distinct design skill emerges that the current
   seven do not cover.
