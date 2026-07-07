# Module 3 - Harbor Onboarding - Easy Tier Overview (canon spine)

Prose canon for the Easy tier. Every value here is the single source of truth;
machine-checkable cross-lesson numbers live in curriculum/module-03/canon.json.
ASCII only. Dates are relative to the start date (SD); SLAs are in business days.

## Story spine (the clock)

The week before a Monday start. Harbor Logistics is onboarding one new hire.
Four provisioning branches run in parallel against SLAs measured backward from
the start date. By SD-1, 5:00 PM the Day-One Package is assembled and handed to
the hiring manager. Easy = one hire, one role, all four tasks succeed, gate
passes.

- SD-5: offer profiled, role read, onboarding record built, SLA policy set.
- SD-4: provisioning plan expanded (four owned, dated tasks).
- SD-3: payroll enrolled (earliest deadline).
- SD-2: accounts created (idempotent).
- SD-1: hardware delivered, access granted, tracker updated, gate passes,
  package assembled (5:00 PM), manager acknowledges (5:30 PM).
- SD: onboarding archived, profile feedback closes the loop.

## The hire (kept generic - one named hire plus role title)

- Name: Jordan Lee. Hire id: H-4021. Offer id: OFF-4021.
- Role: Logistics Coordinator. Department: Operations. Start date: SD.
- Reports to: the Hiring Manager.

## Fixed roles (never invent more)

Recruiter, People Ops Lead, IT Provisioner, Facilities Coordinator, Payroll
Specialist, Hiring Manager, New Hire.

## Role profile (Logistics Coordinator)

- Accounts: identity, email, directory. Software: Logistics Suite,
  Email/Calendar. Hardware: Standard laptop.
- Access groups: ops-general, warehouse-readonly. Pay class: Non-exempt /
  Hourly. Owned by the People Ops Lead.

## SLA policy (business days before start)

- payroll SD-3 (earliest; hits the first pay cycle), accounts SD-2,
  hardware SD-1, access SD-1. Owner People Ops Lead, version 1.0.0.

## Provisioning plan (four owned, dated tasks)

| taskId | owner | due |
| --- | --- | --- |
| accounts | IT Provisioner | SD-2 |
| hardware | IT Provisioner | SD-1 |
| access | Facilities Coordinator | SD-1 |
| payroll | Payroll Specialist | SD-3 |

## Task outcomes (Easy = all done)

- accounts: existingFound false -> created acct-4021, done (idempotent).
- hardware: ordered by IT Provisioner, deliver by SD-1, confirmed, done.
- access: granted ops-general + warehouse-readonly by Facilities Coordinator.
- payroll: sent to Payroll Specialist, Non-exempt / Hourly, confirmed, done.
- tracker: four rows, all state done, blockedReason empty.

## Gate and exits

- readiness-gate: allTasksDone true, anyBlocked false, ready true, route
  day-one-package (fan-in on ALL - one blocked task would route to escalation).
- escalation-path (drill on next week's hire): blocked background check, owner
  People Ops Lead, resolve by SD-2.

## Deliverable and loop

- day-one-package.md: hire Jordan Lee, Logistics Coordinator, start SD,
  readiness Day-One Ready, four states done. Assembled by lookup only.
- manager-handoff: acknowledged by Hiring Manager, ready confirmed, at
  SD-1 5:00 PM.
- onboarding-archive: onboarding-H-4021, retention 7 years, seedsCatalog true.
- profile-feedback: role needed a handheld scanner (inProfile false), propose
  add, routed to People Ops Lead - closes the loop into the role profile catalog.

## Interaction mix (choiceCheck cap <= 25%; here 1/16 = 6.25%)

tagSource: signed-offer. choiceCheck: role-profile-catalog. jsonEditor
(jsonFields/jsonPolicy/jsonRows/jsonDeltas): onboarding-record, sla-policy,
provisioning-plan, accounts-task, access-task, task-tracker, readiness-gate,
onboarding-archive, profile-feedback. handoffForm: hardware-task, payroll-task,
escalation-path, manager-handoff. templateSlots: day-one-package.

## Canon rules honored

- The start date SD is the one clock; every SLA is SD-N derived from it.
- Access is granted only from the role profile (least-privilege); no extras.
- Idempotency: accounts check-then-create so a re-run never makes two accounts.
- The gate is ALL, not most: one blocked task blocks the hire.
- Easy has no blocked/boundary cases in the main run; the blocked-hardware and
  moved-start-date cases are deliberate MEDIUM canon.
