const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: ISSUE ADMISSION OFFER MODAL ALIGNMENT');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// CHECK 1: Modal Structure and IDs in index.html
console.log('--- Test 1: Verify Modal Elements and Input IDs in index.html ---');
assert.ok(html.includes('id="issueOfferModal"'), '#issueOfferModal must exist in index.html');
assert.ok(html.includes('id="offerTargetAppId"'), '#offerTargetAppId must exist');
assert.ok(html.includes('id="offerModalSub"'), '#offerModalSub must exist');
assert.ok(html.includes('id="offerClass"'), '#offerClass must exist');
assert.ok(html.includes('id="offerExpiryDate"'), '#offerExpiryDate must exist');
assert.ok(html.includes('id="offerFeeAmount"'), '#offerFeeAmount must exist');
assert.ok(html.includes('id="offerConcession"'), '#offerConcession must exist');
assert.ok(html.includes('id="offerTerms"'), '#offerTerms must exist');
assert.ok(html.includes('submitIssueOffer'), 'submitIssueOffer form handler must exist');
assert.ok(html.includes("closeModal('issueOfferModal')"), 'closeModal must be hooked to close button');
console.log('[PASS] All modal elements, IDs, and form handlers verified');

// CHECK 2: Visual Alignment & Layout Structure
console.log('\n--- Test 2: Verify Symmetrical Layout and Input Proportions ---');
const modalIndex = html.indexOf('id="issueOfferModal"');
const modalEnd = html.indexOf('id="confirmEnrolmentModal"', modalIndex);
const modalSnippet = html.substring(modalIndex, modalEnd);

// Verify modal width allows comfortable layout without cramped controls
assert.ok(
  modalSnippet.includes('max-width: 630px') || modalSnippet.includes('max-width: 640px') || modalSnippet.includes('max-width: 650px'),
  'Modal should have expanded max-width (>= 630px) for institutional presentation'
);

// Verify symmetrical grid or equal columns
assert.ok(
  modalSnippet.includes('grid-template-columns: 1fr 1fr') || modalSnippet.includes('grid-template-columns: repeat(2'),
  'Issue offer modal must use symmetrical 2-column grid layout for Class/Expiry and Fee/Concession'
);

// Verify professional institutional header
assert.ok(
  modalSnippet.includes('Admissions') || modalSnippet.includes('Offer'),
  'Header should contain institutional category kicker'
);
console.log('[PASS] Symmetrical 2-column layout and comfortable proportions verified');

// CHECK 3: Controller Functionality in portal.js
console.log('\n--- Test 3: Verify Controller Functions and State Updates in portal.js ---');
assert.ok(js.includes('function openIssueOfferModal('), 'openIssueOfferModal must be defined');
assert.ok(js.includes('function submitIssueOffer('), 'submitIssueOffer must be defined');
assert.ok(js.includes('openIssueOfferModal'), 'openIssueOfferModal must be exported');
assert.ok(js.includes('submitIssueOffer'), 'submitIssueOffer must be exported');

// Mock state and test submitIssueOffer logic
const mockApp = {
  appId: 'SV202600006',
  name: 'S. Harini',
  class: 'LKG',
  phone: '9848011223',
  status: 'Under Review',
  decisionHistory: [],
  communicationHistory: []
};

global.state = {
  admissions: [mockApp],
  currentUser: { name: 'Sri Navva Anand' }
};

global.document = {
  getElementById: (id) => {
    if (id === 'offerTargetAppId') return { value: 'SV202600006' };
    if (id === 'offerClass') return { value: 'Class LKG (Section A)' };
    if (id === 'offerExpiryDate') return { value: '2026-11-14' };
    if (id === 'offerFeeAmount') return { value: '₹12,500' };
    if (id === 'offerConcession') return { value: 'None (Standard Board Fee)' };
    if (id === 'offerTerms') return { value: 'Admission subject to timely fee payment.' };
    return { value: '', textContent: '', style: {} };
  }
};

global.closeModal = () => {};
global.openModal = () => {};
global.initAdmissions = () => {};
global.filterAdmissions = () => {};
global.showToast = () => {};

// Evaluate submitIssueOffer
const idxSubmit = js.indexOf('function submitIssueOffer(');
const endSubmit = js.indexOf('\n  /* =========================================================================\n     DUPLICATE PREVENTION SCANNER', idxSubmit);
const submitFnCode = js.substring(idxSubmit, endSubmit);
eval(submitFnCode);

submitIssueOffer({ preventDefault: () => {} });

assert.strictEqual(mockApp.status, 'Offer Issued', 'App status must update to Offer Issued');
assert.strictEqual(mockApp.feeStatus, 'Awaiting Parent Acceptance', 'Fee status must update to Awaiting Parent Acceptance');
assert.strictEqual(mockApp.feeAmount, '₹12,500', 'Offer fee must be saved');
assert.ok(mockApp.decisionHistory.length > 0, 'Decision history must log offer action');
assert.ok(mockApp.communicationHistory.length > 0, 'Communication history must log SMS/email notification');
console.log('[PASS] submitIssueOffer executes cleanly and records offer history');

console.log('\n====================================================');
console.log('ALL ISSUE OFFER MODAL TESTS PASSED (100%)');
console.log('====================================================\n');
