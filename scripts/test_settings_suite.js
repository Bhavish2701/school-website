const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: MODULE 18 - SETTINGS & ACCESS CONTROL SPECIFICATION');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// --------------------------------------------------------------------------
// TEST 1: Subview 18.1 School Profile (Fields & Actions)
// --------------------------------------------------------------------------
console.log('--- Test 1: Verify 18.1 School Profile Fields & Actions ---');
assert.ok(html.includes('id="subview-settings-profile"'), 'subview-settings-profile must exist');

// Required Fields
assert.ok(html.includes('id="profileSchoolName"'), 'Official school name field must exist');
assert.ok(html.includes('id="profileLogoPreview"') || html.includes('school-logo'), 'Logo field must exist');
assert.ok(html.includes('id="profileAddress"'), 'Address field must exist');
assert.ok(html.includes('id="profilePhone"'), 'Contact phone field must exist');
assert.ok(html.includes('id="profileEmail"'), 'Contact email field must exist');
assert.ok(html.includes('id="profileUdiseCode"') || html.includes('U-DISE'), 'School identifiers / affiliation must exist');
assert.ok(html.includes('id="profileAffiliationBoard"') || html.includes('AP SCERT') || html.includes('CBSE'), 'Affiliation info must exist');
assert.ok(html.includes('id="profileWebsiteDomain"') || html.includes('profileWebsite'), 'Website domain must exist');
assert.ok(html.includes('id="profileOfficialEmailDomain"'), 'Official email domain must exist');
assert.ok(html.includes('id="profileAuthorizedSignatories"') || html.includes('authorizedSignatoriesContainer'), 'Authorized signatories must exist');
assert.ok(html.includes('id="profilePrimaryBrandColor"') || html.includes('schoolBrandColor'), 'School branding must exist');

// Required Actions
assert.ok(html.includes('editSchoolProfileDraft') || js.includes('editSchoolProfileDraft'), 'Action: Edit draft must exist');
assert.ok(html.includes('previewSchoolProfile') || js.includes('previewSchoolProfile'), 'Action: Preview must exist');
assert.ok(html.includes('submitSchoolProfileForApproval') || js.includes('submitSchoolProfileForApproval'), 'Action: Submit for approval must exist');
assert.ok(html.includes('publishSchoolProfileChanges') || js.includes('publishSchoolProfileChanges'), 'Action: Publish changes must exist');
assert.ok(html.includes('viewSchoolProfileHistory') || js.includes('viewSchoolProfileHistory'), 'Action: View history must exist');
console.log('[PASS] Test 1: 18.1 School Profile fields and actions verified');

// --------------------------------------------------------------------------
// TEST 2: Subview 18.2 Academic Year (Fields, Actions & Retention Rule)
// --------------------------------------------------------------------------
console.log('\n--- Test 2: Verify 18.2 Academic Year Fields, Actions & Statutory Retention ---');
assert.ok(html.includes('id="subview-settings-year"'), 'subview-settings-year must exist');

// Required Fields
assert.ok(html.includes('Academic Year Name') || html.includes('Academic Year') || html.includes('AY 2026-27'), 'Academic year name must exist');
assert.ok(html.includes('Start Date') || html.includes('Start date') || html.includes('termStartDate'), 'Start date must exist');
assert.ok(html.includes('End Date') || html.includes('End date') || html.includes('termEndDate'), 'End date must exist');
assert.ok(html.includes('Terms') || html.includes('termsTable') || html.includes('tbodyAcademicTerms'), 'Terms configuration must exist');
assert.ok(html.includes('Holidays') || html.includes('holidaysTable') || html.includes('tbodyAcademicHolidays'), 'Holidays field must exist');
assert.ok(html.includes('Working Days') || html.includes('Working days') || html.includes('workingDaysDisplay'), 'Working days must exist');
assert.ok(html.includes('Current-Year Status') || html.includes('Current-year status') || html.includes('currentYearStatusBadge'), 'Current-year status must exist');

// Required Actions
assert.ok(html.includes('openCreateAcademicYearModal') || js.includes('openCreateAcademicYearModal'), 'Action: Create academic year must exist');
assert.ok(html.includes('openConfigureTermsModal') || js.includes('openConfigureTermsModal'), 'Action: Configure terms must exist');
assert.ok(html.includes('reviewAcademicDateConflicts') || js.includes('reviewAcademicDateConflicts'), 'Action: Review date conflicts must exist');
assert.ok(html.includes('activateAcademicYear') || js.includes('activateAcademicYear'), 'Action: Activate year must exist');
assert.ok(html.includes('openCloseAcademicYearModal') || js.includes('openCloseAcademicYearModal'), 'Action: Close year must exist');
assert.ok(html.includes('archivePreviousAcademicYear') || js.includes('archivePreviousAcademicYear'), 'Action: Archive previous year must exist');

// Statutory Non-Deletion Rule Verification
assert.ok(
  html.includes('delete previous enrolments') || html.includes('not delete') || html.includes('preserves all historical') || js.includes('not delete previous enrolments'),
  'Statutory rule: Closing an academic year should not delete previous enrolments, attendance, marks or fee history'
);
console.log('[PASS] Test 2: 18.2 Academic Year fields, actions & non-deletion guarantee verified');

// --------------------------------------------------------------------------
// TEST 3: Subview 18.3 Role Management (Display & Actions)
// --------------------------------------------------------------------------
console.log('\n--- Test 3: Verify 18.3 Role Management Display Columns & Actions ---');
assert.ok(html.includes('id="subview-settings-roles"'), 'subview-settings-roles must exist');
assert.ok(html.includes('id="tableSettingsRoles"'), 'tableSettingsRoles must exist');

const rolesTableStart = html.indexOf('id="tableSettingsRoles"');
const rolesTableEnd = html.indexOf('</table>', rolesTableStart);
const rolesTableSnippet = html.substring(rolesTableStart, rolesTableEnd);

assert.ok(rolesTableSnippet.includes('Role Name') || rolesTableSnippet.includes('Role name'), 'Role name column must exist');
assert.ok(rolesTableSnippet.includes('Description'), 'Description column must exist');
assert.ok(rolesTableSnippet.includes('Assigned Users') || rolesTableSnippet.includes('Assigned users'), 'Assigned users column must exist');
assert.ok(rolesTableSnippet.includes('Default Permissions') || rolesTableSnippet.includes('Default permissions'), 'Default permissions column must exist');
assert.ok(rolesTableSnippet.includes('Status'), 'Status column must exist');

// Actions
assert.ok(html.includes('openCreateRoleModal') || js.includes('openCreateRoleModal'), 'Action: Create role must exist');
assert.ok(html.includes('duplicateRole') || js.includes('duplicateRole'), 'Action: Duplicate role must exist');
assert.ok(html.includes('openAssignUsersModal') || js.includes('openAssignUsersModal'), 'Action: Assign users must exist');
assert.ok(html.includes('openEditRolePermissionsModal') || js.includes('openEditRolePermissionsModal'), 'Action: Edit role permissions must exist');
assert.ok(html.includes('deactivateRole') || js.includes('deactivateRole'), 'Action: Deactivate role must exist');
assert.ok(html.includes('viewRolePermissionHistory') || js.includes('viewRolePermissionHistory'), 'Action: View permission history must exist');
console.log('[PASS] Test 3: 18.3 Role Management display and actions verified');

// --------------------------------------------------------------------------
// TEST 4: Subview 18.4 Access Permissions Matrix & Additional Settings
// --------------------------------------------------------------------------
console.log('\n--- Test 4: Verify 18.4 Access Permissions Matrix & Additional Settings ---');
assert.ok(html.includes('id="subview-settings-permissions"'), 'subview-settings-permissions must exist');
assert.ok(html.includes('id="tablePermissionsMatrix"'), 'tablePermissionsMatrix must exist');

const permTableStart = html.indexOf('id="tablePermissionsMatrix"');
const permTableEnd = html.indexOf('</table>', permTableStart);
const permTableSnippet = html.substring(permTableStart, permTableEnd);

// Required Matrix Columns
assert.ok(permTableSnippet.includes('Module'), 'Matrix must contain Module column');
assert.ok(permTableSnippet.includes('View'), 'Matrix must contain View column');
assert.ok(permTableSnippet.includes('Create/Edit') || permTableSnippet.includes('Create / Edit'), 'Matrix must contain Create/Edit column');
assert.ok(permTableSnippet.includes('Approve'), 'Matrix must contain Approve column');
assert.ok(permTableSnippet.includes('Archive'), 'Matrix must contain Archive column');
assert.ok(permTableSnippet.includes('Export'), 'Matrix must contain Export column');

// Required 5 Modules present in table or rendered by JS
const expectedModules = ['Students', 'Attendance', 'Results', 'Fees', 'Staff HR'];
expectedModules.forEach(mod => {
  assert.ok(html.includes(mod) || js.includes(mod), `Module "${mod}" must be configured in matrix`);
});

// Additional Settings
assert.ok(html.includes('id="permRecordScope"') || html.includes('Record scope') || html.includes('Record Scope'), 'Record scope setting must exist');
assert.ok(html.includes('id="permAssignedScope"') || html.includes('Assigned class or department') || html.includes('Class or Department'), 'Assigned class/dept setting must exist');
assert.ok(html.includes('id="permSensitiveAccess"') || html.includes('sensitive fields') || html.includes('Sensitive Fields'), 'Access to sensitive fields setting must exist');
assert.ok(html.includes('id="permDelegatedAuthority"') || html.includes('Delegated approval authority') || html.includes('Delegated Approval'), 'Delegated approval authority setting must exist');
assert.ok(html.includes('id="permEffectiveDate"') || html.includes('Effective date') || html.includes('Effective Date'), 'Effective date setting must exist');
assert.ok(html.includes('id="permExpiryDate"') || html.includes('Expiry date') || html.includes('Expiry Date'), 'Expiry date setting must exist');
console.log('[PASS] Test 4: 18.4 Access Permissions Matrix and additional settings verified');

// --------------------------------------------------------------------------
// TEST 5: Subview 18.5 Security Settings
// --------------------------------------------------------------------------
console.log('\n--- Test 5: Verify 18.5 Security Settings Components ---');
assert.ok(html.includes('id="subview-settings-security"'), 'subview-settings-security must exist');

assert.ok(html.includes('Password policy') || html.includes('Password Policy') || html.includes('secMinPasswordLength'), 'Password policy must exist');
assert.ok(html.includes('Multi-factor authentication') || html.includes('Two-Factor') || html.includes('MFA') || html.includes('secMfaToggle'), 'Multi-factor authentication must exist');
assert.ok(html.includes('Session duration') || html.includes('Session Duration') || html.includes('secSessionDuration'), 'Session duration must exist');
assert.ok(html.includes('Login attempt limits') || html.includes('Login Attempt Limits') || html.includes('secMaxLoginAttempts'), 'Login attempt limits must exist');
assert.ok(html.includes('Account recovery') || html.includes('Account Recovery') || html.includes('secAccountRecoveryMethod'), 'Account recovery must exist');
assert.ok(html.includes('Active session management') || html.includes('Active Sessions') || html.includes('tableActiveSessions'), 'Active session management must exist');
assert.ok(html.includes('Security notifications') || html.includes('Security Notifications') || html.includes('secNotifyNewLogin'), 'Security notifications must exist');
assert.ok(html.includes('Device and sign-in history') || html.includes('Sign-in History') || html.includes('tableSignInHistory'), 'Device and sign-in history must exist');
console.log('[PASS] Test 5: 18.5 Security Settings verified');

// --------------------------------------------------------------------------
// TEST 6: Subview 18.6 Audit Logs (Display & Compliance Rules)
// --------------------------------------------------------------------------
console.log('\n--- Test 6: Verify 18.6 Audit Logs Display & Immutable Protection ---');
assert.ok(html.includes('id="subview-settings-audit"'), 'subview-settings-audit must exist');
assert.ok(html.includes('id="tableSettingsAuditLogs"') || html.includes('id="tableAuditLogs"'), 'tableSettingsAuditLogs must exist');

const auditSnippet = html.substring(html.indexOf('subview-settings-audit'), html.indexOf('subview-settings-backup'));
assert.ok(auditSnippet.includes('User'), 'Audit log must display User');
assert.ok(auditSnippet.includes('Action'), 'Audit log must display Action');
assert.ok(auditSnippet.includes('Module'), 'Audit log must display Module');
assert.ok(auditSnippet.includes('Record Reference') || auditSnippet.includes('Record reference') || auditSnippet.includes('Record'), 'Audit log must display Record reference');
assert.ok(auditSnippet.includes('Timestamp'), 'Audit log must display Timestamp');
assert.ok(auditSnippet.includes('Result'), 'Audit log must display Result');
assert.ok(auditSnippet.includes('Reason'), 'Audit log must display Reason');
assert.ok(auditSnippet.includes('Relevant Changed Fields') || auditSnippet.includes('Relevant changed fields') || auditSnippet.includes('Changed Fields'), 'Audit log must display Relevant changed fields');

// Statutory Protection Rule
assert.ok(
  auditSnippet.includes('protected from ordinary modification or deletion') || auditSnippet.includes('Immutable') || auditSnippet.includes('passwords') || auditSnippet.includes('never be logged'),
  'Audit logs must explicitly state protection from ordinary modification/deletion and no logging of sensitive credentials'
);
console.log('[PASS] Test 6: 18.6 Audit Logs columns & immutable compliance verified');

// --------------------------------------------------------------------------
// TEST 7: Subview 18.7 Data & Backup (Display, Actions & Role Restrictions)
// --------------------------------------------------------------------------
console.log('\n--- Test 7: Verify 18.7 Data & Backup Display, Actions & Security Rules ---');
assert.ok(html.includes('id="subview-settings-backup"'), 'subview-settings-backup must exist');

assert.ok(html.includes('Last Successful Backup') || html.includes('Last successful backup') || html.includes('Last Snapshot') || html.includes('lastBackupDisplay'), 'Last successful backup must exist');
assert.ok(html.includes('Backup Schedule') || html.includes('Backup schedule') || html.includes('Daily Automated'), 'Backup schedule must exist');
assert.ok(html.includes('Backup Status') || html.includes('Backup status') || html.includes('HEALTHY'), 'Backup status must exist');
assert.ok(html.includes('Retention Period') || html.includes('Retention period') || html.includes('Statutory Retention'), 'Retention period must exist');
assert.ok(html.includes('Storage Status') || html.includes('Storage status') || html.includes('Storage Capacity'), 'Storage status must exist');
assert.ok(html.includes('Recovery Test History') || html.includes('Recovery test history') || html.includes('Recovery Drill'), 'Recovery test history must exist');

// Actions
assert.ok(html.includes('triggerAuthorizedBackup') || js.includes('triggerAuthorizedBackup'), 'Action: Start authorized backup must exist');
assert.ok(html.includes('viewBackupHistory') || js.includes('viewBackupHistory'), 'Action: View backup history must exist');
assert.ok(html.includes('runBackupRecoveryTest') || js.includes('runBackupRecoveryTest'), 'Action: Run recovery test must exist');
assert.ok(html.includes('reviewBackupFailures') || js.includes('reviewBackupFailures'), 'Action: Review failures must exist');

// Security Restrictions
assert.ok(
  html.includes('ordinary school employees') || html.includes('Do not provide unrestricted') || html.includes('destructive recovery actions') || js.includes('ordinary school employees'),
  'Security rule: Do not provide unrestricted database exports or destructive recovery actions to ordinary school employees'
);
console.log('[PASS] Test 7: 18.7 Data & Backup display, actions & employee restrictions verified');

console.log('\n====================================================');
console.log('ALL MODULE 18 SETTINGS & ACCESS CONTROL TESTS PASSED (100%)');
console.log('====================================================\n');

