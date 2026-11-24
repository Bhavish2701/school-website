const http = require('http');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

async function testBackendLogin(identifier, password, expectedRole, expectedRedirect) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ identifier, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!data.success) {
              return reject(new Error(`Login failed for ${identifier}: ${data.message || body}`));
            }
            const role = data.data.user.role;
            const redirectUrl = data.data.routing.redirectUrl;
            console.log(`[PASS] ${identifier} (${role}) -> redirectUrl: ${redirectUrl}`);
            assert.strictEqual(role, expectedRole, `Expected role ${expectedRole}, got ${role}`);
            assert.strictEqual(redirectUrl, expectedRedirect, `Expected redirectUrl ${expectedRedirect}, got ${redirectUrl}`);
            resolve({ data, role, redirectUrl });
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function testFrontendLogic() {
  console.log('\n--- Testing Frontend Navigation & Redirection Logic ---');
  // Load portal-auth.js in node context with mock window/document/storage
  const storage = {};
  const mockStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  global.window = {
    location: { href: '', search: '', pathname: '/login', hash: '' },
    localStorage: mockStorage,
    sessionStorage: mockStorage
  };
  global.localStorage = mockStorage;
  global.sessionStorage = mockStorage;
  global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  };

  const portalAuthCode = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'portal-auth.js'), 'utf8');
  eval(portalAuthCode);

  const PA = global.window.PortalAuth;
  assert.ok(PA, 'PortalAuth must exist');

  // Test getMainDashboardUrlForRole
  const testCases = [
    { role: 'SUPER_ADMIN', expected: '/platform-admin#dashboard' },
    { role: 'PLATFORM_ADMIN', expected: '/platform-admin#dashboard' },
    { role: 'PRINCIPAL', expected: '/management#dashboard' },
    { role: 'VICE_PRINCIPAL', expected: '/management#dashboard' },
    { role: 'VP', expected: '/management#dashboard' },
    { role: 'OFFICE', expected: '/management#dashboard' },
    { role: 'CLERK', expected: '/management#dashboard' },
    { role: 'ADMIN', expected: '/management#dashboard' },
    { role: 'ACCOUNTS', expected: '/management#dashboard' },
    { role: 'EXAM_COORDINATOR', expected: '/management#dashboard' },
    { role: 'TEACHER', expected: '/teacher#dashboard' },
    { role: 'FACULTY', expected: '/teacher#dashboard' },
    { role: 'STUDENT', expected: '/student#dashboard' },
    { role: 'PARENT', expected: '/parent#dashboard' }
  ];

  testCases.forEach(tc => {
    const res = PA.getMainDashboardUrlForRole(tc.role);
    console.log(`[PASS] getMainDashboardUrlForRole('${tc.role}') => ${res}`);
    assert.strictEqual(res, tc.expected, `Role ${tc.role} should map to ${tc.expected}`);
    assert.ok(!res.includes('#fees'), `${tc.role} must not redirect to #fees`);
    assert.ok(!res.includes('#examinations'), `${tc.role} must not redirect to #examinations`);
    assert.ok(!res.includes('#students'), `${tc.role} must not redirect to #students`);
    assert.ok(!res.includes('#attendance'), `${tc.role} must not redirect to #attendance`);
  });

  // Test clearNavigationCaches
  mockStorage.setItem('sv_mgmt_last_module', 'fees');
  mockStorage.setItem('sv_teacher_last_module', 'attendance');
  mockStorage.setItem('sv_active_view', 'examinations');
  PA.clearNavigationCaches();
  assert.strictEqual(mockStorage.getItem('sv_mgmt_last_module'), null);
  assert.strictEqual(mockStorage.getItem('sv_teacher_last_module'), null);
  assert.strictEqual(mockStorage.getItem('sv_active_view'), null);
  console.log('[PASS] clearNavigationCaches successfully cleared all module caches');

  // Test restoreActiveView logic
  let navigatedMod = null;
  let navigatedSub = null;
  global.window.portalApp = {
    navigateTo: (mod, sub) => { navigatedMod = mod; navigatedSub = sub; }
  };
  global.window.teacherApp = {
    navigateTo: (mod, sub) => { navigatedMod = mod; navigatedSub = sub; }
  };

  // Case 1: Empty hash -> must default to dashboard
  global.window.location.hash = '';
  PA.restoreActiveView('management');
  assert.strictEqual(navigatedMod, 'dashboard');
  console.log('[PASS] restoreActiveView(management) with empty hash -> dashboard');

  PA.restoreActiveView('teacher');
  assert.strictEqual(navigatedMod, 'dashboard');
  console.log('[PASS] restoreActiveView(teacher) with empty hash -> dashboard');

  // Case 2: Browser refreshed with active hash -> must preserve active module
  global.window.location.hash = '#students';
  PA.restoreActiveView('management');
  assert.strictEqual(navigatedMod, 'students');
  console.log('[PASS] restoreActiveView(management) with #students -> students (maintains view on refresh)');

  global.window.location.hash = '#attendance';
  PA.restoreActiveView('teacher');
  assert.strictEqual(navigatedMod, 'attendance');
  console.log('[PASS] restoreActiveView(teacher) with #attendance -> attendance (maintains view on refresh)');

  // Case 3: Test demo fallback logins
  const demoCases = [
    { u: 'principal', p: 'Principal@123', expectedUrl: '/management#dashboard' },
    { u: 'viceprincipal', p: 'VicePrincipal@123', expectedUrl: '/management#dashboard' },
    { u: 'officestaff', p: 'Office@123', expectedUrl: '/management#dashboard' },
    { u: 'teacher1', p: 'Teacher@123', expectedUrl: '/teacher#dashboard' },
    { u: 'superadmin', p: 'SuperAdmin@123', expectedUrl: '/platform-admin#dashboard' }
  ];

  demoCases.forEach(dc => {
    const fallback = PA.handleDemoCredentialFallback(dc.u, dc.p);
    assert.ok(fallback, `Demo fallback should match for ${dc.u}`);
    const targetUrl = PA.getMainDashboardUrlForRole(fallback.user.role);
    console.log(`[PASS] handleDemoCredentialFallback('${dc.u}') => role ${fallback.user.role} -> ${targetUrl}`);
    assert.strictEqual(targetUrl, dc.expectedUrl);
  });
}

async function run() {
  console.log('=== E2E NAVIGATION & AUTHENTICATION VERIFICATION ===\n');
  try {
    // 1. Super Admin
    await testBackendLogin('superadmin@srividya.edu.in', 'SuperAdmin@123', 'SUPER_ADMIN', '/platform-admin#dashboard');

    // 2. Principal
    await testBackendLogin('principal@srividya.edu.in', 'Principal@123', 'PRINCIPAL', '/management#dashboard');

    // 3. Vice Principal
    await testBackendLogin('viceprincipal@srividya.edu.in', 'VicePrincipal@123', 'VICE_PRINCIPAL', '/management#dashboard');

    // 4. Office Staff
    await testBackendLogin('office@srividya.edu.in', 'Office@123', 'OFFICE', '/management#dashboard');

    // 5. Teacher
    await testBackendLogin('teacher@srividya.edu.in', 'Teacher@123', 'TEACHER', '/teacher#dashboard');

    // 6. Test Frontend Matrix and Refresh logic
    testFrontendLogic();

    console.log('\n====================================================');
    console.log('✓ ALL POST-LOGIN NAVIGATION & REDIRECTION TESTS PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n[TEST FAILURE]:', err);
    process.exit(1);
  }
}

run();
