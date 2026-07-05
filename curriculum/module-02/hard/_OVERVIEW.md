# Module 2 - Beacon Invoice Desk - HARD tier canon and overview

Status: BUILT 2026-07-03 (Step 7 Hard tier). 5 curated DESIGN drills.
Tier posture (Hard): Easy validated VALUES, Medium validated DECISIONS, Hard
validates DESIGNS. The learner authors the rules the earlier tiers merely
applied, absorbs an injected failure, and manages a high-risk change. Where a
design is genuinely the learner's choice (the tolerance band, the dedupe rule),
the validator checks SHAPE and GOVERNANCE (fields present, numbers are numbers,
rationale non-empty) rather than exact numbers - that is the pedagogy, not a
validation gap. Where the "design" has a correct answer because it is fraud
prevention (the bank-detail control) or arithmetic (the tolerance boundary), the
validator pins the answer.

Hard drills are STANDALONE - each carries its own scenario; they are not one
continuous AP day. Only 5 of the 17 nodes get a Hard variant, matching the
charter's four curated drills plus the tolerance-boundary drill the PM audit
(AUDIT_REPORT_2026-07-02.md, F1c) asked for. Lessons live in src/data/lessons/
as `lesson-<node>-hard.json`, resolved via tierLessonId (taskId + "-hard"),
listed in BUILT_LESSONS.module-02.hard. Hard progress/artifacts use the
`__module-02` namespaced keys with the `_hard` tier suffix. ASCII only. Currency
USD with cents (2dp).

## Built lessons (5)

| Node | Lesson id | Design responsibility | Interaction |
| --- | --- | --- | --- |
| tolerance-policy | lesson-tolerance-policy-hard | Design the larger-of tolerance band from 90 days of variance history; rationale cites the 84/6 split | jsonEditor / jsonPolicy |
| duplicate-check | lesson-duplicate-check-hard | Design the duplicate-detection rule (identity key, lookback, exact vs partial action) from 4 near-miss cases | jsonEditor / jsonPolicy |
| vendor-master | lesson-vendor-master-hard | Bank-detail change control: verify by callback to the number ON FILE, dual approval, hold payments (BEC fraud drill) | jsonEditor / jsonFields |
| three-way-match | lesson-three-way-match-hard | Work the tolerance boundary: four invoices at the edge of larger-of | jsonEditor / jsonDeltas |
| payment-run | lesson-payment-run-hard | Ship a degraded run when the PO register is down: pay nothing unverified, log the incident | templateSlots |

## Drill 1 - Tolerance policy design (tolerance-policy-hard)

Redesign the price tolerance from evidence. Given: 90 days of variances - 84 of
90 benign (under both 25.00 and 2%), 6 real overcharges (over BOTH legs), POs
from ~600 to ~8,000. Design constraints: benign drift must pass; larger-of must
protect small POs (dollar floor) and large POs (percentage). Governance: owner
AP Manager, approver Controller, version 2.0.0. Validator checks shape +
governance (jsonPolicy), NOT exact numbers - the band is the learner's to
defend. Canonical valid design (fixture): pct 2, abs 25, basis larger,
qtyTolerance 0.

## Drill 2 - Duplicate-detection rule design (duplicate-check-hard)

Author the identity rule from four near-miss cases: (1) true duplicate =
vendor+number+total match -> auto-reject; (2) resend under a new number = same
vendor+total, new number -> a number-only key misses it; (3) split shipment =
same vendor+number, different total -> a number-only key wrongly rejects it;
(4) altered total = same vendor+number, higher total -> never auto-reject, a
human looks. Design: identityKey (vendorId + invoiceNumber + invoiceTotal),
lookbackDays (~60-90), exactMatchAction (auto-reject), partialMatchAction
(human review). Owner AP Manager, approver Controller, version 1.0.0. jsonPolicy
checks shape + governance.

## Drill 3 - Vendor bank-detail change control (vendor-master-hard) - FRAUD

An emailed request asks to change V-1042 Northwind's ACH ...4021 to a new
account before the 3:00 PM run. This is business-email-compromise, the top
payment-fraud vector. The CONTROL has a correct answer, so jsonFields pins it:
- changeType bank-detail, vendorId V-1042
- requestChannel email (a risk signal, recorded)
- verificationMethod callback (out of band)
- verificationContact = the number ON FILE, never the number in the email
- secondApprover AP Manager (dual control), paymentsHeld true
- status pending-verification (not applied)
WRONG fixture = trust the number in the request email (the fraud trap).

## Drill 4 - Tolerance boundary battery (three-way-match-hard)

Four invoices at the edge of larger-of(2% of PO, 25.00), boundary inclusive.
Canon.json derives variance (delta) and variancePct (pctMove, round 2) for all
four and asserts toleranceBand + withinTolerance.

| Invoice | PO | Invoice | Variance | Variance % | Band | Within? | Teaching |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INV-59101 | 1200.00 | 1224.50 | 24.50 | 2.04 | 25.00 | true | 25 floor rescues an over-2% gap (F1c case) |
| INV-59102 | 1200.00 | 1225.00 | 25.00 | 2.08 | 25.00 | true | exact line passes (inclusive boundary) |
| INV-59103 | 1200.00 | 1225.50 | 25.50 | 2.13 | 25.00 | false | a hair over the floor |
| INV-59104 | 2000.00 | 2045.00 | 45.00 | 2.25 | 40.00 | false | on a big PO the 2% leg (40) is the band, so 45 fails |

Band = max(2% of PO, 25): 25 for the 1200 POs (2% = 24), 40 for the 2000 PO
(2% = 40). The battery proves both legs of larger-of in both directions: the
dollar floor rescues (59101), the percentage leg catches (59104).

## Drill 5 - Degraded payment run (payment-run-hard)

2:15 PM, the PO register is DOWN, so no invoice can be three-way matched. The
safe posture: pay nothing unverified, hold everything, mark the run degraded,
carry the incident in the deliverable, name the approver. Canonical values:
outage 1:45 PM, detected 1:50 PM, ticket INC-4471, paid 0, held 6, runMode
degraded, approved by AP Manager 2:30 PM, cutoff 3:00 PM. templateSlots renders
payment-run.md. WRONG fixture = runMode normal + paid 6 (paying unverified),
which the assembly must never do. Echoes Module 1's morning-brief-hard: ship
degraded output honestly, explain the gap, defer work safely.

## Nodes deliberately WITHOUT a Hard variant (12)

invoice-inbox, po-register, invoice-record, receipt-log, payment-history,
match-decision, exception-queue, auto-approve-path, payment-batch, run-approval,
remittance-advice, payment-archive. Their content is inspection, routing, or
assembly that does not deepen into a distinct design skill beyond what the five
drills already teach. Add one later only if a genuinely new design skill emerges.

## Canon rules honored

- The boundary variances and percents recompute from PO and invoice totals;
  canon.json derivations enforce all four rows so a plausible-but-wrong figure
  cannot ship.
- toleranceBand and withinTolerance are asserted per boundary row, pinning the
  larger-of outcome (25/25/25/40 and true/true/false/false).
- The design drills (tolerance, dedupe) carry NO value canon by design: the
  numbers are the learner's, checked for shape and governance only.
- The fraud control (vendor-master-hard) IS pinned, because callback-to-the-
  number-on-file is not a matter of taste.
