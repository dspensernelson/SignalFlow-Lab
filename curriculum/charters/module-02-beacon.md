# Module 2 Charter - Beacon Invoice Desk (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Beacon Manufacturing buys parts from ~200 vendors. Every business day the
accounts-payable desk must turn a messy pile of inbound invoices into an
approved payment run by 3:00 PM - pay a bad invoice and money leaves the
building; pay late and vendors stop shipping. The learner builds the
automation that captures, matches, and routes invoices so the 3:00 PM run
is trustworthy.

## The deliverable

`payment-run.md` - the daily approved payment batch: which invoices get paid
today, which were matched automatically, which cleared exception review, and
what got held. Assembled from artifacts, approval-ready by 3:00 PM.

## Named roles (FIXED - never invent more)

AP Clerk (processes invoices), AP Manager (approves the run and exceptions),
Procurement Lead (owns the PO register), Receiving Desk (posts goods
receipts), Vendor Relations Desk (owns the vendor master), Controller
(approves policy changes), Payables DL (receives the run).

## Signature concept cluster (new here)

Document extraction, two/three-way matching, tolerance policies, duplicate
detection, exception queues, master data (the vendor record as a governed
reference).

## Recurring concepts (deepened from Module 1)

Intake records, config-as-rules (tolerances), decision logging, handoffs
with captured responses, assembly, archive-seeded loops.

## Draft map spine (refine at the map gate; do not change shape class)

Phases: Capture -> Reference Data -> Matching -> Exceptions and Approval ->
Payment and Archive.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| invoice-inbox | source | inspection | Documents as a feed (PDF/email mix, arrival contract) |
| vendor-master | reference | governance | Master data: the governed vendor record |
| po-register | reference | inspection | The purchase-order system of record; join keys |
| receipt-log | source | inspection | Goods receipts; the third leg of the match |
| invoice-record | artifact | build | Extracting a trusted invoice record from a document |
| tolerance-policy | reference | governance | Price/quantity tolerances as owned config |
| duplicate-check | process | transformation | Dedupe against history (consumes the archive) |
| three-way-match | process | transformation | Invoice vs PO vs receipt, within tolerance |
| match-decision | decision | decision | Matched -> auto path; else -> exception queue |
| exception-queue | handoff | handoff | Working an exception: investigate, resolve, log |
| auto-approve-path | handoff | handoff | The quiet path still logs (echoes M1) |
| payment-batch | artifact | assembly-prep | Batching approved invoices with cutoffs |
| run-approval | handoff | handoff | AP Manager signs the run; response captured |
| payment-run | output | assembly | The 3:00 PM package, traceable to artifacts |
| remittance-advice | output | handoff | Telling vendors what was paid and why |
| payment-archive | archive | handoff | Retention; seeds tomorrow's duplicate-check |

(16 nodes; builder may add 1-2 or merge within guardrails at the map gate.)

## The fork

match-decision: within tolerance and no duplicate -> auto-approve-path;
anything else -> exception-queue. Boundary teaching: a variance EXACTLY at
tolerance passes (tolerance is inclusive), and a duplicate ALWAYS wins over
a clean match.

## The temporal loop

payment-archive -> duplicate-check: yesterday's paid invoices are today's
duplicate baseline. Same edge semantics as Meridian's archive -> prior-day
reference.

## Unlock root and early branches

Root: invoice-inbox (intro inspection). Fans to vendor-master + po-register,
then invoice-record and the receipt/matching branch - two entry branches
(document path, reference-data path) converging at three-way-match.

## Tier postures

- Easy: one clean-ish invoice, references that match, one tolerance check.
- Medium: a duplicate invoice, a price outside tolerance, a vendor not in
  the master (exception routing), a missing receipt (2-way vs 3-way).
- Hard (curated drills): design the tolerance policy from vendor history;
  vendor-master change management (bank-detail change = fraud-check drill);
  duplicate-detection rule design; degraded run when the PO system is down.

## Engine needs (self-serve under AUTONOMY_CHARTER)

Multi-project support (SPEC_MULTI_PROJECT.md - pre-approved) must land
before this module. No new interaction types expected: choiceCheck,
jsonEditor validators, and templateSlots cover the spine.

## Canon guidance

Currency USD with cents (numbers, 2dp); invoice numbers INV-#####; PO
numbers PO-####; dates relative ("day-1"); tolerance in percent and absolute
dollars. Author per playbook Step 4; all cross-lesson numbers into
curriculum/module-02/canon.json.
