# Module 4 - Relay Ticket Triage - Easy Tier Overview (canon spine)

Prose canon for the Easy tier. Machine-checkable cross-lesson numbers live in
curriculum/module-04/canon.json. ASCII only. Ticket ids TKT-####; priorities
P1-P4; queue names come only from the routing table.

## Story spine (the clock)

A support-desk afternoon. Tickets arrive continuously; the queue-health digest
ships at 5:00 PM. Easy = three clean tickets, unambiguous categories, one P1.

- 2:05 PM: TKT-4001 lands; inspect + build the record.
- 2:08-2:13 PM: classify (outage), score (P1), route (escalate).
- 2:14 PM: escalate the P1; 2:20 PM: assign a standard ticket.
- 2:40 PM: resolve; 4:30-4:45 PM: track SLA, check misroutes.
- 5:00 PM: assemble the digest; 5:05-5:10 PM: archive + taxonomy feedback.

## The three tickets

- TKT-4001: outage, P1 -> escalation. "Checkout is down for all users."
  (customer guessed "billing" - a distractor). Product: Checkout.
- TKT-4002: bug, P3 -> bug-queue. "Export button throws an error on one report."
- TKT-4003: how-to, P4 -> support-queue.

## Fixed roles (never invent more)

Support Agent, Queue Lead, Tier-2 Engineer, Duty Manager, Support Ops Analyst,
Support DL.

## Intent taxonomy (Support Ops Analyst owns)

outage (service down for many users), bug (a feature broken for some users),
how-to (a usage question, nothing broken), billing (invoices, payments, plan
changes).

## Priority matrix (Support Ops Analyst, v1.0.0, 4x4)

high impact + high urgency = P1; high + low = P2; low + high = P3; low + low =
P4. Priority is derived from impact x urgency, never from tone. TKT-4001 =
high + high = P1.

## Routing table (Queue Lead owns)

| category | queue |
| --- | --- |
| outage | incident-bridge |
| bug | bug-queue |
| how-to | support-queue |
| billing | billing-queue |

P1 escalates regardless of queue - that override is the route decision's job.

## Route + handoffs

- route-decision: P1 or safety -> escalate (route escalation-handoff); else the
  table queue. TKT-4001 (P1) escalates.
- escalation-handoff: paged to Tier-2 Engineer, acknowledged yes, Duty Manager
  sign-off yes.
- queue-assignment (TKT-4002): bug-queue, assigned by Queue Lead, logged yes.

## Resolution + learning

- sla-tracker (targets): P1 15 min, P3 8 hours, P4 2 days; breachFlag no for all
  (clean day).
- resolution-record: TKT-4001 fix "restarted the checkout service", worked
  category outage, resolved by Tier-2 Engineer.
- misroute-check: assigned outage vs worked outage -> misrouted false.
- queue-digest: totalTickets 3, p1Count 1, breachCount 0, misrouteCount 0, top
  category outage.
- triage-archive: triage-day-1, ticketCount 3, retention 1 year, seedsTaxonomy
  true.
- taxonomy-feedback: misrouteCount 0 -> category none, proposedChange none,
  routed to Support Ops Analyst (a clean day confirms the taxonomy).

## Interaction mix (choiceCheck cap <= 25%; here 2/16 = 12.5%)

tagSource: ticket-inbox. choiceCheck: classification, priority-matrix.
jsonEditor (jsonFields/jsonRows/jsonDeltas): ticket-record, intent-taxonomy,
priority-assignment, routing-table, route-decision, sla-tracker,
resolution-record, misroute-check, triage-archive, taxonomy-feedback.
handoffForm: escalation-handoff, queue-assignment. templateSlots: queue-digest.

## Canon rules honored

- Classify the symptom, not the customer's guessed cause.
- Priority is matrix-derived (impact x urgency); an angry low-impact ticket is
  still P4 - a deliberate MEDIUM boundary case.
- Queue names come only from the routing table.
- Easy has one clean P1 and no misroutes; the two-category ticket, the
  P1-looking-but-P3 ticket, and the discovered misroute are MEDIUM canon.
