const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: CONFIRM ENROLMENT MODAL ALIGNMENT');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// CHECK 1: Modal Structure and IDs in index.html
console.log('--- Test 1: Verify Modal Elements and Input IDs in index.html ---');
assert.ok(html.includes('id="confirmEnrolmentModal"'), '#confirmEnrolmentModal must exist in index.html');
assert.ok(html.includes('id="enrolTargetAppId"'), '#enrolTargetAppId must exist');
assert.ok(html.includes('id="enrolModalSub"'), '#enrolModalSub must exist');
assert.ok(html.includes('id="duplicateScannerContainer"'), '#duplicateScannerContainer must exist');
assert.ok(html.includes('id="enrolAllocatedAdmNo"'), '#enrolAllocatedAdmNo must exist');
assert.ok(html.includes('id="enrolAllocatedStudentId"'), '#enrolAllocatedStudentId must exist');
assert.ok(html.includes('id="enrolAllocatedClass"'), '#enrolAllocatedClass must exist');
assert.ok(html.includes('id="enrolAllocatedSection"'), '#enrolAllocatedSection must exist');
assert.ok(html.includes('id="enrolClassTeacher"'), '#enrolClassTeacher must exist');
assert.ok(html.includes('id="enrolRemarks"'), '#enrolRemarks must exist');
assert.ok(html.includes('submitConfirmEnrolment'), 'submitConfirmEnrolment form handler must exist');
assert.ok(html.includes("closeModal('confirmEnrolmentModal')"), 'closeModal must be hooked to close button');
console.log('[PASS] All modal elements, IDs, and form handlers verified');

// CHECK 2: Visual Alignment & Layout Structure
console.log('\n--- Test 2: Verify Symmetrical Layout and Input Proportions ---');
const modalIndex = html.indexOf('id="confirmEnrolmentModal"');
const modalEnd = html.indexOf('id="cancelApplicationModal"', modalIndex);
const modalSnippet = html.substring(modalIndex, modalEnd);

// Verify modal width allows comfortable layout without cramped controls
assert.ok(
  modalSnippet.includes('max-width: 680px') || modalSnippet.includes('max-width: 700px'),
  'Modal should have expanded max-width (>= 680px) for institutional presentation'
);

// Verify symmetrical grid or equal columns in credentials card
assert.ok(
  modalSnippet.includes('grid-template-columns: 1fr 1fr') || modalSnippet.includes('grid-template-columns: repeat(2'),
  'Credentials card must use symmetrical 2-column grid layout for Admission No & Student ID'
);

// Verify professional institutional header
assert.ok(
  modalSnippet.includes('Statutory Admissions') || modalSnippet.includes('General Register'),
  'Header should contain institutional category kicker'
);
console.log('[PASS] Symmetrical 2-column layout and comfortable proportions verified');

// CHECK 3: Controller Functionality in portal.js
console.log('\n--- Test 3: Verify Controller Functions and State Updates in portal.js ---');
assert.ok(js.includes('function openConfirmEnrolmentModal('), 'openConfirmEnrolmentModal must be defined');
assert.ok(js.includes('function submitConfirmEnrolment('), 'submitConfirmEnrolment must be defined');
assert.ok(js.includes('function scanAdmissionsDuplicate('), 'scanAdmissionsDuplicate must be defined');
assert.ok(js.includes('openConfirmEnrolmentModal'), 'openConfirmEnrolmentModal must be exported');
assert.ok(js.includes('submitConfirmEnrolment'), 'submitConfirmEnrolment must be exported');

// Mock state and test submitConfirmEnrolment logic
const mockApp = {
  appId: 'SV202600006',
  name: 'S. Harini',
  class: 'LKG',
  grade: 'LKG',
  phone: '9848011223',
  status: 'Offer Accepted',
  decisionHistory: [],
  communicationHistory: []
};

global.state = {
  admissions: [mockApp],
  students: [{ admNo: 'SV-0500' }],
  currentUser: { name: 'Sri Navva Anand' }
};

global.document = {
  getElementById: (id) => {
    if (id === 'enrolTargetAppId') return { value: 'SV202600006' };
    if (id === 'enrolAllocatedAdmNo') return { value: 'SV-0501' };
    if (id === 'enrolAllocatedStudentId') return { value: 'STU-SV-0501' };
    if (id === 'enrolAllocatedClass') return { value: 'Class LKG' };
    if (id === 'enrolAllocatedSection') return { value: 'Section A' };
    if (id === 'enrolClassTeacher') return { value: 'Smt. G. Swarna' };
    if (id === 'enrolRemarks') return { value: 'Statutory enrolment completed.' };
    return { value: '', textContent: '', style: {}, innerHTML: '' };
  }
};

global.closeModal = () => {};
global.openModal = () => {};
global.initAdmissions = () => {};
global.filterAdmissions = () => {};
global.showToast = () => {};

// Evaluate submitConfirmEnrolment
const idxSubmit = js.indexOf('function submitConfirmEnrolment(');
const endSubmit = js.indexOf('\n  function openCancelApplicationModal', idxSubmit);
const submitFnCode = js.substring(idxSubmit, endSubmit);
eval(submitFnCode);

submitConfirmEnrolment({ preventDefault: () => {} });

assert.strictEqual(mockApp.status, 'Confirmed Admission', 'App status must update to Confirmed Admission');
assert.strictEqual(mockApp.enrolled, true, 'App enrolled boolean must be true');
assert.strictEqual(mockApp.enrolledAdmNo, 'SV-0501', 'Enrolled admission number must match');
assert.ok(mockApp.decisionHistory.length > 0, 'Decision history must log enrolment action');
assert.strictEqual(global.state.students.length, 2, 'New student must be appended to state.students');
console.log('[PASS] submitConfirmEnrolment executes cleanly and registers new student');

console.log('\n====================================================');
console.log('ALL CONFIRM ENROLMENT MODAL TESTS PASSED (100%)');
console.log('====================================================\n');
