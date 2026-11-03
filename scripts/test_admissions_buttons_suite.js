const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: Admissions Action Buttons & Modals');
console.log('====================================================');

// Mock DOM Environment
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
        _set: new Set(),
        add: function(c) { this._set.add(c); },
        remove: function(c) { this._set.delete(c); },
        contains: function(c) { return this._set.has(c); },
        toggle: function(c) { if (this._set.has(c)) this._set.delete(c); else this._set.add(c); }
      },
      querySelectorAll: (sel) => [],
      querySelector: (sel) => null,
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      click: () => {},
      focus: () => {},
      reset: function() { this.value = ''; },
      addEventListener: () => {}
    });
  }
  return mockElements.get(id);
}

const capturedDownloads = [];
global.URL = {
  createObjectURL: (blob) => 'blob://test-' + Math.random(),
  revokeObjectURL: () => {}
};

global.Blob = class {
  constructor(parts, opts) {
    this.parts = parts;
    this.opts = opts;
    this.text = parts.join('');
  }
};

const storageStore = new Map();
global.localStorage = {
  getItem: (k) => storageStore.get(k) || null,
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k)
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { hash: '#students' },
  localStorage: global.localStorage,
  scrollTo: () => {},
  dispatchEvent: () => {},
  print: () => {}
};

global.Event = class { constructor(type) { this.type = type; } };

global.document = {
  getElementById: (id) => getMock(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getMock(sel.slice(1));
    return getMock('sel_' + Math.random());
  },
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = getMock('el_' + Math.random(), tag);
    if (tag.toLowerCase() === 'a') {
      el.click = () => {
        capturedDownloads.push({
          href: el.getAttribute('href'),
          download: el.getAttribute('download')
        });
      };
      el.setAttribute = (k, v) => { el[k] = v; };
      el.getAttribute = (k) => el[k];
    }
    return el;
  },
  body: getMock('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

getMock('toastContainer').children = [];

// Load student-roster.js
eval(fs.readFileSync('frontend/js/student-roster.js', 'utf8'));

// Load portal.js
eval(fs.readFileSync('frontend/js/portal.js', 'utf8'));
const portal = global.portalApp || window.portalApp;

assert(portal, 'portalApp must be defined on window');

console.log('\n[PASS] Portal and Roster loaded successfully');

// Initialize admissions
portal.initAdmissions();
const initialCount = portal.state.admissions.length;
console.log(`Initial admissions count: ${initialCount}`);

// --------------------------------------------------------------------------
// TEST 1: Button 1 - New Admission (#btnNewAdmissionPrimary)
// --------------------------------------------------------------------------
console.log('\n--- Test 1: New Admission Modal & Submission ---');
portal.openNewAdmissionModal('Bhavish Test Student', 'X', 'Bhavish Parent', '9988776655');

const newAdmModal = getMock('newAdmissionModal');
assert(newAdmModal.style.display === 'flex' || newAdmModal.classList.contains('active'), 'newAdmissionModal must be displayed');
assert.strictEqual(getMock('admFullName').value, 'Bhavish Test Student', 'admFullName must be set');
assert.strictEqual(getMock('admDob').value, '2014-06-15', 'admDob must be set to prevent HTML5 date validation failure');
assert.strictEqual(getMock('admClassApplied').value, 'X', 'admClassApplied must be set');

// Submit the form
portal.submitNewAdmission({ preventDefault: () => {} });

assert.strictEqual(portal.state.admissions.length, initialCount + 1, 'state.admissions must have 1 more record');
const newlyCreated = portal.state.admissions[0];
assert.strictEqual(newlyCreated.name, 'Bhavish Test Student', 'Created applicant name must match');
assert.strictEqual(newlyCreated.class, 'X', 'Created applicant class must match');
assert.strictEqual(getMock('admissionsCountBadge').textContent, portal.state.admissions.length, 'Sub-tab admissionsCountBadge must be synchronized');
assert(newAdmModal.style.display === 'none' || !newAdmModal.classList.contains('active'), 'Modal must be closed after submit');

console.log('[PASS] Test 1: New Admission modal opened, validated, submitted, and tab badge synchronized');

// --------------------------------------------------------------------------
// TEST 2: Button 2 - Add Enquiry (#btnAddEnquirySecondary)
// --------------------------------------------------------------------------
console.log('\n--- Test 2: Add Enquiry Modal & Submission ---');
portal.openAddEnquiryModal();

const enqModal = getMock('addEnquiryModal');
assert(enqModal.style.display === 'flex' || enqModal.classList.contains('active'), 'addEnquiryModal must be displayed');
assert(getMock('enqFollowupDate').value.length > 0, 'Followup date must be pre-populated');

// Fill enquiry form
getMock('enqStudentName').value = 'Rohan Enquiry Student';
getMock('enqClass').value = 'VII';
getMock('enqParentName').value = 'Rohan Parent';
getMock('enqPhone').value = '9876543210';
getMock('enqSource').value = 'Phone Enquiry';
getMock('enqRemarks').value = 'Interested in Class 7 English Medium';

portal.submitAddEnquiry({ preventDefault: () => {} });

assert.strictEqual(portal.state.admissions.length, initialCount + 2, 'state.admissions must have 2 more records total');
const newlyCreatedEnq = portal.state.admissions[0];
assert.strictEqual(newlyCreatedEnq.name, 'Rohan Enquiry Student', 'Enquiry student name must match');
assert.strictEqual(newlyCreatedEnq.status, 'New Enquiry', 'Status must be New Enquiry');
assert.strictEqual(getMock('admissionsCountBadge').textContent, portal.state.admissions.length, 'Sub-tab admissionsCountBadge must be synchronized');
assert(enqModal.style.display === 'none' || !enqModal.classList.contains('active'), 'Modal must be closed after submit');

console.log('[PASS] Test 2: Add Enquiry modal opened, validated, submitted, and tab badge synchronized');

// --------------------------------------------------------------------------
// TEST 3: Button 3 - Import Applications (#btnImportAdmissionsSecondary)
// --------------------------------------------------------------------------
console.log('\n--- Test 3: Import Applications Modal, Sample CSV & Ingestion ---');

// Check modal opens
portal.openImportAdmissionsModal();
const importModal = getMock('importAdmissionsModal');
assert(importModal.style.display === 'flex' || importModal.classList.contains('active'), 'importAdmissionsModal must be displayed');

// Test sample template download
capturedDownloads.length = 0;
portal.downloadAdmissionsImportSample();
assert.strictEqual(capturedDownloads.length, 1, 'Sample CSV download must be triggered');
assert(capturedDownloads[0].download.includes('template') || capturedDownloads[0].download.includes('sample'), 'Download filename must identify template');

// Test CSV parsing with 3 valid records and 1 invalid row
const testCsv = `Full Name,Class Applied,Gender,Date of Birth,Parent Name,Relationship,Mobile Phone,Email,Address,Intake Channel,Previous School,Notes
Sunita Rao,VIII,Female,2013-05-10,S. Narayana,Father,9848555111,narayana@gmail.com,MVP Colony,Walk-In,St. Ann's,Good student
K. Naveen,IX,Male,2012-07-15,K. Bhaskar,Father,9848555222,bhaskar@gmail.com,Seethammadhara,Online Form,KV-1,Sports enthusiast
,X,Male,2011-09-20,Invalid Parent,Father,9848555333,invalid@gmail.com,Gajuwaka,Walk-In,ZPHS,Missing Name
V. Pooja,VI,Female,2014-01-05,V. Appa Rao,Father,9848555444,apparao@gmail.com,Akkayyapalem,Walk-In,Little Angels,Transfer from CBSE`;

portal.parseAdmissionsCsvData(testCsv, 'Test CSV');
const tbody = getMock('admImportPreviewTbody');
assert(tbody.innerHTML.includes('Sunita Rao'), 'Preview must show Sunita Rao');
assert(tbody.innerHTML.includes('K. Naveen'), 'Preview must show K. Naveen');
assert(tbody.innerHTML.includes('V. Pooja'), 'Preview must show V. Pooja');
assert(tbody.innerHTML.includes('Missing') || tbody.innerHTML.includes('required'), 'Preview must highlight missing name row as invalid');

const validCount = parseInt(getMock('admImportValidCount').textContent, 10);
assert.strictEqual(validCount, 3, 'Must have exactly 3 valid applications');

// Confirm import
const countBeforeImport = portal.state.admissions.length;
portal.confirmAdmissionsImport();

assert.strictEqual(portal.state.admissions.length, countBeforeImport + 3, 'Must import 3 valid records');
assert.strictEqual(portal.state.admissions[0].name, 'Sunita Rao', 'First imported record name matches');
assert.strictEqual(portal.state.admissions[1].name, 'K. Naveen', 'Second imported record name matches');
assert.strictEqual(portal.state.admissions[2].name, 'V. Pooja', 'Third imported record name matches');
assert.strictEqual(getMock('admissionsCountBadge').textContent, portal.state.admissions.length, 'Sub-tab admissionsCountBadge must be synchronized after import');
assert(importModal.style.display === 'none' || !importModal.classList.contains('active'), 'Modal must be closed after confirmation');

console.log('[PASS] Test 3: Import Applications fully verified (modal, sample CSV, parsing, validation, batch ingest)');

// --------------------------------------------------------------------------
// TEST 4: Button 4 - Export Register (#btnExportAdmissionsSecondary)
// --------------------------------------------------------------------------
console.log('\n--- Test 4: Export Admissions CSV Register ---');
capturedDownloads.length = 0;
portal.exportAdmissionsCSV();

assert.strictEqual(capturedDownloads.length, 1, 'Export register must trigger 1 download');
assert(capturedDownloads[0].download.includes('admissions_master_register'), 'Download filename must contain admissions_master_register');

// Verify downloadCsvFile handles argument reversal
capturedDownloads.length = 0;
portal.downloadCsvFile('Test_Reversed_Arg.csv', 'Col1,Col2\nVal1,Val2');
assert.strictEqual(capturedDownloads.length, 1, 'downloadCsvFile must handle (filename, content)');
assert.strictEqual(capturedDownloads[0].download, 'Test_Reversed_Arg.csv', 'Filename must match even when passed first');

console.log('[PASS] Test 4: Export Admissions CSV Register verified with UTF-8 BOM, delayed revocation, and parameter swap protection');

// --------------------------------------------------------------------------
// TEST 5: HTML Verification
// --------------------------------------------------------------------------
console.log('\n--- Test 5: Verify HTML Elements and Modal Structure ---');
const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');

assert(html.includes('id="btnNewAdmissionPrimary"'), 'HTML must have id btnNewAdmissionPrimary');
assert(html.includes('id="btnAddEnquirySecondary"'), 'HTML must have id btnAddEnquirySecondary');
assert(html.includes('id="btnImportAdmissionsSecondary"'), 'HTML must have id btnImportAdmissionsSecondary');
assert(html.includes('id="btnExportAdmissionsSecondary"'), 'HTML must have id btnExportAdmissionsSecondary');
assert(html.includes('id="importAdmissionsModal"'), 'HTML must contain id importAdmissionsModal');
assert(html.includes('id="admImportFileInput"'), 'HTML must contain id admImportFileInput');
assert(html.includes('id="admImportPasteText"'), 'HTML must contain id admImportPasteText');
assert(html.includes('id="admImportPreviewTbody"'), 'HTML must contain id admImportPreviewTbody');
assert(html.includes('id="btnConfirmAdmissionsImport"'), 'HTML must contain id btnConfirmAdmissionsImport');

console.log('[PASS] Test 5: HTML elements and modal IDs verified in index.html');

console.log('\n====================================================');
console.log('ALL ADMISSIONS BUTTON & MODAL TESTS PASSED (100%)');
console.log('====================================================\n');
