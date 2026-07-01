# SignalFlow Lab

SignalFlow Lab is a local React learning app for practicing workplace automation by rebuilding real workflow maps one useful artifact at a time.

The first project is **Meridian Morning Market Brief**, a fictional energy-market workflow that turns messy overnight market inputs into an approval-ready 7:00 AM brief.

## Current Status (2026-07-01)

Where things stand if you are picking this back up:

- **Four lessons are buildable and passing**: Market Intake Record, Threshold Policy, Clean Price Data, Variance Check. All validators, lesson JSON, progress model, and localStorage keys are stable.
- **The app is fully reskinned** to the design system in `Mock Ups/SignalFlow Lab Design System/` (tokens + in-house UI primitives in `src/components/ui/`), with a persisted **light/dark theme** toggle.
- **Signal flow is the visual language**: `SignalFlowDiagram` shows inputs converging into the artifact and fanning out to consumers. Connectors were tuned so the artifact card is the hero (Takeaway = the one strong flow; Intro/Artifact Viewer/strip are subtle). Flow labels sit on top of cards and are never covered.
- **No-scroll hard rule** (Exercise screens, innerHeight >= 800, wrong-answer state) is verified at overflow 0 for all four lessons in both themes.
- **Open work is on branch `takeaway-workflow-diagram`** (PR against `main`). The live Vercel site (https://signal-flow-lab.vercel.app) is from an earlier build; redeploy is intentionally out of scope for this batch.
- **Next candidate**: author Risk Evaluation (fan-in transformation consuming intake, clean prices, variance, and threshold policy). Not started.

## Current Product Model

- The process map is the curriculum.
- The canvas is a phase-banded workflow graph with sources, references, artifacts, processes, decisions, handoffs, outputs, and archive nodes.
- Learners click workflow nodes to inspect provenance, lab simulation, access needs, reuse, and solo rebuild context.
- Four tasks are currently buildable: `Market Intake Record`, `Threshold Policy`, `Clean Price Data`, and `Variance Check`.
- Future nodes are visible with defined lesson intent but remain locked/stubbed until explicitly scoped.
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

- `PRODUCT_DOCTRINE.md` - purpose, guiding principles, progression model, and quality bar.
- `PROCESS_MAP_CURRICULUM_DIRECTION.md` - current phase-graph direction.
- `PROJECT_CONTEXT.md` - product context, implementation boundaries, and visual system.
- `DECISION_LOG.md` - dated record of product and implementation decisions.
- `LESSON_DESIGN_FRAMEWORK.md` - lesson design method, screen templates, and the no-scroll rule.
- `signalflow-lab-mvp-spec-v2.md` - historical accepted MVP spec.
