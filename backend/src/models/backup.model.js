/**
 * Sri Vidya Educational Trust - Backups & Recovery Models
 * Module 12: Backup Overview, Backup History, and Controlled 8-Step Recovery Workflow
 */

const mongoose = require('mongoose');

// 12.2 Backup Record Schema
const BackupRecordSchema = new mongoose.Schema({
  backupId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: 'Automated Snapshot'
  },
  scope: {
    type: String,
    enum: ['DATABASE', 'FILES_VAULT', 'FULL_TRUST', 'CAMPUS_SPECIFIC'],
    default: 'FULL_TRUST',
    index: true
  },
  campusScope: {
    type: String,
    default: 'ALL_CAMPUSES',
    index: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  completionTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'IN_PROGRESS', 'FAILED', 'CANCELLED'],
    default: 'SUCCESS',
    index: true
  },
  sizeBytes: {
    type: Number,
    default: 149737472 // ~142.8 MB
  },
  sizeFormatted: {
    type: String,
    default: '142.8 MB'
  },
  storageReference: {
    type: String,
    required: true
  },
  storageLocation: {
    type: String,
    default: 'AWS S3 ap-south-1 (Mumbai Vault) / Immutable Glacier Archive'
  },
  verificationStatus: {
    type: String,
    enum: ['VERIFIED_CLEAN', 'PENDING_VERIFICATION', 'CHECKSUM_FAILED', 'TAMPER_DETECTED'],
    default: 'VERIFIED_CLEAN',
    index: true
  },
  checksumSha256: {
    type: String,
    required: true
  },
  retentionPolicy: {
    type: String,
    default: 'AP Statutory Education Act: 7 Years Retained'
  },
  retentionExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000)
  },
  initiatedBy: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      userId: 'SYSTEM-CRON',
      name: 'Automated 6-Hour Snapshot Daemon',
      role: 'SYSTEM'
    }
  },
  downloadPermitted: {
    type: Boolean,
    default: false
  },
  errorSummary: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 12.3 Recovery Request Schema (Controlled 8-Step Workflow)
const RecoveryRequestSchema = new mongoose.Schema({
  recoveryId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  backupId: {
    type: String,
    required: true,
    index: true
  },
  backupScope: {
    type: String,
    default: 'FULL_TRUST'
  },
  targetEnvironment: {
    type: String,
    enum: ['ISOLATED_SANDBOX', 'STAGING_DRILL', 'DISASTER_RECOVERY_CLUSTER', 'PRODUCTION_CONTROLLED'],
    default: 'ISOLATED_SANDBOX',
    index: true
  },
  requestedBy: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  reason: {
    type: String,
    required: true
  },
  potentialImpact: {
    affectedCampuses: [String],
    estimatedDowntimeMinutes: { type: Number, default: 0 },
    dataOverwriteWarning: { type: Boolean, default: true },
    recordsCount: { type: Number, default: 1565 }
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'PENDING_APPROVAL',
    index: true
  },
  approvedBy: {
    userId: { type: String, default: null },
    name: { type: String, default: null },
    role: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    remarks: { type: String, default: null }
  },
  workflowStep: {
    type: Number,
    min: 1,
    max: 8,
    default: 1
    // 1: Requested
    // 2: Target Environment Identified
    // 3: Potential Impact Reviewed
    // 4: Dual Authorized & Approved
    // 5: Controlled Recovery Performed
    // 6: Data Integrity Checked
    // 7: System Validated
    // 8: Recovery Logged in Audit Ledger
  },
  stepDetails: [{
    stepNumber: Number,
    stepName: String,
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] },
    executedAt: Date,
    operator: String,
    details: String
  }],
  recoveryStatus: {
    type: String,
    enum: ['QUEUED', 'IN_PROGRESS', 'VALIDATING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'QUEUED',
    index: true
  },
  integrityCheckResult: {
    checksumMatch: { type: Boolean, default: true },
    recordsReconciled: { type: Number, default: 0 },
    discrepancies: { type: Number, default: 0 }
  },
  validationSummary: {
    type: String,
    default: null
  },
  auditLogRef: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const BackupRecord = mongoose.models.BackupRecord || mongoose.model('BackupRecord', BackupRecordSchema);
const RecoveryRequest = mongoose.models.RecoveryRequest || mongoose.model('RecoveryRequest', RecoveryRequestSchema);

module.exports = {
  BackupRecord,
  BackupRecordSchema,
  RecoveryRequest,
  RecoveryRequestSchema
};

