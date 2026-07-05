# Lesson 05 - Forecast Data (forecast-data)

- Lesson type: inspection | Interaction: choiceCheck (new)
- Artifact: source-profile-forecast-data.json | Difficulty: Beginner | Clock: 6:18 AM
- Build wave: B (requires choiceCheck)
- Closes NODE_AUDIT item 10 for this node: the fixture is the forecast values the
  Variance Check lesson already consumes (canon: ERCOT 170, SPP 96, MISO 80).

## Theory

- Invariant: a measurement means nothing until it is COMPARED against a reference -
  and every reference input raises two design questions: which source is
  authoritative (source of truth), and what KEY joins it to the data it gives
  meaning to.
- Mental-model shift: from "more data is more inputs" to "some inputs exist only
  to give other inputs meaning." The forecast is never in the brief for its own
  sake; it exists so 187 can become '+17 over forecast'.
- Recognition cue: in any workflow, sort the inputs into measurements vs
  references. Then for each reference ask: who owns it, and what field joins it?
  If two teams use different forecasts, the automation is deciding a turf war.

## Artifact contract (condensed)

- Purpose: prove the comparison input's role, join key, and source-of-truth
  requirement are understood before variance math uses it.
- Immediate consumer: Variance Check (lesson 09) computes vsForecast from it.
- Complete means: the learner can state what the forecast is FOR, how it joins to
  actuals, and why authority over it must be agreed.

## Learning contract

- Primary concept: reference inputs and source-of-truth.
- Supporting: joining datasets by key, authoritative-source selection.
- Accomplishment: "I identified the input that exists to give the actuals meaning,
  and the agreement it depends on."
- Capability Statement: "The workflow can now compare actual prices against an
  agreed forecast reference."

## Lesson JSON (create src/data/lessons/lesson-forecast-data.json)

```json
{
  "id": "lesson-forecast-data",
  "nodeId": "forecast-data",
  "title": "Inspect the Comparison Input",
  "difficulty": "Beginner",
  "skill": "Reference inputs & source of truth",
  "scenario": "It is 6:18 AM. Alongside the price feed, a second numeric input arrived: the overnight forecast. It looks like more price data - it is not. Inspect it to understand what kind of input it is and what agreement it silently depends on.",
  "inputType": "text",
  "inputLabel": "Overnight Forecast",
  "input": "Forecast per hub, published nightly by the desk's forecast model:\nERCOT: 170\nSPP: 96\nMISO: 80\n\nNote: a vendor also sells a competing forecast. The desk agreed that the internal model is the authoritative forecast for the morning brief.",
  "instructions": [
    "Compare this input's role to the price feed's role - they are not the same kind of input.",
    "Answer the four reference questions.",
    "Validate to record the profile."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "What role does the forecast play in this workflow?",
        "options": [
          { "id": "a", "text": "A backup price source in case the feed fails" },
          { "id": "b", "text": "A reference input - it exists to give the actual prices meaning" },
          { "id": "c", "text": "The primary source of hub prices" }
        ],
        "correctOptionId": "b",
        "explain": "The forecast never appears in the brief by itself - it exists so a price like 187 can become 'plus 17 over forecast'. Inputs that give other inputs meaning are references, not measurements."
      },
      {
        "id": "q2",
        "prompt": "How does the forecast connect to the actual prices?",
        "options": [
          { "id": "a", "text": "Joined by hub - each forecast value matches the actual for the same hub" },
          { "id": "b", "text": "By row order - first forecast goes with first price row" },
          { "id": "c", "text": "By timestamp - values from the same minute pair up" }
        ],
        "correctOptionId": "a",
        "explain": "Both datasets carry the hub name - that shared field is the join key. Row order is a coincidence a comparison must never rely on."
      },
      {
        "id": "q3",
        "prompt": "What must be agreed BEFORE this input is used in comparisons?",
        "options": [
          { "id": "a", "text": "Which forecast is authoritative - the desk model or the vendor's" },
          { "id": "b", "text": "What color the forecast renders in the brief" },
          { "id": "c", "text": "Nothing - any forecast works if the math is right" }
        ],
        "correctOptionId": "a",
        "explain": "The note says a competing vendor forecast exists. If two steps compare against different forecasts, the workflow contradicts itself with perfect math - authority is a governance agreement, not a calculation."
      },
      {
        "id": "q4",
        "prompt": "Which workflow step consumes the forecast first?",
        "options": [
          { "id": "a", "text": "Risk Evaluation" },
          { "id": "b", "text": "Variance Check" },
          { "id": "c", "text": "Market Intake Record" }
        ],
        "correctOptionId": "b",
        "explain": "Follow the map: the step that computes actual-minus-forecast is where this reference is first needed."
      }
    ],
    "artifactOnPass": {
      "source": "forecast-data",
      "role": "reference input (gives actuals meaning)",
      "joinKey": "hub",
      "authoritativeSource": "internal desk forecast model (agreed over vendor forecast)",
      "schedule": "published nightly",
      "firstConsumer": "variance-check"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Profile this forecast as a reference input: its role relative to the actuals, the key that joins it, the source-of-truth agreement it depends on, and its first consumer.",
  "successMessage": "Reference profiled. When Variance Check computes vsForecast, you will know which forecast, joined how, and why.",
  "intro": {
    "heading": "Before you inspect: measurements vs references",
    "sections": [
      {
        "title": "Two kinds of numeric input",
        "body": "The price feed MEASURES the world. The forecast is different: it is a reference - a number that exists so measurements can be judged. Sorting inputs into these two kinds is a designer's reflex."
      },
      {
        "title": "Joins need a key",
        "body": "To compare 187 against 170 you must know both belong to ERCOT. The hub field is the join key. Comparisons that rely on row order instead of a key break silently the first time order changes."
      },
      {
        "title": "Source of truth is an agreement",
        "body": "Two forecasts exist; the desk agreed the internal model wins for this workflow. That agreement is governance, and it happened before any math. Automation that skips it produces confidently inconsistent answers."
      },
      {
        "title": "Lab vs work",
        "body": "In the lab the forecast is shown inline. At work it would be a model output or vendor API, with its own access and schedule - the map's node panel records that reality."
      }
    ],
    "jsonExample": "{\n  \"role\": \"reference input\",\n  \"joinKey\": \"hub\",\n  \"firstConsumer\": \"variance-check\"\n}",
    "skill": "Reference inputs & source of truth",
    "artifactName": "source-profile-forecast-data.json"
  },
  "takeaway": {
    "heading": "Reference profiled",
    "points": [
      "You classified the forecast correctly: a reference that gives measurements meaning, not another measurement.",
      "You named the join key (hub) - the field every comparison in this module quietly depends on.",
      "You surfaced the governance agreement underneath: which forecast is authoritative was decided by people, not math.",
      "Variance Check consumes this reference next - vsForecast is only meaningful because of what you just verified.",
      "The workflow can now compare actual prices against an agreed forecast reference."
    ],
    "artifactName": "source-profile-forecast-data.json"
  }
}
```

## Wiring

1. Requires choiceCheck (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-forecast-data in src/App.jsx.
3. Set `"taskId": "lesson-forecast-data"` on node `forecast-data` in
   src/data/workflowNodes.json. Update the node's labVersion text if it still says
   the source is not wired up - the fixture is the forecast values in this lesson.

## Acceptance checklist

- [ ] Wrong q3 answer surfaces the two-forecasts governance explain.
- [ ] Pass stores source-profile-forecast-data.json; node completes.
- [ ] No page scroll at 800px in wrong-answer state; lint/build pass.
