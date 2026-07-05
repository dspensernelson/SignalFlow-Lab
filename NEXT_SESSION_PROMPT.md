# Next Session Prompt (paste verbatim to the builder)

```text
You are the autonomous BUILDER for SignalFlow Lab. Read, in order:
AUTONOMY_CHARTER.md, BUILDER_KICKOFF.md, VERIFICATION_PLAYBOOK.md, and
ENGINE_ADDITIONS_SPEC_INSPECTION_HANDOFF.md. Run `npm run check` and read
OPEN_QUESTIONS.md before touching anything.

STATE: Modules 1 and 2 are complete across all tiers (82 lessons, green) and
the whole reviewed history is MERGED TO main. The app is LIVE at
https://signal-flow-lab.vercel.app (Vercel auto-deploys green main; end-to-end
smoke test passed at 1280x800 and 1366x650, console clean). The anti-slop pass
is DONE: 1A (choiceCheck <=25% cap now HARD-ERRORS for module-03+, module-01/02
grandfathered as warnings) and 1B (the "you have seen this shape before"
recurrence card + src/data/moduleSkeleton.json) are on main. The owner APPROVED
BOTH new interaction types - tagSource + handoffForm
(ENGINE_ADDITIONS_SPEC_INSPECTION_HANDOFF.md), Gate 4 budget-exempt. All new
work branches off main; ONE PR per module (or per engine change) against main.

YOUR QUEUE, in order:

1. BUILD tagSource + handoffForm exactly per the approved spec (own branch, own
   PR against main - engine additions that benefit every module). Additive
   validators (existing matching rules stay frozen), Exercise components
   branched by interactionType, fixtures in scripts/lesson-fixtures.json, lint
   coverage in scripts/lint-lessons.mjs, and live no-scroll verification at BOTH
   1280x800 and 1366x650 in the wrong-answer state. Optional nice-to-have:
   retrofit a few module-02 inspection/handoff lessons onto the new types to cut
   its 47.5% choiceCheck share (module-02 is grandfathered, so not required).

2. MODULE 3 (Harbor Onboarding) via MODULE_AUTHORING_PLAYBOOK.md against its
   ratified charter (own branch off main, own PR). Non-negotiables: the
   mandatory Hard-tier solo-rebuild capstone (Step 7a); the choiceCheck cap
   (<=25%, enforced) met by spending tagSource/handoffForm on the
   inspection/handoff nodes; a src/data/moduleSkeleton.json recurrence entry
   (playbook Step 2a); and decide at the map gate whether to add a "field notes"
   wrap lesson (credentials/secrets, testing, when NOT to automate, maintenance)
   - log the decision either way.

Standing rules unchanged: `npm run check` green before every commit; live
wrong-answer verification at BOTH 1280x800 and 1366x650 for every touched
exercise surface; never weaken a check; ASCII docs; log decisions; new work
branches off main; never self-merge (merge + deploy are owner actions, though
deploy-from-green-main is pre-authorized per the Gate 8 amendment); PARK what
the charter does not authorize.
```
