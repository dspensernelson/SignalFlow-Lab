# Lesson 06 - Prior Day Reference (prior-day-reference)

- Lesson type: inspection | Interaction: choiceCheck (new)
- Artifact: source-profile-prior-day-reference.json | Difficulty: Beginner | Clock: 6:18 AM
- Build wave: B (requires choiceCheck)
- Canon: prior-day values are ERCOT 165, SPP 92, MISO 78 (already consumed by the
  built Variance Check lesson).

## Theory

- Invariant: recurring workflows are LOOPS in time - yesterday's output is today's
  input. A baseline is a retained past output reused as a reference, and it only
  exists if some earlier run deliberately kept it (retention is what makes
  baselines possible).
- Mental-model shift: from reading the map's backward edge as "circular
  dependency?!" to reading it as a TEMPORAL edge: the arrow crosses midnight. The
  workflow never consumes its own current run - it consumes its previous self.
- Recognition cue: whenever a process compares "vs last period", trace where last
  period's number physically lives and which run put it there. If the answer is
  "someone's spreadsheet", the loop is manual and fragile - that is the
  automation opportunity.

## Artifact contract (condensed)

- Purpose: prove the baseline's origin (yesterday's archived run), its retention
  dependency, and the temporal-loop shape are understood.
- Immediate consumer: Variance Check (vsPriorDay uses these values).
- Complete means: the learner can explain where the baseline comes from and why
  the backward edge is not a same-run cycle.

## Learning contract

- Primary concept: baselines and temporal reuse.
- Supporting: retention as a precondition, the day-over-day loop, backward edges.
- Accomplishment: "I traced today's comparison baseline back to yesterday's
  archived output and understood the loop that connects the runs."
- Capability Statement: "The workflow can now reuse yesterday's retained output as
  today's comparison baseline."

## Lesson JSON (create src/data/lessons/lesson-prior-day-reference.json)

```json
{
  "id": "lesson-prior-day-reference",
  "nodeId": "prior-day-reference",
  "title": "Trace the Baseline to Yesterday's Run",
  "difficulty": "Beginner",
  "skill": "Baselines & temporal reuse",
  "scenario": "It is 6:18 AM. The third input for this morning is a set of prior-day prices. Nobody typed them in - they came from somewhere, and where they came from is the whole lesson. Trace the baseline before Variance Check leans on it.",
  "inputType": "text",
  "inputLabel": "Prior-Day Baseline",
  "input": "Prior-day prices per hub:\nERCOT: 165\nSPP: 92\nMISO: 78\n\nProvenance: extracted from yesterday's morning brief, which the 7:00 AM run archived to the briefs-archive folder. If yesterday's run had not archived its brief, this baseline would not exist today.",
  "instructions": [
    "Read the provenance line carefully - it names the whole loop.",
    "Answer the four baseline questions.",
    "Validate to record the profile."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "Where do these prior-day values come from?",
        "options": [
          { "id": "a", "text": "Yesterday's archived morning brief" },
          { "id": "b", "text": "The overnight analyst note" },
          { "id": "c", "text": "The forecast model" }
        ],
        "correctOptionId": "a",
        "explain": "The provenance line traces the values to the brief that yesterday's 7:00 AM run archived - a past OUTPUT of this same workflow."
      },
      {
        "id": "q2",
        "prompt": "In automation terms, what IS a baseline?",
        "options": [
          { "id": "a", "text": "A retained past output reused as a reference for comparison" },
          { "id": "b", "text": "A duplicate copy of today's feed, kept for safety" },
          { "id": "c", "text": "A governed policy like the thresholds" }
        ],
        "correctOptionId": "a",
        "explain": "The values are not measured today and not a rule - they are what the workflow itself produced last run, kept on purpose so today has something to compare against."
      },
      {
        "id": "q3",
        "prompt": "The map shows an edge from Distribution / Archive back to this node. Why is that NOT a circular dependency?",
        "options": [
          { "id": "a", "text": "It is circular - the map has a bug" },
          { "id": "b", "text": "Because the edge crosses days: yesterday's archive feeds today's run" },
          { "id": "c", "text": "Because archives are read-only, cycles cannot happen" }
        ],
        "correctOptionId": "b",
        "explain": "Re-read the provenance: the archive being read was written by YESTERDAY's run. Within any single morning the flow is one-directional - the backward edge is temporal."
      },
      {
        "id": "q4",
        "prompt": "What must yesterday's run have done for this baseline to exist at all?",
        "options": [
          { "id": "a", "text": "Escalated to the Desk Manager" },
          { "id": "b", "text": "Archived its brief under the retention policy" },
          { "id": "c", "text": "Computed the same variance we compute today" }
        ],
        "correctOptionId": "b",
        "explain": "The input says it plainly: no archive, no baseline. Retention is not bureaucracy - it is what makes tomorrow's comparisons possible."
      }
    ],
    "artifactOnPass": {
      "source": "prior-day-reference",
      "kind": "baseline (retained past output)",
      "originatesFrom": "distribution-archive (yesterday's run)",
      "dependsOn": "retention of the archived brief",
      "loopShape": "temporal - the backward edge crosses days, not a same-run cycle",
      "firstConsumer": "variance-check"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Profile this baseline: where the values originate, what kind of input a baseline is, why the map's backward edge is temporal rather than circular, and what retention it depends on.",
  "successMessage": "Baseline traced. When you later archive today's brief, you will be seeding exactly this input for tomorrow.",
  "intro": {
    "heading": "Before you inspect: the workflow is a loop",
    "sections": [
      {
        "title": "Yesterday's output, today's input",
        "body": "Daily workflows are loops: each run consumes something its previous run produced. The prior-day baseline is the Meridian loop made visible - prices that exist today only because yesterday's run kept them."
      },
      {
        "title": "The one backward edge",
        "body": "Every other edge on the map points forward. The edge from Distribution / Archive back to this node looks like a cycle until you notice it crosses midnight. Reading edges temporally is a map-literacy skill."
      },
      {
        "title": "Retention enables comparison",
        "body": "vsPriorDay in Variance Check is only computable because a retention rule kept yesterday's brief. When you reach the final lesson and set retentionDays, remember: this input is what that policy protects."
      },
      {
        "title": "Baseline vs template (coming later)",
        "body": "Two things carry over from yesterday: this baseline (DATA - the numbers) and the brief template (STRUCTURE - the sections). Lesson 15 covers the other one; keeping them distinct matters."
      }
    ],
    "jsonExample": "{\n  \"kind\": \"baseline\",\n  \"originatesFrom\": \"distribution-archive\",\n  \"firstConsumer\": \"variance-check\"\n}",
    "skill": "Baselines & temporal reuse",
    "artifactName": "source-profile-prior-day-reference.json"
  },
  "takeaway": {
    "heading": "Baseline traced",
    "points": [
      "You traced today's comparison numbers to yesterday's archived brief - the workflow consuming its previous self.",
      "You read the map's one backward edge correctly: temporal, not circular.",
      "You connected retention to capability: no archive yesterday means no vsPriorDay today.",
      "In the final lesson you will stand on the other side of this loop, archiving today's brief as tomorrow's baseline.",
      "The workflow can now reuse yesterday's retained output as today's comparison baseline."
    ],
    "artifactName": "source-profile-prior-day-reference.json"
  }
}
```

## Wiring

1. Requires choiceCheck (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-prior-day-reference in src/App.jsx.
3. Set `"taskId": "lesson-prior-day-reference"` on node `prior-day-reference` in
   src/data/workflowNodes.json.

## Acceptance checklist

- [ ] Wrong q3 answer (option a) shows the temporal-edge explain.
- [ ] Pass stores source-profile-prior-day-reference.json; node completes.
- [ ] No page scroll at 800px in wrong-answer state; lint/build pass.
