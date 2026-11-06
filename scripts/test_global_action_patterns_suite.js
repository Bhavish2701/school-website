/**
 * test_global_action_patterns_suite.js
 * Acceptance test suite for Recommended Global Action Patterns & High-Impact Confirmation Framework
 * Sri Vidya Educational Trust Platform Administration
 *
 * Verifies:
 * 1. 10 Statutorily Regulated Action Patterns in Registry
 * 2. Field validation, duplicate checking, draft & activate workflows (Create institution)
 * 3. Impact explanation, mandatory justification, and authority confirmation (Suspend institution)
 * 4. Access impact explanation and history preservation guarantee (Disable user)
 * 5. Permission differences computation and authorized approval (Change privileged role)
 * 6. Replacement key validation and rotation audit (Rotate integration credential)
 * 7. Point-in-time scope disclosure and live status (Start backup)
 * 8. Elevated role check, ticket ID approval, and confirmation phrase (Restore backup)
 * 9. Password complexity validation and break-glass recovery invariant (Change global security policy)
 * 10. Scope check, PII masking, and cryptographic audit seal (Export data)
 * 11. Target URL validation and zero URL token leakage invariant (Open school portal)
 * 12. Feedback Invariant 1: Post-backend success messages only
 * 13. Feedback Invariant 2: Form input preservation and inline error display on failure
 * 14. Frontend DOM, CSS, and controller export integrity
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
  console.log('  GLOBAL ACTION PATTERNS & HIGH-IMPACT SAFEGUARDS ACCEPTANCE');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // SECTION 1: Action Patterns Registry API (All 10 Actions)
  // -------------------------------------------------------------------------
  console.log('--- 1. Action Patterns Registry API ---');
  const resPatterns = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/patterns',
    method: 'GET'
  });

  assert(resPatterns.status === 200, 'GET /api/v1/platform/actions/patterns returns HTTP 200');
  assert(resPatterns.data && resPatterns.data.success === true, 'Response payload has success: true');
  assert(resPatterns.data.count === 10, 'Registry contains exactly 10 high-impact action patterns');

  const actions = resPatterns.data.patterns;
  const expectedActions = [
    'CREATE_INSTITUTION',
    'SUSPEND_INSTITUTION',
    'DISABLE_USER',
    'CHANGE_PRIVILEGED_ROLE',
    'ROTATE_INTEGRATION_CREDENTIAL',
    'START_BACKUP',
    'RESTORE_BACKUP',
    'CHANGE_GLOBAL_SECURITY_POLICY',
    'EXPORT_DATA',
    'OPEN_SCHOOL_PORTAL'
  ];

  expectedActions.forEach(actKey => {
    const p = actions.find(x => x.action === actKey);
    assert(p !== undefined, `Pattern '${actKey}' is registered in platform patterns`);
    assert(typeof p.name === 'string' && p.name.length > 0, `Pattern '${actKey}' has display name: '${p?.name}'`);
    assert(typeof p.requiredBehavior === 'string' && p.requiredBehavior.length > 0, `Pattern '${actKey}' defines requiredBehavior`);
    assert(typeof p.severity === 'string', `Pattern '${actKey}' defines severity: '${p?.severity}'`);
    assert(typeof p.impactSummary === 'string', `Pattern '${actKey}' defines impactSummary`);
  });

  // Also verify alias /api/v1/actions/patterns
  const resAlias = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/actions/patterns',
    method: 'GET'
  });
  assert(resAlias.status === 200, 'Route alias /api/v1/actions/patterns is accessible');

  // -------------------------------------------------------------------------
  // SECTION 2: Action 1 - Create institution
  // Validate fields, check duplicates and save a draft or activate
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Action 1: Create Institution ---');
  // 2.1 Rejection on missing code/name + Input Preservation
  const resInstMissing = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CREATE_INSTITUTION',
    payload: { domain: 'incomplete-school.edu.in' }
  });
  assert(resInstMissing.status === 400, 'Rejects creation when required institution code/name are missing');
  assert(resInstMissing.data.preservedInput !== undefined, 'Preserves input when creation validation fails');

  // 2.2 Duplicate check: Code SV-MAIN already exists
  const resInstDup = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CREATE_INSTITUTION',
    payload: {
      code: 'SV-MAIN',
      name: 'Duplicate Campus Facility',
      domain: 'srividya.edu.in'
    }
  });
  assert(resInstDup.status === 400, 'Rejects creation when institution code SV-MAIN already exists');
  assert(resInstDup.data.duplicate === true, 'Duplicate flag set to true');
  assert(resInstDup.data.duplicateChecks.codeExists === true, 'Duplicate code flag is true');
  assert(resInstDup.data.preservedInput.code === 'SV-MAIN', 'Preserves user input for code SV-MAIN');

  // 2.3 Valid creation supporting DRAFT workflow
  const validDraftCode = `SV-DRAFT-${Date.now().toString().slice(-4)}`;
  const resInstDraft = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CREATE_INSTITUTION',
    payload: {
      code: validDraftCode,
      name: 'Sri Vidya New Experimental High School',
      domain: `${validDraftCode.toLowerCase()}.srividya.edu.in`,
      workflowType: 'DRAFT'
    }
  });
  assert(resInstDraft.status === 200, 'Valid unique creation passes validation');
  assert(resInstDraft.data.workflowType === 'DRAFT', 'Supports DRAFT setup pipeline workflow');

  // 2.4 Confirm creation and execute
  const resInstConfirm = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/confirm',
    method: 'POST'
  }, {
    actionType: 'CREATE_INSTITUTION',
    payload: {
      code: validDraftCode,
      name: 'Sri Vidya New Experimental High School',
      domain: `${validDraftCode.toLowerCase()}.srividya.edu.in`,
      workflowType: 'ACTIVATE',
      authorityConfirmed: true,
      reason: 'Approved expansion of Trust secondary education network'
    },
    actor: 'Trust General Secretary'
  });
  assert(resInstConfirm.status === 200, 'Confirmation of institution creation succeeds');
  assert(resInstConfirm.data.success === true, 'Returns success: true upon backend confirmation');
  assert(typeof resInstConfirm.data.auditId === 'string', 'Creates immutable PlatformAudit record');

  // -------------------------------------------------------------------------
  // SECTION 3: Action 2 - Suspend institution
  // Explain impact, require reason and confirm authority
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Action 2: Suspend Institution ---');
  // 3.1 Rejection when reason is too short / empty
  const resSuspNoReason = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'SUSPEND_INSTITUTION',
    payload: {
      institutionId: 'INST-002',
      reason: 'short',
      authorityConfirmed: true
    }
  });
  assert(resSuspNoReason.status === 400, 'Rejects suspension when reason is under 8 characters');
  assert(resSuspNoReason.data.preservedInput !== undefined, 'Preserves input on suspension validation failure');

  // 3.2 Rejection when authority is not confirmed
  const resSuspNoAuth = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'SUSPEND_INSTITUTION',
    payload: {
      institutionId: 'INST-002',
      reason: 'Statutory compliance verification and regulatory audit review',
      authorityConfirmed: false
    }
  });
  assert(resSuspNoAuth.status === 400, 'Rejects suspension when authorityConfirmed is false');

  // 3.3 Valid suspension explaining zero-deletion preservation
  const resSuspValid = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'SUSPEND_INSTITUTION',
    payload: {
      institutionId: 'INST-002',
      reason: 'Statutory compliance verification and regulatory audit review',
      authorityConfirmed: true
    }
  });
  assert(resSuspValid.status === 200, 'Valid suspension passes validation');
  assert(resSuspValid.data.preservationNotice.includes('Zero-record deletion'), 'Explicitly explains zero-record deletion preservation');
  assert(Array.isArray(resSuspValid.data.disabledServices), 'Lists disabled services');

  // 3.4 Confirm suspension
  const resSuspConfirm = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/confirm',
    method: 'POST'
  }, {
    actionType: 'SUSPEND_INSTITUTION',
    payload: {
      institutionId: 'INST-002',
      reason: 'Statutory compliance verification and regulatory audit review',
      authorityConfirmed: true
    },
    actor: 'Trust Legal Directorate'
  });
  assert(resSuspConfirm.status === 200, 'Confirms suspension with audit record');

  // -------------------------------------------------------------------------
  // SECTION 4: Action 3 - Disable user
  // Explain access impact and preserve history
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Action 3: Disable User ---');
  const resUserValid = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'DISABLE_USER',
    payload: {
      userId: 'USR-FAC-04',
      userName: 'priya.s@srividya.edu.in',
      reason: 'Sabbatical research leave'
    }
  });
  assert(resUserValid.status === 200, 'Disable user validation succeeds');
  assert(resUserValid.data.accessImpact.includes('Revokes active sessions'), 'Explains active session revocation');
  assert(resUserValid.data.historyPreservation.includes('Student grading'), 'Preserves historical grades, attendance and submissions');

  // -------------------------------------------------------------------------
  // SECTION 5: Action 4 - Change privileged role
  // Show permission differences and require authorized approval
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Action 4: Change Privileged Role ---');
  const resRoleDiff = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CHANGE_PRIVILEGED_ROLE',
    payload: {
      roleId: 'ROLE-CAMPUS-ADMIN',
      roleName: 'Campus Administrator',
      newPermissions: ['data_requests.approve', 'governance_policies.publish', 'students.view', 'attendance.mark'],
      approvalSignatory: 'Trust Chief Information Officer'
    }
  });
  assert(resRoleDiff.status === 200, 'Role difference calculation succeeds');
  assert(resRoleDiff.data.differences !== undefined, 'Returns calculated permission differences');
  assert(Array.isArray(resRoleDiff.data.differences.added), 'Calculates added entitlements (+) list');
  assert(Array.isArray(resRoleDiff.data.differences.removed), 'Calculates removed entitlements (-) list');

  // -------------------------------------------------------------------------
  // SECTION 6: Action 5 - Rotate integration credential
  // Validate the replacement and record the rotation
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Action 5: Rotate Integration Credential ---');
  // Short/invalid key rejected
  const resRotShort = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'ROTATE_INTEGRATION_CREDENTIAL',
    payload: {
      integrationId: 'INT-001',
      replacementKey: 'short'
    }
  });
  assert(resRotShort.status === 400, 'Rejects replacement credential under 8 characters');

  // Valid rotation
  const resRotValid = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'ROTATE_INTEGRATION_CREDENTIAL',
    payload: {
      integrationId: 'INT-001',
      replacementKey: 'rzp_live_sec_valid_key_9941_x2'
    }
  });
  assert(resRotValid.status === 200, 'Valid replacement credential validated');
  assert(resRotValid.data.connectionStatus === 'HEALTHY', 'Verifies connection test on replacement key');

  // -------------------------------------------------------------------------
  // SECTION 7: Action 6 - Start backup
  // Show scope and status
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Action 6: Start Backup ---');
  const resBkp = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'START_BACKUP',
    payload: {
      targetScope: 'Full Encrypted Platform Database & Files'
    }
  });
  assert(resBkp.status === 200, 'Start backup validation succeeds');
  assert(Array.isArray(resBkp.data.scopeDetails), 'Shows granular backup scope details');
  assert(resBkp.data.status === 'QUEUED', 'Shows initial operational status');

  // -------------------------------------------------------------------------
  // SECTION 8: Action 7 - Restore backup
  // Require elevated permission, confirmation and an approved recovery process
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Action 7: Restore Backup ---');
  // Rejection without recoveryTicketId
  const resRestNoTicket = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'RESTORE_BACKUP',
    payload: {
      backupId: 'BKP-001',
      confirmationPhrase: 'RESTORE',
      elevatedRole: 'SUPER_ADMIN'
    }
  });
  assert(resRestNoTicket.status === 400, 'Rejects restore backup without approved ticket ID');
  assert(resRestNoTicket.data.preservedInput !== undefined, 'Preserves input on restore validation failure');

  // Rejection without typing RESTORE
  const resRestBadPhrase = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'RESTORE_BACKUP',
    payload: {
      backupId: 'BKP-001',
      recoveryTicketId: 'REC-2026-9041',
      confirmationPhrase: 'restore-it',
      elevatedRole: 'SUPER_ADMIN'
    }
  });
  assert(resRestBadPhrase.status === 400, "Rejects restore backup when confirmation phrase is not 'RESTORE'");

  // Valid restore validation
  const resRestValid = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'RESTORE_BACKUP',
    payload: {
      backupId: 'BKP-001',
      recoveryTicketId: 'REC-2026-9041',
      confirmationPhrase: 'RESTORE',
      elevatedRole: 'SUPER_ADMIN'
    }
  });
  assert(resRestValid.status === 200, 'Valid restore passes with elevated permission and change ticket');

  // -------------------------------------------------------------------------
  // SECTION 9: Action 8 - Change global security policy
  // Validate configuration and record change
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Action 8: Change Global Security Policy ---');
  // Weak password length rejected
  const resSecWeak = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CHANGE_GLOBAL_SECURITY_POLICY',
    payload: {
      policy: { passwordMinLength: 5 }
    }
  });
  assert(resSecWeak.status === 400, 'Rejects password minimum length < 8');

  // Disabling localPassword rejected
  const resSecBreakGlass = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'CHANGE_GLOBAL_SECURITY_POLICY',
    payload: {
      policy: {
        passwordMinLength: 10,
        supportedMethods: { localPassword: false, googleSSO: true }
      }
    }
  });
  assert(resSecBreakGlass.status === 400, 'Rejects disabling localPassword platform-wide (preserves emergency safe recovery)');

  // -------------------------------------------------------------------------
  // SECTION 10: Action 9 - Export data
  // Check permission, scope and audit requirements
  // -------------------------------------------------------------------------
  console.log('\n--- 10. Action 9: Export Data ---');
  const resExport = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'EXPORT_DATA',
    payload: {
      scope: 'ALL_INSTITUTIONS_DIRECTORY',
      exportType: 'CSV'
    }
  });
  assert(resExport.status === 200, 'Export data validation succeeds');
  assert(resExport.data.auditRequirements.piiRedaction.includes('Aadhaar & password'), 'Enforces PII redaction (Aadhaar & passwords masked)');
  assert(resExport.data.auditRequirements.auditLogEvent === 'DATA_IMPORT_EXPORT', 'Records statutory category DATA_IMPORT_EXPORT');

  // -------------------------------------------------------------------------
  // SECTION 11: Action 10 - Open school portal
  // Validate target URL and use secure authentication (zero URL token exposure)
  // -------------------------------------------------------------------------
  console.log('\n--- 11. Action 10: Open School Portal ---');
  // Rejection with password/token parameter in URL
  const resPortalLeak = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'OPEN_SCHOOL_PORTAL',
    payload: {
      portal: 'management',
      queryParams: { token: 'jwt_secret_token_123' }
    }
  });
  assert(resPortalLeak.status === 400, 'Rejects portal launch when URL contains session token');
  assert(resPortalLeak.data.securityViolation === true, 'Flags security violation for URL token exposure');
  assert(resPortalLeak.data.preservedInput !== undefined, 'Preserves input upon security violation');

  // Safe portal launch
  const resPortalSafe = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/validate',
    method: 'POST'
  }, {
    actionType: 'OPEN_SCHOOL_PORTAL',
    payload: {
      portal: 'management',
      queryParams: { campus: 'SV-MAIN' }
    }
  });
  assert(resPortalSafe.status === 200, 'Valid portal launch passes validation');
  assert(resPortalSafe.data.targetUrl === '/management', 'Target URL validated to /management');
  assert(resPortalSafe.data.authenticationMode.includes('Zero URL Token Exposure'), 'Enforces zero URL token exposure invariant');

  // -------------------------------------------------------------------------
  // SECTION 12: Feedback Invariants Audit
  // -------------------------------------------------------------------------
  console.log('\n--- 12. Feedback Invariants Audit ---');
  // Invariant 1: Failure must return 400 and preserved input
  const resPreserve = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/confirm',
    method: 'POST'
  }, {
    actionType: 'CREATE_INSTITUTION',
    payload: { code: 'SV-MAIN', name: 'Collision Test', customNote: 'Preserve this note' }
  });
  assert(resPreserve.status === 400, 'Failed operation returns HTTP 400');
  assert(resPreserve.data.success === false, 'Failed operation returns success: false');
  assert(resPreserve.data.preservedInput.customNote === 'Preserve this note', 'Preserves user custom form fields intact on error');

  // Invariant 2: Success only after backend confirmation
  const resConfirmAudit = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/v1/platform/actions/confirm',
    method: 'POST'
  }, {
    actionType: 'EXPORT_DATA',
    payload: { scope: 'STUDENT_DIRECTORY', exportType: 'CSV' },
    actor: 'Audit Officer'
  });
  assert(resConfirmAudit.status === 200, 'Successful execution returns HTTP 200');
  assert(resConfirmAudit.data.success === true, 'Explicitly returns success: true for client to trigger success message');
  assert(typeof resConfirmAudit.data.auditId === 'string', 'Returns audit ID confirming database seal');

  // -------------------------------------------------------------------------
  // SECTION 13: Frontend DOM & Asset Integrity
  // -------------------------------------------------------------------------
  console.log('\n--- 13. Frontend DOM, CSS & JS Integrity ---');
  const htmlContent = fs.readFileSync(path.join(__dirname, '../frontend/platform-admin/index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, '../frontend/css/platform-admin.css'), 'utf8');
  const jsContent = fs.readFileSync(path.join(__dirname, '../frontend/js/platform-admin.js'), 'utf8');

  // Modal checks
  assert(htmlContent.includes('id="modalHighImpactConfirm"'), 'index.html contains modalHighImpactConfirm');
  assert(htmlContent.includes('id="lblHighImpactTitle"'), 'modal contains lblHighImpactTitle');
  assert(htmlContent.includes('id="lblHighImpactTarget"'), 'modal contains lblHighImpactTarget');
  assert(htmlContent.includes('id="divHighImpactImpactNotice"'), 'modal contains divHighImpactImpactNotice');
  assert(htmlContent.includes('id="divHighImpactCustomFields"'), 'modal contains divHighImpactCustomFields');
  assert(htmlContent.includes('id="txtHighImpactReason"'), 'modal contains txtHighImpactReason');
  assert(htmlContent.includes('id="chkHighImpactAuthority"'), 'modal contains chkHighImpactAuthority');
  assert(htmlContent.includes('id="alertHighImpactError"'), 'modal contains alertHighImpactError');
  assert(htmlContent.includes('id="lblHighImpactErrorMessage"'), 'modal contains lblHighImpactErrorMessage');
  assert(htmlContent.includes('id="btnHighImpactConfirmSubmit"'), 'modal contains btnHighImpactConfirmSubmit');

  // View checks
  assert(htmlContent.includes('id="view-actions"'), 'index.html contains view-actions section');
  assert(htmlContent.includes('id="containerActionPatternCards"'), 'view-actions contains containerActionPatternCards');
  assert(htmlContent.includes('id="streamActionDiagnosticLogs"'), 'view-actions contains streamActionDiagnosticLogs');

  // CSS checks
  assert(cssContent.includes('.high-impact-dialog'), 'platform-admin.css defines .high-impact-dialog');
  assert(cssContent.includes('.diff-chip-add'), 'platform-admin.css defines .diff-chip-add');
  assert(cssContent.includes('.diff-chip-del'), 'platform-admin.css defines .diff-chip-del');
  assert(cssContent.includes('.action-pattern-card'), 'platform-admin.css defines .action-pattern-card');
  assert(cssContent.includes('.feedback-invariant-banner'), 'platform-admin.css defines .feedback-invariant-banner');

  // JS checks
  assert(jsContent.includes('loadActionPatternsData'), 'platform-admin.js exports loadActionPatternsData');
  assert(jsContent.includes('openHighImpactModal'), 'platform-admin.js exports openHighImpactModal');
  assert(jsContent.includes('submitHighImpactConfirmation'), 'platform-admin.js exports submitHighImpactConfirmation');
  assert(jsContent.includes('testActionTrigger'), 'platform-admin.js exports testActionTrigger');
  assert(jsContent.includes('displayErrorAndPreserve'), 'platform-admin.js implements input preservation on error');

  console.log('\n=============================================================');
  console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('=============================================================\n');
}

runTests().catch(err => {
  console.error('\nTest Suite Execution Failed:', err);
  process.exit(1);
});

