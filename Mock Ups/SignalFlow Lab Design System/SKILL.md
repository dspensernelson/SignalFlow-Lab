---
name: signalflow-lab-design
description: Use this skill to generate well-branded interfaces and assets for SignalFlow Lab, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the SignalFlow Lab workplace-automation learning app (the Meridian Morning Market Brief workflow).
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

SignalFlow Lab is a Microsoft-style workplace-automation **learning workspace**: a
phase-banded workflow map (sources → references → artifacts → processes → decisions →
handoffs → outputs → archive) where learners click nodes and build validated JSON artifacts.
The look is clean and dense — one blue accent (`#2563eb`) on neutral grays, native Segoe UI
type, tiny uppercase tracked eyebrow labels, hairline-bordered soft-radius cards, and **eight
node-type accent colors** that carry meaning. It ships **light and dark** themes via
`data-theme="dark"`.

Key files:
- `readme.md` — full visual foundations, content/voice rules, iconography, and the index.
- `styles.css` — the single stylesheet to link; `tokens/` holds the CSS custom properties.
- `components/` — React primitives (`Button`, `Badge`, `Card`, `WorkflowNode`, `Stepper`,
  `CodeBlock`, `Icon`, `Logo`, …), each with a `.d.ts` and `.prompt.md`.
- `guidelines/*.card.html` — foundation specimens (colors, type, spacing, brand).
- `ui_kits/signalflow-lab/` — the interactive Workflow Map + Lesson Workspace recreation.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and
create static HTML files for the user to view. If working on production code, copy assets and
read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.
