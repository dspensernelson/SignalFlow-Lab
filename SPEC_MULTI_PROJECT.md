# SPEC: Multi-Project Support (unblocks Module 2+) - PRE-APPROVED

Ratified 2026-07-02 under AUTONOMY_CHARTER.md gate 7. Implement as written
BEFORE Module 2 content; deviations touching storage keys, the progress
model, or gating beyond this spec are prohibited (park instead). Keep
ASCII-only.

## Purpose

One app, many modules. Each module (project) gets its own map data, lesson
registry, unlock tree, canon, and per-tier storage - switchable from the
header - while Module 1 keeps every legacy key and behavior byte-for-byte.

## Data model

1. `src/data/projects.json` - the registry:
   `[{ "id": "module-01", "name": "Meridian Morning Market Brief",
      "org": "Meridian Energy", "status": "complete" | "active" | "planned" }]`
   Order = build order. Exactly one project may be "active".
2. Per-project data directory `src/data/projects/<id>/` containing
   `workflowNodes.json`, `phases.json`, `workflowEdges.json`, and
   `lessonMeta.json` (`{ "LESSON_PATH": [...], "LESSON_PREREQS": {...} }`).
   MIGRATION: move Module 1's four data files there (plus a new
   lessonMeta.json extracted verbatim from progress.js); keep thin re-export
   shims at the old `src/data/*.json` import paths ONLY if any import is
   missed - preferred is updating all imports in the same commit.
3. Lessons stay flat in `src/data/lessons/` (ids are globally unique);
   `BUILT_LESSON_IDS_BY_TIER` becomes per-project:
   `BUILT_LESSONS[projectId][tier]` in a new `src/lib/projects.js`, which
   also exports `getProjectData(projectId)` (static imports per project,
   same explicit-registry pattern as App's LESSONS map).

## Storage semantics (the frozen part)

- Active project persisted under `signalflow_project` (default
  `module-01`).
- Module 1 keeps ALL legacy keys exactly: `signalflow_progress[_tier]`,
  `signalflow_artifacts[_tier]`, `signalflow_tier`, `signalflow_theme`.
- Every other project namespaces: `signalflow_progress__<projectId>[_tier]`
  and `signalflow_artifacts__<projectId>[_tier]`; tier selection is per
  project: `signalflow_tier__<projectId>`.
- `keyFor` in progress.js becomes project-aware with the module-01 legacy
  exception. No other storage behavior changes.

## progress.js changes

All helpers gain the active project the same way they gained tiers
(module-level read of `signalflow_project`, optional param override,
components unchanged). `isBuildable`, `tierPath`, `effectivePrereqs`,
`deriveNodeStatus`, `getUnlockRequirement` read nodes/prereqs/path from
`getProjectData(activeProject)` instead of static Module 1 imports.
`LESSON_PATH`/`LESSON_PREREQS` re-export Module 1's for back-compat.

## UI

The header's static "Project: Meridian Morning Market Brief" text (with
the decorative chevron) becomes a real dropdown listing registry entries;
"planned" projects render disabled with "coming soon". Switching projects
behaves like switching tiers (swap working set, return to canvas, default
selection = that project's unlock frontier). Per-project completion stat
stays as-is (it derives from the active data).

## Tooling

- `scripts/lint-map.mjs` and `scripts/lint-lessons.mjs` iterate every
  registry project that has data on disk (module-01 now; each new module
  as it lands). Canon path: `curriculum/<projectId>/canon.json`.
- Fixtures file stays global (lesson ids are unique).

## Acceptance

- `npm run check` green; Module 1 storage keys unchanged (verify by
  seeding legacy keys, switching away and back, nothing lost).
- Switcher shows Module 1 complete state and a disabled planned Module 2.
- Live: tier switching within each project independent; unlock frontier
  correct per project; no console errors.
- VERIFICATION_PLAYBOOK.md gains a project-switch check section in the
  same PR.
