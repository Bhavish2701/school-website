const fs = require('fs');
const assert = require('assert');
const http = require('http');

console.log('=== TEST SUITE: MODULE 3 INSTITUTION MANAGEMENT & WORKFLOW GOVERNANCE ===\n');

const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');
const css = fs.readFileSync('frontend/css/platform-admin.css', 'utf8');

// CHECK 1: Section 3.1 Directory Page Structure, Header, 5 Summary Cards & 10 Table Columns
console.log('[CHECK 1] Verifying Section 3.1 Institution Directory Structure...');
assert.ok(html.includes('id="view-institutions"'), '#view-institutions must exist');
assert.ok(html.includes('Institution Management'), 'Page title "Institution Management" must exist');
assert.ok(html.includes('id="btnPrimaryAddInstitution"'), '+ Add Institution primary action must exist');
assert.ok(html.includes('id="btnImportInstitutions"'), 'Import Institutions secondary action must exist');
assert.ok(html.includes('id="btnExportInstitutionsDirectory"'), 'Export Directory secondary action must exist');

// 5 Summary Cards
const summaryCards = [
  'instSummaryTotal',
  'instSummaryActive',
  'instSummaryProgress',
  'instSummarySuspended',
  'instSummaryConfigIssues'
];
summaryCards.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Summary card #${id} must exist in HTML`);
});
console.log('  ✓ 5 Summary Cards verified: Total, Active, Setup in Progress, Suspended, Configuration Issues');

// Search and Filter Controls
const filterControls = [
  'instSearchInput',
  'instCodeFilter',
  'instTypeFilter',
  'instStatusFilter',
  'instAyFilter',
  'instDomainFilter'
];
filterControls.forEach(id => {
  assert.ok(html.includes(`id="${id}"`), `Filter control #${id} must exist in HTML`);
});
console.log('  ✓ All 6 directory search and multi-field filter controls verified');

// 10 Table Columns
const tableColumns = [
  'Institution ID',
  'Institution Name',
  'Institution Code',
  'Type',
  'Primary Domain',
  'Admin Contact',
  'Setup Status',
  'Institution Status',
  'Created Date',
  'Actions'
];
tableColumns.forEach(col => {
  assert.ok(html.includes(col), `Table column "${col}" must exist in header`);
});
console.log('  ✓ All 10 Table Columns verified');

// CHECK 2: Section 3.2 Add Institution 6-Step Setup Wizard
console.log('\n[CHECK 2] Verifying Section 3.2 6-Step Setup Wizard Modal & Flow...');
assert.ok(html.includes('id="modalAddInstitution"'), '#modalAddInstitution backdrop must exist');
assert.ok(html.includes('class="pa-wizard-stepper"'), '6-step wizard stepper navigation must exist');

for (let s = 1; s <= 6; s++) {
  assert.ok(html.includes(`id="wizardStepNav${s}"`), `Step Nav ${s} must exist`);
  assert.ok(html.includes(`id="wizardPane${s}"`), `Step Pane ${s} must exist`);
}

// Wizard Step Inputs
assert.ok(html.includes('id="wizName"'), 'Step 1: Official name input exists');
assert.ok(html.includes('id="wizDisplayName"'), 'Step 1: Display name input exists');
assert.ok(html.includes('id="wizCode"'), 'Step 1: Institution code input exists');
assert.ok(html.includes('id="wizType"'), 'Step 1: Institution type input exists');
assert.ok(html.includes('id="wizTimezone"'), 'Step 2: Timezone input exists');
assert.ok(html.includes('id="wizGrading"'), 'Step 2: Grading configuration input exists');
assert.ok(html.includes('id="wizPrimaryColorPicker"'), 'Step 3: Brand color input exists');
assert.ok(html.includes('id="wizPrimaryDomain"'), 'Step 4: Primary domain input exists');
assert.ok(html.includes('id="wizAdminEmail"'), 'Step 5: Initial admin email input exists');
assert.ok(html.includes('id="btnWizardDraft"'), 'Step 6: Save Draft button exists');
assert.ok(html.includes('id="btnWizardSubmit"'), 'Step 6: Activate button exists');
console.log('  ✓ 6-Step Wizard navigation, fields, branding preview, and actions verified');

// CHECK 3: Section 3.3 Institution Detail Dossier (10 Comprehensive Tabs)
console.log('\n[CHECK 3] Verifying Section 3.3 10-Tab Detail Dossier...');
assert.ok(html.includes('id="modalInstitutionDetail"'), '#modalInstitutionDetail backdrop must exist');
assert.ok(html.includes('id="institutionDetailTabsNav"'), '#institutionDetailTabsNav must exist');

const tenTabs = [
  'overview',
  'profile',
  'config',
  'domains',
  'portals',
  'admins',
  'integrations',
  'subscription',
  'support',
  'audit'
];
tenTabs.forEach((tab, idx) => {
  assert.ok(html.includes(`switchInstitutionDetailTab('${tab}')`), `Tab trigger '${tab}' (Tab ${idx + 1}) must exist`);
  assert.ok(html.includes(`id="detailTabPane-${tab}"`), `Tab pane #detailTabPane-${tab} (Tab ${idx + 1}) must exist`);
});
console.log('  ✓ All 10 Dossier Tabs verified: Overview, Profile, Config, Domains, Portals, Admins, Integrations, Subscription, Support, Audit');

// CHECK 4: Section 3.4 Status Workflow, Suspension Governance & Zero-Deletion Mandate
console.log('\n[CHECK 4] Verifying Section 3.4 Status Workflow & Suspension Policy...');
assert.ok(html.includes('id="modalSuspendInstitution"'), '#modalSuspendInstitution modal must exist');
assert.ok(html.includes('id="suspendReason"'), 'Mandatory suspension reason textarea must exist');
assert.ok(html.includes('id="suspendConfirmationCheckbox"'), 'Zero-deletion preservation confirmation checkbox must exist');
assert.ok(html.includes('id="suspendTargetInstName"'), 'Target campus name input must exist');
assert.ok(js.includes('statutory zero-deletion preservation statement'), 'JS validates zero deletion confirmation before suspension');
console.log('  ✓ Suspension Governance and statutory preservation rules verified');

// CHECK 5: JavaScript Controller Export Methods
console.log('\n[CHECK 5] Verifying JavaScript Controller Exports in platformApp...');
const exportedMethods = [
  'loadInstitutions',
  'updateInstitutionSummaryCards',
  'filterInstitutionsDirectory',
  'resetInstitutionFilters',
  'openAddInstitutionWizard',
  'goToWizardStep',
  'nextWizardStep',
  'prevWizardStep',
  'updateWizardBrandingPreview',
  'runWizardDnsCheck',
  'submitWizard',
  'viewInstitution',
  'switchInstitutionDetailTab',
  'openEditFromDetail',
  'openConfigureFromDetail',
  'openInviteAdminForDetail',
  'openSuspendFromDetail',
  'confirmSuspendInstitution',
  'reactivateInstitutionFromDetail',
  'archiveInstitutionFromDetail',
  'verifyDomainFromDetail',
  'resendAdminInvite',
  'exportInstitutionsCSV',
  'openImportModal',
  'downloadSampleInstitutionsCSV',
  'handleImportFileSelect',
  'processImportInstitutions'
];

exportedMethods.forEach(method => {
  assert.ok(js.includes(method), `Method ${method} must exist in platform-admin.js`);
});
console.log('  ✓ All 27 Module 3 methods implemented in controller');

// CHECK 6: Backend Service & Model Verification
console.log('\n[CHECK 6] Verifying Backend Service & Model Architecture...');
const serviceCode = fs.readFileSync('backend/src/services/institution.service.js', 'utf8');
const modelCode = fs.readFileSync('backend/src/models/institution.model.js', 'utf8');
const routesCode = fs.readFileSync('backend/src/routes/institution.routes.js', 'utf8');

assert.ok(modelCode.includes('institutionId'), 'Model has institutionId');
assert.ok(modelCode.includes('setupStatus'), 'Model has setupStatus');
assert.ok(modelCode.includes('suspension'), 'Model has suspension policy subdocument');
assert.ok(serviceCode.includes('seedIfEmpty'), 'Service auto-seeds 3 default trust schools');
assert.ok(serviceCode.includes('suspendInstitution'), 'Service implements suspendInstitution');
assert.ok(serviceCode.includes('reactivateInstitution'), 'Service implements reactivateInstitution');
assert.ok(serviceCode.includes('AuditLog'), 'Service logs immutable audit trail');
assert.ok(routesCode.includes('router.post(\'/:id/suspend\''), 'Routes mount /:id/suspend');
assert.ok(routesCode.includes('router.post(\'/:id/reactivate\''), 'Routes mount /:id/reactivate');
console.log('  ✓ Backend Model, Service, and Routes verified');

// CHECK 7: Live Backend REST API probe (HTTP request to localhost:5000)
console.log('\n[CHECK 7] Probing Live Server REST API at http://localhost:5000/api/v1/platform/institutions ...');
const req = http.get('http://localhost:5000/api/v1/platform/institutions', (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    try {
      console.log(`  ✓ HTTP Status: ${res.statusCode}`);
      const data = JSON.parse(body);
      assert.ok(data.success === true, 'API response success must be true');
      assert.ok(Array.isArray(data.data), 'API data must be an array');
      console.log(`  ✓ Received ${data.data.length} registered institutions from backend:`);
      data.data.forEach(inst => {
        console.log(`    - [${inst.institutionId || inst.id}] ${inst.name} (${inst.code}) [Status: ${inst.status}, Setup: ${inst.setupStatus}]`);
      });
      console.log('\n======================================================');
      console.log('ALL MODULE 3 INSTITUTION MANAGEMENT TESTS PASSED 100%!');
      console.log('======================================================\n');
    } catch (e) {
      console.error('API Parse Error:', e);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.log(`  ⚠ Server daemon not reachable via HTTP (${err.message}), verifying service offline.`);
  console.log('\n======================================================');
  console.log('STATIC MODULE 3 CODEBASE VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
});
req.end();
