# Engine Additions Spec - Module 1 Easy

Implementation spec for the engine work needed to make all 17 Module 1 Easy lessons
playable. Written to be executed by a junior or small-model builder without further
design decisions. Keep ASCII-only.

Scope of this spec:

1. New validator + interaction type: `choiceCheck` (used by 6 lessons).
2. New validator + interaction type: `templateSlots` (used by 1 lesson).
3. Lesson registration and node wiring rules (used by all 13 new lessons).
4. What does NOT change.

## 0. What does NOT change (hard constraints)

- Do NOT modify the matching logic of `jsonFields`, `jsonPolicy`, `jsonRows`, or
  `jsonDeltas` in `src/lib/validators.js`. New validators are ADDITIVE functions in
  the same file, registered in the `validators` map.
- Do NOT change `src/lib/progress.js` semantics. A lesson completes when its
  validator returns `passed: true`; the artifact is stored under
  `signalflow_artifacts` exactly as today.
- Every validator returns the shared result shape:
  `{ passed: boolean, results: [{ id, label, passed, message }], artifact: object|string|null }`.
- The Exercise screen must not page-scroll at innerHeight >= 800 in ANY state,
  including the wrong-answer state. Verify with
  `document.documentElement.scrollHeight === document.documentElement.clientHeight`
  after validating a wrong answer.
- Validation feedback stays bounded: per-item result rows in the existing
  ValidationResults area plus at most one "Fix this next" callout. Never a growing
  stack.

## 1. `choiceCheck` - deterministic inspection/interpretation quiz

Used by lessons: 01-analyst-notes, 02-trader-flag, 04-price-feed, 05-forecast-data,
06-prior-day-reference, 15-prior-day-brief-template.

Purpose: inspection and interpretation lesson types ask the learner to EXAMINE a
source and prove understanding (provenance, format, access, downstream consumer),
not to type an artifact. The interaction is a fixed set of single-choice questions
answered against the visible source material. Passing mints a small "profile"
artifact so these lessons still produce a stored object.

### 1.1 Lesson JSON contract

```json
{
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "Question text?",
        "options": [
          { "id": "a", "text": "Option A" },
          { "id": "b", "text": "Option B" },
          { "id": "c", "text": "Option C" }
        ],
        "correctOptionId": "b",
        "explain": "One sentence shown when the answer is wrong (names the check, points back at the source)."
      }
    ],
    "artifactOnPass": { "any": "author-defined object stored as the artifact" }
  }
}
```

Rules: 3 to 5 questions per lesson; exactly 3 options per question; exactly one
correct option; `explain` must reference the source material, not restate the
correct option letter.

### 1.2 Validator behavior (add function `choiceCheck` to validators.js)

Input `answer` is a JSON string of `{ questionId: optionId }` (the component
serializes its state). Algorithm:

1. Parse `answer` as JSON. On failure return the standard json-parse failure row.
2. For each `validation.questions[i]` in order, push one result row:
   - id: `choice-<question.id>`
   - label: `Question <index+1>`
   - passed: `parsed[question.id] === question.correctOptionId`
   - message when passed: `Correct.`
   - message when missing: `Answer question <index+1> before validating.`
   - message when wrong: the question's `explain` string.
3. `passed` = every row passed.
4. `artifact` = `validation.artifactOnPass` when passed, else null.

Do not reveal the correct option id in any message.

### 1.3 Component behavior (`ChoiceCheck` workspace inside LessonExercise)

- When `lesson.interactionType === 'choiceCheck'`, LessonExercise renders the
  ChoiceCheck workspace where the JSON editor normally sits. Source material panel,
  instructions, validate button, and ValidationResults remain in their standard
  positions. FieldGuide is not rendered for choiceCheck lessons (lesson JSON has
  `"fieldGuide": []`).
- Render each question as a compact radio group: prompt line + 3 options. All
  questions visible at once (max 5 questions x 3 options fits without scroll; use
  a 2-column grid on wide viewports if needed to satisfy the no-scroll rule).
- Selecting options never validates; the existing Validate button submits.
  The component serializes `{ questionId: optionId }` and passes it through the
  same validate path as the JSON editor.
- Wrong-answer state: mark failed question rows in ValidationResults exactly like
  field rows today; highlight the failed question numbers, do not clear the
  learner's selections.

## 2. `templateSlots` - assembly interaction

Used by lesson: 16-morning-brief.

Purpose: the assembly lesson type joins upstream artifacts into a deliverable. The
learner fills named slots in a fixed template by READING their stored artifacts,
not by re-deriving values. Passing renders the completed template and stores it as
a string artifact (the brief markdown).

### 2.1 Lesson JSON contract

```json
{
  "interactionType": "templateSlots",
  "validation": {
    "type": "templateSlots",
    "template": "Markdown text with {{slotId}} tokens.",
    "slots": [
      {
        "id": "peakPrice",
        "label": "Peak price",
        "numeric": true,
        "expected": 187,
        "hint": "From clean-prices.json, ERCOT row."
      },
      {
        "id": "approvalStatus",
        "label": "Approval status",
        "numeric": false,
        "accepted": ["approved", "Approved"],
        "hint": "From approval-route.json."
      }
    ]
  }
}
```

Rules: each slot has either `expected` (single value) or `accepted` (list); numeric
slots compare as numbers, others compare case-insensitively after trimming (reuse
the file's `normalize` helper). `hint` names the source artifact so the learner
looks things up instead of guessing.

### 2.2 Validator behavior (add function `templateSlots` to validators.js)

Input `answer` is a JSON string of `{ slotId: value }`. Algorithm:

1. Parse `answer`; standard json-parse failure row on error.
2. For each slot in order, push one result row (id `slot-<id>`, label the slot's
   `label`):
   - missing or empty after trim -> failed, message `Fill in: <label>. <hint>`
   - numeric slot: `Number(value)` must be finite and strictly equal to `expected`
     -> otherwise failed, message `<label> does not match the source artifact. <hint>`
   - text slot: normalize(value) must equal normalize(expected) or be included in
     accepted list (normalized) -> same failure message shape as numeric.
3. `passed` = all rows passed.
4. On pass, `artifact` = the `template` string with every `{{slotId}}` token
   replaced by the learner's value (string replacement, no other processing).
   On fail, `artifact` = null.

### 2.3 Component behavior (`TemplateSlots` workspace inside LessonExercise)

- Two-panel workspace: LEFT is the artifact shelf - a compact list of the
  learner's stored upstream artifacts (from `signalflow_artifacts`), each
  expandable to view its JSON (reuse ArtifactViewer's rendering in compact form,
  one expanded at a time). RIGHT is the template rendered with an inline input per
  `{{slotId}}` token (input width ~12ch, placeholder = slot label).
- The shelf must show at least: market-intake.json, clean-prices.json,
  variance-summary.json, risk-evaluation.json, approval-route.json. Missing
  artifacts render as locked rows naming the lesson that produces them.
- Validate serializes `{ slotId: value }` through the standard path.
- No-scroll: the template fits the panel; if vertical space is tight, the artifact
  shelf collapses to a single-row selector. Verify wrong-answer state.

## 3. Lesson registration and node wiring (applies to every new lesson)

For each lesson script in curriculum/module-01/easy/:

1. Create `src/data/lessons/<lesson-id>.json` with the exact JSON from the script's
   "Lesson JSON" section.
2. Register it in `src/App.jsx`: add the import and the entry in the lesson map
   (same pattern as the four existing lessons).
3. In `src/data/workflowNodes.json`, set the node's `taskId` to the lesson id.
   Change nothing else about the node unless the lesson script says so.
4. Do not modify `workflowEdges.json` or `phases.json` (Module 1 Easy adds no
   nodes or edges).
5. Run `npm run lint` and `npm run build`; both must pass.
6. Manual check: launch the lesson from its node, submit a WRONG answer, confirm
   bounded feedback and no page scroll, then submit the right answer, confirm the
   artifact appears in the Artifact Viewer and downstream nodes update.

## 4. Reuse map (which existing validator each new non-quiz lesson uses)

| Lesson | Validator | Notes |
| --- | --- | --- |
| 10-risk-evaluation | jsonDeltas | rows keyed by hub; numeric pctMove; string status matched via normalize |
| 11-approval-template | jsonPolicy | requiredFields + nonEmptyFields + one numericField; no ordering rule |
| 12-approval-decision | jsonDeltas | rows keyed by day; boolean compared via normalize ("true"), route via normalize |
| 13-approval-route | jsonFields | expected + acceptedValues only |
| 14-routine-update-path | jsonFields | expected + acceptedValues only |
| 17-distribution-archive | jsonFields | booleans validated via acceptedValues ["true"] (normalize(true) === "true") |

Known validator facts the lesson scripts rely on (do not "fix" these):

- jsonFields boolean special-casing applies ONLY to the field named
  `approvalRequired`; other lessons express booleans via acceptedValues ["true"].
- jsonPolicy checks numeric-ness and ordering, not numeric VALUES; that is
  intentional for governance lessons.
- jsonDeltas compares non-numeric required fields with normalize(), so booleans
  and lowercase status strings match case-insensitively.
- jsonRows/jsonDeltas ignore extra rows the learner adds beyond expectedRows;
  acceptable at Easy tier.
