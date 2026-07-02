# SignalFlow Lab

SignalFlow Lab is a local React learning app for practicing workplace automation by rebuilding real workflow maps one useful artifact at a time.

The first project is **Meridian Morning Market Brief**, a fictional energy-market workflow that turns messy overnight market inputs into an approval-ready 7:00 AM brief.

## Current Status (2026-07-01, second pass - module-01-tiers)

Where things stand if you are picking this back up:

- **Module 1 Easy is COMPLETE: all 17 lessons buildable and passing.** Six new
  jsonEditor lessons reuse the four frozen validators; six inspection/
  interpretation lessons use the new `choiceCheck` quiz interaction; the
  Morning Brief capstone uses the new `templateSlots` assembly interaction
  (artifact shelf + inline template slots, renders market-brief.md).
- **Difficulty tiers are live**: Easy / Medium / Hard switch in the app bar.
  Each tier has independent progress and artifacts (`signalflow_progress_medium`
  etc.; Easy keeps the legacy keys). Tier lesson variants resolve by convention:
  `lesson-intake` -> `lesson-intake-medium` / `lesson-intake-hard`.
- **Medium tier: COMPLETE - 17 of 17 built** on a messier canon (conflicting
  notes, explicit nulls, dropped rows, policy v1.1.0 at 6/14, negative
  boundary case, out-of-office delegation, exception-surfacing brief). Canon:
  `curriculum/module-01/medium/_OVERVIEW.md`.
- **Hard tier: 7 built - the full curated drill set** (schema v2 migration,
  threshold design from history, feed-failure handling, escalation ladder,
  classify-under-quarantine, degraded brief, retention design). Only the
  solo-rebuild capstone remains: `curriculum/module-01/hard/_OVERVIEW.md`.
- **Lessons are force-ordered**: one lesson is READY at a time and completing
  it unlocks the next (LESSON_PATH in src/lib/progress.js; locking is derived,
  never stored). Locked nodes name the lesson that unlocks them.
- **No-scroll hard rule** verified live at 1280x800 in wrong-answer states for
  the new interaction types (and previously for the original four lessons).
- **Branches/PRs**: PR #1 = `takeaway-workflow-diagram` -> `main` (redesign +
  curriculum docs). PR #2 = `module-01-tiers` -> `takeaway-workflow-diagram`
  (all implementation above). The live Vercel site is from an earlier build;
  redeploy is intentionally out of scope.
- **Next candidates**: the Hard solo-rebuild capstone (needs an
  artifact-import surface - the last piece of Module 1), then the deferred
  node splits (NODE_AUDIT items 2-3) and Module 2 scoping.

## Current Product Model

- The process map is the curriculum; the 10-module long-range plan lives in
  `CURRICULUM_MASTER_PLAN.md` (scenario-based modules x easy/medium/hard).
- The canvas is a phase-banded workflow graph with sources, references, artifacts, processes, decisions, handoffs, outputs, and archive nodes.
- Learners click workflow nodes to inspect provenance, lab simulation, access needs, reuse, and solo rebuild context.
- All 17 Module 1 nodes are buildable at Easy; Medium/Hard variants unlock per node as they are authored.
- The interface follows the `Mock Ups/SignalFlow Lab Design System/` tokens and ships a persisted light/dark theme toggle.

## Run Locally

```powershell
npm install
npm run dev
```

Vite usually starts on port 5173 and may fall back to 5174 if 5173 is in use.

## Validate

```powershell
npm run lint
npm run build
```

## Key Docs

- `CURRICULUM_MASTER_PLAN.md` - the 10-module / 3-tier long-range plan, learning theory, engine roadmap, and builder handoff protocol.
- `ENGINE_ADDITIONS_SPEC.md` - spec for the choiceCheck and templateSlots interaction types (implemented).
- `curriculum/module-01/` - per-tier overviews (canon data, status) and the 13 Easy lesson scripts the built lessons came from.
- `PRODUCT_DOCTRINE.md` - purpose, guiding principles, progression model, and quality bar.
- `PROCESS_MAP_CURRICULUM_DIRECTION.md` - current phase-graph direction.
- `PROJECT_CONTEXT.md` - product context, implementation boundaries, and visual system.
- `DECISION_LOG.md` - dated record of product and implementation decisions.
- `LESSON_DESIGN_FRAMEWORK.md` - lesson design method, screen templates, the no-scroll rule, and the session handoff.
- `NODE_AUDIT.md` - per-node curriculum audit (statuses reflect the pre-build state; see its top note).
- `signalflow-lab-mvp-spec-v2.md` - historical accepted MVP spec.
