/**
 * scripts/test_backend_architecture_modules_suite.js
 * Comprehensive Acceptance Test Suite for Modular Backend Architecture & Multi-Institution Security
 * Sri Vidya Educational Trust Platform Administration
 *
 * Verifies:
 * 1. All 21 Modules exist with the consistent 7-file layered architecture
 * 2. Each module exports { routes, controller, service, repository, validation, policy }
 * 3. Multi-Institution Security Engine enforces the 6 security dimensions:
 *    - Cross-school isolation (INST-001 vs INST-002 -> 403 Forbidden + Audit Log)
 *    - Platform-wide scope enforcement for sensitive actions
 *    - Record-level query scoping (scopeQuery)
 *    - Approval signatory checks for high-impact actions
 *    - Immutable audit trails in PlatformAudit
 * 4. Workflow A (New School Registration 6-step lifecycle flowchart) execution
 *    - Step 1: Create institution record (Draft)
 *    - Step 2: Configure school identity and academic defaults
 *    - Step 3: Verify domains and email
 *    - Step 4: Invite institution administrator
 *    - Step 5: Validate permissions and configuration
 *    - Step 6: Activate institution
 *    - Zero Fabricated Data Invariant (0 students, 0 staff, 0 finance)
 * 5. Live HTTP endpoints for modular architecture on running server
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const MultiInstitutionSecurity = require('../backend/src/modules/common/multiInstitutionSecurity');

const MODULES = [
  'auth',
  'platform-dashboard',
  'institutions',
  'institution-onboarding',
  'school-configuration',
  'users',
  'roles-permissions',
  'audit-logs',
  'security-monitoring',
  'subscriptions',
  'system-health',
  'deployments',
  'backups-recovery',
  'integrations',
  'api-management',
  'support-tickets',
  'domains',
  'email-notifications',
  'global-settings',
  'platform-policies',
  'data-retention'
];

const MODULES_DIR = path.join(__dirname, '../backend/src/modules');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('BACKEND ARCHITECTURE & MULTI-INSTITUTION SECURITY TEST SUITE');
  console.log('Sri Vidya Educational Trust - Platform Administration');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 1: ARCHITECTURAL INTEGRITY (All 21 Modules & 7 Files)
  // --------------------------------------------------------------------------
  console.log('--- SECTION 1: 21 Modules & 7-File Architecture ---');

  MODULES.forEach(modName => {
    test(`Module '${modName}' directory exists`, () => {
      const modDir = path.join(MODULES_DIR, modName);
      assert.strictEqual(fs.existsSync(modDir), true, `Directory ${modDir} must exist`);
    });

    test(`Module '${modName}' has all 7 architectural files + index.js`, () => {
      const modDir = path.join(MODULES_DIR, modName);
      const expectedFiles = [
        `${modName}.routes.js`,
        `${modName}.controller.js`,
        `${modName}.service.js`,
        `${modName}.repository.js`,
        `${modName}.validation.js`,
        `${modName}.policy.js`,
        `${modName}.test.js`,
        'index.js'
      ];

      expectedFiles.forEach(file => {
        const filePath = path.join(modDir, file);
        assert.strictEqual(fs.existsSync(filePath), true, `File ${file} missing in ${modName}`);
      });
    });

    test(`Module '${modName}' exports { routes, controller, service, repository, validation, policy }`, () => {
      const modExport = require(`../backend/src/modules/${modName}`);
      assert.ok(modExport.routes, `Module ${modName} must export routes`);
      assert.ok(modExport.controller, `Module ${modName} must export controller`);
      assert.ok(modExport.service, `Module ${modName} must export service`);
      assert.ok(modExport.repository, `Module ${modName} must export repository`);
      assert.ok(modExport.validation, `Module ${modName} must export validation`);
      assert.ok(modExport.policy, `Module ${modName} must export policy`);
    });
  });

  test('Master modules aggregator backend/src/modules/index.js mounts all modules', () => {
    const masterModules = require('../backend/src/modules');
    assert.ok(masterModules, 'Master modules router must exist');
    assert.ok(masterModules.stack.length >= 21, `Master router must mount at least 21 modules, found: ${masterModules.stack.length}`);
  });

  // --------------------------------------------------------------------------
  // SECTION 2: MULTI-INSTITUTION SECURITY ENGINE (6 Dimensions)
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Multi-Institution Security Engine ---');

  await testAsync('Dimension 1: Cross-School Isolation - Blocks INST-001 actor from accessing INST-002', async () => {
    const req = {
      headers: {
        'x-actor-id': 'admin-001',
        'x-actor-name': 'Principal School 1',
        'x-actor-role': 'Institutional Principal',
        'x-institution-scope': 'INSTITUTION_ONLY',
        'x-actor-institution-id': 'INST-001'
      },
      body: {
        institutionId: 'INST-002'
      }
    };

    let statusCode = null;
    let responseBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { responseBody = data; }
        };
      }
    };

    const allowed = await MultiInstitutionSecurity.enforcePolicy(req, res, {
      requiredPermission: 'institutions.manage',
      auditCategory: 'SECURITY_ISOLATION',
      auditAction: 'CROSS_INSTITUTION_TEST'
    });

    assert.strictEqual(allowed, false, 'Enforce policy must reject cross-school request');
    assert.strictEqual(statusCode, 403, 'Must return 403 Forbidden');
    assert.strictEqual(responseBody.errorCode, 'CROSS_INSTITUTION_ACCESS_DENIED');
  });

  await testAsync('Dimension 1: Same-School Access - Permits INST-001 actor accessing INST-001', async () => {
    const req = {
      headers: {
        'x-actor-id': 'admin-001',
        'x-actor-name': 'Principal School 1',
        'x-actor-role': 'Institutional Principal',
        'x-institution-scope': 'INSTITUTION_ONLY',
        'x-actor-institution-id': 'INST-001'
      },
      body: {
        institutionId: 'INST-001'
      }
    };

    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      }
    };

    const allowed = await MultiInstitutionSecurity.enforcePolicy(req, res, {
      requiredPermission: 'institutions.manage',
      auditCategory: 'SECURITY_ISOLATION',
      auditAction: 'SAME_INSTITUTION_TEST'
    });

    assert.strictEqual(allowed, true, 'Enforce policy must permit same-school request');
    assert.strictEqual(statusCode, null, 'Must not set error status code');
  });

  await testAsync('Dimension 2: Platform-Wide Scope Requirement - Blocks school-scoped actor from global action', async () => {
    const req = {
      headers: {
        'x-actor-id': 'admin-001',
        'x-actor-role': 'Institutional Principal',
        'x-institution-scope': 'INSTITUTION_ONLY',
        'x-actor-institution-id': 'INST-001'
      },
      body: {}
    };

    let statusCode = null;
    let responseBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { responseBody = data; }
        };
      }
    };

    const allowed = await MultiInstitutionSecurity.enforcePolicy(req, res, {
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      auditCategory: 'PLATFORM_GOVERNANCE',
      auditAction: 'GLOBAL_CHANGE_TEST'
    });

    assert.strictEqual(allowed, false, 'Must reject non-platform actor');
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(responseBody.errorCode, 'PLATFORM_SCOPE_REQUIRED');
  });

  await testAsync('Dimension 3: Super Administrator with Platform Scope is fully authorized', async () => {
    const req = {
      headers: {
        'x-actor-id': 'super-admin-01',
        'x-actor-name': 'Platform Super Administrator',
        'x-actor-role': 'Super Administrator',
        'x-institution-scope': 'PLATFORM_WIDE'
      },
      body: {}
    };

    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      }
    };

    const allowed = await MultiInstitutionSecurity.enforcePolicy(req, res, {
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      auditCategory: 'PLATFORM_GOVERNANCE',
      auditAction: 'GLOBAL_PERMITTED_TEST'
    });

    assert.strictEqual(allowed, true, 'Super Administrator with platform-wide scope must be allowed');
    assert.strictEqual(statusCode, null);
  });

  test('Dimension 4: Query Scoping (scopeQuery) forces institutional tenant query boundary', () => {
    const schoolReq = {
      user: {
        scope: 'INSTITUTION_ONLY',
        institutionId: 'INST-001'
      }
    };
    const query = MultiInstitutionSecurity.scopeQuery({ status: 'Active' }, schoolReq);
    assert.strictEqual(query.institutionId, 'INST-001', 'Must force institutionId query boundary for school users');
    assert.strictEqual(query.status, 'Active');

    const globalReq = {
      user: {
        scope: 'PLATFORM_WIDE'
      }
    };
    const globalQuery = MultiInstitutionSecurity.scopeQuery({ status: 'Active' }, globalReq);
    assert.strictEqual(globalQuery.institutionId, undefined, 'Must not restrict query boundary for platform-wide users');
  });

  await testAsync('Dimension 5: Approval Requirements for Sensitive Actions', async () => {
    const reqWithoutApproval = {
      headers: {
        'x-actor-role': 'Super Administrator',
        'x-institution-scope': 'PLATFORM_WIDE'
      },
      body: { action: 'RESTORE_BACKUP' }
    };

    let statusCode = null;
    let responseBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (d) => { responseBody = d; } };
      }
    };

    const allowed = await MultiInstitutionSecurity.enforcePolicy(reqWithoutApproval, res, {
      requireApprovalSignatory: true,
      auditCategory: 'BACKUP_RECOVERY',
      auditAction: 'RESTORE_BACKUP'
    });

    assert.strictEqual(allowed, false, 'Sensitive action without approval signatory must be blocked');
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(responseBody.errorCode, 'APPROVAL_SIGNATORY_REQUIRED');
  });

  await testAsync('Dimension 6: Audit Logging creates forensic audit record', async () => {
    const auditRecord = await MultiInstitutionSecurity.logSecurityEvent({
      actor: { id: 'auditor-01', name: 'Trust Auditor', role: 'Trust Security Auditor' },
      institutionId: 'INST-001',
      action: 'FORENSIC_INSPECTION',
      result: 'SUCCESS',
      severity: 'INFO',
      details: { note: 'Routine automated verification' }
    });

    assert.ok(auditRecord, 'Audit record must be created');
    assert.strictEqual(auditRecord.action, 'FORENSIC_INSPECTION');
    assert.strictEqual(auditRecord.result, 'SUCCESS');
  });

  // --------------------------------------------------------------------------
  // SECTION 3: WORKFLOW A (6-STEP REGISTRATION LIFECYCLE FLOWCHART)
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Workflow A - Register a New School (6-Step Lifecycle) ---');

  await testAsync('Executes complete 6-step registration lifecycle matching flowchart', async () => {
    const onboardingModule = require('../backend/src/modules/institution-onboarding');
    assert.ok(onboardingModule.service, 'Onboarding module service must exist');

    const testSchoolCode = `FLOW-${Date.now().toString().slice(-4)}`;
    const regResult = await onboardingModule.service.processOperation({
      action: 'REGISTER_SCHOOL',
      code: testSchoolCode,
      name: `Sri Vidya Test Campus ${testSchoolCode}`,
      adminName: 'Principal K. Rama Rao',
      adminEmail: `principal.${testSchoolCode.toLowerCase()}@srividya.edu.in`
    });

    assert.strictEqual(regResult.success, true, 'Workflow A must execute successfully');
    assert.ok(
      regResult.workflow === 'WORKFLOW_A_REGISTER_SCHOOL' || regResult.workflow === 'WORKFLOW_A_REGISTER_NEW_SCHOOL',
      'Workflow A must match'
    );
    assert.ok(regResult.steps, 'Workflow must return steps trace');
    assert.strictEqual(regResult.steps.length, 6, 'Must contain exactly 6 lifecycle steps');

    // Verify 6 Steps match the flowchart
    const stepNames = regResult.steps.map(s => s.step);
    assert.ok(stepNames[0].includes('Create institution record'), 'Step 1 matches');
    assert.ok(stepNames[1].includes('Configure school identity and academic defaults'), 'Step 2 matches');
    assert.ok(stepNames[2].includes('Verify domains and email'), 'Step 3 matches');
    assert.ok(stepNames[3].includes('Invite institution administrator'), 'Step 4 matches');
    assert.ok(stepNames[4].includes('Validate permissions and configuration'), 'Step 5 matches');
    assert.ok(stepNames[5].includes('Activate institution'), 'Step 6 matches');

    // Invariant: Student, staff and financial records are NOT fabricated automatically
    assert.strictEqual(regResult.data.metrics.enrolledStudents, 0, 'Zero fabricated students invariant');
    assert.strictEqual(regResult.data.metrics.teachingFaculty, 0, 'Zero fabricated faculty invariant');
    assert.strictEqual(regResult.data.metrics.revenueYTD, '₹ 0.00', 'Zero fabricated revenue invariant');
    assert.strictEqual(regResult.data.status, 'Active', 'School status is Active upon completion');
  });

  // --------------------------------------------------------------------------
  // SECTION 4: HTTP API LIVE ENDPOINTS TEST (Server Integration)
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 4: HTTP API Modular Endpoints Integration ---');

  const testEndpoints = [
    { path: '/api/v1/modules/institutions', name: 'GET /api/v1/modules/institutions' },
    { path: '/api/v1/platform/modules/institution-onboarding', name: 'GET /api/v1/platform/modules/institution-onboarding' },
    { path: '/api/v1/modules/global-settings', name: 'GET /api/v1/modules/global-settings' },
    { path: '/api/v1/modules/security-monitoring', name: 'GET /api/v1/modules/security-monitoring' },
    { path: '/api/v1/modules/support-tickets', name: 'GET /api/v1/modules/support-tickets' },
    { path: '/api/v1/modules/backups-recovery', name: 'GET /api/v1/modules/backups-recovery' },
    { path: '/api/v1/modules/system-health', name: 'GET /api/v1/modules/system-health' }
  ];

  for (const ep of testEndpoints) {
    await testAsync(`Live HTTP: ${ep.name}`, async () => {
      const res = await request({
        hostname: '127.0.0.1',
        port: 5000,
        path: ep.path,
        method: 'GET',
        headers: {
          'x-actor-role': 'Super Administrator',
          'x-institution-scope': 'PLATFORM_WIDE'
        }
      });
      assert.strictEqual(res.status, 200, `Expected 200 OK from ${ep.path}, got ${res.status}`);
      assert.strictEqual(res.body.success, true, `Response success must be true for ${ep.path}`);
    });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test runner fatal error:', err);
    process.exit(1);
  });
}

module.exports = runTests;
