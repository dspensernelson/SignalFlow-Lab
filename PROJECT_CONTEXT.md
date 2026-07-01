# SignalFlow Lab Context

SignalFlow Lab is a local React learning app for practicing workplace automation.

The first project is **Meridian Morning Market Brief**: a fictional energy-market workflow where the user builds an automation that turns messy overnight market inputs into an approval-ready 7:00 AM brief.

## Core Product Idea

- Purpose: learn automation by building real workflows, one useful artifact at a time.
- The process map is the curriculum.
- Learners click real workflow nodes, complete short tasks, and see sources, artifacts, reuse, decisions, and handoffs update on the map.
- The app teaches where work comes from, how it is obtained, what access is needed, what is simulated locally, and how a solo builder could recreate the workflow.
- Short tasks build durable artifacts inside a larger workflow graph.
- The app should feel like a Microsoft-style training workspace, not a game or marketing site.

## MVP Stack

- React + Vite
- Tailwind CSS
- Local JSON data
- localStorage for progress and artifacts
- No backend
- No login
- No database
- No AI grading
- No real Microsoft or energy-market integrations

## Accepted MVP Baseline

The historical MVP was accepted against `signalflow-lab-mvp-spec-v2.md`: one complete Intake lesson, local JSON data, localStorage progress/artifacts, deterministic JSON validation, saved artifact viewing, and stubbed downstream workflow context.

## Current Architecture

- Phase-banded workflow graph driven by `src/data/phases.json`, `src/data/workflowNodes.json`, and `src/data/workflowEdges.json`.
- Buildable task nodes are tracked in localStorage under `signalflow_progress`; artifacts are stored under `signalflow_artifacts`; theme preference is stored under `signalflow_theme`.
- The current interactive tasks are `lesson-intake`, attached to `market-intake-record`; `lesson-threshold-policy`, attached to `threshold-policy`; `lesson-clean-price-data`, attached to `clean-price-data`; and `lesson-variance-check`, attached to `variance-check`.
- Every workflow node has a lesson intent; only nodes with built task IDs are completion-tracked today.
- Future interactive nodes remain visible but locked/stubbed.
- Lesson flow follows Intro -> Exercise -> Takeaway.

## Visual System

- The app is reskinned to the design system in `Mock Ups/SignalFlow Lab Design System/`. Tokens live in `src/styles/tokens/` and are imported in `src/index.css` before Tailwind; `tailwind.config.js` maps them to `sf.*` classes via `var(--sf-*)`.
- Light and dark themes are supported via a persisted toggle (`signalflow_theme`, applied as `data-theme` by `src/lib/theme.js`).
- Reusable UI primitives live in `src/components/ui/`. Signal flow is the core visual metaphor: `SignalFlowDiagram` converges upstream inputs into the central artifact and fans out to downstream consumers, colored by DS edge semantics.
- Hard rule: Exercise/workbench screens must not page-scroll at innerHeight >= 800 in any state, including the wrong-answer state. Intro and Takeaway may scroll. See `AGENTS.md` and `PRODUCT_DOCTRINE.md`.

## Next Direction

See `PRODUCT_DOCTRINE.md` and `PROCESS_MAP_CURRICULUM_DIRECTION.md` for the current canvas direction.

The short version: keep tasks focused, but make the canvas a realistic workflow blueprint with source provenance, access context, reusable artifacts, decisions, handoffs, and solo rebuild paths.

## Implementation Spec

Use `signalflow-lab-mvp-spec-v2.md` as the historical accepted MVP spec. Use `PRODUCT_DOCTRINE.md` and `PROCESS_MAP_CURRICULUM_DIRECTION.md` for current post-MVP direction.

When using GitHub Copilot, instruct it to:

1. Build in the order listed in the spec.
2. Stop after the acceptance criteria are met.
3. Avoid adding anything not requested in the spec.
