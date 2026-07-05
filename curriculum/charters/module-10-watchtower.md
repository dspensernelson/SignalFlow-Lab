# Module 10 Charter - Watchtower Incident Response (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Watchtower runs the platform every other module's fictional org would sit
on. Telemetry streams in constantly; thresholds decide what becomes an
alert; alerts page humans; runbooks act; postmortems tune the thresholds.
This is the curriculum's summit because it is automation ABOUT automation -
the workflow whose job is keeping every other workflow alive - and because
its loop (incident -> postmortem -> better thresholds -> fewer incidents)
is continuous improvement made mechanical. The learner finishes able to
design the nervous system, not just the organs.

## The deliverable

Per incident: `postmortem.md` - timeline, impact, response, action items.
Monthly: the reliability report. And then THE CAPSTONE (below).

## Named roles (FIXED - never invent more)

On-call Engineer (first responder), Incident Commander (owns severe
incidents), Service Owner (owns each service's thresholds), SRE Lead (owns
runbooks and the reliability report), Status Page (an OUTPUT channel, not a
person), Engineering DL (receives the report).

## Signature concept cluster (new here)

Alert thresholds on streams (signal vs noise as a designed trade), paging
as the highest-stakes handoff, runbooks as executable procedure, severity
classification under pressure, postmortems as governed artifacts, the
tuning loop (every threshold in this module is v-something because
incidents keep editing them).

## Recurring concepts (the whole curriculum returns)

M1 thresholds and escalation ladders, M3 SLAs, M4 severity matrices, M7
events and states, M8 evidence and immutable timelines - deliberately: the
learner should RECOGNIZE every mechanism here.

## Draft map spine

Phases: Telemetry and Thresholds -> Detection and Triage -> Runbook
Response -> Escalation and Comms -> Postmortem and Tuning.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| telemetry-stream | source | inspection | Metrics as streams; noise is the default |
| alert-threshold-policy | reference | governance | Signal vs noise as owned, versioned config |
| alert-event | artifact | build | A threshold crossing captured as record |
| dedup-window | process | transformation | One incident, not forty alerts (storm control) |
| severity-matrix | reference | governance | Impact x scope grid; who gets woken up |
| severity-decision | decision | decision | Page a human vs log-and-watch |
| paging-handoff | handoff | handoff | The page: ack captured, timeout ladder armed |
| watch-log | handoff | handoff | The quiet path: unpaged alerts still recorded |
| runbook-library | reference | governance | Procedures as versioned, executable steps |
| runbook-execution | process | transformation | Following the steps; deviations logged |
| status-comms | output | handoff | Telling users the truth mid-incident |
| resolution-record | artifact | build | What ended it, when, confirmed by whom |
| incident-timeline | artifact | build | The immutable sequence (M8 evidence rules) |
| postmortem | output | assembly | Timeline + impact + actions, blameless by format |
| action-items | artifact | build | Tracked commitments with owners |
| incident-archive | archive | handoff | Retention; feeds threshold tuning |
| threshold-tuning | process | transformation | Incidents edit the thresholds (loop close) |

(17 nodes.)

## The fork

severity-decision: at or above the paging band -> paging-handoff; below ->
watch-log. Boundary teaching: paging thresholds are the costliest boundary
in the curriculum - too low burns humans (alert fatigue), too high burns
customers - and the postmortem loop exists precisely to keep re-deciding it
with evidence.

## The temporal loop

incident-archive -> alert-threshold-policy (via threshold-tuning): every
incident's postmortem proposes threshold and runbook edits. The curriculum
ends where Module 1 began - someone setting thresholds - except now the
learner IS the mechanism that sets them, from evidence, forever.

## Unlock root and early branches

Root: telemetry-stream. Fans to alert-threshold-policy + severity-matrix;
detection branch and response branch converge at the postmortem.

## Tier postures

- Easy: one clean incident: threshold trips, page, runbook, resolve,
  postmortem.
- Medium: an alert storm (dedup judgment), a page nobody acks (ladder under
  real stakes), a runbook step that does not match reality (deviate and log).
- Hard (curated drills): design paging thresholds from a month of telemetry
  plus fatigue budget; design the severity matrix; the incident DURING an
  incident (priority collision); postmortem for a near-miss (the hardest
  honesty drill).

## THE CAPSTONE - design-your-own-workflow (module 10 hard finale)

The final proof of transfer, replacing lesson drills with authorship: the
learner receives a plain-language business brief for an UNSEEN domain and
produces (1) a workflow map using the node taxonomy, (2) a canon of values,
(3) the governed policies with owners and versions, and (4) the key
artifacts - validated by the same machinery (map linter, canon checks,
artifact validators). Requires the authoring surface specced at
CURRICULUM_MASTER_PLAN Part 4/H4; spec it at ENGINE_ADDITIONS_SPEC fidelity
(self-serve under AUTONOMY_CHARTER) when module 10 begins. If the surface
proves too large, the fallback - ratified now - is a guided version: the
learner designs on paper against a provided rubric checklist rendered as
choiceCheck + jsonEditor lessons.

## Engine needs (self-serve under AUTONOMY_CHARTER)

The capstone authoring surface (above). Otherwise existing types suffice.

## Canon guidance

Services from a fixed three-service list; metrics with units (ms, pct,
count); severities SEV1-SEV4; times in minutes-since-trip. Cross-lesson
numbers into curriculum/module-10/canon.json.
