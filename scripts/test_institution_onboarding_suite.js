const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: MODULE 5 INSTITUTION ONBOARDING & MIGRATION ===\n');

// 1. Verify HTML Structure in frontend/platform-admin/index.html
console.log('[CHECK 1] Verifying Section 5 Header, Sub-Navigation & Panes in HTML...');
const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');

assert(html.includes('id="view-onboarding"'), 'View #view-onboarding must exist in HTML');
assert(html.includes('btnObTabOverview'), 'Sub-nav tab #btnObTabOverview must exist');
assert(html.includes('btnObTabChecklist'), 'Sub-nav tab #btnObTabChecklist must exist');
assert(html.includes('btnObTabImports'), 'Sub-nav tab #btnObTabImports must exist');
assert(html.includes('id="obPaneOverview"'), 'Sub-pane #obPaneOverview must exist');
assert(html.includes('id="obPaneChecklist"'), 'Sub-pane #obPaneChecklist must exist');
assert(html.includes('id="obPaneImports"'), 'Sub-pane #obPaneImports must exist');
console.log('  ✓ Header, 3 sub-navigation tabs, and 3 content panes verified');

// 2. Verify 5.1 Onboarding Overview KPIs
console.log('\n[CHECK 2] Verifying Section 5.1 Onboarding Overview KPIs...');
const expectedKpis = [
  'kpiObAwaitingSetup',
  'kpiObIncompleteConfig',
  'kpiObPendingAdminInvites',
  'kpiObDomainPending',
  'kpiObImportsInProgress',
  'kpiObMigrationErrors'
];

expectedKpis.forEach(kpi => {
  assert(html.includes(`id="${kpi}"`), `KPI element #${kpi} must exist in HTML`);
});
assert(html.includes('id="obPipelinesTableBody"'), 'Active migration pipelines tbody must exist');
console.log('  ✓ All 6 statutory overview KPIs and pipeline queue table verified');

// 3. Verify 5.2 Onboarding Checklist
console.log('\n[CHECK 3] Verifying Section 5.2 12-Item Checklist Specification...');
assert(html.includes('id="obChecklistScope"'), 'Institution scope selector #obChecklistScope must exist');
assert(html.includes('id="obReadinessPct"'), 'Readiness percentage meter #obReadinessPct must exist');
assert(html.includes('id="obReadinessBar"'), 'Readiness progress bar #obReadinessBar must exist');
assert(html.includes('id="obReadinessBadge"'), 'Readiness certification badge #obReadinessBadge must exist');
assert(html.includes('id="obChecklistItemsContainer"'), 'Checklist container #obChecklistItemsContainer must exist');

const serviceCode = fs.readFileSync('backend/src/services/onboarding.service.js', 'utf8');
const expected12ChecklistItems = [
  'institution_profile',
  'initial_admin',
  'academic_year',
  'classes_sections',
  'staff_records',
  'student_records',
  'document_categories',
  'portal_domains',
  'email_delivery',
  'permissions_review',
  'backup_configured',
  'acceptance_testing'
];

expected12ChecklistItems.forEach(item => {
  assert(serviceCode.includes(item), `Checklist item '${item}' must be defined in OnboardingService`);
});
console.log('  ✓ All 12 onboarding checklist requirements verified with progress meter');

// 4. Verify 5.3 Data Import Centre & 10-Step Wizard Modal
console.log('\n[CHECK 4] Verifying Section 5.3 Data Import Centre & 10-Step Wizard Modal...');
assert(html.includes('id="obImportTypeFilter"'), 'Import type filter #obImportTypeFilter must exist');
assert(html.includes('id="obImportsTableBody"'), 'Import jobs table body #obImportsTableBody must exist');

const approvedDataTypes = [
  'students',
  'staff',
  'classes_sections',
  'subject_assignments',
  'guardian_records',
  'historical_attendance',
  'fee_balances'
];
approvedDataTypes.forEach(t => {
  assert(html.includes(`value="${t}"`), `Approved data type '${t}' must exist in filter/modal`);
});

// Verify 10-Step Wizard Modal
assert(html.includes('id="modalNewDataImport"'), '10-Step Wizard modal #modalNewDataImport must exist');
for (let step = 1; step <= 10; step++) {
  assert(html.includes(`id="impPaneStep${step}"`), `Wizard step pane #impPaneStep${step} must exist`);
}
assert(html.includes('id="impUpdatePolicy"'), 'Explicit update policy selector #impUpdatePolicy must exist');
assert(html.includes('reject_duplicates'), 'Update policy must support reject_duplicates');
assert(html.includes('skip_existing'), 'Update policy must support skip_existing');
assert(html.includes('update_existing'), 'Update policy must support update_existing');
assert(html.includes('id="impCheckDryRun"'), 'Dry-run simulation checkbox #impCheckDryRun must exist');
assert(html.includes('id="btnDownloadErrorList"'), 'Downloadable error list button #btnDownloadErrorList must exist');
console.log('  ✓ 5.3 Data Import Centre, all 7 approved data types, and 10-Step Wizard verified');

// 5. Verify Controller Exports in frontend/js/platform-admin.js
console.log('\n[CHECK 5] Verifying JavaScript Controller Exports in platformApp...');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');
const expectedMethods = [
  'switchOnboardingTab',
  'loadOnboardingOverview',
  'refreshOnboardingOverview',
  'switchChecklistInstitution',
  'loadInstitutionChecklist',
  'runInstitutionAuditCheck',
  'loadImportJobs',
  'filterImportJobs',
  'openNewImportWizard',
  'goToImportStep',
  'nextImportStep',
  'prevImportStep',
  'handleImportFileSelected',
  'switchImportPreviewSubTab',
  'downloadImportErrorsCSV',
  'downloadImportTemplates'
];

expectedMethods.forEach(method => {
  assert(js.includes(method), `Method '${method}' must be implemented in platform-admin.js`);
});
console.log(`  ✓ All ${expectedMethods.length} Module 5 controller methods verified in platform-admin.js`);

// 6. Verify Backend Architecture
console.log('\n[CHECK 6] Verifying Backend Architecture...');
assert(fs.existsSync('backend/src/models/onboarding.model.js'), 'onboarding.model.js must exist');
assert(fs.existsSync('backend/src/services/onboarding.service.js'), 'onboarding.service.js must exist');
assert(fs.existsSync('backend/src/controllers/onboarding.controller.js'), 'onboarding.controller.js must exist');
assert(fs.existsSync('backend/src/routes/onboarding.routes.js'), 'onboarding.routes.js must exist');

const routesCode = fs.readFileSync('backend/src/routes/index.js', 'utf8');
assert(routesCode.includes("platformRouter.use('/onboarding'"), 'Routes must mount onboarding in platformRouter');
console.log('  ✓ Backend model, service, controller, and mounted routes verified');

// 7. Verify Onboarding Service Logic Direct Execution
console.log('\n[CHECK 7] Verifying OnboardingService direct methods execution...');
const OnboardingService = require('../backend/src/services/onboarding.service');

(async () => {
  try {
    const overview = await OnboardingService.getOnboardingOverview();
    assert(overview.success, 'Overview must return success: true');
    assert(overview.summary, 'Overview must have summary object');
    assert(typeof overview.summary.institutionsAwaitingSetup === 'number', 'Summary must have institutionsAwaitingSetup count');
    assert(typeof overview.summary.incompleteConfiguration === 'number', 'Summary must have incompleteConfiguration count');
    assert(typeof overview.summary.pendingAdminInvitations === 'number', 'Summary must have pendingAdminInvitations count');
    assert(typeof overview.summary.domainVerificationPending === 'number', 'Summary must have domainVerificationPending count');
    assert(typeof overview.summary.dataImportsInProgress === 'number', 'Summary must have dataImportsInProgress count');
    assert(typeof overview.summary.migrationErrors === 'number', 'Summary must have migrationErrors count');
    console.log('  ✓ getOnboardingOverview() executed and returned all 6 KPIs');

    const checklist = await OnboardingService.getInstitutionChecklist('INST-001');
    assert(checklist.success, 'Checklist must return success: true');
    assert(checklist.data.items.length === 12, 'Checklist must contain exactly 12 statutory items');
    assert(checklist.data.overallProgress > 0, 'Checklist must calculate overall progress');
    console.log('  ✓ getInstitutionChecklist() verified with 12 items and progress calculation');

    const newJob = await OnboardingService.createImportJob({
      institutionId: 'INST-001',
      dataType: 'students',
      sourceFileName: 'Test_Students.csv'
    });
    assert(newJob.success, 'createImportJob must succeed');
    assert(newJob.data.jobId.startsWith('IMP-'), 'Job ID must have prefix IMP-');

    const executed = await OnboardingService.executeImport(newJob.data.jobId, 'Test Operator', true);
    assert(executed.success, 'executeImport must succeed');
    assert(executed.data.isDryRun === true, 'executeImport dry-run flag must be respected');

    const csvErrors = await OnboardingService.exportImportErrorsCSV(newJob.data.jobId);
    assert(csvErrors.includes('Row Number'), 'CSV error list must have headers');
    console.log('  ✓ 10-step import job lifecycle, dry-run simulation, and error CSV export verified');

    console.log('\n======================================================');
    console.log('MODULE 5 ONBOARDING & MIGRATION VERIFICATION PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('Direct execution error:', err);
    process.exit(1);
  }
})();

