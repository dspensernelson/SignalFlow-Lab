# Lesson Authoring Template

Use this document to design any SignalFlow Lab lesson before changing lesson JSON or React.
It turns the product doctrine into a repeatable contract: define the business artifact first,
then derive the learning experience from it.

Keep this file ASCII-only.

---

## How to use this template

For each node, work in this order:

1. Copy the blank lesson contract below into a node-specific working section or separate spec.
2. Complete Phase 1 before writing lesson copy.
3. Complete Phase 2 before choosing screen content.
4. Complete Phase 3 before changing JSON or UI.
5. Implement only the smallest data or component change needed to honor the contract.

Do not start from "what concept should we teach?" Start from:

> What new reusable business object or workflow capability exists after this node?

If a node does not produce a stored artifact, it still must produce a named workflow capability
or auditable decision/handoff record.

---

## Non-negotiable lesson pattern

Every lesson should satisfy this sentence:

> The learner produces one reusable business artifact while learning one foundational
> automation concept.

Every lesson should close with this sentence shape:

> The workflow can now ...

That capability statement is about the system, not the learner.

---

## Phase 1 - Artifact Contract

Complete this before designing the lesson.

```markdown
# [Artifact or Capability Name] Lesson Contract

## Node
- Node id:
- Node label:
- Phase:
- Lesson type:
- Current status: [NOW] / [INTENT] / [LATER]

## Artifact or capability
- Named artifact:
- File name, if stored:
- If no file is stored, named workflow capability:

## Purpose
Why does this object or capability exist in the business workflow?

## New thing that exists after this node
What exists after this lesson that did not exist before?

## Produced by
- Real-world role/process:
- Lab role for the learner:

## Upstream inputs
List each upstream source/reference/artifact and what the learner uses from it.

| Input | Type | What it contributes | Source-of-truth concern |
| --- | --- | --- | --- |
|  |  |  |  |

## Immediate consumers
List the next nodes that directly depend on this output.

| Consumer node | Fields or signal consumed | Why it needs this |
| --- | --- | --- |
|  |  |  |

## Later consumers
List later workflow uses: risk, approval, brief assembly, archive, audit, search, reuse.

## Required fields or decisions
For every required field, decision, row, or output signal:

| Field/decision | Meaning | Source | Consumer | What breaks if wrong |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Optional fields
Only include optional fields with a clear downstream purpose.

| Field | Why optional | Who uses it |
| --- | --- | --- |
|  |  |  |

## Governance
- Owner:
- Approver, if relevant:
- Access/source requirement:
- Audit or retention need:
- Reuse risk:
- Data-quality concern:

## Complete means
Write a workflow-readiness definition, not a syntax definition.

Example shape:
"This node is complete when the workflow has enough trusted [artifact/signal] to let
[consumer nodes] proceed without re-reading or re-deciding the source material."
```

---

## Phase 2 - Learning Contract

Complete this after the artifact contract.

```markdown
## Primary concept
Choose exactly one.

## Supporting concepts
List only concepts that reinforce the primary concept.

## One-sentence accomplishment
Use first person and describe work completed, not technology learned.

Example:
"I transformed messy human observations into the first trusted business record."

## Capability Statement
Use this exact shape:
"The workflow can now ..."

## Business scenario
What is happening in Meridian at this moment? Include time pressure, role, and why the
artifact is needed now.

## Learner task
The one meaningful task the learner performs.

## Success criteria
What must be true for the artifact/capability to be trusted downstream?
```

---

## Phase 3 - Screen Contract

Use these section jobs. Do not overload them.

| Section | Job | Learner question |
| --- | --- | --- |
| Intro | Build understanding | Why does this artifact exist? |
| Exercise | Build the artifact | How do I create it? |
| Takeaway | Connect to the workflow | What can the workflow do now? |

### Intro screen

The intro should answer four questions:

1. What am I building?
2. Why does it exist?
3. Who or what uses it next?
4. What one automation concept am I about to practice?

Suggested structure:

```markdown
## Intro heading
Before you build: [business object or capability]

## Sections
1. What this object is
2. Why the workflow needs it
3. Who consumes it next
4. Concept you will practice

## Preview
Show a short example of the artifact shape, but keep the business purpose ahead of syntax.
```

### Exercise screen

The exercise should ask the learner to perform exactly one meaningful business task.

Suggested structure:

```markdown
## Scenario
One short business setup.

## Source material
The messy input, reference, policy, rows, or upstream artifacts.

## Instructions
Five or fewer direct steps.

## Field guide
Each field needs meaning, type, example, and source hint.

## Workspace
Starter answer should expose the target shape without solving the task.

## Validation
Use the existing validator style when possible. Do not change matching rules unless the
lesson contract requires a new validator and scope has been approved.
```

### Takeaway screen

The takeaway should show workflow evolution, not just concept review.

Suggested structure:

```markdown
## Heading
[Artifact/capability] built

## Points
1. You produced [named artifact/capability].
2. That object now lives at [node/artifact name].
3. [Immediate consumers] can now reuse it.
4. Governance/reuse/audit note.
5. The workflow can now [capability statement].
```

The final point should be the Capability Statement whenever the component shape allows it.

### Transfer beat (realWorld) - REQUIRED

Every takeaway must carry a `takeaway.realWorld` beat so the learner can carry the
skill off the platform. It answers "how would I rebuild this exact step at work?"
and maps it to the three tools they are most likely to meet. The tier variants of
a task share one mapping (the skill is the same at every depth).

```json
"realWorld": {
  "soloRebuildPath": "How you'd rebuild THIS step by hand, with everyday tools (email, Excel, a form).",
  "tools": {
    "powerAutomate": "the concrete trigger/action or connector",
    "zapier": "the concrete trigger/action or app step",
    "python": "the concrete library or approach"
  }
}
```

Keep each line short and specific (name a real action/connector/library, not a
generic "use automation"). `lint:lessons` fails if any of the four strings is
missing or empty.

---

## Phase 4 - Implementation Contract

Only implement after Phases 1-3 are clear.

### Lesson JSON checklist

Top-level fields:

- `id` uses `lesson-[node]`
- `nodeId` matches `src/data/workflowNodes.json`
- `title` names the business task before the technology where possible
- `difficulty` is honest and consistent with existing lessons
- `skill` names the primary concept
- `scenario` states the business moment and why this artifact is needed
- `inputType`, `inputLabel`, and `input` provide realistic source material
- `instructions` stay focused on one task
- `interactionType` matches existing component support
- `starterAnswer` shows the target shape without completing the work
- `validation` is deterministic
- `copilotPrompt` asks for the artifact, not generic help
- `successMessage` states what the workflow can do next

Intro fields:

- `intro.heading` starts with "Before you build:"
- `intro.sections` lead with business purpose, not syntax
- `intro.jsonExample` is short and relevant
- `intro.skill` matches the primary concept
- `intro.artifactName` is the named business artifact

Field guide:

- Every required field appears once
- Meaning is business-readable
- Type is explicit
- Example matches the accepted output style
- Hint points back to source material or downstream use

Takeaway:

- `takeaway.heading` names the artifact/capability
- `takeaway.points` include artifact produced, workflow location, downstream reuse, and
  capability statement
- `takeaway.artifactName` matches the stored artifact
- `takeaway.realWorld` carries `soloRebuildPath` plus `tools.powerAutomate`,
  `tools.zapier`, and `tools.python` (all non-empty) - the transfer beat

### Component checklist

Before adding UI, verify whether the existing shared components already support the lesson:

- `LessonWorkspace`
- `LessonIntro`
- `LessonExercise`
- `LessonTakeaway`
- `FieldGuide`
- `ValidationResults`
- `ArtifactViewer`
- `WorkflowGraph`
- `NodeDetail`

Prefer data changes over component changes. Component changes should support a reusable
lesson pattern, not a one-off node.

### Validator checklist

Use existing validators first:

- `jsonFields` for object field extraction
- `jsonPolicy` for governed threshold/config objects
- `jsonRows` for normalized table rows
- `jsonDeltas` for computed deltas

Add a validator only when the lesson introduces a genuinely new interaction shape.

---

## Builder prompt template

Use this prompt when handing a node to a builder.

```text
You are working in SignalFlow Lab. Read PRODUCT_DOCTRINE.md, PROJECT_CONTEXT.md,
NODE_AUDIT.md, LESSON_DESIGN_FRAMEWORK.md, and LESSON_AUTHORING_TEMPLATE.md first.

Design this lesson as a workflow artifact, not as a coding exercise.

Target node:
- Node id: [node-id]
- Node label: [node label]
- Lesson type: [inspection/build/transformation/etc.]
- Artifact or capability: [artifact/capability]

Work in this order:
1. Fill the Artifact Contract.
2. Fill the Learning Contract.
3. Fill the Screen Contract.
4. Only then propose lesson JSON or component changes.

Constraints:
- Keep the task focused on one meaningful business action.
- Keep one primary automation concept.
- Preserve the Intro -> Exercise -> Takeaway flow.
- The takeaway must explain what the workflow can now do.
- Prefer data/JSON changes over React changes.
- Do not change validator matching rules unless explicitly approved.
- Keep repo docs ASCII-only.

Deliver:
1. Completed lesson contract.
2. Proposed lesson JSON changes.
3. Any required component/validator changes, with justification.
4. Acceptance checklist.
```

---

## Review checklist

Use this before accepting a new or revised lesson.

- The lesson starts from a business artifact or named capability.
- The artifact/capability has clear upstream inputs and downstream consumers.
- The primary concept is singular.
- The source material feels like real workplace input, not a toy exercise.
- The learner performs one meaningful task.
- Validation proves workflow readiness, not just syntax.
- Governance appears where ownership, approval, access, quality, audit, or reuse matters.
- The takeaway names what was built and who/what reuses it.
- The final takeaway beat can be written as "The workflow can now ..."
- The lesson can be explained from the map without opening a separate syllabus.

---

## Quick capability statement starters

Use these as starting points, not locked copy.

| Node | Artifact/capability | Capability statement starter |
| --- | --- | --- |
| Analyst Notes | Source provenance understood | The workflow can now identify where the morning market signal enters the system. |
| Trader Flag | Escalation signal interpreted | The workflow can now convert a human escalation cue into a structured decision signal. |
| Market Intake Record | `market-intake.json` | The workflow can now consume structured market observations. |
| Price Feed / CSV Rows | Price source inspected | The workflow can now identify the raw numeric feed that must be cleaned before evaluation. |
| Forecast Data | Forecast source inspected | The workflow can now compare actual prices against an agreed forecast reference. |
| Prior Day Reference | Baseline source inspected | The workflow can now reuse yesterday's retained output as today's comparison baseline. |
| Clean Price Data | `clean-prices.json` | The workflow can now perform deterministic calculations on trusted numeric prices. |
| Threshold Policy | `threshold-policy.json` | The workflow can now apply consistent business thresholds without hardcoding rules. |
| Variance Check | `variance-summary.json` | The workflow can now judge how far each hub moved from forecast and prior day. |
| Risk Evaluation | `risk-evaluation.json` | The workflow can now produce a decision-ready risk signal from upstream artifacts. |
| Approval Template | `approval-template.json` | The workflow can now create approval requests in a consistent governed format. |
| Approval Decision | Decision outcome | The workflow can now route the morning brief through the correct approval path. |
| Approval Route | `approval-route.json` | The workflow can now capture a human approval response as an auditable record. |
| Routine Update Path | Routine outcome record | The workflow can now log a non-escalated outcome without losing auditability. |
| Prior Day Brief Template | Brief structure understood | The workflow can now assemble the daily output against a consistent brief structure. |
| Morning Brief | `market-brief.md` | The workflow can now assemble upstream artifacts into an approval-ready morning brief. |
| Distribution / Archive | Delivered and retained brief | The workflow can now deliver the brief and retain it as tomorrow's baseline. |
