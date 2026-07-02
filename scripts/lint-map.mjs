// Map-topology lint. Run with: npm run lint:map (part of npm run check).
//
// Enforces the map guardrails from MODULE_AUTHORING_PLAYBOOK.md Step 2 and
// the unlock-tree invariants, so a builder cannot ship a malformed map or a
// broken LESSON_PREREQS tree. Under AUTONOMY_CHARTER.md gate 3, a map that
// passes this lint AND conforms to its ratified charter is approved.
//
// Checks:
//  1. Nodes: unique ids, valid taxonomy types, thingOrAction present,
//     phaseId resolves; node count in guardrails (error <12 or >20,
//     warn outside 15-18).
//  2. Edges: endpoints exist, no self-edges.
//  3. Exactly one decision-type node, with >= 2 outgoing edges (the fork).
//  4. At least one temporal-loop edge (archive-type -> reference/source),
//     and the graph is acyclic once archive-origin edges are removed.
//  5. Unlock tree (LESSON_PREREQS): keys exactly = task-bearing node ids,
//     prereq values are keys, exactly one root, acyclic, all reachable
//     from the root.
//  6. LESSON_PATH: same membership as the tree, and a valid topological
//     order of it.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nodes = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'workflowNodes.json'), 'utf8'))
const edges = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'workflowEdges.json'), 'utf8'))
const phases = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'phases.json'), 'utf8'))
const progressSource = readFileSync(path.join(root, 'src', 'lib', 'progress.js'), 'utf8')

const VALID_TYPES = ['source', 'reference', 'artifact', 'process', 'decision', 'handoff', 'output', 'archive']

let errors = 0
let warnings = 0
const err = (msg) => { errors++; console.log(`ERROR ${msg}`) }
const warn = (msg) => { warnings++; console.log(`warn  ${msg}`) }

// 1. Nodes
const ids = new Set()
const phaseIds = new Set(phases.map((p) => p.id))
for (const n of nodes) {
  if (ids.has(n.id)) err(`duplicate node id "${n.id}"`)
  ids.add(n.id)
  if (!VALID_TYPES.includes(n.type)) err(`node "${n.id}" has invalid type "${n.type}"`)
  if (!n.thingOrAction) err(`node "${n.id}" missing thingOrAction`)
  if (!phaseIds.has(n.phaseId)) err(`node "${n.id}" phaseId "${n.phaseId}" not in phases.json`)
}
if (nodes.length < 12 || nodes.length > 20) err(`node count ${nodes.length} outside hard bounds 12-20`)
else if (nodes.length < 15 || nodes.length > 18) warn(`node count ${nodes.length} outside guardrail 15-18`)

// 2. Edges
for (const e of edges) {
  if (!ids.has(e.from)) err(`edge from unknown node "${e.from}"`)
  if (!ids.has(e.to)) err(`edge to unknown node "${e.to}"`)
  if (e.from === e.to) err(`self-edge on "${e.from}"`)
}

// 3. The fork
const typeOf = Object.fromEntries(nodes.map((n) => [n.id, n.type]))
const decisions = nodes.filter((n) => n.type === 'decision')
if (decisions.length !== 1) err(`expected exactly 1 decision node, found ${decisions.length} (${decisions.map((d) => d.id).join(', ') || 'none'})`)
for (const d of decisions) {
  const out = edges.filter((e) => e.from === d.id).length
  if (out < 2) err(`decision node "${d.id}" has ${out} outgoing edge(s); a fork needs >= 2`)
}

// 4. Temporal loop + acyclicity without it
const temporalEdges = edges.filter(
  (e) => typeOf[e.from] === 'archive' && (typeOf[e.to] === 'reference' || typeOf[e.to] === 'source')
)
if (temporalEdges.length < 1) err('no temporal-loop edge (archive -> reference/source) found')
const forwardEdges = edges.filter((e) => typeOf[e.from] !== 'archive')

function findCycle(edgeList, nodeIds) {
  const adj = {}
  nodeIds.forEach((id) => { adj[id] = [] })
  edgeList.forEach((e) => { if (adj[e.from]) adj[e.from].push(e.to) })
  const state = {} // 0 unseen, 1 in-stack, 2 done
  let cycle = null
  function dfs(id) {
    if (cycle) return
    state[id] = 1
    for (const next of adj[id] || []) {
      if (state[next] === 1) { cycle = `${id} -> ${next}`; return }
      if (!state[next]) dfs(next)
    }
    state[id] = 2
  }
  nodeIds.forEach((id) => { if (!state[id]) dfs(id) })
  return cycle
}
const cyc = findCycle(forwardEdges, Array.from(ids))
if (cyc) err(`cycle in non-temporal edges (near ${cyc}); only archive-origin edges may point backward`)

// 5. Unlock tree (extract from progress.js source; it imports app JSON so
//    cannot be imported under plain node)
function extractPrereqs() {
  const block = progressSource.match(/export const LESSON_PREREQS = \{([\s\S]*?)\n\}/)
  if (!block) return null
  const map = {}
  for (const m of block[1].matchAll(/'([\w-]+)':\s*\[([^\]]*)\]/g)) {
    map[m[1]] = Array.from(m[2].matchAll(/'([\w-]+)'/g)).map((x) => x[1])
  }
  return map
}
function extractPath() {
  const block = progressSource.match(/export const LESSON_PATH = \[([\s\S]*?)\]/)
  if (!block) return null
  return Array.from(block[1].matchAll(/'([\w-]+)'/g)).map((x) => x[1])
}

const prereqs = extractPrereqs()
const lessonPath = extractPath()
const taskNodeIds = new Set(nodes.filter((n) => n.taskId).map((n) => n.id))

if (!prereqs) err('could not extract LESSON_PREREQS from progress.js')
else {
  const keys = new Set(Object.keys(prereqs))
  taskNodeIds.forEach((id) => { if (!keys.has(id)) err(`task node "${id}" missing from LESSON_PREREQS`) })
  keys.forEach((id) => { if (!taskNodeIds.has(id)) err(`LESSON_PREREQS key "${id}" is not a task-bearing node`) })
  for (const [k, vals] of Object.entries(prereqs)) {
    vals.forEach((v) => { if (!keys.has(v)) err(`prereq "${v}" of "${k}" is not a LESSON_PREREQS key`) })
  }
  const roots = Object.entries(prereqs).filter(([, v]) => v.length === 0).map(([k]) => k)
  if (roots.length !== 1) err(`unlock tree must have exactly 1 root, found ${roots.length} (${roots.join(', ')})`)
  // acyclic + reachability (treat prereq edges as prereq -> lesson)
  const treeEdges = []
  for (const [k, vals] of Object.entries(prereqs)) vals.forEach((v) => treeEdges.push({ from: v, to: k }))
  const treeCycle = findCycle(treeEdges, Object.keys(prereqs))
  if (treeCycle) err(`unlock tree has a cycle (near ${treeCycle})`)
  if (roots.length === 1) {
    const reached = new Set([roots[0]])
    let grew = true
    while (grew) {
      grew = false
      for (const [k, vals] of Object.entries(prereqs)) {
        if (!reached.has(k) && vals.every((v) => reached.has(v))) { reached.add(k); grew = true }
      }
    }
    Object.keys(prereqs).forEach((k) => { if (!reached.has(k)) err(`lesson "${k}" is unreachable from the unlock root`) })
  }
}

// 6. LESSON_PATH
if (!lessonPath) err('could not extract LESSON_PATH from progress.js')
else if (prereqs) {
  const pathSet = new Set(lessonPath)
  if (pathSet.size !== lessonPath.length) err('LESSON_PATH contains duplicates')
  Object.keys(prereqs).forEach((k) => { if (!pathSet.has(k)) err(`"${k}" in LESSON_PREREQS but not LESSON_PATH`) })
  lessonPath.forEach((k) => { if (!(k in prereqs)) err(`"${k}" in LESSON_PATH but not LESSON_PREREQS`) })
  const seen = new Set()
  for (const id of lessonPath) {
    for (const pre of prereqs[id] || []) {
      if (!seen.has(pre)) err(`LESSON_PATH is not topological: "${id}" appears before its prereq "${pre}"`)
    }
    seen.add(id)
  }
}

console.log(`\nmap lint: ${nodes.length} nodes, ${edges.length} edges, ${errors} errors, ${warnings} warnings`)
process.exit(errors === 0 ? 0 : 1)
