/**
 * test_school_gateways_suite.js
 * Acceptance test suite for Module 18: School Gateways
 * Sri Vidya Educational Trust Platform Administration
 *
 * Verifies:
 * 18.1 School Administration Portal Gateway (Permission scoping, URL token leakage invariant, context preservation)
 * 18.2 Faculty & Teacher Portal Gateway (Identity verification, faculty account validation)
 * 18.3 Public Website Gateway & Status Indicator (Decoupled telemetry: Frontend, Backend API, Database)
 * Sidebar Navigation Shortcuts, Modals, CSS & JavaScript controller exports
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
  console.log('  MODULE 18: SCHOOL GATEWAYS ACCEPTANCE SUITE');
  console.log('=============================================================\n');

  try {
    // -------------------------------------------------------------
    // Test Group 1: 18.1 School Administration Portal Gateway
    // -------------------------------------------------------------
    console.log('--- Test Group 1: 18.1 School Administration Portal Gateway ---');
    
    // Test 1: Authorized school admin access
    const resAuthAdmin = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/verify-access',
      method: 'POST'
    }, {
      role: 'admin',
      institutionId: 'INST-001'
    });

    assert(resAuthAdmin.status === 200, 'POST /verify-access returns 200 OK for authorized admin role');
    assert(resAuthAdmin.data.allowed === true, 'Access granted for school admin');
    assert(resAuthAdmin.data.portalUrl === '/management', 'Target destination is /management');
    assert(resAuthAdmin.data.institutionContext === 'INST-001', 'Preserves institution context INST-001');

    // Test 2: Unauthorized user access denied
    const resDenyUser = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/verify-access',
      method: 'POST'
    }, {
      role: 'student',
      institutionId: 'INST-001'
    });

    assert(resDenyUser.status === 403, 'POST /verify-access returns 403 Forbidden for unauthorized role');
    assert(resDenyUser.data.allowed === false, 'Access denied for non-admin user');
    assert(resDenyUser.data.accessDenied === true, 'Response flags accessDenied = true');
    assert(resDenyUser.data.message.includes('school-level administrative permissions'), 
      'Error message requests authorized institutional admin sign-in');

    // Test 3: Security Invariant: Avoid sending passwords or session tokens in URLs
    console.log('Testing Section 18.1 Invariant: Prohibit tokens and passwords in URLs...');
    const resLeakAttempt = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/verify-access?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&password=SecretPass123',
      method: 'GET'
    });

    assert(resLeakAttempt.status === 400, 'GET /verify-access with URL tokens returns 400 Bad Request');
    assert(resLeakAttempt.data.securityViolation === true, 'Response flags securityViolation = true');
    assert(resLeakAttempt.data.message.includes('SECURITY INVARIANT VIOLATION'), 
      'Error strictly forbids sending passwords or session tokens in URLs');

    // -------------------------------------------------------------
    // Test Group 2: 18.2 Faculty & Teacher Portal Gateway
    // -------------------------------------------------------------
    console.log('\n--- Test Group 2: 18.2 Faculty & Teacher Portal Gateway ---');

    // Test 1: Verified faculty account access
    const resAuthFaculty = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/verify-faculty',
      method: 'POST'
    }, {
      role: 'teacher',
      institutionId: 'INST-001'
    });

    assert(resAuthFaculty.status === 200, 'POST /verify-faculty returns 200 OK for verified teacher');
    assert(resAuthFaculty.data.allowed === true, 'Access granted for faculty member');
    assert(resAuthFaculty.data.portalUrl === '/teacher', 'Target destination is /teacher');

    // Test 2: Non-faculty access denied
    const resDenyFaculty = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/verify-faculty',
      method: 'POST'
    }, {
      role: 'guest',
      institutionId: 'INST-001'
    });

    assert(resDenyFaculty.status === 403, 'POST /verify-faculty returns 403 Forbidden for non-faculty');
    assert(resDenyFaculty.data.allowed === false, 'Access denied for non-faculty role');
    assert(resDenyFaculty.data.message.includes('Verified faculty or teacher account required'), 
      'Message requires authentication through institutional faculty identity flow');

    // -------------------------------------------------------------
    // Test Group 3: 18.3 Public Website Gateway & Decoupled Telemetry
    // -------------------------------------------------------------
    console.log('\n--- Test Group 3: 18.3 Public Website & Decoupled Telemetry ---');

    const resStatus = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/status',
      method: 'GET'
    });

    assert(resStatus.status === 200, 'GET /api/v1/platform/gateways/status returns 200 OK');
    assert(resStatus.data.success === true, 'Response indicates success = true');
    
    // Check required fields (Section 18.3)
    assert(!!resStatus.data.domainConfigured, 'Displays configured domain');
    assert(resStatus.data.domainConfigured.includes('srividya.edu.in'), 'Domain matches srividya.edu.in');
    assert(!!resStatus.data.sslStatus, 'Displays SSL status');
    assert(resStatus.data.sslStatus.includes('VALID') || resStatus.data.sslStatus.includes('TLS'), 'SSL status is valid TLS');
    assert(!!resStatus.data.lastAvailabilityCheck, 'Displays last availability check timestamp');
    assert(!!resStatus.data.linkToPublicWebsite, 'Displays link to public website');

    // Check Decoupled Architecture Invariant (Section 18.3)
    console.log('Testing Section 18.3 Invariant: Decoupled health verification across 3 layers...');
    const decoupled = resStatus.data.decoupledHealth;
    assert(!!decoupled, 'Decoupled health breakdown is present');
    assert(decoupled.isDecoupledVerified === true, 'Flags isDecoupledVerified = true');
    assert(!!decoupled.frontend && decoupled.frontend.status === 'HEALTHY', 'Layer 1: Frontend Web Status is verified independently');
    assert(!!decoupled.backend && decoupled.backend.status === 'HEALTHY', 'Layer 2: Backend REST API Status is verified independently');
    assert(!!decoupled.database && decoupled.database.status === 'CONNECTED', 'Layer 3: Database Storage Status is verified independently');
    assert(decoupled.decoupledSafetyNote.includes('Frontend delivery is decoupled from backend and database health'),
      'Safety note confirms frontend success does not assume backend/DB availability');

    // Test live probe endpoint
    const resProbe = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/gateways/probe-website',
      method: 'GET'
    });
    assert(resProbe.status === 200, 'GET /api/v1/platform/gateways/probe-website returns 200 OK');
    assert(resProbe.data.telemetry.isDecoupledVerified === true, 'Probe endpoint confirms decoupled health');

    // -------------------------------------------------------------
    // Test Group 4: UI Structure, Modals, CSS & JS Exports
    // -------------------------------------------------------------
    console.log('\n--- Test Group 4: UI Structure, Modals, CSS & JS Controller Exports ---');
    const htmlContent = fs.readFileSync(path.join(__dirname, '../frontend/platform-admin/index.html'), 'utf8');
    const cssContent = fs.readFileSync(path.join(__dirname, '../frontend/css/platform-admin.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, '../frontend/js/platform-admin.js'), 'utf8');

    // Check Sidebar Shortcuts & Status Widget in HTML
    const requiredHtmlElements = [
      'id="navGatewayAdmin"',
      'id="navGatewayFaculty"',
      'id="navGatewayWebsite"',
      'id="gatewaySidebarStatusCard"',
      'id="lblGatewayDomain"',
      'id="lblGatewaySslBadge"',
      'id="lblGatewayLastCheck"',
      'id="badgeGatewayFrontend"',
      'id="badgeGatewayApi"',
      'id="badgeGatewayDb"',
      'id="btnHeaderGatewayStatus"',
      'id="modalGatewayAccessDenied"',
      'id="modalFacultyGatewayAuth"',
      'id="modalSchoolGatewayStatus"',
      'id="lblModalGatewayDomain"',
      'id="lblModalGatewaySsl"',
      'id="lblModalGatewayLastCheck"',
      'id="lblModalLayerFrontend"',
      'id="lblModalLayerBackend"',
      'id="lblModalLayerDatabase"'
    ];

    requiredHtmlElements.forEach(elem => {
      assert(htmlContent.includes(elem), `HTML contains required element '${elem}'`);
    });

    // Check CSS Classes
    const requiredCss = [
      '.gateway-status-card',
      '.gateway-status-dot',
      '.gateway-status-title',
      '.gateway-decoupled-badges',
      '.badge-decoupled-ok',
      '.badge-gateway-header',
      '.decoupled-layer-box'
    ];

    requiredCss.forEach(cls => {
      assert(cssContent.includes(cls), `CSS contains class '${cls}'`);
    });

    // Check JS Controller Exports
    const requiredJsMethods = [
      'launchSchoolGateway',
      'openGatewayStatusModal',
      'refreshGatewayStatus',
      'authorizeAndLaunchAdminGateway',
      'authorizeAndLaunchFacultyGateway',
      'setSimulatedGatewayRole'
    ];

    requiredJsMethods.forEach(method => {
      assert(jsContent.includes(method), `JavaScript exports method '${method}'`);
    });

    console.log('\n=============================================================');
    console.log(`  ALL MODULE 18 TESTS PASSED: ${passedTests}/${totalTests} (100%)`);
    console.log('=============================================================\n');

  } catch (err) {
    console.error('\nTest Suite Terminated with Error:', err.message);
    process.exit(1);
  }
}

runTests();
