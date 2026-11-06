/**
 * Sri Vidya Educational Trust - Platform Policies & Data Retention Model
 * Module 17: Governance Policy Register, Granular Retention Rules, and Controlled Data Requests
 */

const mongoose = require('mongoose');

// 17.1 Policy Register Schema
const GovernancePolicySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'ACCOUNT_SECURITY',
      'DATA_ACCESS',
      'DATA_RETENTION',
      'DOCUMENT_STORAGE',
      'BACKUP_RETENTION',
      'AUDIT_LOGGING',
      'DATA_EXPORTS',
      'INCIDENT_RESPONSE'
    ],
    required: true,
    index: true
  },
  version: {
    type: String,
    default: 'v1.0'
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: String,
    default: 'Trust Legal & Compliance Directorate'
  },
  approvalStatus: {
    type: String,
    enum: ['APPROVED', 'UNDER_REVIEW', 'DRAFT', 'SUPERSEDED'],
    default: 'APPROVED',
    index: true
  },
  reviewDate: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 3600 * 1000)
  },
  scopeDescription: {
    type: String,
    required: true
  },
  contentSummary: {
    type: String
  }
}, {
  timestamps: true
});

// 17.2 Data Retention Rule Schema
const RetentionVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  retentionRule: { type: String, required: true },
  retentionYears: { type: Number, required: true },
  changedBy: { type: String, default: 'Trust Governance Officer' },
  approvedBy: { type: String },
  effectiveDate: { type: Date, default: Date.now },
  changeSummary: { type: String }
}, { _id: false });

const RetentionRuleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  recordCategory: {
    type: String,
    required: true,
    index: true
  },
  applicableInstitution: {
    type: String,
    default: 'ALL',
    index: true
  },
  retentionRule: {
    type: String,
    required: true
  },
  retentionYears: {
    type: Number,
    required: true // -1 = PERMANENT, otherwise number of years
  },
  legalBasis: {
    type: String,
    required: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    default: 'State Board of Education & Trust Legal Directorate'
  },
  reviewStatus: {
    type: String,
    enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED'],
    default: 'PUBLISHED',
    index: true
  },
  isStatutoryPermanent: {
    type: Boolean,
    default: false
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  versions: [RetentionVersionSchema]
}, {
  timestamps: true
});

// 17.3 Data Requests Schema
const DataRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  requestType: {
    type: String,
    enum: [
      'RECORD_ACCESS',
      'DATA_CORRECTION',
      'DATA_EXPORT',
      'RETENTION_EXCEPTION',
      'DELETION_ANONYMIZATION'
    ],
    required: true,
    index: true
  },
  institutionScope: {
    type: String,
    required: true,
    index: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterRole: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true
  },
  targetSubject: {
    type: String,
    required: true
  },
  businessJustification: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'FULFILLED'],
    default: 'SUBMITTED',
    index: true
  },
  authorizedSignoffs: [{
    signoffBy: String,
    role: String,
    timestamp: Date,
    notes: String
  }],
  rejectionReason: {
    type: String,
    default: null
  },
  fulfillmentDetails: {
    type: String,
    default: null
  },
  fulfilledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const GovernancePolicy = mongoose.models.GovernancePolicy || mongoose.model('GovernancePolicy', GovernancePolicySchema);
const RetentionRule = mongoose.models.RetentionRule || mongoose.model('RetentionRule', RetentionRuleSchema);
const DataRequest = mongoose.models.DataRequest || mongoose.model('DataRequest', DataRequestSchema);

module.exports = {
  GovernancePolicy,
  RetentionRule,
  DataRequest
};

