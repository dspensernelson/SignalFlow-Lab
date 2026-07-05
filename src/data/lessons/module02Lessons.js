// Module 2 (Beacon Invoice Desk) lesson registry.
//
// Split into its own dynamic-import chunk (see App.jsx LESSON_MODULE_LOADERS)
// so a learner only downloads the lessons for the project they open. Keep this
// map in sync with BUILT_LESSONS['module-02'] in src/lib/projects.js.

// Easy tier
import lessonInvoiceInbox from './lesson-invoice-inbox.json'
import lessonVendorMaster from './lesson-vendor-master.json'
import lessonPoRegister from './lesson-po-register.json'
import lessonInvoiceRecord from './lesson-invoice-record.json'
import lessonReceiptLog from './lesson-receipt-log.json'
import lessonTolerancePolicy from './lesson-tolerance-policy.json'
import lessonPaymentHistory from './lesson-payment-history.json'
import lessonDuplicateCheck from './lesson-duplicate-check.json'
import lessonThreeWayMatch from './lesson-three-way-match.json'
import lessonMatchDecision from './lesson-match-decision.json'
import lessonAutoApprovePath from './lesson-auto-approve-path.json'
import lessonExceptionQueue from './lesson-exception-queue.json'
import lessonPaymentBatch from './lesson-payment-batch.json'
import lessonRunApproval from './lesson-run-approval.json'
import lessonPaymentRun from './lesson-payment-run.json'
import lessonRemittanceAdvice from './lesson-remittance-advice.json'
import lessonPaymentArchive from './lesson-payment-archive.json'
// Medium tier
import lessonInvoiceInboxMedium from './lesson-invoice-inbox-medium.json'
import lessonInvoiceRecordMedium from './lesson-invoice-record-medium.json'
import lessonVendorMasterMedium from './lesson-vendor-master-medium.json'
import lessonPoRegisterMedium from './lesson-po-register-medium.json'
import lessonReceiptLogMedium from './lesson-receipt-log-medium.json'
import lessonTolerancePolicyMedium from './lesson-tolerance-policy-medium.json'
import lessonPaymentHistoryMedium from './lesson-payment-history-medium.json'
import lessonDuplicateCheckMedium from './lesson-duplicate-check-medium.json'
import lessonThreeWayMatchMedium from './lesson-three-way-match-medium.json'
import lessonMatchDecisionMedium from './lesson-match-decision-medium.json'
import lessonExceptionQueueMedium from './lesson-exception-queue-medium.json'
import lessonAutoApprovePathMedium from './lesson-auto-approve-path-medium.json'
import lessonPaymentBatchMedium from './lesson-payment-batch-medium.json'
import lessonRunApprovalMedium from './lesson-run-approval-medium.json'
import lessonPaymentRunMedium from './lesson-payment-run-medium.json'
import lessonRemittanceAdviceMedium from './lesson-remittance-advice-medium.json'
import lessonPaymentArchiveMedium from './lesson-payment-archive-medium.json'
// Hard tier
import lessonTolerancePolicyHard from './lesson-tolerance-policy-hard.json'
import lessonDuplicateCheckHard from './lesson-duplicate-check-hard.json'
import lessonVendorMasterHard from './lesson-vendor-master-hard.json'
import lessonThreeWayMatchHard from './lesson-three-way-match-hard.json'
import lessonMatchDecisionHard from './lesson-match-decision-hard.json'
import lessonPaymentRunHard from './lesson-payment-run-hard.json'

const module02Lessons = {
  // Easy tier
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
  // Medium tier
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
  // Hard tier
  'lesson-tolerance-policy-hard': lessonTolerancePolicyHard,
  'lesson-duplicate-check-hard': lessonDuplicateCheckHard,
  'lesson-vendor-master-hard': lessonVendorMasterHard,
  'lesson-three-way-match-hard': lessonThreeWayMatchHard,
  'lesson-match-decision-hard': lessonMatchDecisionHard,
  'lesson-payment-run-hard': lessonPaymentRunHard,
}

export default module02Lessons
