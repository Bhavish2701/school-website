const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const authController = require('../src/controllers/auth.controller');

console.log('================================================================');
console.log('VERIFYING SRI VIDYA UNIFIED AUTHENTICATION ARCHITECTURE');
console.log('================================================================\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// 1. FILE INSPECTION TESTS
console.log('--- 1. Testing Portal HTML Files & Route Guards ---');
const mgmtHtml = fs.readFileSync(path.join(__dirname, '../../frontend/administration-portal/index.html'), 'utf8');
assert(!mgmtHtml.includes('id="managementLoginOverlay"'), 'administration-portal/index.html does not contain managementLoginOverlay');
assert(!mgmtHtml.includes('id="mgmtLoginForm"'), 'administration-portal/index.html does not contain duplicate mgmtLoginForm');
assert(mgmtHtml.includes('Early Route Guard: Unified Authentication Verification'), 'administration-portal/index.html contains Early Route Guard in <head>');
assert(mgmtHtml.includes('class="portal-layout"'), 'administration-portal/index.html maintains portal-layout');

const teacherHtml = fs.readFileSync(path.join(__dirname, '../../frontend/faculty-portal/index.html'), 'utf8');
assert(!teacherHtml.includes('id="teacherLoginOverlay"'), 'faculty-portal/index.html does not contain teacherLoginOverlay');
assert(!teacherHtml.includes('id="teacherLoginForm"'), 'faculty-portal/index.html does not contain duplicate teacherLoginForm');
assert(teacherHtml.includes('Early Route Guard: Unified Authentication Verification'), 'faculty-portal/index.html contains Early Route Guard in <head>');
assert(teacherHtml.includes('class="portal-layout"'), 'faculty-portal/index.html maintains portal-layout');

const platformHtml = fs.readFileSync(path.join(__dirname, '../../frontend/platform-admin/index.html'), 'utf8');
assert(platformHtml.includes('Early Route Guard: Unified Authentication Verification'), 'platform-admin/index.html contains Early Route Guard in <head>');

const loginHtml = fs.readFileSync(path.join(__dirname, '../../frontend/login.html'), 'utf8');
assert(loginHtml.includes('id="unifiedLoginForm"'), 'login.html is the central single login page with unifiedLoginForm');
assert(loginHtml.includes('id="unifiedOtpForm"'), 'login.html has unifiedOtpForm for 2FA verification');

// 2. CLIENT SCRIPTS INSPECTION TESTS
console.log('\n--- 2. Testing Authentication Logic Scripts ---');
const apiClientJs = fs.readFileSync(path.join(__dirname, '../../frontend/js/api-client.js'), 'utf8');
assert(!apiClientJs.includes('overlays.forEach((ov) => ov.classList.remove(\'hidden\'))'), 'api-client.js handleSessionExpired does NOT unhide overlays');
assert(apiClientJs.includes('/login?msg=session_expired'), 'api-client.js handleSessionExpired redirects to /login?msg=session_expired');

const portalAuthJs = fs.readFileSync(path.join(__dirname, '../../frontend/js/portal-auth.js'), 'utf8');
assert(!portalAuthJs.includes('overlay.classList.remove(\'hidden\')'), 'portal-auth.js does not unhide overlays on session expiration');
assert(portalAuthJs.includes('msgParam !== \'logged_out\' && msgParam !== \'session_expired\' && this.isAnySessionActive()'), 'portal-auth.js respects logout and avoids auto-redirect loops on logout');
assert(portalAuthJs.includes('/login?msg=logged_out'), 'portal-auth.js logout redirects to /login?msg=logged_out');

// 3. BACKEND AUTH CONTROLLER & RBAC TESTS
console.log('\n--- 3. Testing Backend REST Auth Controller (/api/v1/auth/login) ---');

function mockRequestResponse(body) {
  const req = { body };
  let resolvePromise;
  const promise = new Promise((resolve) => { resolvePromise = resolve; });

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      resolvePromise({ status: this.statusCode, data });
      return this;
    },
  };

  const next = (err) => {
    resolvePromise({ status: err.statusCode || 500, error: err });
  };

  return { req, res, next, promise };
}

async function runLiveAuthTests() {
  await connectDB();

  const credentials = [
    {
      role: 'SUPER_ADMIN',
      user: 'superadmin',
      pass: 'SuperAdmin@123',
      expectedPortal: 'platform-admin',
      expectedRedirect: '/platform-admin',
    },
    {
      role: 'PRINCIPAL',
      user: 'principal',
      pass: 'Principal@123',
      expectedPortal: 'management',
      expectedRedirect: '/management',
      expectedSubtype: 'principal',
    },
    {
      role: 'PRINCIPAL (Demo Alias)',
      user: 'srividyaschools2017@gmail.com',
      pass: 'Principal@123',
      expectedPortal: 'management',
      expectedRedirect: '/management',
      expectedSubtype: 'principal',
    },
    {
      role: 'VICE_PRINCIPAL',
      user: 'viceprincipal',
      pass: 'VicePrincipal@123',
      expectedPortal: 'management',
      expectedRedirect: '/management',
      expectedSubtype: 'vice-principal',
    },
    {
      role: 'OFFICE / CLERK',
      user: 'officestaff',
      pass: 'Office@123',
      expectedPortal: 'management',
      expectedRedirect: '/management',
      expectedSubtype: 'admin',
    },
    {
      role: 'TEACHER',
      user: 'teacher1',
      pass: 'Teacher@123',
      expectedPortal: 'teacher',
      expectedRedirect: '/teacher',
      expectedSubtype: 'teacher',
    },
  ];

  for (const cred of credentials) {
    try {
      const { req, res, next, promise } = mockRequestResponse({
        identifier: cred.user,
        password: cred.pass,
      });

      authController.login(req, res, next);
      const result = await promise;

      assert(result.status === 200, `API Login for ${cred.role} (${cred.user}) returned HTTP 200`);
      assert(result.data && result.data.success === true, `API response for ${cred.role} has success: true`);
      assert(result.data && result.data.data && result.data.data.tokens && result.data.data.tokens.accessToken, `API issued valid accessToken for ${cred.role}`);
      assert(result.data.data.routing && result.data.data.routing.portal === cred.expectedPortal, `Routing for ${cred.role} correctly identified portal: ${cred.expectedPortal}`);
      assert(result.data.data.routing && result.data.data.routing.redirectUrl === cred.expectedRedirect, `Routing for ${cred.role} correctly maps redirectUrl: ${cred.expectedRedirect}`);
      if (cred.expectedSubtype) {
        assert(result.data.data.routing.roleSubtype === cred.expectedSubtype, `Role subtype for ${cred.role} correctly identified: ${cred.expectedSubtype}`);
      }
    } catch (e) {
      assert(false, `API Login failed for ${cred.role} (${cred.user}): ${e.message}`);
    }
  }

  // 4. TEST INVALID CREDENTIALS
  console.log('\n--- 4. Testing Invalid Credentials & Error Handling ---');
  try {
    const { req, res, next, promise } = mockRequestResponse({
      identifier: 'nonexistent_user',
      password: 'WrongPassword@999',
    });
    authController.login(req, res, next);
    const badResult = await promise;
    assert(badResult.status === 401, 'Invalid credentials returned HTTP 401 Unauthorized');
    assert(badResult.error && badResult.error.message.includes('Invalid username/email or password'), 'Proper error message returned on bad credentials');
  } catch (e) {
    assert(false, `Invalid credentials test failed: ${e.message}`);
  }

  // 5. TEST GET /login PAGE DELIVERY
  console.log('\n--- 5. Testing Unified Login Page HTML Structure ---');
  const loginHtmlDelivery = fs.readFileSync(path.join(__dirname, '../../frontend/login.html'), 'utf8');
  assert(loginHtmlDelivery.includes('Unified Portal Sign In'), 'login.html delivers Unified Portal Sign In interface');
  assert(loginHtmlDelivery.includes('PortalAuth.initUnifiedLoginPage()'), 'login.html initializes PortalAuth.initUnifiedLoginPage');

  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log(`TOTAL PASSED: ${passedTests} | TOTAL FAILED: ${failedTests}`);
  console.log('================================================================');
  process.exit(failedTests > 0 ? 1 : 0);
}

runLiveAuthTests();
