import { useState } from 'react'
import WorkflowGraph from './WorkflowGraph'
import NodeDetail from './NodeDetail'
import {
  STATUS,
  TIERS,
  isBuildable,
  deriveNodeStatus,
  getUnlockRequirement,
} from '../lib/progress'
import { Logo, ThemeToggle, StatItem, Button, Icon } from './ui'

const TIER_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

const TIER_HINTS = {
  easy: 'Easy — operate the pattern: guided build of the full workflow. Each tier keeps its own progress.',
  medium: 'Medium — handle the mess: conflicting sources, gaps, and exceptions. Each tier keeps its own progress.',
  hard: 'Hard — own the design: failures, migrations, and redesigns. Each tier keeps its own progress.',
}

// Compact segmented control for the difficulty tier. Same map, three depths:
// easy operates the pattern, medium handles the mess, hard owns the design.
function TierSwitch({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Difficulty tier"
      className="inline-flex items-center rounded-full border border-sf-border bg-sf-surface-subtle p-0.5"
    >
      <span className="pl-2 pr-1 text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
        Tier
      </span>
      {TIERS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          aria-pressed={value === t}
          title={TIER_HINTS[t]}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
            value === t
              ? 'bg-sf-surface text-sf-text shadow-sf-sm'
              : 'text-sf-muted hover:text-sf-body'
          }`}
        >
          {TIER_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

const PROJECT_GOAL =
  'Build a workplace automation that turns messy overnight market inputs into an approval-ready 7:00 AM brief. The map below is the real dependency graph — phases on the left feed objects that get reused, evaluated, and routed downstream. Click any node to see how that piece gets built and reused.'

const PROJECT_CLOCK = '6:15 AM CT'

const PROJECT_STATUS_LABELS = { complete: 'Complete', active: 'Active', planned: 'Coming soon' }

// Header dropdown for switching modules (projects). "planned" projects render
// disabled - they have no working data set yet. Switching behaves like a tier
// switch (App swaps the whole working set and returns to the canvas).
function ProjectSwitch({ projects, value, onChange }) {
  const [open, setOpen] = useState(false)
  const active = projects.find((p) => p.id === value) || projects[0]
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-sf-text"
      >
        {active?.name}
        <Icon name="chevron-down" size={14} className="text-sf-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Project"
            className="absolute left-0 top-full z-40 mt-1 max-h-80 w-72 overflow-auto rounded-lg border border-sf-border bg-sf-surface p-1 shadow-sf-md"
          >
            {projects.map((p) => {
              const planned = p.status === 'planned'
              const selected = p.id === value
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={planned}
                    onClick={() => {
                      if (planned) return
                      onChange(p.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                      planned
                        ? 'cursor-not-allowed text-sf-subtle'
                        : selected
                          ? 'bg-sf-accent-weak text-sf-accent-text'
                          : 'text-sf-body hover:bg-sf-surface-subtle'
                    }`}
                  >
                    <span className="flex flex-col leading-tight">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[11px] text-sf-subtle">{p.org}</span>
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
                      {PROJECT_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default function ProjectCanvas({
  nodes,
  phases,
  edges,
  progress,
  selectedNodeId,
  theme,
  tier = 'easy',
  onTierChange,
  projects,
  project,
  onProjectChange,
  onToggleTheme,
  onSelect,
  onStart,
  onContinue,
  onViewArtifact,
  onReset,
  onRestartNode,
}) {
  const activeProject = projects?.find((p) => p.id === project)
  const projectName = activeProject?.name || 'Meridian Morning Market Brief'
  const projectGoal = activeProject?.goal || PROJECT_GOAL
  const projectClock = activeProject?.clock || PROJECT_CLOCK
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const phasesById = Object.fromEntries(phases.map((p) => [p.id, p]))
  const selectedNode = nodesById[selectedNodeId]
  const selectedPhase = selectedNode ? phasesById[selectedNode.phaseId] : null
  const selectedStatus = selectedNode ? deriveNodeStatus(selectedNode, progress) : null
  const unlockAfter =
    selectedNode && selectedStatus === STATUS.LOCKED && isBuildable(selectedNode)
      ? getUnlockRequirement(selectedNode, progress)
      : []

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
    <div className="min-h-full text-left text-sf-text">
      {/* Top app bar */}
      <header className="sticky top-0 z-20 border-b border-sf-border bg-sf-surface">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Logo size={22} uppercase wordmark="SignalFlow Lab" />
            <span className="hidden h-6 w-px bg-sf-border sm:inline-block" />
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-[9px] font-semibold uppercase tracking-sf-wide text-sf-subtle">Project</span>
              {onProjectChange && projects ? (
                <ProjectSwitch projects={projects} value={project} onChange={onProjectChange} />
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-sf-text">
                  {projectName}
                  <Icon name="chevron-down" size={14} className="text-sf-muted" />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-sf-border bg-sf-surface-subtle px-2.5 py-1 text-xs font-medium text-sf-muted md:inline-flex">
              <Icon name="clock" size={13} />
              {projectClock}
            </span>
            {onTierChange && <TierSwitch value={tier} onChange={onTierChange} />}
            <ThemeToggle value={theme} onChange={onToggleTheme} />
            <Button variant="neutral" size="sm" icon="rotate-cw" onClick={onReset} disabled={!anyProgress}>
              Start Over
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-sf-text">{projectName}</h1>
            <p className="max-w-4xl text-sm text-sf-muted">{projectGoal}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
            <StatItem
              icon="clipboard-list"
              tone="accent"
              value={`${completeCount} of ${buildableNodes.length}`}
              label="tasks built"
            />
            <StatItem
              icon="workflow"
              value={`${lessonsDefined} of ${nodes.length}`}
              label="lessons defined"
            />
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Workflow Map
          </h2>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
            <div>
              <WorkflowGraph
                nodes={nodes}
                phases={phases}
                edges={edges}
                progress={progress}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                onStart={onStart}
                onContinue={onContinue}
                onViewArtifact={onViewArtifact}
              />
            </div>

            <aside className="mt-6 lg:mt-0 lg:sticky lg:top-20">
              <NodeDetail
                node={selectedNode}
                status={selectedStatus}
                phase={selectedPhase}
                nodesById={nodesById}
                edges={edges}
                unlockAfterLabels={unlockAfter.map((n) => n.label)}
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
    </div>
  )
}
