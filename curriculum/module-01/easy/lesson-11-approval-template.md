# Lesson 11 - Approval Template (approval-template)

- Lesson type: governance | Interaction: jsonEditor | Validator: jsonPolicy (existing)
- Artifact: approval-template.json | Difficulty: Intermediate | Clock: 6:35 AM
- Build wave: A (no engine changes)

## Theory

- Invariant: handoffs to humans are reliable only when the REQUEST FORMAT is
  standardized. A template is governance for communication: it guarantees every
  approver sees the same required facts, every time, so responses are fast and
  comparable.
- Mental-model shift: from "I'll write the approver a message" to "the workflow
  owns a versioned request format, and messages are instances of it."
- Recognition cue: if a process stalls at "waiting for approval", look at the
  requests. If each one is hand-written, the fix is usually a template with
  required fields and a response deadline - before any tooling change.

## Artifact contract (condensed)

- Purpose: define the reusable, owned format every brief-approval request follows.
- Produced by: the desk's governance process (learner acts as its author/registrar).
- Upstream inputs: none (a governed reference, like Threshold Policy).
- Immediate consumer: Approval Route (renders its request from this template).
- Complete means: the workflow can generate an approval request without anyone
  deciding, per-request, what to include or how long the approver has to respond.

## Learning contract

- Primary concept: standardized request formats (output templating as governance).
- Supporting: required-field standards, response deadlines as fields, versioning
  and ownership (echoes Threshold Policy - second governance rep).
- Accomplishment: "I standardized what every approval request must contain, so
  sign-offs stop depending on who wrote the message."
- Capability Statement: "The workflow can now create approval requests in a
  consistent governed format."

## Lesson JSON (create src/data/lessons/lesson-approval-template.json)

```json
{
  "id": "lesson-approval-template",
  "nodeId": "approval-template",
  "title": "Standardize the Approval Request Format",
  "difficulty": "Intermediate",
  "skill": "Governed request templates",
  "scenario": "It is 6:35 AM. Today's brief will need a manager sign-off, and past requests have been inconsistent - some named the hub, some forgot the deadline, so approvals dragged. Before the workflow sends anything, write down the one request format every approval will use.",
  "inputType": "text",
  "inputLabel": "Desk Agreement",
  "input": "The desk agreed on a standard for brief-approval requests. Every request must state the hub, the percent move, the threshold that was crossed, and the response deadline. Requests use the subject format: APPROVAL NEEDED: <hub> <move>% - morning brief. The standard response deadline is 30 minutes. The template is owned by the Risk Desk Lead and changes require sign-off from the Desk Manager. Record this as version 1.0.0.",
  "instructions": [
    "Name the template so other steps can refer to it.",
    "Record the subject format exactly as agreed.",
    "Set responseDeadlineMinutes as a plain number.",
    "Record the owner, the approver of changes, and the version.",
    "Validate when every field is filled."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "{\n  \"templateName\": \"\",\n  \"version\": \"\",\n  \"owner\": \"\",\n  \"approver\": \"\",\n  \"subjectFormat\": \"\",\n  \"responseDeadlineMinutes\": 0\n}",
  "validation": {
    "type": "jsonPolicy",
    "requiredFields": [
      "templateName",
      "version",
      "owner",
      "approver",
      "subjectFormat",
      "responseDeadlineMinutes"
    ],
    "numericFields": ["responseDeadlineMinutes"],
    "nonEmptyFields": ["templateName", "version", "owner", "approver", "subjectFormat"]
  },
  "copilotPrompt": "Draft a JSON approval-request template with templateName, version, owner, approver, subjectFormat, and responseDeadlineMinutes. Use a plain number for the deadline and record who owns the template and who approves changes.",
  "successMessage": "Approval template recorded. The routing step can now generate consistent, governed sign-off requests.",
  "intro": {
    "heading": "Before you build: governed request formats",
    "sections": [
      {
        "title": "Why handoffs need templates",
        "body": "An approval is a handoff to a human. If every request is written differently, the approver must reconstruct context each time, and requests get slower and less comparable. A template guarantees the same required facts appear every time."
      },
      {
        "title": "Required fields are the standard",
        "body": "The desk agreed each request must state the hub, the move, the threshold crossed, and the deadline. Those are not style choices - they are the minimum an approver needs to decide without asking follow-up questions."
      },
      {
        "title": "A deadline is a field, not a hope",
        "body": "Putting responseDeadlineMinutes in the template turns 'please respond soon' into a value automation can act on later - for reminders, escalation, or timeout paths."
      },
      {
        "title": "Same governance pattern, second rep",
        "body": "Like the Threshold Policy, this template has an owner, an approver of changes, and a version. Governance objects all share that shape - this lesson is your second repetition of it."
      }
    ],
    "jsonExample": "{\n  \"templateName\": \"Outage Approval Request\",\n  \"version\": \"1.0.0\",\n  \"owner\": \"Ops Lead\",\n  \"approver\": \"Site Manager\",\n  \"subjectFormat\": \"APPROVAL NEEDED: <site> outage window\",\n  \"responseDeadlineMinutes\": 60\n}",
    "skill": "Governed request templates",
    "artifactName": "approval-template.json"
  },
  "fieldGuide": [
    {
      "field": "templateName",
      "meaning": "A clear, reusable name for this request format.",
      "type": "string",
      "example": "\"Brief Approval Request\"",
      "hint": "Name it so Approval Route can refer to it."
    },
    {
      "field": "version",
      "meaning": "The version so format changes can be tracked.",
      "type": "string",
      "example": "\"1.0.0\"",
      "hint": "The agreement says to record version 1.0.0."
    },
    {
      "field": "owner",
      "meaning": "Who owns the template.",
      "type": "string",
      "example": "\"Risk Desk Lead\"",
      "hint": "The agreement names the owner."
    },
    {
      "field": "approver",
      "meaning": "Who must sign off on changes to the template.",
      "type": "string",
      "example": "\"Desk Manager\"",
      "hint": "The agreement names who approves changes."
    },
    {
      "field": "subjectFormat",
      "meaning": "The standard subject line every request uses.",
      "type": "string",
      "example": "\"APPROVAL NEEDED: <hub> <move>% - morning brief\"",
      "hint": "Copy the agreed subject format from the input."
    },
    {
      "field": "responseDeadlineMinutes",
      "meaning": "How long the approver has to respond, in minutes.",
      "type": "number",
      "example": "30",
      "hint": "A plain number - no quotes, no 'minutes'."
    }
  ],
  "takeaway": {
    "heading": "Approval template recorded",
    "points": [
      "You turned a desk agreement into a named, versioned request format with an owner.",
      "Every future approval request now carries the same required facts: hub, move, threshold, deadline.",
      "The deadline is a machine-readable field, which later enables reminders and timeout handling.",
      "Approval Route reuses this template next - watch for the subject line reappearing there.",
      "The workflow can now create approval requests in a consistent governed format."
    ],
    "artifactName": "approval-template.json"
  }
}
```

## Wiring

1. Register lesson-approval-template in src/App.jsx.
2. Set `"taskId": "lesson-approval-template"` on node `approval-template` in
   src/data/workflowNodes.json.
3. No validator changes. Note: jsonPolicy checks that responseDeadlineMinutes is a
   NUMBER, not its value - consistent with the threshold-policy lesson. The field
   guide steers the learner to 30.

## Acceptance checklist

- [ ] Empty owner fails with the non-empty message; deadline as "30" (string) fails
      with the numeric message.
- [ ] Correct answer stores approval-template.json; approval-route node shows it
      upstream.
- [ ] Lint/build pass; no-scroll verified in wrong-answer state.
