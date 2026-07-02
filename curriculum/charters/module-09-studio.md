# Module 9 Charter - Studio Campaign Ops (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Studio Outdoor markets gear across email, social, and web. Every campaign
is the same machine wearing different copy: a brief becomes assets, assets
clear an approval chain, one approved message FANS OUT to three channels
with tracking codes, and Friday's rollup says what worked. One mistake here
is public - the wrong price emailed to 40,000 people - so templating and
approval discipline are not bureaucracy, they are the safety system. The
learner builds content operations: one source of truth fanning out to many
renditions.

## The deliverable

Per campaign: `launch-package.md` - approved assets, channel renditions,
tracking codes, and the send schedule. Weekly: the Friday performance
rollup.

## Named roles (FIXED - never invent more)

Campaign Manager (owns the brief), Copywriter (drafts assets), Brand
Reviewer (owns the brand checklist), Channel Specialist (owns renditions
and sends), Marketing Director (final launch approval), Marketing DL
(receives the rollup).

## Signature concept cluster (new here)

Single-source content templating (one message, many renditions), versioned
asset libraries, multi-step approval chains (sequenced, unlike M1's single
approver), fan-out with per-channel constraints, tracking codes as a
naming policy, performance feedback into templates.

## Recurring concepts (deepened)

Template change management (M1 medium, now the core), governed formats,
capture-the-response handoffs, assembly, archive loops.

## Draft map spine

Phases: Brief and Templates -> Content Records -> Approval Chain -> Fan-out
and Tracking -> Rollup and Learning.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| campaign-brief | source | inspection | The triggering ask: audience, offer, dates |
| asset-template-library | reference | governance | Versioned templates per channel |
| brand-checklist | reference | governance | What every asset must satisfy |
| content-record | artifact | build | The single-source message: claims, price, dates |
| rendition-rules | reference | governance | Per-channel constraints (lengths, formats) |
| channel-renditions | process | transformation | One record -> three renditions, no drift |
| review-route | handoff | handoff | Copy -> brand -> director, in order, captured |
| launch-decision | decision | decision | Approved -> fan-out; any reviewer blocks -> rework |
| rework-path | handoff | handoff | Rejection with reason; version increments |
| tracking-code-policy | reference | governance | UTM-style naming as owned config |
| tracking-codes | artifact | transformation | Codes generated per rendition per the policy |
| send-schedule | reference | governance | When each channel fires; quiet hours |
| launch-package | output | assembly | The package: renditions + codes + schedule |
| performance-events | source | inspection | Clicks/opens arriving after the fact |
| performance-rollup | output | assembly | The Friday rollup, joined BY tracking code |
| campaign-archive | archive | handoff | Retention; winners feed the template library (loop) |

(16 nodes.)

## The fork

launch-decision: all three approvals captured in order -> fan-out; any
rejection -> rework-path with reason, and the content version increments.
Boundary teaching: approval of VERSION 2 does not carry to version 3 - any
edit resets the chain (the discipline that prevents the wrong-price email).

## The temporal loop

campaign-archive -> asset-template-library: winning renditions become next
quarter's templates - measured performance, not taste, evolves the library.

## Unlock root and early branches

Root: campaign-brief. Fans to asset-template-library + brand-checklist;
the content branch and the tracking/schedule branch converge at the
launch-package.

## Tier postures

- Easy: one campaign, three renditions, clean approval chain.
- Medium: a rendition that drifts from the source record (single-source
  violation caught), a mid-chain edit (chain reset), a tracking code that
  breaks the naming policy (the rollup join fails - shown, then fixed).
- Hard (curated drills): design the tracking-code policy so the rollup
  join is guaranteed; template-library change management from performance
  data; the recall drill (wrong price approved and sent to one channel -
  compensation across channels, echoes M7); rollup with a missing channel
  feed (degraded, gap named).

## Engine needs (self-serve under AUTONOMY_CHARTER)

None expected beyond existing types; renditions and rollups fit
templateSlots naturally (this module is templateSlots' home turf).

## Canon guidance

Campaign ids CMP-###; channels fixed (email, social, web); one product
with one price; tracking codes from a single documented pattern. Cross-
lesson numbers into curriculum/module-09/canon.json.
