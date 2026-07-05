// Module 1 (Meridian Morning) lesson registry.
//
// Split into its own dynamic-import chunk (see App.jsx LESSON_MODULE_LOADERS)
// so a learner only downloads the lessons for the project they open. Keep this
// map in sync with BUILT_LESSONS['module-01'] in src/lib/projects.js.

// Easy tier
import lessonIntake from './lesson-intake.json'
import lessonThresholdPolicy from './lesson-threshold-policy.json'
import lessonCleanPriceData from './lesson-clean-price-data.json'
import lessonVarianceCheck from './lesson-variance-check.json'
import lessonRiskEvaluation from './lesson-risk-evaluation.json'
import lessonApprovalTemplate from './lesson-approval-template.json'
import lessonApprovalDecision from './lesson-approval-decision.json'
import lessonApprovalRoute from './lesson-approval-route.json'
import lessonRoutineUpdatePath from './lesson-routine-update-path.json'
import lessonDistributionArchive from './lesson-distribution-archive.json'
import lessonAnalystNotes from './lesson-analyst-notes.json'
import lessonTraderFlag from './lesson-trader-flag.json'
import lessonPriceFeed from './lesson-price-feed.json'
import lessonForecastData from './lesson-forecast-data.json'
import lessonPriorDayReference from './lesson-prior-day-reference.json'
import lessonPriorDayBriefTemplate from './lesson-prior-day-brief-template.json'
import lessonMorningBrief from './lesson-morning-brief.json'
// Medium tier
import lessonIntakeMedium from './lesson-intake-medium.json'
import lessonCleanPriceDataMedium from './lesson-clean-price-data-medium.json'
import lessonThresholdPolicyMedium from './lesson-threshold-policy-medium.json'
import lessonVarianceCheckMedium from './lesson-variance-check-medium.json'
import lessonRiskEvaluationMedium from './lesson-risk-evaluation-medium.json'
import lessonApprovalDecisionMedium from './lesson-approval-decision-medium.json'
import lessonApprovalRouteMedium from './lesson-approval-route-medium.json'
import lessonAnalystNotesMedium from './lesson-analyst-notes-medium.json'
import lessonTraderFlagMedium from './lesson-trader-flag-medium.json'
import lessonPriceFeedMedium from './lesson-price-feed-medium.json'
import lessonForecastDataMedium from './lesson-forecast-data-medium.json'
import lessonPriorDayReferenceMedium from './lesson-prior-day-reference-medium.json'
import lessonPriorDayBriefTemplateMedium from './lesson-prior-day-brief-template-medium.json'
import lessonApprovalTemplateMedium from './lesson-approval-template-medium.json'
import lessonRoutineUpdatePathMedium from './lesson-routine-update-path-medium.json'
import lessonMorningBriefMedium from './lesson-morning-brief-medium.json'
import lessonDistributionArchiveMedium from './lesson-distribution-archive-medium.json'
// Hard tier
import lessonIntakeHard from './lesson-intake-hard.json'
import lessonThresholdPolicyHard from './lesson-threshold-policy-hard.json'
import lessonPriceFeedHard from './lesson-price-feed-hard.json'
import lessonApprovalRouteHard from './lesson-approval-route-hard.json'
import lessonRiskEvaluationHard from './lesson-risk-evaluation-hard.json'
import lessonMorningBriefHard from './lesson-morning-brief-hard.json'
import lessonDistributionArchiveHard from './lesson-distribution-archive-hard.json'
import lessonApprovalDecisionHard from './lesson-approval-decision-hard.json'

const module01Lessons = {
  // Easy tier
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
}

export default module01Lessons
