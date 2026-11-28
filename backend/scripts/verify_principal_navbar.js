const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
const cssPath = path.join(__dirname, '../../frontend/css/portal.css');

console.log('--- Sri Vidya Principal Dashboard Top Navigation Bar Verification ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.includes('<header class="portal-header">'), 'portal-header element exists');

const headerMatch = html.match(/<header class="portal-header">([\s\S]*?)<\/header>/);
assert(headerMatch !== null, 'Found <header class="portal-header">...</header>');
const headerContent = headerMatch ? headerMatch[1] : '';

assert(!headerContent.includes('portalsHubWrapper'), 'Portals hub wrapper removed from header');
assert(!headerContent.includes('btnPortalsHub'), 'btnPortalsHub removed from header');
assert(!headerContent.includes('togglePortalsHub'), 'togglePortalsHub click handler removed from header');

assert(headerContent.includes('mobileSidebarToggle'), 'Mobile sidebar toggle exists');
assert(headerContent.includes('header-breadcrumb'), 'header-breadcrumb container exists');
assert(headerContent.includes('crumb-school'), 'crumb-school exists');
assert(headerContent.includes('crumb-page'), 'crumb-page exists with id currentPageCrumb');
assert(headerContent.includes('header-search'), 'header-search container exists');
assert(headerContent.includes('portalUniversalSearch'), 'portalUniversalSearch input exists');
assert(headerContent.includes('search-shortcut'), '⌘K shortcut indicator exists');

assert(headerContent.includes('role-indicator-badge'), 'Principal role indicator badge exists');
assert(headerContent.includes('headerRoleLabel'), 'headerRoleLabel exists');
assert(headerContent.includes('themeToggleBtn'), 'Theme toggle button exists');
assert(headerContent.includes('themeIcon'), 'themeIcon element exists');
assert(headerContent.includes('notification-dropdown-wrapper'), 'Notification dropdown wrapper exists');
assert(headerContent.includes('notifBellBtn'), 'notifBellBtn button exists');
assert(headerContent.includes('headerNotifCount'), 'headerNotifCount badge exists');
assert(headerContent.includes('notifFlyout'), 'notifFlyout dropdown exists');
assert(headerContent.includes('header-divider'), 'Institutional header-divider separator exists');
assert(headerContent.includes('btn-back-public'), 'btn-back-public link exists');
assert(headerContent.includes('btn-header-signout'), 'btn-header-signout button exists');
assert(headerContent.includes('PortalAuth.logout'), 'PortalAuth.logout handler preserved on signout button');

const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('.portal-header {'), '.portal-header CSS exists');
assert(css.includes('.header-left {'), '.header-left CSS exists');
assert(css.includes('.header-breadcrumb {'), '.header-breadcrumb CSS exists');
assert(css.includes('.header-search {'), '.header-search CSS exists');
assert(css.includes('.header-search input {'), '.header-search input CSS exists');
assert(css.includes('.header-right {'), '.header-right CSS exists');
assert(css.includes('.role-indicator-badge {'), '.role-indicator-badge CSS exists');
assert(css.includes('.header-divider {'), '.header-divider CSS exists');
assert(css.includes('.btn-back-public {'), '.btn-back-public CSS exists');
assert(css.includes('.btn-header-signout {'), '.btn-header-signout CSS exists');

assert(css.includes('.btn-header-signout:hover {'), '.btn-header-signout hover state defined');
assert(css.includes('#FEF2F2') || css.includes('rgba(239, 68, 68'), 'Logout button subtle red hover background defined');
assert(css.includes('#DC2626') || css.includes('--color-accent-red'), 'Logout button red text/icon hover defined');

assert(css.includes('height: 38px'), 'Standard 38px control height applied');

assert(css.includes('@media (max-width: 768px)'), 'Mobile responsive rules defined for navbar');
assert(css.includes('@media (max-width: 992px)'), 'Tablet responsive rules defined for navbar');

assert(css.includes('[data-theme="dark"] .portal-header'), 'Dark mode header styling defined');
assert(css.includes('[data-theme="dark"] .btn-header-signout'), 'Dark mode logout button styling defined');

console.log(`\nVerification complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ All Principal navbar redesign tests passed successfully!');
}
