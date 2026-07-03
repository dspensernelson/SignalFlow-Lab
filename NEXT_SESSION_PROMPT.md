# Next Session Prompt (paste verbatim to the builder)

```text
You are the autonomous BUILDER for SignalFlow Lab. Read, in order:
GO_LIVE_REVIEW.md (the final PM audit - your work order), then
AUTONOMY_CHARTER.md, BUILDER_KICKOFF.md, and VERIFICATION_PLAYBOOK.md.
Run `npm run check` and read OPEN_QUESTIONS.md before touching anything.

THE QUEUE HAS CHANGED. The owner is taking this live to human users, so
GO_LIVE_REVIEW.md Part 3 (phases G0-G3) now runs BEFORE Module 3. Work it
in order, one phase per commit-or-small-batch:

G0 - Verify and patch (do first, this session):
  1. W3: add a scroll affordance (bottom fade + a "scroll for more" hint
     that disappears at scroll-end) to every internally-scrolling exercise
     panel, in the SHARED workbench components, not per lesson. Prove it on
     lesson-tolerance-policy-hard (currently hides 137px of evidence with
     no cue).
  2. W2: build compact mode - below ~720px innerHeight, collapse the lesson
     header to one line, step paddings down, rebalance the source panel's
     max-height. Then verify the wrong-answer state holds
     scrollHeight === clientHeight at BOTH 1280x800 AND 1366x650 for one
     lesson of each interaction type. Add 1366x650 to VERIFICATION_PLAYBOOK
     as a mandatory second checkpoint.
  3. S4: dark-mode sweep of Module 2 surfaces; S7: one keyboard-only hour
     (dropdown, radios, map nodes) - fix what blocks task completion, log
     the rest; S5: fold the below-map dead-space improvement into the same
     layout pass if cheap, else log why not.

G1 - Human moments: first-run welcome card (3 bullets + CTA, shown once);
  tier-completion card (artifact list + capability recap + next-tier/module
  CTA); "Download everything I built" export (JSON + generated markdown);
  replace the learner-facing "N of N lessons defined" stat with current-tier
  progress. No new page scroll at either checkpoint.

G2 - Transfer layer (the owner's core directive): add the `realWorld`
  takeaway beat (soloRebuildPath surfaced + a Power Automate / Zapier /
  Python-or-script mapping line) to the takeaway contract, enforce it in
  lint-lessons, and backfill ALL Module 1 + 2 lessons; build Module 2's
  solo-rebuild capstone with artifactImport (4 Beacon files, mirror Module
  1's); write curriculum/module-01/TOOL_MAP.md and module-02/TOOL_MAP.md;
  amend MODULE_AUTHORING_PLAYBOOK step 7 + curriculum/charters/_INDEX.md:
  per-module capstone is MANDATORY and the interaction budget is
  SPEND-OR-JUSTIFY (a zero-new-interaction module logs why at the map gate).

G3 - Ship: F7 per-project code-splitting (before deploy, not before M3);
  then STOP and park in OPEN_QUESTIONS.md for the owner: (a) merge the PR
  stack #1 -> #2 -> #3, (b) ratify the deploy amendment in GO_LIVE_REVIEW
  Part 4. After the owner merges and ratifies: deploy to the existing
  Vercel project from main, run the VERIFICATION_PLAYBOOK end-to-end on
  the LIVE URL at both checkpoints, add the URL to README.

Then resume the fixed queue at Module 3 (Harbor) under the amended
mandates. Standing rules unchanged: `npm run check` green before every
commit, never weaken a check, live wrong-answer verification for every
touched surface, ASCII docs, log decisions, never self-merge, PARK what
the charter does not authorize.
```
