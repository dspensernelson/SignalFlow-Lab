# Next Session Prompt (paste verbatim to the builder)

```text
You are the autonomous BUILDER for SignalFlow Lab. Read, in order:
SLOP_AND_POLISH_REVIEW.md (the current work order), then AUTONOMY_CHARTER.md,
BUILDER_KICKOFF.md, and VERIFICATION_PLAYBOOK.md. Run `npm run check` and read
OPEN_QUESTIONS.md before touching anything.

STATE: Modules 1 and 2 are complete across all tiers (82 lessons, green) and
the whole reviewed history is now MERGED TO main. Both former owner ship-actions
are RESOLVED (OPEN_QUESTIONS): the PR stack is merged, and the Gate 8 deploy
amendment is ratified - the builder MAY now deploy to the existing Vercel
project from green main. Future work branches off main.

YOUR QUEUE, in order:

0. SHIP main. Confirm the production deploy of main (Vercel may auto-deploy on
   the merge push; if it did not, deploy per the amendment). Then run the
   VERIFICATION_PLAYBOOK end-to-end smoke test on the LIVE url at BOTH 1280x800
   and 1366x650, and log the result + add the live url to README. If the smoke
   test fails, that is the first fix - real users come before new work.

1. ANTI-SLOP PASS (SLOP_AND_POLISH_REVIEW.md Q5 plan) - do this BEFORE Module 3
   authoring, because it changes the interaction contract every later module
   inherits:
   A. Break the choiceCheck monopoly. It is 38% of lessons today and the
      default for every inspection and handoff node. Spec (at
      ENGINE_ADDITIONS_SPEC fidelity, then build) at least one ACTIVE
      alternative - a "tag the source" inspection interaction and/or a
      "capture the handoff record" mini-form - so choiceCheck can drop toward
      ~20%. Enforce a cap at the map gate: no more than ~1 in 4 lessons per
      module may be choiceCheck; log the count in DECISION_LOG. (This is a new
      interaction type = an owner gate under the charter; write the spec, then
      PARK for owner approval before building it. Everything else in this list
      is builder-decidable.)
   B. Name the recurrence. Add a one-screen "you have seen this shape before"
      intro card at each module start (Module 2+), mapping the module's nodes
      onto the Meridian skeleton. Data-driven, one card per module.
   C. (Optional, only if A+B do not refresh the feel) vary the takeaway rhythm.

2. Then Module 3 (Harbor Onboarding) STRICTLY via MODULE_AUTHORING_PLAYBOOK.md
   against its ratified charter, under the amended mandates: mandatory
   solo-rebuild capstone (Step 7a), the choiceCheck cap from 1A, and consider
   the recommended "field notes" wrap lesson (credentials, testing, when NOT
   to automate, maintenance) once per module from here on - decide at the map
   gate and log it.

Standing rules unchanged: `npm run check` green before every commit; live
wrong-answer verification at BOTH 1280x800 and 1366x650 for every touched
surface; never weaken a check; ASCII docs; log decisions; never self-merge;
PARK what the charter does not authorize.
```
