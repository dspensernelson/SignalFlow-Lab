# PM Acceptance Punchlist

Use this as the PM pass/fail checklist for the current local build. The original MVP baseline remains documented in `signalflow-lab-mvp-spec-v2.md`; the current direction is documented in `PRODUCT_DOCTRINE.md` and `PROCESS_MAP_CURRICULUM_DIRECTION.md`.

## Canvas

- [ ] App opens to the Project Canvas.
- [ ] The canvas shows a phase-banded workflow graph, not a straight lesson row.
- [ ] The graph includes multiple inputs, reusable references, artifacts, processes, decisions, handoffs, outputs, and archive context.
- [ ] The graph is readable without horizontal scrolling on standard desktop widths.
- [ ] Selecting a node highlights upstream dependencies and downstream reuse.
- [ ] Selecting any node updates the detail panel.
- [ ] Source/reference/context nodes can be inspected without launching tasks.

## Intake Lesson

- [ ] Clicking the `Market Intake Record` buildable node can open Lesson 1.
- [ ] Lesson 1 content loads from `src/data/lessons/lesson-intake.json`.
- [ ] Lesson 1 uses Intro -> Exercise -> Takeaway.
- [ ] User can edit the JSON answer.
- [ ] Invalid JSON fails with clear feedback.
- [ ] Missing required fields fail with per-rule feedback.
- [ ] Wrong expected values fail with per-rule feedback.
- [ ] Correct answer passes.

## Threshold Policy Lesson

- [ ] Clicking the `Threshold Policy` buildable node can open the governance lesson.
- [ ] Lesson content loads from `src/data/lessons/lesson-threshold-policy.json`.
- [ ] User can edit the JSON policy answer.
- [ ] Invalid JSON fails with clear feedback.
- [ ] Missing required fields fail with per-rule feedback.
- [ ] Threshold values must be numeric, not strings or percent-formatted text.
- [ ] Escalation threshold must be greater than routine threshold.
- [ ] Correct policy passes.

## Clean Price Data Lesson

- [ ] Clicking the `Clean Price Data` buildable node can open the transformation lesson.
- [ ] Lesson content loads from `src/data/lessons/lesson-clean-price-data.json`.
- [ ] The exercise input panel header reads `Raw Price Rows`, not `Source Note`.
- [ ] User can edit the JSON rows answer.
- [ ] Invalid JSON fails with clear feedback.
- [ ] A non-array top-level shape fails with clear feedback.
- [ ] A row missing a required field fails with per-rule feedback.
- [ ] Price values left as strings (with $ or /MWh) fail because they must be numbers.
- [ ] A missing expected hub row fails with per-rule feedback.
- [ ] Correct normalized JSON passes.

## Completion Flow

- [ ] Passing saves the user's parsed JSON as `market-intake.json`.
- [ ] Passing marks `Market Intake Record` as `complete`.
- [ ] Passing Threshold Policy saves the user's parsed JSON as `threshold-policy.json`.
- [ ] Passing Threshold Policy marks `Threshold Policy` as `complete`.
- [ ] Passing Clean Price Data saves the user's parsed JSON array as `clean-prices.json`.
- [ ] Passing Clean Price Data marks `Clean Price Data` as `complete`.
- [ ] The completed artifact visually becomes reusable by downstream workflow nodes.
- [ ] Future buildable nodes remain visible but locked/stubbed unless explicitly scoped.
- [ ] Completed `Market Intake Record` shows a View Artifact action.
- [ ] Artifact Viewer shows the saved JSON.

## Persistence And UX

- [ ] Progress is stored under `signalflow_progress`.
- [ ] Artifacts are stored under `signalflow_artifacts`.
- [ ] Progress and artifact survive a page refresh.
- [ ] Copilot Prompt Coach displays the lesson prompt.
- [ ] Copy Prompt button copies the prompt.
- [ ] Layout remains usable on a smaller laptop viewport.

## Doctrine Checks

- [ ] Purpose and principles in `PRODUCT_DOCTRINE.md` still describe the build.
- [ ] Selected node panel explains lab version, real-world context, access/source needs, reuse, and solo rebuild path.
- [ ] Lessons end with a map-connected takeaway.

## Final Manual Test Answer

```json
{
  "hub": "ERCOT",
  "peakPrice": "$187/MWh",
  "settledPrice": "$142/MWh",
  "generationFlag": "Wind underperformed",
  "approvalRequired": true
}
```
