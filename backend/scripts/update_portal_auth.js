const fs = require('fs');
const path = require('path');

const authJsPath = path.join(__dirname, '../../frontend/js/portal-auth.js');
let code = fs.readFileSync(authJsPath, 'utf8');

// 1. Update inactivity.isAuthenticated
const oldInactivityAuth = `    isAuthenticated() {
      const type = this.activePortalType || 'management';
      const cfg = PortalAuth.configs[type];
      const overlay = document.getElementById(\`\${type}LoginOverlay\`);
      const isOverlayHidden = overlay && overlay.classList.contains('hidden');
      const hasAuth = (cfg && (sessionStorage.getItem(cfg.storageKey) === 'true' || localStorage.getItem(cfg.storageKey) === 'true')) ||
                      (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function' && window.ApiClient.isAuthenticated());
      return Boolean(hasAuth && isOverlayHidden);
    },`;

const newInactivityAuth = `    isAuthenticated() {
      const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function') ? window.ApiClient.isAuthenticated() : false;
      const hasUnified = (sessionStorage.getItem('sv_auth_unified') === 'true' || localStorage.getItem('sv_auth_unified') === 'true');
      const type = this.activePortalType || 'management';
      const cfg = PortalAuth.configs[type];
      const hasPortalAuth = cfg ? (sessionStorage.getItem(cfg.storageKey) === 'true' || localStorage.getItem(cfg.storageKey) === 'true') : false;
      return Boolean(hasToken || hasUnified || hasPortalAuth);
    },`;

if (code.includes(oldInactivityAuth)) {
  code = code.replace(oldInactivityAuth, newInactivityAuth);
  console.log('✓ Replaced inactivity.isAuthenticated');
} else {
  console.log('(!) Could not find exact oldInactivityAuth string, searching regex...');
  code = code.replace(/isAuthenticated\(\)\s*\{[\s\S]*?return Boolean\(hasAuth && isOverlayHidden\);\s*\},/, newInactivityAuth);
}

// 2. Update expireSessionDueToInactivity
const oldExpiryRegex = /expireSessionDueToInactivity\(portalType\)\s*\{[\s\S]*?this\.showToast\('⏱️ Session Expired: Inactive for 15 minutes\. Please sign in with your credentials\.', 'fa-lock', true\);\s*\}/;

const newExpiryMethod = `expireSessionDueToInactivity(portalType) {
    const cfg = this.configs[portalType];
    if (cfg) {
      sessionStorage.removeItem(cfg.storageKey);
      localStorage.removeItem(cfg.storageKey);
      if (cfg.roleKey) {
        sessionStorage.removeItem(cfg.roleKey);
        localStorage.removeItem(cfg.roleKey);
      }
      if (portalType === 'teacher') {
        sessionStorage.removeItem('sv_active_teacher_id');
        localStorage.removeItem('sv_active_teacher_id');
        sessionStorage.removeItem('sv_active_teacher_name');
        localStorage.removeItem('sv_active_teacher_name');
      }
    }

    try {
      sessionStorage.removeItem('sv_auth_unified');
      localStorage.removeItem('sv_auth_unified');
      sessionStorage.removeItem('sv_user_role');
      localStorage.removeItem('sv_user_role');
      sessionStorage.removeItem('sv_user_portal');
      localStorage.removeItem('sv_user_portal');
      sessionStorage.removeItem('sv_user_allowed_portals');
      localStorage.removeItem('sv_user_allowed_portals');
      sessionStorage.removeItem('sv_user_profile');
      localStorage.removeItem('sv_user_profile');
    } catch (e) {}

    if (window.ApiClient && typeof window.ApiClient.clearSession === 'function') {
      window.ApiClient.clearSession();
    }

    if (this.inactivity) {
      this.inactivity.stop();
    }

    this.showToast('⏱️ Session Expired: Inactive for 15 minutes. Redirecting to Unified Sign In...', 'fa-lock', true);
    const currentPath = (typeof window !== 'undefined' && window.location) ? (window.location.pathname + window.location.search) : '';
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login?msg=session_expired&redirect=' + encodeURIComponent(currentPath);
      }
    }, 600);
  }`;

if (oldExpiryRegex.test(code)) {
  code = code.replace(oldExpiryRegex, newExpiryMethod);
  console.log('✓ Replaced expireSessionDueToInactivity');
} else {
  console.log('(!) Could not match oldExpiryRegex');
}

// 3. Update initUnifiedLoginPage
const oldInitUnifiedRegex = /initUnifiedLoginPage\(\)\s*\{[\s\S]*?if \(this\.isAnySessionActive\(\)\)\s*\{[\s\S]*?setTimeout\(\(\)\s*=>\s*\{[\s\S]*?window\.location\.href\s*=\s*target;\s*\}, 500\);\s*return;\s*\}/;

const newInitUnifiedMethod = `initUnifiedLoginPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const msgParam = urlParams.get('msg');

    if (msgParam === 'logged_out') {
      this.showToast('You have been signed out successfully.', 'fa-circle-check');
    } else if (msgParam === 'unauthorized' || msgParam === 'restricted') {
      this.showToast('Access restricted: Please sign in with an account authorized for that portal.', 'fa-shield-halved', true);
    } else if (msgParam === 'session_expired') {
      this.showToast('Session expired due to inactivity. Please sign in again.', 'fa-clock', true);
    }

    // Do NOT auto-redirect if user explicitly logged out or session expired
    if (msgParam !== 'logged_out' && msgParam !== 'session_expired' && this.isAnySessionActive()) {
      const userRole = (localStorage.getItem('sv_user_role') || sessionStorage.getItem('sv_user_role') || 'PRINCIPAL').toUpperCase();
      const routing = this.resolvePortalForRole(userRole);

      let target = routing.redirectUrl || '/management';
      if (redirectParam && this.isAuthorizedForPath(userRole, redirectParam)) {
        target = redirectParam;
      }

      this.showToast(\`Active session detected (\${userRole}). Redirecting to your dashboard...\`, 'fa-circle-check');
      setTimeout(() => {
        window.location.href = target;
      }, 500);
      return;
    }

    // Clear any residual session tokens if user arrived with logged_out
    if (msgParam === 'logged_out') {
      try {
        sessionStorage.clear();
        localStorage.removeItem('sv_token_access');
        localStorage.removeItem('sv_token_refresh');
        localStorage.removeItem('sv_auth_unified');
        localStorage.removeItem('sv_user_role');
        localStorage.removeItem('sv_user_portal');
        localStorage.removeItem('sv_user_allowed_portals');
        localStorage.removeItem('sv_user_profile');
        localStorage.removeItem('sv_auth_management');
        localStorage.removeItem('sv_auth_teacher');
        localStorage.removeItem('sv_auth_platform_admin');
      } catch (e) {}
    }

    // Setup OTP input auto-advance
    this.setupOtpInputListeners('unified');

    // Focus user input
    const userInp = document.getElementById('unifiedLoginUser');
    if (userInp) userInp.focus();
  }`;

if (oldInitUnifiedRegex.test(code)) {
  code = code.replace(oldInitUnifiedRegex, newInitUnifiedMethod);
  console.log('✓ Replaced initUnifiedLoginPage');
} else {
  console.log('(!) Could not match oldInitUnifiedRegex');
}

// 4. Update init(portalType)
const oldInitRegex = /async init\(portalType\)\s*\{[\s\S]*?\/\/ 9\. Start 15-minute inactivity session expiration countdown[\s\S]*?if \(this\.inactivity\)\s*\{[\s\S]*?this\.inactivity\.init\(portalType\);\s*\}\s*\}/;

const newInitMethod = `async init(portalType) {
    if (typeof portalType === 'object' && portalType !== null) {
      portalType = portalType.portal || portalType.portalType || 'management';
    }
    const cfg = this.configs[portalType];
    if (!cfg) return;

    // 1. Check Authentication Status
    const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function') ? window.ApiClient.isAuthenticated() : false;
    const isSessionAuth = (sessionStorage.getItem(cfg.storageKey) === 'true') ||
                          (localStorage.getItem(cfg.storageKey) === 'true') ||
                          (sessionStorage.getItem('sv_auth_unified') === 'true') ||
                          (localStorage.getItem('sv_auth_unified') === 'true');

    if (!hasToken && !isSessionAuth) {
      // Unauthenticated: Redirect directly to Unified Login Page with return path
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = \`/login?redirect=\${encodeURIComponent(currentPath)}\`;
      return;
    }

    // 2. Route Guarding: Check Role Authorization
    const userRole = (localStorage.getItem('sv_user_role') || sessionStorage.getItem('sv_user_role') || '').toUpperCase();
    let allowedPortals = [];
    try {
      const rawAllowed = localStorage.getItem('sv_user_allowed_portals') || sessionStorage.getItem('sv_user_allowed_portals');
      if (rawAllowed) allowedPortals = JSON.parse(rawAllowed);
    } catch (e) {}

    if (!allowedPortals || allowedPortals.length === 0) {
      const mapping = this.roleMatrix[userRole] || this.roleMatrix.PRINCIPAL;
      allowedPortals = mapping.allowedPortals;
    }

    if (!allowedPortals.includes(portalType)) {
      console.warn(\`[RouteGuard] Role \${userRole} unauthorized for portal '\${portalType}'. Redirecting to authorized workspace.\`);
      const home = this.resolvePortalForRole(userRole);
      sessionStorage.setItem('sv_access_notice', \`Access restricted: Your assigned role (\${userRole}) is authorized for \${home.dashboardTitle || home.portal}.\`);
      window.location.href = home.redirectUrl || '/login';
      return;
    }

    // 3. Authorized! Check if there is an access notice to show
    const pendingNotice = sessionStorage.getItem('sv_access_notice');
    if (pendingNotice) {
      sessionStorage.removeItem('sv_access_notice');
      setTimeout(() => {
        this.showToast(pendingNotice, 'fa-shield-halved', true);
      }, 400);
    }

    // 4. Synchronize storage keys across storages
    sessionStorage.setItem(cfg.storageKey, 'true');
    localStorage.setItem(cfg.storageKey, 'true');
    sessionStorage.setItem('sv_auth_unified', 'true');
    localStorage.setItem('sv_auth_unified', 'true');

    if (portalType === 'management') {
      let savedRole = sessionStorage.getItem(cfg.roleKey) || localStorage.getItem(cfg.roleKey) || cfg.defaultRole;
      if (userRole === 'VICE_PRINCIPAL' || userRole === 'VP') savedRole = 'vice-principal';
      else if (userRole === 'ADMIN' || userRole === 'OFFICE' || userRole === 'CLERK' || userRole === 'ACCOUNTS' || userRole === 'EXAM_COORDINATOR') savedRole = 'admin';
      else if (userRole === 'PRINCIPAL') savedRole = 'principal';

      sessionStorage.setItem(cfg.roleKey, savedRole);
      localStorage.setItem(cfg.roleKey, savedRole);

      const roleSelect = document.getElementById('mgmtRoleSelect');
      if (roleSelect) roleSelect.value = savedRole;

      if (window.portalApp && typeof window.portalApp.switchRole === 'function') {
        window.portalApp.switchRole(savedRole);
      }
    } else if (portalType === 'teacher') {
      const teacherName = sessionStorage.getItem('sv_active_teacher_name') || localStorage.getItem('sv_active_teacher_name') || 'Senior Faculty';
      const teacherId = sessionStorage.getItem('sv_active_teacher_id') || localStorage.getItem('sv_active_teacher_id') || 'SV200005';
      sessionStorage.setItem('sv_active_teacher_name', teacherName);
      localStorage.setItem('sv_active_teacher_name', teacherName);
      sessionStorage.setItem('sv_active_teacher_id', teacherId);
      localStorage.setItem('sv_active_teacher_id', teacherId);

      const nameEl = document.getElementById('teacherUserName');
      if (nameEl) nameEl.textContent = \`\${teacherName} (\${teacherId})\`;
    }

    // 5. Restore active view & sub-tab
    this.restoreActiveView(portalType);

    // 6. Background session check with backend if online
    if (window.ApiClient && typeof window.ApiClient.auth?.getMe === 'function' && window.ApiClient.getAccessToken()) {
      window.ApiClient.auth.getMe().catch(() => {});
    }

    // 7. Trigger portal-specific live data reload
    if (portalType === 'management' && window.portalApp && typeof window.portalApp.loadLiveData === 'function') {
      window.portalApp.loadLiveData();
    } else if (portalType === 'teacher' && window.teacherApp && typeof window.teacherApp.loadLiveData === 'function') {
      window.teacherApp.loadLiveData();
    } else if (portalType === 'student' && window.studentApp && typeof window.studentApp.loadLiveData === 'function') {
      window.studentApp.loadLiveData();
    } else if (portalType === 'parent' && typeof window.loadParentLiveData === 'function') {
      window.loadParentLiveData();
    }

    this.bindLogoutButtons(portalType);

    // 8. Start 15-minute inactivity session expiration countdown
    if (this.inactivity) {
      this.inactivity.init(portalType);
    }
  }`;

if (oldInitRegex.test(code)) {
  code = code.replace(oldInitRegex, newInitMethod);
  console.log('✓ Replaced init(portalType)');
} else {
  console.log('(!) Could not match oldInitRegex');
}

// 5. Update logout(portalType)
const oldLogoutRegex = /async logout\(portalType\)\s*\{[\s\S]*?window\.location\.href\s*=\s*['"]\/login['"];\s*\}, 400\);\s*\}/;

const newLogoutMethod = `async logout(portalType) {
    try {
      sessionStorage.removeItem('sv_auth_unified');
      localStorage.removeItem('sv_auth_unified');
      sessionStorage.removeItem('sv_user_role');
      localStorage.removeItem('sv_user_role');
      sessionStorage.removeItem('sv_user_portal');
      localStorage.removeItem('sv_user_portal');
      sessionStorage.removeItem('sv_user_allowed_portals');
      localStorage.removeItem('sv_user_allowed_portals');
      sessionStorage.removeItem('sv_user_profile');
      localStorage.removeItem('sv_user_profile');

      ['management', 'teacher', 'student', 'parent', 'platform-admin'].forEach(p => {
        const c = this.configs[p];
        if (c) {
          sessionStorage.removeItem(c.storageKey);
          localStorage.removeItem(c.storageKey);
          if (c.roleKey) {
            sessionStorage.removeItem(c.roleKey);
            localStorage.removeItem(c.roleKey);
          }
        }
      });

      sessionStorage.removeItem('sv_active_teacher_id');
      localStorage.removeItem('sv_active_teacher_id');
      sessionStorage.removeItem('sv_active_teacher_name');
      localStorage.removeItem('sv_active_teacher_name');
    } catch (e) {}

    if (this.inactivity) {
      this.inactivity.stop();
    }

    if (window.ApiClient) {
      if (typeof window.ApiClient.clearSession === 'function') {
        window.ApiClient.clearSession();
      }
      if (typeof window.ApiClient.auth?.logout === 'function') {
        try { await window.ApiClient.auth.logout(); } catch (e) {}
      }
    }

    this.showToast('Logged out successfully. Redirecting to Unified Sign In...', 'fa-arrow-right-from-bracket');
    setTimeout(() => {
      window.location.href = '/login?msg=logged_out';
    }, 400);
  }`;

if (oldLogoutRegex.test(code)) {
  code = code.replace(oldLogoutRegex, newLogoutMethod);
  console.log('✓ Replaced logout(portalType)');
} else {
  console.log('(!) Could not match oldLogoutRegex');
}

fs.writeFileSync(authJsPath, code, 'utf8');
console.log('✓ portal-auth.js updated and saved successfully.');
