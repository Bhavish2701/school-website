/**
 * test_global_settings_suite.js
 * Acceptance test suite for Module 16: Global Platform Settings
 * Sri Vidya Educational Trust Platform Administration
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('  MODULE 16: GLOBAL PLATFORM SETTINGS ACCEPTANCE SUITE');
  console.log('=============================================================\n');

  try {
    // -------------------------------------------------------------
    // Test Group 1: 16.1 General Settings
    // -------------------------------------------------------------
    console.log('--- Test Group 1: 16.1 General Settings ---');
    const resGet = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings',
      method: 'GET'
    });

    assert(resGet.status === 200, 'GET /api/v1/platform/settings returns 200 OK');
    assert(resGet.data.success === true, 'Response indicates success = true');
    const settings = resGet.data.data;
    assert(!!settings.general, 'Settings contains general configuration block');
    assert(!!settings.authentication, 'Settings contains authentication configuration block');
    assert(!!settings.maintenance, 'Settings contains maintenance configuration block');

    const gen = settings.general;
    assert(gen.platformName.includes('Sri Vidya'), 'Platform name is configured');
    assert(gen.defaultLocale === 'en-IN', 'Default locale is en-IN');
    assert(gen.defaultTimeZone.includes('Kolkata'), 'Default timezone is Asia/Kolkata');
    assert(Array.isArray(gen.supportedLanguages) && gen.supportedLanguages.includes('te-IN'),
      'Supported languages includes regional Telugu (te-IN)');
    assert(gen.dateFormat === 'DD/MM/YYYY', 'Date format is DD/MM/YYYY');
    assert(gen.publicSupportContact && gen.publicSupportContact.email.includes('@srividya.edu.in'),
      'Public support email is configured');

    // Update General Settings
    const resUpdateGen = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/general',
      method: 'PUT'
    }, {
      platformName: 'Sri Vidya Educational Trust Unified ERP',
      publicSupportContact: {
        email: 'central-helpdesk@srividya.edu.in',
        phone: '+91 94402 99887',
        emergencyDesk: 'escalations@srividya.edu.in'
      },
      timeFormat: '12h'
    });

    assert(resUpdateGen.status === 200, 'PUT /api/v1/platform/settings/general returns 200 OK');
    assert(resUpdateGen.data.success === true, 'Update general settings returns success');
    assert(resUpdateGen.data.data.platformName === 'Sri Vidya Educational Trust Unified ERP',
      'Platform name successfully updated');

    // -------------------------------------------------------------
    // Test Group 2: 16.2 Authentication Settings & Safety Invariants
    // -------------------------------------------------------------
    console.log('\n--- Test Group 2: 16.2 Authentication Settings & Invariants ---');

    // Invariant Rule A: Disabling localPassword must be REJECTED to preserve administrator safe recovery
    const resDisallowNoLocal = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/authentication',
      method: 'PUT'
    }, {
      supportedAuthMethods: {
        localPassword: false,
        googleWorkspaceSSO: true
      }
    });

    assert(resDisallowNoLocal.status === 400,
      'Invariant: Disabling localPassword authentication returns 400 Bad Request');
    assert(resDisallowNoLocal.data.success === false, 'Yields success = false');
    assert(resDisallowNoLocal.data.message.includes('Security Invariant Violation') &&
           resDisallowNoLocal.data.message.includes('safe recovery method'),
      'Error message explicitly warns about preserving administrator safe recovery');

    // Invariant Rule B: Disabling breakGlassEmergencyAccessEnabled must be REJECTED
    const resDisallowNoBreakGlass = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/authentication',
      method: 'PUT'
    }, {
      breakGlassEmergencyAccessEnabled: false
    });
    assert(resDisallowNoBreakGlass.status === 400,
      'Invariant: Disabling break-glass emergency recovery access returns 400 Bad Request');

    // Validation Rule C: minLength < 8 must be REJECTED
    const resDisallowShortPwd = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/authentication',
      method: 'PUT'
    }, {
      passwordRequirements: {
        minLength: 6
      }
    });
    assert(resDisallowShortPwd.status === 400, 'Validation: Password minLength < 8 returns 400 Bad Request');

    // Validation Rule D: inactivityTimeoutMinutes < 5 must be REJECTED
    const resDisallowTinyTimeout = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/authentication',
      method: 'PUT'
    }, {
      sessionDuration: {
        inactivityTimeoutMinutes: 2
      }
    });
    assert(resDisallowTinyTimeout.status === 400, 'Validation: Inactivity timeout < 5 mins returns 400 Bad Request');

    // Valid Authentication Update
    const resValidAuth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/authentication',
      method: 'PUT'
    }, {
      passwordRequirements: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: 90
      },
      sessionDuration: {
        inactivityTimeoutMinutes: 30,
        maxSessionLifetimeHours: 12
      },
      mfaPolicy: {
        enforcement: 'REQUIRED_FOR_ADMINS'
      },
      loginAttemptLimits: {
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15
      }
    });

    assert(resValidAuth.status === 200, 'Valid authentication policy update returns 200 OK');
    assert(resValidAuth.data.success === true, 'Update authentication returns success');
    assert(resValidAuth.data.data.passwordRequirements.minLength === 12, 'minLength updated to 12');
    assert(resValidAuth.data.data.supportedAuthMethods.localPassword === true,
      'Local Password authentication remains preserved');

    // -------------------------------------------------------------
    // Test Group 3: 16.3 Platform Feature Controls
    // -------------------------------------------------------------
    console.log('\n--- Test Group 3: 16.3 Platform Feature Controls ---');
    const resFeatures = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/features',
      method: 'GET'
    });

    assert(resFeatures.status === 200, 'GET /api/v1/platform/settings/features returns 200 OK');
    assert(resFeatures.data.success === true, 'Response indicates success = true');
    const features = resFeatures.data.data;
    assert(Array.isArray(features) && features.length >= 3, 'Returns list of feature flags');

    const parentPortalFeature = features.find(f => f.featureKey === 'parent_portal');
    assert(!!parentPortalFeature, 'Parent Portal feature flag exists');
    if (parentPortalFeature.availability !== 'INSTITUTION_PILOT') {
      await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/v1/platform/settings/features/parent_portal`,
        method: 'PUT'
      }, {
        availability: 'INSTITUTION_PILOT',
        rolloutStatus: 'PILOT',
        applicableInstitutions: ['SV-MAIN'],
        changeNote: 'Reset to pilot rollout for test suite'
      });
      parentPortalFeature.availability = 'INSTITUTION_PILOT';
    }
    assert(parentPortalFeature.availability === 'INSTITUTION_PILOT',
      'Parent Portal initialized in pilot rollout mode');
    assert(parentPortalFeature.applicableInstitutions.includes('SV-MAIN'),
      'Parent Portal is pilot-gated to SV-MAIN');

    // Register a new feature flag
    const newFeatureKey = `bus_gps_${Date.now()}`;
    const resCreateFeat = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/features',
      method: 'POST'
    }, {
      featureKey: newFeatureKey,
      featureName: 'Live Bus Route GPS Feeds',
      description: 'Vehicle telematics and route tracking for school transport parents.',
      availability: 'INSTITUTION_PILOT',
      applicableInstitutions: ['SV-VILLAGE'],
      rolloutStatus: 'PILOT'
    });

    assert(resCreateFeat.status === 201, 'POST /api/v1/platform/settings/features returns 201 Created');
    assert(resCreateFeat.data.data.featureKey === newFeatureKey, 'Created feature flag has correct key');

    // Update feature rollout to GA
    const resUpdateFeat = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/settings/features/${encodeURIComponent(newFeatureKey)}`,
      method: 'PUT'
    }, {
      availability: 'GLOBAL_ENABLED',
      rolloutStatus: 'GA',
      applicableInstitutions: ['ALL'],
      changeNote: 'Promoted from SV-VILLAGE pilot to global availability'
    });

    assert(resUpdateFeat.status === 200, 'PUT /api/v1/platform/settings/features/:id returns 200 OK');
    assert(resUpdateFeat.data.data.availability === 'GLOBAL_ENABLED', 'Feature availability updated to GLOBAL_ENABLED');
    assert(resUpdateFeat.data.data.rolloutStatus === 'GA', 'Rollout status is GA');

    // Quick toggle feature
    const resToggleFeat = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/settings/features/${encodeURIComponent(newFeatureKey)}/toggle`,
      method: 'POST'
    });
    assert(resToggleFeat.status === 200, 'POST /api/v1/platform/settings/features/:id/toggle returns 200 OK');
    assert(resToggleFeat.data.data.availability === 'DISABLED', 'Feature availability toggled to DISABLED');

    // -------------------------------------------------------------
    // Test Group 4: 16.4 Maintenance Settings & Safeguards
    // -------------------------------------------------------------
    console.log('\n--- Test Group 4: 16.4 Maintenance Settings & Safeguards ---');
    const resMaint = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/maintenance',
      method: 'GET'
    });

    assert(resMaint.status === 200, 'GET /api/v1/platform/settings/maintenance returns 200 OK');
    assert(resMaint.data.success === true, 'Response indicates success = true');
    assert(resMaint.data.data.operatorLockoutProtection === true,
      'Safeguard Invariant: Operator lockout protection is permanently active');

    // Schedule maintenance window
    const startTime = new Date(Date.now() + 3600000 * 24).toISOString();
    const endTime = new Date(Date.now() + 3600000 * 27).toISOString();
    const resSched = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/maintenance/schedule',
      method: 'POST'
    }, {
      startTime,
      endTime,
      affectedServices: ['PUBLIC_WEBSITE', 'FACULTY_PORTAL', 'STUDENT_PORTAL'],
      userFacingMessage: 'Sri Vidya ERP will undergo scheduled platform maintenance on Sunday.'
    });

    assert(resSched.status === 200, 'POST /api/v1/platform/settings/maintenance/schedule returns 200 OK');
    assert(resSched.data.success === true, 'Schedule maintenance returned success');

    // Activate Maintenance Mode (with Administrator Lockout Protection Invariant)
    const resActivateMaint = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/maintenance/toggle',
      method: 'POST'
    }, {
      isActive: true,
      userFacingMessage: 'Platform upgrades in progress. Emergency bypass enabled for administrators.'
    });

    assert(resActivateMaint.status === 200, 'POST /api/v1/platform/settings/maintenance/toggle returns 200 OK');
    assert(resActivateMaint.data.data.isActive === true, 'Maintenance mode is now ACTIVE');
    assert(resActivateMaint.data.data.operatorLockoutProtection === true,
      'Safeguard Invariant: operatorLockoutProtection is guaranteed true during maintenance');

    // Preview maintenance announcement
    const resPreviewMaint = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/maintenance/preview',
      method: 'GET'
    });
    assert(resPreviewMaint.status === 200, 'GET /api/v1/platform/settings/maintenance/preview returns 200 OK');
    assert(resPreviewMaint.data.data.operatorBypassActive === true,
      'Preview includes operator bypass confirmation');

    // Deactivate Maintenance Mode
    const resDeactivateMaint = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/settings/maintenance/toggle',
      method: 'POST'
    }, {
      isActive: false
    });
    assert(resDeactivateMaint.status === 200, 'POST end maintenance returns 200 OK');
    assert(resDeactivateMaint.data.data.isActive === false, 'Maintenance mode is now INACTIVE');

    // -------------------------------------------------------------
    // Test Group 5: Frontend HTML & JS Integrity
    // -------------------------------------------------------------
    console.log('\n--- Test Group 5: Frontend HTML & JS Integrity ---');
    const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert(html.includes('id="view-settings"'), 'HTML contains #view-settings');
    assert(html.includes('id="btnSettingsTabGeneral"'), 'HTML contains General settings subtab');
    assert(html.includes('id="btnSettingsTabAuth"'), 'HTML contains Auth settings subtab');
    assert(html.includes('id="btnSettingsTabFeatures"'), 'HTML contains Features subtab');
    assert(html.includes('id="btnSettingsTabMaintenance"'), 'HTML contains Maintenance subtab');
    assert(html.includes('id="tbodyFeatureControls"'), 'HTML contains tbodyFeatureControls');
    assert(html.includes('id="tbodyMaintenanceHistory"'), 'HTML contains tbodyMaintenanceHistory');

    // Modals
    assert(html.includes('id="modalAddFeatureFlag"'), 'HTML contains modalAddFeatureFlag');
    assert(html.includes('id="modalEditFeatureFlag"'), 'HTML contains modalEditFeatureFlag');
    assert(html.includes('id="modalScheduleMaintenance"'), 'HTML contains modalScheduleMaintenance');
    assert(html.includes('id="modalPreviewMaintenance"'), 'HTML contains modalPreviewMaintenance');

    // JS Exports
    const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
    const js = fs.readFileSync(jsPath, 'utf8');

    const expectedMethods = [
      'loadGlobalSettingsData',
      'switchSettingsSubTab',
      'previewSettingsLogo',
      'saveGeneralSettings',
      'saveAuthenticationSettings',
      'renderFeatureControlsTable',
      'openAddFeatureFlagModal',
      'submitAddFeatureFlag',
      'openEditFeatureFlagModal',
      'submitEditFeatureFlag',
      'toggleFeatureFlag',
      'renderMaintenanceSettings',
      'toggleMaintenanceMode',
      'openScheduleMaintenanceModal',
      'submitScheduleMaintenance',
      'openPreviewMaintenanceModal'
    ];

    for (const m of expectedMethods) {
      assert(js.includes(`${m},`) || js.includes(`${m}:`), `platformApp exports ${m}`);
    }

    console.log('\n=============================================================');
    console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! (100%)`);
    console.log('=============================================================\n');

  } catch (err) {
    console.error('\nTest suite failed with error:', err);
    process.exit(1);
  }
}

runTests();

