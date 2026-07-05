# Lesson 10 - Risk Evaluation (risk-evaluation)

- Lesson type: transformation | Interaction: jsonEditor | Validator: jsonDeltas (existing)
- Artifact: risk-evaluation.json | Difficulty: Intermediate | Clock: 6:30 AM
- Build wave: A (no engine changes)

## Theory

- Invariant: a rules engine is nothing more than POLICY APPLIED TO DATA, emitting a
  decision-ready record. The policy (thresholds) and the data (variance) were built
  by earlier steps; this step only joins them and classifies.
- Mental-model shift: from "risk is a judgment someone makes" to "risk is a
  classification a rule produces - and because the rule is a governed object, the
  classification is consistent and auditable."
- Recognition cue: whenever a workflow asks "does this matter?", look for the two
  inputs: where is the rule stored, and where is the measured value? If either is
  implicit (in someone's head, in code), that is the automation gap.
- Explicitly taught here: the map has TWO materiality rules that look similar but
  are different - Variance Check's material flag (absolute move of 10 or more vs
  FORECAST) and Threshold Policy's percent bands (vs PRIOR DAY). Different owners,
  different consumers. Real workflows are full of near-duplicate rules; naming the
  difference is the skill.

## Artifact contract (condensed)

- Purpose: turn measured variance into a classification downstream routing can act
  on without re-reading any policy or any raw data.
- Produced by: the workflow's evaluation step (the learner acts as the rules engine).
- Upstream inputs: variance-summary.json (day-over-day moves), threshold-policy.json
  (routine 5 / escalation 12, percent vs prior day).
- Immediate consumers: Approval Decision (needs status per hub, especially any
  "escalate"); Morning Brief (cites the classification).
- Complete means: every hub has a policy-consistent status, so Approval Decision can
  route the brief without recomputing or reinterpreting anything.

## Learning contract

- Primary concept: applying governed policy to data (rules engine).
- Supporting: classification bands, boundary inclusivity (">= 12" escalates),
  absolute value of a move, rule ownership.
- Accomplishment: "I applied the desk's governed thresholds to today's moves and
  produced the risk record the routing step trusts."
- Capability Statement: "The workflow can now produce a decision-ready risk signal
  from upstream artifacts."

## Lesson JSON (create src/data/lessons/lesson-risk-evaluation.json)

```json
{
  "id": "lesson-risk-evaluation",
  "nodeId": "risk-evaluation",
  "title": "Apply the Threshold Policy to Today's Moves",
  "difficulty": "Intermediate",
  "skill": "Rules engine: policy applied to data",
  "scenario": "It is 6:30 AM. The variance summary and the threshold policy both exist as trusted artifacts. Nobody should be eyeballing numbers now. Your job is to act as the rules engine: apply the governed thresholds to each hub's day-over-day move and emit the risk record the routing step will act on.",
  "inputType": "text",
  "inputLabel": "Policy + Today's Moves",
  "input": "Threshold Policy v1.0.0 (owner: Risk Desk Lead, applies to the day-over-day percent move, using the size of the move regardless of direction):\n- Under 5 percent: normal - no note needed.\n- 5 percent or more, but under 12: routine - the brief must note it.\n- 12 percent or more: escalate - manager approval required before the brief is sent.\n\nDay-over-day percent moves (derived from variance-summary.json):\nERCOT: +13.3\nSPP: +4.3\nMISO: -5.1\n\nNote: this policy is a different rule from the Variance Check's material flag (which compares against FORECAST). Two steps, two owned rules.",
  "instructions": [
    "Read the three policy bands and note that the boundaries are inclusive (12 or more escalates).",
    "For each hub, copy its day-over-day percent move into pctMove as a plain number.",
    "Classify each hub using the SIZE of the move: MISO's -5.1 counts as 5.1.",
    "Set status to exactly one of: normal, routine, escalate.",
    "Return a JSON array with one object per hub, then validate."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "[\n  { \"hub\": \"ERCOT\", \"pctMove\": 0, \"status\": \"\" },\n  { \"hub\": \"SPP\", \"pctMove\": 0, \"status\": \"\" },\n  { \"hub\": \"MISO\", \"pctMove\": 0, \"status\": \"\" }\n]",
  "validation": {
    "type": "jsonDeltas",
    "keyField": "hub",
    "requiredFields": ["hub", "pctMove", "status"],
    "numericFields": ["pctMove"],
    "expectedRows": [
      { "hub": "ERCOT", "pctMove": 13.3, "status": "escalate" },
      { "hub": "SPP", "pctMove": 4.3, "status": "normal" },
      { "hub": "MISO", "pctMove": -5.1, "status": "routine" }
    ]
  },
  "copilotPrompt": "Apply these threshold bands to each hub's day-over-day percent move: under 5 is normal, 5 or more but under 12 is routine, 12 or more is escalate. Use the absolute value of the move for classification but keep the signed move in pctMove. Return a JSON array of { hub, pctMove, status }.",
  "successMessage": "Risk record built. Approval Decision can now route the brief on a classification, not a hunch.",
  "intro": {
    "heading": "Before you build: policy applied to data",
    "sections": [
      {
        "title": "What a rules engine really is",
        "body": "A rules engine is not magic: it is a governed rule joined to measured data, emitting a classification. The thresholds were set and versioned in the Threshold Policy lesson. The moves were computed in Variance Check. This step only applies one to the other."
      },
      {
        "title": "Why the classification is its own artifact",
        "body": "If routing re-read the policy and recomputed the moves itself, two steps could disagree. Storing risk-evaluation.json means every later step acts on the same, auditable classification."
      },
      {
        "title": "Boundaries are part of the rule",
        "body": "The policy says 12 percent OR MORE escalates. Inclusive boundaries are where automations silently disagree with their owners - a move of exactly 12 must escalate. Direction does not matter for classification: a drop of 5.1 percent is still a routine-sized move."
      },
      {
        "title": "Two rules that look alike",
        "body": "Variance Check flagged materiality against FORECAST (absolute 10 or more). This policy classifies against PRIOR DAY (percent bands). They are owned by different steps and consumed by different steps. Spotting near-duplicate rules like this is a core automation skill."
      }
    ],
    "jsonExample": "[\n  { \"hub\": \"PJM\", \"pctMove\": 6.2, \"status\": \"routine\" }\n]",
    "skill": "Rules engine: policy applied to data",
    "artifactName": "risk-evaluation.json"
  },
  "fieldGuide": [
    {
      "field": "hub",
      "meaning": "The market hub for this risk row.",
      "type": "string",
      "example": "\"ERCOT\"",
      "hint": "One object per hub: ERCOT, SPP, MISO."
    },
    {
      "field": "pctMove",
      "meaning": "The day-over-day percent move, signed, as a plain number.",
      "type": "number",
      "example": "13.3",
      "hint": "Copy the signed value from the input. Keep MISO negative."
    },
    {
      "field": "status",
      "meaning": "The policy classification for this hub.",
      "type": "string",
      "example": "\"escalate\"",
      "hint": "Exactly one of normal, routine, escalate. Classify on the size of the move, ignoring direction."
    }
  ],
  "takeaway": {
    "heading": "Risk record built",
    "points": [
      "You acted as the rules engine: governed thresholds joined to measured moves, emitting a classification.",
      "ERCOT escalates (13.3 is 12 or more), MISO is routine-sized despite moving down, SPP is normal.",
      "risk-evaluation.json is stored, so Approval Decision and the Morning Brief read the same auditable classification instead of re-deciding.",
      "You also separated two near-duplicate rules: material-vs-forecast belongs to Variance Check; percent-vs-prior-day belongs to this policy.",
      "The workflow can now produce a decision-ready risk signal from upstream artifacts."
    ],
    "artifactName": "risk-evaluation.json"
  }
}
```

## Wiring

1. Register lesson-risk-evaluation in src/App.jsx (import + lesson map entry).
2. In src/data/workflowNodes.json set `"taskId": "lesson-risk-evaluation"` on node
   `risk-evaluation`. No other node changes.
3. No validator changes: jsonDeltas already compares string fields (status) via
   normalize and numeric fields exactly.

## Acceptance checklist

- [ ] Wrong answer (e.g. SPP status "routine") fails with a bounded per-row message.
- [ ] status is case-insensitive ("Escalate" passes) - via normalize.
- [ ] pctMove as a string ("13.3") FAILS with the numeric message - intended.
- [ ] Correct answer stores risk-evaluation.json; node completes; downstream
      approval-decision node shows the new upstream artifact.
- [ ] npm run lint and npm run build pass; no page scroll at innerHeight >= 800 in
      the wrong-answer state.
