const mongoose = require('mongoose');

const policyVersionSchema = new mongoose.Schema(
  {
    policyType: {
      type: String,
      enum: [
        'PRIVACY_POLICY',
        'TERMS_OF_SERVICE',
        'COOKIE_POLICY',
        'FEE_AND_REFUND_POLICY',
        'PARENTAL_CONSENT_CHARTER',
        'DATA_RETENTION_SCHEDULE',
        'DATA_BREACH_RESPONSE_PLAN',
      ],
      required: true,
      index: true,
    },
    version: {
      type: String,
      required: true,
      default: 'v1.0.0',
    },
    title: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    changeSummary: {
      type: String,
      required: true,
    },
    approvalAuthority: {
      type: String,
      default: 'Principal & Sri Vidya Legal Advisory Directorate',
    },
    isCurrentActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    legalReviewStatus: {
      type: String,
      enum: [
        'PREPARED_FRAMEWORK_AWAITING_EXTERNAL_COUNSEL',
        'APPROVED_BY_LEGAL_COUNSEL',
        'STATUTORY_REVISION_MANDATED',
      ],
      default: 'PREPARED_FRAMEWORK_AWAITING_EXTERNAL_COUNSEL',
    },
    documentPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

policyVersionSchema.index({ policyType: 1, version: 1 });

module.exports = mongoose.model('PolicyVersion', policyVersionSchema);
