import { useState } from 'react'
import { Button, Icon } from '../components/ui'
import WorkflowGraph from '../components/WorkflowGraph'
import NodeDetail from '../components/NodeDetail'
import { STATUS } from '../lib/progress'
import { nodeStatusFromBuilds, nodeBuilds, NODE_STATUS } from '../lib/flowProgress.js'

// The world view: the module's workflow map, lit up by what the learner has
// built. Read-only context (what each piece is at work, what access it
// needs, how to rebuild it solo) plus a link from each node to the build
// that makes it.

const TO_MAP_STATUS = {
  [NODE_STATUS.COMPLETE]: STATUS.COMPLETE,
  [NODE_STATUS.ASSISTED]: STATUS.COMPLETE,
  [NODE_STATUS.ACTIVE]: STATUS.READY,
  [NODE_STATUS.LOCKED]: STATUS.LOCKED,
}

export default function WorldView({ moduleData, project, nodes, phases, edges, passed, activeBuildId, onOpenBuild, onClose }) {
  const world = nodeStatusFromBuilds(moduleData, passed, activeBuildId)
  const statusById = Object.fromEntries(nodes.map((n) => [n.id, TO_MAP_STATUS[world[n.id]] || STATUS.CONTEXT]))
  const [selectedNodeId, setSelectedNodeId] = useState(() => {
    const active = nodes.find((n) => world[n.id] === NODE_STATUS.ACTIVE)
    return active ? active.id : nodes[0] ? nodes[0].id : null
  })
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const phasesById = Object.fromEntries(phases.map((p) => [p.id, p]))
  const selectedNode = nodesById[selectedNodeId]
  const builtCount = nodes.filter((n) => world[n.id] === NODE_STATUS.COMPLETE || world[n.id] === NODE_STATUS.ASSISTED).length
  const coveredCount = nodes.filter((n) => world[n.id]).length

  function actionFor(node) {
    const bs = nodeBuilds(moduleData, node.id)
    if (!bs.length) return null
    const b = bs.find((x) => x.id === activeBuildId) || bs.find((x) => !(passed && passed[x.id])) || bs[0]
    const st = world[node.id]
    return { label: st === NODE_STATUS.COMPLETE || st === NODE_STATUS.ASSISTED ? 'Open build' : st === NODE_STATUS.ACTIVE ? 'Build this' : 'Later', buildId: b.id, disabled: st === NODE_STATUS.LOCKED }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sf-bg text-left text-sf-text">
      <header className="flex flex-none items-center justify-between gap-3 border-b border-sf-border bg-sf-surface px-4 py-2">
        <div className="min-w-0 leading-tight">
          <div className="text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">{project ? project.org : ''} - the workflow map</div>
          <div className="truncate text-sm font-semibold text-sf-text">{project ? project.name : moduleData.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-sf-muted">
            {builtCount} of {coveredCount} pieces built
          </span>
          <Button variant="primary" size="sm" icon="arrow-left" onClick={onClose}>
            Back to the builder
          </Button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <p className="max-w-4xl text-sm text-sf-muted">{project ? project.goal : ''}</p>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
          <WorkflowGraph
            nodes={nodes}
            phases={phases}
            edges={edges}
            progress={{}}
            statusById={statusById}
            actionFor={(node) => {
              const a = actionFor(node)
              if (!a) return null
              return { label: a.label, disabled: a.disabled, onClick: () => onOpenBuild(a.buildId) }
            }}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
          <aside className="mt-6 lg:mt-0">
            <NodeDetail
              node={selectedNode}
              status={selectedNode ? statusById[selectedNode.id] : null}
              phase={selectedNode ? phasesById[selectedNode.phaseId] : null}
              nodesById={nodesById}
              edges={edges}
              onSelect={setSelectedNodeId}
              world={{
                builds: selectedNode ? nodeBuilds(moduleData, selectedNode.id) : [],
                passed: passed || {},
                onOpenBuild,
              }}
            />
          </aside>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-sf-subtle">
          <Icon name="circle-help" size={12} /> Solid = built by you. Hollow = passed with the example loaded. Blue = the build you are on. Grey = later.
        </p>
      </div>
    </div>
  )
}
