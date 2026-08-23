// Module 3 (Harbor Onboarding) lesson registry.
//
// Split into its own dynamic-import chunk (see App.jsx LESSON_MODULE_LOADERS)
// so a learner only downloads the lessons for the project they open. Keep this
// map in sync with BUILT_LESSONS['module-03'] in src/lib/projects.js.

// Easy tier
import lessonSignedOffer from './lesson-signed-offer.json'
import lessonRoleProfileCatalog from './lesson-role-profile-catalog.json'
import lessonOnboardingRecord from './lesson-onboarding-record.json'
import lessonSlaPolicy from './lesson-sla-policy.json'
import lessonProvisioningPlan from './lesson-provisioning-plan.json'
import lessonAccountsTask from './lesson-accounts-task.json'
import lessonHardwareTask from './lesson-hardware-task.json'
import lessonAccessTask from './lesson-access-task.json'
import lessonPayrollTask from './lesson-payroll-task.json'
import lessonTaskTracker from './lesson-task-tracker.json'
import lessonReadinessGate from './lesson-readiness-gate.json'
import lessonEscalationPath from './lesson-escalation-path.json'
import lessonDayOnePackage from './lesson-day-one-package.json'
import lessonManagerHandoff from './lesson-manager-handoff.json'
import lessonOnboardingArchive from './lesson-onboarding-archive.json'
import lessonProfileFeedback from './lesson-profile-feedback.json'
// Medium tier
import lessonSignedOfferMedium from './lesson-signed-offer-medium.json'
import lessonRoleProfileCatalogMedium from './lesson-role-profile-catalog-medium.json'
import lessonOnboardingRecordMedium from './lesson-onboarding-record-medium.json'
import lessonSlaPolicyMedium from './lesson-sla-policy-medium.json'
import lessonProvisioningPlanMedium from './lesson-provisioning-plan-medium.json'
import lessonAccountsTaskMedium from './lesson-accounts-task-medium.json'
import lessonHardwareTaskMedium from './lesson-hardware-task-medium.json'
import lessonAccessTaskMedium from './lesson-access-task-medium.json'
import lessonPayrollTaskMedium from './lesson-payroll-task-medium.json'
import lessonTaskTrackerMedium from './lesson-task-tracker-medium.json'
import lessonReadinessGateMedium from './lesson-readiness-gate-medium.json'
import lessonEscalationPathMedium from './lesson-escalation-path-medium.json'
import lessonDayOnePackageMedium from './lesson-day-one-package-medium.json'
import lessonManagerHandoffMedium from './lesson-manager-handoff-medium.json'
import lessonOnboardingArchiveMedium from './lesson-onboarding-archive-medium.json'
import lessonProfileFeedbackMedium from './lesson-profile-feedback-medium.json'
// Hard tier
import lessonReadinessGateHard from './lesson-readiness-gate-hard.json'
import lessonSlaPolicyHard from './lesson-sla-policy-hard.json'
import lessonEscalationPathHard from './lesson-escalation-path-hard.json'
import lessonDayOnePackageHard from './lesson-day-one-package-hard.json'
import lessonAccountsTaskHard from './lesson-accounts-task-hard.json'
import lessonTaskTrackerHard from './lesson-task-tracker-hard.json'

// Operations tier (playbook Step 2b/7c)
import lessonOnboardingOperations from './lesson-onboarding-operations.json'
import lessonOnboardingOperationsMedium from './lesson-onboarding-operations-medium.json'
import lessonOnboardingOperationsHard from './lesson-onboarding-operations-hard.json'

const module03Lessons = {
  // Easy tier
  'lesson-signed-offer': lessonSignedOffer,
  'lesson-role-profile-catalog': lessonRoleProfileCatalog,
  'lesson-onboarding-record': lessonOnboardingRecord,
  'lesson-sla-policy': lessonSlaPolicy,
  'lesson-provisioning-plan': lessonProvisioningPlan,
  'lesson-accounts-task': lessonAccountsTask,
  'lesson-hardware-task': lessonHardwareTask,
  'lesson-access-task': lessonAccessTask,
  'lesson-payroll-task': lessonPayrollTask,
  'lesson-task-tracker': lessonTaskTracker,
  'lesson-readiness-gate': lessonReadinessGate,
  'lesson-escalation-path': lessonEscalationPath,
  'lesson-day-one-package': lessonDayOnePackage,
  'lesson-manager-handoff': lessonManagerHandoff,
  'lesson-onboarding-archive': lessonOnboardingArchive,
  'lesson-profile-feedback': lessonProfileFeedback,
  // Medium tier
  'lesson-signed-offer-medium': lessonSignedOfferMedium,
  'lesson-role-profile-catalog-medium': lessonRoleProfileCatalogMedium,
  'lesson-onboarding-record-medium': lessonOnboardingRecordMedium,
  'lesson-sla-policy-medium': lessonSlaPolicyMedium,
  'lesson-provisioning-plan-medium': lessonProvisioningPlanMedium,
  'lesson-accounts-task-medium': lessonAccountsTaskMedium,
  'lesson-hardware-task-medium': lessonHardwareTaskMedium,
  'lesson-access-task-medium': lessonAccessTaskMedium,
  'lesson-payroll-task-medium': lessonPayrollTaskMedium,
  'lesson-task-tracker-medium': lessonTaskTrackerMedium,
  'lesson-readiness-gate-medium': lessonReadinessGateMedium,
  'lesson-escalation-path-medium': lessonEscalationPathMedium,
  'lesson-day-one-package-medium': lessonDayOnePackageMedium,
  'lesson-manager-handoff-medium': lessonManagerHandoffMedium,
  'lesson-onboarding-archive-medium': lessonOnboardingArchiveMedium,
  'lesson-profile-feedback-medium': lessonProfileFeedbackMedium,
  // Hard tier
  'lesson-readiness-gate-hard': lessonReadinessGateHard,
  'lesson-sla-policy-hard': lessonSlaPolicyHard,
  'lesson-escalation-path-hard': lessonEscalationPathHard,
  'lesson-day-one-package-hard': lessonDayOnePackageHard,
  'lesson-accounts-task-hard': lessonAccountsTaskHard,
  'lesson-task-tracker-hard': lessonTaskTrackerHard,
  'lesson-onboarding-operations': lessonOnboardingOperations,
  'lesson-onboarding-operations-medium': lessonOnboardingOperationsMedium,
  'lesson-onboarding-operations-hard': lessonOnboardingOperationsHard,
}

export default module03Lessons
