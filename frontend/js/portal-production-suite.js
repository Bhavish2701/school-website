/**
 * Sri Vidya E.M High School ERP - Production Readiness Suite
 * Implements:
 * 1. Inactivity Session Auto-Logout (30 min inactivity monitor + 2 min modal countdown)
 * 2. Skeuomorphic Skeletons & Table Loading States
 * 3. Skeuomorphic Empty States Component
 * 4. Field-level Form Validation Utilities
 * 5. Mobile Drawer Navigation & Backdrop Interactivity
 * 6. Privacy-Conscious In-House Telemetry Tracker
 * 7. Guided Onboarding Tour Wizard (4 steps with role personalization)
 * 8. Email Verification Badges and Modal Workflow
 */

(function (window, document) {
  'use strict';

  const ProductionSuite = {
    // -------------------------------------------------------------------------
    // 1. INACTIVITY SESSION AUTO-LOGOUT
    // -------------------------------------------------------------------------
    inactivityTimer: null,
    countdownInterval: null,
    INACTIVITY_LIMIT_MS: 28 * 60 * 1000, // 28 minutes warning
    COUNTDOWN_SECONDS: 120, // 2 minutes countdown

    initInactivityMonitor() {
      // Don't run on public website or login page
      const path = window.location.pathname;
      if (path === '/' || path.includes('/login') || path.includes('/forgot-password') || path.includes('/public-website')) {
        return;
      }

      this.injectInactivityModal();
      this.resetInactivityTimer();

      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
      const debounceReset = () => this.resetInactivityTimer();

      events.forEach((evt) => {
        window.addEventListener(evt, debounceReset, { passive: true });
      });
    },

    resetInactivityTimer() {
      const modal = document.getElementById('skeuoSessionTimeoutModal');
      if (modal && modal.classList.contains('active')) {
        // Modal is actively warning, user must click "Stay Logged In"
        return;
      }

      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      if (this.countdownInterval) clearInterval(this.countdownInterval);

      this.inactivityTimer = setTimeout(() => {
        this.triggerSessionWarning();
      }, this.INACTIVITY_LIMIT_MS);
    },

    triggerSessionWarning() {
      const modal = document.getElementById('skeuoSessionTimeoutModal');
      const countEl = document.getElementById('sessionCountdownValue');
      if (!modal || !countEl) return;

      let remaining = this.COUNTDOWN_SECONDS;
      countEl.innerText = remaining;
      modal.classList.add('active');

      if (this.countdownInterval) clearInterval(this.countdownInterval);

      this.countdownInterval = setInterval(() => {
        remaining--;
        countEl.innerText = remaining;
        if (remaining <= 0) {
          clearInterval(this.countdownInterval);
          this.executeInactivityLogout();
        }
      }, 1000);
    },

    dismissSessionWarning() {
      const modal = document.getElementById('skeuoSessionTimeoutModal');
      if (modal) modal.classList.remove('active');
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      this.resetInactivityTimer();
    },

    async executeInactivityLogout() {
      try {
        if (window.ApiClient && typeof window.ApiClient.auth?.logout === 'function') {
          await window.ApiClient.auth.logout();
        }
      } catch (_) {}
      localStorage.removeItem('user');
      localStorage.removeItem('sv_auth_user');
      localStorage.removeItem('sv_token_access');
      localStorage.removeItem('sv_token_refresh');
      sessionStorage.clear();
      window.location.href = '/login?reason=inactivity';
    },

    injectInactivityModal() {
      if (document.getElementById('skeuoSessionTimeoutModal')) return;

      const overlay = document.createElement('div');
      overlay.id = 'skeuoSessionTimeoutModal';
      overlay.className = 'skeuo-session-modal-overlay';
      overlay.innerHTML = `
        <div class="skeuo-session-modal">
          <div class="session-countdown-circle" id="sessionCountdownValue">120</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 8px;">Session Inactivity Notice</h3>
          <p style="font-size: 0.88rem; color: #64748B; line-height: 1.5; margin-bottom: 22px;">
            For security safeguarding under Sri Vidya ERP policy, your session will automatically terminate due to inactivity.
          </p>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-skeuo-primary" style="flex: 1;" onclick="ProductionSuite.dismissSessionWarning()">
              <i class="fa-solid fa-clock-rotate-left"></i> Stay Logged In
            </button>
            <button type="button" class="btn-skeuo-secondary" style="flex: 1;" onclick="ProductionSuite.executeInactivityLogout()">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    },

    // -------------------------------------------------------------------------
    // 2. SKELETONS & TABLE LOADING STATES (Req 4)
    // -------------------------------------------------------------------------
    showTableSkeleton(tableSelector, rows = 5, cols = 6) {
      const table = typeof tableSelector === 'string' ? document.querySelector(tableSelector) : tableSelector;
      if (!table) return;

      const tbody = table.querySelector('tbody') || table;
      tbody.dataset.originalContent = tbody.innerHTML;

      let skeletonRows = '';
      for (let r = 0; r < rows; r++) {
        let cells = '';
        for (let c = 0; c < cols; c++) {
          const width = c === 0 ? '40px' : c === 1 ? '160px' : '90px';
          cells += `<td><div class="skeuo-skeleton skeuo-skeleton-text" style="width: ${width};"></div></td>`;
        }
        skeletonRows += `<tr>${cells}</tr>`;
      }
      tbody.innerHTML = skeletonRows;
    },

    hideTableSkeleton(tableSelector) {
      const table = typeof tableSelector === 'string' ? document.querySelector(tableSelector) : tableSelector;
      if (!table) return;
      const tbody = table.querySelector('tbody') || table;
      if (tbody.dataset.originalContent) {
        tbody.innerHTML = tbody.dataset.originalContent;
        delete tbody.dataset.originalContent;
      }
    },

    // -------------------------------------------------------------------------
    // 3. EMPTY STATES (Req 5)
    // -------------------------------------------------------------------------
    renderEmptyState(containerSelector, options = {}) {
      const el = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!el) return;

      const {
        icon = 'fa-folder-open',
        title = 'No Records Available',
        description = 'There are no active entries matching your current filters or search criteria.',
        actionText = null,
        actionFn = null,
      } = options;

      const btnHtml = actionText
        ? `<button type="button" class="skeuo-empty-btn" id="emptyStateActionBtn"><i class="fa-solid fa-rotate"></i> ${actionText}</button>`
        : '';

      el.innerHTML = `
        <div class="skeuo-empty-state">
          <div class="skeuo-empty-icon"><i class="fa-solid ${icon}"></i></div>
          <h4 class="skeuo-empty-title">${title}</h4>
          <p class="skeuo-empty-desc">${description}</p>
          ${btnHtml}
        </div>
      `;

      if (actionText && typeof actionFn === 'function') {
        const btn = el.querySelector('#emptyStateActionBtn');
        if (btn) btn.addEventListener('click', actionFn);
      }
    },

    // -------------------------------------------------------------------------
    // 4. FORM VALIDATION HELPERS (Req 7)
    // -------------------------------------------------------------------------
    validateField(inputEl, rules = {}) {
      if (!inputEl) return true;
      const val = (inputEl.value || '').trim();
      const parent = inputEl.closest('.form-group') || inputEl.parentElement;

      // Remove previous error
      const prevErr = parent.querySelector('.skeuo-field-error');
      if (prevErr) prevErr.remove();
      inputEl.classList.remove('is-invalid');

      if (rules.required && !val) {
        this.showFieldError(inputEl, rules.requiredMessage || 'This field is required.');
        return false;
      }

      if (rules.minLength && val.length < rules.minLength) {
        this.showFieldError(inputEl, `Minimum ${rules.minLength} characters required.`);
        return false;
      }

      if (rules.email && val && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(val)) {
        this.showFieldError(inputEl, 'Please enter a valid email address.');
        return false;
      }

      if (rules.phone && val && !/^\+?[0-9]{10,12}$/.test(val.replace(/\s+/g, ''))) {
        this.showFieldError(inputEl, 'Please enter a valid 10-digit mobile number.');
        return false;
      }

      return true;
    },

    showFieldError(inputEl, message) {
      if (!inputEl) return;
      this.clearFieldError(inputEl);
      inputEl.classList.add('is-invalid');
      const wrapper = inputEl.closest('.input-container, .input-wrapper, .sv-password-wrap, .school-input-wrap, .search-input-wrap, .input-group');
      if (wrapper) wrapper.classList.add('is-invalid');
      const anchor = wrapper || inputEl;
      const err = document.createElement('div');
      err.className = 'skeuo-field-error invalid-feedback show';
      err.setAttribute('role', 'alert');
      err.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
      if (anchor && anchor.parentNode) {
        anchor.insertAdjacentElement('afterend', err);
      } else {
        const parent = inputEl.closest('.form-group, .portal-form-group') || inputEl.parentElement;
        if (parent) parent.appendChild(err);
      }
    },

    clearFieldError(inputEl) {
      if (!inputEl) return;
      inputEl.classList.remove('is-invalid');
      const wrapper = inputEl.closest('.input-container, .input-wrapper, .sv-password-wrap, .school-input-wrap, .search-input-wrap, .input-group');
      if (wrapper) wrapper.classList.remove('is-invalid');
      const anchor = wrapper || inputEl;
      if (anchor && anchor.nextElementSibling && (anchor.nextElementSibling.classList.contains('skeuo-field-error') || anchor.nextElementSibling.classList.contains('invalid-feedback'))) {
        anchor.nextElementSibling.remove();
      }
      const parent = inputEl.closest('.form-group, .portal-form-group') || inputEl.parentElement;
      if (parent) {
        parent.querySelectorAll('.skeuo-field-error, .invalid-feedback').forEach(el => el.remove());
      }
    },

    // -------------------------------------------------------------------------
    // 5. MOBILE RESPONSIVENESS & SIDEBAR DRAWER (Req 12)
    // -------------------------------------------------------------------------
    initMobileDrawer() {
      // Create backdrop if absent
      let backdrop = document.getElementById('portalDrawerBackdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'portalDrawerBackdrop';
        backdrop.className = 'portal-drawer-backdrop';
        document.body.appendChild(backdrop);
      }

      const sidebar = document.querySelector('.portal-sidebar') || document.querySelector('aside.sidebar');
      const toggleBtn = document.getElementById('mobileSidebarToggle');

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          sidebar.classList.toggle('mobile-open');
          backdrop.classList.toggle('active');
        });
      }

      backdrop.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    },

    // -------------------------------------------------------------------------
    // 6. IN-HOUSE PRIVACY-CONSCIOUS TELEMETRY (Req 14)
    // -------------------------------------------------------------------------
    trackModuleAccess(moduleName, action = 'NAVIGATE') {
      try {
        if (window.ApiClient && window.ApiClient.analytics) {
          window.ApiClient.analytics.track('MODULE_ACCESS', moduleName, action, 0, {
            path: window.location.pathname,
            hash: window.location.hash,
          });
        }
      } catch (_) {}
    },

    // -------------------------------------------------------------------------
    // 7. GUIDED ONBOARDING TOUR (Req 19)
    // -------------------------------------------------------------------------
    tourCurrentStep: 0,
    tourSteps: [
      {
        badge: 'Executive Welcome',
        icon: 'fa-landmark-flag',
        title: 'Welcome to Sri Vidya ERP',
        desc: 'Official Unified School Management ERP for Sri Vidya English Medium High School under the executive leadership of Principal Smt. Gorle Varalakshmi.',
        features: [
          'Unified Single Sign-On (SSO) with multi-role jurisdiction',
          'Role-isolated executive management for Management, Teachers, and Office',
          'Autonomous IST synchronized live academic clock',
        ],
      },
      {
        badge: 'Core Modules',
        icon: 'fa-chalkboard-user',
        title: 'Academic & Institutional Supervision',
        desc: 'Comprehensive oversight of student enrollment, teacher workloads, attendance tracking, and syllabus progression.',
        features: [
          'Live Student Roster with Aadhaar-masked privacy safeguards',
          'Class-wise daily attendance rosters and executive lock statuses',
          'Automated Transfer Certificate (TC) generator with tamper-proof records',
        ],
      },
      {
        badge: 'Real-Time Governance',
        icon: 'fa-shield-halved',
        title: 'Institutional Controls & Daily Freeze',
        desc: 'Enforce school policies dynamically across all campus workstations and faculty dashboards.',
        features: [
          'Principal Executive Restrictions to dynamically lock sensitive modules',
          'Daily attendance register freeze with executive unlock capability',
          'Real-time live synchronization bus for zero-delay record updates',
        ],
      },
      {
        badge: 'Compliance & Support',
        icon: 'fa-file-shield',
        title: 'Data Privacy & Disaster Safeguards',
        desc: 'Sri Vidya ERP operates in full compliance with the Indian DPDP Act 2023 and AP Education Department standards.',
        features: [
          'Zero third-party trackers to strictly protect minor student data',
          'Automated snapshots with tested database disaster recovery',
          'Direct campus IT Helpdesk support at +91 9398578584',
        ],
      },
    ],

    checkAndTriggerOnboarding() {
      try {
        const stored = localStorage.getItem('user') || localStorage.getItem('sv_auth_user');
        if (!stored) return;
        const user = JSON.parse(stored);
        if (user && user.hasCompletedOnboarding === false) {
          setTimeout(() => this.openOnboardingModal(), 1200);
        }
      } catch (_) {}
    },

    openOnboardingModal() {
      this.injectOnboardingModal();
      this.tourCurrentStep = 0;
      this.renderTourStep();
      const modal = document.getElementById('skeuoOnboardingModal');
      if (modal) modal.classList.add('active');
    },

    closeOnboardingModal() {
      const modal = document.getElementById('skeuoOnboardingModal');
      if (modal) modal.classList.remove('active');
    },

    async completeOnboardingTour() {
      this.closeOnboardingModal();
      try {
        if (window.ApiClient && window.ApiClient.auth) {
          await window.ApiClient.auth.completeOnboarding();
        }
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          user.hasCompletedOnboarding = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (_) {}
    },

    renderTourStep() {
      const step = this.tourSteps[this.tourCurrentStep];
      if (!step) return;

      const badgeEl = document.getElementById('tourStepBadge');
      const titleEl = document.getElementById('tourStepTitle');
      const descEl = document.getElementById('tourStepDesc');
      const listEl = document.getElementById('tourStepFeatures');
      const dotsEl = document.getElementById('tourStepDots');
      const btnBack = document.getElementById('tourBtnBack');
      const btnNext = document.getElementById('tourBtnNext');

      if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid ${step.icon}"></i> ${step.badge}`;
      if (titleEl) titleEl.innerText = step.title;
      if (descEl) descEl.innerText = step.desc;

      if (listEl) {
        listEl.innerHTML = step.features
          .map((f) => `<div class="onboarding-feature-item"><i class="fa-solid fa-circle-check"></i> <span>${f}</span></div>`)
          .join('');
      }

      if (dotsEl) {
        dotsEl.innerHTML = this.tourSteps
          .map((_, idx) => `<div class="onboarding-step-dot ${idx === this.tourCurrentStep ? 'active' : ''}"></div>`)
          .join('');
      }

      if (btnBack) {
        btnBack.style.visibility = this.tourCurrentStep === 0 ? 'hidden' : 'visible';
      }

      if (btnNext) {
        if (this.tourCurrentStep === this.tourSteps.length - 1) {
          btnNext.innerHTML = '<span>Finish &amp; Launch ERP</span> <i class="fa-solid fa-rocket"></i>';
        } else {
          btnNext.innerHTML = '<span>Next Step</span> <i class="fa-solid fa-arrow-right"></i>';
        }
      }
    },

    tourNext() {
      if (this.tourCurrentStep < this.tourSteps.length - 1) {
        this.tourCurrentStep++;
        this.renderTourStep();
      } else {
        this.completeOnboardingTour();
      }
    },

    tourPrev() {
      if (this.tourCurrentStep > 0) {
        this.tourCurrentStep--;
        this.renderTourStep();
      }
    },

    injectOnboardingModal() {
      if (document.getElementById('skeuoOnboardingModal')) return;

      const overlay = document.createElement('div');
      overlay.id = 'skeuoOnboardingModal';
      overlay.className = 'skeuo-onboarding-overlay';
      overlay.innerHTML = `
        <div class="skeuo-onboarding-card">
          <div class="onboarding-steps-indicator" id="tourStepDots"></div>
          <div class="onboarding-badge" id="tourStepBadge"></div>
          <h3 class="onboarding-title" id="tourStepTitle"></h3>
          <p class="onboarding-desc" id="tourStepDesc"></p>
          <div class="onboarding-feature-list" id="tourStepFeatures"></div>
          <div class="onboarding-actions">
            <button type="button" class="btn-skeuo-secondary" id="tourBtnBack" onclick="ProductionSuite.tourPrev()">
              <i class="fa-solid fa-arrow-left"></i> Previous
            </button>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-skeuo-secondary" onclick="ProductionSuite.completeOnboardingTour()">
                Skip Tour
              </button>
              <button type="button" class="btn-skeuo-primary" id="tourBtnNext" onclick="ProductionSuite.tourNext()">
                <span>Next Step</span> <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    },

    // -------------------------------------------------------------------------
    // 8. EMAIL VERIFICATION MODAL & WORKFLOW (Req 3)
    // -------------------------------------------------------------------------
    injectEmailVerificationModal() {
      if (document.getElementById('skeuoEmailVerificationModal')) return;

      const overlay = document.createElement('div');
      overlay.id = 'skeuoEmailVerificationModal';
      overlay.className = 'skeuo-session-modal-overlay';
      overlay.innerHTML = `
        <div class="skeuo-session-modal" style="max-width: 480px; text-align: left;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: #EFF6FF; color: #1D4ED8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0;">Verify Email Address</h4>
            </div>
            <button type="button" onclick="ProductionSuite.closeEmailVerificationModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94A3B8;">&times;</button>
          </div>
          <p style="font-size: 0.86rem; color: #64748B; line-height: 1.5; margin-bottom: 18px;">
            A 6-digit confirmation code will be sent to your registered school email address for verification.
          </p>
          <div id="emailVerifyAlert" style="display: none; padding: 10px 12px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 14px;"></div>
          
          <div id="emailVerifyStep1">
            <button type="button" class="btn-skeuo-primary" style="width: 100%;" id="btnSendVerifyCode" onclick="ProductionSuite.sendEmailVerificationCode()">
              <i class="fa-solid fa-paper-plane"></i> Send Verification Code
            </button>
          </div>

          <div id="emailVerifyStep2" style="display: none;">
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="font-size: 0.84rem; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">Enter 6-Digit Verification Code</label>
              <input type="text" class="form-control" id="emailVerifyOtpInput" maxlength="6" placeholder="e.g. 123456" style="width: 100%; height: 44px; padding: 0 14px; font-size: 1.1rem; letter-spacing: 0.2em; text-align: center; font-weight: 700; border-radius: 8px; border: 1.5px solid #CBD5E1;">
            </div>
            <button type="button" class="btn-skeuo-primary" style="width: 100%;" id="btnConfirmVerifyCode" onclick="ProductionSuite.confirmEmailVerificationCode()">
              <i class="fa-solid fa-circle-check"></i> Confirm &amp; Verify Email
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    },

    openEmailVerificationModal() {
      this.injectEmailVerificationModal();
      const modal = document.getElementById('skeuoEmailVerificationModal');
      if (modal) modal.classList.add('active');
    },

    closeEmailVerificationModal() {
      const modal = document.getElementById('skeuoEmailVerificationModal');
      if (modal) modal.classList.remove('active');
    },

    async sendEmailVerificationCode() {
      const btn = document.getElementById('btnSendVerifyCode');
      const alertBox = document.getElementById('emailVerifyAlert');
      if (btn) btn.disabled = true;

      try {
        const res = await window.ApiClient.auth.sendVerificationEmail();
        if (res.success) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#ECFDF5';
          alertBox.style.color = '#065F46';
          alertBox.style.border = '1px solid #A7F3D0';
          alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> Code sent! Check your inbox. ${res.data?.devOtp ? '<strong>Dev Code: ' + res.data.devOtp + '</strong>' : ''}`;
          if (res.data?.devOtp) {
            document.getElementById('emailVerifyOtpInput').value = res.data.devOtp;
          }
          document.getElementById('emailVerifyStep1').style.display = 'none';
          document.getElementById('emailVerifyStep2').style.display = 'block';
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = '#FEF2F2';
          alertBox.style.color = '#991B1B';
          alertBox.innerText = res.message || 'Failed to dispatch code.';
        }
      } catch (err) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FEF2F2';
        alertBox.style.color = '#991B1B';
        alertBox.innerText = 'Network error while requesting verification code.';
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    async confirmEmailVerificationCode() {
      const otp = (document.getElementById('emailVerifyOtpInput').value || '').trim();
      const alertBox = document.getElementById('emailVerifyAlert');
      const btn = document.getElementById('btnConfirmVerifyCode');

      if (!otp || otp.length < 6) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FEF2F2';
        alertBox.style.color = '#991B1B';
        alertBox.innerText = 'Please enter a valid 6-digit verification code.';
        return;
      }

      if (btn) btn.disabled = true;

      try {
        const res = await window.ApiClient.auth.verifyEmail(otp);
        if (res.success) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#ECFDF5';
          alertBox.style.color = '#065F46';
          alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Email verified successfully!';
          setTimeout(() => {
            this.closeEmailVerificationModal();
            // Update badge in profile
            const badge = document.querySelector('.badge-email-unverified');
            if (badge) {
              badge.className = 'badge-email-verified';
              badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified';
            }
          }, 1500);
        } else {
          alertBox.style.display = 'block';
          alertBox.style.background = '#FEF2F2';
          alertBox.style.color = '#991B1B';
          alertBox.innerText = res.message || 'Invalid or expired code.';
        }
      } catch (err) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FEF2F2';
        alertBox.style.color = '#991B1B';
        alertBox.innerText = 'Verification failed. Please retry.';
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    // -------------------------------------------------------------------------
    // MASTER INITIALIZER
    // -------------------------------------------------------------------------
    init() {
      this.initInactivityMonitor();
      this.initMobileDrawer();
      this.checkAndTriggerOnboarding();
    },
  };

  // Expose globally
  window.ProductionSuite = ProductionSuite;
  window.showTableSkeleton = ProductionSuite.showTableSkeleton.bind(ProductionSuite);
  window.hideTableSkeleton = ProductionSuite.hideTableSkeleton.bind(ProductionSuite);
  window.renderEmptyState = ProductionSuite.renderEmptyState.bind(ProductionSuite);
  window.validateFormField = ProductionSuite.validateField.bind(ProductionSuite);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductionSuite.init());
  } else {
    ProductionSuite.init();
  }
})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
