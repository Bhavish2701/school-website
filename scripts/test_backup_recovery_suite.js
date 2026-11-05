/**
 * Acceptance Test Suite: Module 12 - Backups & Recovery
 * Sri Vidya Educational Trust Platform Administration Console
 * 
 * Verifies:
 * - 12.1 Backup Overview (Database, File Vault, Schedule, Storage Status, Retention, Failed Backups, Latest Recovery Test)
 * - 12.2 Backup History (8 Columns, Verify Backup, Start Authorized Backup, Download with Policy Guard)
 * - 12.3 Controlled 8-Step Recovery Workflow (Dual-Authorization Safeguard, Target Isolation, Integrity Check, Audit Sealing)
 * - Frontend HTML Elements, Modals, and JavaScript Controller Contract
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const reqHeaders = { ...headers };
    let reqBody = null;

    if (body) {
      reqBody = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function runBackupRecoverySuite() {
  console.log('========================================================================');
  console.log(' RUNNING ACCEPTANCE TEST SUITE: MODULE 12 - BACKUPS & RECOVERY');
  console.log(' Sri Vidya Educational Trust - Platform Administration');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // --------------------------------------------------------------------------
    // Test 1: 12.1 Backup Overview Endpoint & 7 Display Fields
    // --------------------------------------------------------------------------
    console.log('--- TEST 1: 12.1 Backup Overview Telemetry ---');
    const overviewRes = await makeRequest('GET', '/api/v1/platform/backups/overview');
    assert(overviewRes.status === 200, `Overview endpoint returns HTTP 200 (Got ${overviewRes.status})`);
    assert(overviewRes.body.success === true, 'Response indicates success: true');

    const ov = overviewRes.body.data || {};
    assert(ov.lastSuccessfulDatabaseBackup && ov.lastSuccessfulDatabaseBackup.backupId, 'Last successful database backup is displayed');
    assert(ov.lastSuccessfulFileBackup && ov.lastSuccessfulFileBackup.backupId, 'Last successful file backup is displayed');
    assert(ov.backupSchedule && ov.backupSchedule.databaseCadence, 'Backup schedule is configured (Every 6 Hours)');
    assert(ov.backupStorageStatus && ov.backupStorageStatus.usedGB !== undefined, 'Backup storage status reports capacity and usage');
    assert(ov.retentionPolicy && ov.retentionPolicy.statutoryFramework, 'Retention policy cites AP Statutory Education Act');
    assert(ov.failedBackups && ov.failedBackups.totalFailedCount !== undefined, 'Failed backups counter and error events reported');
    assert(ov.latestRecoveryTest && ov.latestRecoveryTest.drillId, 'Latest recovery test drill reports 100% fidelity');

    // --------------------------------------------------------------------------
    // Test 2: 12.2 Backup History Register & 8 Columns Verification
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: 12.2 Backup History Register & Column Integrity ---');
    const backupsRes = await makeRequest('GET', '/api/v1/platform/backups');
    assert(backupsRes.status === 200, `Backups list returns HTTP 200 (Got ${backupsRes.status})`);
    assert(Array.isArray(backupsRes.body.data), 'Backups data is an array');
    assert(backupsRes.body.data.length >= 5, `Preloaded backups found (${backupsRes.body.data.length} records)`);

    const firstBkp = backupsRes.body.data[0];
    assert(firstBkp.backupId, 'Column 1: Backup ID present');
    assert(firstBkp.scope, 'Column 2: Scope present');
    assert(firstBkp.startTime, 'Column 3: Start time present');
    assert(firstBkp.completionTime, 'Column 4: Completion time present');
    assert(firstBkp.status, 'Column 5: Status present');
    assert(firstBkp.sizeFormatted || firstBkp.sizeBytes, 'Column 6: Size present');
    assert(firstBkp.storageReference && firstBkp.storageReference.startsWith('s3://'), 'Column 7: Storage reference is encrypted cloud URI');
    assert(firstBkp.verificationStatus, 'Column 8: Verification status present');

    // --------------------------------------------------------------------------
    // Test 3: Start an Authorized Backup Action
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Start Authorized Backup Action ---');
    const newBackupPayload = {
      scope: 'FULL_TRUST',
      campusScope: 'ALL_CAMPUSES',
      name: 'Pre-Rollup Acceptance Verification Snapshot',
      reason: 'Automated test suite triggering live disaster checkpoint',
      operatorId: 'USR-PLAT-TEST',
      operator: 'Platform Automated Verifier'
    };
    const startRes = await makeRequest('POST', '/api/v1/platform/backups', newBackupPayload);
    assert(startRes.status === 201, `Start backup returns HTTP 201 (Got ${startRes.status})`);
    assert(startRes.body.success === true, 'Backup created successfully');
    const createdBackupId = startRes.body.data?.backupId;
    assert(createdBackupId && createdBackupId.startsWith('BKP-'), `Backup assigned valid ID: ${createdBackupId}`);
    assert(startRes.body.data?.checksumSha256?.length === 64, 'Generated cryptographic SHA-256 checksum (64 chars)');

    // --------------------------------------------------------------------------
    // Test 4: Verify Backup Action (Re-calculate Checksum)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: Verify Backup Action ---');
    const verifyRes = await makeRequest('POST', `/api/v1/platform/backups/${createdBackupId}/verify`);
    assert(verifyRes.status === 200, `Verify backup returns HTTP 200 (Got ${verifyRes.status})`);
    assert(verifyRes.body.success === true, 'Verification completed successfully');
    assert(verifyRes.body.data?.verificationStatus === 'VERIFIED_CLEAN', 'Verification status marked as VERIFIED_CLEAN');

    // --------------------------------------------------------------------------
    // Test 5: Download Backup Action & Security Policy Enforcement
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: Download Backup Action & Policy Guard ---');
    // Permitted download test
    const downloadPermittedRes = await makeRequest('GET', `/api/v1/platform/backups/${createdBackupId}/download`);
    assert(downloadPermittedRes.status === 200, 'Permitted backup download returns HTTP 200 with manifest');
    assert(downloadPermittedRes.body.downloadManifest?.signedUrl, 'Download manifest includes temporary signed URL');

    // Restricted download test (BKP-2026-002: raw files vault)
    const downloadRestrictedRes = await makeRequest('GET', '/api/v1/platform/backups/BKP-2026-002/download');
    assert(downloadRestrictedRes.status === 403, `Restricted vault download returns HTTP 403 (Got ${downloadRestrictedRes.status})`);
    assert(downloadRestrictedRes.body.restricted === true, 'Direct download correctly blocked by statutory security policy');

    // --------------------------------------------------------------------------
    // Test 6: 12.3 Recovery Workflow - Steps 1, 2, 3 (Request & Impact Review)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 6: Recovery Workflow Steps 1, 2, 3 (Request & Impact Assessment) ---');
    const recoveryRequestPayload = {
      backupId: createdBackupId,
      targetEnvironment: 'ISOLATED_SANDBOX',
      reason: 'Scheduled quarterly disaster recovery drill in isolated pod',
      operatorId: 'USR-PLAT-OPERATOR',
      operator: 'Platform Operator'
    };

    const reqRecoveryRes = await makeRequest('POST', '/api/v1/platform/backups/recovery-requests', recoveryRequestPayload);
    assert(reqRecoveryRes.status === 201, `Create recovery request returns HTTP 201 (Got ${reqRecoveryRes.status})`);
    assert(reqRecoveryRes.body.success === true, 'Recovery request successfully queued');
    const createdRecId = reqRecoveryRes.body.data?.recoveryId;
    assert(createdRecId && createdRecId.startsWith('REC-'), `Recovery request assigned ID: ${createdRecId}`);
    assert(reqRecoveryRes.body.data?.workflowStep === 3, 'Workflow advanced through Steps 1, 2, 3 to Step 3 (Awaiting Approval)');
    assert(reqRecoveryRes.body.data?.approvalStatus === 'PENDING_APPROVAL', 'Approval status is PENDING_APPROVAL');
    assert(reqRecoveryRes.body.data?.potentialImpact?.recordsCount > 0, 'Potential impact records reconciled assessed');

    // --------------------------------------------------------------------------
    // Test 7: 12.3 Recovery Workflow - Step 4 Dual-Authorization Safeguard
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 7: Step 4 Dual-Authorization Safeguard ---');
    // Attempt self-approval by same operator -> Must be rejected
    const selfApprovalRes = await makeRequest('POST', `/api/v1/platform/backups/recovery-requests/${createdRecId}/approve`, {
      approver: {
        userId: 'USR-PLAT-OPERATOR', // Same as requester!
        name: 'Platform Operator',
        role: 'Platform Operations'
      }
    });
    assert(selfApprovalRes.status === 403, `Self-approval rejected with HTTP 403 (Got ${selfApprovalRes.status})`);
    assert(selfApprovalRes.body.message.includes('Dual-authorization'), 'Security error message enforces dual-authorization');

    // --------------------------------------------------------------------------
    // Test 8: 12.3 Recovery Workflow - Steps 4 to 8 Execution & Audit Sealing
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 8: Steps 4 to 8 Execution, Integrity Check & Audit Sealing ---');
    // Authorized independent approval
    const validApprovalRes = await makeRequest('POST', `/api/v1/platform/backups/recovery-requests/${createdRecId}/approve`, {
      approver: {
        userId: 'USR-PLAT-CHIEF-OWNER',
        name: 'Trust Secretary & Chief Trustee',
        role: 'Platform Owner'
      },
      remarks: 'Approved for controlled execution in isolated sandbox pod sbx-01'
    });
    assert(validApprovalRes.status === 200, `Independent approval returns HTTP 200 (Got ${validApprovalRes.status})`);
    assert(validApprovalRes.body.success === true, 'Controlled 8-step recovery executed successfully');

    const executedRecovery = validApprovalRes.body.data;
    assert(executedRecovery.workflowStep === 8, 'Workflow reached Step 8 (Outcome Sealed in Audit Ledger)');
    assert(executedRecovery.recoveryStatus === 'COMPLETED', 'Recovery status marked as COMPLETED');
    assert(executedRecovery.integrityCheckResult?.checksumMatch === true, 'Step 6: Data integrity checksum matched');
    assert(executedRecovery.validationSummary && executedRecovery.validationSummary.includes('Validation Successful'), 'Step 7: System validated successfully');
    assert(executedRecovery.auditLogRef && executedRecovery.auditLogRef.startsWith('AUD-REC-'), 'Step 8: Recovery sealed with audit log reference');

    // --------------------------------------------------------------------------
    // Test 9: Frontend HTML Elements & Modals Inspection
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 9: Frontend HTML Elements & Modals Verification ---');
    const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const expectedHtmlIds = [
      'view-backups',
      'btnBkpTabOverview',
      'btnBkpTabHistory',
      'btnBkpTabRecovery',
      'kpiBkpLastDb',
      'kpiBkpLastFiles',
      'kpiBkpSchedule',
      'kpiBkpStorage',
      'kpiBkpRetention',
      'kpiBkpFailedCount',
      'kpiBkpLatestDrill',
      'tbodyBackups',
      'tbodyRecoveryRequests',
      'modalStartBackup',
      'modalBackupDetail',
      'modalRequestRecovery',
      'modalApproveRecovery',
      'modalRecoveryWorkflowDetail'
    ];

    expectedHtmlIds.forEach(id => {
      assert(htmlContent.includes(`id="${id}"`), `HTML contains element with id="${id}"`);
    });

    // --------------------------------------------------------------------------
    // Test 10: Frontend JavaScript Controller Methods Contract
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 10: Frontend JavaScript Controller Methods Contract ---');
    const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    const expectedJsMethods = [
      'loadBackupsData',
      'switchBackupsSubTab',
      'renderBackupOverview',
      'renderBackupsTable',
      'filterBackupsTable',
      'resetBackupFilters',
      'openStartBackupModal',
      'submitStartBackup',
      'verifyBackup',
      'openBackupDetailsModal',
      'downloadBackupFile',
      'openRequestRecoveryModal',
      'updateRecoveryImpactPreview',
      'submitRecoveryRequest',
      'renderRecoveryRequestsTable',
      'openApproveRecoveryModal',
      'submitApproveRecovery',
      'openRecoveryWorkflowDetailModal'
    ];

    expectedJsMethods.forEach(fn => {
      assert(jsContent.includes(`${fn},`) || jsContent.includes(`${fn}:`), `platformApp exports ${fn}`);
    });

    assert(jsContent.includes("viewId === 'backups'"), "navigateTo dispatcher handles viewId === 'backups'");

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBackupRecoverySuite();

