import { useRef, useState } from 'react'
import WorkflowGraph from './WorkflowGraph'
import NodeDetail from './NodeDetail'
import {
  STATUS,
  TIERS,
  isBuildable,
  deriveNodeStatus,
  getUnlockRequirement,
  hasSeenWelcome,
  markWelcomeSeen,
  hasCelebratedTier,
  markTierCelebrated,
  hasSeenRecurrence,
  markRecurrenceSeen,
} from '../lib/progress'
import { buildExport, downloadText } from '../lib/export'
import { WelcomeModal, TierCompleteModal, RecurrenceModal } from './HumanMoments'
import { Logo, ThemeToggle, StatItem, Button, Icon } from './ui'
import moduleSkeleton from '../data/moduleSkeleton.json'
import ToolMapModal from './ToolMap'
import { buildToolMapRows } from '../lib/toolMap'
import { tierLessonId } from '../lib/progress'

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
  const triggerRef = useRef(null)
  const active = projects.find((p) => p.id === value) || projects[0]
  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        // Escape closes the listbox and returns focus to the trigger, so a
        // keyboard user is never trapped tabbing through every option.
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
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
  lessons,
  nodes,
  phases,
  edges,
  progress,
  artifacts = {},
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
  const tierPct = buildableNodes.length
    ? Math.round((completeCount / buildableNodes.length) * 100)
    : 0
  const tierComplete = buildableNodes.length > 0 && completeCount === buildableNodes.length
  const anyProgress = buildableNodes.some(
    (n) =>
      progress[n.id] === STATUS.IN_PROGRESS || progress[n.id] === STATUS.COMPLETE
  )

  // One-time "human moments": the welcome card (once ever) and the
  // tier-completion celebration (once per completed tier, per project).
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome())
  const [celebrateClosed, setCelebrateClosed] = useState(false)

  // Reset the "closed" latch whenever the working set (project/tier) changes, so
  // finishing a different tier still celebrates. Adjust-state-on-prop-change via
  // a render-time compare (no effect, no cascading renders).
  const tierKey = `${project}:${tier}`
  const [prevTierKey, setPrevTierKey] = useState(tierKey)
  if (tierKey !== prevTierKey) {
    setPrevTierKey(tierKey)
    setCelebrateClosed(false)
  }

  const showCelebrate =
    tierComplete && !celebrateClosed && !hasCelebratedTier(tier, project)

  // "You have seen this shape before": once per module (module-02+), the first
  // time a learner enters a module that maps onto the shared workflow skeleton.
  // Data-driven from moduleSkeleton.json; the anchor module (Meridian) never
  // shows it. Gated behind the welcome card so the two never stack.
  const anchorModule = moduleSkeleton.modules[moduleSkeleton.anchor]
  const thisModule = moduleSkeleton.modules[project]
  const recurrenceEligible = project !== moduleSkeleton.anchor && Boolean(thisModule)
  const [recurrenceClosed, setRecurrenceClosed] = useState(false)
  const [prevRecurrenceProject, setPrevRecurrenceProject] = useState(project)
  if (project !== prevRecurrenceProject) {
    setPrevRecurrenceProject(project)
    setRecurrenceClosed(false)
  }
  const showRecurrence =
    recurrenceEligible &&
    !recurrenceClosed &&
    !showWelcome &&
    !hasSeenRecurrence(project)

  function dismissWelcome() {
    markWelcomeSeen()
    setShowWelcome(false)
  }

  function dismissRecurrence() {
    markRecurrenceSeen(project)
    setRecurrenceClosed(true)
  }

  function dismissCelebrate() {
    markTierCelebrated(tier, project)
    setCelebrateClosed(true)
  }

  // Tool map rows are derived from lesson realWorld data, so the view exists
  // for any project whose lessons have loaded and cannot go stale.
  const [showToolMap, setShowToolMap] = useState(false)
  const toolMapRows = buildToolMapRows({ nodes, lessons, tierLessonId, tier })

  function handleExport() {
    const payload = buildExport({
      projectName,
      tier,
      tierLabel: TIER_LABELS[tier],
      nodes,
      progress,
      artifacts,
    })
    downloadText(`${payload.base}.json`, payload.json, 'application/json')
    downloadText(`${payload.base}.md`, payload.markdown, 'text/markdown')
  }

  const nextTier = TIERS[TIERS.indexOf(tier) + 1] || null
  function handleNextTier() {
    dismissCelebrate()
    if (nextTier && onTierChange) onTierChange(nextTier)
  }


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
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setShowToolMap(true)}
              disabled={toolMapRows.length === 0}
              title="Every step of this workflow, the kind of action it is, and the tools that fit"
            >
              Tool map
            </Button>
            <Button
              variant="neutral"
              size="sm"
              icon="download"
              onClick={handleExport}
              disabled={completeCount === 0}
              title="Download everything you built (JSON + markdown)"
            >
              Export
            </Button>
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
              value={`${tierPct}%`}
              label={`${TIER_LABELS[tier]} tier complete`}
            />
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Workflow Map
          </h2>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch lg:gap-6">
            {/* The map keeps a fixed wide aspect, so on tall viewports the
                detail aside runs taller than the map. On tall viewports only,
                center the map in its (stretched) grid row instead of
                top-aligning it, folding the below-map dead space into balanced
                margins. Laptop heights stay top-aligned (no awkward gap). */}
            <div className="lg:flex lg:h-full lg:flex-col tall:lg:justify-center">
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
                lesson={
                  selectedNode?.taskId && lessons
                    ? lessons[tierLessonId(selectedNode.taskId, tier)] ||
                      lessons[selectedNode.taskId]
                    : null
                }
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

      <ToolMapModal
        open={showToolMap}
        onClose={() => setShowToolMap(false)}
        projectName={projectName}
        rows={toolMapRows}
      />
      <WelcomeModal open={showWelcome} onDismiss={dismissWelcome} />
      <RecurrenceModal
        open={showRecurrence}
        skeleton={moduleSkeleton.skeleton}
        anchorModule={anchorModule}
        thisModule={thisModule}
        onDismiss={dismissRecurrence}
      />
      <TierCompleteModal
        open={showCelebrate}
        tierLabel={TIER_LABELS[tier]}
        builtCount={buildableNodes.length}
        nextTierLabel={nextTier ? TIER_LABELS[nextTier] : null}
        onExport={handleExport}
        onNextTier={handleNextTier}
        onDismiss={dismissCelebrate}
      />
    </div>
  )
}
