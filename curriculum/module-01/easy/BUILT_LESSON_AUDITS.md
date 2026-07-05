# Built Lesson Audits - Module 1 Easy (lessons 03, 07, 08, 09)

Conformance audit of the four built lessons against LESSON_AUTHORING_TEMPLATE.md
and the framework in LESSON_DESIGN_FRAMEWORK.md. Verdict per lesson plus optional
polish deltas (Wave D - lowest priority; the lessons are acceptable as shipped).

## 03 market-intake-record (lesson-intake.json) - CONFORMS, gold standard

- Business-first intro, one primary concept (structured data / field extraction),
  named artifact, consumers listed, governance/audit note present.
- Takeaway has explicit before/after and the exact Capability Statement.
- Uses the RICH intro dialect (mission, whatCameIn, unlocks). This is the target
  dialect for an eventual polish pass on the other lessons.
- No deltas required.

## 07 clean-price-data - CONFORMS

- One primary concept (normalization and type coercion); trust-boundary framing is
  strong; canon numbers correct.
- Delta 1 (copy): takeaway's last point is downstream reuse, not a Capability
  Statement. Append final point: "The workflow can now perform deterministic
  calculations on trusted numeric prices."
- Delta 2 (copy): scenario says 6:20 AM but sits after threshold-policy's 6:25 AM
  in some orderings; no change needed - the overview clock (section 1) already
  places clean-price-data at 6:20 and policy/variance at 6:25.

## 08 threshold-policy - CONFORMS

- Governance-as-config is taught cleanly; ownership, approver, versioning present.
- Delta 1 (copy): append Capability Statement as final takeaway point: "The
  workflow can now apply consistent business thresholds without hardcoding rules."
- Delta 2 (awareness, no change): jsonPolicy checks numeric-ness and ordering, not
  the values 5/12. Canon depends on learners entering 5 and 12, but any ordered
  pair passes. Acceptable at Easy; lesson 10's input restates the policy values,
  so downstream canon does not break.

## 09 variance-check - CONFORMS

- Derived-fields concept is clean; negative deltas taught; material flag optional
  and validated only when present.
- Delta 1 (copy): append Capability Statement as final takeaway point: "The
  workflow can now judge how far each hub moved from forecast and prior day."
- Delta 2 (copy, valuable): add one intro sentence distinguishing the two
  materiality rules on the map: "This lesson's material flag (10 or more vs
  forecast) belongs to Variance Check; the Threshold Policy's percent rules
  belong to Risk Evaluation. Two steps, two owned rules." This pre-teaches the
  distinction lesson 10 relies on.

## Common note

All four lessons keep validation additive and bounded and respect the no-scroll
rule. Do not change validators or interactionType for any of them.
