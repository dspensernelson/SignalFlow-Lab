# Lesson 02 - Trader Flag (trader-flag)

> REVISED 2026-07-06 (opening-arc re-storyboard): stays choiceCheck (the
> interpretation has no source span to tag), but the built JSON gained the
> mission intro, whatCameIn flag card, diagram takeaway, and case-thread copy.
> See DECISION_LOG.md 2026-07-06. The script below is the original design record.

- Lesson type: interpretation | Interaction: choiceCheck (new)
- Artifact: signal-interpretation-trader-flag.json | Difficulty: Beginner | Clock: 6:08 AM
- Build wave: B (requires choiceCheck)

## Theory

- Invariant: human judgment enters automation as a SIGNAL - and a signal is only
  usable once someone decides which structured field it becomes, what values it can
  take, and what the workflow does with it. "The trader flagged it" is a story;
  approvalRequired: true is a signal.
- Mental-model shift: from "people communicate, systems compute" to "a person's
  judgment call can be captured as one boolean, and that boolean is what lets the
  workflow respect the judgment."
- Recognition cue: listen for escalation language in any process description -
  "flagged", "raised", "asked us to look at", "needs sign-off". Each one is a
  latent structured field. The interpretation skill is mapping the phrase to the
  field BEFORE building anything.
- Distinct from lesson 01 (per NODE_AUDIT item 8): Analyst Notes is the commentary
  (many facts, prose); the Trader Flag is one deliberate act of judgment riding
  inside it. Lesson 01 profiles a source; this lesson interprets a signal.

## Artifact contract (condensed)

- Purpose: pin down what the trader's escalation cue MEANS in structured terms
  before the intake build encodes it.
- Immediate consumer: Market Intake Record (encodes it as approvalRequired);
  ultimately Approval Decision acts on it.
- Complete means: the workflow knows which field the flag becomes, its value
  today, and what breaks downstream if it is lost.

## Learning contract

- Primary concept: capturing human judgment as a structured signal.
- Supporting: boolean/event flags, escalation semantics, signal-vs-commentary.
- Accomplishment: "I translated a human escalation cue into the exact field and
  value the workflow will act on."
- Capability Statement: "The workflow can now convert a human escalation cue into
  a structured decision signal."

## Lesson JSON (create src/data/lessons/lesson-trader-flag.json)

```json
{
  "id": "lesson-trader-flag",
  "nodeId": "trader-flag",
  "title": "Interpret the Trader's Flag",
  "difficulty": "Beginner",
  "skill": "Signals from human judgment",
  "scenario": "It is 6:08 AM. Inside the overnight note there is one sentence that is not commentary - it is a judgment call by the Desk Trader, and it changes what the workflow must do this morning. Your job is to interpret that signal precisely before the intake step encodes it.",
  "inputType": "text",
  "inputLabel": "The Signal, In Context",
  "input": "From the overnight note:\n\"... Trader flagged the hub spike for review. No action taken yet. Need approval if we move on this.\"\n\nContext: the flag was raised by the Desk Trader about the ERCOT spike. Raising a flag is a deliberate act - it is how a human tells the workflow that this morning is not routine.",
  "instructions": [
    "Read the flagged sentence and its context.",
    "Answer the four interpretation questions.",
    "Validate to record the signal interpretation."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "In workflow terms, what IS the trader's flag?",
        "options": [
          { "id": "a", "text": "A price value the workflow should store" },
          { "id": "b", "text": "A human escalation signal - a judgment call captured as an event" },
          { "id": "c", "text": "A completed approval - the trader already signed off" }
        ],
        "correctOptionId": "b",
        "explain": "Re-read the sentence: the trader flagged the spike FOR review and no action was taken. It raises a question; it does not answer one."
      },
      {
        "id": "q2",
        "prompt": "Which structured field does this signal become in the Market Intake Record?",
        "options": [
          { "id": "a", "text": "approvalRequired" },
          { "id": "b", "text": "peakPrice" },
          { "id": "c", "text": "generationFlag" }
        ],
        "correctOptionId": "a",
        "explain": "The flag is about whether a human must approve before acting - it maps to the record's control-signal field, not to any market measurement."
      },
      {
        "id": "q3",
        "prompt": "What value should that field carry this morning?",
        "options": [
          { "id": "a", "text": "false - the trader took no action" },
          { "id": "b", "text": "\"ERCOT\" - the hub the trader flagged" },
          { "id": "c", "text": "true - review was requested before acting" }
        ],
        "correctOptionId": "c",
        "explain": "'No action taken yet' plus 'need approval if we move' means review IS required - the absence of action is exactly why the flag is raised."
      },
      {
        "id": "q4",
        "prompt": "If the flag were never captured as a field, what breaks downstream?",
        "options": [
          { "id": "a", "text": "Nothing - the note still mentions it, so the information exists" },
          { "id": "b", "text": "The Approval Decision cannot route the brief for review, so the escalation is silently lost" },
          { "id": "c", "text": "The price table would have a missing row" }
        ],
        "correctOptionId": "b",
        "explain": "Downstream automation reads fields, not prose. A judgment that only lives in a sentence never reaches the decision step that must act on it."
      }
    ],
    "artifactOnPass": {
      "signal": "trader-flag",
      "raisedBy": "Desk Trader",
      "meaning": "human escalation cue - review requested before acting",
      "becomesField": "approvalRequired",
      "valueToday": true,
      "actedOnBy": "approval-decision"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Interpret this human escalation cue: what kind of signal is it, which structured field should it become, what value does it carry today, and what breaks if it is not captured?",
  "successMessage": "Signal interpreted. When you build the intake record, you will know exactly why approvalRequired exists and what it must say.",
  "intro": {
    "heading": "Before you interpret: judgment as data",
    "sections": [
      {
        "title": "Commentary vs signal",
        "body": "The overnight note holds many facts, but one sentence is different in kind: a person deliberately escalated. The previous lesson profiled the note as a source; this lesson isolates the one judgment riding inside it."
      },
      {
        "title": "A flag needs an agreed meaning",
        "body": "For a flag to work, the desk must agree what counts as flagging and what the workflow does about it. Here the agreement is: a trader flag means approval is required before acting on the move."
      },
      {
        "title": "One boolean carries the judgment",
        "body": "The entire escalation compresses to approvalRequired: true. That is not a loss of nuance - it is the point. The nuance stays in the note for humans; the boolean is what automation can route on."
      },
      {
        "title": "Signals get lost silently",
        "body": "If nobody maps the flag to a field, the workflow will happily produce a brief with no approval step - and no error. Lost signals are silent failures, which is why interpretation is a lesson of its own."
      }
    ],
    "jsonExample": "{\n  \"signal\": \"trader-flag\",\n  \"becomesField\": \"approvalRequired\",\n  \"valueToday\": true\n}",
    "skill": "Signals from human judgment",
    "artifactName": "signal-interpretation-trader-flag.json"
  },
  "takeaway": {
    "heading": "Signal interpreted",
    "points": [
      "You separated one act of human judgment from the commentary around it.",
      "The flag maps to approvalRequired: true - a boolean the Approval Decision can route on.",
      "You named the failure mode: uncaptured signals fail silently, producing a brief that skips review with no error anywhere.",
      "In the intake build next, watch this interpretation become a field in the record.",
      "The workflow can now convert a human escalation cue into a structured decision signal."
    ],
    "artifactName": "signal-interpretation-trader-flag.json"
  }
}
```

## Wiring

1. Requires choiceCheck (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-trader-flag in src/App.jsx.
3. Set `"taskId": "lesson-trader-flag"` on node `trader-flag` in
   src/data/workflowNodes.json.

## Acceptance checklist

- [ ] Wrong q3 answer (false) shows the explain text about 'no action taken yet'.
- [ ] Pass stores signal-interpretation-trader-flag.json; node completes.
- [ ] No page scroll at 800px in wrong-answer state; lint/build pass.
