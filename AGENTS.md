## Project instructions

> Entry point: start at BUILDER_KICKOFF.md, then FLOW_MODULE_PLAYBOOK.md.
> Run `npm run check` before every commit.

## HARD RULE: simple, polished, minimal text (owner, 2026-09-29)

Whoever uses this should feel it is a super simple way to learn - clean, not
overbearing. On every screen:

- One short line tells the learner what to do (a build's `brief`). Story,
  rules and hints sit behind a disclosure until asked for.
- Feedback is ONE prioritized "Fix this next" line plus a compact checklist
  (failing checks first, passing ones folded into one line) - never a stack
  of explanations.
- When adding something to a screen, remove or compact something else.
  Compactness wins over extra detail.

## Layout

The flow builder may scroll inside its panels (a flow and its run trace grow),
but the page itself must not scroll at 1280x720 or larger.
