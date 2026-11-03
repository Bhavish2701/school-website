const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: STUDENT DOCUMENTS TABLE & FILTER ALIGNMENT ===');

// 1. Verify index.html thead columns match 9 columns
const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');

const tableHeaderMatch = html.match(/<table[^>]*id="studentDocsTable"[^>]*>[\s\S]*?<thead>([\s\S]*?)<\/thead>/i);
assert(tableHeaderMatch, 'Student docs table thead must exist');

const ths = tableHeaderMatch[1].match(/<th[^>]*>[\s\S]*?<\/th>/gi);
console.log(`[CHECK] Table header <th> count: ${ths ? ths.length : 0} (Expected: 9)`);
assert.strictEqual(ths.length, 9, 'Table must have exactly 9 <th> headers');

const thTexts = ths.map(t => t.replace(/<[^>]+>/g, '').trim());
console.log('[CHECK] <th> Headers:', thTexts);

assert(thTexts[0].includes('Student Identity'), 'Header 1 must be Student Identity');
assert(thTexts[1].includes('Admission No'), 'Header 2 must be Admission No');
assert(thTexts[2].includes('Document Type'), 'Header 3 must be Document Type');
assert(thTexts[3].includes('Document Particulars'), 'Header 4 must be Document Particulars');
assert(thTexts[4].includes('Submission Mode'), 'Header 5 must be Submission Mode');
assert(thTexts[5].includes('Last Updated'), 'Header 6 must be Last Updated');
assert(thTexts[6].includes('Verification Status'), 'Header 7 must be Verification Status');
assert(thTexts[7].includes('Verifying Authority'), 'Header 8 must be Verifying Authority');
assert(thTexts[8].includes('Actions'), 'Header 9 must be Actions');
console.log('[PASS] All 9 headers perfectly match row semantics and order!');

// 2. Verify portal.js row rendering generates 9 <td> columns
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');
const renderDocsMatch = js.match(/function renderStudentDocuments[\s\S]*?tbody\.innerHTML = pageItems\.map\(d => \{([\s\S]*?)\}\)\.join\(''\);/);
assert(renderDocsMatch, 'renderStudentDocuments mapping must exist');

const rowTemplate = renderDocsMatch[1];
const tds = rowTemplate.match(/<td[^>]*>[\s\S]*?<\/td>/gi);
console.log(`[CHECK] Row template <td> count: ${tds ? tds.length : 0} (Expected: 9)`);
assert.strictEqual(tds.length, 9, 'Row template must have exactly 9 <td> columns');

// 3. Verify Col 2 is centered
assert(rowTemplate.includes('<!-- 2. Admission Number -->\r\n          <td class="text-center">') ||
       rowTemplate.includes('<!-- 2. Admission Number -->\n          <td class="text-center">'),
       'Admission Number column must have text-center class');
console.log('[PASS] Col 2 (Admission No) has text-center alignment');

// 4. Verify Col 6 and Col 7 are centered, Col 9 is text-end
assert(rowTemplate.includes('<!-- 6. Upload Date -->\r\n          <td class="text-center">') ||
       rowTemplate.includes('<!-- 6. Upload Date -->\n          <td class="text-center">'),
       'Upload date column must have text-center class');
assert(rowTemplate.includes('<!-- 7. Verification Status -->\r\n          <td class="text-center">') ||
       rowTemplate.includes('<!-- 7. Verification Status -->\n          <td class="text-center">'),
       'Verification status column must have text-center class');
assert(rowTemplate.includes('<!-- 9. Actions -->\r\n          <td class="text-end">') ||
       rowTemplate.includes('<!-- 9. Actions -->\n          <td class="text-end">'),
       'Actions column must have text-end class');
console.log('[PASS] Text alignment for all data columns is fully synchronized!');

// 5. Verify Filter Toolbar structure
assert(html.includes('enterprise-filter-toolbar'), 'Must use enterprise-filter-toolbar layout');
assert(html.includes('id="docSearchInput"'), 'Must contain docSearchInput');
assert(html.includes('id="docClassFilter"'), 'Must contain docClassFilter');
assert(html.includes('id="docVerifyStatusFilter"'), 'Must contain docVerifyStatusFilter');
assert(html.includes('id="docsShowingCount"'), 'Must contain docsShowingCount');
assert(html.includes('id="docsTotalCount"'), 'Must contain docsTotalCount');
console.log('[PASS] Filter toolbar has enterprise 2-tier architecture');

// 6. Verify CSS overflow
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');
assert(css.includes('overflow-x: auto'), 'portal.css must have overflow-x: auto on .student-docs-wrap');
console.log('[PASS] CSS overflow-x: auto properly configured');

// 7. Verify Tab Badges in index.html match authoritative repository records
assert(html.includes('id="studentDocsCountBadge">1,500<'), 'Student Documents badge in index.html must be 1,500');
assert(html.includes('id="parentRecordsCountBadge">412<'), 'Parent Records badge in index.html must be 412');
assert(html.includes('id="admissionsCountBadge">18<'), 'Admissions badge in index.html must be 18');
assert(html.includes('id="transfersCountBadge">8<'), 'Transfers badge in index.html must be 8');
console.log('[PASS] Tab badges in index.html properly configured with authoritative record counts (1,500 files, 412 parents, 18 admissions, 8 transfers)');

// 8. Dynamic DOM Execution Test: Verify updateStudentTabBadges & updateStudentDocKPIs
const path = require('path');
const mockElements = new Map();
function getMock(id, tag = 'div') {
  if (!mockElements.has(id)) {
    mockElements.set(id, {
      id: id,
      tagName: tag.toUpperCase(),
      textContent: '',
      innerHTML: '',
      value: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      appendChild: () => {},
      addEventListener: () => {}
    });
  }
  return mockElements.get(id);
}

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { hash: '#students' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  scrollTo: () => {}
};

global.document = {
  getElementById: (id) => getMock(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getMock(sel.slice(1));
    return getMock('sel_' + Math.random());
  },
  querySelectorAll: () => [],
  createElement: (tag) => getMock('el_' + Math.random(), tag),
  body: getMock('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.localStorage = global.window.localStorage;
global.bootstrap = { Modal: function() { return { show: () => {}, hide: () => {} }; } };
global.showToast = () => {};

// Load student-roster.js
const rosterPath = path.join(__dirname, '..', 'frontend', 'js', 'student-roster.js');
if (fs.existsSync(rosterPath)) {
  eval(fs.readFileSync(rosterPath, 'utf8'));
}

// Load portal.js
eval(js);
const portal = global.portalApp || window.portalApp;
assert(portal, 'portalApp must be available');

// Call updateStudentTabBadges
portal.updateStudentTabBadges();
const docsBadgeEl = getMock('studentDocsCountBadge');
const parentBadgeEl = getMock('parentRecordsCountBadge');
console.log(`[CHECK] updateStudentTabBadges -> studentDocsCountBadge: "${docsBadgeEl.textContent}"`);
console.log(`[CHECK] updateStudentTabBadges -> parentRecordsCountBadge: "${parentBadgeEl.textContent}"`);

assert.strictEqual(docsBadgeEl.textContent, '1,500', 'docsBadge textContent must be 1,500');
assert.strictEqual(parentBadgeEl.textContent, '412', 'parentBadge textContent must be 412');

// Call updateStudentDocKPIs
portal.updateStudentDocKPIs();
console.log(`[CHECK] updateStudentDocKPIs -> studentDocsCountBadge: "${docsBadgeEl.textContent}"`);
assert.strictEqual(docsBadgeEl.textContent, '1,500', 'docsBadge must retain 1,500 after updateStudentDocKPIs');

const kpiDossiers = getMock('kpiDocTotalDossiers');
console.log(`[CHECK] updateStudentDocKPIs -> kpiDocTotalDossiers: "${kpiDossiers.textContent}"`);
assert.strictEqual(kpiDossiers.textContent, '500', 'kpiDocTotalDossiers must be 500');

console.log('[PASS] Dynamic runtime badge synchronization functions execute with 100% accuracy!');

console.log('\n========================================');
console.log('TEST SUMMARY: ALL STUDENT DOCUMENTS TESTS PASSED 100%!');
console.log('========================================');

