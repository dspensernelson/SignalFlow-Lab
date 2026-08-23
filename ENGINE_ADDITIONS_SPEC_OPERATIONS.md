# Engine Additions Spec - Operations Interactions (connectorConfig + runInspect)

> **STATUS: APPROVED (owner, 2026-08-22) - BOTH types land.** The owner approved
> `connectorConfig` and `runInspect` as part of the Ecosystem Literacy Plan, with
> a Gate 4 budget note: operations interaction types are exempt from the
> one-per-module cap, on the same reasoning that exempted the anti-slop pair
> (they target two different node behaviors and serve the whole curriculum);
> the normal one-new-type-per-module budget resumes after these two. Existing
> validators' matching rules stay frozen forever; both additions below are
> ADDITIVE. Ship each with fixtures, lint coverage, and live no-scroll
> verification at 1280x800 AND 1366x650. Keep this file PURE ASCII; use " - "
> instead of em-dashes.

## Why this exists

Coverage audit, 2026-08-22, measured across all 120 lessons (matches counted in
teaching prose, excluding the one-line `realWorld.tools` mappings):

- runtime error handling (try/catch, scope, configure-run-after): 0 lessons
- run history / monitoring / failed runs / dead-letter: 1 passing mention
- authentication / credentials / secrets / service accounts: 1 sentence
- testing an automation: 0 lessons
- triggers, polling vs event/webhook: 1 real lesson; "webhook" appears only
  inside Zapier one-liners, never explained
- environments (dev/test/prod) and promoting an automation: 0
- rate limits, throttling, backoff: 0 (retry IS taught, at accounts-task-medium)
- PII / data residency: 0, in a curriculum that hands the learner salary data
- cost / licensing, and "when NOT to automate": 0 by phrase

The curriculum teaches DESIGN invariants well and OPERATING an automation almost
not at all. A learner finishes able to design a workflow and unable to connect,
schedule, observe, test, or promote the thing that runs it. That is the gap
between "I understand automation" and "I can help automate our world."

DECISION_LOG 2026-07-06 declined a "field notes" wrap lesson on the grounds that
credentials and testing were "already owned by existing nodes - credentials/
secrets by accounts-task ... testing by the accounts-task idempotent re-run".
Verified 2026-08-22: `grep -i "credential\|secret"` over
`lesson-accounts-task{,-medium,-hard}.json` and `lesson-access-task{,-medium}.json`
returns 0 matches in all five files. That decision is reversed by the owner in
DECISION_LOG 2026-08-22 with this evidence.

Two additive interaction types, each mirroring the existing engine contract:

1. `connectorConfig` - configure the connection, trigger, and failure behavior of
   the automation itself: which system, which auth, which secret REFERENCE, poll
   or webhook, how often, how many retries, what happens on failure.
2. `runInspect` - read a real-shaped run history with a failed step, identify the
   step, classify the cause, and choose the remediation.

Both are hands-on, deterministic, local-first, and mint a named artifact. Neither
touches a live platform: every system, credential, and run is mock data authored
in the lesson JSON (Gate 8 unchanged, LESSON_DESIGN_FRAMEWORK section 1 amended
to say "no LIVE integrations").

## 0. What does NOT change (hard constraints, identical to the prior two specs)

- Do NOT modify the matching logic of `jsonFields`, `jsonPolicy`, `jsonRows`,
  `jsonDeltas`, `choiceCheck`, `templateSlots`, `artifactImport`, `tagSource`, or
  `handoffForm` in `src/lib/validators.js`. The two new validators are ADDITIVE
  functions in the same file, registered in the `validators` map.
  `connectorConfig` COMPOSES `handoffForm` by calling it, exactly as
  `artifactImport` composes the JSON validators; it does not alter it.
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
- No network, no OAuth, no live platform calls, no new persisted state. All
  systems, credentials, and runs are authored mock data in the lesson JSON.
- Each new type mints a named artifact on pass, so these lessons still produce a
  business object a downstream node consumes.
- `src/data/automationTaxonomy.json` is the single source of truth for
  `opsTopics`, `runVocabulary.stepStatuses`, `runVocabulary.failureCauses`,
  `runVocabulary.remediations`, and `runVocabulary.environments`. Lint reads it;
  lessons may not invent values outside it.

## 1. `connectorConfig` - configure the automation, not just the workflow

The learner is shown a system setup sheet (mock) and fills a grouped
configuration form: how the automation connects, what starts it, and what it
does when a step fails. Passing mints `connector-config.json`.

The load-bearing wrong answer: the setup sheet shows BOTH a raw secret value and
its vault reference. Pasting the raw secret into the flow must fail, with an
`explain` that teaches secret handling. This is why the type exists rather than
being a `handoffForm` lesson - the grouping and the secretRef control are the
teaching.

### 1.1 Lesson JSON contract

```json
{
  "interactionType": "connectorConfig",
  "opsTopics": ["connectors-credentials", "triggers"],
  "validation": {
    "type": "connectorConfig",
    "groups": [
      {
        "id": "connection",
        "label": "Connection",
        "fields": [
          {
            "id": "system",
            "label": "System",
            "kind": "select",
            "options": ["Desk shared mailbox", "Your personal inbox", "The trader's laptop"],
            "expected": "Desk shared mailbox",
            "explain": "The automation must not depend on one person's inbox; it connects to the shared mailbox the desk owns."
          },
          {
            "id": "authMethod",
            "label": "Auth method",
            "kind": "select",
            "options": ["Service account", "Your own login", "A shared password in the flow"],
            "expected": "Service account",
            "explain": "A flow authenticated as a person breaks when that person leaves or changes their password. It runs as a service account."
          },
          {
            "id": "secret",
            "label": "Secret",
            "kind": "secretRef",
            "accepted": ["vault://meridian/desk-mailbox", "env:DESK_MAILBOX_TOKEN"],
            "explain": "Store a REFERENCE to the secret, never the value. A pasted token is in the flow definition, the export, and the run history forever."
          }
        ]
      },
      {
        "id": "trigger",
        "label": "Trigger",
        "fields": [
          {
            "id": "mode",
            "label": "Mode",
            "kind": "select",
            "options": ["Poll", "Webhook", "Schedule"],
            "expected": "Poll",
            "explain": "The mailbox cannot call you, so the automation checks on an interval. A webhook needs the source to push."
          },
          {
            "id": "intervalMinutes",
            "label": "Check every (min)",
            "kind": "number",
            "range": { "min": 5, "max": 15 },
            "explain": "The brief is due at 7:00 and notes land from 6:05. Slower than 15 minutes risks missing the window; faster than 5 wastes calls against the mailbox limit."
          }
        ]
      },
      {
        "id": "behavior",
        "label": "On failure",
        "fields": [
          {
            "id": "retries",
            "label": "Retries",
            "kind": "number",
            "expected": 3,
            "explain": "Three retries clears a transient blip without hammering a system that is genuinely down."
          },
          {
            "id": "onFailure",
            "label": "Then",
            "kind": "select",
            "options": ["Dead-letter and alert", "Skip silently", "Retry forever"],
            "expected": "Dead-letter and alert",
            "explain": "A failure nobody sees is the worst outcome. Park the run where it can be found and tell a person."
          }
        ]
      }
    ],
    "artifactOnPass": { "optional": "author-defined object; omit to auto-build" }
  }
}
```

Rules:
- 2 to 3 groups; each group has `id`, `label`, and 1+ `fields`.
- 4 to 8 fields TOTAL across all groups. This is `connectorConfig`'s own bound;
  the `handoffForm` 2-5 lint rule is NOT changed.
- Field `kind` is one of `select`, `text`, `number`, `secretRef`.
- `select`, `text`, `secretRef` need `expected` (single value) or `accepted`
  (list). Select `expected`/`accepted` values must all appear in `options`.
- `number` needs `expected` (a JSON number) or `range` (`{ min, max }`, both
  numbers, `min <= max`). Not both.
- Every field has a non-empty `explain` that teaches the reason, never restates
  the answer.
- Group ids and field ids are unique within the lesson.
- The lesson `input` SHOULD contain both the raw secret and its reference when
  the lesson has a `secretRef` field, so the wrong answer is a real temptation.

### 1.2 Validator behavior (add function `connectorConfig` to validators.js)

Input `answer` is a JSON string of `{ fieldId: value }` (flat, not grouped - the
component flattens on serialize). Algorithm:

1. Parse `answer` as JSON; on failure return the standard json-parse failure row
   (id `json-parse`, label `Valid JSON`, identical message text to the other
   validators). If parsed is not a plain object, treat it as `{}`.
2. Flatten `validation.groups[].fields[]` into one ordered list, groups in order,
   fields in order within each group.
3. Partition the flat list: `delegated` = fields whose `kind` is `select`, `text`,
   or `secretRef`; `numeric` = fields whose `kind` is `number`.
4. For `delegated`, call the existing `handoffForm(answer, { fields: delegated })`
   unchanged and take its `results`. Re-map each row: id `field-<id>` becomes
   `cfg-<id>`; label unchanged; passed unchanged; message unchanged. This reuses
   the frozen matching rules verbatim rather than reimplementing them.
5. For each `numeric` field, build one row (id `cfg-<field.id>`, label
   `<field.label>`):
   - value missing, null, or empty after trim -> failed, message
     `Fill in: <label>.`
   - `Number(value)` is not finite -> failed, message
     `<label> must be a number (no quotes, no units).`
   - `expected` present and `Number(value) !== expected` -> failed, message =
     the field's `explain`
   - `range` present and value outside `[min, max]` inclusive -> failed,
     message = the field's `explain`
   - otherwise passed, message `Correct.`
6. Re-order all rows to match the flat field order from step 2 (so the learner
   reads them in the order the form shows them).
7. `passed` = rows.length > 0 and every row passed.
8. `artifact` on pass = `validation.artifactOnPass` if present; otherwise an
   auto-built object grouped by group id:
   `{ connection: { system: "...", authMethod: "...", secret: "..." }, trigger: { mode: "...", intervalMinutes: 10 }, ... }`
   with `number` fields coerced to JSON numbers and the rest trimmed strings.
   On fail, `artifact` = null.

Never reveal the expected value in any message.

### 1.3 Component behavior (`ConnectorConfigExercise`)

- New file `src/components/ConnectorConfigExercise.jsx`. When
  `lesson.interactionType === 'connectorConfig'`, `LessonExercise` renders it in
  the editor slot; `fieldGuide` is `[]` for these lessons (as with choiceCheck,
  tagSource, handoffForm).
- Layout: LEFT (`lg:col-span-5`) the system setup sheet - `lesson.input` inside a
  `ScrollArea` (max-h 460, `short:` 300), following the ArtifactImportExercise
  source pattern - plus the collapsed `<details>` Copilot prompt card in the LEFT
  column (the established non-jsonEditor placement).
  RIGHT (`lg:col-span-7`) the groups. At `lg` render groups in a 2-column grid so
  8 fields occupy roughly the vertical space of handoffForm's 5 rows; below `lg`
  stack. Each group is a labeled fieldset with its rows.
- Field rows copy the `HandoffFormExercise` row pattern (label left, control
  right, border tone shifts to warning/success from the matching result row):
  - `select` -> native `<select>` with a "Choose..." placeholder then `options`
  - `text` -> slim single-line `<input type="text">`
  - `number` -> `<input type="number">` (inputMode numeric); serialize as a
    string and let the validator coerce
  - `secretRef` -> `<input type="text">` with a lock icon and placeholder
    `a reference, not the value`
- Selecting or typing never auto-validates. Validate serializes the FLAT
  `{ fieldId: value }` through the standard path.
- Wrong-answer state: failed rows marked in ValidationResults; inputs preserved;
  exactly one "Fix this next" callout naming the first failed field. Reuse the
  `HandoffFormExercise` readiness block (lines 128-180) verbatim, with
  "configuration details" wording.
- No-scroll: verify the wrong-answer state at 1280x800 AND 1366x650 on the
  TALLEST authored lesson (the 8-field module-03 ops Easy, which adds
  `piiHandling`). Budget for one compaction pass - every new surface has needed
  one.

## 2. `runInspect` - read the run, find the failure, choose the fix

The learner is shown a run history (mock) for the module's own automation: a
handful of steps, one of which failed, with an error message. They identify the
failed step, classify the cause, choose the remediation, and say where to re-run
from or who to tell. Passing mints `run-diagnosis.json`.

This is distinct from `choiceCheck`: the questions are answered by READING A RUN,
not by recalling prose, and the step fields are bound to real step ids from the
rendered log.

### 2.1 Lesson JSON contract

```json
{
  "interactionType": "runInspect",
  "opsTopics": ["failed-run", "environments"],
  "validation": {
    "type": "runInspect",
    "run": {
      "id": "run-2026-07-08-0615",
      "environment": "prod",
      "trigger": "Poll / desk shared mailbox",
      "startedAt": "6:15 AM",
      "status": "failed",
      "steps": [
        { "id": "s1", "name": "Get new emails", "status": "succeeded", "durationMs": 840 },
        { "id": "s2", "name": "Get items: threshold policy", "status": "failed", "durationMs": 12030,
          "error": "401 Unauthorized. The service account desk-bot could not read the config list." },
        { "id": "s3", "name": "Apply thresholds", "status": "skipped" },
        { "id": "s4", "name": "Send approval", "status": "skipped" }
      ]
    },
    "fields": [
      { "id": "failedStep", "label": "Failed step", "kind": "step", "expected": "s2",
        "explain": "Read the status column. The first non-succeeded step is where the run stopped; everything after it was skipped, not broken." },
      { "id": "cause", "label": "Cause", "kind": "select",
        "options": ["auth-expired", "rate-limit", "schema-change", "missing-field"],
        "expected": "auth-expired",
        "explain": "A 401 on a service account that worked yesterday is a credential problem, not a data problem." },
      { "id": "action", "label": "Fix", "kind": "select",
        "options": ["rotate-credential", "retry-with-backoff", "fix-mapping", "dead-letter-and-alert"],
        "expected": "rotate-credential",
        "explain": "Retrying an expired credential just fails four more times. The credential has to be renewed before any re-run." },
      { "id": "rerunFrom", "label": "Re-run from", "kind": "step", "expected": "s2",
        "explain": "Step 1 already succeeded and is idempotent to skip. Re-run from the step that failed, not from the top." }
    ],
    "artifactOnPass": { "optional": "author-defined; omit to auto-build" }
  }
}
```

Rules:
- `run` requires `id`, `environment`, `trigger`, `startedAt`, `status`, `steps`.
- `environment` must be in `runVocabulary.environments`.
- 3 to 8 steps; step ids unique; each step has `id`, `name`, `status`; `status`
  must be in `runVocabulary.stepStatuses`; `durationMs` optional number; `error`
  optional string (required on at least the first non-succeeded step).
- At least one step whose status is not `succeeded`.
- 2 to 5 fields; `kind` is `step` or `select`.
- `step` fields: `expected` (or every entry of `accepted`) must be an id present
  in `run.steps`.
- `select` fields with id `cause` must draw `options` and `expected` from
  `runVocabulary.failureCauses`; with id `action`, from
  `runVocabulary.remediations`. Other select fields are free-form but still need
  `expected` or `accepted` present in `options`.
- Every field has a non-empty `explain`.
- GIVEAWAY RULE: no step's `error` text may contain the expected `cause` value
  verbatim (compared after normalize, hyphens treated as spaces). The learner
  must infer the classification from the symptom, not read it off the log.

### 2.2 Validator behavior (add function `runInspect` to validators.js)

Input `answer` is a JSON string of `{ fieldId: value }`. Algorithm:

1. Parse `answer`; standard json-parse failure row on error. Non-object -> `{}`.
2. For each `validation.fields[i]` in order, push one result row
   (id `inspect-<field.id>`, label `<field.label>`):
   - missing or empty after trim -> failed; message for `kind: "step"` is
     `Pick the step in the run history before validating.`, otherwise
     `Fill in: <label>.`
   - passes when `normalize(value)` equals `normalize(expected)` or is in the
     normalized `accepted` list -> message `Correct.`
   - otherwise failed, message = the field's `explain`
3. `passed` = rows.length > 0 and every row passed.
4. `artifact` on pass = `validation.artifactOnPass` if present; otherwise
   `{ runId: run.id, environment: run.environment, ...fieldValues }` where
   fieldValues maps each `field.id` to the trimmed submitted value. On fail,
   `artifact` = null.

This is deliberately the `handoffForm` algorithm over a different presentation;
the teaching is in the run log, not in a new matching rule.

### 2.3 Component behavior (`RunInspectExercise`)

- New file `src/components/RunInspectExercise.jsx`. `fieldGuide` is `[]`.
- Layout: LEFT (`lg:col-span-5`) the run card:
  - header: run id (mono), `environment` in a `Badge`, `trigger`, `startedAt`,
    and overall `status` in a `Badge` (failed -> warning tone)
  - one row per step: a status icon, the step name, the duration; the failed
    step also shows its `error` on one truncated line with a `title` tooltip
  - wrapped in a `ScrollArea` (max-h 460, `short:` 300) when steps > 6, with the
    standard fade + "Scroll for more" affordance
  - collapsed `<details>` Copilot prompt card below, LEFT column
  RIGHT (`lg:col-span-7`) the diagnosis form: the `HandoffFormExercise` row
  pattern; `kind: "step"` renders a native `<select>` whose option labels are
  step names and whose values are step ids; `kind: "select"` renders its
  `options`.
- Validate serializes `{ fieldId: value }` through the standard path. Selecting
  never auto-validates.
- Wrong-answer state: failed rows marked; selections preserved; one "Fix this
  next" callout. Reuse the readiness block verbatim.
- No-scroll: verify wrong-answer at 1280x800 AND 1366x650 on the tallest
  authored lesson (7 steps, 4 fields).

## 3. Lesson lint + fixtures (same commit as the implementation)

In the SAME PR as any implementation:

1. Add `connectorConfig` and `runInspect` to `VALID_INTERACTIONS` and
   `VALID_VALIDATORS` in `scripts/lint-lessons.mjs`, plus shape checks mirroring
   the existing ones:
   - `connectorConfig-shape`: 2-3 groups; 4-8 fields total; unique group/field
     ids; valid `kind`; select/text/secretRef have expected-or-accepted; select
     answers appear in `options`; number has exactly one of `expected` or
     `range` (range numeric, min <= max); every field has `explain`.
   - `runInspect-shape`: run required keys; environment in vocabulary; 3-8 steps
     with unique ids and valid statuses; at least one non-succeeded step; 2-5
     fields; step-field expected/accepted resolve to real step ids; `cause` and
     `action` selects drawn from the taxonomy vocabularies; every field has
     `explain`; the giveaway rule (no error text contains the expected cause).
2. Add a fixture (correct + wrong) to `scripts/lesson-fixtures.json` for every
   lesson using the new types - `test:lessons` requires it.
3. Register the component branches in `LessonExercise.jsx` exactly like the
   existing five. Use `React.lazy` for the two new components (precedent:
   `App.jsx` lazy project chunks) so the `LessonWorkspace` chunk does not grow
   for the 120 lessons that never render them; record the chunk size before and
   after in the PR.
4. Extend the giveaway lint (REMEDIATION_PLAN Phase 1.1) to understand both new
   validation shapes, so Operations lessons are not a blind spot in the
   tier-budget check.
5. Add a garbage fixture per type to the validator-audit harness
   (REMEDIATION_PLAN Phase 1.3, `scripts/test-validators.mjs`) that MUST fail:
   for `connectorConfig`, the raw secret pasted into the secretRef field plus an
   out-of-range interval; for `runInspect`, the first option selected everywhere.
6. `npm run check` green; live wrong-answer no-scroll at both viewports for both
   surfaces.

## 4. Budget note (Gate 4)

Gate 4 allows AT MOST ONE new interaction type per module. This spec lands TWO,
under an owner exemption granted 2026-08-22 on the same reasoning as the
anti-slop pair: `connectorConfig` and `runInspect` target two different node
behaviors (configure vs diagnose), they serve every module rather than one, and
the operations gap they close is measured across the whole curriculum. The
normal one-new-type-per-module budget resumes after these two. See DECISION_LOG
2026-08-22 and AUTONOMY_CHARTER Gate 4.
