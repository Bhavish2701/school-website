
const mongoose = require('mongoose');
const crypto = require('crypto');

const AUDIT_EVENT_CATEGORIES = [
  'AUTH_ACCOUNTS',
  'INSTITUTIONS',
  'RBAC_PERMISSIONS',
  'SCHOOL_CONFIG',
  'INTEGRATIONS',
  'DATA_IMPORT_EXPORT',
  'BACKUP_RECOVERY',
  'ADMIN_SUPPORT',
  'SECURITY_ALERTS',
  'DEPLOYMENT_OPS'
];

const AUDIT_EVENT_RESULTS = ['SUCCESS', 'FAILED', 'DENIED', 'WARNING'];
const AUDIT_SEVERITY_LEVELS = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const ChangedFieldSchema = new mongoose.Schema({
  field: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const PlatformAuditSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  correlationId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: AUDIT_EVENT_CATEGORIES,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  actor: {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    scope: { type: String, enum: ['Platform', 'Institution'], default: 'Platform' },
    ipAddress: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: 'Platform Operator Console' }
  },
  institutionId: {
    type: String,
    required: true,
    default: 'TRUST-ALL',
    index: true
  },
  institutionName: {
    type: String,
    required: true,
    default: 'Sri Vidya Educational Trust (Multi-Tenant Central)'
  },
  targetEntity: {
    entityType: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    displayName: { type: String, required: true }
  },
  result: {
    type: String,
    enum: AUDIT_EVENT_RESULTS,
    default: 'SUCCESS',
    index: true
  },
  severity: {
    type: String,
    enum: AUDIT_SEVERITY_LEVELS,
    default: 'INFO',
    index: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  changedFields: [ChangedFieldSchema],
  tamperSealHash: {
    type: String,
    required: true
  },
  relatedSecurityEventId: {
    type: String,
    default: null
  },
  isImmutable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const preventModificationOrDeletion = function (next) {
  const err = new Error(
    'Audit Log Immutability Violation: Audit records are permanently protected from modification or deletion under statutory retention rules.'
  );
  next(err);
};

PlatformAuditSchema.pre('updateOne', preventModificationOrDeletion);
PlatformAuditSchema.pre('updateMany', preventModificationOrDeletion);
PlatformAuditSchema.pre('findOneAndUpdate', preventModificationOrDeletion);
PlatformAuditSchema.pre('deleteOne', preventModificationOrDeletion);
PlatformAuditSchema.pre('deleteMany', preventModificationOrDeletion);
PlatformAuditSchema.pre('findOneAndDelete', preventModificationOrDeletion);

PlatformAuditSchema.statics.generateTamperSeal = function (payload) {
  const content = `${payload.eventId}|${payload.timestamp}|${payload.actor?.userId}|${payload.action}|${payload.result}|${payload.reason}`;
  return crypto.createHash('sha256').update(content).digest('hex');
};

const PlatformAudit = mongoose.models.PlatformAudit || mongoose.model('PlatformAudit', PlatformAuditSchema);

module.exports = {
  PlatformAudit,
  PlatformAuditSchema,
  AUDIT_EVENT_CATEGORIES,
  AUDIT_EVENT_RESULTS,
  AUDIT_SEVERITY_LEVELS
};

