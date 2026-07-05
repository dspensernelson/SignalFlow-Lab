# SPEC: Artifact Import (the Module 1 solo-rebuild capstone) - PRE-APPROVED

Ratified 2026-07-02 under AUTONOMY_CHARTER.md gate 7. Implement as written;
deviations touching storage or progress semantics are prohibited (park
instead). Fidelity peer: ENGINE_ADDITIONS_SPEC.md. Keep ASCII-only.

## Purpose

The capstone lesson asks the learner to rebuild the Meridian pipeline
OUTSIDE the app (any tool: PowerShell, Python, Power Automate, by hand) and
prove it by importing the four files their rebuild produced. The app grades
the imports with the EXISTING validators - the learner's tooling is free,
the acceptance bar is not.

## Lesson JSON contract

New interactionType `artifactImport`, one lesson: `lesson-solo-rebuild-hard`
attached to a Module 1 node WITHOUT adding a map node - it attaches as the
hard-tier variant of `morning-brief`'s successor slot: concretely, register
it as an ADDITIONAL hard lesson on node `distribution-archive` is wrong
(one lesson per node per tier). Instead: it is the hard variant of node
`morning-brief`... which exists (lesson-morning-brief-hard). RESOLUTION
(part of this spec): the capstone REPLACES nothing - it becomes hard tier's
final unlock by attaching to a node that has no hard lesson yet and sits
late on the path: node `routine-update-path` is semantically wrong; use
node `variance-check` (no hard lesson today, mid-map) is wrong too.
DECIDED: attach to node `approval-decision` (no hard lesson today), titled
as the capstone, with LESSON_PREREQS untouched (its effective hard prereqs
resolve via the existing tree). Rationale: zero map changes, zero storage
changes, the hard tier gains its 8th and final drill, and the unlock tree
already places it after risk-evaluation-hard. The lesson copy owns the
framing ("the capstone happens to live at the decision desk").

```json
{
  "id": "lesson-approval-decision-hard",
  "nodeId": "approval-decision",
  "interactionType": "artifactImport",
  "validation": {
    "type": "artifactImport",
    "imports": [
      { "key": "market-intake-record", "label": "market-intake.json",
        "validation": { "...": "the EASY intake validation block, verbatim" } },
      { "key": "clean-price-data", "label": "clean-prices.json",
        "validation": { "...": "easy clean-price validation, verbatim" } },
      { "key": "variance-check", "label": "variance-summary.json",
        "validation": { "...": "easy variance validation, verbatim" } },
      { "key": "risk-evaluation", "label": "risk-evaluation.json",
        "validation": { "...": "easy risk validation, verbatim" } }
    ]
  }
}
```

The lesson's `input` is the rebuild runbook: the four target files, the
easy-canon inputs to rebuild from (the analyst note, raw rows, references),
and the rule that ANY tool is legal. Intro/theory frames it as the proof of
transfer; fixtures come from the four easy fixtures (already in
scripts/lesson-fixtures.json) composed into one.

## Validator `artifactImport` (additive, in validators.js)

Answer = JSON string of `{ key: rawFileText }`. For each import in order:
1. Missing/empty raw text -> one failed row `import-<key>`: "Import
   <label> before validating."
2. Else run `validateAnswer(rawText, import.validation)` and MERGE its
   result rows, each id prefixed `<key>:` and label prefixed `<label> - `.
3. passed = every merged row passed. artifact on pass = an object mapping
   each key to its parsed artifact plus `{ rebuiltOutside: true }`.
No existing validator is touched; this validator only composes them.

## Component `ArtifactImportExercise` (branched from LessonExercise like the others)

- LEFT: the runbook (lesson.input) in the standard source panel.
- RIGHT: one row per import: label, a file picker (`<input type="file">`
  read as text via FileReader) AND a paste-area fallback (textarea shown
  via a "paste instead" toggle) - file contents land in the same answer
  map either way. A per-row status chip after validation (ok / n failed).
- Validate serializes `{ key: rawText }` through the standard path.
  Readiness card: standard pass/fail pattern; "Fix this next" names the
  first failed import and its first failed check.
- No-scroll: four compact rows + readiness fits 800 (verify wrong-answer
  state live per VERIFICATION_PLAYBOOK.md; collapse paste-areas to one
  open at a time if tight).

## Wiring and acceptance

Register in App LESSONS + BUILT_LESSON_IDS_BY_TIER.hard (8th drill); add
fixture (compose the four easy fixtures; wrong = one file's value off);
lint-lessons: add `artifactImport` to valid interaction/validator lists and
a shape rule (imports nonempty, each with key/label/validation whose type
is an existing JSON validator). Acceptance: `npm run check` green; live
per-lesson recipe passes; importing four correct files completes the node
and stores the composite artifact; hard tier reads "0 of 8".
