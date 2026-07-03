import { useEffect, useState } from 'react'
import lessonIntake from './data/lessons/lesson-intake.json'
import lessonThresholdPolicy from './data/lessons/lesson-threshold-policy.json'
import lessonCleanPriceData from './data/lessons/lesson-clean-price-data.json'
import lessonVarianceCheck from './data/lessons/lesson-variance-check.json'
import lessonRiskEvaluation from './data/lessons/lesson-risk-evaluation.json'
import lessonApprovalTemplate from './data/lessons/lesson-approval-template.json'
import lessonApprovalDecision from './data/lessons/lesson-approval-decision.json'
import lessonApprovalRoute from './data/lessons/lesson-approval-route.json'
import lessonRoutineUpdatePath from './data/lessons/lesson-routine-update-path.json'
import lessonDistributionArchive from './data/lessons/lesson-distribution-archive.json'
import lessonAnalystNotes from './data/lessons/lesson-analyst-notes.json'
import lessonTraderFlag from './data/lessons/lesson-trader-flag.json'
import lessonPriceFeed from './data/lessons/lesson-price-feed.json'
import lessonForecastData from './data/lessons/lesson-forecast-data.json'
import lessonPriorDayReference from './data/lessons/lesson-prior-day-reference.json'
import lessonPriorDayBriefTemplate from './data/lessons/lesson-prior-day-brief-template.json'
import lessonMorningBrief from './data/lessons/lesson-morning-brief.json'
import lessonIntakeMedium from './data/lessons/lesson-intake-medium.json'
import lessonCleanPriceDataMedium from './data/lessons/lesson-clean-price-data-medium.json'
import lessonThresholdPolicyMedium from './data/lessons/lesson-threshold-policy-medium.json'
import lessonVarianceCheckMedium from './data/lessons/lesson-variance-check-medium.json'
import lessonRiskEvaluationMedium from './data/lessons/lesson-risk-evaluation-medium.json'
import lessonApprovalDecisionMedium from './data/lessons/lesson-approval-decision-medium.json'
import lessonApprovalRouteMedium from './data/lessons/lesson-approval-route-medium.json'
import lessonAnalystNotesMedium from './data/lessons/lesson-analyst-notes-medium.json'
import lessonTraderFlagMedium from './data/lessons/lesson-trader-flag-medium.json'
import lessonPriceFeedMedium from './data/lessons/lesson-price-feed-medium.json'
import lessonForecastDataMedium from './data/lessons/lesson-forecast-data-medium.json'
import lessonPriorDayReferenceMedium from './data/lessons/lesson-prior-day-reference-medium.json'
import lessonPriorDayBriefTemplateMedium from './data/lessons/lesson-prior-day-brief-template-medium.json'
import lessonApprovalTemplateMedium from './data/lessons/lesson-approval-template-medium.json'
import lessonRoutineUpdatePathMedium from './data/lessons/lesson-routine-update-path-medium.json'
import lessonMorningBriefMedium from './data/lessons/lesson-morning-brief-medium.json'
import lessonDistributionArchiveMedium from './data/lessons/lesson-distribution-archive-medium.json'
import lessonIntakeHard from './data/lessons/lesson-intake-hard.json'
import lessonThresholdPolicyHard from './data/lessons/lesson-threshold-policy-hard.json'
import lessonPriceFeedHard from './data/lessons/lesson-price-feed-hard.json'
import lessonApprovalRouteHard from './data/lessons/lesson-approval-route-hard.json'
import lessonRiskEvaluationHard from './data/lessons/lesson-risk-evaluation-hard.json'
import lessonMorningBriefHard from './data/lessons/lesson-morning-brief-hard.json'
import lessonDistributionArchiveHard from './data/lessons/lesson-distribution-archive-hard.json'
import lessonApprovalDecisionHard from './data/lessons/lesson-approval-decision-hard.json'
// Module 2 (Beacon Invoice Desk) - Easy tier
import lessonInvoiceInbox from './data/lessons/lesson-invoice-inbox.json'
import lessonVendorMaster from './data/lessons/lesson-vendor-master.json'
import lessonPoRegister from './data/lessons/lesson-po-register.json'
import lessonInvoiceRecord from './data/lessons/lesson-invoice-record.json'
import lessonReceiptLog from './data/lessons/lesson-receipt-log.json'
import lessonTolerancePolicy from './data/lessons/lesson-tolerance-policy.json'
import lessonPaymentHistory from './data/lessons/lesson-payment-history.json'
import lessonDuplicateCheck from './data/lessons/lesson-duplicate-check.json'
import lessonThreeWayMatch from './data/lessons/lesson-three-way-match.json'
import lessonMatchDecision from './data/lessons/lesson-match-decision.json'
import lessonAutoApprovePath from './data/lessons/lesson-auto-approve-path.json'
import lessonExceptionQueue from './data/lessons/lesson-exception-queue.json'
import lessonPaymentBatch from './data/lessons/lesson-payment-batch.json'
import lessonRunApproval from './data/lessons/lesson-run-approval.json'
import lessonPaymentRun from './data/lessons/lesson-payment-run.json'
import lessonRemittanceAdvice from './data/lessons/lesson-remittance-advice.json'
import lessonPaymentArchive from './data/lessons/lesson-payment-archive.json'
// Module 2 (Beacon Invoice Desk) - Medium tier
import lessonInvoiceInboxMedium from './data/lessons/lesson-invoice-inbox-medium.json'
import lessonInvoiceRecordMedium from './data/lessons/lesson-invoice-record-medium.json'
import lessonVendorMasterMedium from './data/lessons/lesson-vendor-master-medium.json'
import lessonPoRegisterMedium from './data/lessons/lesson-po-register-medium.json'
import lessonReceiptLogMedium from './data/lessons/lesson-receipt-log-medium.json'
import lessonTolerancePolicyMedium from './data/lessons/lesson-tolerance-policy-medium.json'
import lessonPaymentHistoryMedium from './data/lessons/lesson-payment-history-medium.json'
import lessonDuplicateCheckMedium from './data/lessons/lesson-duplicate-check-medium.json'
import lessonThreeWayMatchMedium from './data/lessons/lesson-three-way-match-medium.json'
import lessonMatchDecisionMedium from './data/lessons/lesson-match-decision-medium.json'
import lessonExceptionQueueMedium from './data/lessons/lesson-exception-queue-medium.json'
import lessonAutoApprovePathMedium from './data/lessons/lesson-auto-approve-path-medium.json'
import lessonPaymentBatchMedium from './data/lessons/lesson-payment-batch-medium.json'
import lessonRunApprovalMedium from './data/lessons/lesson-run-approval-medium.json'
import lessonPaymentRunMedium from './data/lessons/lesson-payment-run-medium.json'
import lessonRemittanceAdviceMedium from './data/lessons/lesson-remittance-advice-medium.json'
import lessonPaymentArchiveMedium from './data/lessons/lesson-payment-archive-medium.json'
// Module 2 (Beacon Invoice Desk) - Hard tier
import lessonTolerancePolicyHard from './data/lessons/lesson-tolerance-policy-hard.json'
import lessonDuplicateCheckHard from './data/lessons/lesson-duplicate-check-hard.json'
import lessonVendorMasterHard from './data/lessons/lesson-vendor-master-hard.json'
import lessonThreeWayMatchHard from './data/lessons/lesson-three-way-match-hard.json'
import lessonPaymentRunHard from './data/lessons/lesson-payment-run-hard.json'
import ProjectCanvas from './components/ProjectCanvas'
import LessonWorkspace from './components/LessonWorkspace'
import ArtifactViewer from './components/ArtifactViewer'
import {
  loadProgress,
  saveProgress,
  loadArtifacts,
  saveArtifacts,
  clearStorage,
  getDefaultSelectedNodeId,
  startNode,
  completeNode,
  restartNode,
  loadTier,
  saveTier,
  tierLessonId,
} from './lib/progress'
import { PROJECTS, getProjectData, loadProject, saveProject } from './lib/projects'
import { loadTheme, saveTheme, applyTheme } from './lib/theme'

// Only built lessons are wired here. Other lessonIds resolve to undefined.
const LESSONS = {
  'lesson-intake': lessonIntake,
  'lesson-threshold-policy': lessonThresholdPolicy,
  'lesson-clean-price-data': lessonCleanPriceData,
  'lesson-variance-check': lessonVarianceCheck,
  'lesson-risk-evaluation': lessonRiskEvaluation,
  'lesson-approval-template': lessonApprovalTemplate,
  'lesson-approval-decision': lessonApprovalDecision,
  'lesson-approval-route': lessonApprovalRoute,
  'lesson-routine-update-path': lessonRoutineUpdatePath,
  'lesson-distribution-archive': lessonDistributionArchive,
  'lesson-analyst-notes': lessonAnalystNotes,
  'lesson-trader-flag': lessonTraderFlag,
  'lesson-price-feed': lessonPriceFeed,
  'lesson-forecast-data': lessonForecastData,
  'lesson-prior-day-reference': lessonPriorDayReference,
  'lesson-prior-day-brief-template': lessonPriorDayBriefTemplate,
  'lesson-morning-brief': lessonMorningBrief,
  // Medium tier variants (resolved via tierLessonId: `${taskId}-medium`).
  'lesson-intake-medium': lessonIntakeMedium,
  'lesson-clean-price-data-medium': lessonCleanPriceDataMedium,
  'lesson-threshold-policy-medium': lessonThresholdPolicyMedium,
  'lesson-variance-check-medium': lessonVarianceCheckMedium,
  'lesson-risk-evaluation-medium': lessonRiskEvaluationMedium,
  'lesson-approval-decision-medium': lessonApprovalDecisionMedium,
  'lesson-approval-route-medium': lessonApprovalRouteMedium,
  'lesson-analyst-notes-medium': lessonAnalystNotesMedium,
  'lesson-trader-flag-medium': lessonTraderFlagMedium,
  'lesson-price-feed-medium': lessonPriceFeedMedium,
  'lesson-forecast-data-medium': lessonForecastDataMedium,
  'lesson-prior-day-reference-medium': lessonPriorDayReferenceMedium,
  'lesson-prior-day-brief-template-medium': lessonPriorDayBriefTemplateMedium,
  'lesson-approval-template-medium': lessonApprovalTemplateMedium,
  'lesson-routine-update-path-medium': lessonRoutineUpdatePathMedium,
  'lesson-morning-brief-medium': lessonMorningBriefMedium,
  'lesson-distribution-archive-medium': lessonDistributionArchiveMedium,
  // Hard tier variants (`${taskId}-hard`).
  'lesson-intake-hard': lessonIntakeHard,
  'lesson-threshold-policy-hard': lessonThresholdPolicyHard,
  'lesson-price-feed-hard': lessonPriceFeedHard,
  'lesson-approval-route-hard': lessonApprovalRouteHard,
  'lesson-risk-evaluation-hard': lessonRiskEvaluationHard,
  'lesson-morning-brief-hard': lessonMorningBriefHard,
  'lesson-distribution-archive-hard': lessonDistributionArchiveHard,
  'lesson-approval-decision-hard': lessonApprovalDecisionHard,
  // Module 2 (Beacon Invoice Desk) - Easy tier
  'lesson-invoice-inbox': lessonInvoiceInbox,
  'lesson-vendor-master': lessonVendorMaster,
  'lesson-po-register': lessonPoRegister,
  'lesson-invoice-record': lessonInvoiceRecord,
  'lesson-receipt-log': lessonReceiptLog,
  'lesson-tolerance-policy': lessonTolerancePolicy,
  'lesson-payment-history': lessonPaymentHistory,
  'lesson-duplicate-check': lessonDuplicateCheck,
  'lesson-three-way-match': lessonThreeWayMatch,
  'lesson-match-decision': lessonMatchDecision,
  'lesson-auto-approve-path': lessonAutoApprovePath,
  'lesson-exception-queue': lessonExceptionQueue,
  'lesson-payment-batch': lessonPaymentBatch,
  'lesson-run-approval': lessonRunApproval,
  'lesson-payment-run': lessonPaymentRun,
  'lesson-remittance-advice': lessonRemittanceAdvice,
  'lesson-payment-archive': lessonPaymentArchive,
  // Module 2 (Beacon Invoice Desk) - Medium tier
  'lesson-invoice-inbox-medium': lessonInvoiceInboxMedium,
  'lesson-invoice-record-medium': lessonInvoiceRecordMedium,
  'lesson-vendor-master-medium': lessonVendorMasterMedium,
  'lesson-po-register-medium': lessonPoRegisterMedium,
  'lesson-receipt-log-medium': lessonReceiptLogMedium,
  'lesson-tolerance-policy-medium': lessonTolerancePolicyMedium,
  'lesson-payment-history-medium': lessonPaymentHistoryMedium,
  'lesson-duplicate-check-medium': lessonDuplicateCheckMedium,
  'lesson-three-way-match-medium': lessonThreeWayMatchMedium,
  'lesson-match-decision-medium': lessonMatchDecisionMedium,
  'lesson-exception-queue-medium': lessonExceptionQueueMedium,
  'lesson-auto-approve-path-medium': lessonAutoApprovePathMedium,
  'lesson-payment-batch-medium': lessonPaymentBatchMedium,
  'lesson-run-approval-medium': lessonRunApprovalMedium,
  'lesson-payment-run-medium': lessonPaymentRunMedium,
  'lesson-remittance-advice-medium': lessonRemittanceAdviceMedium,
  'lesson-payment-archive-medium': lessonPaymentArchiveMedium,
  // Module 2 (Beacon Invoice Desk) - Hard tier
  'lesson-tolerance-policy-hard': lessonTolerancePolicyHard,
  'lesson-duplicate-check-hard': lessonDuplicateCheckHard,
  'lesson-vendor-master-hard': lessonVendorMasterHard,
  'lesson-three-way-match-hard': lessonThreeWayMatchHard,
  'lesson-payment-run-hard': lessonPaymentRunHard,
}

export default function App() {
  const [project, setProject] = useState(() => loadProject())
  const [tier, setTier] = useState(() => loadTier())
  const [progress, setProgress] = useState(() => loadProgress())
  const [artifacts, setArtifacts] = useState(() => loadArtifacts())
  const [view, setView] = useState('canvas') // 'canvas' | 'lesson' | 'artifact'
  const [selectedNodeId, setSelectedNodeId] = useState(() =>
    getDefaultSelectedNodeId(loadProgress())
  )
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [theme, setTheme] = useState(() => loadTheme())

  // The active project's workflow map (nodes/phases/edges) drives the canvas.
  const { nodes, phases, edges } = getProjectData(project)

  // Apply and persist the theme whenever it changes.
  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  function toggleTheme(next) {
    setTheme(next === 'dark' || next === 'light' ? next : theme === 'dark' ? 'light' : 'dark')
  }

  // Persist progress and artifacts whenever they change, scoped to the active
  // tier + project so switching never writes to the wrong storage key.
  useEffect(() => {
    saveProgress(progress, tier, project)
  }, [progress, tier, project])

  useEffect(() => {
    saveArtifacts(artifacts, tier, project)
  }, [artifacts, tier, project])

  function handleSelect(nodeId) {
    setSelectedNodeId(nodeId)
    setNotice(null)
  }

  // Switching tiers swaps the whole working set: lessons resolve to the tier's
  // variants and progress/artifacts load from the tier's own storage keys.
  function handleTierChange(nextTier) {
    if (nextTier === tier) return
    saveTier(nextTier, project)
    setTier(nextTier)
    const freshProgress = loadProgress(nextTier, project)
    setProgress(freshProgress)
    setArtifacts(loadArtifacts(nextTier, project))
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(freshProgress, project))
    setView('canvas')
  }

  // Switching projects swaps the entire working set: map data, lesson registry,
  // unlock tree, and per-project progress/artifacts/tier storage. Behaves like a
  // tier switch - return to canvas on that project's own frontier.
  function handleProjectChange(nextProject) {
    if (nextProject === project) return
    saveProject(nextProject)
    setProject(nextProject)
    const nextTier = loadTier(nextProject)
    setTier(nextTier)
    const freshProgress = loadProgress(nextTier, nextProject)
    setProgress(freshProgress)
    setArtifacts(loadArtifacts(nextTier, nextProject))
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(freshProgress, nextProject))
    setView('canvas')
  }

  function openLesson(nodeId) {
    const node = nodes.find((n) => n.id === nodeId)
    const lesson = node && LESSONS[tierLessonId(node.taskId, tier)]

    if (!lesson) {
      // NOTE: task-shaped nodes can be inspected, but only built lessons launch this pass.
      setNotice(
        tier === 'easy'
          ? 'This task is not built yet.'
          : `This task is not built for the ${tier} tier yet.`
      )
      return
    }

    setProgress((prev) => startNode(prev, nodeId))
    setActiveLessonId(lesson.id)
    setView('lesson')
    setNotice(null)
  }

  function handlePass(nodeId, artifact) {
    setArtifacts((prev) => ({ ...prev, [nodeId]: artifact }))
    setProgress((prev) => completeNode(prev, nodeId))
  }

  function handleViewArtifact(nodeId) {
    setSelectedNodeId(nodeId)
    setView('artifact')
  }

  function handleRestartNode(nodeId) {
    setProgress((prev) => restartNode(prev, nodeId))
    setArtifacts((prev) => {
      const next = { ...prev }
      delete next[nodeId]
      return next
    })
    setSelectedNodeId(nodeId)
  }

  function returnToCanvas(nextNodeId) {
    setView('canvas')
    setActiveLessonId(null)
    if (typeof nextNodeId === 'string' && nextNodeId) {
      setSelectedNodeId(nextNodeId)
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Start over? This clears your progress and saved artifacts for this project.'
    )
    if (!confirmed) return

    clearStorage(tier, project)
    const fresh = loadProgress(tier, project) // rebuilds and persists the initial state
    setProgress(fresh)
    setArtifacts({})
    setActiveLessonId(null)
    setNotice(null)
    setSelectedNodeId(getDefaultSelectedNodeId(fresh, project))
    setView('canvas')
  }

  if (view === 'lesson' && activeLessonId) {
    const lesson = LESSONS[activeLessonId]
    return (
      <LessonWorkspace
        lesson={lesson}
        tier={tier}
        onPass={handlePass}
        onReturnToCanvas={returnToCanvas}
      />
    )
  }

  if (view === 'artifact') {
    const node = nodes.find((n) => n.id === selectedNodeId)
    return (
      <ArtifactViewer
        node={node}
        artifact={artifacts[selectedNodeId]}
        onBack={returnToCanvas}
      />
    )
  }

  return (
    <div className="min-h-full">
      {notice && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4">
          <div className="rounded-md border border-sf-warning bg-sf-warning-weak px-4 py-3 text-sm text-sf-progress-text">
            {notice}
          </div>
        </div>
      )}
      <ProjectCanvas
        nodes={nodes}
        phases={phases}
        edges={edges}
        progress={progress}
        artifacts={artifacts}
        selectedNodeId={selectedNodeId}
        theme={theme}
        tier={tier}
        onTierChange={handleTierChange}
        projects={PROJECTS}
        project={project}
        onProjectChange={handleProjectChange}
        onToggleTheme={toggleTheme}
        onSelect={handleSelect}
        onStart={openLesson}
        onContinue={openLesson}
        onViewArtifact={handleViewArtifact}
        onReset={handleReset}
        onRestartNode={handleRestartNode}
      />
    </div>
  )
}
