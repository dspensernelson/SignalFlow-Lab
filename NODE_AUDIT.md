# Node Audit - Meridian Morning Market Brief

> **Purpose of this document.** A per-node curriculum audit of every workflow node currently on the Meridian map. It checks each node against the Product Doctrine (the map is the curriculum; **every node is a lesson**; artifacts are the unit of progress; connections reveal context; governance is part of automation) and the Selected Node Panel Contract.
>
> **Doctrine update reflected in this pass.** There is no longer any "inspect-only" node. Every node is a lesson - the *lesson type* is what differs. Each node is assigned exactly one lesson type from: **inspection, interpretation, build, transformation, decision, handoff, assembly, governance.**
>
> **Scope.** This audit covers the 17 nodes currently defined in `src/data/workflowNodes.json` (5 phases, 23 edges in `src/data/workflowEdges.json`). It is a planning artifact only - no code, data, or UI is changed by this file.
>
> **How to read each row.** Every node is audited against ten fields:
>
> | Field | Meaning |
> | --- | --- |
> | Node type | The taxonomy type: source, reference, artifact, process, decision, handoff, output, archive. |
> | Thing / action | Doctrine taxonomy rule - is the node a *thing* (object) or an *action* (step)? Ambiguous labels are flagged. |
> | Lesson type | The active lesson type for this node: inspection, interpretation, build, transformation, decision, handoff, assembly, or governance. |
> | Concepts introduced | The automation vocabulary the node teaches. |
> | Learner practice | The concrete action the learner performs in this lesson. |
> | Lab version | What the app simulates locally instead of the real system (from node data). |
> | Dependencies | Upstream nodes this node consumes (from edges). |
> | Downstream reuse | Nodes that consume this node's output (from edges). |
> | Governance note | Ownership, access, data quality, approval, auditability, or reuse concern. |
> | Open question / risk | The unresolved design or curriculum risk for this node. |
>
> **Lesson type definitions.**
>
> | Lesson type | What the learner does |
> | --- | --- |
> | inspection | Examines a node's origin, contents, access needs, and place in the workflow to understand where work comes from. |
> | interpretation | Reads a human or unstructured signal and maps it to the structured field the workflow can act on. |
> | build | Produces a new structured artifact from messy input (extraction, schema, validation). |
> | transformation | Normalizes, compares, or applies rules to existing data to emit a derived result. |
> | decision | Encodes a branch/threshold and routes the workflow down one path or another. |
> | handoff | Moves work across a human or system boundary and captures the response or record. |
> | assembly | Joins multiple upstream artifacts into one finished deliverable. |
> | governance | Defines, versions, or approves the reusable rules, policies, and templates the workflow depends on. |
>
> **Status legend (interaction maturity, separate from lesson type).**
>
> - `[NOW]` Fully interactive now - the lesson is playable today.
> - `[INTENT]` Lesson intent defined - lesson type and learner action are specified; interaction not yet built.
> - `[LATER]` Future interaction - to be built in a later pass.

---

## Summary Matrix

| # | Node | Type | Thing/Action | Lesson type | Artifact | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Analyst Notes | source | Thing | inspection | - | `[INTENT]` |
| 2 | Trader Flag | source | Thing | interpretation | - | `[INTENT]` |
| 3 | Market Intake Record | artifact | Thing | build | `market-intake.json` | `[NOW]` |
| 4 | Price Feed / CSV Rows | source | Thing | inspection | - | `[INTENT]` |
| 5 | Forecast Data | source | Thing | inspection | - | `[INTENT]` |
| 6 | Prior Day Reference | reference | Thing | inspection | - | `[INTENT]` |
| 7 | Clean Price Data | artifact | Thing | transformation | `clean-prices.json` | `[NOW]` |
| 8 | Threshold Policy | reference | Thing | governance | `threshold-policy.json` | `[NOW]` |
| 9 | Variance Check | process | Action | transformation | - | `[LATER]` |
| 10 | Risk Evaluation | process (artifact-producing) | Action | transformation | `risk-evaluation.json` | `[LATER]` |
| 11 | Approval Template | reference | Thing | governance | `approval-template.json` | `[INTENT]` |
| 12 | Approval Decision | decision | Action | decision | - | `[LATER]` |
| 13 | Approval Route | handoff | Action | handoff | `approval-route.json` | `[LATER]` |
| 14 | Routine Update Path | handoff | Action | handoff | - | `[LATER]` |
| 15 | Prior Day Brief Template | reference | Thing | inspection | - | `[INTENT]` |
| 16 | Morning Brief | output | Thing | assembly | `market-brief.md` | `[LATER]` |
| 17 | Distribution / Archive | archive | **Action + Thing (ambiguous)** | handoff | - | `[LATER]` |

> **Recommendation (summary level).** Every node now carries an active lesson type, so the curriculum reads as 17 lessons of varying interaction maturity rather than "1 task plus 16 stubs." Three lessons are fully interactive today (`[NOW]`); five have defined intent and could be authored with little new scope (`[INTENT]`); nine are future interactions tied to later artifact builds (`[LATER]`). The lesson types lean usefully across the doctrine: inspection (5), governance (2), transformation (3), handoff (3), plus one each of interpretation, build, decision, and assembly.

---

## Phase 1 - Intake Layer

*Goal: turn messy market commentary into the first reliable workflow artifact. Status node: Market Intake Record.*

### 1. Analyst Notes - `analyst-notes` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (raw input object) |
| Lesson type | inspection |
| Concepts introduced | Source provenance; unstructured input; ingestion; "where work enters the system" |
| Learner practice | Inspect the note's origin, real-world sources, and the access ingesting it would require; trace how this raw input enters the workflow |
| Lab version | Local text fixture stored in `lesson-intake.json` (the note read in the Intake task) |
| Dependencies | None (workflow origin) |
| Downstream reuse | Market Intake Record |
| Governance note | Ingesting from inbox/Teams/terminal needs access + permission; provenance of the original note must be retained for audit |
| Open question / risk | As an inspection lesson it needs a clear "what did you learn" beat, otherwise a learner clicks past it. Define the inspection prompt that proves the source was understood |

### 2. Trader Flag - `trader-flag` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (an escalation signal/event object) |
| Lesson type | interpretation |
| Concepts introduced | Escalation signals; boolean/event flags; capturing human judgment as structured data |
| Learner practice | Interpret a human escalation signal and map it to the structured `approvalRequired` field the workflow acts on |
| Lab version | Represented as the approval cue inside the analyst note fixture |
| Dependencies | None (workflow origin) |
| Downstream reuse | Market Intake Record |
| Governance note | Requires agreement on *what counts as a flag*; ownership of the escalation channel |
| Open question / risk | The interpretation overlaps the Intake build (the flag becomes `approvalRequired` there). Clarify the distinct lesson: interpreting a signal vs. extracting all fields, so the two do not feel redundant |

### 3. Market Intake Record - `market-intake-record` `[NOW]`

| Field | Detail |
| --- | --- |
| Node type | artifact |
| Thing / action | Thing (the first machine-readable record) |
| Lesson type | build |
| Concepts introduced | JSON; named fields/schema; field extraction; deterministic validation; "automation cannot act on a paragraph" |
| Learner practice | Extract `hub`, `peakPrice`, `settledPrice`, `generationFlag`, `approvalRequired` from a messy note into valid JSON and pass field validation |
| Lab version | Built by the learner in the Intake task by extracting fields from the analyst note |
| Dependencies | Analyst Notes; Trader Flag |
| Downstream reuse | Risk Evaluation; Approval Decision; Morning Brief |
| Governance note | Requires agreement on required intake fields; the schema is the contract every downstream step trusts |
| Open question / risk | Validation rules in `src/lib/validators.js` are frozen by constraint. Any field change here ripples to three downstream nodes - schema stability is a curriculum and integration risk |

---

## Phase 2 - Data Structure Layer

*Goal: bring in numeric market data and normalize it for evaluation. Status node: Clean Price Data.*

### 4. Price Feed / CSV Rows - `price-feed` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (raw tabular input) |
| Lesson type | inspection |
| Concepts introduced | Tabular/CSV ingestion; feed scheduling; column formats |
| Learner practice | Inspect where numeric data enters, its column format, and the access a real feed or export would require |
| Lab version | Not wired up yet - shown to reveal where numeric data enters the workflow |
| Dependencies | None (workflow origin) |
| Downstream reuse | Clean Price Data |
| Governance note | Needs access to the feed/export and knowledge of the column contract |
| Open question / risk | No local fixture exists, so the inspection lesson has little to examine. Add a small sample CSV fixture so the node reads as real, not placeholder |

### 5. Forecast Data - `forecast-data` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (second numeric input) |
| Lesson type | inspection |
| Concepts introduced | Reference/comparison inputs; joining datasets by key; authoritative-source selection |
| Learner practice | Inspect a second numeric input and judge why "which forecast is authoritative" matters before it is compared |
| Lab version | Not wired up yet - shown as a second numeric input |
| Dependencies | None (workflow origin) |
| Downstream reuse | Variance Check |
| Governance note | Requires agreement on which forecast is authoritative (ownership of source-of-truth) |
| Open question / risk | Feeds only Variance Check, which is a `[LATER]` transformation - this sub-branch stays dormant until Phase 3 interactions land |

### 6. Prior Day Reference - `prior-day-reference` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (a baseline lookup) |
| Lesson type | inspection |
| Concepts introduced | Baselines; historical retention; temporal reuse (yesterday's output as today's input) |
| Learner practice | Inspect how a saved prior run is retained and reused as today's comparison baseline |
| Lab version | Stubbed reference object for now |
| Dependencies | Distribution / Archive (seeded by the prior day's archived brief) |
| Downstream reuse | Variance Check |
| Governance note | Needs read access to prior runs and a retention location; retention policy is a governance decision |
| Open question / risk | **Temporal cycle:** depends on Distribution / Archive, which sits at the end of the workflow. The map encodes a day-over-day loop - confirm the UI does not render this as a confusing backward edge or a false circular dependency |

### 7. Clean Price Data - `clean-price-data` `[NOW]`

| Field | Detail |
| --- | --- |
| Node type | artifact |
| Thing / action | Thing (normalized price table) |
| Lesson type | transformation |
| Concepts introduced | Normalization; validation; data quality; type coercion |
| Learner practice | Coerce and validate raw price rows into a trusted, normalized `clean-prices.json` table |
| Lab version | Built by the learner in the Clean Price Data task by normalizing messy price rows into a numeric table |
| Dependencies | Price Feed / CSV Rows |
| Downstream reuse | Risk Evaluation; Morning Brief |
| Governance note | Read access to the feed + a store for the cleaned table; data-quality rules are the trust boundary for everything downstream |
| Open question / risk | **Built (third interactive node).** Uses the additive `jsonRows` validator (top-level array, required row fields, numeric coercion, expected rows present). Output is an array of normalized `{hub, peakPrice, settledPrice}` rows that Risk Evaluation and the Morning Brief can reuse |

---

## Phase 3 - Evaluation Layer

*Goal: apply shared rules and produce a decision-ready risk view. Status node: Risk Evaluation.*

### 8. Threshold Policy - `threshold-policy` `[NOW]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (reusable rules object) |
| Lesson type | governance |
| Concepts introduced | Business rules as reusable config; parameterization; separating policy from logic |
| Learner practice | Set and version the threshold values reused by three downstream nodes, and decide their ownership and approval path |
| Lab version | Built by the learner in the Threshold Policy task by setting and versioning threshold values |
| Dependencies | None (a governed reference) |
| Downstream reuse | Risk Evaluation; Approval Decision; Morning Brief |
| Governance note | Strongest governance node on the map - needs business-owner approval, risk-policy access, and versioning. Reused by three downstream steps |
| Open question / risk | High reuse makes this the first governance proof point. Keep the lesson focused on config-as-rules, versioning, ownership, and approval; avoid turning it into a full rule-engine build |

### 9. Variance Check - `variance-check` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | process |
| Thing / action | Action (comparison/transformation step) |
| Lesson type | transformation |
| Concepts introduced | Comparison/transformation steps; materiality thresholds; flagging meaningful deltas |
| Learner practice | Compute actual-vs-forecast and actual-vs-prior deltas and flag material variance |
| Lab version | Shown to reveal the full workflow shape; the transformation lesson is authored in a later pass |
| Dependencies | Forecast Data; Prior Day Reference |
| Downstream reuse | Risk Evaluation |
| Governance note | Requires agreement on what variance is *material* (a business rule overlapping Threshold Policy) |
| Open question / risk | Produces no named artifact yet is a transformation lesson - decide whether its output is a transient signal or should be stored for auditability |

### 10. Risk Evaluation - `risk-evaluation` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | process (artifact-producing) - emits reusable `risk-evaluation.json` |
| Thing / action | Action that yields a reusable Thing (a derived artifact) |
| Lesson type | transformation |
| Concepts introduced | Rules engine; applying policy to data; producing a decision-ready, reusable record |
| Learner practice | Apply the threshold policy to the intake record, clean prices, and variance to emit the reusable `risk-evaluation.json` record |
| Lab version | Shown to reveal the full workflow shape; the transformation lesson is authored in a later pass |
| Dependencies | Market Intake Record; Clean Price Data; Variance Check; Threshold Policy |
| Downstream reuse | Approval Decision; Morning Brief |
| Governance note | Needs the agreed threshold values and read access to four upstream artifacts; the risk record should be auditable |
| Open question / risk | **Reclassification:** typed `process` but it produces `risk-evaluation.json`, so it behaves like an artifact node (the same dual nature as Clean Price Data). **Recommend** eventually splitting into `Evaluate Risk` (process/action) and `Risk Evaluation Record` (artifact/thing) to satisfy the clean thing/action rule. Acceptable as a single dual-nature node for MVP, but it should not stay ambiguous forever. Also the highest fan-in node (4 dependencies), so it sequences late |

---

## Phase 4 - Routing Layer

*Goal: convert the evaluation into an approval or a routine path. Status node: Approval Route.*

### 11. Approval Template - `approval-template` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (reusable output template) |
| Lesson type | governance |
| Concepts introduced | Output templating; reusable request formats; required-field standards |
| Learner practice | Define the reusable approval format and the required fields a sign-off request must contain |
| Lab version | Stubbed reference object for now |
| Dependencies | None (a reference) |
| Downstream reuse | Approval Route |
| Governance note | Needs agreement on required approval fields; the template standardizes what every approver sees |
| Open question / risk | Lesson type is defensible as governance (defining/versioning the template), but if the authored lesson has the learner *read and apply* an existing template rather than define one, reclassify it as `interpretation`. Revisit when the lesson is authored |

### 12. Approval Decision - `approval-decision` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | decision |
| Thing / action | Action (branch/conditional) |
| Lesson type | decision |
| Concepts introduced | Branching/conditional logic; thresholds; decision audit logging |
| Learner practice | Encode the if/else branch from the risk evaluation and log each decision for audit |
| Lab version | Shown to reveal the full workflow shape; the decision lesson is authored in a later pass |
| Dependencies | Market Intake Record; Threshold Policy; Risk Evaluation |
| Downstream reuse | Approval Route; Routine Update Path |
| Governance note | Needs the escalation threshold and knowledge of who can approve; every decision should be logged for audit |
| Open question / risk | The only true fork on the map (two downstream branches). Produces no artifact - confirm the decision outcome is persisted somewhere for the audit trail |

### 13. Approval Route - `approval-route` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | handoff |
| Thing / action | Action (human/system transition) |
| Lesson type | handoff |
| Concepts introduced | Handoff; human-in-the-loop approval; capturing a response |
| Learner practice | Route a sign-off request to an approver and capture the yes/no response as `approval-route.json` |
| Lab version | Shown to reveal the full workflow shape; the handoff lesson is authored in a later pass |
| Dependencies | Approval Decision; Approval Template |
| Downstream reuse | Morning Brief |
| Governance note | Needs ability to message the approver and a place to record the response; the response is an audit record |
| Open question / risk | Emits `approval-route.json` but is typed `handoff` - like Risk Evaluation, an action that yields a reusable artifact. The real-world version implies messaging integrations out of MVP scope; keep the lab version honest about the simulation boundary |

### 14. Routine Update Path - `routine-update-path` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | handoff |
| Thing / action | Action (the no-approval branch) |
| Lesson type | handoff |
| Concepts introduced | Alternate-branch handling; no-action logging; exception/normal-path symmetry |
| Learner practice | Handle the no-approval branch: write a routine note when below threshold and keep it for the audit trail |
| Lab version | Shown to reveal the full workflow shape; the handoff lesson is authored in a later pass |
| Dependencies | Approval Decision |
| Downstream reuse | Morning Brief |
| Governance note | Needs a place to record routine outcomes; "no action" must still be auditable |
| Open question / risk | The quiet branch - easy to under-teach. Its value is that the non-escalation path is still logged; make sure the map/panel conveys that |

---

## Phase 5 - Brief Assembly Layer

*Goal: assemble the approval-ready 7:00 AM business output. Status node: Morning Brief.*

### 15. Prior Day Brief Template - `prior-day-brief-template` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (reusable output structure) |
| Lesson type | inspection |
| Concepts introduced | Output structure/consistency; templating across runs |
| Learner practice | Inspect the reusable brief structure and how it keeps the daily output consistent before assembly |
| Lab version | Stubbed reference object for now |
| Dependencies | None (a reference) |
| Downstream reuse | Morning Brief |
| Governance note | Needs agreement on the brief sections; template versioning keeps output consistent |
| Open question / risk | Conceptually overlaps Prior Day Reference (both "carried over from yesterday"). Clarify the distinction: *structure* (this template) vs. *baseline data* (the reference). If every node is a lesson, inspection may be too passive here - consider `interpretation` (learner interprets the template structure and identifies the required sections) when authoring |

### 16. Morning Brief - `morning-brief` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | output |
| Thing / action | Thing (the delivered business document) |
| Lesson type | assembly |
| Concepts introduced | Aggregation/assembly; joining many artifacts into one deliverable; rendering output |
| Learner practice | Assemble the intake record, clean prices, risk, approval status, and template into one approval-ready `market-brief.md` |
| Lab version | Shown to reveal the full workflow shape; the assembly lesson is authored in a later pass |
| Dependencies | Market Intake Record; Clean Price Data; Threshold Policy; Risk Evaluation; Approval Route; Routine Update Path; Prior Day Brief Template |
| Downstream reuse | Distribution / Archive |
| Governance note | Needs read access to all upstream artifacts + the template; the assembled brief is the record of the day |
| Open question / risk | **Highest fan-in on the map (7 dependencies).** The natural capstone assembly lesson, but it requires nearly the whole graph to exist first - last in any realistic build order |

### 17. Distribution / Archive - `distribution-archive` `[LATER]`

| Field | Detail |
| --- | --- |
| Node type | archive |
| Thing / action | **Ambiguous - Action (distribute) + Thing (archive).** Violates the node-taxonomy rule that a node be either a thing or an action |
| Lesson type | handoff |
| Concepts introduced | Delivery; retention; audit trail; the feedback loop that seeds the next run |
| Learner practice | Deliver the brief to the desk, archive it for the record, and seed tomorrow's prior-day baseline |
| Lab version | Shown to reveal the full workflow shape; the handoff lesson is authored in a later pass |
| Dependencies | Morning Brief |
| Downstream reuse | Prior Day Reference (seeds tomorrow's run) |
| Governance note | Needs send permission to the distribution list and write access to the archive; retention/audit policy applies |
| Open question / risk | Closes the day-over-day loop back to Prior Day Reference. The dual delivery+retention nature also blurs the lesson type (handoff vs. governance/archive). **Recommend** splitting into two nodes - Distribution (handoff/action) and Archive (archive or output/thing) - or clarifying the dual role explicitly in the node panel. This is likely the first map shape change to make after the audit |

---

## Cross-Cutting Findings & Recommendations

> These are recommendations recorded inside the audit, per the doctrine. They do not change code, data, or UI.

1. **Every node is now a lesson.** The audit assigns one active lesson type to all 17 nodes; the old "inspect-only context" framing is removed. Inspection is itself a lesson type (examine provenance, contents, and access), so source/reference nodes are lessons with a defined learner action, not passive context.

2. **Artifact-producing process/handoff nodes.** Risk Evaluation (`risk-evaluation.json`) and Approval Route (`approval-route.json`) are typed `process`/`handoff` but emit reusable artifacts - the same dual nature already accepted for Clean Price Data. **Recommend** treating these emitted files as first-class reusable artifacts on the map so downstream reuse points at an object, not a transient step output. The clean long-term fix for Risk Evaluation is to split it into `Evaluate Risk` (action) and `Risk Evaluation Record` (artifact/thing).

3. **Taxonomy violation - Distribution / Archive (node 17).** The only node whose label is both an action and a thing. Doctrine says rename or clarify. Preferred fix: split into `Distribution` (handoff/action) and `Archive` (archive or output/thing); minimum fix: explicit dual-role clarification in the selected-node panel. This is likely the first map shape change to make after the audit.

4. **Temporal loop is real and intentional.** `distribution-archive -> prior-day-reference` encodes a day-over-day cycle. Correct workflow modeling, but it is the one backward edge in the graph - verify it renders clearly and is not mistaken for a same-run circular dependency.

5. **Governance lessons are now represented interactively.** Threshold Policy is `[NOW]` and proves that governance/config-as-rules can be a first-class lesson, not just explanatory context. Approval Template remains typed `governance` with defined intent. Note: Approval Template could become `interpretation` instead of `governance` if the authored lesson has the learner read/apply a template rather than define one.

6. **Major artifact build order** (artifact-producing nodes that gate progress):
   1. Market Intake Record -> `market-intake.json` - `[NOW]`
   2. Clean Price Data -> `clean-prices.json` - `[NOW]`
   3. Risk Evaluation -> `risk-evaluation.json`
   4. Approval Route -> `approval-route.json`
   5. Morning Brief -> `market-brief.md`

   Supporting governance artifacts feed in alongside: Threshold Policy -> `threshold-policy.json` (before Risk Evaluation) and Approval Template -> `approval-template.json` (before Approval Route). This order respects fan-in: low-dependency artifacts first, the 4-in Risk Evaluation and 7-in Morning Brief last.

7. **Full learner path** (all 17 lessons in pedagogical order, interleaving non-build lesson types):
   1. Analyst Notes - inspection
   2. Trader Flag - interpretation
   3. Market Intake Record - build
   4. Price Feed / CSV Rows - inspection
   5. Forecast Data - inspection
   6. Prior Day Reference - inspection
   7. Clean Price Data - transformation
   8. Threshold Policy - governance
   9. Variance Check - transformation
   10. Risk Evaluation - transformation
   11. Approval Template - governance
   12. Approval Decision - decision
   13. Approval Route - handoff
   14. Routine Update Path - handoff
   15. Prior Day Brief Template - inspection
   16. Morning Brief - assembly
   17. Distribution / Archive - handoff

   The full path is broader than the artifact build order: inspection, interpretation, and governance lessons sit between the artifact builds so the learner understands provenance, signals, and rules - not just the objects produced.

8. **Concept-overlap pairs to disambiguate in panels.** Analyst Notes (inspection) vs. Trader Flag (interpretation) - commentary vs. signal. Prior Day Reference (baseline data) vs. Prior Day Brief Template (output structure). Each pair shares a phase and a downstream target, so the distinct lesson must be explicit.

9. **Lessons without a stored artifact.** Variance Check, Approval Decision, and Routine Update Path produce no named artifact. For auditability, decide per node whether the output is a transient signal or a stored, inspectable record before authoring their lessons.

10. **Sources need fixtures before their lessons are interactive.** Price Feed and Forecast Data have no local fixture, so their inspection lessons currently have little to examine. Add minimal sample fixtures so the nodes read as real rather than placeholder.

11. **Coverage snapshot.** 17 lessons by type: inspection 5 (Analyst Notes, Price Feed, Forecast Data, Prior Day Reference, Prior Day Brief Template), interpretation 1 (Trader Flag), build 1 (Market Intake Record), transformation 3 (Clean Price Data, Variance Check, Risk Evaluation), governance 2 (Threshold Policy, Approval Template), decision 1 (Approval Decision), handoff 3 (Approval Route, Routine Update Path, Distribution / Archive), assembly 1 (Morning Brief). By status: 3 `[NOW]`, 5 `[INTENT]`, 9 `[LATER]`.
