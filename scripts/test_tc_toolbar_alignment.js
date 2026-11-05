const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: TC & TRANSFERS TOOLBAR ALIGNMENT & RESPONSIVE GRID ===\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');

// CHECK 1: Enterprise 2-tier Toolbar Architecture
console.log('[CHECK 1] Verifying 2-tier container structure in HTML...');
assert.ok(html.includes('class="transfers-toolbar-container"'), 'transfers-toolbar-container must exist');
assert.ok(html.includes('class="transfers-filter-grid"'), 'transfers-filter-grid must exist for Tier 1');
assert.ok(html.includes('class="transfers-governance-row"'), 'transfers-governance-row must exist for Tier 2');
console.log('  ✓ 2-tier architecture verified');

// CHECK 2: All 5 Filter Controls in Tier 1 Grid
console.log('\n[CHECK 2] Verifying all 5 filter controls in Tier 1 Grid...');
const requiredFilterIds = [
  'tcSearchInput',
  'tcClearSearchBtn',
  'tcClassFilter',
  'tcAcademicClearanceFilter',
  'tcFinancialClearanceFilter',
  'tcApprovalStatusFilter'
];

requiredFilterIds.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Filter control #${id} must exist in HTML`);
  console.log(`  ✓ Filter element #${id} verified`);
});

// CHECK 3: Governance Row Elements in Tier 2
console.log('\n[CHECK 3] Verifying Tier 2 Governance Indicators and Actions...');
assert.ok(html.includes('id="tcFilterCountDisplay"'), '#tcFilterCountDisplay must exist');
assert.ok(html.includes('id="tcFilteredCount"'), '#tcFilteredCount must exist');
assert.ok(html.includes('id="tcTotalCount"'), '#tcTotalCount must exist');
assert.ok(html.includes('portalApp.resetTransfersFilters()'), 'Reset Filters button verified');
assert.ok(html.includes('portalApp.exportTransfersCSV()'), 'Export Register button verified');
assert.ok(html.includes('portalApp.printTransfersTable()'), 'Print Register button verified');
console.log('  ✓ All Tier 2 elements and actions verified');

// CHECK 4: CSS Grid & Flex Properties
console.log('\n[CHECK 4] Verifying CSS Grid & Responsive Rules in portal.css...');
assert.ok(css.includes('.transfers-toolbar-container'), '.transfers-toolbar-container rule must exist in portal.css');
assert.ok(css.includes('.transfers-filter-grid'), '.transfers-filter-grid rule must exist in portal.css');
assert.ok(css.includes('grid-template-columns: minmax(220px, 1.8fr) repeat(4, minmax(130px, 1fr))'), 'CSS Grid template columns defined');
assert.ok(css.includes('.transfers-governance-row'), '.transfers-governance-row rule must exist in portal.css');
console.log('  ✓ CSS Grid and governance styling verified');

console.log('\n======================================================');
console.log('ALL TC TOOLBAR ALIGNMENT TESTS PASSED 100%!');
console.log('======================================================\n');
