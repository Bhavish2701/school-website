/**
 * Sri Vidya E.M High School - Unified REST API Client
 * Reusable JavaScript API service connecting the frontend to Express.js / MERN backend.
 *
 * Capabilities:
 * 1. Base URL configuration with auto-detection fallback.
 * 2. Token management (localStorage & sessionStorage sync).
 * 3. Automatic JWT Authorization Bearer header injection.
 * 4. Silent token renewal on 401 Unauthorized / Token Expiration.
 * 5. Role-based & Object-Level 403 Forbidden interceptor.
 * 6. Centralized loading state dispatchers.
 * 7. Graceful offline / network error handling.
 * 8. Standardized API response unwrapping: { success, message, data, errors }.
 */
(function (global) {
  'use strict';

  const DEFAULT_API_BASE = 'http://localhost:5000/api/v1';

  // Storage Keys
  const STORAGE_ACCESS_TOKEN = 'sv_token_access';
  const STORAGE_REFRESH_TOKEN = 'sv_token_refresh';
  const STORAGE_USER = 'sv_user_profile';

  class ApiClientService {
    constructor() {
      const dynamicOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) 
        ? `${window.location.origin}/api/v1` 
        : DEFAULT_API_BASE;
      this.baseUrl = (typeof window !== 'undefined' && window.API_BASE_URL) || dynamicOrigin;
      this.isRefreshing = false;
      this.failedQueue = [];
      this._refreshPromise = null;
      this._lastTokenRefreshTime = Date.now();
      this.activeRequestsCount = 0;
      this._syncCache = new Map();
      this._syncSubscribers = new Map();
      this._latestSeq = new Map();
      this._abortControllers = new Map();
      this._sseState = { connected: false, connecting: false, abortController: null, backoffMs: 3000, started: false };
    }

    get sync() {
      const self = this;
      return {
        getCached: (key, ttlMs = 15000) => {
          const hit = self._syncCache.get(key);
          if (!hit) return null;
          if (Date.now() - hit.updatedAt > ttlMs) {
            self._syncCache.delete(key);
            return null;
          }
          return hit.data;
        },
        setCached: (key, data) => {
          self._syncCache.set(key, { data, updatedAt: Date.now() });
        },
        invalidate: (domains = ['*']) => {
          const list = Array.isArray(domains) ? domains : [domains];
          const upper = list.map((d) => String(d || '*').toUpperCase());
          if (upper.includes('*')) {
            self._syncCache.clear();
          } else {
            Array.from(self._syncCache.keys()).forEach((k) => {
              const ku = k.toUpperCase();
              if (upper.some((d) => ku.includes(d))) self._syncCache.delete(k);
            });
          }
          const detail = { domains: upper, timestamp: Date.now() };
          upper.forEach((dom) => {
            const set = self._syncSubscribers.get(dom);
            if (set) set.forEach((cb) => { try { cb(detail); } catch (_) {} });
          });
          const wildcardSet = self._syncSubscribers.get('*');
          if (wildcardSet) wildcardSet.forEach((cb) => { try { cb(detail); } catch (_) {} });
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            try { window.dispatchEvent(new CustomEvent('sv:data-sync', { detail })); } catch (_) {}
          }
        },
        on: (domain, cb) => {
          const key = String(domain || '*').toUpperCase();
          if (!self._syncSubscribers.has(key)) self._syncSubscribers.set(key, new Set());
          self._syncSubscribers.get(key).add(cb);
          self.sync.ensureStream();
          return () => {
            const set = self._syncSubscribers.get(key);
            if (set) set.delete(cb);
          };
        },
        fetchLatest: async (key, fetcherFn) => {
          const nextSeq = (self._latestSeq.get(key) || 0) + 1;
          self._latestSeq.set(key, nextSeq);
          const prevCtrl = self._abortControllers.get(key);
          if (prevCtrl) {
            try { prevCtrl.abort(); } catch (_) {}
          }
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          if (controller) self._abortControllers.set(key, controller);
          const result = await fetcherFn(controller ? controller.signal : undefined);
          if (self._latestSeq.get(key) !== nextSeq) {
            const staleErr = new Error('STALE_RESPONSE_IGNORED');
            staleErr.isStale = true;
            throw staleErr;
          }
          self._syncCache.set(key, { data: result, updatedAt: Date.now() });
          return result;
        },
        formatLastUpdated: (ts) => {
          const d = ts ? new Date(ts) : new Date();
          return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        },
        isConnected: () => Boolean(self._sseState && self._sseState.connected),
        connectStream: () => self.sync.ensureStream(),
        ensureStream: () => {
          if (self._sseState.started || typeof window === 'undefined' || !self.getAccessToken()) return;
          self._sseState.started = true;
          const connect = async () => {
            if (!self.getAccessToken()) {
              self._sseState.started = false;
              return;
            }
            if (self._sseState.connecting) return;
            self._sseState.connecting = true;
            const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
            self._sseState.abortController = ctrl;
            try {
              const res = await fetch(`${self.baseUrl}/dashboard/stream`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${self.getAccessToken()}`,
                  'Accept': 'text/event-stream',
                },
                signal: ctrl ? ctrl.signal : undefined,
              });
              if (!res.ok || !res.body) throw new Error(`SSE status ${res.status}`);
              self._sseState.connected = true;
              self._sseState.connecting = false;
              self._sseState.backoffMs = 3000;
              const reader = res.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const chunks = buffer.split('\n\n');
                buffer = chunks.pop() || '';
                chunks.forEach((raw) => {
                  const dataLine = raw.split('\n').find((l) => l.startsWith('data:'));
                  if (!dataLine) return;
                  try {
                    const payload = JSON.parse(dataLine.slice(5).trim());
                    if (payload && payload.domain) {
                      self.sync.invalidate([payload.domain, 'DASHBOARD']);
                    }
                  } catch (_) {}
                });
              }
            } catch (_) {
              // Silent reconnect backoff
            } finally {
              self._sseState.connected = false;
              self._sseState.connecting = false;
              const delay = Math.min(self._sseState.backoffMs || 3000, 30000);
              self._sseState.backoffMs = Math.min(delay * 2, 30000);
              if (self.getAccessToken()) setTimeout(connect, delay);
              else self._sseState.started = false;
            }
          };
          connect();
        },
      };
    }

    /* =========================================================================
     * TOKEN & CREDENTIAL MANAGEMENT
     * ========================================================================= */
    getAccessToken() {
      return localStorage.getItem(STORAGE_ACCESS_TOKEN) || sessionStorage.getItem(STORAGE_ACCESS_TOKEN) || null;
    }

    getRefreshToken() {
      return localStorage.getItem(STORAGE_REFRESH_TOKEN) || sessionStorage.getItem(STORAGE_REFRESH_TOKEN) || null;
    }

    getUser() {
      const u = localStorage.getItem(STORAGE_USER) || sessionStorage.getItem(STORAGE_USER);
      try {
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    }

    setSession(tokens, user, remember = true) {
      const storage = remember ? localStorage : sessionStorage;
      // Clear both first to avoid stale tokens in other storage
      localStorage.removeItem(STORAGE_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      sessionStorage.removeItem(STORAGE_ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_REFRESH_TOKEN);
      sessionStorage.removeItem(STORAGE_USER);

      if (tokens && tokens.accessToken) {
        storage.setItem(STORAGE_ACCESS_TOKEN, tokens.accessToken);
      }
      if (tokens && tokens.refreshToken) {
        storage.setItem(STORAGE_REFRESH_TOKEN, tokens.refreshToken);
      }
      if (user) {
        storage.setItem(STORAGE_USER, JSON.stringify(user));
      }
    }

    updateAccessToken(newAccessToken) {
      if (localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
        localStorage.setItem(STORAGE_ACCESS_TOKEN, newAccessToken);
      } else {
        sessionStorage.setItem(STORAGE_ACCESS_TOKEN, newAccessToken);
      }
    }

    updateTokens(tokens) {
      if (!tokens) return;
      if (tokens.accessToken) {
        if (localStorage.getItem(STORAGE_ACCESS_TOKEN)) {
          localStorage.setItem(STORAGE_ACCESS_TOKEN, tokens.accessToken);
        } else {
          sessionStorage.setItem(STORAGE_ACCESS_TOKEN, tokens.accessToken);
        }
      }
      if (tokens.refreshToken) {
        if (localStorage.getItem(STORAGE_REFRESH_TOKEN)) {
          localStorage.setItem(STORAGE_REFRESH_TOKEN, tokens.refreshToken);
        } else {
          sessionStorage.setItem(STORAGE_REFRESH_TOKEN, tokens.refreshToken);
        }
      }
    }

    clearSession() {
      localStorage.removeItem(STORAGE_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      sessionStorage.removeItem(STORAGE_ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_REFRESH_TOKEN);
      sessionStorage.removeItem(STORAGE_USER);
    }

    isAuthenticated() {
      return !!this.getAccessToken();
    }

    /* =========================================================================
     * UI FEEDBACK & NOTIFICATION HELPERS
     * ========================================================================= */
    showToast(message, icon = 'fa-circle-check', isError = false) {
      if (typeof document === 'undefined') return;
      const existing = document.querySelector('.api-toast-banner');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'api-toast-banner';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.backgroundColor = isError ? '#DC2626' : '#15803D';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
      toast.style.zIndex = '999999';
      toast.style.fontSize = '0.9rem';
      toast.style.fontWeight = '500';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '10px';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    setLoading(isLoading) {
      if (isLoading) {
        this.activeRequestsCount++;
      } else {
        this.activeRequestsCount = Math.max(0, this.activeRequestsCount - 1);
      }

      if (typeof document === 'undefined') return;
      let spinner = document.getElementById('globalApiSpinner');
      if (this.activeRequestsCount > 0) {
        if (!spinner) {
          spinner = document.createElement('div');
          spinner.id = 'globalApiSpinner';
          spinner.style.position = 'fixed';
          spinner.style.top = '16px';
          spinner.style.right = '16px';
          spinner.style.zIndex = '999998';
          spinner.style.background = 'rgba(15, 23, 42, 0.85)';
          spinner.style.color = '#38BDF8';
          spinner.style.padding = '6px 12px';
          spinner.style.borderRadius = '20px';
          spinner.style.fontSize = '0.75rem';
          spinner.style.fontWeight = '600';
          spinner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          spinner.style.display = 'flex';
          spinner.style.alignItems = 'center';
          spinner.style.gap = '8px';
          spinner.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Syncing...</span>';
          document.body.appendChild(spinner);
        }
      } else if (spinner) {
        spinner.remove();
      }
    }

    /* =========================================================================
     * CORE HTTP REQUEST WRAPPER WITH INTERCEPTORS
     * ========================================================================= */
    async request(endpoint, options = {}) {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      
      const headers = {
        'Accept': 'application/json',
        ...(options.headers || {}),
      };

      // Auto-set Content-Type if JSON payload
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      // Attach Bearer Access Token
      const token = this.getAccessToken();
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      options.headers = headers;

      this.setLoading(true);

      try {
        let res = await fetch(url, options);

        // 1. Handle 401 Unauthorized (Expired Token) -> Attempt Refresh
        if (res.status === 401 && !options._retry && this.getRefreshToken()) {
          options._retry = true;
          const refreshed = await this.silentRefreshToken();
          if (refreshed) {
            // Re-apply refreshed token and retry
            options.headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
            res = await fetch(url, options);
          } else {
            this.handleSessionExpired();
            throw new Error('Your session has expired. Please sign in again.');
          }
        }

        // 2. Handle 403 Forbidden (RBAC / Object Level Access Violation)
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || 'Access denied: You are not authorized to view or edit this resource.';
          this.showToast(errMsg, 'fa-shield-halved', true);
          throw new Error(errMsg);
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const errMsg = (data && data.message) || `Request failed with status ${res.status}`;
          const err = new Error(errMsg);
          if (data && data.code) err.code = data.code;
          err.response = data;
          throw err;
        }

        const methodUpper = String(options.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper) && !endpoint.includes('/auth/')) {
          const seg = endpoint.replace(/^https?:\/\/[^/]+/, '').split('/').filter(Boolean)[0] || '*';
          this.sync.invalidate([seg, 'DASHBOARD']);
        }

        return data;
      } catch (err) {
        // Network / Server connection errors
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          const offlineMsg = 'Unable to connect to school backend server. Please verify Express server is running on port 5000.';
          console.error('[ApiClient Network Error]:', err);
          this.showToast(offlineMsg, 'fa-network-wired', true);
          throw new Error(offlineMsg);
        }
        throw err;
      } finally {
        this.setLoading(false);
      }
    }

    async silentRefreshToken() {
      // Re-use active refresh promise to serialize parallel 401 calls and prevent token rotation race conditions
      if (this._refreshPromise) {
        return this._refreshPromise;
      }

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      this._refreshPromise = (async () => {
        try {
          const res = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.data && data.data.tokens) {
            this.updateTokens(data.data.tokens);
            this._lastTokenRefreshTime = Date.now();
            return true;
          }
          return false;
        } catch (e) {
          console.warn('[ApiClient] Silent token refresh failed:', e);
          return false;
        } finally {
          this._refreshPromise = null;
        }
      })();

      return this._refreshPromise;
    }

    async keepAlive() {
      // Proactively keep session tokens fresh in background while user is active
      const refreshToken = this.getRefreshToken();
      const accessToken = this.getAccessToken();
      if (!refreshToken || !accessToken) return;

      const now = Date.now();
      if (!this._lastTokenRefreshTime) {
        this._lastTokenRefreshTime = now;
      }
      // If 5 minutes have elapsed since last refresh, silently refresh access token
      if (now - this._lastTokenRefreshTime > 5 * 60 * 1000) {
        this._lastTokenRefreshTime = now;
        await this.silentRefreshToken();
      }
    }

    handleSessionExpired() {
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
        sessionStorage.removeItem('sv_session_last_active');
        localStorage.removeItem('sv_session_last_active');
        [
          'sv_mgmt_last_module', 'sv_mgmt_last_sub',
          'sv_teacher_last_module', 'sv_teacher_last_sub',
          'sv_teacher_last_profile_tab', 'sv_active_view',
          'sv_last_view', 'sv_platform_last_view'
        ].forEach(k => {
          sessionStorage.removeItem(k);
          localStorage.removeItem(k);
        });
      } catch (e) {}

      this.showToast('Session expired. Please sign in again.', 'fa-lock', true);
      const currentPath = (typeof window !== 'undefined' && window.location) ? (window.location.pathname + window.location.search) : '';
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login?msg=session_expired&redirect=' + encodeURIComponent(currentPath);
        }
      }, 500);
    }

    /* =========================================================================
     * DOMAIN API SERVICES
     * ========================================================================= */

    // 1. Authentication Service
    get auth() {
      return {
        login: async (identifier, password, remember = true, requireOtp = false, requestedPortal = '') => {
          const res = await this.request('/auth/login', {
            method: 'POST',
            body: { identifier, password, requireOtp, requestedPortal },
          });
          if (res.success && res.data && !res.requiresOtp && res.data.tokens) {
            this.setSession(res.data.tokens, res.data.user, remember);
          }
          return res;
        },
        verifyOtp: async (preAuthToken, otp, remember = true, requestedPortal = '') => {
          const res = await this.request('/auth/verify-otp', {
            method: 'POST',
            body: { preAuthToken, otp, requestedPortal },
          });
          if (res.success && res.data && res.data.tokens) {
            this.setSession(res.data.tokens, res.data.user, remember);
          }
          return res;
        },
        resendOtp: async (preAuthToken) => {
          return await this.request('/auth/resend-otp', {
            method: 'POST',
            body: { preAuthToken },
          });
        },
        logout: async () => {
          try {
            await this.request('/auth/logout', { method: 'POST' });
          } catch (e) {
            // Ignore logout network errors
          } finally {
            this.clearSession();
          }
        },
        getMe: async () => {
          return await this.request('/auth/me');
        },
        changePassword: async (currentPassword, newPassword) => {
          return await this.request('/auth/change-password', {
            method: 'POST',
            body: { currentPassword, newPassword },
          });
        },
        forgotPassword: async (identifier) => {
          return await this.request('/auth/forgot-password', {
            method: 'POST',
            body: { identifier },
          });
        },
        resetPassword: async (resetToken, newPassword) => {
          return await this.request('/auth/reset-password', {
            method: 'POST',
            body: { resetToken, newPassword },
          });
        },
        sendVerificationEmail: async (email) => {
          return await this.request('/auth/send-verification-email', {
            method: 'POST',
            body: { email },
          });
        },
        verifyEmail: async (otp, email) => {
          return await this.request('/auth/verify-email', {
            method: 'POST',
            body: { otp, email },
          });
        },
        completeOnboarding: async () => {
          return await this.request('/auth/complete-onboarding', {
            method: 'POST',
          });
        },
      };
    }

    // 2. Dashboard Service
    get dashboard() {
      return {
        getManagementDashboard: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          const res = await this.request(`/dashboard/management${q ? '?' + q : ''}`);
          return res.data;
        },
        getPlatformDashboard: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          const res = await this.request(`/platform/dashboard${q ? '?' + q : ''}`);
          return res.data;
        },
        getTeacherDashboard: async (teacherId = null) => {
          const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : '';
          const res = await this.request(`/dashboard/teacher${query}`);
          return res.data;
        },
        getStudentDashboard: async (studentId = null) => {
          const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
          const res = await this.request(`/dashboard/student${query}`);
          return res.data;
        },
        getParentDashboard: async (childId = null) => {
          const query = childId ? `?childId=${encodeURIComponent(childId)}` : '';
          const res = await this.request(`/dashboard/parent${query}`);
          return res.data;
        },
      };
    }

    // 3. Students Service
    get students() {
      return {
        getStudents: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/students${q ? '?' + q : ''}`);
        },
        getStudent: async (id) => {
          return await this.request(`/students/${id}`);
        },
        createStudent: async (studentData) => {
          return await this.request('/students', {
            method: 'POST',
            body: studentData,
          });
        },
        updateStudent: async (id, studentData) => {
          return await this.request(`/students/${id}`, {
            method: 'PATCH',
            body: studentData,
          });
        },
        deleteStudent: async (id) => {
          return await this.request(`/students/${id}`, {
            method: 'DELETE',
          });
        },
      };
    }

    // 4. Teachers Service
    get teachers() {
      return {
        getTeachers: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/teachers${q ? '?' + q : ''}`);
        },
        getTeacher: async (id) => {
          return await this.request(`/teachers/${id}`);
        },
        updateTeacher: async (id, data) => {
          return await this.request(`/teachers/${id}`, {
            method: 'PATCH',
            body: data,
          });
        },
        applyLeave: async (leaveData) => {
          return await this.request('/teachers/leaves', {
            method: 'POST',
            body: leaveData,
          });
        },
        getMyLeaves: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/teachers/leaves${q ? '?' + q : ''}`);
        },
      };
    }

    // 5. Parents Service
    get parents() {
      return {
        getProfile: async () => {
          return await this.request('/parents/profile');
        },
        getChildren: async () => {
          return await this.request('/parents/children');
        },
        getChildAttendance: async (childId, params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/parents/children/${childId}/attendance${q ? '?' + q : ''}`);
        },
        getChildAssignments: async (childId) => {
          return await this.request(`/parents/children/${childId}/assignments`);
        },
        getChildExams: async (childId) => {
          return await this.request(`/parents/children/${childId}/exams`);
        },
        getChildFees: async (childId) => {
          return await this.request(`/parents/children/${childId}/fees`);
        },
      };
    }

    // 6. Attendance Service
    get attendance() {
      return {
        getTeacherClasses: async () => {
          return await this.request('/attendance/teacher/classes');
        },
        getClassStudents: async (cls, section, params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/attendance/classes/${encodeURIComponent(cls)}/${encodeURIComponent(section)}/students${q ? '?' + q : ''}`);
        },
        markAttendance: async (attendanceData) => {
          return await this.request('/attendance/mark', {
            method: 'POST',
            body: attendanceData,
          });
        },
        getManagementOverview: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/attendance/management/overview${q ? '?' + q : ''}`);
        },
        getAttendanceReport: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/attendance/management/reports${q ? '?' + q : ''}`);
        },
        getTodayAbsentees: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/attendance/absentees/today${q ? '?' + q : ''}`);
        },
        getStudentAttendance: async (studentId, params = {}) => {
          const q = new URLSearchParams(params).toString();
          const u = this.getUser();
          const role = (u && u.role || '').toUpperCase();
          if (role === 'PARENT' && studentId) {
            return await this.request(`/attendance/parent/child/${studentId}${q ? '?' + q : ''}`);
          }
          if (role === 'STUDENT' || !studentId || studentId === 'me') {
            return await this.request(`/attendance/student/me${q ? '?' + q : ''}`);
          }
          return await this.request(`/attendance/management/reports${q ? '?' + q : ''}`);
        },
      };
    }

    // 7. Assignments & Academics Service
    get academic() {
      return {
        listYears: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/academic/years${q ? '?' + q : ''}`);
        },
        getClasses: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/academic/classes${q ? '?' + q : ''}`);
        },
        createClass: async (data) => {
          return await this.request('/academic/classes', { method: 'POST', body: data });
        },
        getSubjects: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/academic/subjects${q ? '?' + q : ''}`);
        },
        createSubject: async (data) => {
          return await this.request('/academic/subjects', { method: 'POST', body: data });
        },
        assignTeacher: async (data) => {
          return await this.request('/academic/assign-teacher', { method: 'POST', body: data });
        },
      };
    }

    get assignments() {
      return {
        getAssignments: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/academic/assignments${q ? '?' + q : ''}`);
        },
        createAssignment: async (data) => {
          return await this.request('/academic/assignments', {
            method: 'POST',
            body: data,
          });
        },
      };
    }

    // 8. Examinations Service
    get exams() {
      return {
        getExams: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/exams${q ? '?' + q : ''}`);
        },
        createExam: async (data) => {
          return await this.request('/exams', { method: 'POST', body: data });
        },
        getExamSchedule: async (examId, params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/exams/${examId}/schedule${q ? '?' + q : ''}`);
        },
        createSchedule: async (examId, data) => {
          return await this.request(`/exams/${examId}/schedule`, { method: 'POST', body: data });
        },
        getMarks: async (examIdOrParams, cls, section) => {
          if (typeof examIdOrParams === 'string' && cls && section) {
            return await this.request(`/exams/${examIdOrParams}/class/${encodeURIComponent(cls)}/${encodeURIComponent(section)}/dossier`);
          }
          const q = new URLSearchParams(examIdOrParams || {}).toString();
          return await this.request(`/exams${q ? '?' + q : ''}`);
        },
        enterMarks: async (examIdOrData, dataMaybe) => {
          const examId = dataMaybe ? examIdOrData : (examIdOrData && examIdOrData.examId);
          const payload = dataMaybe || examIdOrData;
          return await this.request(`/exams/${examId}/marks`, {
            method: 'POST',
            body: payload,
          });
        },
        publishResults: async (examId) => {
          return await this.request(`/exams/${examId}/publish`, { method: 'POST' });
        },
        getStudentResults: async (studentId) => {
          return await this.request(`/exams/results/student/${studentId}`);
        },
      };
    }

    // 9. Fee & Payment Service
    get fees() {
      return {
        getDashboardOverview: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/fees/dashboard-overview${q ? '?' + q : ''}`);
        },
        getStructures: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/fees/structures${q ? '?' + q : ''}`);
        },
        createStructure: async (data) => {
          return await this.request('/fees/structures', { method: 'POST', body: data });
        },
        getPendingFees: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/fees/pending${q ? '?' + q : ''}`);
        },
        getDefaulters: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/fees/pending${q ? '?' + q : ''}`);
        },
        getReceipts: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/payments/history${q ? '?' + q : ''}`);
        },
        listReceipts: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/payments/history${q ? '?' + q : ''}`);
        },
        getStudentFee: async (studentId) => {
          return await this.request(`/fees/student/${studentId}`);
        },
        createPaymentOrder: async (data) => {
          return await this.request('/payments/create', {
            method: 'POST',
            body: data,
          });
        },
        verifyPayment: async (data) => {
          return await this.request('/payments/verify', {
            method: 'POST',
            body: data,
          });
        },
      };
    }

    // 10. Admissions Service
    get admissions() {
      return {
        submitApplication: async (applicationData) => {
          return await this.request('/admissions/apply', {
            method: 'POST',
            body: applicationData,
          });
        },
        checkStatus: async (applicationNumber, phone) => {
          const q = new URLSearchParams({ applicationNumber, phone }).toString();
          return await this.request(`/admissions/status?${q}`);
        },
        uploadDocument: async (admissionId, docData) => {
          return await this.request(`/admissions/${admissionId}/documents`, {
            method: 'POST',
            body: docData,
          });
        },
        getApplications: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/admissions${q ? '?' + q : ''}`);
        },
        getApplicationById: async (id) => {
          return await this.request(`/admissions/${id}`);
        },
        updateStatus: async (id, statusData) => {
          return await this.request(`/admissions/${id}/status`, {
            method: 'PATCH',
            body: statusData,
          });
        },
        enrollApplicant: async (id, enrollData = {}) => {
          return await this.request(`/admissions/${id}/enroll`, {
            method: 'POST',
            body: enrollData,
          });
        },
      };
    }

    // 11. Notifications Service
    get notifications() {
      return {
        getNotifications: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/management/notifications${q ? '?' + q : ''}`);
        },
        createNotification: async (data) => {
          return await this.request('/management/notifications', {
            method: 'POST',
            body: data,
          });
        },
        markRead: async (id) => {
          return await this.request(`/management/notifications/${id}/read`, {
            method: 'PATCH',
          });
        },
      };
    }

    // 12. Messages & Communication Service
    get messages() {
      return {
        sendMessage: async (data) => {
          return await this.request('/management/messages', {
            method: 'POST',
            body: data,
          });
        },
        getMessages: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/management/messages${q ? '?' + q : ''}`);
        },
      };
    }

    // 13. Student Exit & Department Clearances Service
    get transfers() {
      return {
        getExitRequests: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/transfers${q ? '?' + q : ''}`);
        },
        getExitRequestById: async (id) => {
          return await this.request(`/transfers/${id}`);
        },
        createExitRequest: async (data) => {
          return await this.request('/transfers', {
            method: 'POST',
            body: data,
          });
        },
        updateClearance: async (id, deptKey, clearanceData) => {
          return await this.request(`/transfers/${id}/clearance`, {
            method: 'PUT',
            body: { deptKey, ...clearanceData },
          });
        },
        requestOrApproveWaiver: async (id, waiverData) => {
          return await this.request(`/transfers/${id}/waiver`, {
            method: 'PUT',
            body: waiverData,
          });
        },
        principalDecision: async (id, decisionData) => {
          return await this.request(`/transfers/${id}/principal-decision`, {
            method: 'PUT',
            body: decisionData,
          });
        },
        issueTC: async (id, tcData) => {
          return await this.request(`/transfers/${id}/issue-tc`, {
            method: 'POST',
            body: tcData,
          });
        },
        amendTC: async (id, amendmentData) => {
          return await this.request(`/transfers/${id}/amend-tc`, {
            method: 'PUT',
            body: amendmentData,
          });
        },
        completeStudentExit: async (id) => {
          return await this.request(`/transfers/${id}/complete`, {
            method: 'POST',
          });
        },
      };
    }

    // 14. Timetable, Discipline, Events, Appointments, Settings & Platform Admin
    get timetable() {
      return {
        getToday: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/timetable/today${q ? '?' + q : ''}`);
        },
        getClassTimetable: async (className, params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/timetable/class/${encodeURIComponent(className)}${q ? '?' + q : ''}`);
        },
        saveTimetable: async (data) => this.request('/timetable', { method: 'POST', body: data }),
        getSubstitutions: async () => this.request('/timetable/substitutions'),
        createSubstitution: async (data) => this.request('/timetable/substitutions', { method: 'POST', body: data }),
      };
    }

    get discipline() {
      return {
        list: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/discipline${q ? '?' + q : ''}`);
        },
        create: async (data) => this.request('/discipline', { method: 'POST', body: data }),
        update: async (id, data) => this.request(`/discipline/${id}`, { method: 'PATCH', body: data }),
      };
    }

    get events() {
      return {
        list: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/events${q ? '?' + q : ''}`);
        },
        create: async (data) => this.request('/events', { method: 'POST', body: data }),
        update: async (id, data) => this.request(`/events/${id}`, { method: 'PATCH', body: data }),
        remove: async (id) => this.request(`/events/${id}`, { method: 'DELETE' }),
      };
    }

    get appointments() {
      return {
        list: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/appointments${q ? '?' + q : ''}`);
        },
        book: async (data) => this.request('/appointments/book', { method: 'POST', body: data }),
        updateStatus: async (id, data) => this.request(`/appointments/${id}/status`, { method: 'PATCH', body: data }),
      };
    }

    get settings() {
      return {
        getSchoolConfig: async (instId = 'INST-001') => this.request(`/schools/config/${encodeURIComponent(instId)}`),
        updateSchoolConfig: async (instId, section, data) =>
          this.request(`/schools/config/${encodeURIComponent(instId)}/${section}`, { method: 'PUT', body: data }),
      };
    }

    get platform() {
      return {
        getDashboard: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/platform/dashboard${q ? '?' + q : ''}`);
        },
        request: async (path, options = {}) => {
          const clean = path.startsWith('/') ? path : `/${path}`;
          const target = clean.startsWith('/platform') || clean.startsWith('/schools') ? clean : `/platform${clean}`;
          return await this.request(target, options);
        },
      };
    }
    get analytics() {
      return {
        track: async (eventType, module = 'GENERAL', action = '', durationMs = 0, metadata = {}) => {
          try {
            return await this.request('/analytics/track', {
              method: 'POST',
              body: { eventType, module, action, durationMs, metadata },
            });
          } catch (_) {}
        },
        getSummary: async () => this.request('/analytics/summary'),
      };
    }

    get system() {
      return {
        logClientError: async (message, stack = '', endpoint = '', errorType = 'CLIENT_ERROR', metadata = {}) => {
          try {
            return await this.request('/system/client-errors', {
              method: 'POST',
              body: { message, stack, endpoint, errorType, metadata },
            });
          } catch (_) {}
        },
        getErrorLogs: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/system/error-logs${q ? '?' + q : ''}`);
        },
      };
    }

    get users() {
      return {
        requestDeletion: async (reason, userId) =>
          this.request('/users/request-deletion', { method: 'POST', body: { reason, userId } }),
        getDeletionRequests: async () => this.request('/users/deletion-requests'),
        reviewDeletionRequest: async (id, decision, reviewNotes) =>
          this.request(`/users/deletion-requests/${id}/review`, { method: 'POST', body: { decision, reviewNotes } }),
      };
    }

    get compliance() {
      return {
        recordConsent: async (consentType, status = 'GRANTED', metadata = {}) =>
          this.request('/compliance/consent', { method: 'POST', body: { consentType, status, metadata } }),
        getMyConsents: async () => this.request('/compliance/consent/my'),
        getConsentLedger: async (params = {}) => {
          const q = new URLSearchParams(params).toString();
          return await this.request(`/compliance/consent/ledger${q ? '?' + q : ''}`);
        },
        getPolicies: async () => this.request('/compliance/policies'),
        publishPolicy: async (data) => this.request('/compliance/policies', { method: 'POST', body: data }),
        getThirdPartyDpas: async () => this.request('/compliance/dpas'),
        registerDpa: async (data) => this.request('/compliance/dpas', { method: 'POST', body: data }),
        getBreaches: async () => this.request('/compliance/breaches'),
        createBreach: async (data) => this.request('/compliance/breaches', { method: 'POST', body: data }),
        updateBreach: async (id, data) => this.request(`/compliance/breaches/${id}`, { method: 'PATCH', body: data }),
        exportDossier: async (userId) => this.request(`/compliance/dsr/export/${userId}`),
        getLicenses: async () => this.request('/compliance/licenses'),
      };
    }
  }

  // Export singleton instance
  const ApiClient = new ApiClientService();
  global.ApiClient = ApiClient;

  // Global browser error listeners for centralized telemetry
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function (event) {
      try {
        ApiClient.system.logClientError(
          event.message || 'Window Script Error',
          event.error ? event.error.stack : `${event.filename}:${event.lineno}`,
          window.location.pathname,
          'CLIENT_RUNTIME_ERROR'
        );
      } catch (_) {}
    });

    window.addEventListener('unhandledrejection', function (event) {
      try {
        ApiClient.system.logClientError(
          event.reason ? (event.reason.message || String(event.reason)) : 'Unhandled Promise Rejection',
          event.reason ? event.reason.stack : '',
          window.location.pathname,
          'CLIENT_PROMISE_REJECTION'
        );
      } catch (_) {}
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
  }
})(typeof window !== 'undefined' ? window : this);
