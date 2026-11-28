const mongoose = require('mongoose');

const CONSENT_TYPES = [
  'COOKIE_ESSENTIAL',
  'COOKIE_FUNCTIONAL',
  'COOKIE_ANALYTICS',
  'COMMUNICATION_SMS',
  'MARKETING_SMS',
  'MARKETING_WHATSAPP',
  'MARKETING_EMAIL',
  'TELEMETRY_ANALYTICS',
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'PARENTAL_CONSENT_STUDENT_DATA',
];

const consentRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userRole: {
      type: String,
      default: 'ANONYMOUS',
      index: true,
    },
    guardianUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    studentAdmissionNo: {
      type: String,
      trim: true,
      default: null,
    },
    consentType: {
      type: String,
      enum: CONSENT_TYPES,
      required: [true, 'Consent type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['GRANTED', 'REVOKED'],
      required: true,
      default: 'GRANTED',
      index: true,
    },
    policyVersion: {
      type: String,
      default: 'v1.0.0',
    },
    ipAddress: {
      type: String,
      default: '0.0.0.0',
    },
    userAgent: {
      type: String,
      default: '',
    },
    legalBasis: {
      type: String,
      enum: [
        'EXPLICIT_CONSENT',
        'PARENTAL_GUARDIAN_CONSENT',
        'LEGAL_OBLIGATION_STATUTORY',
        'CONTRACTUAL_NECESSITY',
        'LEGITIMATE_EDUCATIONAL_PURPOSE',
      ],
      default: 'EXPLICIT_CONSENT',
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

consentRecordSchema.index({ userId: 1, consentType: 1 });
consentRecordSchema.index({ createdAt: -1 });

module.exports = {
  ConsentRecord: mongoose.model('ConsentRecord', consentRecordSchema),
  CONSENT_TYPES,
};
