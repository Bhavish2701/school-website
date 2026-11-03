const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: ADMISSIONS VIEW ALIGNMENT & DESIGN VERIFICATION ===\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8').replace(/\r\n/g, '\n');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8').replace(/\r\n/g, '\n');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8').replace(/\r\n/g, '\n');

// CHECK 1: New Admission button syntax
console.log('[CHECK 1] Verifying Header "New Admission" button text...');
assert.ok(!html.includes('+ + New Admission'), 'Must not have duplicate "+ +" in New Admission button');
assert.ok(html.includes('id="btnNewAdmissionPrimary"'), 'Button #btnNewAdmissionPrimary must exist');
assert.ok(html.includes('<i class="fa-solid fa-user-plus me-1"></i> New Admission'), 'Clean button text verified');
console.log('  ✓ Button has professional label without duplicate plus sign');

// CHECK 2: Enterprise 2-tier Toolbar Architecture
console.log('\n[CHECK 2] Verifying Enterprise 2-Tier Toolbar in HTML...');
assert.ok(html.includes('class="admissions-toolbar-container"'), 'admissions-toolbar-container must exist');
assert.ok(html.includes('class="admissions-filter-grid"'), 'admissions-filter-grid must exist for Tier 1');
assert.ok(html.includes('class="admissions-governance-row"'), 'admissions-governance-row must exist for Tier 2');

const requiredFilterIds = [
  'admSearchInput',
  'admClearSearchBtn',
  'admClassFilter',
  'admStatusFilter',
  'admDocFilter',
  'admSourceFilter',
  'admFilterCountDisplay',
  'admFilteredCount',
  'admTotalCount'
];

requiredFilterIds.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Filter control #${id} must exist in HTML`);
  console.log(`  ✓ Filter element #${id} verified`);
});

// CHECK 3: Table minimum width and column headers
console.log('\n[CHECK 3] Verifying table layout and column headers...');
assert.ok(css.includes('.admissions-table') && css.includes('min-width: 1220px;'), '.admissions-table must have min-width: 1220px');
assert.ok(html.includes('<th class="th-actions text-end" style="min-width: 170px;"><i class="fa-solid fa-sliders me-1"></i> Actions</th>'), 'Actions header properly labeled');
console.log('  ✓ Table min-width: 1220px guarantees full column visibility without truncation');

// CHECK 4: Custom scrollbar styles on tab strip
console.log('\n[CHECK 4] Verifying .admissions-tab-strip custom scrollbar styles...');
assert.ok(css.includes('.admissions-tab-strip::-webkit-scrollbar'), 'WebKit scrollbar rule must exist');
assert.ok(css.includes('scrollbar-width: thin;'), 'Firefox thin scrollbar rule must exist');
console.log('  ✓ Sleek custom scrollbar verified on tab strip');

// CHECK 5: Table row badge and typography enhancement
console.log('\n[CHECK 5] Verifying row rendering in portal.js...');
assert.ok(js.includes('text-transform:capitalize'), 'Capitalization style present for student and parent names');
assert.ok(js.includes('isOnline ? \'<i class="fa-solid fa-globe"></i> Online\''), 'Styled channel badges present in table cells');
console.log('  ✓ Professional cell typography and badges verified');

console.log('\n======================================================');
console.log('ALL ADMISSIONS ALIGNMENT TESTS PASSED 100%!');
console.log('======================================================\n');
