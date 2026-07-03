# Go-Live Review - 2026-07-03 (final PM audit before human users)

The owner's bar for this review: a human user goes through this product and
walks away knowing everything possible about how to ACTUALLY build
automations and workflows. This review measures the product against THAT
bar, not against "is the repo tidy" (it is) or "are the checks green" (they
are: 81 lessons, 98 assertions, 31 derivations, build clean at HEAD
7f088c1). Every finding below was MEASURED live on 2026-07-03, not
inferred. Keep ASCII-only.

Verdict in one sentence: this is an excellent course about automation
THINKING wearing the clothes of a product that teaches automation BUILDING -
and the last few pushes must close that gap, fix two measured usability
defects, and add the three human moments the app has never had, or real
users will admire it, scroll past hidden evidence, finish to silence, and
still freeze the first time they open a real automation tool.

---

## PART 1 - The five wounds (deepest first)

### W1. The transfer gap: learners simulate automations; they never build one

The pedagogy has the learner BE the automation - typing the JSON a machine
would emit. That is a genuinely great way to teach invariants (schemas,
thresholds, audit trails, loops), and the theory/recognition-cue layer is
the strongest part of the product. But the owner's bar is ACTUALLY building
automations, and today:

- The ONLY moment a learner makes something run outside the app is Module
  1's solo-rebuild capstone. One lesson out of 81.
- Module 2 shipped WITHOUT a capstone. Its hard tier is five (good) design
  drills; nothing asks the learner to rebuild the Beacon pipeline in a real
  tool. The capstone pattern silently became optional after one module.
- Every node carries a soloRebuildPath ("start with a local file, later
  wire to email/API...") - the exact bridge to real tools - and it is
  BURIED in the NodeDetail side panel. No lesson ever teaches it; a learner
  can complete all 81 lessons without reading one.
- Nothing anywhere maps a lesson concept to the tool the learner will
  actually face: "this decision node is a Condition card in Power
  Automate, a Filter step in Zapier, an if statement in Python." The
  learner masters the pattern language and is handed zero vocabulary for
  the tools that speak it.

OWNER DIRECTIVE (ratified by this review, per the owner's stated bar):
1. Per-module solo-rebuild capstone is MANDATORY from now on, and Module 2
   gets one retroactively (artifactImport already exists; compose 4 Beacon
   fixtures - invoice-record, three-way-match, match-decision routing
   table, payment-batch - exactly like Module 1's).
2. A "Do it for real" beat joins the takeaway contract: surface the node's
   soloRebuildPath plus a three-tool mapping line (Power Automate / Zapier
   / Python or script) on every takeaway screen. Data-driven: a `realWorld`
   takeaway field; lint enforces its presence going forward; backfill
   Modules 1-2.
3. Each module wrap gains a TOOL_MAP.md appendix (concept -> tool feature
   table, ~1 page) linked from the case study.

### W2. The viewport lie: the no-scroll doctrine fails on real laptops

Measured today: at 1366x650 (a 1366x768 laptop minus browser chrome - the
single most common consumer viewport), the SMALLEST exercise surface (a
4-question quiz) page-scrolls by 65px in the wrong-answer state (715 vs
650). Every surface in the product was verified at exactly 800px and
nowhere else. The doctrine's core pedagogical promise - source, work,
validation, and next action visible TOGETHER - breaks on the hardware most
humans will bring, and we would never know because verification always ran
on the calibration height.

Required: a compact mode. Below ~720px innerHeight, shrink the lesson
header (title row + stepper onto one line), drop panel paddings one step,
and reduce the source-panel max-height share. Acceptance: the intro-quiz
and one jsonEditor lesson hold scrollH === clientH at 1366x650 in the
wrong-answer state; VERIFICATION_PLAYBOOK adds 1366x650 as a SECOND
mandatory checkpoint. (This is layout compaction - builder-decidable under
the charter; the 800 target stays, a smaller floor is added.)

### W3. The amputated evidence: bounded panels hide content with zero cue

The structural no-scroll fix (bounding the source column, letting the
narrative scroll internally) was the right architecture and it saved the
Hard tier. But measured today on tolerance-policy-hard at 1280x800: the
source panel renders 227px of a 364px narrative - 137px (38%) of the
DESIGN EVIDENCE is hidden - with overflow auto, overlay scrollbars, no
fade, no indicator, nothing. A learner on Windows sees a complete-looking
panel and designs a tolerance policy from 60% of the vendor history. The
no-scroll rule was satisfied by silently amputating the material the drill
exists to teach from.

Required: a scroll affordance on every internally-scrolling panel - a
bottom fade gradient plus a persistent "scroll for more" hint (or forced
visible scrollbar via styling) that disappears once the learner scrolls to
the end. Acceptance: on tolerance-policy-hard, the affordance is visible
before scrolling and gone at the bottom; applies to the shared workbench,
not per-lesson.

### W4. The missing human moments: entry, exit, and pride do not exist

Measured today on a fresh profile and on a 100%-complete board:

- ENTRY: first-run drops the user onto a dense enterprise map, a paragraph
  of project prose, and one blue button. Nothing says what this app is,
  that the board OPENS as you build, that tiers are separate journeys, or
  what you will be able to do at the end. The stats row even says "17 of 17
  lessons defined" - builder telemetry, meaningless to a learner.
- EXIT: completing an entire tier produces NOTHING (measured: no
  celebration, no summary, no next-step CTA - a silently green board).
  Finishing the hardest work the product offers is indistinguishable from
  not having started it, minus the button color.
- PRIDE: the learner's artifacts - the entire pedagogical currency of the
  product - are locked in localStorage, viewable one at a time, and leave
  with nothing. The master plan promised an export; go-live needs at least
  "Download everything I built" (JSON + a generated markdown summary).

Required: (a) a first-run welcome card (3 bullets + "Start the first
lesson" CTA, dismissed forever after); (b) a tier-completion card (what you
built - artifact list - capability statements recap - CTA to next
tier/module); (c) an export-artifacts button on the canvas. Replace the
"lessons defined" stat with something learner-meaningful (e.g. current
tier progress).

### W5. Interaction monotony: the budget exists and nobody spends it

76 of 81 lessons are the same three interactions; Module 2 - 34 lessons -
introduced ZERO new interactions despite an explicit one-per-module budget
and a charter note flagging candidates. Extrapolated, Module 10 ends near
340 JSON-typing repetitions. The pedagogy survives it (the content
varies), but no human's attention will. The M3 charter flags a task-state
board; M7 flags an event-sequence workspace. These are not nice-to-haves;
they are the difference between a curriculum and a grind.

Required: make the interaction budget a SPEND-OR-JUSTIFY rule - a module
that ships with zero new interactions must log WHY in DECISION_LOG at the
map gate. M3's task-state board should be specced (ENGINE_ADDITIONS
fidelity) unless jsonDeltas genuinely reads better - decide at the gate,
in writing.

## PART 2 - Secondary cuts (fast, all real)

S1. PR stack unmerged: #1 <- #2 <- #3, so "go live" is IMPOSSIBLE today -
    nothing is on main. Owner action; merge order documented in Part 3.
S2. Deploy is prohibited by gate 8. Going live REQUIRES a standing-approval
    amendment (draft in Part 4) naming the Vercel target and rules.
S3. Bundle 787 kB and F7 correctly scheduled - but it must land BEFORE the
    public deploy, not before Module 3 authoring. Order changed in Part 3.
S4. Dark-mode: Beacon canvas spot-checked fine today, but no evidence of
    the playbook-required full theme sweep for Module 2 surfaces. Do it in
    G0 and say so in the log.
S5. Below-map dead space at tall viewports: flagged in the first audit,
    never addressed. Fold into W2's compact-mode pass (same file).
S6. Quiz option text sits at the floor (text-xs) - acceptable at 800px,
    re-judge after compact mode; do not shrink further.
S7. Accessibility unknowns: custom project dropdown keyboard nav, radio
    target sizes, aria on the map nodes. One hour of keyboard-only testing
    in G0; fix what breaks task completion, log the rest.
S8. Stats row still shows builder-facing "N of N lessons defined" (see W4).
S9. The check pipeline cannot see W2/W3-class defects (layout truths).
    Accept that; VERIFICATION_PLAYBOOK gains the 1366x650 checkpoint and
    the affordance check so at least the HUMAN loop catches them.

## PART 3 - The A-to-B plan (from HEAD to live humans)

Fixed order. Each phase ends demoable with `npm run check` green.

- G0 VERIFY AND PATCH (1 session): W3 scroll affordance; W2 compact mode +
  1366x650 as second checkpoint; S4 dark sweep both modules; S7 keyboard
  hour; S5 dead-space fold-in. Acceptance: quiz + jsonEditor + templateSlots
  wrong-answer states hold at BOTH 1280x800 and 1366x650; affordance
  visible/vanishing correctly; log everything.
- G1 HUMAN MOMENTS (1-2 sessions): W4 welcome card, tier-completion card,
  artifact export, stats-row copy. Acceptance: fresh profile sees welcome
  once; completing easy tier of module-01 shows the completion card with
  artifact list + next CTA; export downloads JSON+MD; no new page-scroll.
- G2 TRANSFER LAYER (2 sessions): W1 items - `realWorld` takeaway beat
  (engine + lint + backfill M1/M2), Module 2 capstone via artifactImport,
  TOOL_MAP.md for both modules, capstone mandate written into
  MODULE_AUTHORING_PLAYBOOK step 7 and the charters index. Acceptance:
  every takeaway shows Do-it-for-real; M2 hard is 6/6 incl. capstone; lint
  enforces realWorld on all 82+ lessons.
- G3 SHIP (owner + 1 session): F7 code-splitting FIRST (pre-deploy, not
  pre-M3); owner merges the stack (#1 -> main, then #2, then #3 - or
  squash-merges the chain top-down after review); deploy to Vercel under
  the Part 4 amendment; production smoke test = VERIFICATION_PLAYBOOK
  end-to-end on the live URL at both checkpoints; README gets the live
  link. Acceptance: a stranger with the URL completes lesson 1 on a
  1366x768 laptop without instructions.
- G4 RESUME THE QUEUE: Module 3 (Harbor) under the amended mandates
  (capstone mandatory, interaction budget spend-or-justify, both-viewport
  verification, theme sweep logged).

## PART 4 - Standing-approval amendment (deploy exception to gate 8)

Proposed for owner ratification (one word from the owner ratifies; record
in DECISION_LOG): "The builder MAY deploy the app to the existing Vercel
project (signal-flow-lab) from main after each merged module PR, and only
from main. No other outward-facing action is unlocked. Every deploy is
followed by the production smoke test and logged."

## PART 5 - What must NOT change (measured excellence)

The canon+derivation system (drift is now mechanically impossible), the
unlock tree, the tier postures (operate/mess/design is a genuinely good
difficulty theory), the Medium batch design (one clean invoice among four
failure modes), the governance discipline (logged deviations, honest
verification numbers in DECISION_LOG), the writing voice of the theory
sections. And the honesty clause for the owner: even after G2, "EVERYTHING
about automation" still has unscheduled territory - tool selection,
credentials/secrets handling, testing habits, when NOT to automate,
maintenance and handover. Recommend one "field notes" wrap lesson per
module from Module 3 on, drawing from this list; that decision rides with
the M3 map gate.
