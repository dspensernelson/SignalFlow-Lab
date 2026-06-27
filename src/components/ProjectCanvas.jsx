import WorkflowGraph from './WorkflowGraph'
import NodeDetail from './NodeDetail'
import { STATUS, isBuildable, deriveNodeStatus } from '../lib/progress'

const PROJECT_GOAL =
  'Build a workplace automation that turns messy overnight market inputs into an approval-ready 7:00 AM brief. The map below is the real dependency graph — phases on the left feed objects that get reused, evaluated, and routed downstream. Click any node to see how that piece gets built and reused.'

export default function ProjectCanvas({
  nodes,
  phases,
  edges,
  progress,
  selectedNodeId,
  onSelect,
  onStart,
  onContinue,
  onViewArtifact,
  onReset,
  onRestartNode,
}) {
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const phasesById = Object.fromEntries(phases.map((p) => [p.id, p]))
  const selectedNode = nodesById[selectedNodeId]
  const selectedPhase = selectedNode ? phasesById[selectedNode.phaseId] : null
  const selectedStatus = selectedNode ? deriveNodeStatus(selectedNode, progress) : null

  const buildableNodes = nodes.filter(isBuildable)
  const completeCount = buildableNodes.filter(
    (n) => progress[n.id] === STATUS.COMPLETE
  ).length
  const lessonsDefined = nodes.filter((n) => n.lesson && n.lesson.intent).length
  const anyProgress = buildableNodes.some(
    (n) =>
      progress[n.id] === STATUS.IN_PROGRESS || progress[n.id] === STATUS.COMPLETE
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 text-left">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">SignalFlow Lab</p>
          <h1 className="text-2xl font-semibold text-gray-900">Meridian Morning Market Brief</h1>
          <p className="max-w-4xl text-sm text-gray-600">{PROJECT_GOAL}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-gray-700">
              Interactive tasks built: {completeCount} of {buildableNodes.length}
            </span>
            <span className="hidden text-gray-300 sm:inline">·</span>
            <span className="font-medium text-gray-500">
              Workflow lessons defined: {lessonsDefined} of {nodes.length}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!anyProgress}
          className="w-fit rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Over
        </button>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Workflow Map
        </h2>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6">
          <div>
            <WorkflowGraph
              nodes={nodes}
              phases={phases}
              edges={edges}
              progress={progress}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
            />
          </div>

          <aside className="mt-6 lg:mt-0 lg:sticky lg:top-6">
            <NodeDetail
              node={selectedNode}
              status={selectedStatus}
              phase={selectedPhase}
              nodesById={nodesById}
              edges={edges}
              onSelect={onSelect}
              onStart={onStart}
              onContinue={onContinue}
              onViewArtifact={onViewArtifact}
              onRestart={onRestartNode}
            />
          </aside>
        </div>
      </section>
    </div>
  )
}
