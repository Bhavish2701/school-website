const fs = require('fs');
const http = require('http');

console.log('=== SRI VIDYA ERP: EXIT MODAL VERIFICATION ===');

// 1. Verify index.html
const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');

const requiredElements = [
  'id="studentTransferWithdrawalModal"',
  'class="portal-modal exit-management-modal-dialog"',
  'class="modal-header exit-modal-header"',
  'class="exit-header-icon"',
  'class="exit-header-institution"',
  'class="exit-header-title"',
  'class="exit-header-subtitle"',
  'class="modal-close-x exit-close-btn"',
  'id="tcWorkflowStatusBadge"',
  'class="exit-student-summary-card"',
  'id="tcAvatar"',
  'id="tcStudentName"',
  'id="tcCurrentStatus"',
  'id="tcExitTypeBadge"',
  'class="summary-data-grid"',
  'id="tcStudentId"',
  'id="tcAdmNo"',
  'id="tcClassSec"',
  'id="tcRollNo"',
  'id="tcAcademicYear"',
  'id="tcTransportAllocation"',
  'class="summary-card-bottom"',
  'id="tcRequestRef"',
  'id="tcRequestDateDisplay"',
  'id="tcRequestingOfficerDisplay"',
  'id="tcReasonDisplay"',
  'class="exit-stepper-wrapper"',
  'class="exit-stepper"',
  'data-exit-tab="request"',
  'data-exit-tab="parent"',
  'data-exit-tab="clearance"',
  'data-exit-tab="conduct"',
  'data-exit-tab="tc"',
  'data-exit-tab="audit"',
  'id="exitModalBody"',
  'id="pane-exit-request"',
  'id="pane-exit-parent"',
  'id="pane-exit-clearance"',
  'id="pane-exit-conduct"',
  'id="pane-exit-tc"',
  'id="pane-exit-audit"',
  'class="modal-footer exit-modal-footer"',
  'class="exit-footer-nav-row"',
  'id="tcStageIndicator"',
  'id="tcStageProgressBar"',
  'id="btnExitPrevTab"',
  'id="btnExitNextTab"',
  'class="exit-footer-actions-row"',
  'id="btnSaveExitDraft"',
  'id="btnStage1Proceed"',
  'id="btnVerifyParentAction"',
  'id="btnCertifyClearances"',
  'id="btnSubmitForPrincipal"',
  'id="btnSaveConductAction"',
  'id="principalDecisionButtonGroup"',
  'id="btnGenerateOfficialTC"',
  'id="btnPrintExitTCAction"',
  'id="btnCompleteStudentExit"'
];

let missingElements = [];
requiredElements.forEach(item => {
  if (!html.includes(item)) {
    missingElements.push(item);
  }
});

if (missingElements.length > 0) {
  console.error('FAIL: Missing HTML elements:', missingElements);
} else {
  console.log('PASS: All 57 required HTML IDs and classes exist in index.html');
}

// 2. Verify portal.css
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');

const requiredCssTokens = [
  '#studentTransferWithdrawalModal.modal-backdrop',
  'width: min(1440px, 96vw) !important;',
  'height: 94vh !important;',
  'border-radius: 20px !important;',
  '.exit-modal-header',
  '.exit-header-icon',
  'white-space: normal !important;',
  '.exit-close-btn',
  '.exit-student-summary-card',
  '.summary-data-grid',
  'grid-template-columns: repeat(6, minmax(0, 1fr));',
  '.exit-stepper-wrapper',
  '.exit-stepper',
  'grid-template-columns: repeat(6, minmax(130px, 1fr));',
  '.stepper-step',
  '.stepper-step.active',
  '.stepper-step.completed',
  '.stepper-circle',
  'width: 32px;',
  '.stepper-title',
  'white-space: normal;',
  'word-break: break-word;',
  '.exit-modal-body',
  '.exit-modal-footer',
  '.exit-footer-nav-row',
  '.exit-footer-actions-row',
  '@media (max-width: 1200px)',
  '@media (max-width: 992px)',
  '@media (max-width: 768px)',
  '@media (max-width: 480px)'
];

let missingCss = [];
requiredCssTokens.forEach(token => {
  if (!css.includes(token)) {
    missingCss.push(token);
  }
});

if (missingCss.length > 0) {
  console.error('FAIL: Missing CSS tokens:', missingCss);
} else {
  console.log('PASS: All 30 required CSS selectors and properties exist in portal.css');
}

// 3. Test HTTP Server
http.get('http://localhost:5000/api/dashboard', res => {
  console.log('PASS: Application server responds with HTTP', res.statusCode);
  process.exit(missingElements.length === 0 && missingCss.length === 0 ? 0 : 1);
}).on('error', err => {
  console.error('FAIL: HTTP server error:', err.message);
  process.exit(1);
});
