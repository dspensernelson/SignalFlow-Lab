# Node Audit - Beacon Invoice Desk (Module 2)

> **Purpose.** A per-node curriculum audit of every node on the Beacon Invoice
> Desk map (`src/data/projects/module-02/`), checked against the Product
> Doctrine (the map is the curriculum; every node is a lesson; artifacts are
> the unit of progress; connections reveal context; governance is part of
> automation) and the workflow-node contract. Planning artifact only - no
> runtime code is changed by this file.
>
> **Scope.** 17 nodes across 5 phases, 21 edges. One decision node
> (`match-decision`, the fork) and one temporal loop (`payment-archive ->
> payment-history -> duplicate-check`).
>
> **Status legend.** `[INTENT]` = lesson type and learner action defined,
> interaction not yet built (all 17 start here); `[NOW]` = built and playable.

---

## Summary Matrix

| # | Node | Type | Thing/Action | Lesson type | Artifact | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Invoice Inbox | source | Thing | inspection | `source-profile-invoice-inbox.json` | `[INTENT]` |
| 2 | Invoice Record | artifact | Thing | build | `invoice-record.json` | `[INTENT]` |
| 3 | Vendor Master | reference | Thing | governance | `vendor-master-record.json` | `[INTENT]` |
| 4 | PO Register | reference | Thing | inspection | `source-profile-po-register.json` | `[INTENT]` |
| 5 | Receipt Log | source | Thing | inspection | `source-profile-receipt-log.json` | `[INTENT]` |
| 6 | Tolerance Policy | reference | Thing | governance | `tolerance-policy.json` | `[INTENT]` |
| 7 | Payment History | reference | Thing | inspection | `source-profile-payment-history.json` | `[INTENT]` |
| 8 | Duplicate Check | process | Action | transformation | `duplicate-check.json` | `[INTENT]` |
| 9 | Three-Way Match | process | Action | transformation | `three-way-match.json` | `[INTENT]` |
| 10 | Match Decision | decision | Action | decision | `match-decision.json` | `[INTENT]` |
| 11 | Exception Queue | handoff | Action | handoff | `exception-resolution.json` | `[INTENT]` |
| 12 | Auto-Approve Path | handoff | Action | handoff | `auto-approval-log.json` | `[INTENT]` |
| 13 | Payment Batch | artifact | Thing | build | `payment-batch.json` | `[INTENT]` |
| 14 | Run Approval | handoff | Action | handoff | `run-approval.json` | `[INTENT]` |
| 15 | Payment Run | output | Thing | assembly | `payment-run.md` | `[INTENT]` |
| 16 | Remittance Advice | output | Thing | handoff | `remittance-advice.md` | `[INTENT]` |
| 17 | Payment Archive | archive | Thing | handoff | `payment-archive.json` | `[INTENT]` |

> **Coverage.** 17 lessons by type: inspection 4 (Invoice Inbox, PO Register,
> Receipt Log, Payment History), build 2 (Invoice Record, Payment Batch),
> governance 2 (Vendor Master, Tolerance Policy), transformation 2 (Duplicate
> Check, Three-Way Match), decision 1 (Match Decision), handoff 5 (Exception
> Queue, Auto-Approve Path, Run Approval, Remittance Advice, Payment Archive),
> assembly 1 (Payment Run). Seven of the eight doctrine lesson types are used;
> only `interpretation` is unused (Beacon's inputs are documents and structured
> references, not human judgment signals - that concept was owned by Meridian's
> Trader Flag). Meets the Step 3 spread guardrail (>= 6 of 8).

---

## Phase 1 - Capture

*Goal: turn a messy pile of invoice documents into a trusted structured record. Status node: Invoice Record.*

### 1. Invoice Inbox - `invoice-inbox` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (raw document feed) |
| Lesson type | inspection |
| Concepts introduced | Documents as a feed; arrival contract; format variety (PDF/email/portal) |
| Learner practice | Inspect where invoices arrive, in what formats and cadence, and what access ingesting them needs |
| Lab version | Local document fixtures shared with the Invoice Record task |
| Dependencies | None (workflow origin, unlock root) |
| Downstream reuse | Invoice Record |
| Governance note | Shared-mailbox/portal ingestion needs access and a retention policy; originals kept for audit |
| Open question / risk | As an inspection intro it needs a concrete "what did you learn" beat - a choiceCheck that mints a source profile |

### 2. Invoice Record - `invoice-record` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | artifact |
| Thing / action | Thing (structured record) |
| Lesson type | build |
| Concepts introduced | Document extraction; field validation; structured capture |
| Learner practice | Extract vendor, invoice number, PO reference, line items, amounts, and dates into a validated record |
| Lab version | Built from an invoice document fixture in the inbox |
| Dependencies | Invoice Inbox |
| Downstream reuse | Duplicate Check, Three-Way Match |
| Governance note | The extracted record is what the workflow trusts, not the document; its field set is owned and versioned |
| Open question / risk | The join key (PO reference) must be captured cleanly or the whole match fails downstream |

---

## Phase 2 - Reference Data

*Goal: bring in the governed references the match depends on. Status node: Tolerance Policy.*

### 3. Vendor Master - `vendor-master` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (governed record) |
| Lesson type | governance |
| Concepts introduced | Master data; governed reference; change ownership |
| Learner practice | Read the vendor master as governed data and identify who may change it and why |
| Lab version | Local vendor master fixture keyed by vendor id |
| Dependencies | None |
| Downstream reuse | Three-Way Match, Remittance Advice |
| Governance note | Bank-detail/remit-to changes are fraud-sensitive; only Vendor Relations may change them, every change logged |
| Open question / risk | The module's signature governance concept; hard tier turns this into a bank-detail change/fraud drill |

### 4. PO Register - `po-register` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (system of record) |
| Lesson type | inspection |
| Concepts introduced | System of record; join keys; order authority |
| Learner practice | Inspect the PO register and identify the key that links an invoice to its purchase order |
| Lab version | Local PO table keyed by PO number |
| Dependencies | None |
| Downstream reuse | Three-Way Match |
| Governance note | Owned by the Procurement Lead; the invoice-to-PO key must be agreed and stable |
| Open question / risk | Distinguish from Receipt Log (both feed the match) - PO is authority to buy, receipt is proof of delivery |

### 5. Receipt Log - `receipt-log` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | source |
| Thing / action | Thing (goods-receipt postings) |
| Lesson type | inspection |
| Concepts introduced | Proof of receipt; third leg of the match; goods receipt |
| Learner practice | Inspect goods receipts and understand why the match needs proof of delivery |
| Lab version | Local receipt table keyed by PO number |
| Dependencies | None |
| Downstream reuse | Three-Way Match |
| Governance note | Owned by the Receiving Desk; a missing receipt is the two-way vs three-way distinction |
| Open question / risk | Medium tier drops a receipt to teach two-way vs three-way matching |

### 6. Tolerance Policy - `tolerance-policy` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (owned config) |
| Lesson type | governance |
| Concepts introduced | Config as rules; tolerances; policy versioning |
| Learner practice | Read the tolerance policy as owned, versioned config the matching engine applies |
| Lab version | Local tolerance-policy fixture (percent + absolute) |
| Dependencies | None |
| Downstream reuse | Three-Way Match |
| Governance note | Changes are Controller-approved and versioned; looser tolerance moves money faster but catches fewer errors |
| Open question / risk | Hard tier: design a tolerance policy from vendor history |

### 7. Payment History - `payment-history` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | reference |
| Thing / action | Thing (paid-invoice baseline) |
| Lesson type | inspection |
| Concepts introduced | Archive-seeded reference; duplicate baseline; the temporal loop |
| Learner practice | Inspect the paid-invoice baseline and see how yesterday's archive becomes today's duplicate reference |
| Lab version | Local payment-history fixture; seeded by the prior run's archive |
| Dependencies | Payment Archive (temporal, prior run) |
| Downstream reuse | Duplicate Check |
| Governance note | The identity key (vendor + invoice number + amount) must be stable |
| Open question / risk | Makes the temporal loop explicit; mirrors Meridian's Prior Day Reference |

---

## Phase 3 - Matching

*Goal: dedupe against history, match within tolerance, and route. Status node: Match Decision.*

### 8. Duplicate Check - `duplicate-check` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | process |
| Thing / action | Action |
| Lesson type | transformation |
| Concepts introduced | Duplicate detection; identity keys; dedupe against history |
| Learner practice | Apply a duplicate-detection rule against payment history and flag already-paid invoices |
| Lab version | Run against the invoice record and payment-history fixtures |
| Dependencies | Invoice Record, Payment History |
| Downstream reuse | Match Decision |
| Governance note | A duplicate ALWAYS wins over a clean match; a false negative pays twice |
| Open question / risk | Hard tier: design the duplicate-detection rule (exact vs fuzzy identity) |

### 9. Three-Way Match - `three-way-match` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | process |
| Thing / action | Action |
| Lesson type | transformation |
| Concepts introduced | Three-way matching; tolerance application; join and compare |
| Learner practice | Join invoice to PO and receipt and apply the tolerance policy to produce a match result |
| Lab version | Uses invoice record, PO register, receipt log, tolerance policy, vendor master fixtures |
| Dependencies | Invoice Record, Vendor Master, PO Register, Receipt Log, Tolerance Policy |
| Downstream reuse | Match Decision |
| Governance note | A variance exactly at tolerance passes (inclusive); the deciding rule is the governed policy |
| Open question / risk | Central transformation; the boundary case (variance == tolerance) is deliberate canon |

### 10. Match Decision - `match-decision` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | decision |
| Thing / action | Action |
| Lesson type | decision |
| Concepts introduced | Decision encoding; routing; exception vs auto path |
| Learner practice | Encode the rule that routes clean invoices to auto-approval and everything else to exceptions |
| Lab version | Encoded from the match result and duplicate flag |
| Dependencies | Duplicate Check, Three-Way Match |
| Downstream reuse | Auto-Approve Path, Exception Queue |
| Governance note | The rule is explicit and logged; a duplicate routes to exceptions even if amounts match |
| Open question / risk | The single fork; duplicate-wins is the key boundary that must be tested |

---

## Phase 4 - Exceptions and Approval

*Goal: clear exceptions, log auto-approvals, assemble and sign the batch. Status node: Run Approval.*

### 11. Exception Queue - `exception-queue` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | handoff |
| Thing / action | Action |
| Lesson type | handoff |
| Concepts introduced | Exception queues; investigation; captured resolution |
| Learner practice | Work an exception: investigate the reason, capture the resolution, log who decided |
| Lab version | The exception rides from the match-decision result |
| Dependencies | Match Decision |
| Downstream reuse | Payment Batch |
| Governance note | Every resolution captures who approved it and why; a cleared exception is auditable |
| Open question / risk | Medium tier routes a vendor-not-in-master case here |

### 12. Auto-Approve Path - `auto-approve-path` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | handoff |
| Thing / action | Action |
| Lesson type | handoff |
| Concepts introduced | The quiet path still logs; auto-approval; auditability |
| Learner practice | Record an automatic approval so the quiet path is traceable |
| Lab version | Recorded from a cleanly matched invoice |
| Dependencies | Match Decision |
| Downstream reuse | Payment Batch |
| Governance note | Auto does not mean unlogged; the auto lane is as auditable as the manual one |
| Open question / risk | Deliberately mirrors Meridian's Routine Update Path (quiet path still produces a record) |

### 13. Payment Batch - `payment-batch` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | artifact |
| Thing / action | Thing (staged batch) |
| Lesson type | build |
| Concepts introduced | Batching; payment cutoffs; assembly prep |
| Learner practice | Assemble approved invoices into a batch, applying the cutoff |
| Lab version | Built from the approved and cleared invoices |
| Dependencies | Auto-Approve Path, Exception Queue |
| Downstream reuse | Run Approval, Payment Run |
| Governance note | The cutoff decides what pays today; unapproved-but-due items must not slip in |
| Open question / risk | Assembly-prep; Payment Run is the true assembly node |

### 14. Run Approval - `run-approval` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | handoff |
| Thing / action | Action |
| Lesson type | handoff |
| Concepts introduced | Approval handoff; captured sign-off; segregation of duties |
| Learner practice | Capture the AP Manager's sign-off, including any invoices held and why |
| Lab version | Captured from the assembled batch |
| Dependencies | Payment Batch |
| Downstream reuse | Payment Run |
| Governance note | Segregation of duties: the clerk who built the batch cannot approve the run |
| Open question / risk | Gates the payment-run assembly |

---

## Phase 5 - Payment and Archive

*Goal: assemble the traceable run, notify vendors, archive to seed tomorrow. Status node: Payment Run.*

### 15. Payment Run - `payment-run` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | output |
| Thing / action | Thing (the deliverable) |
| Lesson type | assembly |
| Concepts introduced | Assembly; traceability; business deliverable |
| Learner practice | Assemble the approved batch and its evidence into the traceable 3:00 PM run |
| Lab version | Assembled from the approved batch and supporting artifacts |
| Dependencies | Payment Batch, Run Approval |
| Downstream reuse | Remittance Advice, Payment Archive |
| Governance note | Every paid line traces to its invoice record, match, and approval |
| Open question / risk | The 7-plus-in assembly node; the module deliverable (`payment-run.md`) |

### 16. Remittance Advice - `remittance-advice` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | output |
| Thing / action | Thing (vendor notice) |
| Lesson type | handoff |
| Concepts introduced | Vendor communication; remittance advice; handoff to counterparties |
| Learner practice | Produce the vendor-facing remittance from the run and the vendor master contact |
| Lab version | Produced from the payment run and vendor master fixtures |
| Dependencies | Payment Run, Vendor Master |
| Downstream reuse | None (terminal handoff) |
| Governance note | Remittance goes only to the governed remit-to; an unverified address is a fraud exposure |
| Open question / risk | Reuses vendor-master, reinforcing master-data governance |

### 17. Payment Archive - `payment-archive` `[INTENT]`

| Field | Detail |
| --- | --- |
| Node type | archive |
| Thing / action | Thing (retained store) |
| Lesson type | handoff |
| Concepts introduced | Retention; archive-seeded loop; auditability |
| Learner practice | Archive the completed run and seed the payment history tomorrow's duplicate check reads |
| Lab version | Archived from the completed payment run |
| Dependencies | Payment Run |
| Downstream reuse | Payment History (temporal, next run) |
| Governance note | Retention length is a compliance decision; the archive enables tomorrow's duplicate check |
| Open question / risk | The archive origin of the temporal loop |

---

## Cross-Cutting Findings

1. **Artifact build order** (artifact/output-producing nodes that gate progress):
   1. Invoice Record -> `invoice-record.json`
   2. Duplicate Check -> `duplicate-check.json`
   3. Three-Way Match -> `three-way-match.json`
   4. Match Decision -> `match-decision.json`
   5. Payment Batch -> `payment-batch.json`
   6. Payment Run -> `payment-run.md`

   Governance references feed in alongside: Vendor Master, Tolerance Policy,
   and Payment History before the match. Fan-in is respected: low-dependency
   references early, the 5-in Three-Way Match and 7-in Payment Run late.

2. **Full learner path** (all 17 in pedagogical / unlock order, from
   `lessonMeta.LESSON_PATH`): Invoice Inbox (inspection) -> Vendor Master
   (governance) -> PO Register (inspection) -> Invoice Record (build) ->
   Receipt Log (inspection) -> Tolerance Policy (governance) -> Payment History
   (inspection) -> Duplicate Check (transformation) -> Three-Way Match
   (transformation) -> Match Decision (decision) -> Auto-Approve Path (handoff)
   -> Exception Queue (handoff) -> Payment Batch (build) -> Run Approval
   (handoff) -> Payment Run (assembly) -> Remittance Advice (handoff) ->
   Payment Archive (handoff).

3. **Concept-overlap pairs to disambiguate in lesson copy.** PO Register
   (authority to buy) vs Receipt Log (proof of delivery) - both feed the match
   but answer different questions. Duplicate Check (identity against history)
   vs Three-Way Match (agreement across PO/receipt) - both gate the decision
   but on different evidence. Auto-Approve Path vs Run Approval - both are
   handoffs, but one logs a machine decision and one captures a human sign-off.

4. **Tier variant plan.**
   - **Easy (all 17):** operate the clean pattern - one clean-ish invoice,
     references that match, one tolerance check that passes.
   - **Medium (all 17):** each node re-authored on its OWN messier canon. The
     charter's mess lands hardest on Invoice Record (a second invoice that is a
     duplicate), Three-Way Match / Tolerance Policy (a price outside
     tolerance), Vendor Master / Exception Queue / Match Decision (a vendor not
     in the master), and Receipt Log / Three-Way Match (a missing receipt =
     two-way vs three-way).
   - **Hard (CURATED drills, ~7 - not every node deepens; inspection nodes
     stay easy/medium):** Tolerance Policy (design the policy from vendor
     history), Vendor Master (bank-detail change management / fraud-check
     drill), Duplicate Check (design the duplicate-detection rule), Three-Way
     Match (degraded match when the PO register is down), Match Decision
     (routing under an escalation ladder), Payment Batch (partial/degraded
     batch under a cutoff miss), Payment Run (assemble a degraded run and flag
     what was held). The final hard curation is confirmed and logged in
     DECISION_LOG.md when the hard tier is built.

5. **No new engine capability required.** choiceCheck (inspection/governance
   quizzes), jsonEditor validators (build/transformation/decision records), and
   templateSlots (assembly documents) cover the whole spine - matching the
   charter's engine-needs note. `artifactImport` (Module 1's capstone
   interaction) is available if a Beacon capstone wants it, but is not required
   for the base tiers.
