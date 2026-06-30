# Market Intake Record - Artifact Spec

One-page product spec for the artifact. The lesson UI contract (lesson JSON fields) is
DERIVED from this spec - this spec locks the product logic first. Keep ASCII.

File: `market-intake.json`  |  Node: `market-intake-record`  |  Phase: Intake (Phase 1)  |  Type: artifact

---

## 1. Why this artifact exists

The Market Intake Record is the first structured object in the Meridian workflow. It converts
an analyst's freeform overnight observations into machine-readable data the rest of the
automation can trust. Without it, nothing downstream can be evaluated, routed, approved, or
summarized. It is the contract between human observation and automation.

## 2. Created by / source of truth

- Created by: the market analyst (in the lab, the learner plays this role - they BECOME the
  Market Intake Service).
- Source of truth: once created, the record - not the prose analyst note - is the operational
  source of truth for downstream automation. Every downstream step must reference the record,
  never re-read the note. The original note remains retained for audit/provenance; it is not
  discarded, but it is no longer the thing automation reads.

## 3. Fields (the heart of the spec)

Each field is either OBSERVED (copied from the note) or INTERPRETED (a judgment the analyst makes).

| Field | Meaning | Origin | Consumed by | Breaks if wrong |
| --- | --- | --- | --- | --- |
| `hub` | The market hub the observations apply to | Observed | Risk Evaluation, Approval Decision, Morning Brief (join key) | Every downstream join targets the wrong market; the whole brief is about the wrong thing |
| `peakPrice` | Highest price observed during the ramp | Observed | Risk Evaluation, Morning Brief | Deterministic risk/variance math runs on bad numbers - silent wrong decisions |
| `settledPrice` | Price the market settled near | Observed | Risk Evaluation, Morning Brief | Same as peakPrice - corrupts every downstream calculation |
| `generationFlag` | Generation source + performance status (the "why") | Interpreted | Risk Evaluation (context), Morning Brief (narrative) | Risk story loses its causal explanation; the brief misleads readers |
| `approvalRequired` | Whether the event must go to approval | Interpreted | Approval Decision (routing/governance) | A flagged event skips approval (governance failure) or a routine one triggers needless escalation |

## 4. Direct consumers (grounded in the real graph, not the mockup strip)

Per `workflowEdges.json`, `market-intake-record` directly feeds:
- `risk-evaluation` ("feeds")
- `approval-decision` ("reused by")
- `morning-brief` ("summarized in")

It does NOT feed Clean Price Data or Variance Check - those are siblings fed by their own
sources. The intro/takeaway strip must reflect this, not a linear chain.

Local neighborhood for the focused strip:
- Upstream: `analyst-notes`, `trader-flag`
- This: `market-intake-record`
- Downstream (direct): `risk-evaluation`, `approval-decision`, `morning-brief`

## 5. Definition of "complete" (beyond validation)

Validation passing is necessary but not sufficient. "Complete" means: the record holds enough
correctly-typed, trustworthy fields that downstream automation can run deterministically
WITHOUT re-reading the original note. At that moment the record becomes the operational source
of truth for downstream automation, while the original note remains retained for audit/provenance.

## 6. Governance moment

`approvalRequired` is a governance-bearing field: it is the trigger that decides whether a human
must sign off before the workflow acts. Getting it wrong is not a data error, it is a controls
failure. This is the lesson's "governance is part of automation" beat.

## 7. Honest map states for the takeaway (replaces "unlocked")

When Intake is built, NOTHING downstream becomes build-ready (Risk Evaluation also needs Clean
Price Data, Variance Check, and Threshold Policy). So the three states are:
- **Created**: `market-intake-record` now exists.
- **Will reuse this artifact**: `risk-evaluation`, `approval-decision`, `morning-brief` depend on it.
- **Still needs other inputs**: those same consumers are not build-ready yet (they await other artifacts).

This is honest and still motivating: the learner sees they built a foundation three future nodes
are waiting on.

## 8. Capability Statement

> The workflow can now consume structured market observations.

(A statement about what the SYSTEM can do, not what the learner knows. Ends the takeaway.)

---

## 9. Derived lesson UI contract (spec -> lesson JSON)

These lesson JSON fields are the UI expression of the spec above (added to `lesson-intake.json`):

- `intro.subtitle` = "Create the first trusted record in the workflow" (from sec. 1)
- `intro.summary` = short form of sec. 1
- `intro.concept` = "Structured data / field extraction" (the chip)
- `intro.directConsumers` = ["risk-evaluation","approval-decision","morning-brief"] (from sec. 4)
- `takeaway.before` = "The workflow only had a human analyst note."
- `takeaway.after` = "The workflow has a structured Market Intake Record downstream steps can reuse."
- `takeaway.capability` = sec. 8 capability statement
- `takeaway.nextNodeId` = node to pre-select on return to map
- Field-level `consumedBy` / origin (sec. 3) can enrich the Field Guide later (optional this pass)

The focused strip component derives upstream/downstream from `workflowEdges.json` + the node id,
and renders the three states from sec. 7.
