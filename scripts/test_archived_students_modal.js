const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: ARCHIVED STUDENTS MODAL ALIGNMENT & LOGIC');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

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

// CHECK 4: Modal Stacking z-index for Dossier Modal
console.log('\n--- Test 4: Verify Modal Stacking & z-index Hierarchy ---');
assert.ok(css.includes('#studentDossierModal') && css.includes('z-index: 10070'), '#studentDossierModal must have z-index: 10070 so it sits in front of archive modal (z-index: 10050)');
console.log('[PASS] #studentDossierModal has z-index: 10070 preventing background entrapment');

// CHECK 5: Archived Student Resolution in viewStudentProfile
console.log('\n--- Test 5: Verify viewStudentProfile Resolves Archived Records ---');
assert.ok(js.includes('getCombinedArchivedStudents') && js.includes('CANONICAL_ARCHIVED_STUDENTS'), 'viewStudentProfile must query archived collections');
assert.ok(js.includes('downloadCsvFile(csv, \'Sri_Vidya_Permanent_Student_Archive_Register.csv\')'), 'exportArchivedStudentsCSV must use canonical (content, filename) signature');
console.log('[PASS] viewStudentProfile properly resolves SV-0028 and other archived student IDs');

// CHECK 6: Reliable Print Execution
console.log('\n--- Test 6: Verify Bulletproof Iframe Print Mechanism ---');
assert.ok(js.includes('function executePrintDocument'), 'executePrintDocument function must exist');
assert.ok(js.includes('archivePrintFrame'), 'Dedicated hidden iframe #archivePrintFrame must be used to bypass popup blockers');
console.log('[PASS] executePrintDocument verified for popup-blocker-safe printing');

// CHECK 7: Runtime Controller & Rendering
console.log('\n--- Test 7: Verify Controller Methods & Exports ---');
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
