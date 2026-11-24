/**
 * Privacy-Conscious In-House Analytics Model
 * In compliance with Indian DPDP Act 2023 - No third-party trackers, student PII excluded
 */
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      index: true,
    },
    action: {
      type: String,
    },
    userRole: {
      type: String,
      index: true,
    },
    institutionId: {
      type: String,
      default: 'INST-SRIVIDYA-001',
    },
    durationMs: {
      type: Number,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    anonymizedIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
