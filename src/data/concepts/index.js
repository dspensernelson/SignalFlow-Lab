// Concept registry: every rosetta and waypoint JSON, keyed by id. The files
// are data; src/runtime/concepts.js turns one into a synthetic module the
// engine runs. Tests read the same files from disk (scripts/test-runtime.mjs).

const rosettaFiles = import.meta.glob('../rosettas/*.json', { eager: true })
const waypointFiles = import.meta.glob('../waypoints/*.json', { eager: true })

function collect(files, kind) {
  const out = {}
  for (const mod of Object.values(files)) {
    const c = mod.default || mod
    if (c && c.id) out[c.id] = { kind, ...c }
  }
  return out
}

export const CONCEPTS = { ...collect(rosettaFiles, 'rosetta'), ...collect(waypointFiles, 'waypoint') }

export function getConcept(id) {
  return CONCEPTS[id] || null
}

export function conceptLabel(id) {
  const c = CONCEPTS[id]
  return c ? c.label : id
}
