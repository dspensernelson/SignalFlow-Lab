# Module 1 Case Study - Meridian Morning Market Brief

A portfolio record of what Module 1 is, how it was built, and what a learner
can demonstrably do after finishing it. ASCII-only.

## The scenario

Meridian is a fictional energy-trading desk. Every morning, before the market
opens, an overnight analyst leaves a messy prose note about what prices did.
Module 1 rebuilds the workflow that turns that note - plus a raw price feed and
a few reference inputs - into an approval-ready 7:00 AM market brief. The
learner does not watch the workflow; they rebuild it one trusted artifact at a
time, and each artifact they produce is consumed by the next node on the map.

The workflow map has 17 nodes across five phases: Intake, Data Structure,
Evaluation, Routing, and Brief. Sources and references are inspected;
process/decision/output nodes are BUILT by completing a lesson that produces a
durable artifact (a JSON object or an assembled document).

## The three-tier depth model

Difficulty is depth on the SAME map, not new territory:

- EASY - operate the pattern (17 lessons). Extract structured fields from the
  analyst note, normalize the price feed, compute variances, classify risk,
  route an approval, and assemble the brief. The learner practices the shape
  of the workflow on clean, cooperative data.
- MEDIUM - handle the mess (17 lessons). The same map on adversarial inputs:
  conflicting notes, explicit nulls, dropped rows, a stricter policy version, a
  negative boundary case, an out-of-office delegation, and a brief that has to
  surface exceptions rather than hide them.
- HARD - own the design (8 curated lessons). The learner authors the rules
  instead of following them: a schema v2 migration with lineage, threshold
  design from 60 days of history, feed-failure handling with quarantine and an
  incident record, a silence-driven escalation ladder, classify-under-quarantine
  risk, a degraded-mode brief, retention design, and - the capstone - a full
  solo rebuild of the pipeline outside the app, proven by import.

The five pure-inspection nodes deliberately get no hard variant; their content
does not deepen into design work. That curation is a recorded decision, not a
gap.

## Engine capabilities Module 1 forced into existence

Module 1 was the forcing function for the lesson engine. Each new interaction
was added additively and is now reusable by every future module:

- Four config-driven JSON validators (jsonFields, jsonPolicy, jsonRows,
  jsonDeltas) whose matching rules are FROZEN - additive only.
- choiceCheck - inspection/interpretation quizzes (2-per-row grid to hold the
  no-scroll rule).
- templateSlots - document assembly from stored artifacts (the Morning Brief).
- artifactImport - the capstone surface: the learner rebuilds the pipeline in
  any external tool, imports the produced files, and each file is graded by the
  same frozen validator that originally built it; a full pass mints the
  composite rebuilt-pipeline.json.
- A branching unlock tree (one intro fans the board open 2-3 lessons at a
  time), per-tier progress/artifacts, and a live tier switch.

## Guardrails that kept it honest

- `npm run check` (eslint + lesson lint against canon.json + correct/wrong
  regression fixtures + build) is green before every commit.
- The no-scroll HARD RULE: every Exercise surface fits without page scroll at
  1280x800 in its tallest (wrong-answer) state, verified live.
- canon.json pins shared numbers so two lessons cannot drift apart on the same
  fact.

## What a learner can do after Module 1

- Turn unstructured human observations into a trusted, structured business
  record, and explain what breaks downstream if a field is missing.
- Normalize a raw feed, compute material variances, and classify risk against a
  governed threshold policy.
- Route an approval and assemble an approval-ready brief from previously
  produced artifacts.
- At depth: migrate a schema with lineage, design a threshold policy from
  history, handle a feed failure without dropping data, design an escalation
  ladder, and rebuild the entire pipeline outside the app from scratch -
  proving each piece against the real acceptance bar.

## Verification of completion

All three tiers were played through end to end at a 1280x800 viewport: fresh
gating (correct roots per tier), the no-scroll rule in wrong-answer states,
completion recording artifacts, and unlock fan-out. The automated harness
grades every lesson's correct-and-wrong fixtures on each run. Module 1 is
COMPLETE: Easy 17/17, Medium 17/17, Hard 8/8.
