/**
 * Acceptance Test Suite: Module 11 - System Health & Deployment
 * Sri Vidya Educational Trust Platform Administration Console
 * 
 * Verifies:
 * - 11.1 Service Health Probes (Frontend, Backend, Database, File Storage, Email, Jobs)
 * - 11.2 Deployment History (Lifecycle, Rollback, Secrets Redaction Guard)
 * - 11.3 Application Logs & Diagnostic Dossier (PII/Secret Scrubbing, Sealed SHA-256 Export)
 * - 11.4 Background Jobs (Idempotent Safe Retries, Status Management)
 * - Frontend UI & JavaScript Controller Export Contracts
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

async function runSystemHealthSuite() {
  console.log('========================================================================');
  console.log(' RUNNING ACCEPTANCE TEST SUITE: MODULE 11 - SYSTEM HEALTH & DEPLOYMENT');
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
    // Test 1: GET /api/v1/platform/health (Service Health Probes & Runtime Metrics)
    // --------------------------------------------------------------------------
    console.log('--- TEST 1: Service Health Probes & Runtime Telemetry ---');
    const hlthRes = await makeRequest('GET', '/api/v1/platform/health');
    assert(hlthRes.status === 200, `Health endpoint returns HTTP 200 (Got ${hlthRes.status})`);
    assert(hlthRes.body.success === true, 'Response indicates success: true');
    assert(hlthRes.body.data && hlthRes.body.data.services, 'Health data contains services dictionary');

    const services = hlthRes.body.data?.services || {};
    const requiredProbes = ['frontend', 'backend_api', 'database', 'file_storage', 'email_provider', 'scheduled_jobs'];
    const missingProbes = requiredProbes.filter(p => !services[p]);
    assert(missingProbes.length === 0, `All 6 service probes present: ${requiredProbes.join(', ')}`);

    assert(services.database?.status === 'OPERATIONAL', 'MongoDB probe reports OPERATIONAL status');
    assert(services.database?.meaning && services.database.meaning.includes('healthy'), 'Database meaning describes healthy connectivity');
    assert(hlthRes.body.data?.process?.uptimeFormatted, 'Process uptime formatted string is present');
    assert(hlthRes.body.data?.recentErrorRate?.percentage !== undefined, 'Recent error rate percentage is computed');

    // --------------------------------------------------------------------------
    // Test 2: GET /api/v1/platform/deployments (Deployment History & Secrets Redaction)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 2: Deployment History & Secrets Redaction Guard ---');
    const depListRes = await makeRequest('GET', '/api/v1/platform/deployments');
    assert(depListRes.status === 200, `Deployments list returns HTTP 200 (Got ${depListRes.status})`);
    assert(Array.isArray(depListRes.body.data), 'Deployments data is an array');
    assert(depListRes.body.data.length >= 3, `Preloaded deployments found (${depListRes.body.data.length} records)`);

    const rawPayload = JSON.stringify(depListRes.body.data);
    const leaksSecret = rawPayload.includes('mongodb://') || rawPayload.includes('MONGO_PASSWORD') || rawPayload.includes('JWT_SECRET');
    assert(!leaksSecret, 'Deployments API payload contains NO secrets, credentials, or DB connection URIs');

    // --------------------------------------------------------------------------
    // Test 3: POST /api/v1/platform/deployments (Initiate Approved Deployment)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 3: Initiate Approved Deployment Release ---');
    const newDepPayload = {
      application: 'Sri Vidya Platform API',
      environment: 'PRODUCTION',
      version: 'v2.4.3-hotfix.1',
      commitRef: 'c9f4d1e',
      changelog: 'Acceptance test deployment release for Module 11 verification',
      initiatedBy: {
        userId: 'USR-PLAT-TEST',
        name: 'Platform Automated Verifier',
        role: 'Platform Operations'
      }
    };
    const createDepRes = await makeRequest('POST', '/api/v1/platform/deployments', newDepPayload);
    assert(createDepRes.status === 201, `Initiate deployment returns HTTP 201 (Got ${createDepRes.status})`);
    assert(createDepRes.body.success === true, 'Deployment initiated successfully');
    const createdDepId = createDepRes.body.data?.deploymentId;
    assert(createdDepId && createdDepId.startsWith('DEP-'), `Deployment assigned ID ${createdDepId}`);
    assert(createDepRes.body.data?.status === 'SUCCESS', 'Simulated deployment transitioned to SUCCESS');

    // --------------------------------------------------------------------------
    // Test 4: POST /api/v1/platform/deployments/:id/rollback (Emergency Rollback)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 4: Emergency Deployment Rollback ---');
    const rollbackRes = await makeRequest('POST', `/api/v1/platform/deployments/${createdDepId}/rollback`, {
      reason: 'Automated test of rollback safeguards'
    });
    assert(rollbackRes.status === 200, `Rollback returns HTTP 200 (Got ${rollbackRes.status})`);
    assert(rollbackRes.body.success === true, 'Rollback executed successfully');
    assert(rollbackRes.body.data?.isRollback === true, 'Rollback record marked with isRollback: true');
    assert(rollbackRes.body.data?.rollbackSourceId === createdDepId, 'Rollback links to previous deployment ID');

    // Verify original deployment updated to ROLLED_BACK
    const verifyDepRes = await makeRequest('GET', `/api/v1/platform/deployments/${createdDepId}`);
    assert(verifyDepRes.body.data?.status === 'ROLLED_BACK', 'Original deployment marked as ROLLED_BACK');

    // --------------------------------------------------------------------------
    // Test 5: Application Logs & PII / Secrets Sanitization Invariant
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 5: Application Logs Ingestion & PII/Secret Scrubbing ---');
    const sensitiveLogPayload = {
      service: 'platform-api',
      level: 'WARN',
      category: 'AUTH',
      message: 'Failed login attempt for user bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123 password: MySuperSecret123! aadhaar 9876 5432 1098 and mobile 9876543210',
      stackTrace: 'Error at /app/auth.js:45\\nDatabase connection: mongodb://admin:SecretPass123@cluster0.net:27017/srividya_db',
      metadata: {
        rawToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123'
      }
    };

    const logRes = await makeRequest('POST', '/api/v1/platform/logs', sensitiveLogPayload);
    assert(logRes.status === 201, `Ingest log returns HTTP 201 (Got ${logRes.status})`);
    const ingestedLog = logRes.body.data;
    assert(!ingestedLog.message.includes('MySuperSecret123!'), 'Plaintext password scrubbed from log message');
    assert(ingestedLog.message.includes('[REDACTED_PASSWORD]'), 'Password replaced with [REDACTED_PASSWORD]');
    assert(!ingestedLog.message.includes('9876 5432 1098'), 'Aadhaar 12-digit number scrubbed from log message');
    assert(ingestedLog.message.includes('[REDACTED_AADHAAR]'), 'Aadhaar replaced with [REDACTED_AADHAAR]');
    assert(!ingestedLog.stackTrace.includes('SecretPass123'), 'Stack trace scrubbed of Mongo DB credentials');
    assert(ingestedLog.stackTrace.includes('[REDACTED_DB_URI]'), 'Stack trace contains [REDACTED_DB_URI]');

    // --------------------------------------------------------------------------
    // Test 6: GET /api/v1/platform/logs/export (Diagnostic Dossier with SHA-256 Seal)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 6: Sealed Diagnostic Report Dossier ---');
    const exportRes = await makeRequest('GET', '/api/v1/platform/logs/export');
    assert(exportRes.status === 200, `Log export returns HTTP 200 (Got ${exportRes.status})`);
    assert(exportRes.body.integritySeal?.sha256Hash, 'Report sealed with cryptographically generated SHA-256 hash');
    assert(exportRes.body.reportMetadata?.classification === 'RESTRICTED / PLATFORM OPERATOR ONLY', 'Report bears operator-only classification');
    assert(exportRes.body.systemState?.activeProbes?.length === 6, 'Report captures all 6 service health probe snapshots');
    assert(Array.isArray(exportRes.body.diagnosticLogs), 'Report includes array of sanitized diagnostic logs');

    // --------------------------------------------------------------------------
    // Test 7: GET /api/v1/platform/jobs (Background Jobs Directory)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 7: Background Jobs Directory ---');
    const jobsRes = await makeRequest('GET', '/api/v1/platform/jobs');
    assert(jobsRes.status === 200, `Jobs list returns HTTP 200 (Got ${jobsRes.status})`);
    assert(Array.isArray(jobsRes.body.data), 'Jobs data is an array');
    assert(jobsRes.body.data.length >= 4, `Preloaded scheduled jobs found (${jobsRes.body.data.length} jobs)`);

    const reportJob = jobsRes.body.data.find(j => j.category === 'REPORT_GENERATION');
    assert(reportJob !== undefined, 'Automated report generation background job exists');
    assert(reportJob.isIdempotent === true, 'Report job is tagged as idempotent');

    // --------------------------------------------------------------------------
    // Test 8: POST /api/v1/platform/jobs/:id/retry (Idempotent Safe Retries)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 8: Safe Idempotent Job Retry ---');
    const targetJob = jobsRes.body.data.find(j => j.status === 'FAILED') || jobsRes.body.data[0];
    const initialAttempts = targetJob.attempts;

    const retryRes = await makeRequest('POST', `/api/v1/platform/jobs/${targetJob.jobId}/retry`, {
      reason: 'Automated test of idempotent retry mechanism'
    });
    assert(retryRes.status === 200, `Retry endpoint returns HTTP 200 (Got ${retryRes.status})`);
    assert(retryRes.body.success === true, 'Retry scheduled successfully');
    assert(retryRes.body.isIdempotent === true, 'Retry confirmed idempotent with zero duplicate side effects');
    assert(retryRes.body.data.attempts === initialAttempts + 1, 'Attempt counter safely incremented');

    // --------------------------------------------------------------------------
    // Test 9: POST /api/v1/platform/jobs/:id/cancel (Cancel Queued Job)
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 9: Cancel Background Job ---');
    const queuedJob = jobsRes.body.data.find(j => j.status === 'QUEUED') || jobsRes.body.data[0];
    const cancelRes = await makeRequest('POST', `/api/v1/platform/jobs/${queuedJob.jobId}/cancel`, {
      reason: 'Test cancellation workflow'
    });
    assert(cancelRes.status === 200, `Cancel endpoint returns HTTP 200 (Got ${cancelRes.status})`);
    assert(cancelRes.body.data.status === 'CANCELLED', 'Job status updated to CANCELLED');

    // --------------------------------------------------------------------------
    // Test 10: Frontend HTML Elements & Modals Inspection
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 10: Frontend HTML Elements & Modals Verification ---');
    const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const expectedHtmlIds = [
      'view-health',
      'btnHealthTabServices',
      'btnHealthTabDeployments',
      'btnHealthTabLogs',
      'btnHealthTabJobs',
      'serviceHealthGrid',
      'kpiHlthUptime',
      'kpiHlthMemory',
      'kpiHlthHeap',
      'kpiHlthErrorRate',
      'tbodyDeployments',
      'tbodyAppLogs',
      'tbodyBackgroundJobs',
      'modalDeploymentDetail',
      'modalInitiateDeployment',
      'modalAppLogDetail',
      'modalJobDetail'
    ];

    expectedHtmlIds.forEach(id => {
      assert(htmlContent.includes(`id="${id}"`), `HTML contains element with id="${id}"`);
    });

    // --------------------------------------------------------------------------
    // Test 11: Frontend JavaScript Controller Methods Contract
    // --------------------------------------------------------------------------
    console.log('\n--- TEST 11: Frontend JavaScript Controller Methods Contract ---');
    const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    const expectedJsMethods = [
      'loadSystemHealthData',
      'switchHealthSubTab',
      'renderSystemHealthTelemetry',
      'renderDeploymentsTable',
      'filterDeploymentsTable',
      'openDeploymentDetailsModal',
      'openInitiateDeploymentModal',
      'submitInitiateDeployment',
      'requestDeploymentRollback',
      'renderAppLogsTable',
      'filterAppLogs',
      'resetAppLogFilters',
      'openAppLogDetailsModal',
      'exportDiagnosticReport',
      'renderBackgroundJobsTable',
      'filterBackgroundJobs',
      'openJobDetailsModal',
      'retryBackgroundJob',
      'cancelBackgroundJob'
    ];

    expectedJsMethods.forEach(fn => {
      assert(jsContent.includes(`${fn},`) || jsContent.includes(`${fn}:`), `platformApp exports ${fn}`);
    });

    assert(jsContent.includes("viewId === 'health'"), "navigateTo dispatcher handles viewId === 'health'");

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

runSystemHealthSuite();
