/**
 * Sri Vidya Educational Trust - System Health & Deployment Models
 * Module 11: Service Health Telemetry, Deployment History, Sanitized Logs & Background Jobs
 */

const mongoose = require('mongoose');

// 11.2 Deployment History Schema
const DeploymentHistorySchema = new mongoose.Schema({
  deploymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  application: {
    type: String,
    default: 'Platform API'
  },
  service: {
    type: String,
    default: 'Platform API',
    index: true
  },
  environment: {
    type: String,
    default: 'PRODUCTION',
    index: true
  },
  version: {
    type: String,
    required: true
  },
  commitRef: {
    type: String,
    required: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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
    default: 'SUCCESS',
    index: true
  },
  isRollback: {
    type: Boolean,
    default: false
  },
  rollbackSourceId: {
    type: String,
    default: null
  },
  errorSummary: {
    type: String,
    default: null
  },
  healthCheckStatus: {
    type: String,
    default: 'PASSED'
  },
  rollbackSupported: {
    type: Boolean,
    default: true
  },
  releaseNotes: {
    type: String,
    default: ''
  },
  changelog: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// 11.3 Sanitized Application Log Schema
const AppLogSchema = new mongoose.Schema({
  logId: {
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
  service: {
    type: String,
    required: true,
    index: true
  },
  level: {
    type: String,
    default: 'INFO',
    index: true
  },
  requestId: {
    type: String,
    default: null,
    index: true
  },
  category: {
    type: String,
    default: 'SYSTEM',
    index: true
  },
  deploymentVersion: {
    type: String,
    default: 'v2.4.1'
  },
  message: {
    type: String,
    required: true
  },
  stackTrace: {
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

// 11.4 Background Job Schema
const BackgroundJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'SYSTEM',
    index: true
  },
  cronSchedule: {
    type: String,
    required: true
  },
  lastRun: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'COMPLETED',
    index: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isIdempotent: {
    type: Boolean,
    default: true
    // Invariant: Section 11.4 - Must be safe against duplicate emails, payments, records
  },
  errorSummary: {
    type: String,
    default: null
  },
  nextScheduledRun: {
    type: Date,
    required: true
  },
  durationMs: {
    type: Number,
    default: 450
  }
}, {
  timestamps: true
});

const DeploymentHistory = mongoose.models.DeploymentHistory || mongoose.model('DeploymentHistory', DeploymentHistorySchema);
const AppLog = mongoose.models.AppLog || mongoose.model('AppLog', AppLogSchema);
const BackgroundJob = mongoose.models.BackgroundJob || mongoose.model('BackgroundJob', BackgroundJobSchema);

module.exports = {
  DeploymentHistory,
  DeploymentHistorySchema,
  AppLog,
  AppLogSchema,
  BackgroundJob,
  BackgroundJobSchema
};
