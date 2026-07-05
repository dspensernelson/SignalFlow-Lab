# Module 8 Charter - Sentinel Evidence Locker (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Sentinel Health must prove, every quarter, that its security and process
controls actually operated: access reviews ran, backups restored, changes
were approved. The auditor does not accept "we did it" - only EVIDENCE,
collected on time, unaltered, attested by the right people, and retained on
schedule. Governance has been a thread in every module; here it is the
whole fabric. The learner builds audit automation where the record IS the
product.

## The deliverable

`audit-package.md` - the quarterly package: every control's evidence,
collected and hash-stamped, attested, findings tracked to remediation, all
under the retention schedule.

## Named roles (FIXED - never invent more)

Compliance Analyst (runs collection), Control Owners (produce evidence -
addressed by control id, e.g. "owner of AC-2"), Internal Auditor (tests and
issues findings), CISO (owns the control catalog; accepts residual risk),
Audit DL (receives the package).

## Signature concept cluster (new here)

Evidence as first-class records (what/when/who/hash), immutability (records
that can be added to but never edited), attestation chains, findings with
remediation tracking, retention schedules driven by regulation, evidence
freshness (proof EXPIRES).

## Recurring concepts (deepened)

Everything governance from M1-M7 returns at full strength: versioned
policies, sign-off capture, retention design, the explainers-outlive-the-
explained rule, quiet-path logging.

## Draft map spine

Phases: Control Catalog -> Evidence Requests -> Collection -> Attestation
and Findings -> Package and Retention.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| control-catalog | reference | governance | Controls as owned, versioned requirements |
| evidence-calendar | reference | governance | What proof is due when; freshness windows |
| evidence-request | artifact | build | A precise ask: control, period, format, owner |
| collection-tasks | process | transformation | Tracking requests across owners (fan-out) |
| evidence-record | artifact | build | The evidence itself: captured, hashed, immutable |
| immutability-policy | reference | governance | Append-only rules; corrections as new records |
| completeness-check | process | transformation | Every control covered? Every record fresh? |
| attestation-route | handoff | handoff | Owner attests; auditor countersigns; captured |
| finding-decision | decision | decision | Evidence sufficient -> pass; else -> finding |
| remediation-path | handoff | handoff | Findings get owners and deadlines |
| pass-log | handoff | handoff | Passing controls still logged (quiet path) |
| findings-log | artifact | build | The findings register with status |
| audit-package | output | assembly | The quarterly package |
| retention-schedule | reference | governance | Per-record-class retention, regulation-driven |
| evidence-archive | archive | handoff | Retention executed; seeds next quarter |
| freshness-feedback | process | transformation | Expiring evidence auto-queues next requests (loop) |

(16 nodes.)

## The fork

finding-decision: evidence complete, fresh, and attested -> pass-log; any
gap -> remediation-path with owner and deadline. Boundary teaching: STALE
evidence fails even when true - freshness windows are part of sufficiency.

## The temporal loop

evidence-archive -> evidence-calendar (via freshness-feedback): what was
collected this quarter, and when it expires, schedules next quarter's
requests. The loop as compliance engine.

## Unlock root and early branches

Root: control-catalog (the only module rooted at a REFERENCE - here, the
rules ARE the source of work). Fans to evidence-calendar +
evidence-request.

## Tier postures

- Easy: two controls, clean evidence, both pass.
- Medium: evidence past its freshness window, an owner attesting to the
  wrong period, a correction to immutable evidence (append, never edit).
- Hard (curated drills): design the retention schedule from regulatory
  floors (extends M1 hard retention); design freshness windows per control
  class; the missing-owner attestation ladder; the finding the CISO accepts
  as residual risk (governed exception - the module's hardest judgment).

## Engine needs (self-serve under AUTONOMY_CHARTER)

None expected beyond existing types; immutability is taught through
append-only record shapes in jsonEditor lessons, not engine enforcement.

## Canon guidance

Control ids from a fixed six-control list (AC-2, CM-3, CP-9 style);
quarters as Q-relative dates; hashes as short fixed strings (teaching
tokens, not real crypto). Cross-lesson numbers into
curriculum/module-08/canon.json.
