# Module 7 Charter - Depot Order Flow (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Depot Supply ships warehouse orders. Unlike every module before it, nothing
here runs on a morning clock: orders ARRIVE, shipments FAIL, stock CROSSES
thresholds - the workflow is driven by EVENTS, and each order is a little
state machine walking from placed to delivered. The learner builds
event-driven automation: triggers instead of schedules, states instead of
steps, and compensation when reality breaks mid-flight.

## The deliverable

Per-order: a complete, honest order record of every state it passed
through. Daily: `fulfillment-digest.md` - orders shipped, exceptions
compensated, stock positions, replenishments triggered.

## Named roles (FIXED - never invent more)

Warehouse Lead (owns pick/pack), Inventory Planner (owns reorder policy),
Carrier Desk (owns the carrier handoff), Customer Service Rep (owns
customer-facing compensation), Ops DL (receives the digest). Customers and
carriers act only through EVENTS, never as workflow actors.

## Signature concept cluster (new here)

Events vs schedules (triggers), state machines (legal transitions only),
webhook-style event records, compensating actions (undo a reservation, not
pretend it never happened), reorder points as governed thresholds on a
continuously changing number.

## Recurring concepts (deepened)

Thresholds (reorder = M1 thresholds on a stream), quarantine (damaged goods
echo M1 hard), decision logging, handoffs, assembly, archive loops.

## Draft map spine

Phases: Order Events -> Inventory -> Fulfillment States -> Exceptions and
Compensation -> Confirmation and Replenishment.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| order-events | source | inspection | An event stream is not a file: ordering, dupes, gaps |
| order-record | artifact | build | Materializing an order from its events |
| inventory-ledger | reference | inspection | Stock as a running balance, not a snapshot |
| availability-check | process | transformation | Committed vs on-hand vs incoming |
| reserve-decision | decision | decision | Reserve now vs backorder |
| backorder-path | handoff | handoff | The customer-facing wait, logged with promise date |
| state-machine-policy | reference | governance | Legal order states and transitions |
| pick-pack-ship | process | transformation | Walking states; illegal transitions rejected |
| carrier-handoff | handoff | handoff | Boundary crossing; tracking id captured |
| shipment-events | source | inspection | Mid-flight events: delays, damage, delivery |
| compensation-policy | reference | governance | What each failure mode un-does, in what order |
| exception-compensation | process | transformation | Executing compensation; the reservation released |
| delivery-confirmation | artifact | build | The closing event captured as record |
| reorder-point-policy | reference | governance | Trigger thresholds on the stock balance |
| replenishment-trigger | process | transformation | Threshold crossed -> purchase signal |
| fulfillment-digest | output | assembly | The daily digest |
| order-archive | archive | handoff | Retention; feeds reorder analytics (loop) |

(17 nodes.)

## The fork

reserve-decision: stock available -> reserve and proceed; insufficient ->
backorder-path. Boundary teaching: available means on-hand MINUS already-
committed - the naive check double-sells the last unit.

## The temporal loop

order-archive -> reorder-point-policy (via demand history): what actually
sold tunes where the reorder triggers sit.

## Unlock root and early branches

Root: order-events (the module's thesis: learn to read a stream). Fans to
order-record + inventory-ledger; fulfillment branch and inventory branch
converge at the digest.

## Tier postures

- Easy: one order, clean walk through the states, one reorder trigger.
- Medium: a duplicate event (idempotent handling), an out-of-order event
  (shipped before picked - reject and hold), a mid-flight damage event
  (compensation path).
- Hard (curated drills): design the reorder points from demand history;
  design the compensation policy (ordering of undo steps is the drill);
  the stuck order (no event for 48h - timeout design, echoes M1 ladder);
  digest when the event stream has a gap (degraded, with the gap named).

## Engine needs (self-serve under AUTONOMY_CHARTER)

Candidate for ONE new interaction type: an event-sequence workspace (given
events, produce the resulting state or reject illegal ones). Attempt with
jsonDeltas first (event/expectedState rows); spec a new type only if that
reads poorly.

## Canon guidance

Order ids ORD-####; SKUs SKU-###; a fixed state list (placed, reserved,
picked, packed, shipped, delivered, compensated); stock as integers. Cross-
lesson numbers into curriculum/module-07/canon.json.
