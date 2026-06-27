# Builder Review Notes

Use this as a running PM/red-team notebook while the builder works.

## Current Folder Review

- Original source docs are still present: `KICKOFF.md`, `PROJECT_CONTEXT.md`, and `signalflow-lab-mvp-spec-v2.md`.
- Vite scaffold files are present in the main workspace.
- Tailwind config files are present: `tailwind.config.js` and `postcss.config.js`.
- `src/index.css` contains the Tailwind directives.
- `src/App.jsx` has been replaced by the SignalFlow Lab app.

## Questions To Ask The Builder

- Did you preserve the markdown docs during scaffold setup?
- Are `src/data/phases.json`, `src/data/workflowNodes.json`, and `src/data/workflowEdges.json` the source of static workflow metadata?
- Are progress and artifacts stored under the exact localStorage keys from the spec?
- Does failed validation keep `Market Intake Record` as `in-progress`?
- Does successful validation save the user's submitted parsed JSON as the artifact?
- Does completing Intake mark `Market Intake Record` complete while non-built future task nodes remain locked/stubbed?
- Does completing Threshold Policy save `threshold-policy.json` and mark `Threshold Policy` complete?
- Did you manually verify the current PM acceptance punchlist before calling the pass done?

## Watch Items

- Do not add React Router.
- Do not add backend, login, database, or AI grading.
- Do not invent lessons 2-5.
- Do not turn the app into a marketing landing page.
- Do not hardcode the successful artifact separately from the user's answer.

## Next Direction Watch Items

- The next pass should follow `PROCESS_MAP_CURRICULUM_DIRECTION.md`.
- The map itself should be the curriculum: users click workflow nodes and complete short tasks.
- Show provenance: where inputs come from, how they are obtained, what access is needed, and what the lab simulates.
- Show reuse: which artifacts feed downstream workflow nodes.
- Keep real integrations as explanatory context for now; do not implement API calls, credentials, or external systems.
- Keep the graph readable without horizontal scrolling where possible; phases should annotate the workflow rather than cage it.
