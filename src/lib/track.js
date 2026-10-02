// Top-level learning track. The automation track is the original product
// (projects, tiers, the workflow map); the middleware track is the sibling
// curriculum that teaches the agent-to-business-systems layer. The active
// track is persisted under its own key and never touches any automation
// track storage (signalflow_project, signalflow_progress*, signalflow_tier*).

export const TRACK_KEY = 'signalflow_track'
export const TRACKS = ['automation', 'middleware']
export const DEFAULT_TRACK = 'automation'

export const TRACK_LABELS = {
  automation: 'Automation',
  middleware: 'Middleware',
}

export function loadTrack() {
  try {
    const raw = localStorage.getItem(TRACK_KEY)
    return TRACKS.includes(raw) ? raw : DEFAULT_TRACK
  } catch {
    return DEFAULT_TRACK
  }
}

export function saveTrack(track) {
  if (!TRACKS.includes(track)) return
  try {
    localStorage.setItem(TRACK_KEY, track)
  } catch {
    // ignore write failures (e.g. storage disabled)
  }
}
