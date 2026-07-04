# Engine Additions Spec - Inspection + Handoff Interactions (anti-slop)

> **STATUS: PROPOSED - PENDING OWNER APPROVAL (spec-then-park).** This spec is
> written to ENGINE_ADDITIONS_SPEC.md fidelity but is NOT implemented. A new
> interaction type is owner-gated for this initiative (see the builder work
> order 2026-07-04 and OPEN_QUESTIONS "anti-slop: approve new interaction
> type(s)"). Do NOT build until the owner approves which type(s) land and how
> the Gate 4 one-per-module budget is treated. Existing validators' matching
> rules stay frozen forever; both additions below are ADDITIVE.

## Why this exists

Slop-and-Polish review Q5: choiceCheck (a 4-question radio quiz with one fixed
layout) is 38% of all lessons and the DEFAULT for every inspection node and
every handoff node. The learner's hands do the same thing dozens of times:
read, click a radio, click Validate. The content varies; the interaction does
not. This spec gives inspection and handoff nodes an ACTIVE alternative so the
choiceCheck share can drop toward the ~25% cap without losing determinism,
local-first validation, or the artifact-as-progress model.

Two additive interaction types, each mirroring the existing engine contract:

1. `tagSource` - an inspection interaction: tag which spans of a raw source are
   which fields (the real texture of intake design), replacing quiz trivia
   about the source.
2. `handoffForm` - a handoff interaction: capture the who/what/when of a human
   handoff as a small structured record, replacing multiple-choice about it.

## 0. What does NOT change (hard constraints, identical to ENGINE_ADDITIONS_SPEC)

- Do NOT modify the matching logic of `jsonFields`, `jsonPolicy`, `jsonRows`,
  `jsonDeltas`, `choiceCheck`, `templateSlots`, or `artifactImport` in
  `src/lib/validators.js`. The two new validators are ADDITIVE functions in the
  same file, registered in the `validators` map.
- Do NOT change `src/lib/progress.js` semantics. A lesson completes when its
  validator returns `passed: true`; the artifact is stored under the active
  tier/project key exactly as today.
- Every validator returns the shared result shape:
  `{ passed: boolean, results: [{ id, label, passed, message }], artifact: object|string|null }`.
- The Exercise screen must not page-scroll at innerHeight >= 800 in ANY state,
  including the wrong-answer state, at BOTH 1280x800 and 1366x650. Verify with
  `document.documentElement.scrollHeight === document.documentElement.clientHeight`
  after validating a wrong answer, at both viewports (compact `short:` mode
  applies below 720px).
- Validation feedback stays bounded: per-item rows in ValidationResults plus at
  most one "Fix this next" callout. Never a growing stack.
- Deterministic only: no AI grading, no fuzzy matching beyond the existing
  `normalize` (trim + lowercase) helper.
- Each new type mints a named artifact on pass, so these lessons still produce a
  business object a downstream node consumes.

## 1. `tagSource` - inspection by tagging, not trivia

Replaces choiceCheck on inspection/provenance nodes. The learner is shown a raw
source broken into candidate segments (chips) and must assign each REQUIRED
FIELD to the segment that holds its value. Getting the field-to-span mapping
right IS the proof of understanding, and it mints a real extracted field-map.

### 1.1 Lesson JSON contract

```json
{
  "interactionType": "tagSource",
  "validation": {
    "type": "tagSource",
    "source": {
      "label": "Overnight desk note",
      "segments": [
        { "id": "s1", "text": "Northwind Fasteners" },
        { "id": "s2", "text": "INV-58831" },
        { "id": "s3", "text": "PO-7742" },
        { "id": "s4", "text": "Net 30" },
        { "id": "s5", "text": "500 units @ $2.44" }
      ]
    },
    "fields": [
      {
        "id": "vendor",
        "label": "Vendor name",
        "correctSegmentId": "s1",
        "explain": "The vendor is the company that issued the invoice - the letterhead name, not the buyer."
      },
      {
        "id": "invoiceNumber",
        "label": "Invoice number",
        "correctSegmentId": "s2",
        "explain": "The invoice number starts with INV-; PO- is the purchase order, a different id."
      }
    ],
    "artifactOnPass": { "optional": "author-defined object; omit to auto-build" }
  }
}
```

Rules: 3 to 6 fields per lesson; at least `fields.length + 1` segments (so there
is always at least one distractor); every `correctSegmentId` must exist in
`source.segments`; each `field.explain` references the source, never restates
the correct segment id. Two fields MAY share a `correctSegmentId` only if the
lesson intends it (default: unique).

### 1.2 Validator behavior (add function `tagSource` to validators.js)

Input `answer` is a JSON string of `{ fieldId: segmentId }` (the component
serializes its state). Algorithm:

1. Parse `answer` as JSON; on failure return the standard json-parse failure row
   (identical text to the other validators).
2. For each `validation.fields[i]` in order, push one result row:
   - id: `tag-<field.id>`
   - label: `<field.label>`
   - passed: `parsed[field.id] === field.correctSegmentId`
   - message when passed: `Correct.`
   - message when missing: `Tag "<field.label>" in the source before validating.`
   - message when wrong: the field's `explain` string.
3. `passed` = every row passed.
4. `artifact` on pass = `validation.artifactOnPass` if present; otherwise an
   auto-built object mapping each `field.id` to the TEXT of its tagged segment
   (`{ vendor: "Northwind Fasteners", invoiceNumber: "INV-58831", ... }`). On
   fail, `artifact` = null.

Never reveal the correct segment id in any message.

### 1.3 Component behavior (`TagSourceExercise` inside LessonExercise)

- When `lesson.interactionType === 'tagSource'`, LessonExercise renders
  `TagSourceExercise` where the JSON editor normally sits; source panel,
  instructions, Validate button, and ValidationResults keep their standard
  positions. `fieldGuide` is `[]` for these lessons (as with choiceCheck).
- Layout: LEFT the source as a wrapped row of selectable segment chips; RIGHT a
  compact list of field rows, each `field.label` + a control to bind a segment.
  Binding model (pick one at build, whichever holds no-scroll): either
  (a) click a field row to arm it, then click a chip to bind it (chip shows the
  bound field's short tag), or (b) a native `<select>` per field row listing the
  segment texts. Option (b) is the accessibility-safe default and simplest to
  keep no-scroll.
- Selecting/binding never validates; the existing Validate button submits the
  serialized `{ fieldId: segmentId }` through the same path as the JSON editor.
- Wrong-answer state: mark failed field rows in ValidationResults like field
  rows today; do NOT clear the learner's bindings. One "Fix this next" callout
  names the first unresolved field.
- No-scroll: chips wrap; field rows are single-line; at `short:` step down
  padding/gap. Budget for one compaction pass (every new surface has needed it).

## 2. `handoffForm` - capture the handoff record, not a quiz about it

Replaces choiceCheck on handoff nodes (send-for-approval, route-to-queue,
notify). The learner fills a small fixed form describing the handoff (who it
goes to, why, when, whether a response is required). Passing mints a handoff
record artifact the downstream node consumes.

This is distinct from `jsonEditor`: no raw JSON typing. It is a guided form of
labeled inputs and selects, so the hands-action differs from both the quiz and
the JSON textarea.

### 2.1 Lesson JSON contract

```json
{
  "interactionType": "handoffForm",
  "validation": {
    "type": "handoffForm",
    "fields": [
      {
        "id": "sentTo",
        "label": "Sent to",
        "kind": "select",
        "options": ["Desk Manager", "Compliance", "Trader"],
        "expected": "Desk Manager",
        "explain": "A 13% move is a desk-level risk call; it routes to the Desk Manager, not Compliance."
      },
      {
        "id": "reason",
        "label": "Reason",
        "kind": "text",
        "accepted": ["variance exceeded threshold", "move above escalation threshold"],
        "explain": "State the trigger: the move crossed the escalation threshold."
      },
      {
        "id": "responseRequired",
        "label": "Response required",
        "kind": "select",
        "options": ["yes", "no"],
        "expected": "yes",
        "explain": "A handoff without a captured response is a dropped ball; approval needs a reply."
      }
    ],
    "artifactOnPass": { "optional": "author-defined; omit to auto-build" }
  }
}
```

Rules: 2 to 5 fields; each field is `kind: "select"` (with `options`) or
`kind: "text"`; each field has either `expected` (single value) or `accepted`
(list); select fields' `expected`/`accepted` values must all appear in
`options`; each `explain` references the workflow reason, not the answer letter.

### 2.2 Validator behavior (add function `handoffForm` to validators.js)

Input `answer` is a JSON string of `{ fieldId: value }`. Algorithm:

1. Parse `answer`; standard json-parse failure row on error.
2. For each field in order, push one result row (id `field-<id>`, label the
   field's `label`):
   - missing or empty after trim -> failed, message `Fill in: <label>.`
   - value matches when `normalize(value)` equals `normalize(expected)` OR is in
     the normalized `accepted` list -> passed, message `Correct.`
   - otherwise failed, message = the field's `explain`.
   (Select and text fields validate identically; the only difference is the
   input control the component renders.)
3. `passed` = all rows passed.
4. `artifact` on pass = `validation.artifactOnPass` if present; otherwise an
   auto-built object mapping each `field.id` to the learner's submitted value.
   On fail, `artifact` = null.

### 2.3 Component behavior (`HandoffFormExercise` inside LessonExercise)

- When `lesson.interactionType === 'handoffForm'`, LessonExercise renders
  `HandoffFormExercise` in the editor slot; source/instructions/Validate/
  ValidationResults keep standard positions; `fieldGuide` is `[]`.
- Render a compact vertical form: one labeled row per field. `kind: "select"`
  renders a native `<select>` (accessible, keyboard-native) seeded with a blank
  placeholder + `options`; `kind: "text"` renders a slim single-line input with
  the label as placeholder.
- Validate serializes `{ fieldId: value }` through the standard path. Selecting
  or typing never auto-validates.
- Wrong-answer state: failed rows marked in ValidationResults; inputs preserved;
  one "Fix this next" callout names the first failed field.
- No-scroll: the form is short by construction (<= 5 rows); at `short:` step down
  vertical gap and input padding. Verify wrong-answer at 1280x800 AND 1366x650.

## 3. Lesson lint + fixtures (same commit as any implementation)

If/when approved and built, in the SAME PR:

1. Add `tagSource` and/or `handoffForm` to `VALID_INTERACTIONS` and
   `VALID_VALIDATORS` in scripts/lint-lessons.mjs, plus a shape check mirroring
   the choiceCheck/templateSlots checks (tagSource: 3-6 fields, segments cover
   every correctSegmentId, >= fields+1 segments; handoffForm: 2-5 fields, valid
   kind, expected-or-accepted present, select values in options).
2. Add a fixture (correct + wrong) to scripts/lesson-fixtures.json for every
   lesson using the new type - test:lessons requires it.
3. Register the component branch in LessonExercise.jsx exactly like the existing
   three (`ChoiceCheckExercise`, `TemplateSlotsExercise`, `ArtifactImportExercise`).
4. `npm run check` green; live wrong-answer no-scroll at both viewports.

## 4. Budget note (Gate 4)

Gate 4 allows AT MOST ONE new interaction type per module. This spec proposes
TWO because inspection and handoff are two different node kinds and the
anti-slop goal spans modules. Resolution options are parked for the owner in
OPEN_QUESTIONS; do not assume both may land in a single module without that
decision.
