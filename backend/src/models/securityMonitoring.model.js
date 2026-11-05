/**
 * Sri Vidya Educational Trust - Security & Access Monitoring Models
 * Module 9: Real-time Threat Defense, Security Events Register,
 * Privileged Access Reviews, and Incident Lifecycle Workflow
 */

const mongoose = require('mongoose');

// 9.4 Security Incident Workflow Stages
const INCIDENT_WORKFLOW_STAGES = [
  'Alert Detected',
  'Triage',
  'Assign Investigator',
  'Investigate',
  'Under Investigation',
  'Contain or Remediate',
  'Validate Resolution',
  'Close',
  'Escalated'
];

const RISK_CLASSIFICATIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

// 9.2 Security Event Schema
const SecurityEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
    // e.g. 'BRUTE_FORCE_PROBE', 'OFF_HOURS_PRIVILEGED_LOGIN', 'UNUSUAL_CROSS_CAMPUS_ACCESS', 'SENSITIVE_DATA_EXPORT_SPIKE', 'CREDENTIAL_STUFFING'
  },
  userId: {
    type: String,
    default: 'ANONYMOUS',
    index: true
  },
  userName: {
    type: String,
    default: 'Unauthenticated Remote Client'
  },
  userRole: {
    type: String,
    default: 'External'
  },
  institutionId: {
    type: String,
    required: true,
    default: 'TRUST-ALL',
    index: true
  },
  institutionName: {
    type: String,
    default: 'Sri Vidya Educational Trust'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  riskClassification: {
    type: String,
    enum: RISK_CLASSIFICATIONS,
    default: 'MEDIUM',
    index: true
  },
  status: {
    type: String,
    enum: INCIDENT_WORKFLOW_STAGES,
    default: 'Alert Detected',
    index: true
  },
  assignedInvestigator: {
    userId: { type: String, default: null },
    name: { type: String, default: 'Unassigned' },
    assignedAt: { type: Date, default: null },
    slaTargetHours: { type: Number, default: 4 }
  },
  findings: {
    rootCause: { type: String, default: null },
    evidence: { type: String, default: null },
    remediationNotes: { type: String, default: null },
    recordedBy: { type: String, default: null },
    recordedAt: { type: Date, default: null }
  },
  escalationDetails: {
    isEscalated: { type: Boolean, default: false },
    escalationLevel: { type: String, enum: ['L1_OPERATIONS', 'L2_LEADERSHIP', 'L3_EXECUTIVE_SENATE'], default: null },
    reason: { type: String, default: null },
    escalatedBy: { type: String, default: null },
    escalatedAt: { type: Date, default: null }
  },
  telemetry: {
    ipAddress: { type: String, default: '127.0.0.1' },
    location: { type: String, default: 'Visakhapatnam, AP, India' },
    userAgent: { type: String, default: 'Mozilla/5.0' },
    failedAttemptsCount: { type: Number, default: 0 },
    sessionTerminated: { type: Boolean, default: false }
  },
  timeline: [{
    stage: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }]
}, {
  timestamps: true
});

// 9.3 Privileged Access Review Schema
const PrivilegedAccessReviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  institutionScope: {
    type: String,
    required: true
    // e.g. 'TRUST-ALL (Multi-Tenant Central)', 'INST-001 (Main Campus)'
  },
  privilegedRoles: {
    type: [String],
    required: true
    // e.g. ['Platform Owner', 'Super Administrator']
  },
  lastAccess: {
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: '127.0.0.1' },
    device: { type: String, default: 'Authorized Workstation' }
  },
  businessJustification: {
    type: String,
    required: true
  },
  reviewDueDate: {
    type: Date,
    required: true,
    index: true
  },
  reviewerName: {
    type: String,
    required: true,
    default: 'Trust Security Auditor'
  },
  reviewStatus: {
    type: String,
    enum: ['Pending Review', 'Confirmed', 'Clarification Requested', 'Permissions Reduced', 'Role Revoked'],
    default: 'Pending Review',
    index: true
  },
  outcomeDetails: {
    decision: { type: String, default: null },
    decisionNotes: { type: String, default: null },
    recordedBy: { type: String, default: null },
    recordedAt: { type: Date, default: null }
  }
}, {
  timestamps: true
});

const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);
const PrivilegedAccessReview = mongoose.models.PrivilegedAccessReview || mongoose.model('PrivilegedAccessReview', PrivilegedAccessReviewSchema);

module.exports = {
  SecurityEvent,
  SecurityEventSchema,
  PrivilegedAccessReview,
  PrivilegedAccessReviewSchema,
  INCIDENT_WORKFLOW_STAGES,
  RISK_CLASSIFICATIONS
};
