const fs = require('fs');

console.log('=== SRI VIDYA ERP: NAVIGATION TYPOGRAPHY VERIFICATION ===');

const css = fs.readFileSync('frontend/css/portal.css', 'utf8');
const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');

// 1. Verify CSS rules
const checks = [
  '#studentsTabStrip .tab-btn',
  'font-size: 14.5px !important;',
  'font-weight: 650 !important;',
  'color: #17233f !important;',
  '#studentsTabStrip .tab-btn.active',
  'color: #214dd8 !important;',
  'background: #ffffff !important;',
  'font-weight: 700 !important;',
  '#studentsTabStrip .tab-btn i',
  '#studentsTabStrip .tab-btn.active i',
  'gap: 8.5px !important;'
];

let failedCss = [];
checks.forEach(c => {
  if (!css.includes(c)) {
    failedCss.push(c);
  }
});

if (failedCss.length > 0) {
  console.error('FAIL: Missing CSS rules:', failedCss);
  process.exit(1);
} else {
  console.log('PASS: All typography and color rules exist in portal.css');
}

// 2. Verify HTML buttons
const requiredButtons = [
  { sub: 'profiles', label: 'Student Profiles', icon: 'fa-address-card' },
  { sub: 'documents', label: 'Student Documents', icon: 'fa-folder-tree' },
  { sub: 'admissions', label: 'Admissions', icon: 'fa-user-plus' },
  { sub: 'transfers', label: 'Transfers (TC)', icon: 'fa-file-contract' },
  { sub: 'performance', label: 'Student Performance', icon: 'fa-chart-line' },
  { sub: 'parents', label: 'Parent / Guardian Records', icon: 'fa-users' }
];

let failedHtml = [];
requiredButtons.forEach(b => {
  if (!html.includes(`data-sub="${b.sub}"`)) failedHtml.push(`Missing data-sub="${b.sub}"`);
  if (!html.includes(b.label)) failedHtml.push(`Missing label "${b.label}"`);
  if (!html.includes(b.icon)) failedHtml.push(`Missing icon "${b.icon}"`);
  if (!html.includes(`portalApp.switchSubTab('students', '${b.sub}')`)) failedHtml.push(`Missing onclick for "${b.sub}"`);
});

if (failedHtml.length > 0) {
  console.error('FAIL: Missing HTML elements:', failedHtml);
  process.exit(1);
} else {
  console.log('PASS: All 6 navigation menu items, icons, and event handlers are intact in index.html');
}

console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
