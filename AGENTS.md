## Imported Claude Cowork project instructions

> Entry point: start at BUILDER_KICKOFF.md, obey AUTONOMY_CHARTER.md, and run
> `npm run check` before every commit. See .github/copilot-instructions.md.

## HARD RULE: No-scroll Exercise/workbench screens (NON-NEGOTIABLE)

On lesson Exercise/workbench screens, the learner must be able to see the
source/input, the work area, the validation/readiness state, and the next
action together on a standard laptop/desktop viewport. Feedback must not create
a long page-scroll stack while the learner is actively building and fixing the
artifact.

- This is scoped to Exercise/workbench screens. It does NOT mean every page in
  the product can never scroll - Intro and Takeaway may scroll if needed.
- The validation / readiness feedback area must NOT grow off the page when it
  expands. Keep it a fixed, bounded size (inline per-line error chips beside the
  editor PLUS a single prioritized "Fix this next" callout), never an unbounded
  stack of callouts.
- Target: no page scroll on the Exercise screen at a standard desktop/laptop
  viewport (innerHeight >= 800), including the wrong-answer state. Verify by
  checking document.documentElement.scrollHeight === clientHeight after
  validating a WRONG answer (the tallest state).
- When adding content to an Exercise screen, remove or compact something else so
  it still fits. Compactness wins over extra detail.
- This rule is intentionally duplicated in PRODUCT_DOCTRINE.md and
  LESSON_DESIGN_FRAMEWORK.md so it is never lost.
