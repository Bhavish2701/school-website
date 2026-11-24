const fs = require('fs');
const path = require('path');

console.log('--- Starting Authentication Unification Refactoring ---');

// 1. Update frontend/administration-portal/index.html
const mgmtPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
let mgmtContent = fs.readFileSync(mgmtPath, 'utf8');

// Check if managementLoginOverlay exists
if (mgmtContent.includes('id="managementLoginOverlay"')) {
  console.log('[1/5] Removing managementLoginOverlay from administration-portal/index.html...');
  // Find start and end of overlay
  const startIdx = mgmtContent.indexOf('<!-- ==========================================================================\n       MANAGEMENT PORTAL LOGIN OVERLAY');
  const targetEnd = '<div class="portal-layout">';
  const endIdx = mgmtContent.indexOf(targetEnd, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    mgmtContent = mgmtContent.slice(0, startIdx) + '<div class="portal-layout">' + mgmtContent.slice(endIdx + targetEnd.length);
    console.log('✓ Successfully removed managementLoginOverlay');
  } else {
    // Fallback regex removal
    mgmtContent = mgmtContent.replace(/<!-- ==========================================================================[\s\S]*?id="managementLoginOverlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');
    console.log('✓ Fallback regex removed managementLoginOverlay');
  }

  // Remove portal-login.css link and insert early route-guard
  const oldLoginCss = /<link rel="stylesheet" href="(?:\/|\.\.\/)css\/portal-login\.css[^>]*>\s*/g;
  mgmtContent = mgmtContent.replace(oldLoginCss, '');

  const earlyGuard = `  <!-- Early Route Guard: Unified Authentication Verification -->
  <script>
    (function() {
      try {
        var token = localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access');
        var isAuth = localStorage.getItem('sv_auth_unified') === 'true' || sessionStorage.getItem('sv_auth_unified') === 'true' ||
                     localStorage.getItem('sv_auth_management') === 'true' || sessionStorage.getItem('sv_auth_management') === 'true';
        if (!token && !isAuth) {
          var cur = window.location.pathname + window.location.search;
          window.location.replace('/login?redirect=' + encodeURIComponent(cur));
        }
      } catch (e) {}
    })();
  </script>\n</head>`;

  mgmtContent = mgmtContent.replace('</head>', earlyGuard);
  fs.writeFileSync(mgmtPath, mgmtContent, 'utf8');
  console.log('✓ Saved updated administration-portal/index.html');
} else {
  console.log('(!) managementLoginOverlay already removed from administration-portal/index.html');
}

// 2. Update frontend/faculty-portal/index.html
const teacherPath = path.join(__dirname, '../../frontend/faculty-portal/index.html');
let teacherContent = fs.readFileSync(teacherPath, 'utf8');

if (teacherContent.includes('id="teacherLoginOverlay"')) {
  console.log('[2/5] Removing teacherLoginOverlay from faculty-portal/index.html...');
  const startIdx = teacherContent.indexOf('<!-- ==========================================================================\n       TEACHER PORTAL LOGIN OVERLAY');
  const targetEnd = '<div class="portal-layout">';
  const endIdx = teacherContent.indexOf(targetEnd, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    teacherContent = teacherContent.slice(0, startIdx) + '<div class="portal-layout">' + teacherContent.slice(endIdx + targetEnd.length);
    console.log('✓ Successfully removed teacherLoginOverlay');
  } else {
    teacherContent = teacherContent.replace(/<!-- ==========================================================================[\s\S]*?id="teacherLoginOverlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');
    console.log('✓ Fallback regex removed teacherLoginOverlay');
  }

  // Remove portal-login.css link and insert early route-guard
  const oldLoginCss = /<link rel="stylesheet" href="(?:\/|\.\.\/)css\/portal-login\.css[^>]*>\s*/g;
  teacherContent = teacherContent.replace(oldLoginCss, '');

  const earlyGuard = `  <!-- Early Route Guard: Unified Authentication Verification -->
  <script>
    (function() {
      try {
        var token = localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access');
        var isAuth = localStorage.getItem('sv_auth_unified') === 'true' || sessionStorage.getItem('sv_auth_unified') === 'true' ||
                     localStorage.getItem('sv_auth_teacher') === 'true' || sessionStorage.getItem('sv_auth_teacher') === 'true';
        if (!token && !isAuth) {
          var cur = window.location.pathname + window.location.search;
          window.location.replace('/login?redirect=' + encodeURIComponent(cur));
        }
      } catch (e) {}
    })();
  </script>\n</head>`;

  teacherContent = teacherContent.replace('</head>', earlyGuard);
  fs.writeFileSync(teacherPath, teacherContent, 'utf8');
  console.log('✓ Saved updated faculty-portal/index.html');
} else {
  console.log('(!) teacherLoginOverlay already removed from faculty-portal/index.html');
}

// 3. Update frontend/platform-admin/index.html
const platformPath = path.join(__dirname, '../../frontend/platform-admin/index.html');
let platformContent = fs.readFileSync(platformPath, 'utf8');

if (!platformContent.includes('Early Route Guard: Unified Authentication Verification')) {
  console.log('[3/5] Adding early route guard to platform-admin/index.html...');
  const earlyGuard = `  <!-- Early Route Guard: Unified Authentication Verification -->
  <script>
    (function() {
      try {
        var token = localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access');
        var isAuth = localStorage.getItem('sv_auth_unified') === 'true' || sessionStorage.getItem('sv_auth_unified') === 'true' ||
                     localStorage.getItem('sv_auth_platform_admin') === 'true' || sessionStorage.getItem('sv_auth_platform_admin') === 'true';
        if (!token && !isAuth) {
          var cur = window.location.pathname + window.location.search;
          window.location.replace('/login?redirect=' + encodeURIComponent(cur));
        }
      } catch (e) {}
    })();
  </script>\n</head>`;

  platformContent = platformContent.replace('</head>', earlyGuard);
  fs.writeFileSync(platformPath, platformContent, 'utf8');
  console.log('✓ Saved updated platform-admin/index.html');
} else {
  console.log('(!) Early route guard already present in platform-admin/index.html');
}

// 4. Update frontend/js/api-client.js
const apiClientPath = path.join(__dirname, '../../frontend/js/api-client.js');
let apiClientContent = fs.readFileSync(apiClientPath, 'utf8');

console.log('[4/5] Updating handleSessionExpired in api-client.js...');
const oldExpiredRegex = /handleSessionExpired\(\)\s*\{[\s\S]*?overlays\.forEach\(\(ov\)\s*=>\s*ov\.classList\.remove\('hidden'\)\);\s*\}/;

const newExpiredMethod = `handleSessionExpired() {
      this.clearSession();
      try {
        sessionStorage.removeItem('sv_auth_unified');
        localStorage.removeItem('sv_auth_unified');
        sessionStorage.removeItem('sv_auth_management');
        localStorage.removeItem('sv_auth_management');
        sessionStorage.removeItem('sv_auth_teacher');
        localStorage.removeItem('sv_auth_teacher');
        sessionStorage.removeItem('sv_auth_platform_admin');
        localStorage.removeItem('sv_auth_platform_admin');
        sessionStorage.removeItem('sv_user_role');
        localStorage.removeItem('sv_user_role');
        sessionStorage.removeItem('sv_user_portal');
        localStorage.removeItem('sv_user_portal');
      } catch (e) {}

      this.showToast('Session expired. Please sign in again.', 'fa-lock', true);
      const currentPath = (typeof window !== 'undefined' && window.location) ? (window.location.pathname + window.location.search) : '';
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login?msg=session_expired&redirect=' + encodeURIComponent(currentPath);
        }
      }, 500);
    }`;

if (oldExpiredRegex.test(apiClientContent)) {
  apiClientContent = apiClientContent.replace(oldExpiredRegex, newExpiredMethod);
  fs.writeFileSync(apiClientPath, apiClientContent, 'utf8');
  console.log('✓ Successfully updated handleSessionExpired in api-client.js');
} else {
  console.log('(!) handleSessionExpired already updated or regex did not match, checking direct string replace...');
  if (apiClientContent.includes('const overlays = document.querySelectorAll(\'[id$="LoginOverlay"]\');')) {
    const targetBlock = `handleSessionExpired() {
      this.clearSession();
      this.showToast('Session expired. Please sign in again.', 'fa-lock', true);
      // Reveal login overlay if present on the page
      const overlays = document.querySelectorAll('[id$="LoginOverlay"]');
      overlays.forEach((ov) => ov.classList.remove('hidden'));
    }`;
    apiClientContent = apiClientContent.replace(targetBlock, newExpiredMethod);
    fs.writeFileSync(apiClientPath, apiClientContent, 'utf8');
    console.log('✓ Replaced targetBlock in api-client.js');
  }
}

console.log('✓ Finished Phase 1 refactoring successfully.');
