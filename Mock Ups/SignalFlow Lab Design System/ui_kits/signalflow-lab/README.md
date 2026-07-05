# SignalFlow Lab — UI Kit

An interactive recreation of **SignalFlow Lab's** core product surfaces for the
*Meridian Morning Market Brief* project. Built from the source repo
(`dspensernelson/SignalFlow-Lab`) and the reference screenshots — it composes this design
system's component primitives rather than re-implementing them.

## Run it
Open `index.html`. It loads React + Babel, the compiled `_ds_bundle.js`, the workflow data,
and the screen modules. (If the canvas is blank, the design-system bundle hasn't compiled
yet — reopen after the system finishes building.)

## What's interactive
- **Workflow Map (home).** The phase-banded dependency graph. Click any node to select it —
  the right-rail **detail panel** updates and the canvas highlights relationships (blue =
  feeds-into / downstream, amber = depends-on / upstream); unrelated nodes fade. Connectors
  are measured live from the laid-out nodes.
- **Light / Dark.** The top-bar `ThemeToggle` flips `data-theme` on the app root.
- **Lesson flow.** Select **Market Intake Record** → *Start lesson* to enter the
  Intro → Exercise → Takeaway `LessonWorkspace`. The Exercise has a real JSON editor with
  **deterministic validation** against the analyst note; passing marks the node **complete**
  and unlocks the **Artifact Viewer** (*View artifact*).
- **Start Over** resets progress.

> Only the **Intake** lesson is wired end-to-end (it's the one fully-built lesson in the
> source MVP). Other buildable nodes (Threshold Policy, Clean Price Data) show as *Ready*
> and the rest as *Context* / *Upcoming*, mirroring the real product state.

## Files
- `index.html` — entry + script wiring (also tagged as a Design System card + Starting Point).
- `workflowData.js` — the 17 nodes, 5 phases, 23 edges, and the Intake lesson (from the repo's JSON).
- `WorkflowMap.jsx` — top bar, project header, phase-banded canvas with measured SVG edges, workflow-health bar.
- `NodeDetailPanel.jsx` — the selected-node right rail (provenance, concepts, reuse, governance, actions).
- `LessonWorkspace.jsx` — the three-step lesson, JSON validation, field guide, Copilot prompt coach.
- `App.jsx` — theme, view routing, and progress state.

## Fidelity notes
- Colors, type, spacing, node taxonomy, and copy are lifted from the source. The MVP code is
  light-only; the **dark theme** and the richer **top-bar / health-bar chrome** follow the
  user's reference screenshots.
- Components used from the system: `WorkflowNode`, `Logo`, `ThemeToggle`, `Button`, `Badge`,
  `Chip`, `Card`, `SectionLabel`, `StatItem`, `Stepper`, `CodeBlock`, `FieldGuideRow`,
  `ValidationRow`, `Icon`.
