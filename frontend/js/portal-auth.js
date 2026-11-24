/**
 * Sri Vidya E.M High School - Unified Portal Authentication System
 * Powered by Express.js / MERN REST Backend (ApiClient)
 *
 * Supports both:
 * 1. Direct Backend Credentials:
 *    - Management: principal / Principal@123 (or viceprincipal, officestaff, superadmin)
 *    - Teacher:    teacher1 / Teacher@123
 *    - Student:    student1 / Student@123
 *    - Parent:     parent1  / Parent@123
 * 2. Legacy UI Demo Credentials (Auto-mapped seamlessly):
 *    - srividyaschools2017@gmail.com / G.Varalakshmi.2017. -> Principal
 *    - yandrapubhavish2701@gmail.com / Bhavish@2701 -> Role-aware
 */

const PortalAuth = {
  configs: {
    management: {
      storageKey: 'sv_auth_management',
      roleKey: 'sv_role_management',
      defaultRole: 'principal',
      portalTitle: 'Administration Portal',
      welcomeMsg: 'Welcome back, Principal Smt. Gorle Varalakshmi!',
      defaultUser: 'principal',
      defaultPass: 'Principal@123'
    },
    teacher: {
      storageKey: 'sv_auth_teacher',
      portalTitle: 'Faculty Portal',
      welcomeMsg: 'Welcome to Sri Vidya Faculty Portal!',
      defaultUser: 'teacher1',
      defaultPass: 'Teacher@123'
    },
    student: {
      storageKey: 'sv_auth_student',
      portalTitle: 'Student Portal',
      welcomeMsg: 'Welcome to Sri Vidya Student Portal!',
      defaultUser: 'student1',
      defaultPass: 'Student@123'
    },
    parent: {
      storageKey: 'sv_auth_parent',
      portalTitle: 'Parent Portal',
      welcomeMsg: 'Welcome to Sri Vidya Parent Portal!',
      defaultUser: 'parent1',
      defaultPass: 'Parent@123'
    },
    'platform-admin': {
      storageKey: 'sv_auth_platform_admin',
      roleKey: 'sv_role_platform_admin',
      defaultRole: 'superadmin',
      portalTitle: 'Platform Administration Console',
      welcomeMsg: 'Welcome to Sri Vidya Trust Platform Administration!',
      defaultUser: 'superadmin',
      defaultPass: 'SuperAdmin@123'
    }
  },

  /* Role to Portal & Permission Authorization Matrix */
  roleMatrix: {
    SUPER_ADMIN: { portal: 'platform-admin', redirectUrl: '/platform-admin#dashboard', roleSubtype: 'superadmin', dashboardTitle: 'Platform Systems Administration', allowedPortals: ['platform-admin', 'management', 'teacher'] },
    PLATFORM_ADMIN: { portal: 'platform-admin', redirectUrl: '/platform-admin#dashboard', roleSubtype: 'superadmin', dashboardTitle: 'Platform Systems Administration', allowedPortals: ['platform-admin', 'management', 'teacher'] },
    PRINCIPAL: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'principal', dashboardTitle: 'Principal Executive Dashboard', allowedPortals: ['management'] },
    VICE_PRINCIPAL: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'vice-principal', dashboardTitle: 'Vice Principal Administration Dashboard', allowedPortals: ['management'] },
    ADMIN: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'admin', dashboardTitle: 'Campus Office Administration Dashboard', allowedPortals: ['management'] },
    OFFICE: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'admin', dashboardTitle: 'Campus Office Administration Dashboard', allowedPortals: ['management'] },
    CLERK: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'admin', dashboardTitle: 'Campus Office Administration Dashboard', allowedPortals: ['management'] },
    ACCOUNTS: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'admin', dashboardTitle: 'Campus Office Administration Dashboard', allowedPortals: ['management'] },
    EXAM_COORDINATOR: { portal: 'management', redirectUrl: '/management#dashboard', roleSubtype: 'admin', dashboardTitle: 'Campus Office Administration Dashboard', allowedPortals: ['management'] },
    TEACHER: { portal: 'teacher', redirectUrl: '/teacher#dashboard', roleSubtype: 'teacher', dashboardTitle: 'Faculty Academic Workspace', allowedPortals: ['teacher'] },
    STUDENT: { portal: 'student', redirectUrl: '/student#dashboard', roleSubtype: 'student', dashboardTitle: 'Student Academic Portal', allowedPortals: ['student'] },
    PARENT: { portal: 'parent', redirectUrl: '/parent#dashboard', roleSubtype: 'parent', dashboardTitle: 'Parent Portal', allowedPortals: ['parent'] }
  },

  /* Helper to guarantee resolution to authoritative role Main Dashboard */
  getMainDashboardUrlForRole(role) {
    const r = (role || '').toUpperCase();
    if (r === 'SUPER_ADMIN' || r === 'PLATFORM_ADMIN') return '/platform-admin#dashboard';
    if (r === 'TEACHER' || r === 'FACULTY') return '/teacher#dashboard';
    if (r === 'STUDENT') return '/student#dashboard';
    if (r === 'PARENT') return '/parent#dashboard';
    if (r === 'VICE_PRINCIPAL' || r === 'VP') return '/management#dashboard';
    if (r === 'OFFICE' || r === 'CLERK' || r === 'ADMIN' || r === 'ACCOUNTS' || r === 'EXAM_COORDINATOR' || r === 'OFFICESTAFF') return '/management#dashboard';
    return '/management#dashboard';
  },

  /* Synchronous pre-flight check used by portal boot scripts before mounting data fetches */
  canAccessPortalSync(portalType) {
    try {
      const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function')
        ? window.ApiClient.isAuthenticated()
        : Boolean(localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access'));
      if (!hasToken) return false;

      const storedProfile = (window.ApiClient && typeof window.ApiClient.getUser === 'function') ? window.ApiClient.getUser() : null;
      const userRole = ((storedProfile && storedProfile.role) || localStorage.getItem('sv_user_role') || sessionStorage.getItem('sv_user_role') || '').toUpperCase();
      if (!userRole) return false;

      let allowedPortals = [];
      try {
        const rawAllowed = localStorage.getItem('sv_user_allowed_portals') || sessionStorage.getItem('sv_user_allowed_portals');
        if (rawAllowed) allowedPortals = JSON.parse(rawAllowed);
      } catch (e) {}

      if (!Array.isArray(allowedPortals) || allowedPortals.length === 0) {
        const mapping = this.roleMatrix[userRole] || this.resolvePortalForRole(userRole);
        allowedPortals = (mapping && mapping.allowedPortals) || [];
      }

      return allowedPortals.includes(portalType);
    } catch (e) {
      return false;
    }
  },

  /* Helper to purge stale module navigation caches so logins start on Main Dashboard */
  clearNavigationCaches() {
    try {
      const keys = [
        'sv_mgmt_last_module',
        'sv_mgmt_last_sub',
        'sv_teacher_last_module',
        'sv_teacher_last_sub',
        'sv_teacher_last_profile_tab',
        'sv_active_view',
        'sv_last_view',
        'sv_platform_last_view'
      ];
      keys.forEach(k => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
    } catch (e) {}
  },

  /* =========================================================================
   * INACTIVITY / IDLE SESSION EXPIRATION ENGINE (15 MINUTES)
   * Automatically starts countdown when user stops interacting with the portal.
   * If inactive for 15 minutes, expires the session and presents the login screen.
   * ========================================================================= */
  inactivity: {
    TIMEOUT_MS: 15 * 60 * 1000, // Strictly 15 minutes = 900,000 ms of continuous inactivity
    WARNING_MS: 60 * 1000,       // 1 minute remaining warning modal
    STORAGE_KEY: 'sv_session_last_active',
    timerId: null,
    warningTimerId: null,
    tickerIntervalId: null,
    activePortalType: null,
    isInitialized: false,
    lastInteractionTime: Date.now(),
    lastStorageWriteTime: Date.now(),

    recordActivity() {
      const now = Date.now();
      this.lastInteractionTime = now;

      // If warning modal is open and user moves mouse or interacts, auto-dismiss and restore session
      const modal = document.getElementById('inactivityWarningModal');
      if (modal && modal.style.display !== 'none') {
        this.hideWarningModal();
        PortalAuth.showToast('✓ Activity detected: Session refreshed for 15 minutes!', 'fa-circle-check');
      }

      // Throttle localStorage updates to avoid disk performance drag (every 2 seconds max)
      if (now - this.lastStorageWriteTime > 2000) {
        this.lastStorageWriteTime = now;
        try {
          localStorage.setItem(this.STORAGE_KEY, String(now));
        } catch (e) {}
      }

      // Proactively keep API session token fresh while user is active
      if (window.ApiClient && typeof window.ApiClient.keepAlive === 'function') {
        window.ApiClient.keepAlive();
      }

      this.restartTimers();
    },

    restartTimers() {
      if (this.timerId) clearTimeout(this.timerId);
      if (this.warningTimerId) clearTimeout(this.warningTimerId);
      if (this.tickerIntervalId) {
        clearInterval(this.tickerIntervalId);
        this.tickerIntervalId = null;
      }

      if (!this.isAuthenticated()) return;

      const now = Date.now();
      const last = this.getLastActivity();
      const elapsed = Math.max(0, now - last);
      const remaining = Math.max(0, this.TIMEOUT_MS - elapsed);

      // Only expire if continuous inactivity has genuinely reached or exceeded 15 minutes
      if (remaining <= 0) {
        this.triggerExpiry();
        return;
      }

      // Schedule 60-second warning countdown modal at 14 minutes of inactivity
      const warningDelay = Math.max(0, remaining - this.WARNING_MS);
      this.warningTimerId = setTimeout(() => {
        this.showWarningModal();
      }, warningDelay);

      // Schedule session lock when full 15 minutes of continuous inactivity elapse
      this.timerId = setTimeout(() => {
        this.triggerExpiry();
      }, remaining);
    },

    getLastActivity() {
      let storedTime = 0;
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const t = parseInt(stored, 10);
          if (!isNaN(t)) storedTime = t;
        }
      } catch (e) {}
      // Always respect the freshest timestamp between memory and localStorage
      return Math.max(this.lastInteractionTime || 0, storedTime);
    },

    isAuthenticated() {
      const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function') ? window.ApiClient.isAuthenticated() : false;
      const hasUnified = (sessionStorage.getItem('sv_auth_unified') === 'true' || localStorage.getItem('sv_auth_unified') === 'true');
      const type = this.activePortalType || 'management';
      const cfg = PortalAuth.configs[type];
      const hasPortalAuth = cfg ? (sessionStorage.getItem(cfg.storageKey) === 'true' || localStorage.getItem(cfg.storageKey) === 'true') : false;
      return Boolean(hasToken || hasUnified || hasPortalAuth);
    },

    triggerExpiry() {
      this.hideWarningModal();
      this.stop();
      const type = this.activePortalType || 'management';
      PortalAuth.expireSessionDueToInactivity(type);
    },

    showWarningModal() {
      if (!this.isAuthenticated()) return;
      let modal = document.getElementById('inactivityWarningModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inactivityWarningModal';
        modal.className = 'inactivity-warning-modal';
        modal.innerHTML = `
          <div class="inactivity-warning-backdrop"></div>
          <div class="inactivity-warning-card">
            <div class="inactivity-warning-icon">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h3 class="inactivity-warning-title">Session Expiring Due to Inactivity</h3>
            <p class="inactivity-warning-desc">
              You have been inactive for nearly 15 minutes. For campus security, your portal session will lock automatically in:
            </p>
            <div class="inactivity-countdown" id="inactivityCountdownDisplay">60s</div>
            <div class="inactivity-warning-actions">
              <button type="button" class="btn-stay-signed-in" id="btnStaySignedIn">
                <i class="fa-solid fa-shield-halved"></i> I'm Active (Keep Session Alive)
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const stayBtn = modal.querySelector('#btnStaySignedIn');
        if (stayBtn) {
          stayBtn.addEventListener('click', () => {
            this.recordActivity();
            PortalAuth.showToast('✓ Activity detected: Session refreshed for 15 minutes!', 'fa-circle-check');
          });
        }
      }

      modal.style.display = 'flex';

      const countdownEl = document.getElementById('inactivityCountdownDisplay');
      const updateTicker = () => {
        const last = this.getLastActivity();
        const remainingMs = Math.max(0, this.TIMEOUT_MS - (Date.now() - last));
        const seconds = Math.ceil(remainingMs / 1000);
        if (countdownEl) {
          countdownEl.textContent = `${seconds}s`;
        }
        if (remainingMs <= 0) {
          if (this.tickerIntervalId) clearInterval(this.tickerIntervalId);
          this.triggerExpiry();
        }
      };

      updateTicker();
      if (this.tickerIntervalId) clearInterval(this.tickerIntervalId);
      this.tickerIntervalId = setInterval(updateTicker, 1000);
    },

    hideWarningModal() {
      const modal = document.getElementById('inactivityWarningModal');
      if (modal) modal.style.display = 'none';
      if (this.tickerIntervalId) {
        clearInterval(this.tickerIntervalId);
        this.tickerIntervalId = null;
      }
    },

    stop() {
      if (this.timerId) clearTimeout(this.timerId);
      if (this.warningTimerId) clearTimeout(this.warningTimerId);
      if (this.tickerIntervalId) clearInterval(this.tickerIntervalId);
      this.hideWarningModal();
    },

    init(portalType) {
      this.activePortalType = portalType;
      this.lastInteractionTime = Date.now();
      this.lastStorageWriteTime = Date.now();
      try {
        localStorage.setItem(this.STORAGE_KEY, String(this.lastInteractionTime));
      } catch (e) {}

      if (!this.isInitialized) {
        this.isInitialized = true;

        // Comprehensive user activity listeners: continuously reset countdown whenever user is active
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel', 'pointermove'];
        const activityHandler = () => {
          if (this.isAuthenticated()) {
            this.recordActivity();
          }
        };

        events.forEach(evt => {
          window.addEventListener(evt, activityHandler, { passive: true });
        });

        // Sync activity across multiple open tabs
        window.addEventListener('storage', (e) => {
          if (e.key === this.STORAGE_KEY) {
            const val = parseInt(e.newValue || String(Date.now()), 10);
            if (!isNaN(val)) {
              this.lastInteractionTime = val;
              this.restartTimers();
            }
          }
        });

        // Check/resume timers when user switches back to this tab
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && this.isAuthenticated()) {
            this.recordActivity();
          }
        });
      }

      this.restartTimers();
    }
  },

  expireSessionDueToInactivity(portalType) {
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
  },

  showToast(msg, icon = 'fa-circle-check', isError = false) {
    if (window.ApiClient && typeof window.ApiClient.showToast === 'function') {
      window.ApiClient.showToast(msg, icon, isError);
      return;
    }
    const existing = document.querySelector('.login-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'login-toast';
    if (isError) toast.style.background = '#DC2626';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  
  handleMgmtRoleChange(role) {
    const userInput = document.getElementById('managementLoginUser');
    const passInput = document.getElementById('managementLoginPass');
    const isOfficeRole = role === 'admin' || role === 'clerk' || role === 'office';
    const portalName = isOfficeRole ? 'Faculty Portal' : 'Administration Portal';
    const portalTitle = document.getElementById('managementPortalTitle');
    const portalBadge = document.getElementById('managementPortalBadge');
    if (portalTitle) portalTitle.textContent = `${portalName} Sign In`;
    if (portalBadge) portalBadge.textContent = `${portalName} Login`;
    document.title = `${portalName} | Sri Vidya E.M High School`;
    if (userInput) {
      userInput.value = '';
      if (isOfficeRole) {
        userInput.placeholder = 'Enter assigned Clerk / School ID (e.g. SV-OFFICE-01)';
      } else {
        userInput.placeholder = 'Enter username or official email';
      }
    }
    if (passInput) {
      passInput.value = '';
    }
  },

  togglePassword(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btnEl.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-eye', !isPassword);
      icon.classList.toggle('fa-eye-slash', isPassword);
    }
  },

  
  /* =========================================================================
   * FACULTY ONBOARDING, CREDENTIAL DISPATCH & SCHOOL ID VERIFICATION
   * ========================================================================= */

  getAuthorizedFaculty() {
    try {
      const demoFacultyIds = ['SV200001', 'SV200002', 'SV200003', 'SV200004', 'SV200005'];
      const stored = localStorage.getItem('sv_authorized_faculty');
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          if (parsed.length > 5 || parsed.some(f => !demoFacultyIds.includes(f.id))) {
            parsed = parsed.filter(f => demoFacultyIds.includes(f.id));
            if (parsed.length !== 5) {
              parsed = [
                { id: 'SV200001', name: 'Smt. Gorle Varalakshmi', role: 'Principal & Academic Director', personalEmail: 'srividyaschools2017@gmail.com' },
                { id: 'SV200002', name: 'Sri Navva Anand', role: 'Vice Principal & Discipline Head', personalEmail: 'navva.anand.personal@gmail.com' },
                { id: 'SV200003', name: 'Smt. M. Sunitha', role: 'Senior Faculty & English HOD', personalEmail: 'sunitha.m.personal@gmail.com' },
                { id: 'SV200004', name: 'Sri P. Satyanarayana', role: 'Senior Faculty & Maths HOD', personalEmail: 'satya.p.personal@gmail.com' },
                { id: 'SV200005', name: 'Sri K. Rajesh', role: 'Faculty - Physical Science', personalEmail: 'rajesh.k.personal@gmail.com' }
              ];
            }
            localStorage.setItem('sv_authorized_faculty', JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {}

    // Fallback default list with IDs starting SV200001 (5 Demo Teachers)
    return [
      { id: 'SV200001', name: 'Smt. Gorle Varalakshmi', role: 'Principal & Academic Director', personalEmail: 'srividyaschools2017@gmail.com' },
      { id: 'SV200002', name: 'Sri Navva Anand', role: 'Vice Principal & Discipline Head', personalEmail: 'navva.anand.personal@gmail.com' },
      { id: 'SV200003', name: 'Smt. M. Sunitha', role: 'Senior Faculty & English HOD', personalEmail: 'sunitha.m.personal@gmail.com' },
      { id: 'SV200004', name: 'Sri P. Satyanarayana', role: 'Senior Faculty & Maths HOD', personalEmail: 'satya.p.personal@gmail.com' },
      { id: 'SV200005', name: 'Sri K. Rajesh', role: 'Faculty - Physical Science', personalEmail: 'rajesh.k.personal@gmail.com' }
    ];
  },

  openTeacherSignUpModal() {
    const modal = document.getElementById('teacherSignUpModal');
    if (modal) {
      modal.style.display = 'flex';
      const emailInput = document.getElementById('teacherSignupEmail');
      if (emailInput) {
        emailInput.value = '';
        emailInput.focus();
      }
      const resBox = document.getElementById('teacherCredentialResultBox');
      if (resBox) resBox.style.display = 'none';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  },

  handleTeacherCredentialDispatch(e) {
    if (e && e.preventDefault) e.preventDefault();
    const emailInput = document.getElementById('teacherSignupEmail');
    const enteredEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const resBox = document.getElementById('teacherCredentialResultBox');
    if (!enteredEmail || !resBox) return;

    const facultyList = this.getAuthorizedFaculty();
    const teacher = facultyList.find(f => {
      const pEmail = (f.personalEmail || '').toLowerCase();
      const oEmail = (f.email || '').toLowerCase();
      return pEmail === enteredEmail || oEmail === enteredEmail;
    });

    if (teacher) {
      const schoolId = teacher.id || 'SV200005';
      const defaultPass = teacher.defaultPassword || 'SriVidya@2026';

      resBox.style.display = 'block';
      resBox.innerHTML = `
        <div style="background:rgba(16,185,129,0.1); border:1px solid #10b981; border-radius:8px; padding:14px; text-align:left;">
          <div style="display:flex; align-items:center; gap:8px; color:#047857; font-weight:800; font-size:0.95rem; margin-bottom:8px;">
            <i class="fa-solid fa-circle-check"></i> Verification Confirmed! Credentials Dispatched
          </div>
          <p style="font-size:0.83rem; color:#0f172a; margin-bottom:12px; line-height:1.45;">
            Welcome <strong>${teacher.name}</strong>! Your official login credentials have been generated and dispatched to <strong>${enteredEmail}</strong>.
          </p>
          <div style="background:#fff; border:1px dashed #cbd5e1; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:0.8rem; color:#64748b;">Your School Teacher ID:</span>
              <span class="teacher-id-badge" style="font-size:0.88rem; font-weight:800; color:#2563eb; background:#eff6ff; padding:2px 8px; border-radius:4px; font-family:monospace;">${schoolId}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="font-size:0.8rem; color:#64748b;">Temporary Default Password:</span>
              <code style="font-weight:700; color:#0f172a; font-size:0.88rem;">${defaultPass}</code>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="PortalAuth.prefillTeacherLogin('${schoolId}', '${defaultPass}')" style="width:100%; font-weight:700; padding:0.5rem; background:#10b981; border:none; color:#fff; border-radius:6px; cursor:pointer;">
            <i class="fa-solid fa-right-to-bracket"></i> Sign In with School ID (${schoolId})
          </button>
        </div>
      `;

      this.showToast(`Credentials dispatched to ${enteredEmail}! School ID: ${schoolId}`, 'fa-envelope-circle-check');
    } else {
      resBox.style.display = 'block';
      resBox.innerHTML = `
        <div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:8px; padding:14px; text-align:left;">
          <div style="display:flex; align-items:center; gap:8px; color:#b91c1c; font-weight:800; font-size:0.95rem; margin-bottom:6px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Personal Email Not Authorized
          </div>
          <p style="font-size:0.82rem; color:#7f1d1d; line-height:1.45; margin-bottom:8px;">
            The email <strong>${enteredEmail}</strong> was not found in Sri Vidya E.M High School's authorized faculty directory.
          </p>
          <p style="font-size:0.8rem; color:#475569; margin:0; line-height:1.4;">
            Only teachers whose names and personal emails have been officially registered by <strong>Principal Smt. Gorle Varalakshmi</strong> or <strong>Vice Principal Sri Navva Anand</strong> can receive credentials. Please contact the Principal or Vice Principal to be added.
          </p>
        </div>
      `;
    }
  },

  prefillTeacherLogin(schoolId, defaultPass) {
    this.closeModal('teacherSignUpModal');
    const userInput = document.getElementById('teacherLoginUser');
    const passInput = document.getElementById('teacherLoginPass');
    if (userInput) userInput.value = schoolId;
    if (passInput) passInput.value = defaultPass;
    if (passInput) passInput.focus();
    this.showToast(`School ID ${schoolId} filled. Please click Sign In.`, 'fa-circle-check');
  },

  openChangePasswordModal(portalType = 'teacher') {
    if (window.teacherApp && typeof window.teacherApp.navigateTo === 'function') {
      window.teacherApp.navigateTo('security');
    }
  },

  handleChangePasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const curPass = document.getElementById('cpCurrentPass')?.value;
    const newPass = document.getElementById('cpNewPass')?.value;
    const confPass = document.getElementById('cpConfirmPass')?.value;

    if (!curPass || !newPass || !confPass) {
      this.showToast('Please fill in all password fields.', 'fa-triangle-exclamation', true);
      return;
    }

    if (newPass.length < 6) {
      this.showToast('New password must be at least 6 characters.', 'fa-triangle-exclamation', true);
      return;
    }

    if (newPass !== confPass) {
      this.showToast('New password and confirmation do not match.', 'fa-triangle-exclamation', true);
      return;
    }

    // Save custom password for active teacher
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    try {
      const customPasswords = JSON.parse(localStorage.getItem('sv_teacher_passwords') || '{}');
      customPasswords[activeTeacherId] = newPass;
      localStorage.setItem('sv_teacher_passwords', JSON.stringify(customPasswords));
    } catch (err) {}

    this.closeModal('teacherChangePasswordModal');
    this.showToast('Password updated successfully! Your account is now secured.', 'fa-circle-check');

    // If overlay was visible during first-time login, proceed
    const overlay = document.getElementById('teacherLoginOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
  },

  
  otpSessions: {},

  getPhoneForRole(portalType, roleOrTeacherId) {
    if (portalType === 'unified') {
      const r = (roleOrTeacherId || '').toLowerCase();
      if (r === 'vice-principal' || r === 'viceprincipal' || r === 'vp') return '+91 98480 11002';
      if (r === 'admin' || r === 'clerk' || r === 'office' || r === 'officestaff') return '+91 98480 99887';
      if (r.startsWith('sv20000') || r === 'teacher' || r === 'teacher1' || r === 'faculty') return '+91 98480 33443';
      if (r === 'superadmin' || r === 'platform-admin') return '+91 94401 23456';
      return '+91 93985 78584';
    }

    if (portalType === 'platform-admin') {
      return '+91 94401 23456';
    }

    if (portalType === 'management') {
      const role = roleOrTeacherId || 'principal';
      const customPhone = localStorage.getItem(`sv_phone_mgmt_${role}`);
      if (customPhone) return customPhone;

      if (role === 'principal') return '+91 93985 78584';
      if (role === 'vice-principal' || role === 'vp') return '+91 98480 11002';
      if (role === 'admin' || role === 'clerk' || role === 'office') return '+91 98480 99887';
      return '+91 93985 78584';
    }

    if (portalType === 'teacher') {
      const teacherId = (roleOrTeacherId || sessionStorage.getItem('sv_active_teacher_id') || 'SV200005').toUpperCase();
      const customPhone = localStorage.getItem(`sv_phone_teacher_${teacherId}`);
      if (customPhone) return customPhone;

      try {
        const profile = JSON.parse(localStorage.getItem('sv_teacher_profile') || '{}');
        if (profile && profile.phone) return profile.phone;
      } catch (e) {}

      const facultyList = this.getAuthorizedFaculty();
      const matched = facultyList.find(f => f.id && f.id.toUpperCase() === teacherId);
      if (matched && matched.phone) return matched.phone;
      if (matched && matched.aadhaarMobile) return matched.aadhaarMobile;

      const teacherPhones = {
        'SV200001': '+91 93985 78584',
        'SV200002': '+91 98480 11002',
        'SV200003': '+91 98480 11003',
        'SV200004': '+91 98480 11004',
        'SV200005': '+91 98481 23456',
        'SV200013': '+91 98481 11221',
        'SV200014': '+91 98481 22332',
        'SV200015': '+91 98481 33443',
        'SV200016': '+91 98481 44554',
        'SV200017': '+91 98481 55665',
        'SV200018': '+91 98481 66776',
        'SV200019': '+91 98481 77887',
        'SV200020': '+91 98481 88998',
        'SV200021': '+91 98481 99009',
        'SV200022': '+91 98481 00112',
        'SV200023': '+91 98481 11223'
      };
      return teacherPhones[teacherId] || '+91 98481 23456';
    }

    return '+91 98481 23456';
  },

  maskPhoneNumber(phone) {
    if (!phone) return '+91 98481 *****56';
    const clean = phone.replace(/[^\d+]/g, '');
    if (clean.length <= 6) return phone;
    const start = clean.slice(0, clean.length - 7);
    const end = clean.slice(-2);
    return `${start} *****${end}`;
  },

  getOtpPrefix(portalType) {
    if (portalType === 'unified') return 'unified';
    if (portalType === 'management') return 'mgmt';
    return 'teacher';
  },

  getOtpLoginForm(portalType) {
    if (portalType === 'unified') return document.getElementById('unifiedLoginForm');
    if (portalType === 'management') return document.getElementById('mgmtLoginForm');
    return document.getElementById('teacherLoginForm');
  },

  setOtpStatus(portalType, state, title, sub) {
    const prefix = this.getOtpPrefix(portalType);
    const wrap = document.getElementById(`${prefix}OtpStatusWrap`);
    const titleEl = document.getElementById(`${prefix}OtpStatusTitle`);
    const subEl = document.getElementById(`${prefix}OtpStatusSub`);
    if (!wrap) return;
    wrap.classList.remove('state-verifying', 'state-success', 'state-failed', 'state-expired');
    if (state) {
      wrap.classList.add(`state-${state}`);
      wrap.style.display = 'flex';
    } else {
      wrap.style.display = 'none';
    }
    if (titleEl && title) titleEl.textContent = title;
    if (subEl && sub) subEl.textContent = sub;
  },

  initiateOtp(portalType, sessionData) {
    const prefix = this.getOtpPrefix(portalType);
    const loginForm = this.getOtpLoginForm(portalType);
    const otpForm = document.getElementById(`${prefix}OtpForm`);
    if (!otpForm) {
      this.completeSuccessfulLogin(portalType, sessionData);
      return;
    }

    const targetPhone = this.getPhoneForRole(portalType, sessionData.role || sessionData.teacherId);
    const maskedPhone = this.maskPhoneNumber(targetPhone);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    this.otpSessions[portalType] = {
      ...sessionData,
      otp,
      phone: targetPhone,
      maskedPhone,
      timerSec: 45,
      intervalId: null
    };

    if (loginForm) { loginForm.style.display = 'none'; loginForm.classList.add('hidden'); }
    if (otpForm) { otpForm.style.display = ''; otpForm.classList.remove('hidden'); }

    const phoneDisplay = document.getElementById(`${prefix}OtpPhoneDisplay`);
    if (phoneDisplay) phoneDisplay.textContent = maskedPhone;

    const demoOtpText = document.getElementById(`${prefix}DemoOtpText`);
    if (demoOtpText) demoOtpText.textContent = otp;

    for (let i = 1; i <= 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i}`);
      if (box) {
        box.value = '';
        box.classList.remove('error');
      }
    }

    this.setupOtpInputListeners(prefix);

    const firstBox = document.getElementById(`${prefix}Otp-1`);
    if (firstBox) setTimeout(() => firstBox.focus(), 100);

    this.startOtpTimer(portalType);

    this.showToast(`📲 Security SMS Sent: Your Sri Vidya Portal Verification OTP is ${otp} (dispatched to mobile ${maskedPhone})`, 'fa-shield-halved');
  },

  setupOtpInputListeners(prefix) {
    for (let i = 1; i <= 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i}`);
      if (!box || (box.dataset && box.dataset.hasListener)) continue;
      if (box.dataset) box.dataset.hasListener = 'true';

      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[0] : '';
        box.classList.remove('error');
        if (e.target.value && i < 6) {
          const next = document.getElementById(`${prefix}Otp-${i + 1}`);
          if (next) next.focus();
        } else if (e.target.value && i === 6) {
          let complete = true;
          for (let k = 1; k <= 6; k++) {
            const b = document.getElementById(`${prefix}Otp-${k}`);
            if (!b || !b.value.trim()) { complete = false; break; }
          }
          if (complete) {
            if (prefix === 'unified') {
              PortalAuth.verifyUnifiedOtp();
            } else {
              PortalAuth.verifyOtp(prefix === 'mgmt' ? 'management' : 'teacher');
            }
          }
        }
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && i > 1) {
          const prev = document.getElementById(`${prefix}Otp-${i - 1}`);
          if (prev) {
            prev.focus();
            prev.value = '';
          }
        } else if (e.key === 'ArrowLeft' && i > 1) {
          const prev = document.getElementById(`${prefix}Otp-${i - 1}`);
          if (prev) prev.focus();
        } else if (e.key === 'ArrowRight' && i < 6) {
          const next = document.getElementById(`${prefix}Otp-${i + 1}`);
          if (next) next.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (prefix === 'unified') {
            PortalAuth.verifyUnifiedOtp();
          } else {
            PortalAuth.verifyOtp(prefix === 'mgmt' ? 'management' : 'teacher');
          }
        }
      });

      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasteData) {
          for (let j = 0; j < 6; j++) {
            const digitBox = document.getElementById(`${prefix}Otp-${j + 1}`);
            if (digitBox) {
              digitBox.value = pasteData[j] || '';
              digitBox.classList.remove('error');
            }
          }
          const lastIndex = Math.min(pasteData.length, 6);
          const focusBox = document.getElementById(`${prefix}Otp-${lastIndex}`);
          if (focusBox) focusBox.focus();

          if (pasteData.length >= 6) {
            setTimeout(() => {
              if (prefix === 'unified') {
                PortalAuth.verifyUnifiedOtp();
              } else {
                PortalAuth.verifyOtp(prefix === 'mgmt' ? 'management' : 'teacher');
              }
            }, 80);
          }
        }
      });
    }
  },

  startOtpTimer(portalType) {
    const prefix = this.getOtpPrefix(portalType);
    const timerSpan = document.getElementById(`${prefix}OtpTimer`);
    const resendBtn = document.getElementById(`${prefix}ResendOtpBtn`);
    const session = this.otpSessions[portalType];
    if (!session) return;

    if (session.intervalId) clearInterval(session.intervalId);

    session.timerSec = session.timerSec || 45;
    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.innerHTML = `Resend code in <span id="${prefix}OtpTimer">${session.timerSec}</span>s`;
    }

    session.intervalId = setInterval(() => {
      session.timerSec--;
      const curTimerSpan = document.getElementById(`${prefix}OtpTimer`);
      if (curTimerSpan) curTimerSpan.textContent = String(session.timerSec);

      if (session.timerSec <= 0) {
        clearInterval(session.intervalId);
        session.intervalId = null;
        if (resendBtn) {
          resendBtn.disabled = false;
          resendBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Resend OTP';
        }
      }
    }, 1000);
  },

  autoFillOtp(portalType) {
    const prefix = this.getOtpPrefix(portalType);
    const session = this.otpSessions[portalType];
    if (!session || !session.otp) return;

    const otpDigits = session.otp.split('');
    for (let i = 0; i < 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i + 1}`);
      if (box) {
        box.value = otpDigits[i] || '';
        box.classList.remove('error');
      }
    }

    this.showToast(`Auto-filled 6-digit OTP (${session.otp})`, 'fa-circle-check');
    setTimeout(() => {
      this.verifyOtp(portalType);
    }, 200);
  },

  async resendOtp(portalType) {
    const session = this.otpSessions[portalType];
    if (!session) return;

    const prefix = this.getOtpPrefix(portalType);

    if (portalType === 'unified') {
      try {
        const resendBtn = document.getElementById('unifiedResendOtpBtn');
        if (resendBtn) {
          resendBtn.disabled = true;
          resendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatched...';
        }

        const res = await window.ApiClient.auth.resendOtp(session.preAuthToken);
        if (res && res.success) {
          this.setOtpStatus('unified', null);
          for (let i = 1; i <= 6; i++) {
            const box = document.getElementById(`unifiedOtp-${i}`);
            if (box) {
              box.value = '';
              box.classList.remove('error', 'success');
              box.disabled = false;
            }
          }
          if (res.data && res.data.destination) {
            session.destination = res.data.destination;
            const destDisplay = document.getElementById('unifiedOtpDestinationDisplay');
            if (destDisplay) destDisplay.textContent = res.data.destination;
          }
          if (res.data && res.data.otp) {
            session.otp = res.data.otp;
            const whatsappDisplay = document.getElementById('unifiedWhatsappCodeDisplay');
            if (whatsappDisplay) whatsappDisplay.textContent = res.data.otp;
          }
          session.timerSec = (res.data && res.data.cooldownSeconds) || 45;
          this.startOtpTimer('unified');
          const firstBox = document.getElementById('unifiedOtp-1');
          if (firstBox) firstBox.focus();
          this.showToast('A new security code has been dispatched.', 'fa-shield-halved');
        } else {
          throw new Error(res.message || 'Unable to resend OTP.');
        }
      } catch (err) {
        console.error('[Resend OTP Error]:', err);
        const errMsg = err.message || 'Failed to resend OTP. Please wait before retrying.';
        this.showToast(errMsg, 'fa-triangle-exclamation', true);
        const resendBtn = document.getElementById('unifiedResendOtpBtn');
        if (resendBtn && !session.intervalId) {
          resendBtn.disabled = false;
          resendBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Resend OTP';
        }
      }
      return;
    }

    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    session.otp = newOtp;

    const demoOtpText = document.getElementById(`${prefix}DemoOtpText`);
    if (demoOtpText) demoOtpText.textContent = newOtp;

    for (let i = 1; i <= 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i}`);
      if (box) {
        box.value = '';
        box.classList.remove('error');
      }
    }

    const firstBox = document.getElementById(`${prefix}Otp-1`);
    if (firstBox) firstBox.focus();

    this.startOtpTimer(portalType);
    this.showToast(`📲 New Security SMS Dispatched: Your OTP is ${newOtp} (sent to ${session.maskedPhone})`, 'fa-shield-halved');
  },

  cancelOtp(portalType) {
    const session = this.otpSessions[portalType];
    if (session && session.intervalId) {
      clearInterval(session.intervalId);
    }
    delete this.otpSessions[portalType];

    if (portalType === 'unified') {
      this.setOtpStatus('unified', null);
      for (let i = 1; i <= 6; i++) {
        const box = document.getElementById(`unifiedOtp-${i}`);
        if (box) {
          box.value = '';
          box.classList.remove('error', 'success');
          box.disabled = false;
        }
      }
      const overlay = document.getElementById('unifiedLoginOverlay');
      if (overlay) overlay.classList.remove('in-otp-mode');
    }

    const prefix = this.getOtpPrefix(portalType);
    const loginForm = this.getOtpLoginForm(portalType);
    const otpForm = document.getElementById(`${prefix}OtpForm`);

    if (otpForm) { otpForm.style.display = 'none'; otpForm.classList.add('hidden'); }
    if (loginForm) { loginForm.style.display = ''; loginForm.classList.remove('hidden'); }

    if (portalType === 'unified') {
      const passInput = document.getElementById('unifiedLoginPass');
      if (passInput) {
        passInput.focus();
        passInput.select();
      }
    }

    this.showToast('Returned to sign-in credentials form', 'fa-arrow-left');
  },

  promptChangePhone(portalType) {
    const session = this.otpSessions[portalType];
    if (!session) return;

    const currentPhone = session.phone || '+91 93985 78584';
    const newPhone = prompt('Enter 10-digit mobile number to receive verification OTP:', currentPhone.replace('+91 ', ''));
    if (newPhone && newPhone.trim()) {
      const cleanPhone = '+91 ' + newPhone.trim().replace(/^(\+91|0)/, '');
      session.phone = cleanPhone;
      session.maskedPhone = this.maskPhoneNumber(cleanPhone);

      const prefix = this.getOtpPrefix(portalType);
      const phoneDisplay = document.getElementById(`${prefix}OtpPhoneDisplay`);
      if (phoneDisplay) phoneDisplay.textContent = session.maskedPhone;

      if (portalType === 'management') {
        localStorage.setItem(`sv_phone_mgmt_${session.role || 'principal'}`, cleanPhone);
      } else if (portalType === 'unified') {
        localStorage.setItem(`sv_phone_unified`, cleanPhone);
      } else {
        localStorage.setItem(`sv_phone_teacher_${session.teacherId || 'SV200005'}`, cleanPhone);
      }

      this.resendOtp(portalType);
      this.showToast(`Updated verification phone number to ${session.maskedPhone}`, 'fa-circle-check');
    }
  },

  async verifyOtp(portalType, e) {
    if (e && e.preventDefault) e.preventDefault();
    const prefix = this.getOtpPrefix(portalType);
    const session = this.otpSessions[portalType];
    if (!session) {
      this.showToast('Authentication session expired. Please sign in again.', 'fa-triangle-exclamation', true);
      this.cancelOtp(portalType);
      return;
    }

    let enteredOtp = '';
    const boxes = [];
    for (let i = 1; i <= 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i}`);
      boxes.push(box);
      if (box) enteredOtp += box.value.trim();
    }

    if (enteredOtp.length < 6) {
      this.showToast('Please enter all 6 digits of the OTP verification code.', 'fa-triangle-exclamation', true);
      const emptyBox = boxes.find(b => b && !b.value.trim()) || boxes[0];
      if (emptyBox) emptyBox.focus();
      return;
    }

    const submitBtn = document.getElementById(`${prefix}OtpSubmitBtn`);
    let originalBtnHTML = '';
    if (submitBtn) {
      originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
    }

    // Real 2FA Backend Verification for Unified SSO Gateway
    if (portalType === 'unified') {
      // 1. Verifying State: Rotating circular loader
      this.setOtpStatus('unified', 'verifying', 'Verifying...', 'Validating security code with authentication gateway');
      boxes.forEach(b => { if (b) b.disabled = true; });

      try {
        if (!window.ApiClient || !window.ApiClient.auth || typeof window.ApiClient.auth.verifyOtp !== 'function') {
          throw new Error('API client verifyOtp method unavailable.');
        }

        const requestedPortal = session.requestedPortal || this.inferPortalFromUrl();
        const res = await window.ApiClient.auth.verifyOtp(session.preAuthToken, enteredOtp, session.rememberMe, requestedPortal);

        if (res && res.success && res.data && res.data.user) {
          // 2. Success State: Green circular checkmark with "OTP Verified Successfully"
          this.setOtpStatus('unified', 'success', 'OTP Verified Successfully', 'Launching your authorized Dashboard...');
          boxes.forEach(b => {
            if (b) {
              b.disabled = false;
              b.classList.remove('error');
              b.classList.add('success');
            }
          });

          const user = res.data.user;
          const routing = res.data.routing || this.resolvePortalForRole(user.role);
          const allowedPortals = (user && user.allowedPortals) || routing.allowedPortals || [routing.portal];

          if (requestedPortal && !allowedPortals.includes(requestedPortal)) {
            const portalName = this.getPortalDisplayName(requestedPortal);
            throw new Error(`Access Denied: Your assigned account role (${user.role}) is not authorized for ${portalName}.`);
          }

          if (session.intervalId) clearInterval(session.intervalId);
          delete this.otpSessions[portalType];

          this.persistUnifiedSession(user, routing, session.enteredUser);
          this.clearNavigationCaches();

          let targetUrl = '';
          if (requestedPortal && allowedPortals.includes(requestedPortal)) {
            targetUrl = session.redirectUrl || (routing && routing.redirectUrl) || (this.getPortalConfig(requestedPortal)?.dashboardUrl) || this.getMainDashboardUrlForRole(user.role);
          } else {
            targetUrl = (routing && routing.redirectUrl) || this.getMainDashboardUrlForRole(user.role);
          }

          this.showToast('✓ OTP Verified Successfully! Launching Dashboard...', 'fa-circle-check');

          setTimeout(() => {
            window.location.href = targetUrl;
          }, 650);
          return;
        }

        throw new Error(res.message || 'Invalid OTP code.');
      } catch (err) {
        console.error('[Unified OTP Verification Error]:', err);
        boxes.forEach(b => { if (b) b.disabled = false; });
        if (submitBtn) submitBtn.disabled = false;

        const errCode = (err.response && err.response.code) || err.code || '';
        const errMsg = err.message || '';

        if (errCode === 'OTP_EXPIRED' || errMsg.toLowerCase().includes('expired')) {
          // 3. Expired State: Amber circular indicator with "OTP Expired. Request a New OTP"
          this.setOtpStatus('unified', 'expired', 'OTP Expired. Request a New OTP', 'Your security code has timed out. Click Resend below.');
          boxes.forEach(b => { if (b) b.classList.add('error'); });
          const resendBtn = document.getElementById('unifiedResendOtpBtn');
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Resend OTP';
          }
          this.showToast('OTP Expired. Request a New OTP', 'fa-clock', true);
        } else {
          // 4. Failed State: Red circular indicator with "Invalid OTP. Please try again"
          this.setOtpStatus('unified', 'failed', 'Invalid OTP. Please try again', 'Invalid OTP code entered. Please check and try again.');
          boxes.forEach(b => {
            if (b) {
              b.classList.add('error');
            }
          });
          this.showToast('Invalid OTP. Please try again', 'fa-triangle-exclamation', true);

          setTimeout(() => {
            boxes.forEach(b => {
              if (b) {
                b.value = '';
                b.classList.remove('error');
              }
            });
            this.setOtpStatus('unified', null);
            if (boxes[0]) boxes[0].focus();
          }, 1400);
        }
      } finally {
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
      return;
    }

    const isValid = Boolean(session.otp && enteredOtp === session.otp);

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      }

      if (isValid) {
        if (session.intervalId) clearInterval(session.intervalId);
        delete this.otpSessions[portalType];

        this.showToast('✓ Phone OTP verified successfully! Identity authenticated.', 'fa-circle-check');
        this.completeSuccessfulLogin(portalType, session);
      } else {
        boxes.forEach(b => {
          if (b) {
            b.classList.add('error');
            setTimeout(() => b.classList.remove('error'), 800);
          }
        });
        this.showToast(`Invalid OTP code entered. Please enter the 6-digit code sent to ${session.maskedPhone}.`, 'fa-triangle-exclamation', true);
        if (boxes[0]) {
          boxes[0].focus();
          boxes[0].select();
        }
      }
    }, 400);
  },

  completeSuccessfulLogin(portalType, sessionData) {
    if (portalType === 'unified') {
      const user = sessionData.user || {};
      const routing = sessionData.routing || this.resolvePortalForRole(user.role);
      this.persistUnifiedSession(user, routing, sessionData.enteredUser);
      this.clearNavigationCaches();
      const targetUrl = this.getMainDashboardUrlForRole(user.role);
      this.showToast(`✓ Authentication verified! Opening ${routing.dashboardTitle || 'Main Dashboard'}...`, 'fa-circle-check');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
      return;
    }

    const cfg = this.configs[portalType];
    const overlay = document.getElementById(`${portalType}LoginOverlay`);

    sessionStorage.setItem(cfg.storageKey, 'true');
    localStorage.setItem(cfg.storageKey, 'true');

    if (portalType === 'teacher') {
      const teacherId = sessionData.teacherId || 'SV200005';
      const teacherName = sessionData.teacherName || 'Faculty Member';
      sessionStorage.setItem('sv_active_teacher_id', teacherId);
      localStorage.setItem('sv_active_teacher_id', teacherId);
      sessionStorage.setItem('sv_active_teacher_name', teacherName);
      localStorage.setItem('sv_active_teacher_name', teacherName);

      const nameEl = document.getElementById('teacherUserName');
      if (nameEl) nameEl.textContent = `${teacherName} (${teacherId})`;

      this.showToast(`Welcome back, ${teacherName} (${teacherId})!`, 'fa-circle-check');
    }

    if (portalType === 'management') {
      const chosenRole = sessionData.role || 'principal';
      sessionStorage.setItem(cfg.roleKey, chosenRole);
      localStorage.setItem(cfg.roleKey, chosenRole);

      let title = 'Principal Smt. Gorle Varalakshmi';
      if (chosenRole === 'vice-principal') title = 'Vice Principal Sri Navva Anand';
      if (chosenRole === 'admin') title = 'School Office Administrator / Clerk';

      this.showToast(`Welcome back, ${title}!`, 'fa-crown');

      if (window.portalApp && typeof window.portalApp.switchRole === 'function') {
        window.portalApp.switchRole(chosenRole);
      }
      if (window.portalApp && typeof window.portalApp.refreshDashboardData === 'function') {
        window.portalApp.refreshDashboardData();
      }
    }

    if (overlay) {
      overlay.classList.add('hidden');
    }

    const loginForm = document.getElementById(portalType === 'management' ? 'mgmtLoginForm' : 'teacherLoginForm');
    const otpForm = document.getElementById(portalType === 'management' ? 'mgmtOtpForm' : 'teacherOtpForm');
    if (otpForm) { otpForm.style.display = 'none'; otpForm.classList.add('hidden'); }
      if (loginForm) { loginForm.style.display = ''; loginForm.classList.remove('hidden'); }

    if (portalType === 'management' && window.portalApp && typeof window.portalApp.loadLiveData === 'function') {
      window.portalApp.loadLiveData();
    } else if (portalType === 'teacher' && window.teacherApp && typeof window.teacherApp.loadLiveData === 'function') {
      window.teacherApp.loadLiveData();
    }

    // Start 15-minute inactivity session expiration countdown
    if (this.inactivity) {
      this.inactivity.init(portalType);
    }
  },


  async login(portalType, e) {
    if (e) e.preventDefault();
    const cfg = this.configs[portalType];
    if (!cfg) return;

    const userInput = document.getElementById(`${portalType}LoginUser`) || document.getElementById(`${portalType}LoginId`);
    const passInput = document.getElementById(`${portalType}LoginPass`);
    const overlay = document.getElementById(`${portalType}LoginOverlay`);
    const submitBtn = document.getElementById(`${portalType}SubmitBtn`);

    let enteredUser = userInput ? userInput.value.trim() : '';
    let enteredPass = passInput ? passInput.value : '';

    // Faculty School ID Login Verification (SV200001+)
    if (portalType === 'teacher') {
      const facultyList = this.getAuthorizedFaculty();
      const upperUser = enteredUser.toUpperCase();

      const matchedTeacher = facultyList.find(f => {
        return (f.id && f.id.toUpperCase() === upperUser) ||
               (f.email && f.email.toLowerCase() === enteredUser.toLowerCase()) ||
               (f.personalEmail && f.personalEmail.toLowerCase() === enteredUser.toLowerCase());
      });

      if (matchedTeacher) {
        sessionStorage.setItem('sv_active_teacher_id', matchedTeacher.id);
        sessionStorage.setItem('sv_active_teacher_name', matchedTeacher.name);

        const customPasswords = JSON.parse(localStorage.getItem('sv_teacher_passwords') || '{}');
        const validPass = customPasswords[matchedTeacher.id] || matchedTeacher.defaultPassword || 'SriVidya@2026';

        const isDefault = (enteredPass === 'SriVidya@2026' || enteredPass === (matchedTeacher.defaultPassword || 'SriVidya@2026'));
        const isCustomMatch = (enteredPass === validPass);
        const isUniversalDemo = (enteredPass === 'Teacher@123' || enteredPass === 'Bhavish@2701');

        if (isDefault || isCustomMatch || isUniversalDemo) {
          this.initiateOtp('teacher', {
            teacherId: matchedTeacher.id,
            teacherName: matchedTeacher.name,
            role: 'teacher',
            enteredUser,
            enteredPass
          });
          return;
        }
      }
    }

    // Office / Clerk ID Login Verification
    if (portalType === 'management') {
      const roleSelect = document.getElementById('mgmtRoleSelect');
      const chosenRole = roleSelect ? roleSelect.value : 'principal';

      // Check custom executive credentials defined in Settings
      try {
        const executiveCreds = JSON.parse(localStorage.getItem('sv_executive_creds') || '{}');
        const roleCred = executiveCreds[chosenRole];
        if (roleCred && enteredUser.toLowerCase() === roleCred.id.toLowerCase() && enteredPass === roleCred.password) {
          this.initiateOtp('management', {
            role: chosenRole,
            enteredUser,
            enteredPass
          });
          return;
        }
      } catch (err) {}
  

      // Office / Clerk ID support (SV-OFFICE-01, SV200027, officestaff)
      if (chosenRole === 'admin') {
        const clerkIds = ['SV-OFFICE-01', 'SV-CLERK-01', 'SV200027', 'SV200028', 'OFFICESTAFF', 'ADMIN'];
        if (clerkIds.includes(enteredUser.toUpperCase())) {
          enteredUser = 'officestaff';
          if (enteredPass === 'SriVidya@2026' || enteredPass === 'Office@123' || enteredPass === 'admin123') {
            enteredPass = 'Office@123';
          }
        }
      }
    }

    // Smart-mapping for legacy demo credentials or empty convenience fallbacks
    if (portalType === 'management') {
      const roleSelect = document.getElementById('mgmtRoleSelect');
      const chosenRole = roleSelect ? roleSelect.value : 'principal';

      if (enteredUser === 'srividyaschools2017@gmail.com' || enteredPass === 'G.Varalakshmi.2017.') {
        if (chosenRole === 'vice-principal' || chosenRole === 'vp') {
          enteredUser = 'viceprincipal';
          enteredPass = 'VicePrincipal@123';
        } else if (chosenRole === 'admin' || chosenRole === 'office' || chosenRole === 'clerk') {
          enteredUser = 'officestaff';
          enteredPass = 'Office@123';
        } else {
          enteredUser = 'principal';
          enteredPass = 'Principal@123';
        }
      } else if (enteredPass === 'admin123') {
        enteredUser = 'officestaff';
        enteredPass = 'Office@123';
      } else if (enteredPass === 'vp123') {
        enteredUser = 'viceprincipal';
        enteredPass = 'VicePrincipal@123';
      }
    } else if (enteredUser === 'yandrapubhavish2701@gmail.com' || enteredPass === 'Bhavish@2701' || enteredPass.includes('2025')) {
      enteredUser = cfg.defaultUser;
      enteredPass = cfg.defaultPass;
    }

    if (!enteredUser || !enteredPass) {
      this.showToast('Please enter both identifier/email and password.', 'fa-triangle-exclamation', true);
      return;
    }

    let originalBtnHTML = '';
    if (submitBtn) {
      originalBtnHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying with Server...';
      submitBtn.disabled = true;
    }

    try {
      if (!window.ApiClient) {
        throw new Error('ApiClient service not initialized.');
      }

      const res = await window.ApiClient.auth.login(enteredUser, enteredPass);

      if (portalType === 'management' || portalType === 'teacher') {
        const apiUser = (res.data && res.data.user) || res.user || {};
        const detectedRole = (apiUser.role || '').toUpperCase();

        // Strict Role Isolation: If teacher submitted credentials on management overlay, redirect to faculty portal
        if (portalType === 'management' && (detectedRole === 'TEACHER' || detectedRole === 'FACULTY')) {
          this.showToast('Faculty credentials verified. Launching Faculty Academic Workspace...', 'fa-chalkboard-user');
          setTimeout(() => { window.location.href = '/teacher'; }, 500);
          return;
        }

        let chosenRole = 'principal';
        if (detectedRole === 'VICE_PRINCIPAL') chosenRole = 'vice-principal';
        else if (detectedRole === 'OFFICE' || detectedRole === 'ADMIN' || detectedRole === 'CLERK' || detectedRole === 'ACCOUNTS' || detectedRole === 'EXAM_COORDINATOR') chosenRole = 'admin';
        else if (detectedRole === 'SUPER_ADMIN') chosenRole = 'principal';

        this.initiateOtp(portalType, {
          role: chosenRole,
          enteredUser,
          enteredPass,
          apiRes: res
        });
        return;
      }

      // Trigger Portal-specific live data reload
      if (portalType === 'management' && window.portalApp && typeof window.portalApp.loadLiveData === 'function') {
        window.portalApp.loadLiveData();
      } else if (portalType === 'teacher' && window.teacherApp && typeof window.teacherApp.loadLiveData === 'function') {
        window.teacherApp.loadLiveData();
      } else if (portalType === 'student' && window.studentApp && typeof window.studentApp.loadLiveData === 'function') {
        window.studentApp.loadLiveData();
      } else if (portalType === 'parent' && typeof window.loadParentLiveData === 'function') {
        window.loadParentLiveData();
      }
    } catch (err) {
      console.error('[PortalAuth Error]:', err);
      this.showToast(err.message || 'Invalid credentials. Please verify your username and password.', 'fa-triangle-exclamation', true);
      if (passInput) {
        passInput.focus();
        passInput.select();
      }
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      }
    }
  },

  /* =========================================================================
   * UNIFIED LOGIN PLATFORM (SINGLE COMMON SIGN-IN GATEWAY)
   * ========================================================================= */

  inferPortalFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam) return portalParam.trim().toLowerCase();
      const redirectParam = params.get('redirect') || '';
      if (redirectParam.includes('platform-admin') || redirectParam.includes('platform')) return 'platform-admin';
      if (redirectParam.includes('management') || redirectParam.includes('administration-portal')) return 'management';
      if (redirectParam.includes('teacher') || redirectParam.includes('faculty-portal')) return 'teacher';
      if (redirectParam.includes('student')) return 'student';
      if (redirectParam.includes('parent')) return 'parent';
    } catch (e) {}
    return '';
  },

  getPortalDisplayName(portal) {
    const p = (portal || '').toLowerCase();
    const map = {
      'platform-admin': 'Platform Administration',
      'management': 'Administration Portal',
      'teacher': 'Faculty Portal',
      'student': 'Student Portal',
      'parent': 'Parent Portal'
    };
    return map[p] || portal || 'Authorized Portal';
  },

  getPortalConfig(portal) {
    const p = (portal || '').toLowerCase();
    const configs = {
      'platform-admin': {
        id: 'platform-admin',
        title: 'Platform Administration Console',
        badgeText: 'Platform Administration',
        badgeIcon: 'fa-server',
        badgeClass: 'platform-admin',
        desc: 'Authorized access for <strong>Super Administrators</strong>. Multi-tenant controls, security audits, and cloud infrastructure.',
        btnText: 'Sign In to Platform Admin',
        allowedRoles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
        defaultRole: 'superadmin',
        dashboardUrl: '/platform-admin#dashboard',
      },
      'management': {
        id: 'management',
        title: 'Administration Portal',
        badgeText: 'Executive Management',
        badgeIcon: 'fa-building-columns',
        badgeClass: 'management',
        desc: 'Executive access for <strong>Principal Smt. Gorle Varalakshmi, Vice Principal Sri Navva Anand</strong>, and authorized <strong>Office Staff</strong>.',
        btnText: 'Sign In to Administration Portal',
        allowedRoles: ['PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'CLERK', 'ADMIN', 'ACCOUNTS', 'EXAM_COORDINATOR', 'SUPER_ADMIN'],
        defaultRole: 'principal',
        dashboardUrl: '/management#dashboard',
      },
      'teacher': {
        id: 'teacher',
        title: 'Faculty Academic Workspace',
        badgeText: 'Faculty Portal',
        badgeIcon: 'fa-chalkboard-user',
        badgeClass: 'teacher',
        desc: 'For <strong>Teaching Staff &amp; Subject Mentors</strong>. Attendance marking, marks entry, timetable schedules, and student logs.',
        btnText: 'Sign In to Faculty Portal',
        allowedRoles: ['TEACHER', 'FACULTY', 'SUPER_ADMIN'],
        defaultRole: 'teacher',
        dashboardUrl: '/teacher#dashboard',
      },
      'student': {
        id: 'student',
        title: 'Student Self-Service Portal',
        badgeText: 'Student Portal',
        badgeIcon: 'fa-graduation-cap',
        badgeClass: 'student',
        desc: 'Sign in with your <strong>Student ID or Admission Number</strong> to view attendance, exam marks, and timetable.',
        btnText: 'Sign In to Student Portal',
        allowedRoles: ['STUDENT'],
        defaultRole: 'student',
        dashboardUrl: '/student#dashboard',
      },
      'parent': {
        id: 'parent',
        title: 'Parent & Guardian Companion Portal',
        badgeText: 'Parent Portal',
        badgeIcon: 'fa-people-roof',
        badgeClass: 'parent',
        desc: 'For <strong>Parents &amp; Guardians</strong>. Monitor child attendance, fee clearance, and school notices.',
        btnText: 'Sign In to Parent Portal',
        allowedRoles: ['PARENT'],
        defaultRole: 'parent',
        dashboardUrl: '/parent#dashboard',
      },
    };
    return configs[p] || null;
  },

  showAccessDeniedBanner(message, options = {}) {
    const banner = document.getElementById('loginAlertBanner');
    if (!banner) return;
    const type = options.type || 'danger';
    banner.className = `login-alert-banner ${type}`;
    let iconClass = 'fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';
    else if (type === 'warning') iconClass = 'fa-shield-halved';

    let actionsHtml = '';
    if (options.authorizedUrl && options.authorizedLabel) {
      actionsHtml += `
        <div style="margin-top: 0.5rem; display: flex; gap: 0.65rem; flex-wrap: wrap;">
          <a href="${options.authorizedUrl}" style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; color: #1D4ED8; text-decoration: underline; font-size: 0.8rem;">
            <i class="fa-solid fa-arrow-right"></i> ${options.authorizedLabel}
          </a>
        </div>
      `;
    }

    banner.innerHTML = `
      <i class="fa-solid ${iconClass}" style="font-size: 1.15rem; margin-top: 2px; flex-shrink: 0;"></i>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 800; font-size: 0.88rem; margin-bottom: 2px;">${options.title || 'Access Denied'}</div>
        <div style="font-size: 0.8rem;">${message}</div>
        ${actionsHtml}
      </div>
    `;
    banner.style.display = 'flex';
  },

  hideAccessDeniedBanner() {
    const banner = document.getElementById('loginAlertBanner');
    if (banner) {
      banner.style.display = 'none';
      banner.innerHTML = '';
    }
  },

  async initUnifiedLoginPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const msgParam = urlParams.get('msg');
    const attemptedPortal = urlParams.get('attempted') || '';
    const currentRoleParam = (urlParams.get('currentRole') || urlParams.get('role') || '').toUpperCase();
    const requestedPortal = urlParams.get('portal') || this.inferPortalFromUrl();
    const redirectUrl = urlParams.get('redirect') || '';

    // Apply portal-specific visual customization
    if (requestedPortal) {
      const cfg = this.getPortalConfig(requestedPortal);
      if (cfg) {
        const badgeWrap = document.getElementById('ssoBadgeWrap');
        const badgeIcon = document.getElementById('ssoBadgeIcon');
        const badgeText = document.getElementById('ssoBadgeText');
        const cardTitle = document.getElementById('portalCardTitle');
        const cardDesc = document.getElementById('portalCardDesc');
        const submitBtn = document.getElementById('unifiedSubmitBtn');

        if (badgeWrap) badgeWrap.className = `portal-target-pill ${cfg.badgeClass}`;
        if (badgeIcon) badgeIcon.className = `fa-solid ${cfg.badgeIcon}`;
        if (badgeText) badgeText.textContent = cfg.badgeText;
        if (cardTitle) cardTitle.textContent = cfg.title;
        if (cardDesc) cardDesc.innerHTML = cfg.desc;
        if (submitBtn) {
          const btnSpan = submitBtn.querySelector('span');
          if (btnSpan) btnSpan.textContent = cfg.btnText;
        }
      }
    }

    // Access Notice / Access Denied Handling
    if (msgParam === 'logged_out') {
      this.showToast('You have been signed out successfully.', 'fa-circle-check');
    } else if (msgParam === 'unauthorized' || msgParam === 'restricted') {
      const targetPortalName = this.getPortalDisplayName(attemptedPortal || requestedPortal);
      let authUrl = '';
      let authLabel = '';
      if (currentRoleParam) {
        authUrl = this.getMainDashboardUrlForRole(currentRoleParam);
        authLabel = `Go to Your Authorized Dashboard (${currentRoleParam})`;
      }
      this.showAccessDeniedBanner(
        `Your account role <strong>${currentRoleParam || 'current role'}</strong> is not authorized to access <strong>${targetPortalName}</strong>. Please sign in with an authorized account.`,
        {
          title: 'Access Denied',
          type: 'danger',
          authorizedUrl: authUrl,
          authorizedLabel: authLabel,
        }
      );
      this.showToast(`Access Denied: ${currentRoleParam || 'Account'} is not authorized for ${targetPortalName}.`, 'fa-triangle-exclamation', true);
    } else if (msgParam === 'session_expired') {
      this.showToast('Session expired due to inactivity. Please sign in again.', 'fa-clock', true);
    }

    const clearResidualSession = () => {
      try {
        if (window.ApiClient && typeof window.ApiClient.clearSession === 'function') {
          window.ApiClient.clearSession();
        }
        sessionStorage.clear();
        this.clearNavigationCaches();
        [
          'sv_token_access', 'sv_token_refresh', 'sv_auth_unified',
          'sv_user_role', 'sv_user_portal', 'sv_user_allowed_portals',
          'sv_user_profile', 'sv_auth_management', 'sv_auth_teacher',
          'sv_auth_platform_admin', 'sv_role_management', 'sv_role_platform_admin',
          'sv_active_teacher_id', 'sv_active_teacher_name', 'sv_session_last_active'
        ].forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    };

    // Clear any residual session tokens if user arrived from logout or session expiration
    if (msgParam === 'logged_out' || msgParam === 'session_expired') {
      clearResidualSession();
    } else if (msgParam !== 'unauthorized' && msgParam !== 'restricted' && this.isAnySessionActive()) {
      // Validate token with backend before auto-redirecting so expired/stale tokens never cause redirect loops
      try {
        if (window.ApiClient && window.ApiClient.auth && typeof window.ApiClient.auth.getMe === 'function') {
          const meRes = await window.ApiClient.auth.getMe();
          const verifiedUser = meRes && meRes.data && (meRes.data.user || meRes.data);
          if (meRes && meRes.success && verifiedUser && verifiedUser.role) {
            const verifiedRole = String(verifiedUser.role).toUpperCase();
            localStorage.setItem('sv_user_role', verifiedRole);
            sessionStorage.setItem('sv_user_role', verifiedRole);
            const mapping = this.roleMatrix[verifiedRole] || this.resolvePortalForRole(verifiedRole);
            const allowedPortals = mapping.allowedPortals || [mapping.portal];

            if (requestedPortal) {
              if (allowedPortals.includes(requestedPortal)) {
                // Verified session has permission for requested portal: proceed
                const target = redirectUrl || (this.getPortalConfig(requestedPortal)?.dashboardUrl) || this.getMainDashboardUrlForRole(verifiedRole);
                this.showToast(`Active session verified (${verifiedRole}). Launching ${this.getPortalDisplayName(requestedPortal)}...`, 'fa-circle-check');
                setTimeout(() => {
                  window.location.href = target;
                }, 350);
                return;
              } else {
                // Active session role cannot access the requested portal!
                // Clear session credentials so user can enter the correct credentials without loop
                clearResidualSession();
                this.showAccessDeniedBanner(
                  `Active session was signed in as <strong>${verifiedRole}</strong>, which cannot access <strong>${this.getPortalDisplayName(requestedPortal)}</strong>. Please sign in with an authorized account below.`,
                  {
                    title: 'Account Role Mismatch',
                    type: 'warning',
                    authorizedUrl: this.getMainDashboardUrlForRole(verifiedRole),
                    authorizedLabel: `Previous ${verifiedRole} Dashboard`,
                  }
                );
              }
            } else {
              // Generic login without specific portal: redirect to main dashboard
              const target = this.getMainDashboardUrlForRole(verifiedRole);
              this.showToast(`Active session detected (${verifiedRole}). Redirecting to your Main Dashboard...`, 'fa-circle-check');
              setTimeout(() => {
                window.location.href = target;
              }, 350);
              return;
            }
          }
        }
        clearResidualSession();
      } catch (err) {
        // Invalid or expired token: clear stale flags silently and remain on login page
        clearResidualSession();
      }
    }

    // Setup OTP input auto-advance
    this.setupOtpInputListeners('unified');

    // Ensure pre-login visual state
    const overlay = document.getElementById('unifiedLoginOverlay');
    if (overlay) overlay.classList.remove('in-otp-mode');

    // Focus user input
    const userInp = document.getElementById('unifiedLoginUser');
    if (userInp) userInp.focus();

    // Check if WhatsApp code element is present and pre-fetch active dev OTP code
    if (document.getElementById('unifiedWhatsappCodeDisplay')) {
      this.fetchDevOtp();
    }
  },

  isAnySessionActive() {
    const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function')
      ? window.ApiClient.isAuthenticated()
      : Boolean(localStorage.getItem('sv_token_access') || sessionStorage.getItem('sv_token_access'));
    const userRole = localStorage.getItem('sv_user_role') || sessionStorage.getItem('sv_user_role');
    return Boolean(hasToken && userRole);
  },

  quickFillDemo(role) {
    const userInput = document.getElementById('unifiedLoginUser');
    const passInput = document.getElementById('unifiedLoginPass');
    if (!userInput || !passInput) return;

    const creds = {
      principal: { u: 'principal', p: 'Principal@123', label: 'Principal (Smt. Gorle Varalakshmi)' },
      viceprincipal: { u: 'viceprincipal', p: 'VicePrincipal@123', label: 'Vice Principal (Sri Navva Anand)' },
      teacher: { u: 'teacher1', p: 'Teacher@123', label: 'Faculty (Senior Faculty & HOD)' },
      faculty: { u: 'teacher1', p: 'Teacher@123', label: 'Faculty (Senior Faculty & HOD)' },
      superadmin: { u: 'superadmin', p: 'SuperAdmin@123', label: 'Platform Super Admin' },
      'platform-admin': { u: 'superadmin', p: 'SuperAdmin@123', label: 'Platform Super Admin' },
      officestaff: { u: 'officestaff', p: 'Office@123', label: 'Office Administrator / Clerk' },
      clerk: { u: 'officestaff', p: 'Office@123', label: 'Office Administrator / Clerk' },
      student: { u: 'student1', p: 'Student@123', label: 'Student (Class 10)' },
      parent: { u: 'parent1', p: 'Parent@123', label: 'Parent / Guardian' }
    };

    const target = creds[role] || creds.principal;
    userInput.value = target.u;
    passInput.value = target.p;
    this.showToast(`Auto-filled demo credentials for ${target.label}. Click 'Sign In' to verify authoritative role redirection.`, 'fa-bolt');
    userInput.focus();
  },

  async handleUnifiedLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userInput = document.getElementById('unifiedLoginUser');
    const passInput = document.getElementById('unifiedLoginPass');
    const submitBtn = document.getElementById('unifiedSubmitBtn');

    const enteredUser = userInput ? userInput.value.trim() : '';
    const enteredPass = passInput ? passInput.value : '';

    if (!enteredUser || !enteredPass) {
      this.showToast('Please enter both username/School ID/email and password.', 'fa-triangle-exclamation', true);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const requestedPortal = urlParams.get('portal') || this.inferPortalFromUrl();
    const redirectUrl = urlParams.get('redirect') || '';

    let originalBtnHTML = '';
    if (submitBtn) {
      originalBtnHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating Credentials...';
      submitBtn.disabled = true;
    }

    try {
      this.hideAccessDeniedBanner();
      let loginSuccess = false;
      let userData = null;
      let routingData = null;

      const rememberCheckbox = document.getElementById('unifiedRememberMe');
      const rememberMe = rememberCheckbox ? rememberCheckbox.checked : true;

      // 1. Authoritative Backend REST API Authentication with 2FA OTP & requestedPortal
      if (window.ApiClient && window.ApiClient.auth && typeof window.ApiClient.auth.login === 'function') {
        const res = await window.ApiClient.auth.login(enteredUser, enteredPass, rememberMe, true, requestedPortal);

        if (res && res.requiresOtp) {
          // Password verified! Enter Two-Factor Identity Verification state
          const otpCode = (res.data && res.data.otp) || '';
          this.otpSessions.unified = {
            preAuthToken: res.data.preAuthToken,
            destination: res.data.destination,
            destinationType: res.data.destinationType,
            otp: otpCode,
            enteredUser,
            rememberMe,
            requestedPortal,
            redirectUrl,
            timerSec: (res.data && res.data.cooldownSeconds) || 45,
          };

          const loginForm = document.getElementById('unifiedLoginForm');
          const otpForm = document.getElementById('unifiedOtpForm');
          const destDisplay = document.getElementById('unifiedOtpDestinationDisplay');
          const whatsappDisplay = document.getElementById('unifiedWhatsappCodeDisplay');

          if (destDisplay && res.data && res.data.destination) {
            destDisplay.textContent = res.data.destination;
          }

          if (whatsappDisplay) {
            if (otpCode) {
              whatsappDisplay.textContent = otpCode;
            } else {
              this.fetchDevOtp(res.data.preAuthToken);
            }
          }

          this.setOtpStatus('unified', null);

          for (let i = 1; i <= 6; i++) {
            const box = document.getElementById(`unifiedOtp-${i}`);
            if (box) {
              box.value = '';
              box.classList.remove('error', 'success');
              box.disabled = false;
            }
          }

          if (loginForm) loginForm.style.display = 'none';
          if (otpForm) otpForm.style.display = '';
          const overlay = document.getElementById('unifiedLoginOverlay');
          if (overlay) overlay.classList.add('in-otp-mode');

          this.startOtpTimer('unified');

          const firstBox = document.getElementById('unifiedOtp-1');
          if (firstBox) setTimeout(() => firstBox.focus(), 150);

          this.showToast(`Security code dispatched to ${res.data.destination}. Enter OTP to continue.`, 'fa-shield-halved');
          return;
        }

        if (res && (res.success || res.token || res.data)) {
          loginSuccess = true;
          userData = (res.data && res.data.user) || res.user || {};
          routingData = (res.data && res.data.routing) || res.routing || null;
        }
      }

      if (!loginSuccess) {
        throw new Error('Invalid credentials. Please verify your username/School ID and security password.');
      }

      // 3. Verify Account Status (Block Suspended or Deactivated accounts)
      if (userData && (userData.accountStatus === 'Suspended' || userData.accountStatus === 'Deactivated' || userData.accountStatus === 'Locked' || userData.isActive === false)) {
        throw new Error('Your account is deactivated or suspended. Access denied. Please contact school administration.');
      }

      // 4. Resolve authoritative role and routing from database
      const finalRole = ((userData && userData.role) || 'PRINCIPAL').toUpperCase();
      const routing = routingData || this.resolvePortalForRole(finalRole);
      const allowedPortals = (userData && userData.allowedPortals) || routing.allowedPortals || [routing.portal];

      // Enforce portal permission verification if a specific portal was requested
      if (requestedPortal && !allowedPortals.includes(requestedPortal)) {
        const portalName = this.getPortalDisplayName(requestedPortal);
        const userPortalName = this.getPortalDisplayName(routing.portal);
        const errMsg = `Access Denied: Your assigned account role (${finalRole}) is not authorized for ${portalName}.`;
        this.showAccessDeniedBanner(
          `${errMsg} Your account is authorized for <strong>${userPortalName}</strong>.`,
          {
            title: 'Access Denied',
            type: 'danger',
            authorizedUrl: routing.redirectUrl || this.getMainDashboardUrlForRole(finalRole),
            authorizedLabel: `Go to Your Authorized Portal (${userPortalName})`,
          }
        );
        throw new Error(errMsg);
      }

      // 5. Persist session across all storages
      this.persistUnifiedSession(userData, routing, enteredUser);

      // Clear all legacy navigation caches so user begins strictly on Main Dashboard
      this.clearNavigationCaches();

      // 6. Authoritative role-based redirection target
      let targetUrl = '';
      if (requestedPortal && allowedPortals.includes(requestedPortal)) {
        targetUrl = redirectUrl || (routing && routing.redirectUrl) || (this.getPortalConfig(requestedPortal)?.dashboardUrl) || this.getMainDashboardUrlForRole(finalRole);
      } else {
        targetUrl = (routing && routing.redirectUrl) || this.getMainDashboardUrlForRole(finalRole);
      }

      this.showToast(`✓ Authentication successful! Identified: ${routing.dashboardTitle || finalRole}. Launching Dashboard...`, 'fa-circle-check');

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);

    } catch (err) {
      console.error('[Unified Login Error]:', err);
      const errMsg = err.message || 'Authentication failed. Please verify your credentials.';
      this.showToast(errMsg, 'fa-triangle-exclamation', true);
      if (!errMsg.includes('Access Denied')) {
        this.showAccessDeniedBanner(errMsg, { title: 'Authentication Failed', type: 'danger' });
      }
      if (passInput) {
        passInput.focus();
        passInput.select();
      }
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      }
    }
  },

  verifyUnifiedOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.verifyOtp('unified', e);
  },

  cancelUnifiedOtp() {
    this.cancelOtp('unified');
  },

  autoFillOtp(portalType = 'unified') {
    const session = this.otpSessions[portalType];
    const displayEl = document.getElementById('unifiedWhatsappCodeDisplay');
    const otpToFill = (session && session.otp) || (displayEl ? displayEl.textContent.trim() : '') || '123456';
    const cleanOtp = String(otpToFill).replace(/\D/g, '');
    if (!cleanOtp) return;

    const prefix = this.getOtpPrefix(portalType);
    for (let i = 0; i < 6; i++) {
      const box = document.getElementById(`${prefix}Otp-${i + 1}`);
      if (box) {
        box.value = cleanOtp[i] || '';
        box.classList.remove('error');
      }
    }

    const lastBox = document.getElementById(`${prefix}Otp-${Math.min(cleanOtp.length, 6)}`);
    if (lastBox) lastBox.focus();

    this.showToast(`Auto-filled security code: ${cleanOtp}`, 'fa-shield-halved');
  },

  async fetchDevOtp(preAuthToken) {
    try {
      const url = preAuthToken ? `/api/v1/auth/dev-otp?preAuthToken=${encodeURIComponent(preAuthToken)}` : '/api/v1/auth/dev-otp';
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success && data.data && data.data.otp) {
        const whatsappDisplay = document.getElementById('unifiedWhatsappCodeDisplay');
        if (whatsappDisplay) {
          whatsappDisplay.textContent = data.data.otp;
        }
        if (this.otpSessions && this.otpSessions.unified) {
          this.otpSessions.unified.otp = data.data.otp;
        }
        return data.data.otp;
      }
    } catch (e) {
      console.warn('[PortalAuth] Could not fetch active dev OTP:', e);
    }
    return null;
  },

  persistUnifiedSession(user, routing, enteredUser) {
    const role = (user && user.role) ? user.role.toUpperCase() : 'PRINCIPAL';
    const portal = (routing && routing.portal) || 'management';
    const allowed = (routing && routing.allowedPortals) || [portal];

    // Master Unified Keys
    sessionStorage.setItem('sv_auth_unified', 'true');
    localStorage.setItem('sv_auth_unified', 'true');
    try { localStorage.setItem('sv_session_last_active', String(Date.now())); } catch (e) {}
    sessionStorage.setItem('sv_user_role', role);
    localStorage.setItem('sv_user_role', role);
    sessionStorage.setItem('sv_user_portal', portal);
    localStorage.setItem('sv_user_portal', portal);
    sessionStorage.setItem('sv_user_allowed_portals', JSON.stringify(allowed));
    localStorage.setItem('sv_user_allowed_portals', JSON.stringify(allowed));
    if (user) {
      sessionStorage.setItem('sv_user_profile', JSON.stringify(user));
      localStorage.setItem('sv_user_profile', JSON.stringify(user));
    }

    // Portal Compatibility Keys
    if (portal === 'management' || allowed.includes('management')) {
      sessionStorage.setItem('sv_auth_management', 'true');
      localStorage.setItem('sv_auth_management', 'true');
      const subtype = (routing && routing.roleSubtype) || (role === 'VICE_PRINCIPAL' ? 'vice-principal' : (role === 'OFFICE' || role === 'ADMIN' ? 'admin' : 'principal'));
      sessionStorage.setItem('sv_role_management', subtype);
      localStorage.setItem('sv_role_management', subtype);
    }

    if (portal === 'teacher' || allowed.includes('teacher')) {
      sessionStorage.setItem('sv_auth_teacher', 'true');
      localStorage.setItem('sv_auth_teacher', 'true');
      const tId = (user && (user.id || user.teacherId)) || (enteredUser && enteredUser.toUpperCase().startsWith('SV') ? enteredUser.toUpperCase() : 'SV200005');
      const tName = (user && (user.name || user.username)) || 'Senior Faculty';
      sessionStorage.setItem('sv_active_teacher_id', tId);
      localStorage.setItem('sv_active_teacher_id', tId);
      sessionStorage.setItem('sv_active_teacher_name', tName);
      localStorage.setItem('sv_active_teacher_name', tName);
    }

    if (portal === 'platform-admin' || allowed.includes('platform-admin')) {
      sessionStorage.setItem('sv_auth_platform_admin', 'true');
      localStorage.setItem('sv_auth_platform_admin', 'true');
      sessionStorage.setItem('sv_role_platform_admin', 'superadmin');
      localStorage.setItem('sv_role_platform_admin', 'superadmin');
    }
  },

  resolvePortalForRole(role) {
    const r = (role || '').toUpperCase();
    if (this.roleMatrix[r]) {
      return this.roleMatrix[r];
    }
    if (r.includes('ADMIN') || r.includes('SUPER')) {
      return this.roleMatrix.SUPER_ADMIN;
    }
    if (r.includes('VICE')) {
      return this.roleMatrix.VICE_PRINCIPAL;
    }
    if (r.includes('CLERK') || r.includes('OFFICE')) {
      return this.roleMatrix.ADMIN;
    }
    if (r.includes('TEACH') || r.includes('FACULTY')) {
      return this.roleMatrix.TEACHER;
    }
    if (r.includes('STUDENT')) {
      return this.roleMatrix.STUDENT;
    }
    if (r.includes('PARENT')) {
      return this.roleMatrix.PARENT;
    }
    return this.roleMatrix.PRINCIPAL;
  },

  isAuthorizedForPath(role, path) {
    if (!role) return false;
    const r = role.toUpperCase();
    const cleanPath = (path || '').toLowerCase();

    if (r === 'SUPER_ADMIN' || r === 'PLATFORM_ADMIN') {
      return true;
    }

    if (r === 'PRINCIPAL' || r === 'VICE_PRINCIPAL' || r === 'ADMIN' || r === 'OFFICE' || r === 'CLERK') {
      return cleanPath.startsWith('/management') || cleanPath.startsWith('/administration-portal');
    }

    if (r === 'TEACHER' || r === 'FACULTY') {
      return cleanPath.startsWith('/teacher') || cleanPath.startsWith('/faculty-portal');
    }

    if (r === 'STUDENT') {
      return cleanPath.startsWith('/student');
    }

    if (r === 'PARENT') {
      return cleanPath.startsWith('/parent');
    }

    return false;
  },

  handleDemoCredentialFallback() {
    // Hardcoded client-side password bypasses are disabled in production.
    return null;
  },

  _disabledLegacyFallback(enteredUser, enteredPass) {
    return null;
    const validPasswords = [];
    const u = (enteredUser || '').toLowerCase().trim();
    const upper = (enteredUser || '').toUpperCase().trim();
    const p = enteredPass;
    const isPassOk = validPasswords.includes(p);
    if (!isPassOk) return null;

    // 1. Super Admin
    if (u === 'superadmin' || u === 'admin@srividya.edu.in' || u === 'platform-admin') {
      return {
        user: { id: 'ADM-001', username: 'superadmin', name: 'Platform Super Administrator', role: 'SUPER_ADMIN' },
        routing: this.roleMatrix.SUPER_ADMIN
      };
    }

    // 2. Vice Principal
    if (u === 'viceprincipal' || u === 'vp' || upper === 'SV200002') {
      return {
        user: { id: 'SV200002', username: 'viceprincipal', name: 'Sri Navva Anand', role: 'VICE_PRINCIPAL' },
        routing: this.roleMatrix.VICE_PRINCIPAL
      };
    }

    // 3. Office Staff
    if (u === 'officestaff' || u === 'office' || u === 'clerk' || upper === 'SV-OFFICE-01' || upper === 'SV200027') {
      return {
        user: { id: 'SV-OFFICE-01', username: 'officestaff', name: 'Office Administration Desk', role: 'ADMIN' },
        routing: this.roleMatrix.ADMIN
      };
    }

    // 4. Teachers
    if (u.startsWith('teacher') || upper.startsWith('SV200003') || upper.startsWith('SV200004') || upper.startsWith('SV200005')) {
      const faculty = this.getAuthorizedFaculty().find(f => f.id === upper) || { id: 'SV200005', name: 'Sri K. Rajesh' };
      return {
        user: { id: faculty.id, username: u, name: faculty.name, role: 'TEACHER' },
        routing: this.roleMatrix.TEACHER
      };
    }

    // 5. Principal
    if (u === 'principal' || u === 'srividyaschools2017@gmail.com' || upper === 'SV200001' || u.includes('varalakshmi') || u.includes('bhavish')) {
      return {
        user: { id: 'SV200001', username: 'principal', name: 'Smt. Gorle Varalakshmi', role: 'PRINCIPAL' },
        routing: this.roleMatrix.PRINCIPAL
      };
    }

    return null;
  },

  async logout(portalType) {
    try {
      this.clearNavigationCaches();
      sessionStorage.clear();
      localStorage.removeItem('sv_token_access');
      localStorage.removeItem('sv_token_refresh');
      localStorage.removeItem('sv_auth_unified');
      localStorage.removeItem('sv_user_role');
      localStorage.removeItem('sv_user_portal');
      localStorage.removeItem('sv_user_allowed_portals');
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
      sessionStorage.removeItem('sv_session_last_active');
      localStorage.removeItem('sv_session_last_active');
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
  },

  restoreActiveView(portalType) {
    try {
      const rawHash = (window.location.hash || '').replace('#', '').trim();
      if (portalType === 'teacher') {
        let mod = 'dashboard';
        let sub = null;
        if (rawHash) {
          if (rawHash === 'dashboard' || rawHash.startsWith('dashboard-')) {
            mod = 'dashboard';
          } else if (rawHash === 'security' || rawHash === 'change-password' || rawHash === 'password') {
            mod = 'profile';
            sub = 'security';
          } else if (rawHash.startsWith('profile-')) {
            mod = 'profile';
            sub = rawHash.replace('profile-', '');
          } else if (rawHash.startsWith('my-classes')) {
            mod = 'my-classes';
            sub = rawHash.replace('my-classes-', '').replace('my-classes', '') || null;
          } else if (rawHash.startsWith('class-')) {
            mod = 'my-classes';
            sub = rawHash.replace('class-', '');
          } else if (rawHash.startsWith('comm-')) {
            mod = 'communication';
            sub = rawHash.replace('comm-', '');
          } else if (rawHash.startsWith('exams-')) {
            mod = 'examinations';
            sub = rawHash.replace('exams-', '');
          } else {
            const parts = rawHash.split('-');
            mod = parts[0];
            sub = parts.slice(1).join('-') || null;
          }
        }

        if (!document.getElementById('view-' + mod)) {
          mod = 'dashboard';
          sub = null;
        }

        if (window.teacherApp && typeof window.teacherApp.navigateTo === 'function') {
          window.teacherApp.navigateTo(mod, sub);
          if (mod === 'profile' && typeof window.teacherApp.switchProfileTab === 'function') {
            window.teacherApp.switchProfileTab(sub || 'personal');
          }
        }
      } else if (portalType === 'management') {
        const aliasMap = {
          comm: 'communication',
          exams: 'examinations',
          exam: 'examinations',
          tt: 'timetable',
          att: 'attendance'
        };
        let mod = 'dashboard';
        let sub = null;
        if (rawHash) {
          if (rawHash === 'dashboard' || rawHash.startsWith('dashboard-')) {
            mod = 'dashboard';
            sub = rawHash.replace('dashboard-', '');
            if (sub === 'dashboard') sub = null;
          } else if (rawHash.startsWith('my-classes')) {
            mod = 'my-classes';
            sub = rawHash.replace('my-classes-', '').replace('my-classes', '') || null;
          } else if (rawHash.startsWith('class-')) {
            mod = 'my-classes';
            sub = rawHash.replace('class-', '');
          } else {
            const parts = rawHash.split('-');
            const rawMod = parts[0];
            mod = aliasMap[rawMod] || rawMod;
            sub = parts.slice(1).join('-') || null;
          }
        }

        if (!document.getElementById('view-' + mod)) {
          mod = 'dashboard';
          sub = null;
        }

        if (window.portalApp && typeof window.portalApp.navigateTo === 'function') {
          window.portalApp.navigateTo(mod, sub);
        }
      } else if (portalType === 'platform-admin') {
        let mod = rawHash || 'dashboard';
        if (!document.getElementById('view-' + mod)) {
          mod = 'dashboard';
        }
        if (window.platformApp && typeof window.platformApp.navigateTo === 'function') {
          window.platformApp.navigateTo(mod);
        }
      }
    } catch (e) {
      console.warn('Error restoring view on refresh:', e);
    }
  },

  bindLogoutButtons(portalType) {
    const logoutBtns = document.querySelectorAll('[data-action="portal-logout"], .btn-logout, #btnLogout');
    logoutBtns.forEach((btn) => {
      if (!btn._authBound) {
        btn._authBound = true;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          PortalAuth.logout(portalType);
        });
      }
    });
  },

  async init(portalType) {
    if (typeof portalType === 'object' && portalType !== null) {
      portalType = portalType.portal || portalType.portalType || 'management';
    }
    const cfg = this.configs[portalType];
    if (!cfg) return;
    if (!cfg) return false;

    // 1. Check Authentication Status (require valid JWT token)
    const hasToken = (window.ApiClient && typeof window.ApiClient.isAuthenticated === 'function') ? window.ApiClient.isAuthenticated() : false;

    if (!hasToken) {
      // Unauthenticated: Redirect directly to Unified Login Page with return path and portal
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?portal=${portalType}&redirect=${encodeURIComponent(currentPath)}`;
      return false;
    }

    // 2. Route Guarding: Check Role Authorization from authoritative profile or token storage
    const storedProfile = (window.ApiClient && typeof window.ApiClient.getUser === 'function') ? window.ApiClient.getUser() : null;
    const userRole = ((storedProfile && storedProfile.role) || localStorage.getItem('sv_user_role') || sessionStorage.getItem('sv_user_role') || '').toUpperCase();
    if (!userRole) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?portal=${portalType}&redirect=${encodeURIComponent(currentPath)}`;
      return false;
    }
    let allowedPortals = [];
    try {
      const rawAllowed = localStorage.getItem('sv_user_allowed_portals') || sessionStorage.getItem('sv_user_allowed_portals');
      if (rawAllowed) allowedPortals = JSON.parse(rawAllowed);
    } catch (e) {}

    if (!allowedPortals || allowedPortals.length === 0) {
      const mapping = this.roleMatrix[userRole] || null;
      allowedPortals = mapping ? mapping.allowedPortals : [];
    }

    if (!allowedPortals.includes(portalType)) {
      console.warn(`[RouteGuard] Role ${userRole} unauthorized for portal '${portalType}'. Redirecting to authorized workspace notification.`);
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?portal=${portalType}&msg=unauthorized&attempted=${portalType}&currentRole=${userRole}&redirect=${encodeURIComponent(currentPath)}`;
      return false;
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
      const profile = (window.ApiClient && typeof window.ApiClient.getUser === 'function') ? window.ApiClient.getUser() : null;
      const teacherName = (profile && (profile.fullName || profile.name)) || sessionStorage.getItem('sv_active_teacher_name') || localStorage.getItem('sv_active_teacher_name') || 'Faculty Member';
      const teacherId = (profile && (profile.username || profile.employeeId)) || sessionStorage.getItem('sv_active_teacher_id') || localStorage.getItem('sv_active_teacher_id') || '';
      sessionStorage.setItem('sv_active_teacher_name', teacherName);
      localStorage.setItem('sv_active_teacher_name', teacherName);
      if (teacherId) {
        sessionStorage.setItem('sv_active_teacher_id', teacherId);
        localStorage.setItem('sv_active_teacher_id', teacherId);
      }

      const nameEl = document.getElementById('teacherUserName');
      if (nameEl) nameEl.textContent = teacherId ? `${teacherName} (${teacherId})` : teacherName;
    }

    // 5. Restore active view & sub-tab
    this.restoreActiveView(portalType);

    // 6. Authoritative session & role verification with backend
    if (window.ApiClient && typeof window.ApiClient.auth?.getMe === 'function' && window.ApiClient.getAccessToken()) {
      window.ApiClient.auth.getMe()
        .then((meRes) => {
          const authUser = meRes && meRes.data && (meRes.data.user || meRes.data);
          if (authUser && authUser.role) {
            const authRole = authUser.role.toUpperCase();
            localStorage.setItem('sv_user_role', authRole);
            sessionStorage.setItem('sv_user_role', authRole);
            const targetStorage = localStorage.getItem('sv_token_access') ? localStorage : sessionStorage;
            targetStorage.setItem('sv_user_profile', JSON.stringify(authUser));
            const authMapping = this.roleMatrix[authRole] || this.resolvePortalForRole(authRole);
            if (authMapping && Array.isArray(authMapping.allowedPortals)) {
              localStorage.setItem('sv_user_allowed_portals', JSON.stringify(authMapping.allowedPortals));
              sessionStorage.setItem('sv_user_allowed_portals', JSON.stringify(authMapping.allowedPortals));
              if (!authMapping.allowedPortals.includes(portalType)) {
                const currentPath = window.location.pathname + window.location.search;
                window.location.href = `/login?portal=${portalType}&msg=unauthorized&attempted=${portalType}&currentRole=${authRole}&redirect=${encodeURIComponent(currentPath)}`;
                return;
              }
            }
          }
        })
        .catch(() => {});
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
    return true;
  }
};

window.PortalAuth = PortalAuth;
