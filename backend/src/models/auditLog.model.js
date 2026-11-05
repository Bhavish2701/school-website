/**
 * AuditLog Mongoose Model
 * Specification 22.4: Every sensitive change needs traceability
 * Record the responsible user, timestamp, reason and relevant old/new values
 * for important changes to student details, attendance, marks, financial transactions and permissions.
 *
 * Immutability Guarantee:
 * Audit logs cannot be updated or deleted by ordinary users or administration.
 */
const mongoose = require('mongoose');

const AUDIT_MODULES = [
  'STUDENTS',
  'ADMISSIONS',
  'ATTENDANCE',
  'MARKS',
  'FEES',
  'STAFF',
  'PERMISSIONS',
  'SETTINGS',
  'COMMUNICATION',
  'TRANSFERS',
];

const AUDIT_RESULTS = ['SUCCESS', 'DENIED', 'REVERSED'];

const changedFieldSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: [true, 'Responsible user name is required for traceability'],
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Responsible role is required'],
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action performed is required'],
      trim: true,
      index: true,
    },
    module: {
      type: String,
      enum: {
        values: AUDIT_MODULES,
        message: '{VALUE} is not a valid audit module',
      },
      required: [true, 'Module domain is required'],
      index: true,
    },
    recordReference: {
      type: String,
      required: [true, 'Target record reference (ID/AdmNo) is required'],
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Mandatory reason is required for every sensitive change'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters for accountability'],
    },
    changedFields: [changedFieldSchema],
    result: {
      type: String,
      enum: AUDIT_RESULTS,
      default: 'SUCCESS',
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      trim: true,
      default: 'Sri Vidya Web Client',
    },
    isImmutable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Immutability Hook: Prevent updating existing audit logs
const preventModification = function (next) {
  const err = new Error(
    'Audit Log Immutability Violation: Audit records are permanently protected from modification or deletion under AP Education Code statutory rules.'
  );
  next(err);
};

auditLogSchema.pre('updateOne', preventModification);
auditLogSchema.pre('updateMany', preventModification);
auditLogSchema.pre('findOneAndUpdate', preventModification);
auditLogSchema.pre('deleteOne', preventModification);
auditLogSchema.pre('deleteMany', preventModification);
auditLogSchema.pre('findOneAndDelete', preventModification);

// Composite indexes for audit compliance queries
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ recordReference: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
  AuditLog,
  AUDIT_MODULES,
  AUDIT_RESULTS,
};
