# Audit Report - 2026-07-02 (PM review of all progress to date)

Auditor: the PM session, at the owner's request: "review everything so far...
check for inconsistencies, places for improvements, areas where humans would
be confused and not learn." Audience: the builder. Work the findings below
per AUTONOMY_CHARTER.md; every fix is a builder decision (no owner gate is
touched). Keep ASCII-only.

## Scope and method

- Mechanical: `npm run check` re-run on HEAD (fe29e59); commit-by-commit
  review of the six builder commits since b088307.
- Governance: DECISION_LOG entries vs playbook steps vs charter envelope;
  OPEN_QUESTIONS state.
- Live: project switcher, Beacon board root, storage-key namespacing +
  module-01 legacy keys, wrong-answer no-scroll on a surface NOT in the
  builder's verified list (three-way-match easy), console. Test state
  cleared afterward.
- Content: learner-eyes read of Module 2 samples (invoice-inbox,
  three-way-match, capstone) and a targeted sweep of Module 1 copy.

## Verdict

The build is in excellent shape and the autonomy system is working as
designed. All gates green (2 projects, 76 lessons, 86 assertions, 23
derivations, 76 fixtures, map lint clean on both maps). The builder's
process discipline is exactly right: the payment-history map deviation was
inside the charter envelope, correctly reasoned (mirrors Meridian's
archive -> reference -> process loop), and logged; the hardcoded-canvas fix
was logged; live no-scroll verification was claimed and (spot-checked)
true; the living handoff is current. Module 2 content QUALITY is in places
BETTER than Module 1 (see Keep Doing). Nothing found is a blocker. Ten
findings follow, ordered by learning impact.

## Findings

### F1 (HIGH, learning) - three-way-match teaches its own boundary wrong

`lesson-three-way-match.json` (easy): the Tolerance Policy is "the LARGER of
2% of PO or 25.00" - under larger-of, ONLY the band matters. But
instruction 4 ("within the band and within 2%") and intro section 4
("...and 1.67% is inside 2% - the price leg passes") add a second condition
the rule does not contain. At the boundary they contradict: a 24.50
variance (2.04%) IS within tolerance under larger-of, but this copy says it
is not. This curriculum's signature move is precise boundary teaching; here
it muddies its own.

Fix: (a) reword instruction 4 and intro section 4 to band-only; (b) check
`lesson-tolerance-policy*.json` and the medium match lesson state larger-of
cleanly; (c) OPPORTUNITY - add the 24.50/2.04% case to a medium or hard
drill as the deliberate boundary lesson (that case is a gift). Update canon
assertions if any wording-derived value changes.

### F2 (MEDIUM, learning) - "Lesson 15" reference learners cannot follow

`lesson-prior-day-reference.json` intro: "Lesson 15 covers the other one."
Lessons are not numbered anywhere in the app. Replace with the node name
("the Prior Day Brief Template lesson covers the other one").

### F3 (MEDIUM, learning) - positional "next lesson" copy vs the branching tree

Module 1 copy predates the unlock tree and still promises sequence the tree
does not guarantee: `lesson-analyst-notes.json` ("extraction is the next
lesson" - trader-flag and price-feed actually unlock next),
`lesson-approval-decision.json` ("that handoff is your next lesson"),
`lesson-prior-day-brief-template.json` ("the very next lesson renders..."),
`lesson-price-feed.json` ("Same rows, next lesson"). Module 2 already uses
the right pattern - naming the task ("extraction is the Invoice Record
task"). Sweep Module 1 to that pattern. (`lesson-approval-route.json`'s
"previous lesson" is prereq-guaranteed but rename it too for consistency.)

### F4 (MEDIUM, UX/confusion) - difficulty badges collide with tier names

Easy-tier lessons wear "Beginner"/"Intermediate" badges while the tier
switch says Easy/Medium/Hard; a learner on Easy seeing "Intermediate"
reasonably wonders if they are on the wrong tier, and "Medium"-badged
lessons on the Medium tier make the badge redundant. Recommend: drop the
per-lesson difficulty badge from the lesson header and show the TIER
instead (single vocabulary), or relabel within-tier as Easy. Touches
LessonWorkspace header + the `difficulty` field convention +
lint-lessons' VALID_DIFFICULTIES; log whichever you choose.

### F5 (LOW, learning) - Module 1 assumes energy vocabulary

`lesson-intake.json` and `lesson-clean-price-data.json` never gloss hub /
MWh / settled for a true beginner; Module 2 glosses its domain noticeably
better ("500 M8 hex bolts against PO-7742"). Add one-line glosses to the
two Module 1 intros (e.g. "a hub is a regional trading point; $/MWh is the
price of power"). Do not let glossing bloat Exercise screens - intros only.

### F6 (NITPICK) - cross-module distractor

`lesson-invoice-inbox.json` q3 option c ("A trader to approve each email")
imports Meridian's trader into Beacon. Fun for sequential learners,
confusing for a Module-2-first learner. Swap for an AP-native distractor
("The Controller must read each email first").

### F7 (MEDIUM, tech) - bundle growth needs the split BEFORE Module 3

753 kB minified at 2 modules (~200 kB/module trend puts Module 10 near
2.5 MB). The plan parks code-splitting as "when it matters" - it now
matters. Schedule per-project dynamic import (React.lazy or dynamic
`import()` in projects.js/App LESSONS) as the FIRST task of the Module 3
work block, before authoring. Storage/progress semantics are untouched by
this, so it is builder-decidable; log it.

### F8 (LOW, process) - missing Copilot entry-point file

A previous builder session started from a stale prompt because nothing in
the repo routes GitHub Copilot to the entry point. AGENTS.md exists (and
holds only the no-scroll rule). Add `.github/copilot-instructions.md` with
three lines: start at BUILDER_KICKOFF.md; obey AUTONOMY_CHARTER.md; run
`npm run check` before every commit. Consider the same pointer line at the
top of AGENTS.md.

### F9 (LOW, docs) - staleness batch from the multi-project move

- LESSON_DESIGN_FRAMEWORK section 6 "Key files" still points at
  `src/data/workflowNodes.json` etc. (now `src/data/projects/<id>/...`) and
  its storage-keys line lacks the `__<projectId>` namespacing.
- Same section's Build/validate block still lists only lint/build - point
  it at `npm run check`.
- Section 7 item 3 ends "NEXT: Module 2 built strictly via playbook" -
  Module 2 Easy+Medium are DONE; refresh the line and add Module 2 Hard as
  the current frontier.
- VERIFICATION_PLAYBOOK's "pipeline first" line predates lint:map; its
  gating-checks section says hard roots are "Market Intake Record + Price
  Feed" - still true, but note module-02's root (Invoice Inbox) now that
  gating is per-project.

### F10 (STATUS, not a defect) - the frontier

Module 2 Hard tier is empty by sequence, not omission (Easy -> Medium ->
Hard per playbook Step 7; charter lists the four hard drills: tolerance
design from vendor history, vendor-master bank-change fraud drill,
duplicate-rule design, degraded run with PO system down). Then Step 8 wrap
(playthrough, case study, release tag, PR module report) - note the module
PR itself has not been opened yet; gate 8 expects one PR per module.

## Keep doing (observed excellence to carry forward)

- The through-line artifact (INV-58831 followed all day) - a narrative
  device Module 1 lacks; consider it mandatory in future charters.
- Naming target tasks instead of positional references (fixes F3 by
  construction).
- Logging map deviations with the reasoning IN the DECISION_LOG entry.
- Deferring row validators to Medium where multiple cases make them
  natural - a genuinely good difficulty-design decision nobody specified.
- Verifying the no-scroll rule live and SAYING SO in the log with the
  measured numbers.

## Suggested order of work

1. F1 + F2 + F3 + F6 in one "copy integrity" pass (with canon/lint runs).
2. Module 2 Hard tier + Step 8 wrap incl. the module PR (F10).
3. F7 code-splitting as Module 3's opening task.
4. F4 as a small product decision + implementation (log it).
5. F5, F8, F9 batched into any convenient docs/copy commit.
