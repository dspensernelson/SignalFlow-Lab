# Lesson 17 - Distribution / Archive (distribution-archive)

- Lesson type: handoff | Interaction: jsonEditor | Validator: jsonFields (existing)
- Artifact: archive-record.json | Difficulty: Intermediate | Clock: 7:00 AM
- Build wave: A (no engine changes)
- Note: NODE_AUDIT flags this node's dual thing/action nature. Module 1 Easy keeps
  the single node and this lesson's copy addresses the dual role head-on. The node
  split (Distribution vs Archive) is deferred to the Medium pass.

## Theory

- Invariant: a workflow is not finished when the output is produced - it is
  finished when the output is DELIVERED to its audience, RETAINED for the record,
  and (in recurring workflows) FED BACK as the next run's input. Delivery,
  retention, and the loop are three jobs that usually hide inside one lazy final
  step; naming them is the lesson.
- Mental-model shift: from "the workflow is a line that ends" to "the daily
  workflow is a LOOP - today's archive is literally tomorrow's Prior Day
  Reference." The learner already consumed that baseline in lessons 06 and 09;
  now they produce it, closing the circle.
- Recognition cue: in any recurring automation, find where the last run's output
  re-enters. If nothing re-enters, ask what the process compares against and
  where THAT lives - there is usually an undocumented loop.

## Artifact contract (condensed)

- Purpose: record the delivery and retention of today's brief, and mark that it
  seeds tomorrow's baseline.
- Produced by: the workflow's final step (learner writes the run record).
- Upstream input: market-brief.md (the assembled brief from lesson 16).
- Immediate consumers: tomorrow's Prior Day Reference (the backward edge on the
  map); auditors and retention policy.
- Complete means: today's run can prove who got the brief and when, where the copy
  lives, how long it is kept, and tomorrow's run has its baseline.

## Learning contract

- Primary concept: closing the loop (delivery + retention + feedback into the next run).
- Supporting: distribution lists as governed audiences, retention policy, the
  backward edge on the map being temporal rather than circular.
- Accomplishment: "I shipped, kept, and looped the day's output - the workflow can
  now run again tomorrow because I finished today properly."
- Capability Statement: "The workflow can now deliver the brief and retain it as
  tomorrow's baseline."

## Lesson JSON (create src/data/lessons/lesson-distribution-archive.json)

```json
{
  "id": "lesson-distribution-archive",
  "nodeId": "distribution-archive",
  "title": "Deliver, Retain, and Seed Tomorrow",
  "difficulty": "Intermediate",
  "skill": "Closing the loop",
  "scenario": "It is 7:00 AM. The approved brief exists. Two jobs remain, and they are different jobs that share this final step: get the brief to the desk (delivery), and keep a copy where tomorrow's run and any auditor can find it (retention). Write the run record that proves both happened.",
  "inputType": "text",
  "inputLabel": "Distribution Runbook",
  "input": "Distribution runbook, morning brief:\n- At 7:00 AM the approved brief is sent to the Trading Desk DL (the governed distribution list - membership is owned, not ad hoc).\n- A copy is saved to the briefs-archive folder and retained for 30 days.\n- Tomorrow at 6:18 AM, the Variance Check will read this archived brief's prices as its prior-day baseline. Today's output is tomorrow's input.",
  "instructions": [
    "Record who received the brief and at what time.",
    "Record where the copy was archived and the retention period in days.",
    "Mark that this archive seeds tomorrow's prior-day baseline.",
    "Return one JSON object - the run record - then validate."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "{\n  \"deliveredTo\": \"\",\n  \"sendTime\": \"\",\n  \"archiveFolder\": \"\",\n  \"retentionDays\": 0,\n  \"seedsTomorrowBaseline\": false\n}",
  "validation": {
    "type": "jsonFields",
    "requiredFields": ["deliveredTo", "sendTime", "archiveFolder", "retentionDays", "seedsTomorrowBaseline"],
    "expected": {
      "deliveredTo": "Trading Desk DL",
      "archiveFolder": "briefs-archive"
    },
    "acceptedValues": {
      "sendTime": ["7:00", "7:00 AM", "07:00"],
      "retentionDays": ["30"],
      "seedsTomorrowBaseline": ["true"]
    }
  },
  "copilotPrompt": "Write a distribution-and-archive run record as JSON with deliveredTo, sendTime, archiveFolder, retentionDays, and seedsTomorrowBaseline, based on this runbook.",
  "successMessage": "Loop closed. The brief is delivered, retained, and already working as tomorrow's baseline.",
  "intro": {
    "heading": "Before you build: three jobs in the last step",
    "sections": [
      {
        "title": "Delivery is a handoff to an audience",
        "body": "The brief's audience is the Trading Desk DL - a governed list, not whoever someone remembered to cc. Sending to a governed list is what makes delivery repeatable and permission-controlled."
      },
      {
        "title": "Retention is a policy, not a habit",
        "body": "The copy goes to a named folder with a named retention period. Where outputs live and how long they are kept is a governance decision the workflow enforces - not something each run improvises."
      },
      {
        "title": "The archive is tomorrow's input",
        "body": "You used a prior-day baseline in Variance Check without asking where it came from. Now you know: it is this archive, one day older. The backward edge on the map is not a circular dependency - it crosses midnight."
      },
      {
        "title": "One node, two natures",
        "body": "Notice this step is both an action (distribute) and a thing (the archive). Meridian keeps them together for now and the map calls that out honestly - a future pass may split them into two nodes, which is what a workflow designer would eventually do."
      }
    ],
    "jsonExample": "{\n  \"deliveredTo\": \"Ops Weekly DL\",\n  \"sendTime\": \"8:00 AM\",\n  \"archiveFolder\": \"reports-archive\",\n  \"retentionDays\": 90,\n  \"seedsTomorrowBaseline\": true\n}",
    "skill": "Closing the loop",
    "artifactName": "archive-record.json"
  },
  "fieldGuide": [
    {
      "field": "deliveredTo",
      "meaning": "The governed audience that received the brief.",
      "type": "string",
      "example": "\"Trading Desk DL\"",
      "hint": "The distribution list named in the runbook."
    },
    {
      "field": "sendTime",
      "meaning": "When the brief went out.",
      "type": "string",
      "example": "\"7:00 AM\"",
      "hint": "The ship time from the runbook."
    },
    {
      "field": "archiveFolder",
      "meaning": "Where the retained copy lives.",
      "type": "string",
      "example": "\"briefs-archive\"",
      "hint": "The folder named in the runbook."
    },
    {
      "field": "retentionDays",
      "meaning": "How long the copy is kept, in days.",
      "type": "number",
      "example": "30",
      "hint": "A plain number from the runbook."
    },
    {
      "field": "seedsTomorrowBaseline",
      "meaning": "Whether this archive becomes tomorrow's prior-day baseline.",
      "type": "boolean",
      "example": "true",
      "hint": "The runbook's last line answers this."
    }
  ],
  "takeaway": {
    "heading": "Loop closed",
    "points": [
      "You finished the run properly: delivered to a governed audience, retained under a named policy, and recorded both.",
      "The backward edge on the map is now yours: this archive is exactly what Prior Day Reference will hand to tomorrow's Variance Check.",
      "Every artifact you built today - intake record, clean prices, variance, risk, approval, brief - is now part of one complete, auditable daily cycle.",
      "This was the last node: the Meridian workflow is fully assembled, end to end.",
      "The workflow can now deliver the brief and retain it as tomorrow's baseline."
    ],
    "artifactName": "archive-record.json"
  }
}
```

## Wiring

1. Register lesson-distribution-archive in src/App.jsx.
2. Set `"taskId": "lesson-distribution-archive"` on node `distribution-archive` in
   src/data/workflowNodes.json.
3. No validator changes. retentionDays via acceptedValues ["30"] accepts the number
   30 or the string "30" (normalize stringifies); seedsTomorrowBaseline via
   acceptedValues ["true"] accepts boolean true.

## Acceptance checklist

- [ ] seedsTomorrowBaseline: false fails; retentionDays 30 (number) passes.
- [ ] Correct answer stores archive-record.json and the node completes - with all
      17 lessons done, verify the whole map reads complete and the
      prior-day-reference node's detail panel still explains the temporal edge.
- [ ] Lint/build pass; no-scroll verified in wrong-answer state.
