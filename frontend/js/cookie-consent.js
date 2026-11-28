(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'sv_cookie_consent_prefs';

  const CookieConsent = {
    preferences: {
      essential: true,
      functional: true,
      analytics: false,
      timestamp: null,
      version: 'v2.0.0',
    },

    init() {
      this.loadStoredPreferences();
      this.injectBannerAndModal();

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTimeout(() => this.showBanner(), 800);
      }
    },

    loadStoredPreferences() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.preferences = Object.assign(this.preferences, parsed);
        }
      } catch (_) {}
    },

    savePreferences(prefs) {
      try {
        this.preferences = Object.assign(this.preferences, prefs, {
          essential: true,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      } catch (e) {
        console.warn('[CookieConsent] Failed to save preferences to localStorage:', e);
      }

      this.hideBanner();
      this.closeModal();

      try {
        this.syncConsentWithBackend();
      } catch (_) {}

      try {
        window.dispatchEvent(new CustomEvent('sv:cookie-consent-updated', { detail: this.preferences }));
      } catch (_) {}
    },

    async syncConsentWithBackend() {
      try {
        if (window.ApiClient && window.ApiClient.compliance) {
          await window.ApiClient.compliance.recordConsent('COOKIE_ESSENTIAL', 'GRANTED', {
            version: this.preferences.version,
          });
          await window.ApiClient.compliance.recordConsent(
            'COOKIE_FUNCTIONAL',
            this.preferences.functional ? 'GRANTED' : 'REVOKED',
            { version: this.preferences.version }
          );
          await window.ApiClient.compliance.recordConsent(
            'COOKIE_ANALYTICS',
            this.preferences.analytics ? 'GRANTED' : 'REVOKED',
            { version: this.preferences.version }
          );
        }
      } catch (_) {}
    },

    acceptAll() {
      this.savePreferences({
        functional: true,
        analytics: true,
      });
    },

    rejectNonEssential() {
      this.savePreferences({
        functional: false,
        analytics: false,
      });
    },

    showBanner() {
      const banner = document.getElementById('skeuoCookieBanner');
      if (banner) {
        banner.style.display = 'block';
        banner.style.pointerEvents = 'auto';
        banner.style.opacity = '1';
        banner.style.bottom = '';
        void banner.offsetWidth;
        banner.classList.add('active');
      }
    },

    hideBanner() {
      const banner = document.getElementById('skeuoCookieBanner');
      if (banner) {
        banner.classList.remove('active');
        banner.style.pointerEvents = 'none';
        banner.style.bottom = '-320px';
        banner.style.opacity = '0';
        setTimeout(() => {
          if (banner && !banner.classList.contains('active')) {
            banner.style.display = 'none';
          }
        }, 360);
      }
    },

    openModal() {
      const modal = document.getElementById('skeuoCookieModal');
      const toggleFunctional = document.getElementById('cookieToggleFunctional');
      const toggleAnalytics = document.getElementById('cookieToggleAnalytics');

      if (toggleFunctional) toggleFunctional.checked = !!this.preferences.functional;
      if (toggleAnalytics) toggleAnalytics.checked = !!this.preferences.analytics;

      if (modal) {
        modal.style.display = 'flex';
        void modal.offsetWidth;
        modal.classList.add('active');
      }
    },

    closeModal() {
      const modal = document.getElementById('skeuoCookieModal');
      if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          if (modal && !modal.classList.contains('active')) {
            modal.style.display = 'none';
          }
        }, 250);
      }
    },

    saveModalPreferences() {
      const toggleFunctional = document.getElementById('cookieToggleFunctional');
      const toggleAnalytics = document.getElementById('cookieToggleAnalytics');

      this.savePreferences({
        functional: toggleFunctional ? toggleFunctional.checked : false,
        analytics: toggleAnalytics ? toggleAnalytics.checked : false,
      });
    },

    injectBannerAndModal() {
      if (document.getElementById('skeuoCookieBanner')) return;

      const banner = document.createElement('div');
      banner.id = 'skeuoCookieBanner';
      banner.className = 'skeuo-cookie-banner';
      banner.innerHTML = `
        <div class="cookie-banner-inner">
          <div class="cookie-banner-left">
            <div class="cookie-banner-icon"><i class="fa-solid fa-shield-halved"></i></div>
            <div class="cookie-banner-text">
              <h4>Privacy &amp; Child Data Protection (DPDP Act 2023)</h4>
              <p>
                We use strictly essential cookies for secure ERP authentication and optional preferences. In strict compliance with minor data protection laws, we never deploy commercial tracking pixels or behavioral advertising.
              </p>
            </div>
          </div>
          <div class="cookie-banner-actions">
            <button type="button" class="btn-cookie-accept" onclick="CookieConsent.acceptAll()">
              <i class="fa-solid fa-check"></i> Accept All
            </button>
            <button type="button" class="btn-cookie-reject" onclick="CookieConsent.rejectNonEssential()">
              Essential Only
            </button>
            <button type="button" class="btn-cookie-manage" onclick="CookieConsent.openModal()">
              <i class="fa-solid fa-sliders"></i> Preferences
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(banner);

      const btnAccept = banner.querySelector('.btn-cookie-accept');
      const btnReject = banner.querySelector('.btn-cookie-reject');
      const btnManage = banner.querySelector('.btn-cookie-manage');

      if (btnAccept) {
        btnAccept.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          CookieConsent.acceptAll();
        });
      }
      if (btnReject) {
        btnReject.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          CookieConsent.rejectNonEssential();
        });
      }
      if (btnManage) {
        btnManage.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          CookieConsent.openModal();
        });
      }

      banner.addEventListener('click', (e) => {
        const accept = e.target.closest('.btn-cookie-accept');
        const reject = e.target.closest('.btn-cookie-reject');
        const manage = e.target.closest('.btn-cookie-manage');
        if (accept) { e.preventDefault(); CookieConsent.acceptAll(); }
        else if (reject) { e.preventDefault(); CookieConsent.rejectNonEssential(); }
        else if (manage) { e.preventDefault(); CookieConsent.openModal(); }
      });

      const modal = document.createElement('div');
      modal.id = 'skeuoCookieModal';
      modal.className = 'skeuo-session-modal-overlay skeuo-cookie-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'cookieModalHeading');
      modal.innerHTML = `
        <div class="skeuo-session-modal skeuo-cookie-modal-card" style="max-width: 540px; text-align: left;">
          <div class="cookie-modal-header">
            <div class="cookie-modal-title-wrap">
              <div class="cookie-modal-icon">
                <i class="fa-solid fa-cookie-bite"></i>
              </div>
              <h3 id="cookieModalHeading" class="cookie-modal-title">Cookie &amp; Storage Preferences</h3>
            </div>
            <button type="button" class="cookie-modal-close" onclick="CookieConsent.closeModal()" aria-label="Close preferences dialog" title="Close preferences">&times;</button>
          </div>

          <p class="cookie-modal-desc">
            Customize your data processing preferences under the Indian DPDP Act 2023. Essential security storage cannot be deactivated as it is necessary for platform operation.
          </p>

          <!-- Category 1: Essential -->
          <div class="cookie-pref-item">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">Strictly Essential Storage</div>
              <div class="cookie-pref-subtitle">Enables secure single sign-on, JWT token encryption, CSRF protection, and session maintenance.</div>
            </div>
            <span class="cookie-pref-badge">Always Active</span>
          </div>

          <!-- Category 2: Functional -->
          <div class="cookie-pref-item">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">Functional Preferences</div>
              <div class="cookie-pref-subtitle">Remembers your active tab, sidebar collapse state, and high-contrast UI theme.</div>
            </div>
            <label class="skeuo-switch" aria-label="Toggle Functional Preferences">
              <input type="checkbox" id="cookieToggleFunctional">
              <span class="skeuo-slider"></span>
            </label>
          </div>

          <!-- Category 3: Analytics -->
          <div class="cookie-pref-item">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">In-House Performance Telemetry</div>
              <div class="cookie-pref-subtitle">Measures server response latency and logs frontend script errors to maintain 99.9% uptime. Zero third-party trackers.</div>
            </div>
            <label class="skeuo-switch" aria-label="Toggle Performance Telemetry">
              <input type="checkbox" id="cookieToggleAnalytics">
              <span class="skeuo-slider"></span>
            </label>
          </div>

          <div class="cookie-modal-footer">
            <a href="/cookie-policy" target="_blank" class="cookie-modal-policy-link">
              <i class="fa-solid fa-shield-halved"></i> View Full Cookie Policy
            </a>
            <button type="button" class="btn-cookie-save btn-skeuo-primary" onclick="CookieConsent.saveModalPreferences()">
              <i class="fa-solid fa-floppy-disk"></i> Save Preferences
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const modalClose = modal.querySelector('.cookie-modal-close');
      const modalSave = modal.querySelector('.btn-cookie-save');
      if (modalClose) {
        modalClose.addEventListener('click', (e) => {
          e.preventDefault();
          CookieConsent.closeModal();
        });
      }
      if (modalSave) {
        modalSave.addEventListener('click', (e) => {
          e.preventDefault();
          CookieConsent.saveModalPreferences();
        });
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          CookieConsent.closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          CookieConsent.closeModal();
        }
      });

      const style = document.createElement('style');
      style.textContent = `
        /* Overlay: Fixed, full-screen, backdrop blur, centered */
        .skeuo-session-modal-overlay,
        .skeuo-cookie-modal-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(8, 16, 38, 0.78);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999999;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
        .skeuo-session-modal-overlay.active,
        .skeuo-cookie-modal-overlay.active {
          display: flex !important;
          opacity: 1 !important;
        }

        /* Modal Dialog Card */
        .skeuo-cookie-modal-card {
          width: 100%;
          max-width: 540px;
          background: #FFFFFF !important;
          color: #0F172A !important;
          border-radius: 18px;
          padding: 24px 26px;
          text-align: left;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.08);
          border: 1px solid #CBD5E1;
          position: relative;
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: cookieModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cookieModalPop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Modal Header */
        .cookie-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid #E2E8F0;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .cookie-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cookie-modal-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #EFF6FF;
          color: #1D4ED8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(29, 78, 216, 0.15);
        }
        .cookie-modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A !important;
          margin: 0;
          line-height: 1.3;
        }
        .cookie-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #F1F5F9;
          border: none;
          font-size: 1.35rem;
          line-height: 1;
          cursor: pointer;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .cookie-modal-close:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        /* Modal Description */
        .cookie-modal-desc {
          font-size: 0.86rem;
          color: #475569 !important;
          line-height: 1.55;
          margin: 0 0 16px 0;
        }

        /* Cookie Preference Cards */
        .cookie-pref-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 15px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          margin-bottom: 10px;
          transition: border-color 0.15s ease;
        }
        .cookie-pref-item:hover {
          border-color: #CBD5E1;
        }
        .cookie-pref-info {
          flex: 1;
          min-width: 0;
        }
        .cookie-pref-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #0F172A !important;
          margin-bottom: 3px;
        }
        .cookie-pref-subtitle {
          font-size: 0.78rem;
          color: #64748B !important;
          line-height: 1.45;
        }
        .cookie-pref-badge {
          font-size: 0.76rem;
          font-weight: 700;
          color: #15803D !important;
          background: #ECFDF5;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #A7F3D0;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Toggle Switches */
        .skeuo-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .skeuo-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .skeuo-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #CBD5E1;
          border-radius: 24px;
          transition: 0.2s;
        }
        .skeuo-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .skeuo-switch input:checked + .skeuo-slider {
          background: #2563EB;
        }
        .skeuo-switch input:checked + .skeuo-slider:before {
          transform: translateX(20px);
        }

        /* Modal Footer */
        .cookie-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1.5px solid #E2E8F0;
          padding-top: 16px;
          margin-top: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cookie-modal-policy-link {
          font-size: 0.82rem;
          color: #2563EB !important;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s ease;
        }
        .cookie-modal-policy-link:hover {
          color: #1D4ED8 !important;
          text-decoration: underline;
        }
        .btn-cookie-save,
        .btn-skeuo-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF !important;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 10px rgba(29, 78, 216, 0.28);
          transition: all 0.15s ease;
        }
        .btn-cookie-save:hover,
        .btn-skeuo-primary:hover {
          background: linear-gradient(180deg, #1D4ED8 0%, #1E40AF 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(29, 78, 216, 0.35);
        }
        .btn-cookie-save:active,
        .btn-skeuo-primary:active {
          transform: translateY(1px);
        }

        /* Dark Theme Support */
        [data-theme="dark"] .skeuo-cookie-modal-card {
          background: #0F172A !important;
          color: #F8FAFC !important;
          border-color: #334155;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        [data-theme="dark"] .cookie-modal-header {
          border-bottom-color: #1E293B;
        }
        [data-theme="dark"] .cookie-modal-title {
          color: #F8FAFC !important;
        }
        [data-theme="dark"] .cookie-modal-close {
          background: #1E293B;
          color: #94A3B8;
        }
        [data-theme="dark"] .cookie-modal-close:hover {
          background: #334155;
          color: #FFFFFF;
        }
        [data-theme="dark"] .cookie-modal-desc {
          color: #94A3B8 !important;
        }
        [data-theme="dark"] .cookie-pref-item {
          background: #1E293B;
          border-color: #334155;
        }
        [data-theme="dark"] .cookie-pref-item:hover {
          border-color: #475569;
        }
        [data-theme="dark"] .cookie-pref-title {
          color: #F8FAFC !important;
        }
        [data-theme="dark"] .cookie-pref-subtitle {
          color: #94A3B8 !important;
        }
        [data-theme="dark"] .cookie-pref-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399 !important;
          border-color: rgba(16, 185, 129, 0.3);
        }
        [data-theme="dark"] .cookie-modal-footer {
          border-top-color: #1E293B;
        }
        [data-theme="dark"] .cookie-modal-policy-link {
          color: #60A5FA !important;
        }
        [data-theme="dark"] .cookie-modal-policy-link:hover {
          color: #93C5FD !important;
        }
        .skeuo-cookie-banner {
          position: fixed;
          bottom: -320px;
          left: 0; right: 0;
          z-index: 99998;
          padding: 16px 24px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          border-top: 2px solid #CBD5E1;
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.15);
          transition: bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          pointer-events: none;
          opacity: 0;
        }
        .skeuo-cookie-banner.active {
          bottom: 0 !important;
          pointer-events: auto !important;
          opacity: 1 !important;
        }
        .cookie-banner-actions button {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none;
        }
        .cookie-banner-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .cookie-banner-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 300px; }
        .cookie-banner-icon {
          width: 44px; height: 44px; border-radius: 10px; background: #EFF6FF; color: #1D4ED8;
          display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
        }
        .cookie-banner-text h4 { font-size: 0.95rem; font-weight: 800; color: #0F172A; margin-bottom: 2px; }
        .cookie-banner-text p { font-size: 0.82rem; color: #475569; line-height: 1.45; margin: 0; }
        .cookie-banner-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-cookie-accept {
          padding: 9px 18px; background: linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF; font-size: 0.86rem; font-weight: 700; border-radius: 8px; border: none; cursor: pointer;
          box-shadow: 0 3px 8px rgba(29, 78, 216, 0.3);
        }
        .btn-cookie-reject {
          padding: 9px 16px; background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
          color: #334155; font-size: 0.86rem; font-weight: 700; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;
        }
        .btn-cookie-manage {
          padding: 9px 14px; background: transparent; color: #1D4ED8; font-size: 0.86rem; font-weight: 700; border: none; cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    },
  };

  window.CookieConsent = CookieConsent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
  } else {
    CookieConsent.init();
  }
})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});
