# Lesson 12 - Approval Decision (approval-decision)

- Lesson type: decision | Interaction: jsonEditor | Validator: jsonDeltas (existing)
- Artifact: decision-log.json | Difficulty: Intermediate | Clock: 6:38 AM
- Build wave: A (no engine changes)

## Theory

- Invariant: a decision node is an EXPLICIT, LOGGED branch. Three things make a
  branch automation-grade: the condition references a governed rule (not a vibe),
  the boundary is precisely defined (12.0 goes WHICH way?), and every evaluation is
  logged - including the ones where nothing happened.
- Mental-model shift: from "the workflow decides" to "the workflow evaluates a
  condition someone owns, and writes down what it decided." Decisions without logs
  are indistinguishable from bugs.
- Recognition cue: in any tool, when you see an if/else (a Condition card, a
  filter, a gateway), immediately ask the three questions: whose rule? which way
  does the boundary go? where is the decision recorded?

## Artifact contract (condensed)

- Purpose: encode the fork that routes each morning down the approval path or the
  routine path, and keep an auditable log of every evaluation.
- Produced by: the workflow's routing step (learner encodes and exercises it).
- Upstream inputs: risk-evaluation.json (any hub with status escalate ->
  escalationRequired true), threshold-policy.json (the 12-or-more rule).
- Immediate consumers: Approval Route (true branch), Routine Update Path (false
  branch); the log itself is an audit record.
- Complete means: given any morning's risk record, the workflow routes it the same
  way every time, and the routing is written down.

## Learning contract

- Primary concept: branching with explicit, inclusive boundaries.
- Supporting: decision logging, exercising a rule against multiple cases (the
  learner routes three different mornings, which is how you TEST a branch).
- Accomplishment: "I encoded the desk's escalation fork and proved it routes three
  different mornings correctly, including the boundary case."
- Capability Statement: "The workflow can now route the morning brief through the
  correct approval path."

## Lesson JSON (create src/data/lessons/lesson-approval-decision.json)

```json
{
  "id": "lesson-approval-decision",
  "nodeId": "approval-decision",
  "title": "Encode and Test the Escalation Branch",
  "difficulty": "Intermediate",
  "skill": "Branching & decision logging",
  "scenario": "It is 6:38 AM. Today's risk record says ERCOT escalates - but a branch you have only run once is a branch you have not tested. Route three mornings through the fork, including the exact-boundary case, and log each decision so the audit trail shows why each brief went where it went.",
  "inputType": "text",
  "inputLabel": "Rule + Three Mornings",
  "input": "Escalation rule (Threshold Policy v1.0.0): a day-over-day move of 12 percent OR MORE requires manager approval before the brief is sent. Escalated mornings route to approval-route; all others route to routine-update-path.\n\nThree mornings to route (biggest day-over-day move on the map that day):\nday-1 (today): 13.3 percent (ERCOT)\nday-2: 12.0 percent (SPP)\nday-3: 11.9 percent (ERCOT)",
  "instructions": [
    "For each day, record the biggest move as a plain number in biggestMovePct.",
    "Apply the rule: 12 or more means escalationRequired is true.",
    "Watch the boundary: day-2 is exactly 12.0 - the rule says OR MORE.",
    "Set route to approval-route or routine-update-path accordingly.",
    "Return a JSON array with one object per day, then validate."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "[\n  { \"day\": \"day-1\", \"biggestMovePct\": 0, \"escalationRequired\": false, \"route\": \"\" },\n  { \"day\": \"day-2\", \"biggestMovePct\": 0, \"escalationRequired\": false, \"route\": \"\" },\n  { \"day\": \"day-3\", \"biggestMovePct\": 0, \"escalationRequired\": false, \"route\": \"\" }\n]",
  "validation": {
    "type": "jsonDeltas",
    "keyField": "day",
    "requiredFields": ["day", "biggestMovePct", "escalationRequired", "route"],
    "numericFields": ["biggestMovePct"],
    "expectedRows": [
      { "day": "day-1", "biggestMovePct": 13.3, "escalationRequired": true, "route": "approval-route" },
      { "day": "day-2", "biggestMovePct": 12, "escalationRequired": true, "route": "approval-route" },
      { "day": "day-3", "biggestMovePct": 11.9, "escalationRequired": false, "route": "routine-update-path" }
    ]
  },
  "copilotPrompt": "Route three days through an escalation branch. Rule: a move of 12 percent or more sets escalationRequired true and route approval-route; otherwise escalationRequired false and route routine-update-path. Days: day-1 13.3, day-2 12.0, day-3 11.9. Return a JSON array of { day, biggestMovePct, escalationRequired, route }.",
  "successMessage": "Decision log built. The fork is tested, boundary included, and every evaluation is on the record.",
  "intro": {
    "heading": "Before you build: explicit branches",
    "sections": [
      {
        "title": "A branch is a condition someone owns",
        "body": "This fork does not invent a rule - it applies the Threshold Policy's 12-or-more escalation rule. The decision step evaluates; the policy decides. Keeping those separate is why the rule can change without rewiring the workflow."
      },
      {
        "title": "Boundaries are where automations go wrong",
        "body": "Is exactly 12.0 an escalation? The policy says OR MORE, so yes. Off-by-one boundary readings are among the most common automation bugs, which is why you test the exact-boundary case on purpose."
      },
      {
        "title": "Every decision gets logged",
        "body": "The fork produces no brief and no price - its product IS the routing record. If day-3 is questioned next week, the log shows: biggest move 11.9, threshold 12, routine path. No log, no answer."
      },
      {
        "title": "Testing a branch means multiple cases",
        "body": "One morning cannot prove a fork works. You route three: clearly over, exactly at, and just under the threshold. That trio is the minimum honest test of any threshold branch, in any tool."
      }
    ],
    "jsonExample": "[\n  { \"day\": \"day-9\", \"biggestMovePct\": 6.0, \"escalationRequired\": false, \"route\": \"routine-update-path\" }\n]",
    "skill": "Branching & decision logging",
    "artifactName": "decision-log.json"
  },
  "fieldGuide": [
    {
      "field": "day",
      "meaning": "Which morning this decision applies to.",
      "type": "string",
      "example": "\"day-1\"",
      "hint": "One object per day: day-1, day-2, day-3."
    },
    {
      "field": "biggestMovePct",
      "meaning": "The biggest day-over-day percent move that morning.",
      "type": "number",
      "example": "13.3",
      "hint": "A plain number from the input. 12.0 can be written as 12."
    },
    {
      "field": "escalationRequired",
      "meaning": "Whether the rule fires for this morning.",
      "type": "boolean",
      "example": "true",
      "hint": "true when the move is 12 or more. Exactly 12 counts."
    },
    {
      "field": "route",
      "meaning": "Which path the brief takes.",
      "type": "string",
      "example": "\"approval-route\"",
      "hint": "approval-route when escalationRequired is true, else routine-update-path."
    }
  ],
  "takeaway": {
    "heading": "Decision log built",
    "points": [
      "You encoded the fork as an explicit condition referencing the governed threshold, not a judgment call.",
      "You proved the boundary: exactly 12.0 escalates, because the rule says OR MORE.",
      "All three evaluations are logged, so 'why did day-3 skip approval?' has an on-the-record answer.",
      "Today (day-1) routes to Approval Route - that handoff is your next lesson; day-3 shows why the quiet path also needs a log.",
      "The workflow can now route the morning brief through the correct approval path."
    ],
    "artifactName": "decision-log.json"
  }
}
```

## Wiring

1. Register lesson-approval-decision in src/App.jsx.
2. Set `"taskId": "lesson-approval-decision"` on node `approval-decision` in
   src/data/workflowNodes.json.
3. No validator changes. jsonDeltas compares escalationRequired via normalize
   (String(true) -> "true"), so a real boolean true matches expected true; the
   string "true" would also pass, which is acceptable at Easy tier.

## Acceptance checklist

- [ ] day-2 with escalationRequired false fails (boundary teach) with a bounded message.
- [ ] biggestMovePct entered as 12.0 passes (JSON parses it to 12).
- [ ] route "Approval-Route" passes (normalize is case-insensitive) - fine.
- [ ] Correct answer stores decision-log.json; approval-route and
      routine-update-path nodes both show the decision upstream.
- [ ] Lint/build pass; no-scroll verified in wrong-answer state.
