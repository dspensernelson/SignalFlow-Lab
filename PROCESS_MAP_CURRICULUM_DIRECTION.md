# Process Map Curriculum Direction

This document captures the next product direction after the accepted MVP baseline. It does not replace `signalflow-lab-mvp-spec-v2.md`; it scopes the next canvas and lesson-model pass.

See `PRODUCT_DOCTRINE.md` for the concise purpose, guiding principles, progression model, and lesson quality bar.

## Core Principle

The process map is the curriculum.

Learners should not move through abstract lesson cards beside a separate workflow diagram. They should click into the actual workflow map, complete short tasks, and see the workflow come alive node by node.

## Product Intent

SignalFlow Lab should teach work as systems. Lessons are short, focused actions inside a larger network of sources, artifacts, decisions, handoffs, and reusable outputs.

The learner should understand:

- Where inputs come from.
- How those inputs are obtained in real work.
- What access, permissions, subscriptions, or credentials might be needed.
- What the lab is simulating locally.
- Which artifacts get produced.
- Which downstream nodes reuse those artifacts.
- How a solo builder could recreate the workflow step by step.

## Map Model

The main canvas should become a workflow blueprint, not a course dashboard.

Workflow nodes can represent:

- Source: where work enters the system.
- Reference: reusable rules, policies, templates, thresholds, schemas, or lookups the workflow depends on.
- Artifact: a reusable output produced by a task.
- Process: a transformation or analysis step.
- Decision: a branch, threshold, approval, or routing question.
- Handoff: a human or system transition.
- Output: a deliverable, distribution, archive, or report.
- Archive: a saved record used for audit, retention, traceability, or future reuse.

A node should represent either a thing or an action. If a label could mean both, rename it or clarify it in the selected node panel.

The first Meridian workflow can include nodes like:

- Analyst Notes
- Trader Flag
- Prior Day Brief
- Market Intake Record
- Price Feed / CSV Rows
- Clean Price Data
- Threshold Policy
- Risk Evaluation
- Approval Decision
- Approval Route
- Morning Brief
- Distribution / Archive

The map does not need to make the learner complete every item at once. It should show the real shape of work while each task stays short.

## Node Metadata

Each workflow node should be data-driven and explain both lab reality and work reality.

Suggested fields:

```json
{
  "id": "analyst-notes",
  "label": "Analyst Notes",
  "type": "source",
  "description": "Unstructured overnight market commentary from the market desk.",
  "labVersion": "Local text fixture in lesson-intake.json",
  "realWorldSources": [
    "Analyst email",
    "Bloomberg or market terminal note",
    "Teams market-watch channel",
    "Internal desk log"
  ],
  "accessNeeded": [
    "Inbox or channel access",
    "Market data terminal subscription",
    "Internal system permission"
  ],
  "soloRebuildPath": [
    "Start with a local .txt fixture",
    "Move to a watched folder",
    "Later replace with email/API ingestion"
  ],
  "reusedBy": ["market-intake-record"]
}
```

## Selected Node Detail

When a user clicks a workflow node, show a detail panel with:

- What this is.
- Where it comes from.
- The automation concept it introduces.
- In the lab.
- At work.
- Access or source requirements.
- Governance context where relevant.
- What reuses it downstream.
- How to recreate it solo.
- Which short task completes it, if any.
- Artifact status, if any.

## Lesson / Task Relationship

The task is the short work burst that completes a workflow node.

For the current build:

- The Intake task completes the Market Intake Record workflow node.
- The Threshold Policy task completes the Threshold Policy workflow node.
- The Clean Price Data task completes the Clean Price Data workflow node.
- The Analyst Notes node explains source provenance and lab simulation.
- Other nodes remain visible with lesson intent but locked or stubbed until future passes.

Task flow should follow:

1. Intro
2. Exercise
3. Takeaway

The Intro explains the concept and where the work comes from. The Exercise is the focused action. The Takeaway shows the produced artifact and how it feeds the rest of the map.

## Map Completion Behavior

Completing a task should visually update the workflow map.

Example:

- Before Intake: Analyst Notes is available as source context; Market Intake Record is ready.
- After Intake: Market Intake Record is complete and `market-intake.json` is available.
- Downstream nodes can show that they reuse `market-intake.json`, even if their tasks are not built yet.

## Design Feel

The canvas should feel like a workplace workflow blueprint:

- Operational, calm, and process-aware.
- More like a lightweight systems diagram than a course homepage.
- Clear enough for beginners, but honest about messy real work.

Avoid making the learner do all the complexity. Let the map show complexity while each task remains focused.

## Acceptance Checks For This Direction Pass

- The main canvas is a workflow map, not just a linear row of lesson cards.
- The graph is readable without horizontal scrolling on standard desktop widths.
- Phases annotate the workflow without visually caging the process flow.
- Workflow nodes are clickable.
- Selecting a node shows provenance, reuse, and rebuild context.
- The Intake task can still be launched and completed.
- Completing Intake marks the relevant workflow artifact complete.
- Completing Threshold Policy marks the governance reference artifact complete.
- Completing Clean Price Data marks the normalized price table artifact complete.
- Artifact viewing still works.
- Other nodes remain visible but not fully buildable.
- Existing validation and localStorage behavior still work.
- Lint and build pass.
