# Module 2 (Beacon Invoice Desk) - Tool Map

How each step of the Beacon accounts-payable workflow maps to the tools people
actually automate with at work. The lab teaches the *shape* of each step; this
map shows how you would rebuild that same shape in Power Automate, Zapier, or
Python once you leave the lab.

Read it two ways:

- Top to bottom it is the whole pipeline: capture each invoice, load the
  reference data, match it three ways, decide, and pay by the cutoff.
- Row by row it is a transfer cheat-sheet: the "By hand" column is the manual
  version of the step, and the three tool columns are the automated equivalents.

The tool names are illustrative connectors/actions, not the only option. The
skill is recognizing which *kind* of action each step needs (a trigger, a
lookup, a comparison, a condition, an approval, a send) - the specific product
is interchangeable.

## Phase 1: Capture

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Profile the Invoice Inbox | Triage the inbox: which emails are real invoices, which are duplicates, which are spam. | Outlook trigger + Condition rules (or AI Builder) to classify each incoming invoice. | Email Parser + "Filter" to keep only genuine invoices. | Read the mailbox and classify by sender/subject rules into keep or skip. |
| Create the Invoice Record | Read the PDF and type header/line fields (vendor, number, amount, date) into columns. | AI Builder "Extract information from invoices" into a Dataverse "Create row". | An OCR/parser step feeding "Create Record". | An OCR/LLM extract (pdfplumber + parsing) into a dict. |

## Phase 2: Reference data

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Govern the Vendor Master | Match the invoice's vendor to your official list; add/correct the master if new or stale. | "Get items" to find the vendor, then "Update/Create item" to maintain the master. | "Find or Create Record" in your vendor table. | Upsert into the vendor table keyed by tax id or vendor id. |
| Inspect the PO Register | Pull the matching purchase order so you can check the invoice against what was ordered. | "Get items" filtered by PO number from the PO list. | "Find Record" by PO number. | Look up the PO by number in the register table. |
| Inspect the Receipt Log | Check the goods-receipt log to confirm what was actually delivered. | "Get items" from the receipts list filtered by PO and line. | "Find Record" in the receipts table. | Query the receipts store by PO line. |
| Author the Tolerance Policy | Write the match tolerances (price within 2%, quantity exact) in a config tab. | Environment Variables or a config list holding the tolerance limits. | "Storage by Zapier" or a lookup table for the tolerances. | A tolerance config dict/JSON loaded at runtime. |
| Inspect the Payment History | Search prior payments for this vendor/invoice to be sure it is not already paid. | "Get items" filtered by vendor + invoice number from the payments list. | "Find Record" by vendor and invoice number. | SELECT from payments WHERE vendor and invoice_no. |

## Phase 3: Match and decide

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Run the Duplicate Check | Compare key fields against recent invoices; stop it if vendor+number+amount already appear. | "Get items" + "Condition" on matching vendor/number/amount to flag duplicates. | "Find Record"; a "Filter" halts the Zap on a match. | Check membership on a (vendor, number, amount) key set. |
| Run the Three-Way Match | Line up invoice, PO, and receipt; confirm the three agree on item, quantity, price. | Join the three records and use a "Condition" per field within tolerance. | A multi-step "Lookup" + "Filter" comparing the three sources. | Compare invoice vs PO vs receipt field by field against tolerances. |
| Make the Match Decision | Stamp the result - matched or exception - so clean invoices pay and mismatches go to review. | "Switch"/"Condition" setting a match-status field. | "Paths" by match result. | return 'matched' or 'exception' with the failing reason. |

## Phase 4: Exceptions and approval

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Read the Exception Queue | Drop mismatched invoices into a review queue with a note on what failed. | "Create item" in an exceptions list + assign/notify the reviewer. | "Create Record" in a review table, plus a Slack/email alert. | Append to an exceptions table and open a ticket or notify. |
| Log the Auto-Approval | Let fully-matched, within-tolerance invoices approve automatically. | The "yes" branch that sets Approved and skips the review step. | The default Path that marks the invoice approved. | if matched and within tolerance: status = 'approved'. |
| Assemble the Payment Batch | Gather all approved invoices due today into one batch/file for the bank. | "Get items" where status=Approved + "Create CSV table" for the batch. | "Find Records" (approved) into a "Create Spreadsheet" batch. | Filter approved rows and write the bank batch file (CSV/NACHA). |
| Approve the Payment Run | Get a manager to sign off on the whole batch total before money moves. | "Start and wait for an approval" on the batch summary. | An approval step (e.g. Slack approval) gating the run. | Require an approver flag before the payment call runs. |

## Phase 5: Payment and archive

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Assemble the Payment Run | Submit the approved batch to the bank/ERP and record each confirmation. | An HTTP/connector call to the bank/ERP API, then log the response. | A "Webhooks" POST to the payment API + "Create Row" for confirmations. | POST the batch to the bank API and store the returned payment ids. |
| Send the Remittance Advice | Email each vendor a notice listing which invoices this payment covers. | "Send an email" per vendor with a "Create HTML table" of paid invoices. | "Send Email" with merge fields per vendor. | Render a remittance template per vendor and smtplib.send. |
| Archive the Payment Run | File the paid invoice, match evidence, and confirmation in a dated folder for audit. | "Create file" in a dated library + "Update item" to mark it archived. | "Upload File" to Drive + update the record's status. | Write the bundle to storage/S3 with a timestamped key. |

## The transferable pattern

The Beacon desk is the same five moves as every other workflow, in an
accounts-payable costume:

1. **Trigger / capture** - an inbound invoice email or file starts the run.
2. **Load reference data** - vendor master, PO, receipts, policy, and history are the facts you match against.
3. **Match against policy** - the three-way match and duplicate check compare the invoice to those facts.
4. **Decide / route** - clean invoices auto-approve; anything off goes to the exception queue for a human.
5. **Pay / archive** - assemble the batch, get run approval, submit payment, remit, and file a dated record.

The capstone (Rebuild the Beacon Match Yourself) proves you can rebuild the
spine of this - extract, dedupe, reconcile, decide - in whichever dialect above
your team actually uses.
