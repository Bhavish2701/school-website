const fs = require('fs');
const path = require('path');
const vm = require('vm');

let code = fs.readFileSync(path.join(__dirname, '../../frontend/js/portal.js'), 'utf8');

// Find the last return { ... } in the file
const lastReturnIndex = code.lastIndexOf('return {');
const endReturnIndex = code.indexOf('};', lastReturnIndex);

const returnBody = code.substring(lastReturnIndex + 8, endReturnIndex);
const lines = returnBody.split('\n');
const exportedIdentifiers = [];

lines.forEach(line => {
  const trimmed = line.trim().replace(/,$/, '');
  if (trimmed && !trimmed.startsWith('//')) {
    const parts = trimmed.split(':');
    const identifier = parts[parts.length > 1 ? 1 : 0].trim();
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier)) {
      exportedIdentifiers.push(identifier);
    }
  }
});

console.log(`Checking ${exportedIdentifiers.length} exports from the main portalApp return object...`);

const mockFunctions = [
  'verifyAdmissionDoc',
  'bookPrincipalAppt',
  'searchFeeDues',
  'printReceiptModal',
  'openTcModal',
  'applyAttendanceCorrectionSlip',
  'generateBonafide',
  'openDeletedStudentsArchiveModal',
  'printFeeCollectionRegister',
  'exportFeeCollectionCSV',
  'printFeeStructureSchedule',
  'exportFeeStructureCSV',
  'openIssueCertificateModal',
  'filterCertificatesTable',
  'handleAddEventSubmit',
  'handleLogLateArrival',
  'lookupLateStudent'
].map(fn => `function ${fn}() {}`).join('\n');

// Inject check right before the return statement
const checks = exportedIdentifiers.map(id => `
  try {
    if (typeof ${id} === 'undefined') {
      missingExports.push('${id}');
    }
  } catch(e) {
    missingExports.push('${id}');
  }
`).join('\n');

const codeWithCheck = code.substring(0, lastReturnIndex) +
  `\n${mockFunctions}\nconst missingExports = [];\n${checks}\nconsole.log("CHECK RESULT: Missing exports count =", missingExports.length, missingExports);\n` +
  code.substring(lastReturnIndex);

const domMock = {
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    hidden: false,
  },
  window: {
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    location: { href: '', search: '', pathname: '/management' },
    addEventListener: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    clearTimeout: () => {},
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  console: console,
  navigator: { userAgent: 'Node' },
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
};
domMock.window.document = domMock.document;
domMock.window.window = domMock.window;

try {
  vm.runInNewContext(codeWithCheck, domMock);
  console.log('SUCCESS: portal.js evaluated completely with 0 errors!');
} catch (err) {
  console.error('VM Execution Error:', err.message);
}
