# Slop-and-Polish Review - 2026-07-04 (post go-live-patch audit)

Fifth PM review, at HEAD 70ea98e (branch module-02-beacon). Everything below
was verified live or by reading the shipped artifacts, not inferred. Scope:
the owner's five questions - internal consistency, usability, formatting,
"will people actually learn," and "will the module system feel like AI slop."
Keep ASCII-only.

Bottom line: the go-live patch work (G0-G3) is real and careful, not
box-checked - every measured wound from the prior audit is genuinely closed.
The product will teach people to actually build automations. The one honest
risk that remains is slop-FEEL, and it is now located precisely: it is not the
writing (which is good) and not the module structure (which genuinely varies)
- it is ONE interaction type doing 38% of the work. That is a bounded,
fixable problem, and this review says exactly how.

---

## Q1-Q3: Consistency, usability, formatting - PASS (with one defect)

VERIFIED GREEN AND CAREFUL:
- 82 lessons lint clean; 98 canon assertions + 31 recomputed derivations; map
  lint passes both projects; build clean. Drift is mechanically prevented.
- W2 (the real-laptop page-scroll) is FIXED: at 1366x650 the smallest quiz
  now measures 650 === 650 with a genuine `max-height:719px` compact mode
  active (header collapses, paddings step down). Measured live.
- W3 (hidden design evidence) is FIXED with a proper shared component,
  ScrollArea.jsx: opacity-driven fade + "Scroll for more" hint that show only
  while `scrollable && !atEnd`, with a ResizeObserver + rAF re-measure to
  catch flex layout resolving a frame late. This is engineering, not a patch.
- W4 (human moments) is FIXED: first-run welcome ("Nothing you make is
  throwaway"), a tier-completion card ("You built the whole Easy workflow" +
  Download / Try Medium / Keep exploring), an Export button, and the stats row
  no longer shows builder-facing "lessons defined" - it shows tier progress.
- The realWorld tool mappings are technically correct and concept-specific
  ({**note, **flag} for conflict-merge, pdfplumber for invoice OCR, a
  (vendor, number, amount) key set for dedupe). The TOOL_MAP.md files state
  the transfer thesis outright: "the skill is recognizing which kind of action
  each step needs... the specific product is interchangeable." That is the
  single best teaching sentence in the project.

ONE CONSISTENCY DEFECT (fixed in this commit): NEXT_SESSION_PROMPT.md still
described phases G0-G3 as the queue, but all four are shipped. A stale handoff
prompt is exactly what misdirected a builder before (the Copilot stale-prompt
incident). Refreshed to the true frontier: owner ship-actions pending, then
Module 3 under the anti-slop guidance below.

## Q4: Will people actually learn to BUILD automations? - YES, now

Before the patch this was the deepest wound (learners simulated automations
but only ever built one for real). It is now materially answered:
- Every lesson's takeaway carries a "Do it for real" realWorld beat: the
  by-hand version plus the Power Automate / Zapier / Python equivalent.
- Per-module solo-rebuild capstones are now MANDATORY (playbook Step 7a,
  charter index), and Module 2's was added retroactively.
- The tool maps turn the whole module into a transfer cheat-sheet.

A learner who finishes now leaves knowing the eight invariant moves AND the
concrete tool feature each maps to. That clears the owner's bar. (Honest
caveat, unchanged from the prior audit: "EVERYTHING about automation" still
has genuinely unscheduled territory - credentials/secrets, testing, when NOT
to automate, maintenance/handover. The recommended one "field notes" wrap
lesson per module from Module 3 on still stands.)

## Q5: Will the module system feel like AI slop? - THE REAL ANSWER

Slop is when structure is identical and only the nouns change. I stress-tested
that claim against the actual repo. Verdict: the atoms are high quality; the
risk is entirely in ONE repeated modality.

WHAT IS NOT SLOP (evidence):
- The copy has voice and specificity, not generated filler. Section titles
  like "The cheapest error to prevent" and "Judgment becomes data"; capability
  statements that each say something true about THAT node ("rule out paying any
  invoice twice," "trust who Northwind Fasteners is and where their payments
  are sent"). No two are interchangeable.
- The maps are genuinely different shapes: Module 1 runs
  source-source-artifact-source-... with 3 handoffs and 3 transformations;
  Module 2 runs source-artifact-reference-reference-... with 5 handoffs and 2
  transformations. Not a reskin.
- The canon rigor means every number is real and cross-checked.

WHAT IS THE SLOP RISK (precise, measured):
1. THE 38% QUIZ PROBLEM. 31 of 82 lessons use choiceCheck - a 4-question
   multiple-choice quiz with one fixed layout - and it is the DEFAULT for
   every inspection node and every handoff node. Multiple-choice-after-reading
   is the exact texture of 2010-era corporate compliance e-learning; it is the
   thing people point at when they say "AI slop course." The content behind
   each quiz varies, but the learner's HANDS do the same thing 31 times: read,
   click a radio, click Validate. This is the number-one reason a human could
   start to feel the product go flat somewhere around Module 3-4.
2. THE SILENT SKELETON. Every module rhymes: intake -> policy/reference ->
   transform -> ONE decision fork -> handoffs -> assembly -> archive loop. This
   is intentional and true (workflows ARE structurally alike - that is the
   deepest lesson). But the app never NAMES the recurrence, so it is
   experienced as repetition instead of revelation. A learner opening Module 3
   should be met with "you have seen this shape before - that is the point,"
   not left to quietly notice the template.
3. Minor, additive: the takeaway is the same five beats every lesson
   (heading -> points -> realWorld -> capability -> continue), and every node
   has the same easy/medium/hard triple. Individually fine, collectively
   metronomic.

### The anti-slop plan (bounded; fold into Module 3 and backfill)

A. BREAK THE QUIZ MONOPOLY (biggest lever). The spend-or-justify budget exists
   but Module 2 spent zero new interactions, so nothing changed yet. Make it
   bite: give inspection and handoff nodes at least one ACTIVE alternative to
   the quiz so choiceCheck drops from ~38% toward ~20%. Two candidates, both
   small engine adds under the existing spec process:
   - a "tag the source" interaction (inspection): the learner highlights/labels
     which parts of a raw document are the fields, instead of answering trivia
     about it - this is what real intake design feels like.
   - a "capture the handoff record" mini-form (handoff): fill the who/what/when
     of the handoff, not multiple-choice about it.
   Rule to enforce at the Module 3 map gate: no more than ~1 in 4 lessons may
   be choiceCheck; log the count in DECISION_LOG. This turns the existing (but
   toothless) budget rule into a measured cap.
B. NAME THE RECURRENCE. Add a one-screen "you have seen this shape before"
   moment at each new module's start (Module 2+), mapping the new module's
   nodes onto Meridian's skeleton. Converts the template from a liability into
   the payoff. Cheap: one intro card per module, data-driven.
C. VARY THE TAKEAWAY RHYTHM occasionally - e.g. lead some takeaways with the
   realWorld beat, or with a one-line "what would break if you skipped this
   step." Low priority; do only if A and B do not already refresh the feel.

None of this is a rewrite. The content is good; it needs one more pair of hands
for the learner to use and one honest moment of self-awareness per module.

## What must NOT change (measured excellence, unchanged)

The canon+derivation system, the unlock tree, the tier postures, the copy
voice, the realWorld/tool-map transfer layer, the ScrollArea and compact-mode
engineering, and the governance discipline (this patch cycle logged every
phase and parked the owner actions correctly). This is a genuinely good
product one interaction type away from not feeling like a template.
