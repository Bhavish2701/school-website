const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: RECORD ASSESSMENT OUTCOME MODAL ALIGNMENT');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// CHECK 1: Modal Structure and IDs in index.html
console.log('--- Test 1: Verify Modal Elements and Input IDs in index.html ---');
assert.ok(html.includes('id="recordAssessmentModal"'), '#recordAssessmentModal must exist in index.html');
assert.ok(html.includes('id="recordAssTargetAppId"'), '#recordAssTargetAppId must exist');
assert.ok(html.includes('id="recordAssSub"'), '#recordAssSub must exist');
assert.ok(html.includes('id="recordAssScore"'), '#recordAssScore must exist');
assert.ok(html.includes('id="recordAssOutcome"'), '#recordAssOutcome must exist');
assert.ok(html.includes('id="recordAssRemarks"'), '#recordAssRemarks must exist');
assert.ok(html.includes('submitRecordAssessment'), 'submitRecordAssessment form handler must exist');
assert.ok(html.includes('closeModal(\'recordAssessmentModal\')'), 'closeModal must be hooked to close button');
console.log('[PASS] All modal elements, IDs, and form handlers verified');

// CHECK 2: Visual Alignment & Label Structure
console.log('\n--- Test 2: Verify Symmetrical Layout and Label Integrity ---');
const modalIndex = html.indexOf('id="recordAssessmentModal"');
const modalEnd = html.indexOf('id="issueOfferModal"', modalIndex);
const modalSnippet = html.substring(modalIndex, modalEnd);

// Verify symmetrical grid or equal flex columns
assert.ok(
  modalSnippet.includes('grid-template-columns: 1fr 1fr') || modalSnippet.includes('grid-template-columns: repeat(2'),
  'Record assessment outcome must use symmetrical 2-column grid to ensure horizontal input alignment'
);

// Verify no raw trailing asterisk on its own line
assert.ok(
  !modalSnippet.includes('Assessment Score / Percentage *'),
  'Label must not contain trailing unstyled asterisk that breaks to an isolated line'
);
console.log('[PASS] Symmetrical 2-column layout and clean label alignment verified');

// CHECK 3: Controller Functionality in portal.js
console.log('\n--- Test 3: Verify Controller Functions and State Updates in portal.js ---');
assert.ok(js.includes('function openRecordAssessmentModal('), 'openRecordAssessmentModal must be defined');
assert.ok(js.includes('function submitRecordAssessment('), 'submitRecordAssessment must be defined');
assert.ok(js.includes('openRecordAssessmentModal'), 'openRecordAssessmentModal must be exported');
assert.ok(js.includes('submitRecordAssessment'), 'submitRecordAssessment must be exported');

// Mock state and test submitRecordAssessment logic
const mockApp = {
  appId: 'SV202600006',
  name: 'S. Harini',
  class: 'LKG',
  status: 'Eligibility Review',
  decisionHistory: []
};

global.state = {
  admissions: [mockApp],
  currentUser: { name: 'Sri Navva Anand' }
};

global.document = {
  getElementById: (id) => {
    if (id === 'recordAssTargetAppId') return { value: 'SV202600006' };
    if (id === 'recordAssScore') return { value: '92% (Distinction)' };
    if (id === 'recordAssOutcome') return { value: 'Recommended' };
    if (id === 'recordAssRemarks') return { value: 'Demonstrates exemplary motor and cognitive skills.' };
    return { value: '', textContent: '', style: {} };
  }
};

global.closeModal = () => {};
global.initAdmissions = () => {};
global.filterAdmissions = () => {};
global.showToast = () => {};

// Evaluate submitRecordAssessment
const idxSubmit = js.indexOf('function submitRecordAssessment(');
const endSubmit = js.indexOf('\n  function openIssueOfferModal', idxSubmit);
const submitFnCode = js.substring(idxSubmit, endSubmit);
eval(submitFnCode);

submitRecordAssessment({ preventDefault: () => {} });

assert.strictEqual(mockApp.status, 'Under Review', 'App status must update to Under Review');
assert.strictEqual(mockApp.score, '92% (Distinction) (Recommended)', 'App score must record assessment result');
assert.ok(mockApp.decisionHistory.length > 0, 'Decision history must log assessment action');
console.log('[PASS] submitRecordAssessment executes cleanly and records evaluation history');

console.log('\n====================================================');
console.log('ALL RECORD ASSESSMENT MODAL TESTS PASSED (100%)');
console.log('====================================================\n');
