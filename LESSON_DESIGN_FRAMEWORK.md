# Lesson Design Framework (Session Handoff)

This document lets a future session continue the lesson-design work in progress.
It captures (1) what SignalFlow Lab is, (2) the pedagogy framework we agreed on,
(3) the working method, (4) the current implementation state, and (5) where to pick up next.

Use `LESSON_AUTHORING_TEMPLATE.md` as the repeatable production template for turning this
framework into node-by-node lesson specs, builder prompts, and acceptance checks.

Keep this file PURE ASCII. Use " - " instead of em-dashes (the repo terminal mangles non-ASCII).

## HARD RULE: No-scroll Exercise/workbench screens (NON-NEGOTIABLE)

On lesson Exercise/workbench screens, the learner must be able to see the source/input, the
work area, the validation/readiness state, and the next action together on a standard
laptop/desktop viewport. Feedback must not create a long page-scroll stack while the learner
is actively building and fixing the artifact.

- Scope: Exercise/workbench screens only. This does NOT mean every page can never scroll;
  Intro and Takeaway may scroll if needed.
- The validation / readiness feedback area must NOT grow off the page when it expands.
  Keep it a fixed, bounded size: inline per-line error chips beside the editor PLUS one
  prioritized "Fix this next" callout. Never an unbounded stack of callouts.
- Target: no page scroll on the Exercise screen at innerHeight >= 800, including the
  wrong-answer state. Verify via document.documentElement.scrollHeight === clientHeight
  after validating a WRONG answer (the tallest state).
- Adding content to an Exercise screen means compacting or removing something else so it
  still fits. Compactness wins over extra detail.
- This rule is duplicated in AGENTS.md and PRODUCT_DOCTRINE.md so it is never lost.

---

## 1. What this project actually is

SignalFlow Lab is NOT primarily an automation course. It is an application where
users learn automation by building a real system. The product is the workflow itself.

- It teaches automation through reconstruction, not instruction.
- The process map IS the curriculum. Everything supports that.
- The unit of progress is an ARTIFACT, not a lesson. Learners produce named business
  objects (Market Intake Record, Threshold Policy, Clean Price Data, Variance Check),
  not "Lesson Complete" badges.
- Completion means: "I created something the rest of the workflow now consumes."
- Map hierarchy: Project -> Phase -> Workflow Node -> Task -> Artifact -> Concept.
- The UI should feel like Visio / Azure architecture / Power Platform solution explorer -
  an enterprise process workspace, NOT Codecademy / Duolingo / a game.
- Governance (ownership, approvals, audit trails, exception handling, access, quality,
  reuse) is treated as core, not an afterthought.

First scenario / business: **Meridian Morning Market Brief** - every morning the org must
convert messy overnight energy-market inputs into a polished 7:00 AM briefing.

Stack (intentionally small simulation, not enterprise platform): React + Vite + Tailwind v3,
local JSON data, localStorage. No backend, no auth, no AI grading, no real integrations.

Bigger vision (parked, not in scope now): the same engine - workflow map + artifact model +
lesson structure - is largely domain agnostic. Meridian is just the first curriculum. Later
curricula could teach Power Automate, Fabric, ServiceNow, Salesforce ops, finance close, etc.

---

## 2. The core insight that drives lesson design: design backwards

We do NOT start at the beginning of the workflow. We start at the first buildable ARTIFACT
and work backwards to its input.

Automation is fundamentally: "Given this input, what object do I need to produce?"
Only once the output object is defined does the input almost write itself.

```
Artifact          (define this FIRST)
  ^
Transformation
  ^
Input             (define this LAST)
```

Every node should answer: "What new thing exists after this node that did not exist before?"
NOT "What action happened?"

Mental-model shift for the learner: in lesson 1 they are not "learning JSON." They are
BECOMING the Market Intake Service - manufacturing the first durable object every other
automation depends on.

---

## 3. The pedagogy framework (the thing we are really designing)

We are one level above individual lessons: we are designing the PEDAGOGY. Get this right
once and every lesson becomes near-mechanical to build.

### 3.1 Purpose of every lesson

> Every lesson exists to produce one reusable business artifact while teaching one
> foundational automation concept.

Quality bar: if a lesson does not create a durable artifact OR does not introduce a reusable
concept, it probably should not exist.

### 3.2 Guiding Principles (consistent across the whole product)

These are product philosophy, not implementation rules:

1. **Build real work, not exercises.** Every lesson simulates work someone performs in an
   actual business workflow.
2. **Produce reusable artifacts.** Completion creates an object downstream steps depend on.
3. **Reveal the workflow.** Learners always understand where info came from, where it goes
   next, and why it matters.
4. **Introduce one core concept.** One primary automation concept per lesson; supporting
   concepts reinforce but never compete with it.
5. **Connect business and technology.** Technical skills are always introduced in service of
   solving a business problem.

(Five, MECE, explanatory without boxing in.)

### 3.3 Each section has ONE job (do not give each section its own principles)

| Section  | Job                       | Learner question                  |
| -------- | ------------------------- | --------------------------------- |
| Intro    | Build understanding       | "Why does this artifact exist?"   |
| Exercise | Build the artifact        | "How do I create it?"             |
| Takeaway | Connect to the workflow   | "What can the workflow do now?"   |

- **Intro:** learner leaves knowing WHAT they are building, WHY it exists, WHO uses it, and
  WHICH concept they are about to learn. Not how to do it.
- **Exercise:** learner performs exactly ONE meaningful business task. Answers "Can you
  create this artifact?" - not "Can you remember everything we taught?"
- **Takeaway:** the workflow becomes the teacher. Show "You built this. It now lives here.
  It feeds these nodes. You unlocked the next capability." Focus is "the workflow evolved,"
  NOT "you got 100%."

### 3.4 One-sentence accomplishment per lesson

Every lesson should be summarizable as an accomplishment, not a technology:

- Market Intake Record: "I transformed messy human observations into the first trusted
  business record."
- Clean Price Data: "I standardized market prices so calculations become deterministic."

### 3.5 The Capability Statement (signature pattern - high priority)

Every takeaway should end with "The workflow can now ..." - a statement about what the SYSTEM
can do, not what the learner knows.

- Market Intake Record: "The workflow can now consume structured market observations."
- Clean Price Data: "The workflow can now perform deterministic calculations."
- Threshold Policy: "The workflow can now make consistent business decisions."
- Risk Evaluation: "The workflow can now determine whether market conditions require attention."

This makes the learner feel they are incrementally constructing an automation platform -
which is exactly the doctrine (map is the curriculum, artifacts are the unit of progress).

### 3.6 Every lesson produces a NAMED business object

It should feel like something an ops team would actually save in SharePoint or a database.
"Today I built a Threshold Policy," not "Today I learned JSON."

---

## 4. Screen templates (target layout for each section)

Consistency across lessons is a feature. Target layouts:

### Intro
```
Header
Lesson title
Business purpose
Concept you will learn
Why this artifact matters
Workflow context (highlight current node)
Preview (artifact produced)
```

### Exercise
```
Header
Source material
Task instructions
Field / reference guide
Workspace
Validation
Workflow coach (optional)
```
Everything on screen answers one question: "What do I need to create?"

### Takeaway
```
Success
Artifact produced
What changed
Workflow update (highlight downstream nodes that now light up)
Concept recap
Capability Statement ("The workflow can now ...")
Continue
```
Focus is "the workflow just evolved," not a score.

---

## 5. The Lesson Design Contract (how to brief the builder)

Do NOT tell the builder "build a lesson." Require it to define things in this order, and only
write React after the design phases are done. This forces product-designer thinking before
developer thinking.

> Frame: "Design this lesson as a workflow artifact, not as a coding exercise."

**Phase 1 - Artifact**
- Name
- Purpose (why it exists)
- Produced by (who/what creates it; in the lab, the learner)
- Consumed by (immediate + later downstream nodes)
- Governance (ownership, approval, audit, access)
- Validation (what makes it "complete" - "the workflow now has enough trustworthy info to
  continue," not merely "the JSON validates")

**Phase 2 - Learning**
- Primary concept (exactly one)
- Supporting concepts
- Business scenario
- Success criteria (as an accomplishment + a Capability Statement)

**Phase 3 - Screens**
- Intro / Exercise / Takeaway using the standard layouts above.

**Phase 4 - Implementation**
- Only now write the React components / lesson JSON.

---

## 6. Current implementation state (what already exists)

Data-driven lessons follow Intro -> Exercise -> Takeaway, rendered by shared components.

State as of 2026-07-01 (branch module-01-tiers, PR #2):

- EASY TIER COMPLETE: all 17 nodes have built, passing lessons. The 13 newer
  ones were implemented from the scripts in curriculum/module-01/easy/ (one
  script file per lesson - theory, contract, full lesson JSON, acceptance
  checklist).
- DIFFICULTY TIERS LIVE: easy/medium/hard switch in the canvas app bar.
  Per-tier progress/artifacts via suffixed localStorage keys (easy keeps the
  legacy keys). Tier variants resolve via tierLessonId in src/lib/progress.js:
  taskId, taskId-medium, taskId-hard, gated by BUILT_LESSON_IDS_BY_TIER.
- MEDIUM: 7 of 17 built (intake, clean-price-data, threshold-policy,
  variance-check, risk-evaluation, approval-decision, approval-route). Canon
  and remaining designs: curriculum/module-01/medium/_OVERVIEW.md.
- HARD: 3 built (intake v2 migration, threshold design from history,
  price-feed failure handling). Remaining incl. the solo-rebuild capstone:
  curriculum/module-01/hard/_OVERVIEW.md.

Key files:
- Lessons: src/data/lessons/*.json (easy schema below; -medium / -hard
  suffixes for tier variants)
- Nodes / phases / edges: src/data/workflowNodes.json, phases.json, workflowEdges.json
- Node schema (doc only): src/data/workflowNode.schema.json
- Validators: src/lib/validators.js (jsonFields, jsonPolicy, jsonRows,
  jsonDeltas, choiceCheck, templateSlots - all additive and config-driven;
  DO NOT change matching rules)
- Interaction workspaces: LessonExercise branches on lesson.interactionType -
  jsonEditor (inline), ChoiceCheckExercise.jsx (quiz; questions render in a
  2-per-row grid to hold the no-scroll rule), TemplateSlotsExercise.jsx
  (assembly; artifact shelf reads loadArtifacts(), template slots inline)
- Components: LessonWorkspace (orchestrator), LessonIntro, LessonExercise, LessonTakeaway,
  FieldGuide, ValidationResults, WorkflowGraph, NodeDetail, ProjectCanvas, ArtifactViewer
- Progress / artifacts / tiers: src/lib/progress.js; localStorage keys
  `signalflow_progress[_tier]`, `signalflow_artifacts[_tier]`, `signalflow_tier`
- Gotcha recorded the hard way: progress.js helpers take an optional tier
  param defaulting to the active tier; isBuildable validates that param
  because Array#filter passes an index as the second argument

Lesson JSON schema (as used by the 4 built lessons):
- Top: id, nodeId, title, difficulty, skill, scenario, inputType, input, instructions[],
  interactionType, starterAnswer, validation{type,...}, copilotPrompt, successMessage,
  optional inputLabel
- intro: { heading, sections[{title,body}], jsonExample, skill, artifactName }
- fieldGuide: [{ field, meaning, type, example, hint }]
- takeaway: { heading, points[], artifactName }

Build/validate commands:
```powershell
npm run dev      # port 5173, falls back to 5174
npm run lint
npm run build
```

Governing docs: PRODUCT_DOCTRINE.md, PROJECT_CONTEXT.md, PROCESS_MAP_CURRICULUM_DIRECTION.md,
NODE_AUDIT.md (per-node curriculum source of truth), signalflow-lab-mvp-spec-v2.md (historical
accepted MVP). README.md is the quick orientation.

---

## 7. Where we are in the process / pick up here (updated 2026-07-01)

The design pass this document originally scoped is DONE and shipped well past
it: the framework was applied, LESSON_AUTHORING_TEMPLATE.md exists, all 17
Easy lessons are built, the tier engine is live, and Medium/Hard are partially
built (see section 6). The long-range plan (10 scenario-based modules x 3
tiers, ten-year horizons) is CURRICULUM_MASTER_PLAN.md.

### Open work, in priority order

1. Remaining 10 MEDIUM lessons. Design notes per node are already written in
   curriculum/module-01/medium/_OVERVIEW.md - follow its canon exactly
   (conflicting-notes morning, WAUE hub, policy v1.1.0 at 6/14). The six
   choiceCheck variants should ask judgment questions, not identification
   questions. One open decision recorded there: whether exceptions become a
   first-class artifact/node or stay fields inside existing artifacts.
2. Remaining HARD lessons, per curriculum/module-01/hard/_OVERVIEW.md:
   approval-timeout ladder, degraded-variance/risk, degraded morning-brief,
   retention design, and THE CAPSTONE (solo rebuild outside the app - needs
   an artifact-import surface; specced in CURRICULUM_MASTER_PLAN.md Part 3.3).
   Also decide (and log) whether hard stays a curated 10-12 lessons.
3. Wave D polish: apply the deltas in
   curriculum/module-01/easy/BUILT_LESSON_AUDITS.md (mostly appending
   Capability Statement takeaway points to the 4 original lessons).
4. NODE_AUDIT.md statuses reflect the pre-build state; its top note covers
   this. A full re-audit is optional, not blocking.

### Recommended opening prompt for the next session

Paste this if starting cold:

```text
We are continuing SignalFlow Lab. Read README.md (Current Status),
LESSON_DESIGN_FRAMEWORK.md sections 6-7, CURRICULUM_MASTER_PLAN.md, and
curriculum/module-01/medium/_OVERVIEW.md first.

Work the open list in LESSON_DESIGN_FRAMEWORK.md section 7. Default next
task: author and build the remaining Medium lessons following the medium
canon exactly. Constraints: validators are additive (never change matching
rules), keep the no-scroll rule (verify the wrong-answer state at
innerHeight >= 800), keep repo docs ASCII-only, lint+build must pass, and
commit per lesson or small batch.
```

### Market Intake Record artifact spec scaffold

Use this as the first design artifact to complete:

```markdown
# Market Intake Record Artifact Spec

## Artifact
Market Intake Record (`market-intake.json`)

## Purpose
Explain why this object exists in the Meridian Morning Market Brief workflow.

## New thing that exists after this node
Name the durable business object that did not exist before the learner completed the task.

## Produced by
Name the real-world role/process and the learner role in the lab.

## Immediate consumers
List the next workflow nodes that directly use this object and which fields each one needs.

## Later consumers
List downstream decisions, approvals, brief sections, archive/search needs, or audit uses.

## Required fields
For each field, define:
- field name
- meaning
- source in the analyst note
- who/what consumes it
- what breaks if it is missing or wrong

## Optional fields
Only include fields that have a clear downstream purpose.

## Governance
Define owner, source-of-truth rule, approval sensitivity, audit/reuse note, and quality concern.

## Complete means
Write this as a workflow readiness statement, not as syntax validation.

## Primary concept
One concept only. For this lesson, likely: structured vs unstructured data.

## Supporting concepts
JSON, field extraction, schema, required vs optional fields, deterministic automation.

## One-sentence accomplishment
I transformed messy human observations into the first trusted business record.

## Capability Statement
The workflow can now consume structured market observations.
```

### Guardrails (from repo memory / doctrine)

- Do NOT change validator matching rules; validators are additive and config-driven.
- Progress model currently tracks only buildable task nodes; everything else is derived. Do not
  silently expand this without intent.
- Keep ASCII in repo docs. For file rewrites, delete then recreate rather than piping multi-line
  PowerShell (the terminal double-encodes / mangles here-strings).
- Stay in scope: design/author lessons; do not add unrequested features.
