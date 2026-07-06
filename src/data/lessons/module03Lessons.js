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
}

export default module03Lessons
