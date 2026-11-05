/**
 * Sri Vidya Educational Trust - Institution Onboarding & Migration Schema
 * Module 5: Onboarding Overview, 12-Step Readiness Checklist, and 10-Step Data Import Centre
 */

const mongoose = require('mongoose');

const ChecklistItemSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: [
      'institution_profile',
      'initial_admin',
      'academic_year',
      'classes_sections',
      'staff_records',
      'student_records',
      'document_categories',
      'portal_domains',
      'email_delivery',
      'permissions_review',
      'backup_configured',
      'acceptance_testing'
    ]
  },
  label: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'pending', 'failed'],
    default: 'pending'
  },
  completedAt: { type: Date, default: null },
  completedBy: { type: String, default: null },
  notes: { type: String, default: '' },
  actionRoute: { type: String, default: '' }
}, { _id: false });

const OnboardingChecklistSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  institutionName: { type: String, required: true },
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  readinessStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Ready for Review', 'Live Production Certified'],
    default: 'In Progress'
  },
  items: [ChecklistItemSchema],
  lastAuditDate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'onboarding_checklists'
});

const RejectedRowSchema = new mongoose.Schema({
  rowNumber: { type: Number, required: true },
  identifier: { type: String, default: 'N/A' },
  reason: { type: String, required: true },
  rowData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const DataImportJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  institutionName: { type: String, default: '' },
  dataType: {
    type: String,
    required: true,
    enum: [
      'students',
      'staff',
      'classes_sections',
      'subject_assignments',
      'guardian_records',
      'historical_attendance',
      'fee_balances'
    ]
  },
  sourceFileName: { type: String, required: true },
  sourceFormat: {
    type: String,
    enum: ['CSV', 'Excel (.xlsx)', 'Excel (.xls)'],
    default: 'CSV'
  },
  fileSize: { type: String, default: '0 KB' },
  totalRows: { type: Number, default: 0 },
  validRows: { type: Number, default: 0 },
  rejectedRows: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'validating', 'preview_ready', 'processing', 'completed', 'failed'],
    default: 'preview_ready'
  },
  columnMapping: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatePolicy: {
    type: String,
    enum: ['reject_duplicates', 'skip_existing', 'update_existing'],
    default: 'reject_duplicates'
  },
  isDryRun: { type: Boolean, default: false },
  acceptedPreview: { type: Array, default: [] },
  rejectedRecords: [RejectedRowSchema],
  summaryReport: {
    recordsIngested: { type: Number, default: 0 },
    recordsSkipped: { type: Number, default: 0 },
    recordsFailed: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 }
  },
  operator: { type: String, default: 'Platform Super Administrator' },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'data_import_jobs'
});

const OnboardingChecklist = mongoose.models.OnboardingChecklist || mongoose.model('OnboardingChecklist', OnboardingChecklistSchema);
const DataImportJob = mongoose.models.DataImportJob || mongoose.model('DataImportJob', DataImportJobSchema);

module.exports = {
  OnboardingChecklist,
  DataImportJob
};

