const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: DOCUMENT PREVIEW MODAL & LIFECYCLE ACTION AUDIT ===\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');

// TEST 1: Modals in index.html
console.log('[CHECK 1] Verifying all core and action modal backdrops in HTML...');
const requiredModals = [
  'previewDocumentModal',
  'rejectDocumentModal',
  'replaceDocumentModal',
  'markDocNaModal',
  'documentHistoryModal',
  'studentDocsModal'
];

requiredModals.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Modal backdrop #${id} must exist in index.html`);
  console.log(`  ✓ Modal #${id} verified`);
});

// TEST 2: Certificate Elements in previewDocumentModal
console.log('\n[CHECK 2] Verifying certificate and credential docket elements in HTML...');
const certElements = [
  'prevModalDocTitle',
  'prevModalDocSub',
  'prevCertDocType',
  'prevCertStudentName',
  'prevCertAdmNo',
  'prevCertClassSec',
  'prevCertTitleNumber',
  'prevCertSource',
  'prevCertUploadDate',
  'prevCertNotes',
  'prevCertStampId',
  'prevCertAuthority',
  'docPreviewWatermark',
  'previewActionButtonsContainer'
];

certElements.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Certificate element #${id} must exist in index.html`);
  console.log(`  ✓ Certificate element #${id} verified`);
});

// TEST 3: Action Modals Form Inputs & Targets
console.log('\n[CHECK 3] Verifying action modal controls and input bindings...');
const actionInputs = [
  // Reject
  'rejectDocTargetId',
  'rejectDocSummary',
  'rejectReasonCategorySelect',
  'rejectDetailedRemarks',
  // Replace
  'replaceDocTargetId',
  'replaceDocCurrentInfo',
  'replaceDocSourceSelect',
  'replaceFileInput',
  'replaceSelectedFilePreview',
  'replaceSelectedFileName',
  'replaceDocNotes',
  // Mark N/A
  'markNaDocTargetId',
  'markNaDocSummary',
  'markNaReasonSelect',
  'markNaRemarks',
  // History
  'historyDocSummary',
  'docVersionTimelineContainer'
];

actionInputs.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Action input #${id} must exist in index.html`);
  console.log(`  ✓ Action input #${id} verified`);
});

// TEST 4: Function presence in portal.js
console.log('\n[CHECK 4] Verifying controller functions in portal.js...');
const requiredFunctions = [
  'openDocumentPreviewModal',
  'downloadStudentDocumentFromPreview',
  'openDocumentHistoryModalFromPreview',
  'openRejectDocumentModal',
  'submitRejectDocument',
  'openRequestReplacementModal',
  'openReplaceDocumentModal',
  'handleReplaceFileSelected',
  'submitReplaceDocument',
  'openMarkDocNaModal',
  'submitMarkDocNa',
  'openDocumentHistoryModal',
  'openStudentDocsModal',
  'handleStudentDocUploadSubmit'
];

requiredFunctions.forEach(fn => {
  assert.ok(js.includes(`function ${fn}`), `Function ${fn} must be defined in portal.js`);
  assert.ok(js.includes(`${fn},`) || js.includes(`${fn}\n`) || js.includes(`${fn}:`), `Function ${fn} must be exported in portalApp`);
  console.log(`  ✓ Controller function portalApp.${fn} verified and exported`);
});

// TEST 5: Modal alias handling in openModal / closeModal
console.log('\n[CHECK 5] Verifying openModal and closeModal alias resolution...');
assert.ok(js.includes("modalId === 'uploadDocumentModal' || modalId === 'studentDocsModal'"), 'uploadDocumentModal and studentDocsModal must be aliased in closeModal');
assert.ok(js.includes("modalId === 'studentDocViewerModal' || modalId === 'previewDocumentModal'"), 'studentDocViewerModal and previewDocumentModal must be aliased in closeModal');
assert.ok(js.includes("if (modalId === 'uploadDocumentModal')"), 'uploadDocumentModal must be handled in openModal');
console.log('  ✓ Modal ID aliases properly resolved for openModal and closeModal');

// TEST 6: CSS styling support
console.log('\n[CHECK 6] Verifying styling rules in portal.css...');
const cssClasses = [
  '.doc-preview-wrapper',
  '.doc-watermark-overlay',
  '.doc-version-timeline',
  '.doc-version-step'
];

cssClasses.forEach(cls => {
  assert.ok(css.includes(cls), `CSS class ${cls} must exist in portal.css`);
  console.log(`  ✓ CSS class ${cls} verified`);
});

console.log('\n======================================================');
console.log('ALL PREVIEW MODAL & ACTION SUITE TESTS PASSED 100%!');
console.log('======================================================\n');

