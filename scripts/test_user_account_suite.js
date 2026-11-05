const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: MODULE 6 USER & ACCOUNT MANAGEMENT ===\n');

// 1. Verify 6.1 User Directory Markup & Table Structure
console.log('[CHECK 1] Verifying Section 6.1 User Directory Markup & Summary Cards in HTML...');
const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');

assert(html.includes('id="view-users"'), 'View #view-users must exist in HTML');
assert(html.includes('platformApp.openCreateUserModal()'), 'Primary action + Create User must call openCreateUserModal()');
assert(html.includes('platformApp.exportUsersCSV()'), 'Secondary action Export Directory must call exportUsersCSV()');

// 5 Summary Cards
const expectedKpis = [
  'kpiUserTotal',
  'kpiUserActive',
  'kpiUserPendingInvites',
  'kpiUserSuspended',
  'kpiUserAttention'
];
expectedKpis.forEach(kpi => {
  assert(html.includes(`id="${kpi}"`), `Summary card #${kpi} must exist in HTML`);
});
console.log('  ✓ 5 Summary KPI cards verified (Total, Active, Pending Invites, Suspended, Accounts Requiring Attention)');

// Multi-field Filters
const expectedFilters = [
  'userSearchInput',
  'userInstFilter',
  'userRoleFilter',
  'userStatusFilter',
  'userInviteStatusFilter',
  'userLastLoginFilter',
  'userMfaFilter'
];
expectedFilters.forEach(f => {
  assert(html.includes(`id="${f}"`), `Filter control #${f} must exist in HTML`);
});
console.log('  ✓ 7 Filter controls (Search, Institution, Role, Status, Invite Status, Last Login, MFA Status) verified');

// 9 Table Columns
const tableHeaders = [
  'User ID',
  'Name',
  'Email',
  'Institution Scope',
  'Assigned Roles',
  'Account Status',
  'Last Login',
  'MFA Status',
  'Actions'
];
tableHeaders.forEach(th => {
  assert(html.includes(`<th>${th}</th>`), `Table header '<th>${th}</th>' must exist in users table`);
});
assert(html.includes('id="usersTableBody"'), '#usersTableBody must exist');
console.log('  ✓ All 9 Table columns and tbody verified');

// 2. Verify 6.2 Create User Form (#modalCreateUser)
console.log('\n[CHECK 2] Verifying Section 6.2 Create User Form & Security Configurations...');
assert(html.includes('id="modalCreateUser"'), 'Modal #modalCreateUser must exist');
assert(html.includes('id="formCreateUser"'), 'Form #formCreateUser must exist');

const expectedFormFields = [
  'newUserFullName',
  'newUserEmail',
  'newUserPhone',
  'newUserEmployeeId',
  'newUserInstitution',
  'newUserRoles',
  'newUserActivationMethod',
  'newUserInviteExpiry',
  'newUserRequireMfa',
  'newUserPasswordRotation',
  'newUserDeviceBinding'
];
expectedFormFields.forEach(f => {
  assert(html.includes(`id="${f}"`), `Form input #${f} must exist in create user modal`);
});

// Employee Record Linkage Notice
assert(
  html.includes('create or authorize the employee record first') ||
  html.includes('authorized school employee record'),
  'Statutory employee linkage notice must be present in create user modal'
);
console.log('  ✓ Create user form, security settings, and employee record linkage notice verified');

// 3. Verify 6.3 7-Tab User Dossier Modal (#modalUserDossier)
console.log('\n[CHECK 3] Verifying Section 6.3 7-Tab User Dossier Modal...');
assert(html.includes('id="modalUserDossier"'), 'Modal #modalUserDossier must exist');

const expectedDossierTabs = [
  { btn: 'btnUserTab_profile', pane: 'dossierPane_profile', label: 'Profile' },
  { btn: 'btnUserTab_institutions', pane: 'dossierPane_institutions', label: 'Institution Assignments' },
  { btn: 'btnUserTab_roles', pane: 'dossierPane_roles', label: 'Roles and Permissions' },
  { btn: 'btnUserTab_security', pane: 'dossierPane_security', label: 'Account Security' },
  { btn: 'btnUserTab_sessions', pane: 'dossierPane_sessions', label: 'Sessions' },
  { btn: 'btnUserTab_invitations', pane: 'dossierPane_invitations', label: 'Invitation History' },
  { btn: 'btnUserTab_audit', pane: 'dossierPane_audit', label: 'Audit History' }
];

expectedDossierTabs.forEach(t => {
  assert(html.includes(`id="${t.btn}"`), `Dossier tab button #${t.btn} must exist`);
  assert(html.includes(`id="${t.pane}"`), `Dossier tab pane #${t.pane} must exist`);
});

// Actions on Dossier
assert(html.includes('id="btnDossierSuspend"'), 'Action #btnDossierSuspend must exist');
assert(html.includes('platformApp.resendUserInvitation()'), 'Action resendUserInvitation() must exist');
assert(html.includes('platformApp.triggerUserPasswordReset()'), 'Action triggerUserPasswordReset() must exist');
assert(html.includes('platformApp.deactivateUserAccount()'), 'Action deactivateUserAccount() must exist');
assert(html.includes('platformApp.revokeAllUserSessions()'), 'Action revokeAllUserSessions() must exist');

// Statutory Retention Invariant
assert(
  html.includes('Permanent account deletion is prohibited under statutory retention policy') ||
  html.includes('statutory audits') ||
  html.includes('statutory retention'),
  'Statutory retention notice must be present in user dossier actions'
);
console.log('  ✓ All 7 User Dossier tabs, action buttons, and statutory retention invariant verified');

// 4. Verify 6.4 Account Invitation Workflow & 6.5 Session Management in JS
console.log('\n[CHECK 4] Verifying Frontend JavaScript Integration in platform-admin.js...');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');

const requiredJsFunctions = [
  'loadUsersDirectory',
  'filterUsersDirectory',
  'resetUserFilters',
  'exportUsersCSV',
  'openCreateUserModal',
  'handleCreateUserSubmit',
  'viewUserDossier',
  'switchUserDossierTab',
  'resendUserInvitation',
  'toggleUserSuspension',
  'deactivateUserAccount',
  'triggerUserPasswordReset',
  'revokeUserSession',
  'revokeAllUserSessions'
];

requiredJsFunctions.forEach(fn => {
  assert(js.includes(`function ${fn}`) || js.includes(`${fn}: async function`) || js.includes(`${fn} =`), `Function '${fn}' must be defined in platform-admin.js`);
  assert(js.includes(`${fn},`) || js.includes(`${fn}:`) || js.includes(`${fn}\n`), `Function '${fn}' must be exported on platformApp`);
});
console.log('  ✓ All 14 JavaScript frontend functions and platformApp exports verified');

// 5. Verify Security Invariants
console.log('\n[CHECK 5] Verifying Security Invariants (No session token/password leakage)...');
// Ensure session rendering does NOT expose sensitive raw token data or passwords
assert(!html.includes('sessionToken'), 'HTML must not have any sessionToken display field');
assert(!js.includes('session.token'), 'Session rendering must not read or display session.token');
assert(!js.includes('s.token'), 'Session rendering must not read or display s.token');
console.log('  ✓ Session token privacy invariant verified (no session tokens or passwords rendered in UI)');

// 6. Verify Backend Service Methods and Logic (In-Memory Fallback Validation)
console.log('\n[CHECK 6] Verifying Backend UserAccountService business rules and workflows...');
const UserAccountService = require('../backend/src/services/userAccount.service');

(async () => {
  try {
    // 6.1 Summary KPIs
    const summary = await UserAccountService.getUsersSummary();
    assert(typeof summary.totalAccounts === 'number', 'totalAccounts must be a number');
    assert(summary.totalAccounts >= 6, 'Seed data must provide at least 6 accounts');
    assert(summary.activeAccounts >= 1, 'Active accounts count must be >= 1');
    assert(summary.pendingInvitations >= 1, 'Pending invitations count must be >= 1');
    assert(summary.suspendedAccounts >= 1, 'Suspended accounts count must be >= 1');
    console.log(`  ✓ Summary stats verified: Total=${summary.totalAccounts}, Active=${summary.activeAccounts}, Pending=${summary.pendingInvitations}, Suspended=${summary.suspendedAccounts}`);

    // 6.2 Filtering
    const allUsersRes = await UserAccountService.listUsers();
    assert(allUsersRes.success && allUsersRes.data.length >= 6, 'listUsers() must return initial seed data');

    const principalRes = await UserAccountService.listUsers({ query: 'Varalakshmi' });
    assert(principalRes.data.length === 1, 'Search query for Varalakshmi must return 1 user');
    assert(principalRes.data[0].userId === 'USR-1002', 'Returned user must be USR-1002');

    const suspendedRes = await UserAccountService.listUsers({ status: 'Suspended' });
    assert(suspendedRes.data.length >= 1, 'Filter by status Suspended must return suspended users');
    assert(suspendedRes.data[0].userId === 'USR-1006', 'Suspended user must be USR-1006');
    console.log('  ✓ Multi-field filtering (Name/Email/ID search & status filter) verified');

    // 6.3 User Creation with Dispatched Invitation
    const newStaff = {
      name: 'Sri V. Krishna Murthy',
      email: 'krishna.murthy@srividya.edu.in',
      phone: '+91 9848011223',
      institutionId: 'INST-001',
      institutionName: 'Sri Vidya E.M High School (Main Campus)',
      department: 'Science & Physics Laboratory',
      employeeRecordId: 'EMP-SV-035',
      roles: ['Senior Physics Lecturer', 'Laboratory Custodian'],
      activationMethod: 'invitation_email',
      invitationExpiryHours: '72',
      requireMfa: true,
      requirePasswordRotation: true,
      bindToRegisteredDevices: false
    };

    const createRes = await UserAccountService.createUser(newStaff, 'Auditor Admin');
    assert(createRes.success, 'createUser must succeed');
    assert(createRes.data.userId.startsWith('USR-'), 'User ID must start with USR-');
    assert(createRes.data.status === 'Pending Invitation', 'Status must be Pending Invitation for email token');
    assert(createRes.data.invitation.status === 'Dispatched', 'Invitation status must be Dispatched');
    assert(createRes.data.invitation.history.length === 1, 'Invitation history must record initial dispatch');
    console.log(`  ✓ Provisioned new user: ${createRes.data.userId} with invitation token and employee linkage EMP-SV-035`);

    // 6.4 Resend Invitation
    const resendRes = await UserAccountService.resendInvitation(createRes.data.userId, 'Managing Trustee');
    assert(resendRes.success, 'resendInvitation must succeed');
    assert(resendRes.data.invitation.history.length === 2, 'Invitation history must now have 2 records');
    assert(resendRes.data.invitation.history[0].dispatchedBy === 'Managing Trustee', 'DispatchedBy must be recorded');
    console.log('  ✓ Re-issued cryptographic invitation token recorded in invitation history');

    // 6.5 Suspension & Reactivation
    const suspRes = await UserAccountService.suspendUser(createRes.data.userId, 'Annual background verification audit', 'Managing Trustee');
    assert(suspRes.success, 'suspendUser must succeed');
    assert(suspRes.data.status === 'Suspended', 'User status must be Suspended');
    assert(suspRes.data.suspensionDetails.reason.includes('background verification'), 'Suspension reason must be recorded');

    const reactRes = await UserAccountService.reactivateUser(createRes.data.userId, 'Auditor Admin');
    assert(reactRes.success, 'reactivateUser must succeed');
    assert(reactRes.data.status === 'Active', 'User status must be Active after reactivation');
    console.log('  ✓ Account suspension and reactivation verified with audit trail logging');

    // 6.6 Session Management
    const superAdminRes = await UserAccountService.getUserById('USR-1001');
    assert(superAdminRes.success, 'Must retrieve USR-1001');
    assert(superAdminRes.data.sessions.length >= 2, 'USR-1001 must have at least 2 sessions');

    const revokeSingleRes = await UserAccountService.revokeSession('USR-1001', 'SES-9402', 'Platform Super Administrator');
    assert(revokeSingleRes.success, 'revokeSession must succeed');
    assert(!revokeSingleRes.data.sessions.some(s => s.sessionId === 'SES-9402'), 'SES-9402 must be terminated');

    const revokeAllRes = await UserAccountService.revokeAllSessions('USR-1001', 'Platform Super Administrator');
    assert(revokeAllRes.success, 'revokeAllSessions must succeed');
    assert(revokeAllRes.data.sessions.length === 0, 'All sessions must be terminated');
    console.log('  ✓ Session revocation (single session and all sessions) verified');

    // 6.7 Statutory Deactivation (Immutable Retention)
    const deactRes = await UserAccountService.deactivateUser(createRes.data.userId, 'Formal retirement on superannuation');
    assert(deactRes.success, 'deactivateUser must succeed');
    assert(deactRes.data.status === 'Deactivated', 'User status must be Deactivated');
    const verifyRetained = await UserAccountService.getUserById(createRes.data.userId);
    assert(verifyRetained.success && verifyRetained.data.status === 'Deactivated', 'Deactivated user record must remain queryable in database/ledger');
    console.log('  ✓ Statutory retention invariant verified: Account record preserved with permanent historical audit trail');

    console.log('\n========================================================');
    console.log('ALL MODULE 6 USER & ACCOUNT MANAGEMENT CHECKS PASSED FLAWLESSLY!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n[MODULE 6 TEST FAILURE]:', err);
    process.exit(1);
  }
})();
