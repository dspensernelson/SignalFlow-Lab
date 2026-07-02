# Module 4 Charter - Relay Ticket Triage (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Relay Software's support desk receives a continuous stream of customer
tickets. Every ticket must be classified, prioritized, and routed to the
right queue within 15 minutes - misroute a P1 and a customer outage sits in
the wrong inbox. The learner builds the triage automation: taxonomies,
priority matrices, routing tables, and the feedback loop that keeps them
honest.

## The deliverable

Continuous routing plus `queue-digest.md` - the 5:00 PM queue-health digest:
volumes, misroutes, SLA breaches, and taxonomy drift, assembled from the
day's triage records.

## Named roles (FIXED - never invent more)

Support Agent (works tickets), Queue Lead (owns the routing table), Tier-2
Engineer (escalation target), Duty Manager (P1 sign-off), Support Ops
Analyst (owns taxonomy and priority matrix), Support DL (receives the
digest).

## Signature concept cluster (new here)

Classification against a governed taxonomy, priority matrices (impact x
urgency), routing tables as config, misroute feedback loops, SLA timers on
queues.

## Recurring concepts (deepened)

Interpretation (human text -> structured signal, at volume), escalation
ladders, decision logging, config-as-rules, assembly, archive loops.

## Draft map spine

Phases: Intake -> Classification -> Priority -> Routing -> Resolution and
Learning.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| ticket-inbox | source | inspection | Ticket stream; channels and arrival shape |
| intent-taxonomy | reference | governance | The category tree; who may change it |
| ticket-record | artifact | build | Structured ticket from customer prose |
| classification | process | interpretation | Assigning category against the taxonomy |
| priority-matrix | reference | governance | Impact x urgency grid as owned config |
| priority-assignment | process | transformation | Applying the matrix; P1 boundary cases |
| routing-table | reference | governance | Category+priority -> queue mapping |
| route-decision | decision | decision | Standard queue vs escalate to Tier-2/Duty |
| escalation-handoff | handoff | handoff | P1 path: page, acknowledge, capture |
| queue-assignment | handoff | handoff | Standard path still logs assignment |
| sla-tracker | process | transformation | Timers per queue; breach flags |
| resolution-record | artifact | build | Outcome captured: fix, category-as-worked |
| misroute-check | process | transformation | Worked category vs assigned category |
| queue-digest | output | assembly | The 5:00 PM health digest |
| triage-archive | archive | handoff | Retention; feeds taxonomy tuning |
| taxonomy-feedback | process | transformation | Misroutes propose taxonomy changes (loop) |

(16 nodes.)

## The fork

route-decision: P1 or safety-flagged -> escalation-handoff; else ->
queue-assignment. Boundary teaching: priority is matrix-derived, not
vibes - an angry customer with low impact is NOT a P1, and the matrix says
so in writing.

## The temporal loop

triage-archive -> intent-taxonomy (via taxonomy-feedback): yesterday's
misroutes are today's taxonomy-change proposals - the module's core idea,
classification systems are MAINTAINED, not installed.

## Unlock root and early branches

Root: ticket-inbox. Fans to intent-taxonomy + ticket-record; classification
and priority branches converge at route-decision.

## Tier postures

- Easy: three clean tickets, unambiguous categories, one P1.
- Medium: a ticket spanning two categories (taxonomy judgment), a P1-looking
  ticket the matrix scores P3, a misroute discovered at resolution.
- Hard (curated drills): design the priority matrix from incident history;
  taxonomy change management (split an overloaded category - versioned, with
  a migration note); routing when a queue is over SLA (load-shedding rules);
  digest in degraded mode when the tracker feed breaks.

## Engine needs (self-serve under AUTONOMY_CHARTER)

None expected beyond existing types: classification and matrix lessons fit
choiceCheck and jsonDeltas; the digest fits templateSlots.

## Canon guidance

Ticket ids TKT-####; priorities P1-P4; a fixed 4x4 impact/urgency matrix;
queue names from the routing table only. Cross-lesson numbers into
curriculum/module-04/canon.json.
