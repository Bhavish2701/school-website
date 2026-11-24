const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
const cssPath = path.join(__dirname, '../../frontend/css/portal.css');
const jsPath = path.join(__dirname, '../../frontend/js/portal.js');

console.log('--- Sri Vidya Official Transfer Certificate (TC) Verification ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Check HTML
const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('id="printableExitTC"'), 'printableExitTC container exists');
assert(html.includes('class="exit-tc-sheet-wrapper"'), 'exit-tc-sheet-wrapper exists');
assert(html.includes('class="exit-tc-sheet"'), 'exit-tc-sheet exists');
assert(html.includes('class="exit-tc-outer-frame"'), 'exit-tc-outer-frame exists');
assert(html.includes('class="exit-tc-inner-frame"'), 'exit-tc-inner-frame exists');
assert(html.includes('SRI VIDYA ENGLISH MEDIUM HIGH SCHOOL'), 'Official school name in TC header');
assert(html.includes('28111500408'), 'U-DISE code displayed in TC header');
assert(html.includes('Rc.No. 412/A4/2017'), 'Recognition order Rc.No displayed in TC header');
assert(html.includes('03042'), 'School Code 03042 displayed in TC header');
assert(html.includes('TRANSFER CERTIFICATE'), 'Certificate Heading displayed');
assert(html.includes('APPENDIX 16, RULE 99'), 'Statutory Appendix 16 Rule 99 subtitle displayed');
assert(html.includes('class="tc-particulars-table"'), '21-point statutory particulars table present');
assert(html.includes('class="tc-signatories-grid"'), '3-column official signatories grid present');
assert(html.includes('class="tc-circular-seal"'), 'Institutional circular seal present');
assert(html.includes('Gorle Varalakshmi'), 'Executive Principal name present');
assert(html.includes('Ch. Venkat'), 'Head Clerk name present');

// Check all dynamic element IDs referenced in JS
const requiredIds = [
  'tcDocSerial',
  'tcDocAdmNo',
  'tcDocPenNo',
  'tcDocIssueDate',
  'tcDocStudentName',
  'tcDocAadhaar',
  'tcDocFatherName',
  'tcDocMotherName',
  'tcDocNationalityReligion',
  'tcDocCasteCategory',
  'tcDocDob',
  'tcDocClass',
  'tcDocMedium',
  'tcDocSubjects',
  'tcDocPromotion',
  'tcDocWorkingDays',
  'tcDocLastAttendance',
  'tcDocFeeStatus',
  'tcDocConcession',
  'tcDocLeavingDate',
  'tcDocAppDate',
  'tcDocIssueDateRow',
  'tcDocReason',
  'tcDocConduct',
  'tcDocIdentification',
  'tcDocRemarks',
  'tcDocSignDateClerk',
  'tcDocSignDatePrinc',
  'tcDocSecurityHash'
];

requiredIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `Dynamic element ID #${id} exists in HTML`);
});

// 2. Check CSS
const css = fs.readFileSync(cssPath, 'utf8');
assert(css.includes('.exit-tc-sheet-wrapper'), '.exit-tc-sheet-wrapper CSS class exists');
assert(css.includes('.exit-tc-sheet'), '.exit-tc-sheet CSS class exists');
assert(css.includes('.exit-tc-outer-frame'), '.exit-tc-outer-frame CSS class exists');
assert(css.includes('.exit-tc-inner-frame'), '.exit-tc-inner-frame CSS class exists');
assert(css.includes('.tc-particulars-table'), '.tc-particulars-table CSS class exists');
assert(css.includes('.tc-signatories-grid'), '.tc-signatories-grid CSS class exists');
assert(css.includes('.tc-circular-seal'), '.tc-circular-seal CSS class exists');
assert(css.includes('@page'), 'A4 print @page directive exists');
assert(css.includes('size: A4 portrait') || css.includes('A4 portrait'), 'A4 portrait print setup exists');

// 3. Check JS
const js = fs.readFileSync(jsPath, 'utf8');
assert(js.includes('function updateTCPrintableSheet('), 'updateTCPrintableSheet function exists');
assert(js.includes('function printExitTC('), 'printExitTC function exists');
assert(js.includes('function downloadExitTCPdf('), 'downloadExitTCPdf function exists');
assert(js.includes('AUTHORIZATION PENDING'), 'Draft handling exists when not approved');
assert(js.includes('SV/TC/2026/'), 'Official serial prefix generated on approval');
assert(js.includes('tcDocSecurityHash'), 'Security verification hash generated');

console.log(`\nVerification complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ All verification tests passed successfully!');
}
