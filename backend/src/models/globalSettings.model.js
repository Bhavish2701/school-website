/**
 * Sri Vidya Educational Trust - Global Platform Settings Model
 * Module 16: General Settings, Authentication Policies, Platform Feature Controls, and Maintenance Safeguards
 */

const mongoose = require('mongoose');

// 16.3 Feature Control Subdocuments
const FeatureChangeHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  operator: { type: String, default: 'Platform Administrator' },
  previousStatus: { type: String },
  newStatus: { type: String },
  changeNote: { type: String }
}, { _id: false });

const FeatureControlSchema = new mongoose.Schema({
  featureKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  featureName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    enum: ['GLOBAL_ENABLED', 'INSTITUTION_PILOT', 'BETA_TEST', 'DISABLED'],
    default: 'DISABLED',
    index: true
  },
  applicableInstitutions: [{
    type: String // e.g. 'ALL', 'SV-MAIN', 'SV-PRIMARY', 'SV-VILLAGE'
  }],
  rolloutStatus: {
    type: String,
    enum: ['GA', 'PILOT', 'BETA', 'DRAFT', 'DEPRECATED'],
    default: 'DRAFT',
    index: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  changeHistory: [FeatureChangeHistorySchema]
}, {
  timestamps: true
});

// 16.4 Maintenance History Subdocument
const MaintenanceEventHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true }, // e.g. 'SCHEDULED', 'ACTIVATED', 'ENDED'
  operator: { type: String, default: 'Platform Administrator' },
  details: { type: String }
}, { _id: false });

// 16.1 - 16.4 Global Settings Master Schema
const GlobalSettingsSchema = new mongoose.Schema({
  settingsId: {
    type: String,
    default: 'PLATFORM_GLOBAL_SETTINGS',
    unique: true,
    index: true
  },

  // 16.1 General Settings
  general: {
    platformName: {
      type: String,
      default: 'Sri Vidya Educational Trust ERP Platform'
    },
    platformLogo: {
      type: String,
      default: '/images/srividya-logo.png'
    },
    defaultLocale: {
      type: String,
      default: 'en-IN'
    },
    defaultTimeZone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    supportedLanguages: {
      type: [String],
      default: ['en-IN', 'te-IN', 'hi-IN']
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    publicSupportContact: {
      email: {
        type: String,
        default: 'support@srividya.edu.in'
      },
      phone: {
        type: String,
        default: '+91 94402 33445'
      },
      emergencyDesk: {
        type: String,
        default: 'escalations@srividya.edu.in'
      }
    },
    defaultNotificationPreferences: {
      emailEnabled: {
        type: Boolean,
        default: true
      },
      smsEnabled: {
        type: Boolean,
        default: true
      },
      whatsappEnabled: {
        type: Boolean,
        default: true
      },
      digestFrequency: {
        type: String,
        enum: ['REALTIME', 'DAILY_DIGEST', 'WEEKLY'],
        default: 'REALTIME'
      }
    }
  },

  // 16.2 Authentication Settings & Safety Invariants
  authentication: {
    passwordRequirements: {
      minLength: {
        type: Number,
        default: 10,
        min: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      },
      passwordExpiryDays: {
        type: Number,
        default: 90
      },
      preventReuseCount: {
        type: Number,
        default: 5
      }
    },
    sessionDuration: {
      inactivityTimeoutMinutes: {
        type: Number,
        default: 30,
        min: 5,
        max: 240
      },
      maxSessionLifetimeHours: {
        type: Number,
        default: 12,
        min: 1,
        max: 72
      }
    },
    mfaPolicy: {
      enforcement: {
        type: String,
        enum: ['DISABLED', 'OPTIONAL', 'REQUIRED_FOR_ADMINS', 'REQUIRED_FOR_ALL'],
        default: 'REQUIRED_FOR_ADMINS'
      },
      allowedMethods: {
        type: [String],
        default: ['TOTP', 'SMS_OTP', 'EMAIL_OTP']
      }
    },
    loginAttemptLimits: {
      maxFailedAttempts: {
        type: Number,
        default: 5,
        min: 3,
        max: 15
      },
      lockoutDurationMinutes: {
        type: Number,
        default: 15,
        min: 5,
        max: 1440
      },
      autoUnlockAfterTimeout: {
        type: Boolean,
        default: true
      }
    },
    accountRecoveryRules: {
      selfServiceResetEnabled: {
        type: Boolean,
        default: true
      },
      recoveryLinkValidityMinutes: {
        type: Number,
        default: 30,
        min: 5,
        max: 120
      },
      requireIdentityVerification: {
        type: Boolean,
        default: true
      }
    },
    // Invariant: At least one safe recovery method must ALWAYS remain active
    supportedAuthMethods: {
      localPassword: {
        type: Boolean,
        default: true
      },
      googleWorkspaceSSO: {
        type: Boolean,
        default: true
      },
      microsoftEntraID: {
        type: Boolean,
        default: false
      },
      samlFederation: {
        type: Boolean,
        default: false
      }
    },
    breakGlassEmergencyAccessEnabled: {
      type: Boolean,
      default: true
    }
  },

  // 16.4 Maintenance Settings & Safeguards
  maintenance: {
    isActive: {
      type: Boolean,
      default: false,
      index: true
    },
    // Invariant: Administrators and recovery operations can NEVER be locked out
    operatorLockoutProtection: {
      type: Boolean,
      default: true
    },
    plannedWindow: {
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null }
    },
    affectedServices: {
      type: [String],
      default: ['PUBLIC_WEBSITE', 'FACULTY_PORTAL', 'STUDENT_PORTAL']
    },
    userFacingMessage: {
      type: String,
      default: 'Sri Vidya Educational Trust ERP is undergoing scheduled maintenance. Administrative and emergency services remain operational.'
    },
    authorizedOperator: {
      type: String,
      default: 'Platform Administrator'
    },
    history: [MaintenanceEventHistorySchema]
  }
}, {
  timestamps: true
});

const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', GlobalSettingsSchema);
const FeatureControl = mongoose.models.FeatureControl || mongoose.model('FeatureControl', FeatureControlSchema);

module.exports = {
  GlobalSettings,
  FeatureControl
};

