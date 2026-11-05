/**
 * Sri Vidya Educational Trust - Global Platform Settings Service
 * Module 16: General Settings, Authentication Policies, Platform Feature Controls, and Maintenance Safeguards
 */

const mongoose = require('mongoose');
const { GlobalSettings, FeatureControl } = require('../models/globalSettings.model');
const { PlatformAuditLog } = require('../models/platformAudit.model');

// In-Memory Fallbacks & Defaults
let inMemorySettings = null;
let inMemoryFeatures = [];

function initializeDefaults() {
  inMemorySettings = {
    settingsId: 'PLATFORM_GLOBAL_SETTINGS',
    general: {
      platformName: 'Sri Vidya Educational Trust ERP Platform',
      platformLogo: '/images/srividya-logo.png',
      defaultLocale: 'en-IN',
      defaultTimeZone: 'Asia/Kolkata',
      supportedLanguages: ['en-IN', 'te-IN', 'hi-IN'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      publicSupportContact: {
        email: 'support@srividya.edu.in',
        phone: '+91 94402 33445',
        emergencyDesk: 'escalations@srividya.edu.in'
      },
      defaultNotificationPreferences: {
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: true,
        digestFrequency: 'REALTIME'
      }
    },
    authentication: {
      passwordRequirements: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: 90,
        preventReuseCount: 5
      },
      sessionDuration: {
        inactivityTimeoutMinutes: 30,
        maxSessionLifetimeHours: 12
      },
      mfaPolicy: {
        enforcement: 'REQUIRED_FOR_ADMINS',
        allowedMethods: ['TOTP', 'SMS_OTP', 'EMAIL_OTP']
      },
      loginAttemptLimits: {
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
        autoUnlockAfterTimeout: true
      },
      accountRecoveryRules: {
        selfServiceResetEnabled: true,
        recoveryLinkValidityMinutes: 30,
        requireIdentityVerification: true
      },
      supportedAuthMethods: {
        localPassword: true,
        googleWorkspaceSSO: true,
        microsoftEntraID: false,
        samlFederation: false
      },
      breakGlassEmergencyAccessEnabled: true
    },
    maintenance: {
      isActive: false,
      operatorLockoutProtection: true,
      plannedWindow: {
        startTime: null,
        endTime: null
      },
      affectedServices: ['PUBLIC_WEBSITE', 'FACULTY_PORTAL', 'STUDENT_PORTAL'],
      userFacingMessage: 'Sri Vidya Educational Trust ERP is undergoing scheduled maintenance. Administrative and emergency services remain operational.',
      authorizedOperator: 'Platform Administrator',
      history: [
        {
          timestamp: new Date(Date.now() - 3600000 * 24 * 7),
          action: 'SCHEDULED_UPGRADE_COMPLETED',
          operator: 'System DevOps Lead',
          details: 'Core platform database migration and SSL cert rollover completed with zero downtime.'
        }
      ]
    }
  };

  inMemoryFeatures = [
    {
      featureKey: 'parent_portal',
      featureName: 'Parent Self-Service Portal (Module 20.2)',
      description: 'Permits parents to review real-time academic progress, attendance records, exam results, and fee transactions.',
      availability: 'INSTITUTION_PILOT',
      applicableInstitutions: ['SV-MAIN'],
      rolloutStatus: 'PILOT',
      effectiveDate: new Date('2026-09-01'),
      changeHistory: [
        {
          timestamp: new Date('2026-09-01'),
          operator: 'Platform Administrator',
          previousStatus: 'DRAFT',
          newStatus: 'PILOT',
          changeNote: 'Initiated pilot rollout for Sri Vidya High School (SV-MAIN) parents.'
        }
      ]
    },
    {
      featureKey: 'online_fee_payments',
      featureName: 'Online Payment Gateway & UPI Collect',
      description: 'Direct parent digital fee clearance through online payment gateways with automated statutory receipt generation.',
      availability: 'GLOBAL_ENABLED',
      applicableInstitutions: ['ALL'],
      rolloutStatus: 'GA',
      effectiveDate: new Date('2026-06-01'),
      changeHistory: [
        {
          timestamp: new Date('2026-06-01'),
          operator: 'Platform Administrator',
          previousStatus: 'PILOT',
          newStatus: 'GA',
          changeNote: 'Promoted to General Availability across all Trust schools.'
        }
      ]
    },
    {
      featureKey: 'ai_admissions_ocr',
      featureName: 'AI Document OCR & Verification',
      description: 'Automated optical character recognition and tampering detection for student birth certificates and previous school transfer certificates.',
      availability: 'BETA_TEST',
      applicableInstitutions: ['SV-MAIN', 'SV-PRIMARY'],
      rolloutStatus: 'BETA',
      effectiveDate: new Date('2026-10-15'),
      changeHistory: [
        {
          timestamp: new Date('2026-10-15'),
          operator: 'Admissions Automation Lead',
          previousStatus: 'DRAFT',
          newStatus: 'BETA',
          changeNote: 'Active beta testing with 500 admission document scans.'
        }
      ]
    },
    {
      featureKey: 'biometric_attendance_sync',
      featureName: 'Biometric Device Hardware Sync',
      description: 'Real-time edge ingestion from fingerprint and RFID turnstiles directly into statutory teacher & student registers.',
      availability: 'GLOBAL_ENABLED',
      applicableInstitutions: ['ALL'],
      rolloutStatus: 'GA',
      effectiveDate: new Date('2026-05-10'),
      changeHistory: []
    },
    {
      featureKey: 'whatsapp_bot_notifications',
      featureName: 'WhatsApp Enterprise Bot Dispatcher',
      description: 'Interactive automated chatbot for parent queries regarding bus arrival, homework, and fee receipts.',
      availability: 'DISABLED',
      applicableInstitutions: [],
      rolloutStatus: 'DRAFT',
      effectiveDate: new Date('2026-11-01'),
      changeHistory: []
    }
  ];
}

initializeDefaults();

class GlobalSettingsService {
  static isMongoReady() {
    return mongoose.connection.readyState === 1;
  }

  static async _logAudit(action, recordRef, actor, details) {
    if (!this.isMongoReady()) return;
    try {
      await PlatformAuditLog.create({
        eventId: `AUD-SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(),
        actor: {
          id: 'USR-PLAT-001',
          name: actor || 'Platform Administrator',
          email: 'admin@srividya.edu.in',
          role: 'Platform Administrator',
          scope: 'Platform'
        },
        institutionId: 'PLATFORM_GLOBAL',
        module: 'Global Settings',
        action,
        targetRecord: recordRef || 'PLATFORM_GLOBAL_SETTINGS',
        result: 'SUCCESS',
        severity: action.includes('MAINTENANCE') || action.includes('AUTH') ? 'WARNING' : 'INFO',
        details: { description: details }
      });
    } catch (e) {
      // Non-blocking audit failure
    }
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) return;
    try {
      const existing = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
      if (!existing) {
        await GlobalSettings.create(inMemorySettings);
      }
      const count = await FeatureControl.countDocuments();
      if (count === 0) {
        await FeatureControl.insertMany(inMemoryFeatures);
      }
    } catch (e) {
      // Fallback
    }
  }

  // --------------------------------------------------------------------------
  // 16.1 & Master Settings Fetch
  // --------------------------------------------------------------------------
  static async getGlobalSettings() {
    await this.seedIfEmpty();
    let settings = null;
    if (this.isMongoReady()) {
      try {
        settings = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
      } catch (e) {
        settings = inMemorySettings;
      }
    }
    if (!settings) {
      settings = inMemorySettings;
    }
    return {
      success: true,
      data: settings
    };
  }

  // --------------------------------------------------------------------------
  // 16.1 General Settings Update
  // --------------------------------------------------------------------------
  static async updateGeneralSettings(payload, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const update = payload.general || payload;

    let target = null;
    if (this.isMongoReady()) {
      try {
        target = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
        if (target) {
          if (update.platformName) target.general.platformName = update.platformName.trim();
          if (update.platformLogo) target.general.platformLogo = update.platformLogo.trim();
          if (update.defaultLocale) target.general.defaultLocale = update.defaultLocale.trim();
          if (update.defaultTimeZone) target.general.defaultTimeZone = update.defaultTimeZone.trim();
          if (update.supportedLanguages) target.general.supportedLanguages = update.supportedLanguages;
          if (update.dateFormat) target.general.dateFormat = update.dateFormat.trim();
          if (update.timeFormat) target.general.timeFormat = update.timeFormat;

          if (update.publicSupportContact) {
            if (update.publicSupportContact.email) target.general.publicSupportContact.email = update.publicSupportContact.email.trim();
            if (update.publicSupportContact.phone) target.general.publicSupportContact.phone = update.publicSupportContact.phone.trim();
            if (update.publicSupportContact.emergencyDesk) target.general.publicSupportContact.emergencyDesk = update.publicSupportContact.emergencyDesk.trim();
          }

          if (update.defaultNotificationPreferences) {
            target.general.defaultNotificationPreferences = {
              ...target.general.defaultNotificationPreferences,
              ...update.defaultNotificationPreferences
            };
          }

          await target.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!target) {
      target = inMemorySettings;
      if (update.platformName) target.general.platformName = update.platformName.trim();
      if (update.platformLogo) target.general.platformLogo = update.platformLogo.trim();
      if (update.defaultLocale) target.general.defaultLocale = update.defaultLocale.trim();
      if (update.defaultTimeZone) target.general.defaultTimeZone = update.defaultTimeZone.trim();
      if (update.supportedLanguages) target.general.supportedLanguages = update.supportedLanguages;
      if (update.dateFormat) target.general.dateFormat = update.dateFormat.trim();
      if (update.timeFormat) target.general.timeFormat = update.timeFormat;

      if (update.publicSupportContact) {
        target.general.publicSupportContact = {
          ...target.general.publicSupportContact,
          ...update.publicSupportContact
        };
      }
      if (update.defaultNotificationPreferences) {
        target.general.defaultNotificationPreferences = {
          ...target.general.defaultNotificationPreferences,
          ...update.defaultNotificationPreferences
        };
      }
    }

    await this._logAudit('GENERAL_SETTINGS_UPDATED', 'PLATFORM_GLOBAL_SETTINGS', actor, 'Updated platform branding, locale, and support contact');

    return {
      success: true,
      message: 'General platform settings updated successfully.',
      data: target.general
    };
  }

  // --------------------------------------------------------------------------
  // 16.2 Authentication Settings & Safety Invariant Enforcement
  // --------------------------------------------------------------------------
  static async updateAuthenticationSettings(payload, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const update = payload.authentication || payload;

    // --- Strict Invariant Checks (Section 16.2) ---
    // Rule A: Cannot disable localPassword authentication
    if (update.supportedAuthMethods && update.supportedAuthMethods.localPassword === false) {
      return {
        success: false,
        message: 'Security Invariant Violation: Local Password authentication cannot be disabled platform-wide. At least one safe recovery method must be preserved for authorized platform administrators.'
      };
    }

    // Rule B: Break-glass recovery access cannot be disabled
    if (update.breakGlassEmergencyAccessEnabled === false) {
      return {
        success: false,
        message: 'Security Invariant Violation: Break-glass emergency administrator access must remain enabled to prevent total lockout.'
      };
    }

    // Rule C: Password minimum length cannot be less than 8 characters
    if (update.passwordRequirements && update.passwordRequirements.minLength != null && update.passwordRequirements.minLength < 8) {
      return {
        success: false,
        message: 'Validation Error: Password minimum length cannot be less than 8 characters.'
      };
    }

    // Rule D: Inactivity timeout cannot be less than 5 minutes
    if (update.sessionDuration && update.sessionDuration.inactivityTimeoutMinutes != null && update.sessionDuration.inactivityTimeoutMinutes < 5) {
      return {
        success: false,
        message: 'Validation Error: Session inactivity timeout cannot be less than 5 minutes.'
      };
    }

    // Rule E: Max failed attempts must be at least 1
    if (update.loginAttemptLimits && update.loginAttemptLimits.maxFailedAttempts != null && update.loginAttemptLimits.maxFailedAttempts < 1) {
      return {
        success: false,
        message: 'Validation Error: Max failed login attempts must be at least 1.'
      };
    }

    let target = null;
    if (this.isMongoReady()) {
      try {
        target = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
        if (target) {
          if (update.passwordRequirements) {
            target.authentication.passwordRequirements = {
              ...target.authentication.passwordRequirements,
              ...update.passwordRequirements
            };
          }
          if (update.sessionDuration) {
            target.authentication.sessionDuration = {
              ...target.authentication.sessionDuration,
              ...update.sessionDuration
            };
          }
          if (update.mfaPolicy) {
            target.authentication.mfaPolicy = {
              ...target.authentication.mfaPolicy,
              ...update.mfaPolicy
            };
          }
          if (update.loginAttemptLimits) {
            target.authentication.loginAttemptLimits = {
              ...target.authentication.loginAttemptLimits,
              ...update.loginAttemptLimits
            };
          }
          if (update.accountRecoveryRules) {
            target.authentication.accountRecoveryRules = {
              ...target.authentication.accountRecoveryRules,
              ...update.accountRecoveryRules
            };
          }
          if (update.supportedAuthMethods) {
            target.authentication.supportedAuthMethods = {
              ...target.authentication.supportedAuthMethods,
              ...update.supportedAuthMethods,
              localPassword: true // Immutable guarantee
            };
          }
          target.authentication.breakGlassEmergencyAccessEnabled = true;

          await target.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!target) {
      target = inMemorySettings;
      if (update.passwordRequirements) {
        target.authentication.passwordRequirements = {
          ...target.authentication.passwordRequirements,
          ...update.passwordRequirements
        };
      }
      if (update.sessionDuration) {
        target.authentication.sessionDuration = {
          ...target.authentication.sessionDuration,
          ...update.sessionDuration
        };
      }
      if (update.mfaPolicy) {
        target.authentication.mfaPolicy = {
          ...target.authentication.mfaPolicy,
          ...update.mfaPolicy
        };
      }
      if (update.loginAttemptLimits) {
        target.authentication.loginAttemptLimits = {
          ...target.authentication.loginAttemptLimits,
          ...update.loginAttemptLimits
        };
      }
      if (update.accountRecoveryRules) {
        target.authentication.accountRecoveryRules = {
          ...target.authentication.accountRecoveryRules,
          ...update.accountRecoveryRules
        };
      }
      if (update.supportedAuthMethods) {
        target.authentication.supportedAuthMethods = {
          ...target.authentication.supportedAuthMethods,
          ...update.supportedAuthMethods,
          localPassword: true
        };
      }
      target.authentication.breakGlassEmergencyAccessEnabled = true;
    }

    await this._logAudit('AUTHENTICATION_SETTINGS_UPDATED', 'PLATFORM_GLOBAL_SETTINGS', actor, 'Updated platform authentication, session timeout, and MFA policy');

    return {
      success: true,
      message: 'Authentication and security policies validated and applied platform-wide.',
      data: target.authentication
    };
  }

  // --------------------------------------------------------------------------
  // 16.3 Platform Feature Controls
  // --------------------------------------------------------------------------
  static async listFeatureControls() {
    await this.seedIfEmpty();
    let features = [];
    if (this.isMongoReady()) {
      try {
        features = await FeatureControl.find({}).sort({ createdAt: 1 });
      } catch (e) {
        features = inMemoryFeatures;
      }
    }
    if (!features || features.length === 0) {
      features = inMemoryFeatures;
    }
    return {
      success: true,
      data: features
    };
  }

  static async getFeatureControl(featureKey) {
    await this.seedIfEmpty();
    let item = null;
    if (this.isMongoReady()) {
      try {
        item = await FeatureControl.findOne({ featureKey });
      } catch (e) {
        item = inMemoryFeatures.find(f => f.featureKey === featureKey);
      }
    }
    if (!item) {
      item = inMemoryFeatures.find(f => f.featureKey === featureKey);
    }
    if (!item) {
      return { success: false, message: `Feature ${featureKey} not found.` };
    }
    return { success: true, data: item };
  }

  static async createFeatureControl(payload, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const featureKey = (payload.featureKey || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    if (!featureKey || !payload.featureName || !payload.description) {
      return { success: false, message: 'Feature key, name, and description are required.' };
    }

    const newFeature = {
      featureKey,
      featureName: payload.featureName.trim(),
      description: payload.description.trim(),
      availability: payload.availability || 'DISABLED',
      applicableInstitutions: Array.isArray(payload.applicableInstitutions) ? payload.applicableInstitutions : ['ALL'],
      rolloutStatus: payload.rolloutStatus || 'DRAFT',
      effectiveDate: payload.effectiveDate ? new Date(payload.effectiveDate) : new Date(),
      changeHistory: [
        {
          timestamp: new Date(),
          operator: actor,
          previousStatus: 'NEW',
          newStatus: payload.rolloutStatus || 'DRAFT',
          changeNote: payload.changeNote || 'Initial feature flag registration'
        }
      ]
    };

    if (this.isMongoReady()) {
      try {
        const created = await FeatureControl.create(newFeature);
        await this._logAudit('FEATURE_FLAG_CREATED', featureKey, actor, `Registered feature flag [${payload.featureName}]`);
        return { success: true, message: `Feature flag ${featureKey} created.`, data: created };
      } catch (e) {
        // Fallback
      }
    }

    inMemoryFeatures.push(newFeature);
    await this._logAudit('FEATURE_FLAG_CREATED', featureKey, actor, `Registered feature flag [${payload.featureName}]`);
    return { success: true, message: `Feature flag ${featureKey} created.`, data: newFeature };
  }

  static async updateFeatureControl(featureKey, payload, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const existingRes = await this.getFeatureControl(featureKey);
    if (!existingRes.success || !existingRes.data) {
      return { success: false, message: `Feature ${featureKey} not found.` };
    }
    const old = existingRes.data;

    const historyEntry = {
      timestamp: new Date(),
      operator: actor,
      previousStatus: old.availability,
      newStatus: payload.availability || old.availability,
      changeNote: payload.changeNote || `Updated rollout to ${payload.availability || old.availability}`
    };

    let target = null;
    if (this.isMongoReady()) {
      try {
        target = await FeatureControl.findOne({ featureKey });
        if (target) {
          if (payload.featureName) target.featureName = payload.featureName.trim();
          if (payload.description) target.description = payload.description.trim();
          if (payload.availability) target.availability = payload.availability;
          if (payload.applicableInstitutions) target.applicableInstitutions = payload.applicableInstitutions;
          if (payload.rolloutStatus) target.rolloutStatus = payload.rolloutStatus;
          if (payload.effectiveDate) target.effectiveDate = new Date(payload.effectiveDate);
          target.changeHistory.push(historyEntry);
          await target.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!target) {
      target = inMemoryFeatures.find(f => f.featureKey === featureKey);
      if (target) {
        if (payload.featureName) target.featureName = payload.featureName.trim();
        if (payload.description) target.description = payload.description.trim();
        if (payload.availability) target.availability = payload.availability;
        if (payload.applicableInstitutions) target.applicableInstitutions = payload.applicableInstitutions;
        if (payload.rolloutStatus) target.rolloutStatus = payload.rolloutStatus;
        if (payload.effectiveDate) target.effectiveDate = new Date(payload.effectiveDate);
        target.changeHistory.push(historyEntry);
      }
    }

    await this._logAudit('FEATURE_FLAG_UPDATED', featureKey, actor, `Updated rollout for [${target.featureName}]`);
    return { success: true, message: `Feature ${featureKey} updated successfully.`, data: target };
  }

  static async toggleFeatureControl(featureKey, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const res = await this.getFeatureControl(featureKey);
    if (!res.success || !res.data) {
      return { success: false, message: `Feature ${featureKey} not found.` };
    }

    const currentAvailability = res.data.availability;
    const nextAvailability = currentAvailability === 'DISABLED' ? 'GLOBAL_ENABLED' : 'DISABLED';

    return this.updateFeatureControl(featureKey, {
      availability: nextAvailability,
      changeNote: `Quick toggle switched availability from ${currentAvailability} to ${nextAvailability}`
    }, actor);
  }

  // --------------------------------------------------------------------------
  // 16.4 Maintenance Settings & Lockout Safeguards
  // --------------------------------------------------------------------------
  static async getMaintenanceSettings() {
    const res = await this.getGlobalSettings();
    return {
      success: true,
      data: res.data.maintenance
    };
  }

  static async scheduleMaintenance(payload, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const startTime = payload.startTime ? new Date(payload.startTime) : new Date(Date.now() + 3600000 * 24);
    const endTime = payload.endTime ? new Date(payload.endTime) : new Date(startTime.getTime() + 3600000 * 2);
    const affectedServices = payload.affectedServices || ['PUBLIC_WEBSITE', 'FACULTY_PORTAL', 'STUDENT_PORTAL'];
    const message = payload.userFacingMessage || 'Sri Vidya Educational Trust ERP will undergo scheduled maintenance. Administrative services remain active.';

    const historyEntry = {
      timestamp: new Date(),
      action: 'MAINTENANCE_SCHEDULED',
      operator: actor,
      details: `Scheduled window from ${startTime.toISOString()} to ${endTime.toISOString()} for [${affectedServices.join(', ')}]`
    };

    let target = null;
    if (this.isMongoReady()) {
      try {
        target = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
        if (target) {
          target.maintenance.plannedWindow = { startTime, endTime };
          target.maintenance.affectedServices = affectedServices;
          target.maintenance.userFacingMessage = message;
          target.maintenance.authorizedOperator = actor;
          target.maintenance.operatorLockoutProtection = true; // Invariant
          target.maintenance.history.push(historyEntry);
          await target.save();
        }
      } catch (e) {}
    }

    if (!target) {
      target = inMemorySettings;
      target.maintenance.plannedWindow = { startTime, endTime };
      target.maintenance.affectedServices = affectedServices;
      target.maintenance.userFacingMessage = message;
      target.maintenance.authorizedOperator = actor;
      target.maintenance.operatorLockoutProtection = true;
      target.maintenance.history.push(historyEntry);
    }

    await this._logAudit('MAINTENANCE_SCHEDULED', 'PLATFORM_GLOBAL_SETTINGS', actor, `Scheduled maintenance for ${startTime.toISOString()}`);

    return {
      success: true,
      message: 'Maintenance window scheduled successfully with operator lockout safeguards active.',
      data: target.maintenance
    };
  }

  static async setMaintenanceMode(isActive, payload = {}, actor = 'Platform Administrator') {
    await this.seedIfEmpty();
    const active = Boolean(isActive);

    const historyEntry = {
      timestamp: new Date(),
      action: active ? 'MAINTENANCE_ACTIVATED' : 'MAINTENANCE_ENDED',
      operator: actor,
      details: active
        ? (payload.details || 'Maintenance mode activated platform-wide. Platform Administrator bypass enabled.')
        : 'Maintenance mode deactivated. All institutional services returned to normal production state.'
    };

    let target = null;
    if (this.isMongoReady()) {
      try {
        target = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' });
        if (target) {
          target.maintenance.isActive = active;
          target.maintenance.operatorLockoutProtection = true; // Strict Invariant: Admin can NEVER be locked out
          if (payload.userFacingMessage) target.maintenance.userFacingMessage = payload.userFacingMessage;
          if (payload.affectedServices) target.maintenance.affectedServices = payload.affectedServices;
          target.maintenance.authorizedOperator = actor;
          target.maintenance.history.push(historyEntry);
          await target.save();
        }
      } catch (e) {}
    }

    if (!target) {
      target = inMemorySettings;
      target.maintenance.isActive = active;
      target.maintenance.operatorLockoutProtection = true;
      if (payload.userFacingMessage) target.maintenance.userFacingMessage = payload.userFacingMessage;
      if (payload.affectedServices) target.maintenance.affectedServices = payload.affectedServices;
      target.maintenance.authorizedOperator = actor;
      target.maintenance.history.push(historyEntry);
    }

    await this._logAudit(
      active ? 'PLATFORM_MAINTENANCE_ACTIVATED' : 'PLATFORM_MAINTENANCE_DEACTIVATED',
      'PLATFORM_GLOBAL_SETTINGS',
      actor,
      active ? 'Platform maintenance mode activated with Admin bypass' : 'Platform maintenance mode concluded'
    );

    return {
      success: true,
      message: active
        ? 'Platform maintenance mode activated. Operator bypass safeguards are active to prevent administrator lockout.'
        : 'Platform maintenance mode ended successfully. All services operational.',
      data: target.maintenance
    };
  }

  static async previewMaintenanceAnnouncement(payload = {}) {
    const res = await this.getMaintenanceSettings();
    const current = res.data;

    const userFacingMessage = payload.userFacingMessage || current.userFacingMessage;
    const affectedServices = payload.affectedServices || current.affectedServices;
    const plannedWindow = payload.plannedWindow || current.plannedWindow;

    return {
      success: true,
      data: {
        bannerHeadline: 'Scheduled System Maintenance in Progress',
        userFacingMessage,
        affectedServices,
        plannedWindow,
        operatorBypassActive: true,
        contactEmail: 'support@srividya.edu.in',
        previewTimestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = GlobalSettingsService;

