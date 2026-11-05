const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: PLATFORM ADMIN EXPANDED SIDEBAR & VIEW ARCHITECTURE ===\n');

const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');

// CHECK 1: Five Distinct Nav Sections in HTML
console.log('[CHECK 1] Verifying 5 Sidebar Categories in HTML...');
const expectedSections = [
  'CORE OPERATIONS',
  'ACCESS & SECURITY',
  'PLATFORM INFRASTRUCTURE',
  'PLATFORM SETTINGS',
  'SCHOOL GATEWAYS'
];
expectedSections.forEach(section => {
  assert.ok(html.includes(section), `Sidebar must contain section header: ${section}`);
  console.log(`  ✓ Section "${section}" verified`);
});

// CHECK 2: All 15 Links in Sidebar
console.log('\n[CHECK 2] Verifying 15 Sidebar Navigation Links...');
const expectedLinks = [
  'data-view="dashboard"',
  'data-view="institutions"',
  'data-view="config"',
  'data-view="onboarding"',
  'data-view="users"',
  'data-view="roles"',
  'data-view="audit"',
  'data-view="security-monitoring"',
  'data-view="subscription"',
  'data-view="health"',
  'data-view="backups"',
  'data-view="integrations"',
  'data-view="support"',
  'data-view="domains-email"',
  'data-view="settings"',
  'data-view="policies"',
  'href="/management"',
  'href="/teacher"',
  'href="/"'
];
expectedLinks.forEach(link => {
  assert.ok(html.includes(link), `Sidebar must contain link with ${link}`);
  console.log(`  ✓ Link [${link}] verified`);
});

// CHECK 3: All 6 New Views in HTML
console.log('\n[CHECK 3] Verifying 6 New View DOM containers in HTML...');
const expectedViews = [
  'id="view-onboarding"',
  'id="view-security-monitoring"',
  'id="view-backups"',
  'id="view-integrations"',
  'id="view-domains-email"',
  'id="view-policies"'
];
expectedViews.forEach(v => {
  assert.ok(html.includes(v), `View container #${v} must exist in HTML`);
  console.log(`  ✓ View container [${v}] verified`);
});

// CHECK 4: platform-admin.js titles mapping
console.log('\n[CHECK 4] Verifying Titles dictionary in platform-admin.js...');
const expectedTitles = [
  "'onboarding': 'Institution Onboarding & Migration'",
  "'roles': 'Role Templates & Permissions'",
  "'security-monitoring': 'Security & Access Monitoring'",
  "'backups': 'Backups & Recovery'",
  "'integrations': 'Integrations & API Management'",
  "'domains-email': 'Domains, Email & Notifications'",
  "'policies': 'Platform Policies & Data Retention'"
];
expectedTitles.forEach(title => {
  assert.ok(js.includes(title), `Titles dictionary must contain ${title}`);
  console.log(`  ✓ Title mapping [${title}] verified`);
});

// CHECK 5: Public API Exports
console.log('\n[CHECK 5] Verifying Public API Exports in platform-admin.js...');
const expectedExports = [
  'triggerManualBackup',
  'terminateAllSuspiciousSessions',
  'verifyDnsStatus',
  'savePlatformPolicies'
];
expectedExports.forEach(fn => {
  assert.ok(js.includes(fn), `platformApp must export ${fn}`);
  console.log(`  ✓ Exported function [${fn}] verified`);
});

console.log('\n=============================================================');
console.log('ALL PLATFORM ADMIN EXPANDED SIDEBAR TESTS PASSED 100%!');
console.log('=============================================================\n');

