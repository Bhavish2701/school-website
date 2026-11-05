/**
 * Sri Vidya Educational Trust - Integrations & API Management Models
 * Module 13: Integrations Directory, Configuration, API Clients, and Event Logs
 */

const mongoose = require('mongoose');

// 13.1 & 13.2 Integration Schema
const IntegrationSchema = new mongoose.Schema({
  integrationId: {
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
  provider: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'EMAIL_DELIVERY',
      'SMS_PROVIDER',
      'PAYMENT_GATEWAY',
      'FILE_STORAGE',
      'IDENTITY_PROVIDER',
      'BACKUP_SERVICE',
      'EXTERNAL_SCHOOL_SYSTEM'
    ],
    required: true,
    index: true
  },
  institutionScope: {
    type: String,
    default: 'ALL_CAMPUSES',
    index: true
  },
  environment: {
    type: String,
    enum: ['PRODUCTION', 'SANDBOX', 'STAGING'],
    default: 'PRODUCTION',
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  credentialRef: {
    type: String,
    required: true
    // Invariant: Section 13.2 - Secret reference in secure manager (e.g. vault://kms/...)
  },
  credentialMasked: {
    type: String,
    default: '••••••••••••a8f3'
  },
  scopes: [{
    type: String
  }],
  webhookConfig: {
    url: { type: String, default: null },
    secretRef: { type: String, default: null },
    secretMasked: { type: String, default: '••••••••whsec_99a1' },
    subscribedEvents: [{ type: String }]
  },
  retryPolicy: {
    maxRetries: { type: Number, default: 3 },
    backoffStrategy: { type: String, enum: ['EXPONENTIAL', 'LINEAR', 'FIXED'], default: 'EXPONENTIAL' },
    timeoutSeconds: { type: Number, default: 15 }
  },
  connectionStatus: {
    type: String,
    enum: ['CONNECTED', 'DEGRADED', 'DISCONNECTED', 'DISABLED', 'CONFIGURATION_REQUIRED'],
    default: 'CONNECTED',
    index: true
  },
  lastSuccessfulSync: {
    type: Date,
    default: Date.now
  },
  lastError: {
    type: String,
    default: null
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 13.3 API Management Schema (External API Clients)
const ApiClientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  ownership: {
    organization: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true }
  },
  grantedScopes: [{
    type: String
  }],
  rateLimit: {
    requestsPerMinute: { type: Number, default: 60 },
    dailyLimit: { type: Number, default: 10000 }
  },
  credentialStatus: {
    type: String,
    enum: ['ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED'],
    default: 'ACTIVE',
    index: true
  },
  credentialMasked: {
    type: String,
    default: 'sk_live_••••••••••••3b91'
  },
  usageStats: {
    totalRequests24h: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 24 },
    errorCount24h: { type: Number, default: 0 },
    lastRequestAt: { type: Date, default: Date.now }
  },
  revocationHistory: [{
    revokedAt: { type: Date },
    revokedBy: { type: String },
    reason: { type: String }
  }]
}, {
  timestamps: true
});

// 13.4 Integration Event Logs Schema (With Payment Reconciliation Distinction)
const IntegrationEventLogSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  integrationId: {
    type: String,
    required: true,
    index: true
  },
  integrationName: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  institutionScope: {
    type: String,
    default: 'ALL_CAMPUSES',
    index: true
  },
  eventTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  correlationId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING_RETRY', 'WEBHOOK_RECEIVED', 'INDEPENDENTLY_RECONCILED'],
    default: 'SUCCESS',
    index: true
  },
  isPayment: {
    type: Boolean,
    default: false,
    index: true
  },
  paymentVerificationStatus: {
    type: String,
    enum: ['UNVERIFIED_NOTIFICATION', 'INDEPENDENTLY_RECONCILED', 'NOT_APPLICABLE'],
    default: 'NOT_APPLICABLE',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
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

const Integration = mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema);
const ApiClient = mongoose.models.ApiClient || mongoose.model('ApiClient', ApiClientSchema);
const IntegrationEventLog = mongoose.models.IntegrationEventLog || mongoose.model('IntegrationEventLog', IntegrationEventLogSchema);

module.exports = {
  Integration,
  IntegrationSchema,
  ApiClient,
  ApiClientSchema,
  IntegrationEventLog,
  IntegrationEventLogSchema
};

