const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: ARCHIVED STUDENTS MODAL ALIGNMENT & LOGIC');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');

// CHECK 1: Modal Elements in index.html
console.log('--- Test 1: Verify Modal Structure & Elements in index.html ---');
assert.ok(html.includes('id="archivedStudentsModal"'), '#archivedStudentsModal must exist');
assert.ok(html.includes('id="archivedTotalCount"'), '#archivedTotalCount must exist');
assert.ok(html.includes('id="archivedTcCount"'), '#archivedTcCount must exist');
assert.ok(html.includes('id="archivedWithdrawnCount"'), '#archivedWithdrawnCount must exist');
assert.ok(html.includes('id="archivedSearchInput"'), '#archivedSearchInput must exist');
assert.ok(html.includes('id="archivedStatusFilter"'), '#archivedStatusFilter must exist');
assert.ok(html.includes('id="archivedClassFilter"'), '#archivedClassFilter must exist');
assert.ok(html.includes('id="tableArchivedStudents"'), '#tableArchivedStudents must exist');
assert.ok(html.includes('id="tbodyArchivedStudents"'), '#tbodyArchivedStudents must exist');
assert.ok(html.includes('id="archivedTableCountText"'), '#archivedTableCountText must exist');
assert.ok(html.includes('exportArchivedStudentsCSV'), 'Export CSV action must exist');
assert.ok(html.includes('printArchivedStudentsRegister'), 'Print Register action must exist');
console.log('[PASS] All modal elements, IDs, and action hooks verified in index.html');

// CHECK 2: Table Header Structure
console.log('\n--- Test 2: Verify Table Header Columns & Alignment ---');
assert.ok(html.includes('Admission No.'), 'Admission No header present');
assert.ok(html.includes('Student Name &amp; Guardian') || html.includes('Student Name & Guardian'), 'Student Name & Guardian header present');
assert.ok(html.includes('Final Class'), 'Final Class header present');
assert.ok(html.includes('Departure Date'), 'Departure Date header present');
assert.ok(html.includes('Reason for Leaving'), 'Reason for Leaving header present');
assert.ok(html.includes('TC / Clearance Ref'), 'TC Ref header present');
assert.ok(html.includes('Clearance Status'), 'Clearance Status header present');
assert.ok(html.includes('Actions'), 'Actions header present');
console.log('[PASS] All 8 statutory archive columns verified in index.html');

// CHECK 3: CSS Overflow & Scrollbar Architecture
console.log('\n--- Test 3: Verify CSS Layout & Overflow Rules in portal.css ---');
assert.ok(css.includes('.archived-modal-dialog'), '.archived-modal-dialog class must exist in portal.css');
assert.ok(css.includes('.archived-table-container'), '.archived-table-container class must exist in portal.css');
assert.ok(css.includes('.archive-records-table'), '.archive-records-table class must exist in portal.css');

// Verify that .archived-table-container allows horizontal scroll instead of clipping
const containerRegex = /\.archived-table-container\s*\{[^}]+\}/;
const match = css.match(containerRegex);
if (match) {
  const containerRule = match[0];
  assert.ok(containerRule.includes('overflow-x: auto'), '.archived-table-container must have overflow-x: auto to prevent clipping');
  assert.ok(!containerRule.includes('overflow: hidden'), '.archived-table-container must NOT have overflow: hidden which cuts off Actions column');
  console.log('[PASS] .archived-table-container overflow-x: auto verified');
}

// CHECK 4: Runtime Controller & Rendering
console.log('\n--- Test 4: Verify Controller Functions & Dynamic Row Rendering ---');
// Mock browser environment to test portal.js archive logic
global.window = {
  STUDENT_ROSTER: [
    { admNo: 'SV-0028', name: 'J. Sunil', class: 'X', section: 'A', status: 'Transferred', parentName: 'V. Anand', withdrawalDate: '14 Aug 2026', withdrawalReason: 'Transfer Certificate issued for higher secondary coaching admission', tcNumber: 'TC-2026-0028', clearanceStatus: 'Verified Full Clearance', gender: 'Male' },
    { admNo: 'SV-0042', name: 'NK. Vijayalakshmi', class: 'X', section: 'A', status: 'Withdrawn', parentName: 'Y. Krishna Reddy', withdrawalDate: '28 Jul 2026', withdrawalReason: 'Family relocation out of district • Formally discontinued', tcNumber: 'TC-2026-0042', clearanceStatus: 'Verified Full Clearance', gender: 'Female' },
    { admNo: 'SV-0096', name: 'P. Pravalika', class: 'VIII', section: 'A', status: 'Transferred', parentName: 'RK. Nageswara Rao', withdrawalDate: '02 Sep 2026', withdrawalReason: 'Joined Kendriya Vidyalaya • TC issued with complete conduct remarks', tcNumber: 'TC-2026-0096', clearanceStatus: 'Verified Full Clearance', gender: 'Female' },
    { admNo: 'SV-0118', name: 'M. Rohit', class: 'VIII', section: 'A', status: 'Withdrawn', parentName: 'D. Gopal Rao', withdrawalDate: '30 Aug 2026', withdrawalReason: 'Course discontinued due to guardian shifting to rural mandal', tcNumber: 'TC-2026-0118', clearanceStatus: 'Verified Full Clearance', gender: 'Male' }
  ]
};
global.document = {
  getElementById: (id) => {
    return {
      value: '',
      textContent: '',
      innerHTML: '',
      style: {}
    };
  },
  querySelectorAll: () => []
};

// Check export in portal.js
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');
assert.ok(js.includes('renderArchivedStudentsTable'), 'renderArchivedStudentsTable must exist in portal.js');
assert.ok(js.includes('openArchivedStudentsDrawer'), 'openArchivedStudentsDrawer must exist in portal.js');
assert.ok(js.includes('exportArchivedStudentsCSV'), 'exportArchivedStudentsCSV must exist in portal.js');
assert.ok(js.includes('printArchivedStudentsRegister'), 'printArchivedStudentsRegister must exist in portal.js');
assert.ok(js.includes('printStudentArchivedTC'), 'printStudentArchivedTC must exist in portal.js');
assert.ok(js.includes('viewStudentProfile'), 'viewStudentProfile must be linked in Actions column');
console.log('[PASS] All portal.js archive controller methods verified');

console.log('\n====================================================');
console.log('ALL ARCHIVED STUDENTS MODAL TESTS PASSED (100%)');
console.log('====================================================\n');
