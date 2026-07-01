# Lesson 01 - Analyst Notes (analyst-notes)

- Lesson type: inspection | Interaction: choiceCheck (new - see ENGINE_ADDITIONS_SPEC.md)
- Artifact: source-profile-analyst-notes.json | Difficulty: Beginner | Clock: 6:05 AM
- Build wave: B (requires choiceCheck)

## Theory

- Invariant: every automation begins with a SOURCE question, not a build question:
  where does work enter, who produces it, in what shape, and what access would a
  system need to read it? Skipping this is why automations get built that nobody
  can actually connect to anything.
- Mental-model shift: from "here is some text to process" to "this note is a feed
  with an owner, a format, and an access requirement - it just happens to be prose."
- Recognition cue: at the start of any automation project, profile every input the
  way this lesson does. If you cannot fill in producedBy / format / accessNeeded /
  firstConsumer for a source, you are not ready to automate it.

## Artifact contract (condensed)

- Purpose: prove the workflow's first source is understood before anything consumes it.
- Produced by: the learner's inspection (the profile is the evidence of understanding).
- Immediate consumer: Market Intake Record (lesson 03) reads this note.
- Complete means: the learner can answer the four source questions from the note
  itself, so the intake build that follows starts informed, not blind.

## Learning contract

- Primary concept: source provenance (where work enters the system).
- Supporting: unstructured input, access requirements, lab-vs-work simulation
  honesty.
- Accomplishment: "I profiled the workflow's first input: who writes it, what shape
  it arrives in, and what reading it really requires."
- Capability Statement: "The workflow can now identify where the morning market
  signal enters the system."

## Lesson JSON (create src/data/lessons/lesson-analyst-notes.json)

```json
{
  "id": "lesson-analyst-notes",
  "nodeId": "analyst-notes",
  "title": "Profile the Overnight Note",
  "difficulty": "Beginner",
  "skill": "Source provenance",
  "scenario": "It is 6:05 AM. Before you build anything, understand the raw material. An overnight note has landed - read it like an automation designer: who wrote it, what shape is it in, what would a system need to ingest it, and who needs it next?",
  "inputType": "text",
  "inputLabel": "Overnight Analyst Note",
  "input": "Checked overnight prices. ERCOT hub spiked around 2am, hit $187/MWh briefly then settled near $142/MWh. Wind generation underperformed, about 60% of forecast. Gas prices up slightly. Trader flagged the hub spike for review. No action taken yet. Need approval if we move on this.",
  "instructions": [
    "Read the note as a source, not as content to extract - extraction is the next lesson.",
    "Answer the four source questions against the note and the workflow map.",
    "Validate to mint the source profile."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "Who produces this note?",
        "options": [
          { "id": "a", "text": "The Desk Manager, during business hours" },
          { "id": "b", "text": "The Overnight Desk Analyst, before the market opens" },
          { "id": "c", "text": "The workflow generates it automatically" }
        ],
        "correctOptionId": "b",
        "explain": "The note reports overnight checks written in first person - a person on the overnight desk wrote it before anyone else was in."
      },
      {
        "id": "q2",
        "prompt": "What shape does this input arrive in?",
        "options": [
          { "id": "a", "text": "Structured JSON with named fields" },
          { "id": "b", "text": "A CSV table of prices" },
          { "id": "c", "text": "Unstructured prose a person wrote for people" }
        ],
        "correctOptionId": "c",
        "explain": "Look at the source panel: sentences, approximations ('around 2am', 'about 60%'), no fields. Software cannot act on it as-is."
      },
      {
        "id": "q3",
        "prompt": "In a real company, what would ingesting this note require?",
        "options": [
          { "id": "a", "text": "Access to the analyst's inbox, desk channel, or terminal notes" },
          { "id": "b", "text": "Nothing - market notes are public information" },
          { "id": "c", "text": "A database administrator to create a table" }
        ],
        "correctOptionId": "a",
        "explain": "The note lives wherever the analyst posts it - email, Teams, or a terminal. Reading it programmatically means having permission to that channel. The lab simulates this with a local text fixture."
      },
      {
        "id": "q4",
        "prompt": "Which workflow step consumes this note first?",
        "options": [
          { "id": "a", "text": "Morning Brief" },
          { "id": "b", "text": "Market Intake Record" },
          { "id": "c", "text": "Risk Evaluation" }
        ],
        "correctOptionId": "b",
        "explain": "Follow the map's edge from this node: the note's first stop is the intake step that turns it into a structured record."
      }
    ],
    "artifactOnPass": {
      "source": "analyst-notes",
      "producedBy": "Overnight Desk Analyst",
      "format": "unstructured-text",
      "labVersion": "local text fixture (the note shown in this lesson)",
      "accessNeeded": "inbox or desk channel access",
      "firstConsumer": "market-intake-record"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Profile this input as an automation source: who produces it, what format it arrives in, what access ingesting it would require, and which workflow step consumes it first.",
  "successMessage": "Source profiled. You now know where the morning signal enters - next, you will turn it into the first trusted record.",
  "intro": {
    "heading": "Before you inspect: sources come first",
    "sections": [
      {
        "title": "Why inspect before building",
        "body": "Automation projects fail at the inputs more often than at the logic. Before extracting anything, a designer profiles the source: who produces it, on what schedule, in what shape, behind what access."
      },
      {
        "title": "Prose is a format too",
        "body": "This note is unstructured, but it is still a feed - it arrives every morning, from the same role, with roughly the same content. Recognizing prose as a recurring input is what makes it automatable at all."
      },
      {
        "title": "Lab vs work",
        "body": "In the lab the note is a local text fixture. At work it would be an email, a Teams post, or a terminal note - and ingesting it would need channel access and permission. The workflow map records both realities."
      },
      {
        "title": "What you produce here",
        "body": "Passing the inspection mints a source profile - a small record proving this input is understood. Profiling inputs is itself a real deliverable in automation work."
      }
    ],
    "jsonExample": "{\n  \"source\": \"analyst-notes\",\n  \"format\": \"unstructured-text\",\n  \"firstConsumer\": \"market-intake-record\"\n}",
    "skill": "Source provenance",
    "artifactName": "source-profile-analyst-notes.json"
  },
  "takeaway": {
    "heading": "Source profiled",
    "points": [
      "You answered the four source questions: producer, format, access, first consumer.",
      "The note is a recurring feed that happens to be prose - which is exactly why the next step (intake) must exist.",
      "The lab honestly simulates the access problem: a local fixture stands in for inbox or channel permissions.",
      "Your source profile is stored - profiling inputs is the first deliverable of any real automation project.",
      "The workflow can now identify where the morning market signal enters the system."
    ],
    "artifactName": "source-profile-analyst-notes.json"
  }
}
```

## Wiring

1. Requires the choiceCheck validator + component (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-analyst-notes in src/App.jsx.
3. Set `"taskId": "lesson-analyst-notes"` on node `analyst-notes` in
   src/data/workflowNodes.json.

## Acceptance checklist

- [ ] Unanswered questions fail with the answer-first message; wrong answers show
      the explain text without revealing the correct option.
- [ ] All-correct stores source-profile-analyst-notes.json and completes the node.
- [ ] All four questions + source panel visible without page scroll at 800px, in
      the wrong-answer state.
- [ ] Lint/build pass.
