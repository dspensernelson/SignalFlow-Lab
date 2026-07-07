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

const module04Lessons = {
  // Easy tier
  'lesson-ticket-inbox': lessonTicketInbox,
  'lesson-ticket-record': lessonTicketRecord,
  'lesson-intent-taxonomy': lessonIntentTaxonomy,
  'lesson-classification': lessonClassification,
}

export default module04Lessons
