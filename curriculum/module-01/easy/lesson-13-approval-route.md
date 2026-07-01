# Lesson 13 - Approval Route (approval-route)

- Lesson type: handoff | Interaction: jsonEditor | Validator: jsonFields (existing)
- Artifact: approval-route.json | Difficulty: Intermediate | Clock: 6:40 AM
- Build wave: A (no engine changes)

## Theory

- Invariant: a human-in-the-loop handoff is only automation-grade when the human's
  response is CAPTURED AS A RECORD. The message thread is where the approval
  happened; the record is what the workflow can act on and what the audit reads.
- Mental-model shift: from "the manager approved it" (a fact in someone's memory or
  a chat scroll) to "approval-route.json exists" (a fact in the system). If it is
  not captured, downstream automation cannot see it.
- Recognition cue: whenever a process includes "send it to X for sign-off", ask
  what OBJECT the response becomes. Chat and email are transport; the record is
  the artifact. If the answer is "the thread", the automation is not done.

## Artifact contract (condensed)

- Purpose: capture who approved today's escalated brief, when, and against which
  request, as a reusable audit record.
- Produced by: the workflow's handoff step (learner extracts the record from the
  exchange).
- Upstream inputs: decision-log.json (day-1 routed here), approval-template.json
  (the request format - note the subject line reappearing).
- Immediate consumer: Morning Brief (prints the approval status line).
- Complete means: the brief can state its approval status without anyone re-reading
  the chat thread.

## Learning contract

- Primary concept: capturing a human response as a structured record.
- Supporting: human-in-the-loop approvals, transport vs record, template reuse
  (the request instance follows lesson 11's format).
- Accomplishment: "I turned a chat approval into the auditable record the brief
  and the audit trail rely on."
- Capability Statement: "The workflow can now capture a human approval response as
  an auditable record."

## Lesson JSON (create src/data/lessons/lesson-approval-route.json)

```json
{
  "id": "lesson-approval-route",
  "nodeId": "approval-route",
  "title": "Capture the Approval as a Record",
  "difficulty": "Intermediate",
  "skill": "Human-in-the-loop handoffs",
  "scenario": "It is 6:40 AM. The decision log routed today's brief to approval, the request went out using the governed template, and the Desk Manager just replied in the desk channel. A chat message is not something the workflow can act on. Your job is to capture the exchange as the approval record.",
  "inputType": "text",
  "inputLabel": "Desk Channel Exchange",
  "input": "[6:39 AM] Meridian Workflow -> Desk Manager\nSubject: APPROVAL NEEDED: ERCOT 13.3% - morning brief\nERCOT moved 13.3 percent day-over-day, above the 12 percent escalation threshold. Please respond within 30 minutes.\n\n[6:41 AM] Desk Manager -> Meridian Workflow\nApproved. Note the wind shortfall in the ops section.",
  "instructions": [
    "Identify which hub triggered the request and its percent move.",
    "Record who the request was sent to and who actually responded.",
    "Capture the decision word itself and the time it arrived.",
    "Return one JSON object - the approval record - then validate."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "{\n  \"hub\": \"\",\n  \"movePct\": \"\",\n  \"sentTo\": \"\",\n  \"decision\": \"\",\n  \"decidedBy\": \"\",\n  \"decidedAt\": \"\"\n}",
  "validation": {
    "type": "jsonFields",
    "requiredFields": ["hub", "movePct", "sentTo", "decision", "decidedBy", "decidedAt"],
    "expected": {
      "hub": "ERCOT",
      "decision": "approved",
      "sentTo": "Desk Manager",
      "decidedBy": "Desk Manager"
    },
    "acceptedValues": {
      "movePct": ["13.3", "13.3%"],
      "decidedAt": ["6:41", "6:41 AM", "06:41"]
    }
  },
  "copilotPrompt": "Extract an approval record from this exchange as JSON with hub, movePct, sentTo, decision, decidedBy, and decidedAt. Use the decision word from the response and the response timestamp.",
  "successMessage": "Approval captured. The brief can now state its sign-off status without anyone re-reading the thread.",
  "intro": {
    "heading": "Before you build: transport vs record",
    "sections": [
      {
        "title": "The chat is transport, not truth",
        "body": "The approval genuinely happened in the channel - but channels scroll away, and automation cannot act on a thread. The workflow needs the response captured as a structured record it can read."
      },
      {
        "title": "The template did its job",
        "body": "Look at the outgoing message: it follows the subject format and required fields you governed in the Approval Template lesson. That is why the manager could answer in two minutes - handoffs are fast when requests are standard."
      },
      {
        "title": "What an approval record must hold",
        "body": "Who was asked, what they were asked about, what they decided, who decided, and when. Those five facts are what an auditor - or tomorrow's automation - needs to trust the sign-off."
      },
      {
        "title": "Real-world note",
        "body": "At work this handoff would ride on Teams, email, or an approvals app, and capturing the response would be an integration. The lab simulates the transport but keeps the important part real: the response becomes a record."
      }
    ],
    "jsonExample": "{\n  \"hub\": \"PJM\",\n  \"movePct\": \"14.2\",\n  \"sentTo\": \"Site Manager\",\n  \"decision\": \"approved\",\n  \"decidedBy\": \"Site Manager\",\n  \"decidedAt\": \"6:50 AM\"\n}",
    "skill": "Human-in-the-loop handoffs",
    "artifactName": "approval-route.json"
  },
  "fieldGuide": [
    {
      "field": "hub",
      "meaning": "The hub that triggered the escalation.",
      "type": "string",
      "example": "\"ERCOT\"",
      "hint": "Named in the request subject line."
    },
    {
      "field": "movePct",
      "meaning": "The percent move stated in the request.",
      "type": "string",
      "example": "\"13.3\"",
      "hint": "From the request body or subject."
    },
    {
      "field": "sentTo",
      "meaning": "Who the request was addressed to.",
      "type": "string",
      "example": "\"Desk Manager\"",
      "hint": "The recipient of the 6:39 message."
    },
    {
      "field": "decision",
      "meaning": "The decision word from the response.",
      "type": "string",
      "example": "\"approved\"",
      "hint": "Use the first word of the reply."
    },
    {
      "field": "decidedBy",
      "meaning": "Who actually responded.",
      "type": "string",
      "example": "\"Desk Manager\"",
      "hint": "The sender of the reply. Asked and answered can differ in real life - record who answered."
    },
    {
      "field": "decidedAt",
      "meaning": "When the response arrived.",
      "type": "string",
      "example": "\"6:41 AM\"",
      "hint": "The timestamp on the reply."
    }
  ],
  "takeaway": {
    "heading": "Approval record captured",
    "points": [
      "You converted a chat exchange into approval-route.json - the response is now a fact in the system, not a fact in a thread.",
      "The record holds the five audit facts: who was asked, about what, what they decided, who decided, and when.",
      "The governed template from the previous lesson is what made the request instant to read and answer.",
      "The Morning Brief will print its approval line straight from this record - and the manager's ops note foreshadows the brief's Operations section.",
      "The workflow can now capture a human approval response as an auditable record."
    ],
    "artifactName": "approval-route.json"
  }
}
```

## Wiring

1. Register lesson-approval-route in src/App.jsx.
2. Set `"taskId": "lesson-approval-route"` on node `approval-route` in
   src/data/workflowNodes.json.
3. No validator changes. All comparisons are normalize-based expected values or
   acceptedValues lists; "Approved" passes for "approved".

## Acceptance checklist

- [ ] Missing decidedAt fails presence; wrong decidedBy fails with the expected-value message.
- [ ] movePct entered as the number 13.3 passes (normalize stringifies it).
- [ ] Correct answer stores approval-route.json; morning-brief node shows it upstream.
- [ ] Lint/build pass; no-scroll verified in wrong-answer state.
