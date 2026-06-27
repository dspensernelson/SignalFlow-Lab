# SignalFlow Lab MVP Spec v2.0

> Historical note: this is the accepted MVP baseline spec. The current post-MVP product doctrine and workflow-graph direction live in `PRODUCT_DOCTRINE.md` and `PROCESS_MAP_CURRICULUM_DIRECTION.md`.

## Build Intent

Build a local React web app called **SignalFlow Lab**.

The app teaches workplace automation through one project-based workflow:

**Project:** Meridian Morning Market Brief  
**Scenario:** Meridian Energy, a regional power trading firm, needs a morning workflow that turns messy overnight market inputs into an approval-ready market brief by 7:00 AM.

The process map is the core product. Lessons are how users build each component of the map.

## MVP Scope

Build the full app shell and one complete lesson.

The app must show all 5 workflow nodes, but only the first node should be buildable in this pass.

1. Intake - buildable
2. Structure - locked placeholder
3. Evaluate - locked placeholder
4. Route - locked placeholder
5. Brief - locked placeholder

Do not invent full lesson content for nodes 2-5. Stub them only.

## Tech Stack

- React + Vite
- Tailwind CSS
- Local JSON files
- localStorage for progress and artifacts
- No backend
- No login
- No database
- No real Microsoft, Teams, Outlook, Power Automate, or energy-market integrations
- No AI grading
- No React Router for MVP

Use simple React state for navigation:

```js
view = "canvas" | "lesson" | "artifact"
selectedNodeId = "intake"
```

## App Screens

### 1. Project Canvas

This is the home screen and the main product surface.

It shows:

- App name: SignalFlow Lab
- Project name: Meridian Morning Market Brief
- Project goal
- Progress count
- Five-node process map
- Selected node detail panel

### 2. Lesson Workspace

This is where the user completes the selected ready lesson.

It shows:

- Scenario brief
- Instructions
- Read-only input data
- Editable answer area
- Validate button
- Per-rule validation results
- Output preview
- Copyable Copilot prompt card

### 3. Artifact Viewer

This shows the artifact produced by a completed node.

For lesson 1, show the saved JSON artifact.

## Static Process Map Data

Store static node metadata in:

`/src/data/nodes.json`

Important: this file must not be the source of runtime progress. Do not store live status here.

```json
[
  {
    "id": "intake",
    "title": "Intake",
    "description": "Capture messy overnight market notes from analysts.",
    "businessOutput": "Structured market intake record",
    "skill": "Field extraction",
    "artifactName": "market-intake.json",
    "lessonId": "lesson-intake",
    "dependsOn": []
  },
  {
    "id": "structure",
    "title": "Structure",
    "description": "Convert raw CSV price rows into a clean data table.",
    "businessOutput": "Clean price data table",
    "skill": "Data transformation",
    "artifactName": "market-structure.json",
    "lessonId": "lesson-structure",
    "dependsOn": ["intake"]
  },
  {
    "id": "evaluate",
    "title": "Evaluate",
    "description": "Apply threshold rules to flag price movements.",
    "businessOutput": "Risk evaluation record",
    "skill": "Conditional logic",
    "artifactName": "market-evaluate.json",
    "lessonId": "lesson-evaluate",
    "dependsOn": ["structure"]
  },
  {
    "id": "route",
    "title": "Route",
    "description": "Generate an approval request or routine update.",
    "businessOutput": "Approval routing decision",
    "skill": "Approval logic",
    "artifactName": "market-route.json",
    "lessonId": "lesson-route",
    "dependsOn": ["evaluate"]
  },
  {
    "id": "brief",
    "title": "Brief",
    "description": "Produce the 7:00 AM morning market summary.",
    "businessOutput": "Morning market brief",
    "skill": "Output generation",
    "artifactName": "market-brief.md",
    "lessonId": "lesson-brief",
    "dependsOn": ["route"]
  }
]
```

## Runtime Progress Model

Runtime status must be derived from localStorage and dependencies.

Store progress in localStorage under two keys:

- `signalflow_progress`
- `signalflow_artifacts`

```json
{
  "signalflow_progress": {
    "intake": "ready",
    "structure": "locked",
    "evaluate": "locked",
    "route": "locked",
    "brief": "locked"
  },
  "signalflow_artifacts": {}
}
```

Allowed status values:

- `locked`
- `ready`
- `in-progress`
- `complete`

Initial state:

```json
{
  "intake": "ready",
  "structure": "locked",
  "evaluate": "locked",
  "route": "locked",
  "brief": "locked"
}
```

When the user passes lesson 1:

```json
{
  "intake": "complete",
  "structure": "ready",
  "evaluate": "locked",
  "route": "locked",
  "brief": "locked"
}
```

For this build pass, Structure can become ready visually, but clicking it should show a placeholder message: "This lesson is not built yet."

## Process Map Behavior

Default selected node, evaluated in order:

1. First `in-progress` node (handles the refresh-mid-lesson case: if the user reloads while a lesson is open, surface that node on the canvas rather than dropping them into a half-open lesson)
2. Else first `ready` node
3. Else first incomplete node
4. Else final node

Note: `in-progress` is checked first so a mid-lesson refresh recovers cleanly. On a normal first load (nothing started), no node is `in-progress`, so this falls through to the first `ready` node — Intake.

Click behavior:

- Any node can be selected.
- Locked nodes show metadata but no Start button.
- Ready nodes show Start Lesson.
- In-progress nodes show Continue Lesson.
- Complete nodes show View Artifact.

Node card display:

- Title
- Status badge
- Business output
- Skill

Card styles:

- `locked`: muted
- `ready`: highlighted
- `in-progress`: active border
- `complete`: completed check state

Desktop layout:

- Horizontal 5-node process map with arrows.
- Detail panel below or to the right.

Responsive requirement:

- Desktop-first, but on smaller screens the node cards and lesson panels must stack instead of overflowing.

## Lesson 1 Data

Store in:

`/src/data/lessons/lesson-intake.json`

```json
{
  "id": "lesson-intake",
  "nodeId": "intake",
  "title": "Turn Analyst Notes into Structured JSON",
  "difficulty": "Beginner",
  "skill": "Field extraction",
  "scenario": "It is 6:15 AM. An analyst at Meridian Energy has dropped overnight market notes into the intake system. The notes are unstructured. Your job is to extract the key fields the workflow needs before anything else can run.",
  "inputType": "text",
  "input": "Checked overnight prices. ERCOT hub spiked around 2am, hit $187/MWh briefly then settled near $142/MWh. Wind generation underperformed, about 60% of forecast. Gas prices up slightly. Trader flagged the hub spike for review. No action taken yet. Need approval if we move on this.",
  "instructions": [
    "Identify the market hub referenced.",
    "Find the peak price and the settled price.",
    "Find the generation source that underperformed.",
    "Determine whether approval was flagged.",
    "Return a valid JSON object with those fields."
  ],
  "interactionType": "jsonEditor",
  "starterAnswer": "{\n  \"hub\": \"\",\n  \"peakPrice\": \"\",\n  \"settledPrice\": \"\",\n  \"generationFlag\": \"\",\n  \"approvalRequired\": false\n}",
  "validation": {
    "type": "jsonFields",
    "requiredFields": [
      "hub",
      "peakPrice",
      "settledPrice",
      "generationFlag",
      "approvalRequired"
    ],
    "expected": {
      "hub": "ERCOT",
      "approvalRequired": true
    },
    "acceptedValues": {
      "peakPrice": ["187", "$187", "187/MWh", "$187/MWh"],
      "settledPrice": ["142", "$142", "142/MWh", "$142/MWh"],
      "generationFlag": [
        "Wind underperformed",
        "wind underperformed",
        "Wind generation underperformed",
        "wind generation underperformed"
      ]
    }
  },
  "copilotPrompt": "Extract structured JSON from this analyst note. Return fields for hub, peakPrice, settledPrice, generationFlag, and approvalRequired. Use true or false for boolean fields.",
  "successMessage": "Intake record built. The workflow now has structured data to work with."
}
```

## Validation Engine Contract

Build a reusable validation engine in:

`/src/lib/validators.js`

For this build pass, implement only `jsonFields`.

Design the file so more validators can be added later:

- `jsonFields`
- `csvColumns`
- `ruleBuilder`
- `markdownChecklist`

### `jsonFields` Requirements

The validator must:

1. Parse the user answer as JSON.
2. Return a failed result if parsing fails.
3. Check that all required fields exist.
4. Check exact expected values.
5. Check accepted alternative values where configured.
6. Return per-rule results.
7. Return the parsed user JSON as the artifact if all checks pass.

### Matching Rules (read carefully — do not guess)

These rules remove ambiguity so a correct-feeling answer never fails confusingly.

**String comparison for `acceptedValues`:**

- Normalize both the user value and each accepted value before comparing: convert to string, trim leading/trailing whitespace, and lowercase.
- A field passes if the normalized user value equals any normalized entry in that field's accepted list.
- Example: user `" $187/MWh "` matches accepted `"$187/MWh"`.

**Exact `expected` values:**

- For `hub`: normalize the same way (trim + lowercase) before comparing to `"ERCOT"`. So `"ercot"` and `"ERCOT"` both pass.
- For `approvalRequired` (boolean): coerce the user value before comparing to `true`.
  - Accept boolean `true`.
  - Accept the strings `"true"`, `"yes"`, `"y"`, `"1"` (case-insensitive, trimmed) as `true`.
  - Accept boolean `false` and the strings `"false"`, `"no"`, `"n"`, `"0"` as `false`.
  - Any other value fails that rule with a message telling the user to use `true` or `false`.

**General:** all field presence checks must run before value checks, so a missing field reports "missing field" rather than a confusing value mismatch.

Validator return shape:

```js
{
  passed: boolean,
  results: [
    {
      id: string,
      label: string,
      passed: boolean,
      message: string
    }
  ],
  artifact: object | string | null
}
```

Important: the artifact must come from the user's submitted answer after validation, not from a hardcoded `artifactOutput`.

## Lesson Workspace Behavior

When a ready node is started:

1. Set that node status to `in-progress`.
2. Load the lesson by `lessonId`.
3. Show the lesson workspace.
4. Pre-fill the answer editor with `starterAnswer`.

When Validate is clicked:

1. Run the correct validator based on `lesson.validation.type`.
2. Show all validation results.
3. If validation fails, keep the user in the lesson and leave the node status as `in-progress` (do not revert it to `ready`). The user can edit and re-validate.
4. If validation passes:
   - Save returned `artifact` to `signalflow_artifacts[nodeId]`.
   - Set current node to `complete`.
   - Unlock the next dependent node by setting it to `ready`.
   - Show success message.
   - Provide a Return to Canvas button.

## Artifact Viewer Behavior

When a completed node is selected:

- Show View Artifact button.
- Artifact viewer displays:
  - Artifact name
  - Node title
  - Pretty-printed JSON for lesson 1
  - Back to Canvas button

If no artifact exists for a completed node, show a friendly missing artifact message.

## Copilot Prompt Coach

In the lesson workspace, show a copyable card in the bottom panel.

The card must include:

- Heading: Copilot Prompt Coach
- The lesson's `copilotPrompt`
- Copy Prompt button
- Brief helper text: "Use this prompt when asking Copilot to help with a similar workflow."

This is static content. Do not build chat.

## Component Guidance

Use simple, readable components. Suggested structure:

```text
src/
  App.jsx
  data/
    nodes.json
    lessons/
      lesson-intake.json
  lib/
    progress.js
    validators.js
  components/
    ProjectCanvas.jsx
    ProcessMap.jsx
    NodeCard.jsx
    NodeDetail.jsx
    LessonWorkspace.jsx
    ArtifactViewer.jsx
    ValidationResults.jsx
    CopilotPromptCard.jsx
```

## Styling Direction

Use a clean Microsoft-style training workspace:

- restrained color palette
- readable panels
- clear status badges
- no playful mascot UI
- no gamified streaks or badges
- no decorative hero page

Use cards only for:

- process nodes
- lesson panels
- prompt card
- artifact viewer

Avoid oversized marketing-style hero sections.

## Build Order

Build in this order:

1. Scaffold React + Vite + Tailwind.
2. Add `nodes.json` and `lesson-intake.json`.
3. Build `progress.js` for localStorage read/write and initial state.
4. Build static Project Canvas with 5 nodes.
5. Add derived status from localStorage.
6. Add selected-node behavior and detail panel.
7. Add view state: canvas, lesson, artifact.
8. Build Lesson Workspace for `lesson-intake`.
9. Build `jsonFields` validator.
10. Wire Validate button to per-rule validation results.
11. On success, save user artifact and update progress.
12. Build Artifact Viewer.
13. Add Copilot Prompt Coach copy button.
14. Add basic responsive stacking for smaller screens.

## Do Not Build

- Do not build lessons 2-5 yet.
- Do not invent extra lesson content.
- Do not add React Router.
- Do not add a backend.
- Do not add accounts.
- Do not add a database.
- Do not add AI grading.
- Do not add real Microsoft integrations.
- Do not add charts unless required by the map.
- Do not add badges, streaks, points, or gamification.
- Do not make a marketing landing page.

## Acceptance Criteria

The build is acceptable when:

1. App opens to Project Canvas.
2. The five-node Meridian workflow is visible.
3. Intake is ready; all other nodes are locked.
4. Clicking Intake opens the lesson.
5. Lesson 1 loads from JSON.
6. User can edit the JSON answer.
7. Invalid JSON fails with clear validation feedback.
8. Missing required fields fail with per-rule feedback.
9. Wrong expected values fail with per-rule feedback.
10. Correct answer passes.
11. Passing saves the user's parsed JSON as the artifact.
12. Passing marks Intake complete.
13. Passing unlocks Structure as ready.
14. Completed Intake shows View Artifact.
15. Artifact Viewer shows the saved JSON.
16. Copilot prompt card has a working Copy Prompt button.
17. The app uses localStorage and survives refresh.
18. The layout remains usable on a smaller laptop viewport.

## Example Correct Answer for Manual Testing

```json
{
  "hub": "ERCOT",
  "peakPrice": "$187/MWh",
  "settledPrice": "$142/MWh",
  "generationFlag": "Wind underperformed",
  "approvalRequired": true
}
```
