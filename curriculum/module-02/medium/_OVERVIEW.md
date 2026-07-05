# Module 2 - Beacon Invoice Desk - MEDIUM tier canon and overview

Status: IN PROGRESS (Step 7 build 2026-07-02).
Tier posture (Medium): work a MESSY batch, not one clean invoice. Five invoices
land this morning; only one is clean. The other four each carry exactly one of
the charter's named problems - a duplicate, a price outside tolerance, a vendor
not in the master, and a missing receipt. The learner runs the same 17-node
desk, but now the matching and routing steps must catch the mess and hold the
bad invoices instead of paying them.

This file is the prose canon: every value, role, time, threshold, and artifact
for the Medium tier. curriculum/module-02/canon.json holds the machine-checkable
assertions and derivations for numbers that appear in more than one lesson.
ASCII only. Currency is USD with cents (2dp). Invoice numbers INV-#####; PO
numbers PO-####; vendor ids V-####; dates relative ("day-1" = today, "day-0" =
the prior run).

---

## The clock (same AP day spine, busier)

Beacon's AP desk still owes an approved payment run by 3:00 PM. The Medium day:

- 8:00 AM - five invoices arrive in the Invoice Inbox.
- 9:00 AM - the AP Clerk extracts the five invoice records as a batch.
- 10:00 AM - reference data is loaded (vendor master, PO register, receipts,
  tolerance policy, payment history).
- 11:00 AM - duplicate check and three-way match run across the batch.
- 1:00 PM - four exceptions are worked and routed to their owners.
- 2:00 PM - the Payment Batch is assembled: one invoice pays, four are held.
- 2:30 PM - the AP Manager approves a run of one and acknowledges four holds.
- 3:00 PM - the Payment Run pays Northwind for the clean invoice; remittance is
  sent; the run is archived and seeds tomorrow's duplicate baseline.

## Roles (FIXED - from the charter, never invent more)

AP Clerk (processes invoices), AP Manager (approves the run and exceptions),
Procurement Lead (owns the PO register), Receiving Desk (posts goods receipts),
Vendor Relations Desk (owns the vendor master), Controller (approves policy
changes), Payables DL (receives the run).

---

## The batch (five invoices, day-1)

| Invoice | Vendor | PO | Qty (inv) | Unit (inv) | Invoice total | PO qty | PO unit | PO total | Receipt | Problem |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-59001 | V-1042 Northwind Fasteners | PO-7742 | 500 | 2.40 | 1200.00 | 500 | 2.40 | 1200.00 | 500 accepted | none (clean) |
| INV-59002 | V-1108 Cascade Packaging | PO-7751 | 300 | 4.10 | 1230.00 | 300 | 3.80 | 1140.00 | 300 accepted | price outside tolerance |
| INV-58962 | V-1042 Northwind Fasteners | PO-7738 | 400 | 1.60 | 640.00 | 400 | 1.60 | 640.00 | 400 accepted | duplicate (already paid day-0) |
| INV-59004 | V-1205 Sierra Tooling | PO-7760 | 200 | 6.00 | 1200.00 | 200 | 6.00 | 1200.00 | 200 accepted | vendor not in master |
| INV-59005 | V-1042 Northwind Fasteners | PO-7763 | 400 | 2.50 | 1000.00 | 400 | 2.48 | 992.00 | none posted | missing receipt (2-way only) |

## Vendor Master (Medium)

| Vendor id | Legal name | Status | Bank on file | Owned by |
| --- | --- | --- | --- | --- |
| V-1042 | Northwind Fasteners | active | ACH ...4021 | Vendor Relations Desk |
| V-1108 | Cascade Packaging | active | ACH ...7735 | Vendor Relations Desk |

V-1205 (Sierra Tooling) is NOT in the master. There is no banking or remit-to
on file, so INV-59004 cannot be paid until Vendor Relations onboards the vendor.
An unknown payee is a hard stop, never a tolerance judgement.

## Tolerance Policy - v1.0.0 (unchanged from Easy)

Price variance allowed within the LARGER of 2% of the PO or 25.00; quantity must
match exactly. Approved by the Controller, effective day-0.

## Payment History (the day-0 baseline the duplicate check reads)

| Invoice | Vendor | Amount | Paid |
| --- | --- | --- | --- |
| INV-58962 | V-1042 | 640.00 | day-0 |
| INV-58790 | V-1108 | 980.00 | day-0 |

Identity key = vendor id + invoice number + invoice total. INV-58962 reappears
in today's inbox with the same key, so it is a duplicate. A duplicate ALWAYS
wins - it is held before any matching runs.

---

## Derived / matched values (recomputed; canon.json enforces)

Only the invoices that have a known vendor AND are not duplicates reach the
three-way match: INV-59001, INV-59002, and INV-59005.

| Invoice | Variance | How it derives | Variance % | Band | Within tolerance | Qty match |
| --- | --- | --- | --- | --- | --- | --- |
| INV-59001 | 0.00 | 1200.00 - 1200.00 | 0.00 | 25.00 | true | true |
| INV-59002 | 90.00 | 1230.00 - 1140.00 | 7.89 | 25.00 | false (90 > 25) | true |
| INV-59005 | 8.00 | 1000.00 - 992.00 | 0.81 | 25.00 | true | false (no receipt) |

- INV-59002 band = max(2% of 1140.00 = 22.80, 25.00) = 25.00; a 90.00 variance
  is far outside it, so the price leg fails.
- INV-59005 price is within tolerance, but with no goods receipt the third leg
  is missing - a two-way match only, which cannot auto-approve.
- INV-58962 (duplicate) and INV-59004 (unknown vendor) never reach the match.

## Duplicate check (per invoice)

| Invoice | Found in history | Is duplicate |
| --- | --- | --- |
| INV-59001 | false | false |
| INV-59002 | false | false |
| INV-58962 | true | true |
| INV-59004 | false | false |
| INV-59005 | false | false |

## Match decision (the fork, per invoice)

| Invoice | Route | Reason |
| --- | --- | --- |
| INV-59001 | auto-approve | clean match |
| INV-59002 | exception | price over tolerance |
| INV-58962 | exception | duplicate |
| INV-59004 | exception | vendor not in master |
| INV-59005 | exception | missing receipt |

## Exception routing (who works each hold)

| Invoice | Issue | Owner | Action |
| --- | --- | --- | --- |
| INV-59002 | price over tolerance | Procurement Lead | verify PO price |
| INV-58962 | duplicate | AP Clerk | reject - already paid |
| INV-59004 | vendor not in master | Vendor Relations Desk | onboard vendor |
| INV-59005 | missing receipt | Receiving Desk | hold for receipt |

## Downstream run values

| Field | Value |
| --- | --- |
| Auto-approved (paid) | INV-59001 only |
| Payment batch date | day-1 |
| Invoice count (paid) | 1 |
| Payment batch total | 1200.00 |
| Held count | 4 |
| Payment cutoff | 3:00 PM |
| Run approved by | AP Manager |
| Run approved at | 2:30 PM |
| Pay to | Northwind Fasteners (V-1042), ACH ...4021 |
| Remittance to | Northwind Fasteners for INV-59001, 1200.00 |
| Delivered by | day-1 3:00 PM to the Payables DL |
| Archived | day-1 run; INV-59001 seeds tomorrow's payment history; the four
  held invoices carry forward to be re-worked |

---

## Artifact names (Medium tier - reuse the Easy names)

Same 17 artifacts as Easy (source-profile-invoice-inbox.json, invoice-record.json,
vendor-master-record.json, source-profile-po-register.json,
source-profile-receipt-log.json, tolerance-policy.json,
source-profile-payment-history.json, duplicate-check.json, three-way-match.json,
match-decision.json, exception-resolution.json, auto-approval-log.json,
payment-batch.json, run-approval.json, payment-run.md, remittance-advice.md,
payment-archive.json). Medium records simply carry the batch instead of one
invoice.

## Validator spread (Medium, 17 lessons)

- choiceCheck x10: invoice-inbox, vendor-master, po-register, receipt-log,
  tolerance-policy, payment-history, exception-queue, auto-approve-path,
  run-approval, payment-archive.
- jsonRows x3 (multi-invoice batch): invoice-record, duplicate-check,
  match-decision.
- jsonDeltas x1 (variance rows): three-way-match.
- jsonEditor / jsonFields x1: payment-batch.
- templateSlots x2: payment-run.md, remittance-advice.md.

Medium is where the row validators (jsonRows / jsonDeltas) finally earn their
keep - the batch makes multi-row extraction, deduping, matching, and routing
natural, exactly as deferred from the Easy tier.

## Canon rules honored

- Every per-invoice variance and percent recomputes from the invoice and PO
  totals; canon.json derivations enforce it for the three matched invoices.
- The four failure modes are each isolated to one invoice so the learner can
  see them cleanly: over-tolerance (INV-59002), duplicate (INV-58962), unknown
  vendor (INV-59004), missing receipt (INV-59005).
- Duplicate and unknown-vendor are hard stops that bypass the tolerance math;
  the tier teaches that not every exception is a number.
- The paid total (1200.00), held count (4), and paid invoice (INV-59001) are
  pinned across the batch/run/archive lessons by canon assertions.
