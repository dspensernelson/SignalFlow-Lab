# Module 3 Charter - Harbor Onboarding (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Harbor Logistics hires ~10 people a month across three departments. Every
new hire must be Day-One Ready by 8:00 AM on their start date: accounts
live, laptop delivered, badge active, payroll enrolled. Onboarding is the
classic many-hands workflow - four teams working in PARALLEL against one
deadline - and the learner builds the orchestration that makes it reliable.

## The deliverable

`day-one-package.md` - the readiness certificate: every provisioning task
done (or explicitly escalated), assembled the evening before the start date
and handed to the hiring manager.

## Named roles (FIXED - never invent more)

Recruiter (starts the process), People Ops Lead (owns role profiles and
SLAs), IT Provisioner (accounts and hardware), Facilities Coordinator
(badge and desk), Payroll Specialist (enrollment), Hiring Manager (receives
the package), New Hire (the subject, never an actor).

## Signature concept cluster (new here)

Orchestration: parallel branches, task states (pending/in-progress/done/
blocked), completion gates (fan-in on status not data), SLAs as fields,
idempotent re-runs (running provisioning twice must not create two accounts).

## Recurring concepts (deepened)

Intake records, reference catalogs, escalation ladders (M1 hard), the quiet
path logs, assembly, archive loops.

## Draft map spine

Phases: Offer Intake -> Provisioning Plan -> Parallel Provisioning -> Gate
and Exceptions -> Day-One Package.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| signed-offer | source | inspection | The triggering document; effective dates |
| role-profile-catalog | reference | governance | What each role gets (the provisioning matrix) |
| onboarding-record | artifact | build | The master record: who, role, start date, needs |
| sla-policy | reference | governance | Per-task deadlines relative to start date |
| provisioning-plan | artifact | transformation | Expanding role profile into a task list with SLAs |
| accounts-task | process | transformation | Account creation; idempotency (re-run safe) |
| hardware-task | process | handoff | Physical-world task: order, track, receive |
| access-task | process | transformation | Badge/systems access; least-privilege from profile |
| payroll-task | process | handoff | Enrollment handoff; captured confirmation |
| task-tracker | artifact | transformation | One status record over four parallel branches |
| readiness-gate | decision | decision | All done by SLA -> package; any blocked -> escalate |
| escalation-path | handoff | handoff | Blocked-task escalation with owner and deadline |
| day-one-package | output | assembly | The certificate, from the tracker and plan |
| manager-handoff | handoff | handoff | Hiring manager acknowledges receipt |
| onboarding-archive | archive | handoff | Retention; feeds profile improvements |
| profile-feedback | process | transformation | What the archive teaches the catalog (loop close) |

(16 nodes.)

## The fork

readiness-gate: every task done inside SLA -> day-one-package; any task
blocked or past SLA -> escalation-path. Boundary teaching: done-at-deadline
passes; one blocked task blocks the gate no matter how many others are done
(fan-in on ALL, the orchestration invariant).

## The temporal loop

onboarding-archive -> role-profile-catalog (via profile-feedback): every
completed onboarding teaches the catalog what the role actually needed.

## Unlock root and early branches

Root: signed-offer. Fans to role-profile-catalog + onboarding-record; the
plan then fans WIDE (the four parallel task lessons unlock together - the
board's biggest simultaneous opening, deliberately mirroring the concept).

## Tier postures

- Easy: one hire, one role, all four tasks succeed, gate passes.
- Medium: hardware backordered (blocked state + escalation), a start date
  moved (plan recompute), a re-run after partial failure (idempotency).
- Hard (curated drills): design the SLA policy from past onboarding times;
  the gate when a task owner is unresponsive (ladder at scale); the day-one
  package in degraded mode (start anyway vs delay - a governed decision).

## Engine needs (self-serve under AUTONOMY_CHARTER)

Likely ONE new interaction type: a task-state board (set four tasks'
states against events; deterministic validation). Spec first at
ENGINE_ADDITIONS_SPEC fidelity per the autonomy protocol; if the concept
proves expressible with jsonDeltas rows (taskId/state/blockedReason), prefer
that and skip the new type.

## Canon guidance

Dates relative to start-date ("SD-3", "SD"); SLA values in business days;
one named hire kept generic ("the new hire" plus role title). Cross-lesson
numbers into curriculum/module-03/canon.json.
