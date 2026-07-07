// Module 4 (Relay Ticket Triage) lesson registry.
//
// Split into its own dynamic-import chunk (see App.jsx LESSON_MODULE_LOADERS)
// so a learner only downloads the lessons for the project they open. Keep this
// map in sync with BUILT_LESSONS['module-04'] in src/lib/projects.js.

// Easy tier
import lessonTicketInbox from './lesson-ticket-inbox.json'
import lessonTicketRecord from './lesson-ticket-record.json'
import lessonIntentTaxonomy from './lesson-intent-taxonomy.json'
import lessonClassification from './lesson-classification.json'
import lessonPriorityMatrix from './lesson-priority-matrix.json'
import lessonPriorityAssignment from './lesson-priority-assignment.json'
import lessonRoutingTable from './lesson-routing-table.json'
import lessonRouteDecision from './lesson-route-decision.json'
import lessonEscalationHandoff from './lesson-escalation-handoff.json'
import lessonQueueAssignment from './lesson-queue-assignment.json'
import lessonSlaTracker from './lesson-sla-tracker.json'
import lessonResolutionRecord from './lesson-resolution-record.json'
import lessonMisrouteCheck from './lesson-misroute-check.json'
import lessonQueueDigest from './lesson-queue-digest.json'
import lessonTriageArchive from './lesson-triage-archive.json'
import lessonTaxonomyFeedback from './lesson-taxonomy-feedback.json'

const module04Lessons = {
  // Easy tier
  'lesson-ticket-inbox': lessonTicketInbox,
  'lesson-ticket-record': lessonTicketRecord,
  'lesson-intent-taxonomy': lessonIntentTaxonomy,
  'lesson-classification': lessonClassification,
  'lesson-priority-matrix': lessonPriorityMatrix,
  'lesson-priority-assignment': lessonPriorityAssignment,
  'lesson-routing-table': lessonRoutingTable,
  'lesson-route-decision': lessonRouteDecision,
  'lesson-escalation-handoff': lessonEscalationHandoff,
  'lesson-queue-assignment': lessonQueueAssignment,
  'lesson-sla-tracker': lessonSlaTracker,
  'lesson-resolution-record': lessonResolutionRecord,
  'lesson-misroute-check': lessonMisrouteCheck,
  'lesson-queue-digest': lessonQueueDigest,
  'lesson-triage-archive': lessonTriageArchive,
  'lesson-taxonomy-feedback': lessonTaxonomyFeedback,
}

export default module04Lessons
