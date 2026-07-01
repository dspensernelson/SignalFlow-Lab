# Lesson 14 - Routine Update Path (routine-update-path)

- Lesson type: handoff | Interaction: jsonEditor | Validator: jsonFields (existing)
- Artifact: routine-log.json | Difficulty: Intermediate | Clock: 6:40 AM (a quiet morning)
- Build wave: A (no engine changes)

## Theory

- Invariant: the path where NOTHING happens still needs a record. "No escalation"
  is an outcome the workflow decided, and an auditable system can prove not only
  what it did, but what it deliberately did not do.
- Mental-model shift: from "no news, nothing to write down" to "silence is a
  decision, and undocumented silence is indistinguishable from a workflow that
  silently failed to run."
- Recognition cue: in any workflow you audit, find the else-branch and ask what it
  writes. If the answer is "nothing", you cannot tell a quiet day from a broken
  trigger. This is one of the most common real-world automation gaps.

## Artifact contract (condensed)

- Purpose: log a non-escalated morning - which day, what the biggest move was,
  which threshold it stayed under, and that the brief was released without
  approval, by design.
- Produced by: the workflow itself (the learner writes the entry the workflow
  would write - note loggedBy is the workflow, not a person).
- Upstream inputs: decision-log.json (day-3 routed here).
- Immediate consumer: Morning Brief (on quiet days it cites the routine outcome);
  the log is also an audit record in its own right.
- Complete means: a reviewer can confirm any quiet morning was evaluated and
  released on purpose, without asking anyone.

## Learning contract

- Primary concept: logging the no-action branch (exception/normal-path symmetry).
- Supporting: system-authored records (loggedBy: workflow), audit trail
  completeness, branch symmetry with lesson 13.
- Accomplishment: "I made the quiet path leave the same quality of evidence as the
  loud one."
- Capability Statement: "The workflow can now log a non-escalated outcome without
  losing auditability."

## Lesson JSON (create src/data/lessons/lesson-routine-update-path.json)

```json
{
  "id": "lesson-routine-update-path",
  "nodeId": "routine-update-path",
  "title": "Log the Quiet-Morning Outcome",
  "difficulty": "Intermediate",
  "skill": "No-action logging",
  "scenario": "Picture a quieter morning - day-3 from your decision log. The biggest move was 11.9 percent, under the 12 percent escalation threshold, so the brief goes out without manager approval. Nothing dramatic happened - which is exactly why this morning needs a log entry. Write the entry the workflow would write.",
  "inputType": "text",
  "inputLabel": "Decision Log Extract + Desk Practice",
  "input": "From decision-log.json:\nday-3: biggest day-over-day move 11.9 percent (ERCOT). Escalation threshold: 12 percent. escalationRequired: false. Route: routine-update-path.\n\nDesk practice: on a routine morning the workflow writes its own log entry before the brief is sent. The entry states the day, the biggest move, the threshold it stayed under, the outcome word routine, that the brief was released, and that the workflow itself made the entry. No human touches the routine path - that is the point.",
  "instructions": [
    "Record the day and the biggest move from the decision log extract.",
    "Record the threshold the move stayed under.",
    "Set the outcome to routine and briefReleased to true.",
    "Set loggedBy to the workflow - no human is on this path.",
    "Return one JSON object, then validate."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "{\n  \"day\": \"\",\n  \"biggestMovePct\": \"\",\n  \"threshold\": \"\",\n  \"outcome\": \"\",\n  \"briefReleased\": false,\n  \"loggedBy\": \"\"\n}",
  "validation": {
    "type": "jsonFields",
    "requiredFields": ["day", "biggestMovePct", "threshold", "outcome", "briefReleased", "loggedBy"],
    "expected": {
      "day": "day-3",
      "outcome": "routine"
    },
    "acceptedValues": {
      "biggestMovePct": ["11.9", "11.9%"],
      "threshold": ["12", "12%"],
      "briefReleased": ["true"],
      "loggedBy": ["workflow", "the workflow", "automation", "meridian workflow"]
    }
  },
  "copilotPrompt": "Write a routine-outcome log entry as JSON with day, biggestMovePct, threshold, outcome, briefReleased, and loggedBy. The move stayed under the threshold, the outcome is routine, the brief was released, and the workflow itself is the logger.",
  "successMessage": "Routine outcome logged. A quiet morning is now provably quiet, not just silent.",
  "intro": {
    "heading": "Before you build: the quiet path",
    "sections": [
      {
        "title": "Silence needs evidence",
        "body": "If the routine path writes nothing, then a morning with no approval request has two possible explanations: the market was calm, or the workflow never ran. A log entry removes the ambiguity."
      },
      {
        "title": "Symmetry with the approval path",
        "body": "The loud branch produced approval-route.json with who/what/when. The quiet branch deserves the same shape of evidence: which day, what was measured, what rule it stayed under, and what was released."
      },
      {
        "title": "The system is the author",
        "body": "Notice loggedBy: this record is written by the workflow, not a person. Part of maturing an automation is letting it document itself - human-authored records appear only where humans actually decided something."
      },
      {
        "title": "Why this is on the map at all",
        "body": "The routine path is the easiest node to skip when building a workflow, and skipping it is how audit gaps are born. Meridian models it as a first-class step so the else-branch is designed, not implied."
      }
    ],
    "jsonExample": "{\n  \"day\": \"day-9\",\n  \"biggestMovePct\": \"3.2\",\n  \"threshold\": \"12\",\n  \"outcome\": \"routine\",\n  \"briefReleased\": true,\n  \"loggedBy\": \"workflow\"\n}",
    "skill": "No-action logging",
    "artifactName": "routine-log.json"
  },
  "fieldGuide": [
    {
      "field": "day",
      "meaning": "Which morning this entry covers.",
      "type": "string",
      "example": "\"day-3\"",
      "hint": "The quiet day from the decision log."
    },
    {
      "field": "biggestMovePct",
      "meaning": "The biggest move measured that morning.",
      "type": "string",
      "example": "\"11.9\"",
      "hint": "From the decision log extract."
    },
    {
      "field": "threshold",
      "meaning": "The escalation threshold the move stayed under.",
      "type": "string",
      "example": "\"12\"",
      "hint": "From the Threshold Policy, restated in the input."
    },
    {
      "field": "outcome",
      "meaning": "The outcome word for this branch.",
      "type": "string",
      "example": "\"routine\"",
      "hint": "This is the routine path."
    },
    {
      "field": "briefReleased",
      "meaning": "Whether the brief went out.",
      "type": "boolean",
      "example": "true",
      "hint": "Routine mornings release without approval - that is by design."
    },
    {
      "field": "loggedBy",
      "meaning": "Who wrote this entry.",
      "type": "string",
      "example": "\"workflow\"",
      "hint": "No human is on this path."
    }
  ],
  "takeaway": {
    "heading": "Routine outcome logged",
    "points": [
      "You gave the no-action branch the same evidentiary weight as the approval branch.",
      "A reviewer can now distinguish a calm morning from a broken workflow - the entry proves the evaluation ran.",
      "The record is system-authored: automation documenting itself is part of the design, not a nice-to-have.",
      "Both branches of the Approval Decision now produce records, so the fork is fully auditable end to end.",
      "The workflow can now log a non-escalated outcome without losing auditability."
    ],
    "artifactName": "routine-log.json"
  }
}
```

## Wiring

1. Register lesson-routine-update-path in src/App.jsx.
2. Set `"taskId": "lesson-routine-update-path"` on node `routine-update-path` in
   src/data/workflowNodes.json.
3. No validator changes. briefReleased is validated via acceptedValues ["true"]:
   normalize(true) === "true", so a real boolean passes (the special-case boolean
   handling in jsonFields applies only to the field named approvalRequired).

## Acceptance checklist

- [ ] briefReleased: false fails; boolean true passes; string "true" also passes (acceptable).
- [ ] loggedBy with a person's name (e.g. "Desk Manager") fails - the teaching moment.
- [ ] Correct answer stores routine-log.json; morning-brief node shows it upstream.
- [ ] Lint/build pass; no-scroll verified in wrong-answer state.
