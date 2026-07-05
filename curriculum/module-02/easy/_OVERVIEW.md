# Module 2 - Beacon Invoice Desk - EASY tier canon and overview

Status: IN PROGRESS (Step 4 canon authored 2026-07-02; lessons build next).
Tier posture (Easy): operate the clean pattern. One clean invoice flows the
whole desk end to end - references match, one tolerance check passes, no
duplicate, no exception. The mess (duplicates, out-of-tolerance prices,
missing receipts, vendors not in the master) is the MEDIUM tier's job.

This file is the prose canon: every value, role, time, threshold, and artifact
name for the Easy tier. curriculum/module-02/canon.json holds the
machine-checkable assertions for numbers that appear in more than one lesson.
ASCII only. Currency is USD with cents (2dp). Invoice numbers INV-#####; PO
numbers PO-####; vendor ids V-####; dates are relative ("day-1" = today,
"day-0" = the prior run).

---

## The clock (the AP day spine)

Beacon Manufacturing's accounts-payable desk must produce an approved payment
run by 3:00 PM. The Easy day:

- 8:00 AM - invoices arrive in the Invoice Inbox (3 documents; we follow one).
- 9:00 AM - the AP Clerk extracts the Invoice Record.
- 10:00 AM - reference data is loaded (vendor master, PO register, receipts,
  tolerance policy, payment history).
- 11:00 AM - duplicate check and three-way match run.
- 1:00 PM - exceptions are worked (none today - the day is clean).
- 2:00 PM - the Payment Batch is assembled against the 3:00 PM cutoff.
- 2:30 PM - the AP Manager approves the run.
- 3:00 PM - the Payment Run is delivered to the Payables DL; remittance goes
  to the vendor; the run is archived and seeds tomorrow's duplicate baseline.

## Roles (FIXED - from the charter, never invent more)

AP Clerk (processes invoices), AP Manager (approves the run and exceptions),
Procurement Lead (owns the PO register), Receiving Desk (posts goods
receipts), Vendor Relations Desk (owns the vendor master), Controller
(approves policy changes), Payables DL (receives the run).

---

## The clean invoice we follow (INV-58831)

| Field | Value |
| --- | --- |
| Invoice number | INV-58831 |
| Vendor | V-1042, Northwind Fasteners |
| PO reference | PO-7742 |
| Invoice date | day-1 |
| Line item | M8 hex bolt, zinc |
| Quantity | 500 |
| Unit price (invoice) | 2.44 |
| Invoice total | 1220.00 |

## Vendor Master - V-1042

| Field | Value |
| --- | --- |
| Vendor id | V-1042 |
| Legal name | Northwind Fasteners |
| Remit-to | 4400 Commerce Way, Tacoma WA 98402 |
| Bank on file | ACH ...4021 (verified day-0) |
| Tax id | 91-1770045 |
| Status | active |
| Owned by | Vendor Relations Desk |

## PO Register - PO-7742

| Field | Value |
| --- | --- |
| PO number | PO-7742 |
| Vendor | V-1042, Northwind Fasteners |
| Quantity ordered | 500 |
| Unit price (PO) | 2.40 |
| PO total | 1200.00 |
| Owned by | Procurement Lead |
| Join key | PO number links invoice -> PO -> receipt |

## Receipt Log - for PO-7742

| Field | Value |
| --- | --- |
| PO number | PO-7742 |
| Quantity received | 500 |
| Receipt date | day-1 |
| Status | accepted |
| Posted by | Receiving Desk |

## Tolerance Policy - v1.0.0

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Price tolerance (percent) | 2.0 |
| Price tolerance (absolute) | 25.00 |
| Rule | a line matches if the price variance is within the LARGER of 2% of the PO amount or $25.00 |
| Quantity tolerance | 0 (received qty must equal ordered qty) |
| Approved by | Controller |
| Effective | day-0 |

For INV-58831 the tolerance band is max(2% of 1200.00, 25.00) =
max(24.00, 25.00) = 25.00. The variance is 20.00, which is within 25.00 AND
within 2% - a clean pass.

## Payment History (the day-0 baseline the duplicate check reads)

Contains prior-run paid invoices, e.g. INV-58790 (V-1042, 980.00, day-0).
INV-58831 is NOT present -> not a duplicate. Identity key = vendor id +
invoice number + invoice total.

---

## Derived / matched values (recomputed, canon.json enforces)

| Value | How it derives | Result |
| --- | --- | --- |
| Price variance (INV-58831) | invoice total - PO total = 1220.00 - 1200.00 | 20.00 |
| Variance percent | (1220.00 - 1200.00) / 1200.00 * 100 | 1.67 |
| Quantity match | received 500 == ordered 500 | true |
| Within tolerance | 20.00 <= 25.00 and 1.67 <= 2.0 | true |
| Duplicate | INV-58831 in payment history | false |
| Match result | within tolerance and 3 legs agree | matched |
| Route | within tolerance AND not duplicate | auto-approve |

## Downstream run values

| Field | Value |
| --- | --- |
| Auto-approval logged at | day-1 11:00 AM (system) |
| Payment batch total | 1220.00 (single clean invoice) |
| Payment cutoff | day-1 3:00 PM |
| Run approved by | AP Manager |
| Run approved at | day-1 2:30 PM |
| Held invoices | none |
| Payment run total | 1220.00 |
| Pay to | Northwind Fasteners (V-1042), ACH ...4021 |
| Remittance to | 4400 Commerce Way, Tacoma WA 98402 |
| Delivered by | day-1 3:00 PM to the Payables DL |
| Archived | day-1 run; seeds payment history with INV-58831 |

---

## Artifact names (Easy tier)

| Node | Artifact |
| --- | --- |
| Invoice Inbox | source-profile-invoice-inbox.json |
| Invoice Record | invoice-record.json |
| Vendor Master | vendor-master-record.json |
| PO Register | source-profile-po-register.json |
| Receipt Log | source-profile-receipt-log.json |
| Tolerance Policy | tolerance-policy.json |
| Payment History | source-profile-payment-history.json |
| Duplicate Check | duplicate-check.json |
| Three-Way Match | three-way-match.json |
| Match Decision | match-decision.json |
| Exception Queue | exception-resolution.json |
| Auto-Approve Path | auto-approval-log.json |
| Payment Batch | payment-batch.json |
| Run Approval | run-approval.json |
| Payment Run | payment-run.md |
| Remittance Advice | remittance-advice.md |
| Payment Archive | payment-archive.json |

## Canon rules honored

- The invoice unit price (2.44) and the PO unit price (2.40) DISAGREE on
  purpose - that disagreement is the tolerance lesson, and the resolution rule
  (pay the invoice when within tolerance) is stated.
- Every derived number (variance 20.00, variance percent 1.67) recomputes from
  its sources; canon.json enforces the recomputation.
- The identity key for duplicates is stated (vendor + invoice number + total).
- Easy has no boundary or negative cases; the exactly-at-tolerance case and the
  duplicate/out-of-tolerance cases are deliberate MEDIUM canon.
