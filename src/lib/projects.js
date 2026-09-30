// Multi-project registry and per-project static data access.
//
// One app, many modules (projects). Each project owns its workflow map; its
// builds, days and checks live in src/data/flows/<id>.json.
//
// Each project's workflow map (nodes, phases, edges) is statically imported
// here. A new module adds a projects.json entry, a src/data/projects/<id>/
// directory, a PROJECT_DATA entry here, and a flow module in src/data/flows.

import projects from '../data/projects.json'

import module01Nodes from '../data/projects/module-01/workflowNodes.json'
import module01Phases from '../data/projects/module-01/phases.json'
import module01Edges from '../data/projects/module-01/workflowEdges.json'

import module02Nodes from '../data/projects/module-02/workflowNodes.json'
import module02Phases from '../data/projects/module-02/phases.json'
import module02Edges from '../data/projects/module-02/workflowEdges.json'

import module03Nodes from '../data/projects/module-03/workflowNodes.json'
import module03Phases from '../data/projects/module-03/phases.json'
import module03Edges from '../data/projects/module-03/workflowEdges.json'

import module04Nodes from '../data/projects/module-04/workflowNodes.json'
import module04Phases from '../data/projects/module-04/phases.json'
import module04Edges from '../data/projects/module-04/workflowEdges.json'

import module05Nodes from '../data/projects/module-05/workflowNodes.json'
import module05Phases from '../data/projects/module-05/phases.json'
import module05Edges from '../data/projects/module-05/workflowEdges.json'

import module06Nodes from '../data/projects/module-06/workflowNodes.json'
import module06Phases from '../data/projects/module-06/phases.json'
import module06Edges from '../data/projects/module-06/workflowEdges.json'

import module07Nodes from '../data/projects/module-07/workflowNodes.json'
import module07Phases from '../data/projects/module-07/phases.json'
import module07Edges from '../data/projects/module-07/workflowEdges.json'

import module08Nodes from '../data/projects/module-08/workflowNodes.json'
import module08Phases from '../data/projects/module-08/phases.json'
import module08Edges from '../data/projects/module-08/workflowEdges.json'

import module09Nodes from '../data/projects/module-09/workflowNodes.json'
import module09Phases from '../data/projects/module-09/phases.json'
import module09Edges from '../data/projects/module-09/workflowEdges.json'

import module10Nodes from '../data/projects/module-10/workflowNodes.json'
import module10Phases from '../data/projects/module-10/phases.json'
import module10Edges from '../data/projects/module-10/workflowEdges.json'

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
  },
  'module-02': {
    nodes: module02Nodes,
    phases: module02Phases,
    edges: module02Edges,
  },
  'module-03': {
    nodes: module03Nodes,
    phases: module03Phases,
    edges: module03Edges,
  },
  'module-04': {
    nodes: module04Nodes,
    phases: module04Phases,
    edges: module04Edges,
  },
  'module-05': {
    nodes: module05Nodes,
    phases: module05Phases,
    edges: module05Edges,
  },
  'module-06': {
    nodes: module06Nodes,
    phases: module06Phases,
    edges: module06Edges,
  },
  'module-07': {
    nodes: module07Nodes,
    phases: module07Phases,
    edges: module07Edges,
  },
  'module-08': {
    nodes: module08Nodes,
    phases: module08Phases,
    edges: module08Edges,
  },
  'module-09': {
    nodes: module09Nodes,
    phases: module09Phases,
    edges: module09Edges,
  },
  'module-10': {
    nodes: module10Nodes,
    phases: module10Phases,
    edges: module10Edges,
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
