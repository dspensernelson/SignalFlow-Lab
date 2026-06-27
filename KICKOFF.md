# SignalFlow Lab — Build Kickoff

> Historical note: this file kicked off the accepted MVP baseline. The current post-MVP product direction lives in `PRODUCT_DOCTRINE.md` and `PROCESS_MAP_CURRICULUM_DIRECTION.md`.

You are building **SignalFlow Lab**, a local React learning app. This file tells you how to start. The full requirements live in `signalflow-lab-mvp-spec-v2.md` — that spec is the source of truth.

## Your job

Build the MVP exactly as described in `signalflow-lab-mvp-spec-v2.md`. Read that file in full before writing any code.

## Read these first, in this order

1. `signalflow-lab-mvp-spec-v2.md` — the complete build spec. Follow it literally.
2. `PROJECT_CONTEXT.md` — background and product intent.

## Rules of engagement

- **Build in the order listed** in the spec's "Build Order" section. Do not jump ahead.
- **Stop when the Acceptance Criteria are met.** Do not keep adding features.
- **Do not add anything not in the spec.** If the spec doesn't ask for it, don't build it. The "Do Not Build" list is binding.
- **When the spec is explicit, follow it exactly** — this is especially true for the Matching Rules, the localStorage key names (`signalflow_progress`, `signalflow_artifacts`), and the validator return shape.
- **If something is genuinely ambiguous, pick the simplest option** that satisfies the Acceptance Criteria, leave a short `// NOTE:` comment explaining the choice, and keep going. Do not invent scope to resolve ambiguity.

## What "done" looks like

The build is complete when all 18 Acceptance Criteria in the spec pass. The headline checks:

- App opens to the Project Canvas with all five Meridian workflow nodes visible.
- Intake is `ready`; the other four are `locked`.
- Clicking Intake opens Lesson 1, loaded from JSON.
- Invalid JSON, missing fields, and wrong values each fail with clear per-rule feedback.
- A correct answer passes, saves the user's parsed JSON as the artifact, marks Intake `complete`, and unlocks Structure as `ready`.
- Completed Intake shows View Artifact; the Artifact Viewer shows the saved JSON.
- The Copilot Prompt Coach card's Copy button works.
- Progress survives a page refresh (localStorage).
- Layout stays usable on a smaller laptop viewport.

## First commands

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then configure Tailwind per the spec's stack section and start at Build Order step 1.

## When you finish

Run `npm run dev`, walk through the Acceptance Criteria manually, and confirm a full pass before reporting done. Use the "Example Correct Answer for Manual Testing" at the bottom of the spec to verify the happy path.
