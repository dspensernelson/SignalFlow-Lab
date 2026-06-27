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
