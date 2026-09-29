// Status of a node on the workflow map, as the map component draws it.
export const STATUS = {
  CONTEXT: 'context', // inspectable source/reference object, nothing to build
  LOCKED: 'locked', // a later build makes it
  READY: 'ready', // the current build makes it
  IN_PROGRESS: 'in-progress',
  COMPLETE: 'complete',
}
