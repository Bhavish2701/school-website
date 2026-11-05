/**
 * Sri Vidya Educational Trust - Subscriptions, Plans & Entitlements Models
 * Module 10: Multi-Tenant Commercial Plans Directory, Institution Subscriptions,
 * Usage Tracking, and Statutory Record Non-Disruption Guarantees
 */

const mongoose = require('mongoose');

// 10.1 Commercial Plan Schema
const PlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  includedFeatures: [{
    type: String,
    trim: true
  }],
  limits: {
    maxStudents: { type: Number, default: 1000 },
    maxStaff: { type: Number, default: 100 },
    storageGB: { type: Number, default: 100 },
    apiRequestsPerDay: { type: Number, default: 25000 }
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingInterval: {
    type: String,
    enum: ['Annual', 'Termly', 'Perpetual', 'Monthly'],
    default: 'Annual'
  },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Archived'],
    default: 'Published',
    index: true
  },
  entitlements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 10.2 Institution Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: {
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
  institutionName: {
    type: String,
    required: true
  },
  planId: {
    type: String,
    required: true,
    index: true
  },
  planName: {
    type: String,
    required: true
  },
  planCode: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  renewalDate: {
    type: Date,
    required: true,
    index: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Renewed', 'In Grace Period', 'Suspended', 'Cancelled'],
    default: 'Active',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Waived (Internal Trust)', 'Overdue'],
    default: 'Paid',
    index: true
  },
  usage: {
    activeStudents: { type: Number, default: 0 },
    activeStaff: { type: Number, default: 0 },
    storageUsedGB: { type: Number, default: 0 },
    apiRequestsToday: { type: Number, default: 0 }
  },
  billingAdjustments: [{
    adjustmentId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT', 'CONCESSION', 'WAIVER'], default: 'CONCESSION' },
    reason: { type: String, required: true },
    authorizedBy: { type: String, required: true }
  }],
  contractualNotes: {
    type: String,
    default: 'AP Education Code statutory mandate: Record read access and student report exports preserved unconditionally.'
  }
}, {
  timestamps: true
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

module.exports = {
  Plan,
  PlanSchema,
  Subscription,
  SubscriptionSchema
};

