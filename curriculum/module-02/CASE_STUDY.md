# Module 2 Case Study - Beacon Invoice Desk

A portfolio record of what Module 2 is, how it was built, and what a learner
can demonstrably do after finishing it. ASCII-only.

## The scenario

Beacon Manufacturing buys parts from about 200 vendors. Every business day the
accounts-payable desk must turn a messy pile of inbound invoices into an
approved payment run by 3:00 PM. Pay a bad invoice and money leaves the
building; pay late and vendors stop shipping. Module 2 rebuilds the workflow
that captures, matches, and routes invoices so the 3:00 PM run is trustworthy.
As in Module 1, the learner does not watch the workflow - they rebuild it one
trusted artifact at a time, and each artifact is consumed by the next node on
the map.

The workflow map has 17 nodes across five phases: Capture, Reference Data,
Matching, Exceptions and Approval, and Payment and Archive. Sources and
references (invoice inbox, vendor master, PO register, receipt log) are
inspected; process, decision, handoff, and output nodes are BUILT by completing
a lesson that produces a durable artifact. The deliverable is `payment-run.md` -
the daily approved batch: which invoices get paid, which matched automatically,
which cleared exception review, and what was held.

## The signature concept cluster

Module 2 introduces the accounts-payable control stack on top of Module 1's
intake/decision/assembly spine:

- Document extraction - turning an invoice document into a trusted record.
- Two- and three-way matching - invoice vs PO vs goods receipt within tolerance.
- Tolerance policy - price and quantity variance as owned, versioned config.
- Duplicate detection - deduping against the paid-invoice archive.
- Exception queues - the path a non-matching invoice takes to a human.
- Master data - the vendor record as a governed reference, with change control.

## The three-tier depth model

Difficulty is depth on the SAME map, not new territory:

- EASY - operate the pattern (17 lessons). Capture one clean-ish invoice,
  inspect the references, run a single tolerance check, match three ways, route
  the auto path, batch the approved invoices, and assemble the 3:00 PM run on
  cooperative data.
- MEDIUM - handle the mess (17 lessons). The same map on adversarial inputs: a
  duplicate invoice, a price outside tolerance, a vendor missing from the master
  (exception routing), a missing receipt (two-way vs three-way), and a run that
  has to surface holds rather than hide them.
- HARD - own the design (5 curated drills). The learner authors the rules the
  earlier tiers merely applied: design the larger-of tolerance band from 90 days
  of variance history, design the duplicate-detection identity rule from four
  near-miss cases, run a vendor bank-detail change as a business-email-compromise
  fraud control (verify by callback to the number on file, dual approval, hold
  payments), work the tolerance boundary across four edge invoices, and ship a
  degraded pay-nothing run when the PO register is down.

Only 5 of the 17 nodes get a Hard variant. Where a design is genuinely the
learner's call (the tolerance band, the dedupe rule), the validator checks SHAPE
and GOVERNANCE (fields present, numbers are numbers, rationale non-empty), not
exact numbers - that is the pedagogy, not a gap. Where the "design" has a correct
answer because it is fraud prevention (the bank-detail control) or arithmetic
(the tolerance boundary), the validator pins the answer. That curation is a
recorded decision.

## Engine work Module 2 forced

Module 2 needed no new interaction types - choiceCheck, the four frozen JSON
validators (jsonFields, jsonPolicy, jsonRows, jsonDeltas), and templateSlots
covered the whole spine, which validated the Module 1 engine as reusable. Two
pieces of platform work did land:

- The multi-project engine (SPEC_MULTI_PROJECT.md) shipped before this module: a
  project registry, a header project switcher, per-project `src/data/projects/<id>/`
  data roots, and `__<id>` storage-key namespacing. Module 1 keeps its legacy
  un-namespaced keys byte-for-byte.
- A structural no-scroll fix to the shared jsonEditor Exercise workbench. Hard
  design drills legitimately pair a long evidence narrative with an 8-9 field
  guide, which overflowed the page. Rather than gut the evidence, each Exercise
  column is now bounded to the viewport and only the raw source narrative scrolls
  internally; the live field-guide checklist, editor, and readiness callout stay
  fixed. The change is additive (height caps on the lg breakpoint only), so short
  lessons and all of Module 1 are unaffected.

## Guardrails that kept it honest

- `npm run check` (eslint + lesson lint against canon.json + correct/wrong
  regression fixtures + build) is green before every commit.
- The no-scroll HARD RULE: every Exercise surface fits without page scroll at
  1280x800 in its tallest (wrong-answer) state, verified live. All five Hard
  lessons and a Module 1 regression lesson measured scrollHeight === clientHeight
  === 800.
- canon.json pins shared numbers (tolerance boundary rows, variance percentages)
  so two lessons cannot drift apart on the same fact.
- The ratified charter fixed the org, the seven named roles, and the map spine
  up front, so no role, node, or rule was invented mid-lesson.

## What a learner can do after Module 2

- Extract a trusted, structured invoice record from a document and explain what
  breaks downstream if a field is wrong.
- Match an invoice against a purchase order and a goods receipt within a governed
  tolerance, and route matches vs exceptions correctly - including the inclusive
  boundary and the rule that a duplicate always beats a clean match.
- Assemble an approval-ready payment run from previously produced artifacts by a
  hard 3:00 PM cutoff.
- At depth: design a tolerance policy and a duplicate-detection rule from
  evidence, run a high-risk vendor bank-detail change as a fraud control, and
  ship a safe degraded run when a system of record is down - proving each piece
  against the real acceptance bar.
