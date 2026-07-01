# Decision Log

Short record of product and implementation decisions. Keep entries factual and brief.

## 2026-06-25

- Use React + Vite for the local app scaffold.
- Use Tailwind CSS for styling.
- Keep `signalflow-lab-mvp-spec-v2.md` as the source of truth.
- Keep the MVP limited to one complete lesson: Intake.
- Show Structure, Evaluate, Route, and Brief as workflow nodes, but do not build full lessons for them yet.
- Store runtime progress in `localStorage` under `signalflow_progress`.
- Store artifacts in `localStorage` under `signalflow_artifacts`.
- Use local JSON files for static node and lesson data.
- Avoid React Router for the MVP; use simple React state for view navigation.

## 2026-06-26

- Accepted the MVP baseline and froze MVP scope before starting next-direction work.
- New product direction: the process map is the curriculum.
- The canvas should evolve from a linear lesson row into a realistic workflow blueprint.
- Workflow nodes should explain provenance, real-world sources, access requirements, reuse, and solo rebuild paths.
- Lessons should remain short task bursts inside the larger map, using an Intro -> Exercise -> Takeaway flow.
- Do not add real integrations yet; represent real-world systems as explanatory metadata and local simulations.
- Product doctrine added: purpose, five guiding principles, progression model, map hierarchy, node taxonomy rule, selected node panel contract, and lesson quality bar.
- Current canvas model is a phase-banded dependency graph. Phases annotate the workflow; they should not visually cage it.
- Buildable progress is tied to task nodes and validated artifacts. Source/reference/context nodes can be inspected without being completed.
- `Market Intake Record` is the current buildable artifact node for `lesson-intake`.
- `Threshold Policy` is the second buildable node and teaches governance/config-as-rules through `lesson-threshold-policy`.
- `Clean Price Data` is the third buildable node and teaches normalization/type coercion through `lesson-clean-price-data`; added the additive `jsonRows` validator (top-level array, required row fields, numeric coercion, expected rows present) producing `clean-prices.json`.
- `Variance Check` is the fourth buildable node and teaches derived fields/deltas and material variance through `lesson-variance-check`; added the additive `jsonDeltas` validator (top-level array, expected hub rows present, required delta fields, numeric delta coercion, expected delta values, and an optional boolean `material` flag validated only when included) producing `variance-summary.json`. Chose to store an explicit artifact so Risk Evaluation later consumes an auditable signal instead of recomputing deltas.

## 2026-07-01 (curriculum master plan pass)

- Adopted the 10-module curriculum model: modules are SCENARIO-BASED (different
  business domains), each with easy/medium/hard tiers. Difficulty is depth on the
  SAME workflow map (easy = operate the pattern, medium = handle the mess, hard =
  own the design), not new territory. See CURRICULUM_MASTER_PLAN.md.
- End goal confirmed as personal mastery + portfolio product; commercialization
  stays parked.
- Module 1 Easy = the existing 17-node Meridian map, one lesson per node. The 13
  unbuilt lessons are fully scripted in curriculum/module-01/easy/ with complete
  lesson JSON, ready for a builder.
- Approved two new ADDITIVE interaction types to cover inspection/interpretation
  and assembly lesson types: choiceCheck (deterministic quiz minting a profile
  artifact) and templateSlots (fill a governed template from stored artifacts,
  rendering a string artifact). Spec: ENGINE_ADDITIONS_SPEC.md. Existing validator
  matching rules remain frozen.
- All other new lessons reuse existing validators (jsonDeltas for risk-evaluation
  and approval-decision, jsonPolicy for approval-template, jsonFields for the
  handoff/archive records).
- Canon data for Module 1 fixed in curriculum/module-01/easy/_OVERVIEW.md
  (hubs, prices, forecast, prior day, pct moves, approval at 6:41 AM by the Desk
  Manager, day-1/2/3 decision cases).
- Deferred per NODE_AUDIT: distribution-archive node split and risk-evaluation
  split stay single nodes through Module 1 Easy; revisit before Medium.

## 2026-07-01 (visual / design-system pass)

- Adopted the design system in `Mock Ups/SignalFlow Lab Design System/` as the visual source of truth. Copied its tokens into `src/styles/tokens/` (palette, node-types, typography, spacing, semantic) and import them in `src/index.css` before the Tailwind directives.
- `tailwind.config.js` maps semantic and node-type tokens to `sf.*` utility classes backed by `var(--sf-*)`. Rule: do not use Tailwind `/opacity` modifiers on token colors; use the pre-made `-weak` fill tokens.
- Added a light (default) plus dark theme toggle persisted in localStorage under `signalflow_theme`; `src/lib/theme.js` applies `data-theme` on the document element. This is the third localStorage key alongside `signalflow_progress` and `signalflow_artifacts`.
- Introduced a small in-house UI primitive library under `src/components/ui/` (Button, Badge, Card, Chip, Icon, Stepper, Logo, ThemeToggle, CodeBlock, FlowConnector, SignalFlowDiagram, and more). We reskinned the existing app with these; we did not wholesale-copy the DS component bundle.
- Signal-flow is now the visual language: `SignalFlowDiagram` shows upstream inputs converging into the central artifact and fanning out to downstream consumers, colored by DS edge semantics (upstream/raw amber, downstream/signal cyan, completed/trusted emerald, locked slate dashed).
- Refined connector visual hierarchy so the artifact card is the hero: connectors have an `intensity` prop. Takeaway uses `primary` (the one strong flow moment); Intro, Artifact Viewer, and the workflow strip use `subtle` (thinner, label-free). Arrow strokes and arrowheads were reduced roughly 30-40 percent from the first branching pass.
- Flow labels (RAW SIGNAL / TRUSTED SIGNAL) render as HTML chips that paint on top of the cards with a surface-colored background, so they are never covered by an adjacent card in either theme.
- Reaffirmed the no-scroll hard rule as Exercise/workbench-only: the Exercise screen must not page-scroll at innerHeight >= 800 in the wrong-answer state. Intro and Takeaway may scroll. No visual change touched the Exercise diagram (there is none there), and all four lessons were re-verified at overflow 0.
- No logic, validators, lesson JSON, progress model, or localStorage keys changed during the visual passes. Deployment remains out of scope for these passes (the live Vercel site is from an earlier build).
