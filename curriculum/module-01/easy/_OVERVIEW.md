# Module 1 Easy - Meridian Morning Market Brief - Overview

> **STATUS: ALL 17 LESSONS BUILT (2026-07-01, module-01-tiers).** Waves A, B,
> and C below are implemented, smoke-tested, and verified live (incl. the
> no-scroll rule in wrong-answer states). Only Wave D (polish deltas in
> BUILT_LESSON_AUDITS.md) remains. This file stays authoritative for the
> CANON DATA (section 2) - medium/hard lessons and future edits must not
> contradict it. The per-lesson script files remain the design record for the
> built lesson JSONs.

This directory contains the complete lesson scripts for Module 1 Easy: 17 lessons,
one per workflow node, in the pedagogical order from NODE_AUDIT.md. Four lessons
were built before this pass (audited in BUILT_LESSON_AUDITS.md); the other
thirteen were scripted here and are now implemented per ENGINE_ADDITIONS_SPEC.md.

Read this file before implementing ANY lesson: it holds the canon data every lesson
must agree with, the narrative spine, and the build order. Keep ASCII-only.

## 1. The story spine (one morning at Meridian)

Every lesson happens inside the same hour. The clock is part of the pedagogy: it
makes dependencies feel real (the brief ships at 7:00 AM whether you are ready or
not) and gives each artifact a reason to exist NOW.

- 6:05 AM - overnight analyst note and trader flag arrive (analyst-notes, trader-flag)
- 6:15 AM - intake record built (market-intake-record) [BUILT]
- 6:18 AM - price feed, forecast, prior-day baseline inspected (price-feed,
  forecast-data, prior-day-reference)
- 6:20 AM - prices normalized (clean-price-data) [BUILT]
- 6:25 AM - thresholds governed, variance computed (threshold-policy,
  variance-check) [BUILT]
- 6:30 AM - risk evaluated (risk-evaluation)
- 6:35 AM - approval format governed (approval-template)
- 6:38 AM - decision branch encoded (approval-decision)
- 6:40 AM - approval requested and captured (approval-route) / quiet-day path
  logged (routine-update-path)
- 6:50 AM - brief structure checked (prior-day-brief-template), brief assembled
  (morning-brief)
- 7:00 AM - brief delivered and archived; tomorrow's baseline seeded
  (distribution-archive)

## 2. Canon data (single source of truth for all Module 1 numbers)

Any lesson that mentions these values must use EXACTLY these values. They are
already baked into the four built lessons.

Hubs and prices (from lesson-clean-price-data):

| hub | peakPrice | settledPrice |
| --- | --- | --- |
| ERCOT | 187 | 142 |
| SPP | 96 | 88 |
| MISO | 74 | 70 |

References (from lesson-variance-check; "actual" = peak price):

| hub | actual | forecast | priorDay | vsForecast | vsPriorDay | material (abs vsForecast >= 10) |
| --- | --- | --- | --- | --- | --- | --- |
| ERCOT | 187 | 170 | 165 | 17 | 22 | true |
| SPP | 96 | 96 | 92 | 0 | 4 | false |
| MISO | 74 | 80 | 78 | -6 | -4 | false |

Threshold policy (from lesson-threshold-policy): routineThreshold 5 (percent),
escalationThreshold 12 (percent), applied to the DAY-OVER-DAY move; owner Risk Desk
Lead; approver Desk Manager; version 1.0.0.

Derived day-over-day percent moves (used by risk-evaluation and later lessons;
pctMove = vsPriorDay / priorDay * 100, rounded to 1 decimal):

| hub | pctMove | classification against policy |
| --- | --- | --- |
| ERCOT | 13.3 | escalate (13.3 >= 12) |
| SPP | 4.3 | normal (4.3 < 5) |
| MISO | -5.1 | routine (abs 5.1 >= 5, < 12) |

IMPORTANT teaching point carried by lesson 10: the variance-check "material" rule
(absolute 10 vs FORECAST) and the threshold-policy rule (percent vs PRIOR DAY) are
two DIFFERENT rules owned by different steps. This is intentional, not an error.

Approval canon (used by lessons 12, 13, 16): today escalates because of ERCOT;
the request goes to the Desk Manager, who responds "approved" at 6:41 AM.

Decision-lesson day cases (lesson 12 only):

| day | biggest day-over-day move | escalationRequired | route |
| --- | --- | --- | --- |
| day-1 (today) | 13.3 percent | true | approval-route |
| day-2 | 12.0 percent | true | approval-route (rule is "12 or more") |
| day-3 | 11.9 percent | false | routine-update-path |

Distribution canon (lesson 17): distribution list "Trading Desk DL", send time
7:00 AM, archive folder "briefs-archive", retention 30 days, archived brief seeds
tomorrow's prior-day-reference.

Fictional people/roles (never invent new ones): Overnight Desk Analyst (writes the
note), Desk Trader (raises the flag), Risk Desk Lead (owns policies), Desk Manager
(approves), Trading Desk DL (receives the brief). The learner is "the automation".

## 3. The 17 lessons - order, status, theory in one line

| # | Node | Lesson type | Interaction | Status | The invariant it teaches |
| - | --- | --- | --- | --- | --- |
| 01 | analyst-notes | inspection | choiceCheck | script | Every pipeline starts by understanding where work ENTERS and what access that requires |
| 02 | trader-flag | interpretation | choiceCheck | script | Human judgment becomes automatable only when captured as a structured signal |
| 03 | market-intake-record | build | jsonEditor | BUILT | Automation cannot act on a paragraph; mint the first trusted record |
| 04 | price-feed | inspection | choiceCheck | script | Know a feed's format and contract before you consume it |
| 05 | forecast-data | inspection | choiceCheck | script | Comparison inputs need an agreed source of truth and a join key |
| 06 | prior-day-reference | inspection | choiceCheck | script | Yesterday's output is today's input: baselines and temporal reuse |
| 07 | clean-price-data | transformation | jsonEditor | BUILT | Normalize once at the boundary; everything downstream inherits the quality |
| 08 | threshold-policy | governance | jsonEditor | BUILT | Rules live in owned, versioned config, not in code |
| 09 | variance-check | transformation | jsonEditor | BUILT | Derived signals are computed once and stored, so they are auditable |
| 10 | risk-evaluation | transformation | jsonEditor | script | A rules engine = policy applied to data, producing a decision-ready record |
| 11 | approval-template | governance | jsonEditor | script | Standardized request formats are what make handoffs reliable |
| 12 | approval-decision | decision | jsonEditor | script | Branches are explicit, boundary-inclusive, and logged |
| 13 | approval-route | handoff | jsonEditor | script | A human response is only automation-grade once captured as a record |
| 14 | routine-update-path | handoff | jsonEditor | script | The quiet path must be logged too; "no action" is still an outcome |
| 15 | prior-day-brief-template | inspection | choiceCheck | script | Templates carry STRUCTURE across runs (vs baselines, which carry DATA) |
| 16 | morning-brief | assembly | templateSlots | script | Assembly reads upstream artifacts; it never re-derives them |
| 17 | distribution-archive | handoff | jsonEditor | script | Delivery + retention close the loop and seed the next run |

## 4. Build order for the builder

- Wave A (no engine changes): 10, 11, 12, 13, 14, 17
- Wave B (after choiceCheck exists): 01, 02, 04, 05, 06, 15
- Wave C (after templateSlots exists): 16
- Wave D (optional polish): BUILT_LESSON_AUDITS.md deltas for 03, 07, 08, 09

Each lesson script is self-contained: theory, contract, complete lesson JSON,
wiring notes, acceptance checklist. Implement one script per work session. Follow
ENGINE_ADDITIONS_SPEC.md section 3 for registration steps common to all lessons.

## 5. Shared copy rules

- Difficulty labels: use "Beginner" for choiceCheck lessons, "Intermediate" for the
  rest (matches the built lessons' usage).
- Every takeaway's LAST point is the Capability Statement ("The workflow can now
  ..."). Use the exact statements from LESSON_AUTHORING_TEMPLATE.md's starter table
  unless the lesson script overrides.
- Scenario copy always states the clock time and why the artifact is needed now.
- Never teach syntax before purpose in intro sections.
- successMessage states what the workflow can do next, not praise.
