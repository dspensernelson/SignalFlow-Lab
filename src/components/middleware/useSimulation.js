import { useEffect, useMemo, useReducer } from 'react'

// In-memory simulation player for a scenario (src/data/middleware/scenarios).
// State is { index, playing }: index -1 means nothing has happened yet. Node
// states and counters are folded from every step up to the index, so a
// "held" gate set in step 3 stays held through step 5 unless a later step
// overrides it. Nothing here is persisted.

function reducer(state, action) {
  switch (action.type) {
    case 'play':
      return { index: state.index >= action.last ? 0 : Math.max(state.index, 0), playing: true }
    case 'pause':
      return { ...state, playing: false }
    case 'forward':
      return { index: Math.min(state.index + 1, action.last), playing: state.playing && state.index + 1 < action.last }
    case 'back':
      return { index: Math.max(state.index - 1, -1), playing: false }
    case 'reset':
      return { index: -1, playing: false }
    case 'end':
      return { ...state, playing: false }
    default:
      return state
  }
}

export function useSimulation(scenario) {
  const steps = useMemo(() => scenario?.steps || [], [scenario])
  const last = steps.length - 1
  const [state, dispatch] = useReducer(reducer, { index: -1, playing: false })

  // Restart when the scenario changes.
  useEffect(() => {
    dispatch({ type: 'reset' })
  }, [scenario?.id])

  // Advance on a timer while playing; stop at the end.
  useEffect(() => {
    if (!state.playing) return undefined
    if (state.index >= last) {
      dispatch({ type: 'end' })
      return undefined
    }
    const current = steps[Math.max(state.index, 0)]
    const timer = setTimeout(() => dispatch({ type: 'forward', last }), current?.durationMs || 1200)
    return () => clearTimeout(timer)
  }, [state.playing, state.index, steps, last])

  const derived = useMemo(() => {
    const nodeStates = {}
    const counters = {}
    const visitedEdges = new Set()
    for (let i = 0; i <= state.index && i < steps.length; i += 1) {
      const s = steps[i]
      Object.assign(nodeStates, s.nodeStates || {})
      Object.assign(counters, s.counters || {})
      if (s.from && s.to && s.from !== s.to) visitedEdges.add(`${s.from}->${s.to}`)
    }
    return { nodeStates, counters, visitedEdges }
  }, [state.index, steps])

  return {
    steps,
    index: state.index,
    playing: state.playing,
    step: state.index >= 0 ? steps[state.index] : null,
    atEnd: state.index >= last,
    ...derived,
    play: () => dispatch({ type: 'play', last }),
    pause: () => dispatch({ type: 'pause' }),
    stepForward: () => dispatch({ type: 'forward', last }),
    stepBack: () => dispatch({ type: 'back' }),
    reset: () => dispatch({ type: 'reset' }),
  }
}
