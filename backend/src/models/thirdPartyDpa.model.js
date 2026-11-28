const mongoose = require('mongoose');

const thirdPartyDpaSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: [
        'CLOUD_HOSTING_INFRASTRUCTURE',
        'PAYMENT_GATEWAY',
        'SMS_COMMUNICATION_GATEWAY',
        'WHATSAPP_BUSINESS_API',
        'TRANSACTIONAL_EMAIL',
        'BACKUP_STORAGE_VAULT',
      ],
      required: true,
      index: true,
    },
    dataCategoriesShared: [
      {
        type: String,
      },
    ],
    serverJurisdiction: {
      type: String,
      default: 'India (ap-south-1 Mumbai)',
      required: true,
    },
    dpaExecutionDate: {
      type: Date,
      default: Date.now,
    },
    dpaExpiryDate: {
      type: Date,
    },
    dpaStatus: {
      type: String,
      enum: ['ACTIVE', 'PENDING_RENEWAL', 'TERMINATED', 'UNDER_REVIEW'],
      default: 'ACTIVE',
      index: true,
    },
    securityCertifications: [
      {
        type: String,
      },
    ],
    contactEmail: {
      type: String,
    },
    purposeDescription: {
      type: String,
      required: true,
    },
    dataProtectionOfficerContact: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ThirdPartyDpa', thirdPartyDpaSchema);
