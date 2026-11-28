const http = require('http');
const fs = require('fs');
const path = require('path');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      hostname: 'localhost',
      port: 5000,
      path: path
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, length: body.length }));
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('SRI VIDYA UNIFIED LOGIN & ROLE REDIRECTION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} -> ${details || ''}`);
    }
  }

  // 1. Verify /login HTTP 200 Route
  try {
    const loginPage = await get('/login');
    assert(loginPage.status === 200, 'HTTP GET /login serves unified login page (200 OK)', `Status: ${loginPage.status}`);
  } catch (e) {
    assert(false, 'HTTP GET /login accessible', e.message);
  }

  // 2. Authentication Test Cases (Unified Single Login API)
  const testUsers = [
    {
      label: 'Principal (Executive Management)',
      user: 'principal',
      pass: 'Principal@123',
      expectedRole: 'PRINCIPAL',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Vice Principal (Discipline & Academics)',
      user: 'viceprincipal',
      pass: 'VicePrincipal@123',
      expectedRole: 'VICE_PRINCIPAL',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Office Staff / Clerk (School Administration)',
      user: 'officestaff',
      pass: 'Office@123',
      expectedRole: 'OFFICE',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Faculty / Teacher (Academic Workspace)',
      user: 'teacher1',
      pass: 'Teacher@123',
      expectedRole: 'TEACHER',
      expectedPortal: 'teacher',
      expectedUrl: '/teacher'
    },
    {
      label: 'Platform Super Administrator (Systems Console)',
      user: 'superadmin',
      pass: 'SuperAdmin@123',
      expectedRole: 'SUPER_ADMIN',
      expectedPortal: 'platform-admin',
      expectedUrl: '/platform-admin'
    },
    {
      label: 'Legacy Email Principal (srividyaschools2017@gmail.com)',
      user: 'srividyaschools2017@gmail.com',
      pass: 'Principal@123',
      expectedRole: 'PRINCIPAL',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Faculty School ID (SV200005 -> Teacher)',
      user: 'SV200005',
      pass: 'Teacher@123',
      expectedRole: 'TEACHER',
      expectedPortal: 'teacher',
      expectedUrl: '/teacher'
    },
    {
      label: 'Management School ID (SV200001 -> Principal)',
      user: 'SV200001',
      pass: 'Principal@123',
      expectedRole: 'PRINCIPAL',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Vice Principal School ID (SV200002 -> Vice Principal)',
      user: 'SV200002',
      pass: 'VicePrincipal@123',
      expectedRole: 'VICE_PRINCIPAL',
      expectedPortal: 'management',
      expectedUrl: '/management'
    },
    {
      label: 'Office School ID (SV-OFFICE-01 -> Office)',
      user: 'SV-OFFICE-01',
      pass: 'Office@123',
      expectedRole: 'OFFICE',
      expectedPortal: 'management',
      expectedUrl: '/management'
    }
  ];

  for (const tc of testUsers) {
    try {
      const res = await postJson('/api/v1/auth/login', {
        username: tc.user,
        password: tc.pass
      });

      const body = res.data;
      const ok = res.status === 200 && body.success === true;
      const roleMatch = body.data && body.data.user && body.data.user.role === tc.expectedRole;
      const portalMatch = body.data && body.data.routing && body.data.routing.portal === tc.expectedPortal;
      const urlMatch = body.data && body.data.routing && (body.data.routing.redirectUrl === tc.expectedUrl || body.data.routing.redirectUrl.startsWith(tc.expectedUrl));

      assert(
        ok && roleMatch && portalMatch && urlMatch,
        `Role Redirection for ${tc.label} [${tc.user}] -> ${tc.expectedUrl}`,
        `Got role=${body.data?.user?.role}, portal=${body.data?.routing?.portal}, url=${body.data?.routing?.redirectUrl}`
      );
    } catch (e) {
      assert(false, `Login test failed for ${tc.label}`, e.message);
    }
  }

  // 3. Negative Login Test: Invalid Password
  try {
    const invalidRes = await postJson('/api/v1/auth/login', {
      username: 'principal',
      password: 'WrongPassword999!'
    });
    assert(invalidRes.status === 401, 'Invalid password correctly rejected with 401 Unauthorized', `Status: ${invalidRes.status}`);
  } catch (e) {
    assert(false, 'Invalid password rejection', e.message);
  }

  // 4. Verify Frontend Files Integrity
  const loginHtml = fs.readFileSync(path.join(__dirname, '../frontend/login.html'), 'utf8');
  assert(loginHtml.includes('unifiedLoginForm'), 'frontend/login.html contains #unifiedLoginForm');
  assert(loginHtml.includes('PortalAuth.initUnifiedLoginPage'), 'frontend/login.html initializes PortalAuth.initUnifiedLoginPage');
  assert(!loginHtml.includes('PORTALS:'), 'frontend/login.html has NO portal selector buttons');

  const portalAuthJs = fs.readFileSync(path.join(__dirname, '../frontend/js/portal-auth.js'), 'utf8');
  assert(portalAuthJs.includes('initUnifiedLoginPage'), 'portal-auth.js contains initUnifiedLoginPage');
  assert(portalAuthJs.includes('handleUnifiedLogin'), 'portal-auth.js contains handleUnifiedLogin');
  assert(portalAuthJs.includes('roleMatrix'), 'portal-auth.js contains roleMatrix mapping');
  assert(portalAuthJs.includes('isAuthorizedForPath'), 'portal-auth.js contains route authorization guard');

  console.log(`\n====================================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`====================================================`);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
