const assert = require('assert');
const institutionService = require('../backend/src/services/institution.service');

async function runServiceTests() {
  console.log('=== UNIT TEST: InstitutionService Direct Execution ===\n');

  // 1. Seed & List
  console.log('[TEST 1] Initializing and listing institutions...');
  const res = await institutionService.listInstitutions();
  const list = res.data;
  console.log(`  ✓ Returned ${list.length} institutions`);
  assert.ok(list.length >= 3, 'Should have at least 3 institutions seeded');
  
  const mainCampus = list.find(i => i.code === 'SV-MAIN');
  assert.ok(mainCampus, 'Main campus should exist');
  assert.strictEqual(mainCampus.institutionId, 'INST-001');
  console.log('  ✓ Main campus verified:', mainCampus.name);

  // 2. Summary Counts
  console.log('\n[TEST 2] Verifying summary counts...');
  const summary = await institutionService.getSummaryCounts();
  console.log('  ✓ Summary counts:', summary);
  assert.strictEqual(summary.total, list.length);
  assert.ok(summary.active >= 1);

  // 3. Create New Institution
  console.log('\n[TEST 3] Creating new institution...');
  const createRes = await institutionService.createInstitution({
    name: 'Sri Vidya Model High School (North Branch)',
    displayName: 'Sri Vidya North Campus',
    code: 'SV-NORTH',
    type: 'Branch',
    trust: 'Sri Vidya Educational Trust',
    contact: { email: 'north@srividya.edu.in', phone: '+91 863 2277000' },
    domains: { primary: 'north.srividya.edu.in', dnsVerified: true }
  }, 'sysadmin.root@srividya.trust');
  const newInst = createRes.data || createRes;
  console.log(`  ✓ Created: [${newInst.institutionId}] ${newInst.name} (${newInst.code})`);
  assert.strictEqual(newInst.code, 'SV-NORTH');

  // 4. Suspend Institution Workflow with statutory preservation
  console.log('\n[TEST 4] Testing suspension governance workflow...');
  const suspendRes = await institutionService.suspendInstitution(
    newInst.institutionId,
    'Statutory regulatory compliance audit underway',
    'disable_login_keep_audit',
    'sysadmin.root@srividya.trust'
  );
  const suspended = suspendRes.data || suspendRes;
  assert.strictEqual(suspended.status, 'Suspended');
  assert.strictEqual(suspended.suspension.isSuspended, true);
  assert.strictEqual(suspended.suspension.accessPolicy, 'disable_login_keep_audit');
  console.log('  ✓ Suspension workflow successfully enforced. Status:', suspended.status);

  // 5. Reactivate Institution
  console.log('\n[TEST 5] Testing reactivation workflow...');
  const reactivateRes = await institutionService.reactivateInstitution(
    newInst.institutionId,
    'sysadmin.root@srividya.trust'
  );
  const reactivated = reactivateRes.data || reactivateRes;
  assert.strictEqual(reactivated.status, 'Active');
  assert.strictEqual(reactivated.suspension.isSuspended, false);
  console.log('  ✓ Reactivation workflow successfully restored. Status:', reactivated.status);

  // 6. Domain Verification
  console.log('\n[TEST 6] Testing DNS verification...');
  const dnsRes = await institutionService.verifyDomain(newInst.institutionId, 'north.srividya.edu.in');
  assert.strictEqual(dnsRes.verified, true);
  console.log('  ✓ DNS verification completed:', dnsRes);

  // 7. Administrator Cryptographic Invitation
  console.log('\n[TEST 7] Testing cryptographic administrator invitation...');
  const invRes = await institutionService.inviteAdministrator(newInst.institutionId, {
    name: 'Sri T. Rama Krishna',
    email: 'principal.north@srividya.edu.in',
    role: 'Institutional Principal'
  }, 'sysadmin.root@srividya.trust');
  assert.strictEqual(invRes.success, true);
  assert.ok(invRes.data.inviteToken, 'Activation token must be generated');
  assert.ok(invRes.data.inviteExpiresAt, '7-day expiry must be set');
  console.log('  ✓ Cryptographic invitation issued. Token:', invRes.data.inviteToken);
  console.log('  ✓ Invitation Link generated:', invRes.inviteLink);

  console.log('\n======================================================');
  console.log('ALL InstitutionService UNIT TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runServiceTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
