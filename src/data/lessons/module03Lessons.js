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

const module03Lessons = {
  // Easy tier
  'lesson-signed-offer': lessonSignedOffer,
  'lesson-role-profile-catalog': lessonRoleProfileCatalog,
  'lesson-onboarding-record': lessonOnboardingRecord,
  'lesson-sla-policy': lessonSlaPolicy,
  'lesson-provisioning-plan': lessonProvisioningPlan,
}

export default module03Lessons
