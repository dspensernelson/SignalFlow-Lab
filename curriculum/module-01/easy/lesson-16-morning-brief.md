# Lesson 16 - Morning Brief (morning-brief)

- Lesson type: assembly | Interaction: templateSlots (new - see ENGINE_ADDITIONS_SPEC.md)
- Artifact: market-brief.md (a rendered STRING artifact) | Difficulty: Intermediate | Clock: 6:50 AM
- Build wave: C (requires templateSlots; sequence AFTER lessons 03, 07, 09, 10, 13
  are playable, since the learner reads their stored artifacts here)

## Theory

- Invariant: assembly READS upstream artifacts; it never re-derives them. The
  capstone skill of pipeline thinking is restraint: by the time you assemble, every
  number has already been extracted, cleaned, computed, classified, or approved
  exactly once, upstream, where it is auditable. Assembly that recomputes is a
  second source of truth waiting to disagree.
- Mental-model shift: from "writing the report is the work" to "the report is the
  cheapest step - IF the pipeline did its job." The learner physically experiences
  this: every slot is a lookup into an artifact they built, and the whole brief
  takes minutes.
- Recognition cue: watch anyone build a recurring report. Every value they
  RE-DERIVE (re-checking an email, re-doing arithmetic) marks a missing upstream
  artifact. The report is a map of the pipeline's gaps.

## Artifact contract (condensed)

- Purpose: the approval-ready 7:00 AM deliverable, rendered from the template
  structure and the day's stored artifacts.
- Upstream inputs (highest fan-in on the map): market-intake.json (operations
  note), clean-prices.json (peak/settled), variance-summary.json (context),
  risk-evaluation.json (headline move), approval-route.json (status line),
  source-profile-brief-template.json (the structure, verified in lesson 15).
- Immediate consumer: Distribution / Archive.
- Complete means: the brief states the day's facts with every value traceable to a
  stored artifact - no value in the brief exists nowhere else.

## Learning contract

- Primary concept: assembly (aggregation of artifacts into a deliverable).
- Supporting: lookup-not-recompute, single source of truth, rendering values into
  governed structure.
- Accomplishment: "I assembled the 7:00 AM brief entirely from artifacts I built -
  and never had to re-derive a single number."
- Capability Statement: "The workflow can now assemble upstream artifacts into an
  approval-ready morning brief."

## Lesson JSON (create src/data/lessons/lesson-morning-brief.json)

```json
{
  "id": "lesson-morning-brief",
  "nodeId": "morning-brief",
  "title": "Assemble the 7:00 AM Brief",
  "difficulty": "Intermediate",
  "skill": "Assembly from artifacts",
  "scenario": "It is 6:50 AM. Ten minutes to ship. Here is the payoff of the whole morning: every fact the brief needs already exists in an artifact you built. Fill each slot by LOOKING IT UP - the artifact shelf is on your left. If you find yourself recalculating anything, stop: the pipeline already did it.",
  "inputType": "text",
  "inputLabel": "Assembly Rule",
  "input": "Assembly rule: every slot value must come from a stored artifact. Sources: the headline hub and its percent move are in risk-evaluation.json (the escalated hub). Peak and settled prices are in clean-prices.json. The operations note is the generationFlag in market-intake.json. The approval line comes from approval-route.json. The brief day matches the decision log: day-1.",
  "instructions": [
    "Open each artifact on the shelf as you need it - do not work from memory.",
    "Fill the header slots from the approval record.",
    "Fill the headline slots from the risk record (which hub escalated, and its move).",
    "Fill the price slots from the clean price table and the operations slot from the intake record.",
    "Validate to render market-brief.md."
  ],
  "interactionType": "templateSlots",
  "validation": {
    "type": "templateSlots",
    "template": "# Meridian Morning Market Brief - {{briefDay}}\n\nStatus: {{approvalStatus}} by {{approvedBy}} at {{approvedAt}}\n\n## Headline\n{{headlineHub}} moved {{headlineMovePct}} percent day-over-day (peak {{peakPrice}}, settled {{settledPrice}}).\n\n## Hub Summary\nERCOT peak 187, settled 142 (vs forecast +17). SPP peak 96, settled 88 (vs forecast 0). MISO peak 74, settled 70 (vs forecast -6).\n\n## Operations\n{{operationsNote}}.\n\nPrepared by the Meridian workflow at 6:50 AM.",
    "slots": [
      {
        "id": "briefDay",
        "label": "Brief day",
        "numeric": false,
        "accepted": ["day-1", "today"],
        "hint": "The day the decision log routed to approval."
      },
      {
        "id": "approvalStatus",
        "label": "Approval status",
        "numeric": false,
        "expected": "approved",
        "hint": "The decision field in approval-route.json."
      },
      {
        "id": "approvedBy",
        "label": "Approved by",
        "numeric": false,
        "expected": "Desk Manager",
        "hint": "The decidedBy field in approval-route.json."
      },
      {
        "id": "approvedAt",
        "label": "Approved at",
        "numeric": false,
        "accepted": ["6:41", "6:41 AM", "06:41"],
        "hint": "The decidedAt field in approval-route.json."
      },
      {
        "id": "headlineHub",
        "label": "Headline hub",
        "numeric": false,
        "expected": "ERCOT",
        "hint": "The hub with status escalate in risk-evaluation.json."
      },
      {
        "id": "headlineMovePct",
        "label": "Headline move (percent)",
        "numeric": true,
        "expected": 13.3,
        "hint": "That hub's pctMove in risk-evaluation.json."
      },
      {
        "id": "peakPrice",
        "label": "Peak price",
        "numeric": true,
        "expected": 187,
        "hint": "The headline hub's peakPrice in clean-prices.json."
      },
      {
        "id": "settledPrice",
        "label": "Settled price",
        "numeric": true,
        "expected": 142,
        "hint": "The headline hub's settledPrice in clean-prices.json."
      },
      {
        "id": "operationsNote",
        "label": "Operations note",
        "numeric": false,
        "accepted": ["Wind underperformed", "wind underperformed", "Wind generation underperformed", "wind generation underperformed"],
        "hint": "The generationFlag field in market-intake.json."
      }
    ]
  },
  "fieldGuide": [],
  "copilotPrompt": "Assemble a brief by looking up values in stored artifacts: approval status/by/at from the approval record, the escalated hub and its move from the risk record, its peak and settled prices from the clean price table, and the operations note from the intake record. Do not recompute anything.",
  "successMessage": "Brief rendered. Every value in it is traceable to an artifact - the deliverable took minutes because the pipeline did the work.",
  "intro": {
    "heading": "Before you assemble: lookup, not recompute",
    "sections": [
      {
        "title": "The highest fan-in on the map",
        "body": "The Morning Brief consumes more upstream nodes than anything else - which is exactly why it is nearly the last lesson. Assembly is only cheap when everything it needs already exists as a trusted object."
      },
      {
        "title": "Why you must not recompute",
        "body": "The percent move is in the risk record. If assembly recalculated it and rounded differently, the brief and the audit trail would disagree - two sources of truth. Assembly reads; it does not derive."
      },
      {
        "title": "Structure meets values",
        "body": "The sections come from the template you verified in the last lesson. Today's values flow into its slots. Fixed structure plus flowing values - the templating pattern, now performed rather than inspected."
      },
      {
        "title": "Traceability is the quality bar",
        "body": "A brief is approval-ready when every claim in it can be traced to an artifact: the status line to the approval record, the headline to the risk record, the prices to the clean table. That property - not polish - is what makes it trustworthy."
      }
    ],
    "jsonExample": "{\n  \"headlineHub\": \"ERCOT\",\n  \"headlineMovePct\": 13.3,\n  \"approvalStatus\": \"approved\"\n}",
    "skill": "Assembly from artifacts",
    "artifactName": "market-brief.md"
  },
  "takeaway": {
    "heading": "Brief assembled",
    "points": [
      "You produced the morning's deliverable without deriving a single value - every slot was a lookup into an artifact you built.",
      "The brief is fully traceable: status to the approval record, headline to the risk record, prices to the clean table, operations to the intake record.",
      "This is why the whole pipeline exists: the visible deliverable became the easiest step of the morning.",
      "market-brief.md is stored as a rendered document - one node remains: deliver it and close the loop.",
      "The workflow can now assemble upstream artifacts into an approval-ready morning brief."
    ],
    "artifactName": "market-brief.md"
  }
}
```

## Wiring

1. Requires the templateSlots validator + component (ENGINE_ADDITIONS_SPEC.md
   section 2), including the artifact shelf reading from signalflow_artifacts.
2. Register lesson-morning-brief in src/App.jsx.
3. Set `"taskId": "lesson-morning-brief"` on node `morning-brief` in
   src/data/workflowNodes.json.
4. The stored artifact is the rendered template STRING (validators.js already
   allows string artifacts). Verify ArtifactViewer renders a string artifact
   readably (preformatted block); if it assumes objects, extend it minimally to
   display strings.

## Acceptance checklist

- [ ] With upstream artifacts missing, the shelf shows locked rows naming the
      producing lessons (per engine spec) - the lesson teaches its own dependency.
- [ ] headlineMovePct "13.30" passes (Number() equality); "13" fails with the
      lookup hint.
- [ ] operationsNote accepts the same variants as the intake lesson's
      generationFlag acceptedValues.
- [ ] Pass stores market-brief.md as a string; ArtifactViewer displays it;
      distribution-archive node shows it upstream.
- [ ] No page scroll at 800px in wrong-answer state (tallest: all 9 slots failed);
      lint/build pass.
