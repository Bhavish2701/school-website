const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: SCHEDULE ASSESSMENT MODAL ALIGNMENT');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// CHECK 1: Modal Structure and IDs in index.html
console.log('--- Test 1: Verify Modal Elements and Input IDs in index.html ---');
assert.ok(html.includes('id="scheduleAssessmentModal"'), '#scheduleAssessmentModal must exist in index.html');
assert.ok(html.includes('id="schedTargetAppId"'), '#schedTargetAppId must exist');
assert.ok(html.includes('id="schedModalSubtitle"'), '#schedModalSubtitle must exist');
assert.ok(html.includes('id="schedType"'), '#schedType must exist');
assert.ok(html.includes('id="schedDate"'), '#schedDate must exist');
assert.ok(html.includes('id="schedTime"'), '#schedTime must exist');
assert.ok(html.includes('id="schedVenue"'), '#schedVenue must exist');
assert.ok(html.includes('id="schedAssessor"'), '#schedAssessor must exist');
assert.ok(html.includes('id="schedInstructions"'), '#schedInstructions must exist');
assert.ok(html.includes('submitScheduleAssessment'), 'submitScheduleAssessment form handler must exist');
assert.ok(html.includes("closeModal('scheduleAssessmentModal')"), 'closeModal must be hooked to close button');
console.log('[PASS] All modal elements, IDs, and form handlers verified');

// CHECK 2: Visual Alignment & Layout Structure
console.log('\n--- Test 2: Verify Symmetrical Layout and Input Proportions ---');
const modalIndex = html.indexOf('id="scheduleAssessmentModal"');
const modalEnd = html.indexOf('id="recordAssessmentModal"', modalIndex);
const modalSnippet = html.substring(modalIndex, modalEnd);

// Verify modal width allows comfortable venue display without truncation
assert.ok(
  modalSnippet.includes('max-width: 640px') || modalSnippet.includes('max-width: 650px') || modalSnippet.includes('max-width: 660px'),
  'Modal should have expanded max-width (>= 640px) to prevent input text truncation'
);

// Verify symmetrical grid or equal columns
assert.ok(
  modalSnippet.includes('grid-template-columns: 1fr 1fr') || modalSnippet.includes('grid-template-columns: repeat(2'),
  'Schedule assessment modal must use symmetrical 2-column grid layout for Date/Time and Venue/Assessor'
);

// Verify professional institutional header
assert.ok(
  modalSnippet.includes('Admissions') || modalSnippet.includes('Evaluation'),
  'Header should contain institutional category kicker'
);
console.log('[PASS] Symmetrical 2-column layout and comfortable proportions verified');

// CHECK 3: Controller Functionality in portal.js
console.log('\n--- Test 3: Verify Controller Functions and State Updates in portal.js ---');
assert.ok(js.includes('function openScheduleAssessmentModal('), 'openScheduleAssessmentModal must be defined');
assert.ok(js.includes('function submitScheduleAssessment('), 'submitScheduleAssessment must be defined');
assert.ok(js.includes('openScheduleAssessmentModal'), 'openScheduleAssessmentModal must be exported');
assert.ok(js.includes('submitScheduleAssessment'), 'submitScheduleAssessment must be exported');

// Mock state and test submitScheduleAssessment logic
const mockApp = {
  appId: 'SV202600006',
  name: 'S. Harini',
  class: 'LKG',
  phone: '9848011223',
  status: 'Inquiry / Intake',
  decisionHistory: [],
  communicationHistory: []
};

global.state = {
  admissions: [mockApp],
  currentUser: { name: 'Sri Navva Anand' }
};

global.document = {
  getElementById: (id) => {
    if (id === 'schedTargetAppId') return { value: 'SV202600006' };
    if (id === 'schedType') return { value: 'Written Aptitude & Core Concept Evaluation' };
    if (id === 'schedDate') return { value: '2026-11-06' };
    if (id === 'schedTime') return { value: '10:00 AM' };
    if (id === 'schedVenue') return { value: 'Academic Assessment Cell (Room 102)' };
    if (id === 'schedAssessor') return { value: 'Sri Ch. Ramesh (Academic Dean)' };
    if (id === 'schedInstructions') return { value: 'Bring pencil and drawing kit.' };
    return { value: '', textContent: '', style: {} };
  }
};

global.closeModal = () => {};
global.openModal = () => {};
global.initAdmissions = () => {};
global.filterAdmissions = () => {};
global.showToast = () => {};

// Evaluate submitScheduleAssessment
const idxSubmit = js.indexOf('function submitScheduleAssessment(');
const endSubmit = js.indexOf('\n  function openRecordAssessmentModal', idxSubmit);
const submitFnCode = js.substring(idxSubmit, endSubmit);
eval(submitFnCode);

submitScheduleAssessment({ preventDefault: () => {} });

assert.strictEqual(mockApp.status, 'Eligibility Review', 'App status must update to Eligibility Review');
assert.ok(mockApp.score.includes('Scheduled on 2026-11-06 at 10:00 AM'), 'App score must record assessment schedule');
assert.strictEqual(mockApp.assignedOfficer, 'Sri Ch. Ramesh (Academic Dean)', 'Assigned officer must be updated');
assert.ok(mockApp.decisionHistory.length > 0, 'Decision history must log schedule action');
assert.ok(mockApp.communicationHistory.length > 0, 'Communication history must log SMS notification');
console.log('[PASS] submitScheduleAssessment executes cleanly and records schedule history');

console.log('\n====================================================');
console.log('ALL SCHEDULE ASSESSMENT MODAL TESTS PASSED (100%)');
console.log('====================================================\n');

