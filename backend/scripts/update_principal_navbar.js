const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
const cssPath = path.join(__dirname, '../../frontend/css/portal.css');

console.log('--- Updating Principal Dashboard Top Navigation Bar ---');

// 1. Update HTML
let html = fs.readFileSync(htmlPath, 'utf8');

// Target the header block in administration-portal/index.html
const oldHeaderStart = '<header class="portal-header">';
const oldHeaderEnd = '</header>';

const headerStartIdx = html.indexOf(oldHeaderStart);
if (headerStartIdx === -1) {
  console.error('Could not find <header class="portal-header"> in index.html');
  process.exit(1);
}

const headerEndIdx = html.indexOf(oldHeaderEnd, headerStartIdx);
if (headerEndIdx === -1) {
  console.error('Could not find </header> in index.html');
  process.exit(1);
}

const newHeaderHtml = `<header class="portal-header">
        <div class="header-left">
          <button class="mobile-toggle-btn" id="mobileSidebarToggle" aria-label="Toggle Navigation Menu">
            <i class="fa-solid fa-bars"></i>
          </button>

          <div class="header-breadcrumb">
            <span class="crumb-school">Sri Vidya E.M High School</span>
            <i class="fa-solid fa-chevron-right crumb-sep"></i>
            <span class="crumb-page" id="currentPageCrumb">Principal Dashboard</span>
          </div>

          <!-- Universal Instant Search -->
          <div class="header-search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="portalUniversalSearch"
              placeholder="Search students, admission no, teachers, roll nos..." aria-label="Search">
            <span class="search-shortcut">⌘K</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Authenticated Role Indicator Badge (Read-Only) -->
          <div class="role-indicator-badge" id="headerRoleBadgeWrap" title="Authenticated Institutional Role">
            <span class="role-indicator-dot"></span>
            <i class="fa-solid fa-crown" id="headerRoleIcon"></i>
            <span class="role-indicator-text" id="headerRoleLabel">Principal</span>
          </div>

          <!-- Dark / Light Theme Toggle -->
          <button class="theme-toggle-btn" id="themeToggleBtn" title="Toggle Dark / Light Mode"
            aria-label="Toggle Theme">
            <i class="fa-solid fa-moon theme-icon" id="themeIcon"></i>
          </button>

          <!-- Notification Bell -->
          <div class="notification-dropdown-wrapper">
            <button class="header-action-btn" id="notifBellBtn" title="Pending Notifications"
              aria-label="Notifications">
              <i class="fa-regular fa-bell"></i>
              <span class="notif-badge" id="headerNotifCount" style="display:none;">0</span>
            </button>
            <div class="notif-flyout" id="notifFlyout">
              <div class="notif-header">
                <span class="notif-title">Notifications</span>
                <span class="notif-mark" id="markAllRead">Mark all read</span>
              </div>
              <div class="notif-list">
                <div class="notif-item unread">
                  <div class="notif-dot"></div>
                  <div class="notif-body">
                    <strong>New Transfer Certificate Request</strong>
                    <p>Roll #1042 (Class IX-A) pending principal signature</p>
                    <small>12 mins ago</small>
                  </div>
                </div>
                <div class="notif-item unread">
                  <div class="notif-dot"></div>
                  <div class="notif-body">
                    <strong>Leave Application: Science Faculty</strong>
                    <p>K. Rajesh (Physics) requested 2 days casual leave</p>
                    <small>35 mins ago</small>
                  </div>
                </div>
                <div class="notif-item unread">
                  <div class="notif-dot"></div>
                  <div class="notif-body">
                    <strong>Online Admissions Surge</strong>
                    <p>18 new admission forms submitted today for 2025-26</p>
                    <small>2 hours ago</small>
                  </div>
                </div>
                <div class="notif-item">
                  <div class="notif-body">
                    <strong>Daily Fee Collection Target</strong>
                    <p>87% of monthly dues collected. ₹3.8L pending.</p>
                    <small>Yesterday</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vertical Divider Separator -->
          <div class="header-divider" aria-hidden="true"></div>

          <!-- Quick Return to Public Website -->
          <a href="index.html" class="btn-back-public" title="Open Public Website">
            <i class="fa-solid fa-globe"></i>
            <span>Public Site</span>
          </a>

          <!-- Professional Logout Button -->
          <button type="button" class="btn-header-signout" data-action="portal-logout"
            onclick="PortalAuth.logout('management')" title="Sign out of Principal Dashboard">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </header>`;

html = html.substring(0, headerStartIdx) + newHeaderHtml + html.substring(headerEndIdx + oldHeaderEnd.length);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✓ Successfully updated header in index.html (removed portals hub, added header-divider & enhanced logout)');

// 2. Update CSS in portal.css
let css = fs.readFileSync(cssPath, 'utf8');

// Find boundaries of header styling
const cssStartMarker = '/* Portal Sticky Header */';
const cssEndMarker = '/* Role Selector Dropdown */';

const cssStartIdx = css.indexOf(cssStartMarker);
const cssEndIdx = css.indexOf(cssEndMarker);

if (cssStartIdx === -1 || cssEndIdx === -1) {
  console.error('Could not find header CSS block in portal.css');
  process.exit(1);
}

const newHeaderCss = `/* Portal Sticky Header */
.portal-header {
  height: var(--header-height);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.75rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
}

.mobile-toggle-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-main);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: color 0.2s ease;
}

.mobile-toggle-btn:hover {
  color: var(--color-primary);
}

.header-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.crumb-school {
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.crumb-sep {
  font-size: 0.65rem;
  color: #94A3B8;
}

.crumb-page {
  font-weight: 700;
  color: var(--color-text-dark);
  letter-spacing: -0.01em;
}

.header-search {
  position: relative;
  width: 330px;
  max-width: 100%;
  flex-shrink: 1;
}

.header-search input {
  width: 100%;
  height: 38px;
  padding: 0 2.25rem 0 2.35rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  color: var(--color-text-main);
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.header-search input::placeholder {
  color: #94A3B8;
}

.header-search input:hover {
  background: var(--color-bg-surface);
  border-color: #CBD5E1;
}

.header-search input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

.header-search .search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #94A3B8;
  pointer-events: none;
}

.search-shortcut {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 0.12rem 0.35rem;
  border-radius: var(--radius-sm);
  pointer-events: none;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Authenticated Role Indicator Badge (Read-Only) */
.role-indicator-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  height: 38px;
  padding: 0 0.95rem;
  background: rgba(29, 78, 216, 0.08);
  border: 1px solid rgba(29, 78, 216, 0.22);
  border-radius: var(--radius-full);
  user-select: none;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.role-indicator-badge .role-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  display: inline-block;
  flex-shrink: 0;
}

.role-indicator-badge i {
  color: var(--color-primary);
  font-size: 0.85rem;
  line-height: 1;
}

.role-indicator-badge .role-indicator-text {
  font-family: var(--font-subheading);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.25px;
  white-space: nowrap;
  line-height: 1;
}

[data-theme="dark"] .role-indicator-badge {
  background: rgba(30, 58, 138, 0.25);
  border-color: rgba(96, 165, 250, 0.3);
}

[data-theme="dark"] .role-indicator-badge .role-indicator-text,
[data-theme="dark"] .role-indicator-badge i {
  color: #93C5FD;
}

`;

css = css.substring(0, cssStartIdx) + newHeaderCss + css.substring(cssEndIdx);

// Also update .btn-back-public and add .btn-header-signout and .header-divider
const publicBtnMarker = '.btn-back-public {';
const publicBtnStart = css.indexOf(publicBtnMarker);
if (publicBtnStart !== -1) {
  const publicBlockEnd = css.indexOf('/* ==========================================================================\n   PORTAL VIEWS & CONTENT AREA', publicBtnStart);
  if (publicBlockEnd !== -1) {
    const newActionsCss = `.header-divider {
  width: 1px;
  height: 22px;
  background-color: var(--color-border);
  margin: 0 0.15rem;
  flex-shrink: 0;
}

.btn-back-public {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: 38px;
  padding: 0 1rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-main);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: inherit;
  line-height: 1;
}

.btn-back-public i {
  font-size: 0.85rem;
  color: #64748B;
  transition: color 0.2s ease;
  line-height: 1;
}

.btn-back-public span {
  line-height: 1;
}

.btn-back-public:hover {
  background: var(--color-primary-subtle);
  border-color: rgba(29, 78, 216, 0.35);
  color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(29, 78, 216, 0.08);
}

.btn-back-public:hover i {
  color: var(--color-primary);
}

/* Redesigned Institutional Header Logout Button */
.btn-header-signout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: 38px;
  padding: 0 1rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-main);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  outline: none;
  line-height: 1;
}

.btn-header-signout i {
  font-size: 0.85rem;
  color: #64748B;
  transition: color 0.2s ease;
  line-height: 1;
}

.btn-header-signout span {
  line-height: 1;
}

.btn-header-signout:hover {
  background: #FEF2F2;
  border-color: rgba(239, 68, 68, 0.4);
  color: #DC2626;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.08);
}

.btn-header-signout:hover i {
  color: #DC2626;
}

.btn-header-signout:active {
  transform: translateY(1px);
}

/* Responsive Top Bar Adjustments */
@media (max-width: 1200px) {
  .header-search {
    width: 250px;
  }
}

@media (max-width: 992px) {
  .crumb-school,
  .crumb-sep {
    display: none;
  }
  .header-search {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .portal-header {
    padding: 0 1rem;
  }
  .header-left {
    gap: 0.75rem;
  }
  .header-search {
    display: none;
  }
  .header-right {
    gap: 0.5rem;
  }
  .btn-back-public span,
  .btn-header-signout span {
    display: none;
  }
  .btn-back-public,
  .btn-header-signout {
    padding: 0;
    width: 38px;
    height: 38px;
    justify-content: center;
  }
  .btn-back-public i,
  .btn-header-signout i {
    margin: 0;
  }
  .header-divider {
    display: none;
  }
}

@media (max-width: 480px) {
  .role-indicator-badge {
    padding: 0 0.6rem;
  }
  .role-indicator-badge .role-indicator-text {
    display: none;
  }
}

/* Dark Theme Overrides for Top Control Bar */
[data-theme="dark"] .portal-header {
  background-color: #0F172A;
  border-bottom-color: #1E293B;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .crumb-school {
  color: #94A3B8;
}

[data-theme="dark"] .crumb-sep {
  color: #64748B;
}

[data-theme="dark"] .crumb-page {
  color: #F8FAFC;
}

[data-theme="dark"] .header-search input {
  background: #1E293B;
  border-color: #334155;
  color: #F8FAFC;
}

[data-theme="dark"] .header-search input:hover {
  background: #1E293B;
  border-color: #475569;
}

[data-theme="dark"] .header-search input:focus {
  background: #0F172A;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .search-shortcut {
  background: #0F172A;
  border-color: #334155;
  color: #94A3B8;
}

[data-theme="dark"] .theme-toggle-btn,
[data-theme="dark"] .header-action-btn {
  background: #1E293B;
  border-color: #334155;
  color: #CBD5E1;
}

[data-theme="dark"] .theme-toggle-btn:hover,
[data-theme="dark"] .header-action-btn:hover {
  background: #1E3A8A;
  border-color: #60A5FA;
  color: #93C5FD;
}

[data-theme="dark"] .header-divider {
  background-color: #334155;
}

[data-theme="dark"] .btn-back-public {
  background: #1E293B;
  border-color: #334155;
  color: #E2E8F0;
}

[data-theme="dark"] .btn-back-public i {
  color: #94A3B8;
}

[data-theme="dark"] .btn-back-public:hover {
  background: #1E3A8A;
  border-color: #60A5FA;
  color: #93C5FD;
}

[data-theme="dark"] .btn-back-public:hover i {
  color: #93C5FD;
}

[data-theme="dark"] .btn-header-signout {
  background: #1E293B;
  border-color: #334155;
  color: #E2E8F0;
}

[data-theme="dark"] .btn-header-signout i {
  color: #94A3B8;
}

[data-theme="dark"] .btn-header-signout:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
  color: #F87171;
}

[data-theme="dark"] .btn-header-signout:hover i {
  color: #F87171;
}

`;
    css = css.substring(0, publicBtnStart) + newActionsCss + css.substring(publicBlockEnd);
  }
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('✓ Successfully updated CSS in portal.css');
