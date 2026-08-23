// Multi-project registry and per-project static data access.
//
// One app, many modules (projects). Each project owns its map data, lesson
// registry, unlock tree, canon, and per-tier storage. Module 1 keeps every
// legacy storage key and behavior byte-for-byte (see progress.js keyFor).
//
// Data is statically imported per project using the same explicit-registry
// pattern App uses for its LESSONS map, so the bundler can tree-shake and no
// dynamic path building is needed. New modules add: a projects.json entry, a
// src/data/projects/<id>/ data directory, a PROJECT_DATA entry here, and a
// BUILT_LESSONS[<id>] block.

import projects from '../data/projects.json'

import module01Nodes from '../data/projects/module-01/workflowNodes.json'
import module01Phases from '../data/projects/module-01/phases.json'
import module01Edges from '../data/projects/module-01/workflowEdges.json'
import module01LessonMeta from '../data/projects/module-01/lessonMeta.json'

import module02Nodes from '../data/projects/module-02/workflowNodes.json'
import module02Phases from '../data/projects/module-02/phases.json'
import module02Edges from '../data/projects/module-02/workflowEdges.json'

import module03Nodes from '../data/projects/module-03/workflowNodes.json'
import module03Phases from '../data/projects/module-03/phases.json'
import module03Edges from '../data/projects/module-03/workflowEdges.json'
import module03LessonMeta from '../data/projects/module-03/lessonMeta.json'

export const PROJECT_KEY = 'signalflow_project'
export const DEFAULT_PROJECT = 'module-01'

// The registry (build order). Exactly one project may be "active"/"complete";
// "planned" projects render disabled ("coming soon") in the switcher.
export const PROJECTS = projects

export const PROJECT_IDS = projects.map((p) => p.id)

// Static per-project data. Only projects with data on disk appear here; the
// rest are "planned" registry entries with no working set yet.
const PROJECT_DATA = {
  'module-01': {
    nodes: module01Nodes,
    phases: module01Phases,
    edges: module01Edges,
    lessonMeta: module01LessonMeta,
  },
  'module-02': {
    nodes: module02Nodes,
    phases: module02Phases,
    edges: module02Edges,
    lessonMeta: null, // retired: module-02 is a runnable-flow module (src/data/flows)
  },
  'module-03': {
    nodes: module03Nodes,
    phases: module03Phases,
    edges: module03Edges,
    lessonMeta: module03LessonMeta,
  },
}

// Lessons built per project, per tier. Lesson ids are globally unique and the
// lesson files stay flat in src/data/lessons/. Keep each tier list in sync
// with App's LESSONS map.
export const BUILT_LESSONS = {
  'module-01': {
    easy: [
      'lesson-brief-operations',
      'lesson-intake',
      'lesson-threshold-policy',
      'lesson-clean-price-data',
      'lesson-variance-check',
      'lesson-risk-evaluation',
      'lesson-approval-template',
      'lesson-approval-decision',
      'lesson-approval-route',
      'lesson-routine-update-path',
      'lesson-distribution-archive',
      'lesson-analyst-notes',
      'lesson-trader-flag',
      'lesson-price-feed',
      'lesson-forecast-data',
      'lesson-prior-day-reference',
      'lesson-prior-day-brief-template',
      'lesson-morning-brief',
    ],
    medium: [
      'lesson-brief-operations-medium',
      'lesson-intake-medium',
      'lesson-clean-price-data-medium',
      'lesson-threshold-policy-medium',
      'lesson-variance-check-medium',
      'lesson-risk-evaluation-medium',
      'lesson-approval-decision-medium',
      'lesson-approval-route-medium',
      'lesson-analyst-notes-medium',
      'lesson-trader-flag-medium',
      'lesson-price-feed-medium',
      'lesson-forecast-data-medium',
      'lesson-prior-day-reference-medium',
      'lesson-prior-day-brief-template-medium',
      'lesson-approval-template-medium',
      'lesson-routine-update-path-medium',
      'lesson-morning-brief-medium',
      'lesson-distribution-archive-medium',
    ],
    hard: [
      'lesson-brief-operations-hard',
      'lesson-intake-hard',
      'lesson-threshold-policy-hard',
      'lesson-price-feed-hard',
      'lesson-approval-route-hard',
      'lesson-risk-evaluation-hard',
      'lesson-morning-brief-hard',
      'lesson-distribution-archive-hard',
      'lesson-approval-decision-hard',
    ],
  },
  'module-03': {
    easy: [
      'lesson-onboarding-operations',
      'lesson-signed-offer',
      'lesson-role-profile-catalog',
      'lesson-onboarding-record',
      'lesson-sla-policy',
      'lesson-provisioning-plan',
      'lesson-accounts-task',
      'lesson-hardware-task',
      'lesson-access-task',
      'lesson-payroll-task',
      'lesson-task-tracker',
      'lesson-readiness-gate',
      'lesson-escalation-path',
      'lesson-day-one-package',
      'lesson-manager-handoff',
      'lesson-onboarding-archive',
      'lesson-profile-feedback',
    ],
    medium: [
      'lesson-onboarding-operations-medium',
      'lesson-signed-offer-medium',
      'lesson-role-profile-catalog-medium',
      'lesson-onboarding-record-medium',
      'lesson-sla-policy-medium',
      'lesson-provisioning-plan-medium',
      'lesson-accounts-task-medium',
      'lesson-hardware-task-medium',
      'lesson-access-task-medium',
      'lesson-payroll-task-medium',
      'lesson-task-tracker-medium',
      'lesson-readiness-gate-medium',
      'lesson-escalation-path-medium',
      'lesson-day-one-package-medium',
      'lesson-manager-handoff-medium',
      'lesson-onboarding-archive-medium',
      'lesson-profile-feedback-medium',
    ],
    hard: [
      'lesson-onboarding-operations-hard',
      'lesson-readiness-gate-hard',
      'lesson-sla-policy-hard',
      'lesson-escalation-path-hard',
      'lesson-day-one-package-hard',
      'lesson-accounts-task-hard',
      'lesson-task-tracker-hard',
    ],
  },
}

// True when a project has a working data set (map data) on disk.
export function hasProjectData(projectId) {
  return Boolean(PROJECT_DATA[projectId])
}

// The full working set for a project. Falls back to the default project so
// callers never crash on a stale/unknown persisted id.
export function getProjectData(projectId = DEFAULT_PROJECT) {
  return PROJECT_DATA[projectId] || PROJECT_DATA[DEFAULT_PROJECT]
}

// The registry entry (name/org/status) for a project.
export function getProject(projectId = DEFAULT_PROJECT) {
  return projects.find((p) => p.id === projectId) || projects.find((p) => p.id === DEFAULT_PROJECT)
}

export function loadProject() {
  try {
    const raw = localStorage.getItem(PROJECT_KEY)
    return hasProjectData(raw) ? raw : DEFAULT_PROJECT
  } catch {
    return DEFAULT_PROJECT
  }
}

export function saveProject(projectId) {
  if (hasProjectData(projectId)) localStorage.setItem(PROJECT_KEY, projectId)
}
