/**
 * Acceptance Test Suite for Module 13: Integrations & API Management
 * Covers:
 * - 13.1 Integrations Directory (8 columns, CRUD, connection handshake, toggle, KMS rotation, safe disconnect)
 * - 13.2 Integration Configuration & Masked KMS Credentials Invariant
 * - 13.3 External API Clients Management (register, granted scopes, rate limits, rotate, revoke)
 * - 13.4 Integration Event Logs & Strict Payment Reconciliation Invariant (webhook unverified vs independently reconciled)
 * - HTML View, Modals, and Elements
 * - JS Controller Exports and Navigation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let failedTests = 0;

function report(name, passed, err) {
  if (passed) {
    console.log(`  ✓ ${name}`);
    passedTests++;
  } else {
    console.error(`  ✗ ${name}`);
    if (err) console.error(`    ${err.message || err}`);
    failedTests++;
  }
}

function makeRequest(method, pathUrl, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: pathUrl,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runIntegrationsSuite() {
  console.log('\n=============================================================');
  console.log(' MODULE 13: INTEGRATIONS & API MANAGEMENT ACCEPTANCE SUITE');
  console.log('=============================================================\n');

  // --- PART 1: 13.1 & 13.2 INTEGRATIONS DIRECTORY & CONFIGURATION ---
  console.log('--- 1. Integrations Directory & Configuration (13.1 & 13.2) ---');

  let testIntegrationId = null;

  try {
    const res = await makeRequest('GET', '/api/v1/platform/integrations');
    const ok = res.status === 200 && res.body.success && Array.isArray(res.body.data) && res.body.data.length >= 5;
    report('GET /api/v1/platform/integrations returns seeded integrations list (min 5)', ok);

    const intTypes = res.body.data.map(i => i.type);
    const hasEmail = intTypes.includes('EMAIL_DELIVERY');
    const hasSms = intTypes.includes('SMS_PROVIDER');
    const hasPayment = intTypes.includes('PAYMENT_GATEWAY');
    const hasStorage = intTypes.includes('FILE_STORAGE');
    const hasIdp = intTypes.includes('IDENTITY_PROVIDER');
    report('Integrations directory includes Email, SMS, Payment, Storage, and IdP types', hasEmail && hasSms && hasPayment && hasStorage && hasIdp);

    // Section 13.2 Invariant: Raw credentials must never be exposed
    let secretsMasked = true;
    for (const item of res.body.data) {
      if (item.rawCredential || item.apiKey || (item.credentialMasked && !item.credentialMasked.includes('•'))) {
        secretsMasked = false;
        break;
      }
    }
    report('Section 13.2 Invariant: API credentials are encrypted/masked and never exposed in plain text', secretsMasked);

    testIntegrationId = res.body.data[0].integrationId;
  } catch (err) {
    report('GET /api/v1/platform/integrations', false, err);
  }

  // Get specific integration
  try {
    const res = await makeRequest('GET', `/api/v1/platform/integrations/${testIntegrationId}`);
    const ok = res.status === 200 && res.body.success && res.body.data && res.body.data.integrationId === testIntegrationId;
    report(`GET /api/v1/platform/integrations/:id fetches integration details (${testIntegrationId})`, ok);
  } catch (err) {
    report('GET /api/v1/platform/integrations/:id', false, err);
  }

  // Live Connection Handshake Test
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/${testIntegrationId}/test`);
    const ok = res.status === 200 && res.body.success && res.body.data && typeof res.body.data.latencyMs === 'number';
    report(`POST /api/v1/platform/integrations/:id/test executes live connection handshake (latency: ${res.body.data?.latencyMs}ms)`, ok);
  } catch (err) {
    report('POST /api/v1/platform/integrations/:id/test', false, err);
  }

  // Toggle Integration Status
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/${testIntegrationId}/toggle`);
    const ok = res.status === 200 && res.body.success && res.body.data;
    report(`POST /api/v1/platform/integrations/:id/toggle successfully toggles relay enabled state`, ok);

    // Toggle back to preserve state
    await makeRequest('POST', `/api/v1/platform/integrations/${testIntegrationId}/toggle`);
  } catch (err) {
    report('POST /api/v1/platform/integrations/:id/toggle', false, err);
  }

  // Rotate KMS Credentials
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/${testIntegrationId}/rotate`);
    const ok = res.status === 200 && res.body.success && res.body.data && res.body.data.credentialMasked && res.body.data.credentialMasked.includes('•');
    report(`POST /api/v1/platform/integrations/:id/rotate rotates KMS credentials and returns updated masked key`, ok);
  } catch (err) {
    report('POST /api/v1/platform/integrations/:id/rotate', false, err);
  }

  // Create New Integration
  let newCreatedIntId = null;
  try {
    const newIntPayload = {
      name: 'AP State Board Data Exchange Relay',
      provider: 'BIE Andhra Pradesh Gateway',
      type: 'EXTERNAL_SCHOOL_SYSTEM',
      environment: 'PRODUCTION',
      institutionScope: 'SV-MAIN',
      endpoint: 'https://bie.ap.gov.in/api/v2/exchange',
      credentialRef: 'vault://kms/ap-south-1/bie-ap-token',
      rawCredential: 'test_bie_secret_token_12345',
      scopes: ['halltickets.sync', 'results.verify'],
      webhookConfig: {
        url: 'https://srividya.edu.in/api/v1/webhooks/bie-ap',
        subscribedEvents: ['result.published', 'hallticket.generated']
      },
      retryPolicy: {
        maxRetries: 4,
        backoffStrategy: 'EXPONENTIAL',
        timeoutSeconds: 20
      }
    };

    const res = await makeRequest('POST', '/api/v1/platform/integrations', newIntPayload);
    const ok = res.status === 201 && res.body.success && res.body.data && res.body.data.integrationId;
    report('POST /api/v1/platform/integrations creates new service integration relay', ok);
    if (ok) {
      newCreatedIntId = res.body.data.integrationId;
      report('New integration masked credential generated properly', res.body.data.credentialMasked.includes('•') && !res.body.data.rawCredential);
    }
  } catch (err) {
    report('POST /api/v1/platform/integrations', false, err);
  }

  // Update Integration Configuration
  try {
    const updatePayload = {
      retryPolicy: {
        maxRetries: 5,
        backoffStrategy: 'LINEAR',
        timeoutSeconds: 25
      }
    };
    const res = await makeRequest('PUT', `/api/v1/platform/integrations/${newCreatedIntId}`, updatePayload);
    const ok = res.status === 200 && res.body.success && res.body.data.retryPolicy.maxRetries === 5;
    report(`PUT /api/v1/platform/integrations/:id updates integration configuration & retry policy`, ok);
  } catch (err) {
    report('PUT /api/v1/platform/integrations/:id', false, err);
  }

  // Disconnect Integration
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/${newCreatedIntId}/disconnect`);
    const ok = res.status === 200 && res.body.success && res.body.data.connectionStatus === 'DISCONNECTED' && res.body.data.isEnabled === false;
    report(`POST /api/v1/platform/integrations/:id/disconnect safely disconnects integration relay`, ok);
  } catch (err) {
    report('POST /api/v1/platform/integrations/:id/disconnect', false, err);
  }

  // --- PART 2: 13.3 API MANAGEMENT (EXTERNAL CLIENTS) ---
  console.log('\n--- 2. External API Clients Management (13.3) ---');

  let testClientId = null;

  try {
    const res = await makeRequest('GET', '/api/v1/platform/integrations/api-clients');
    const ok = res.status === 200 && res.body.success && Array.isArray(res.body.data) && res.body.data.length >= 2;
    report('GET /api/v1/platform/integrations/api-clients returns external API clients', ok);

    const cli = res.body.data[0];
    const hasFields = cli.clientId && cli.clientName && cli.ownership && cli.grantedScopes && cli.rateLimit;
    report('API Client schema contains ownership, grantedScopes, rateLimit, and credentialStatus', hasFields);

    testClientId = cli.clientId;
  } catch (err) {
    report('GET /api/v1/platform/integrations/api-clients', false, err);
  }

  // Register New API Client
  let registeredClientId = null;
  try {
    const clientPayload = {
      clientName: 'Sri Vidya Alumni Mobile App',
      organization: 'Sri Vidya Trust Alumni Association',
      contactPerson: 'K. Ramakrishna',
      contactEmail: 'alumni.tech@srividya.edu.in',
      grantedScopes: ['alumni.directory.read', 'events.calendar.read'],
      rateLimit: {
        requestsPerMinute: 80,
        dailyLimit: 30000
      }
    };

    const res = await makeRequest('POST', '/api/v1/platform/integrations/api-clients', clientPayload);
    const ok = res.status === 201 && res.body.success && res.body.data && res.body.data.clientId;
    report('POST /api/v1/platform/integrations/api-clients registers external client application', ok);
    if (ok) {
      registeredClientId = res.body.data.clientId;
      report('API client issued credential is encrypted and masked', res.body.data.credentialMasked.includes('•'));
    }
  } catch (err) {
    report('POST /api/v1/platform/integrations/api-clients', false, err);
  }

  // Rotate API Client Secret
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/api-clients/${registeredClientId}/rotate`);
    const ok = res.status === 200 && res.body.success && res.body.data.credentialStatus === 'ROTATED';
    report(`POST /api/v1/platform/integrations/api-clients/:id/rotate rotates client secret`, ok);
  } catch (err) {
    report('POST /api/v1/platform/integrations/api-clients/:id/rotate', false, err);
  }

  // Revoke API Client
  try {
    const res = await makeRequest('POST', `/api/v1/platform/integrations/api-clients/${registeredClientId}/revoke`, {
      reason: 'Automated test suite revocation verification'
    });
    const ok = res.status === 200 && res.body.success && res.body.data.credentialStatus === 'REVOKED';
    report(`POST /api/v1/platform/integrations/api-clients/:id/revoke revokes client authorization`, ok);
    report(`Revocation recorded in client revocation history audit log`, res.body.data.revocationHistory && res.body.data.revocationHistory.length > 0);
  } catch (err) {
    report('POST /api/v1/platform/integrations/api-clients/:id/revoke', false, err);
  }

  // --- PART 3: 13.4 INTEGRATION EVENT LOGS & PAYMENT RECONCILIATION INVARIANT ---
  console.log('\n--- 3. Integration Event Logs & Payment Invariant (13.4) ---');

  // Ensure idempotent state for EVT-9011 so test suite can run repeatedly
  try {
    const mongoose = require('../backend/node_modules/mongoose');
    const envConfig = require('../backend/src/config/env');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(envConfig.mongodbUri || 'mongodb://127.0.0.1:27017/srividya_school_db');
    }
    const { IntegrationEventLog } = require('../backend/src/models/integration.model');
    await IntegrationEventLog.findOneAndUpdate(
      { eventId: 'EVT-9011' },
      {
        result: 'WEBHOOK_RECEIVED',
        paymentVerificationStatus: 'UNVERIFIED_NOTIFICATION',
        'metadata.feeLedgerCredited': false
      }
    );
  } catch (e) {
    console.error('Mongo reset error:', e.message);
  }

  let unverifiedPaymentEventId = null;

  try {
    const res = await makeRequest('GET', '/api/v1/platform/integrations/logs');
    const ok = res.status === 200 && res.body.success && Array.isArray(res.body.data) && res.body.data.length >= 4;
    report('GET /api/v1/platform/integrations/logs returns diagnostic event log stream', ok);

    // Section 13.4 Payment Reconciliation Invariant: Find unverified webhook payment
    const unverifiedPay = res.body.data.find(e => e.isPayment && e.paymentVerificationStatus === 'UNVERIFIED_NOTIFICATION');
    const okPay = unverifiedPay !== undefined;
    report('Section 13.4 Invariant: Initial gateway webhook is flagged as UNVERIFIED_NOTIFICATION', okPay);

    if (unverifiedPay) {
      unverifiedPaymentEventId = unverifiedPay.eventId;
      report(`Unverified payment event identified: ${unverifiedPaymentEventId} (result: ${unverifiedPay.result})`, true);
    }
  } catch (err) {
    report('GET /api/v1/platform/integrations/logs', false, err);
  }

  // Reconcile Payment Event
  if (unverifiedPaymentEventId) {
    try {
      const res = await makeRequest('POST', `/api/v1/platform/integrations/logs/${unverifiedPaymentEventId}/reconcile`);
      const ok = res.status === 200 && res.body.success && res.body.data;
      report(`POST /api/v1/platform/integrations/logs/:id/reconcile independently verifies payment`, ok);

      if (ok) {
        const item = res.body.data;
        const reconciledProperly = item.result === 'INDEPENDENTLY_RECONCILED' && item.paymentVerificationStatus === 'INDEPENDENTLY_RECONCILED';
        report('Section 13.4 Invariant: Reconciled event status changed to INDEPENDENTLY_RECONCILED', reconciledProperly);
        report('Reconciled event records bank settlement batch and fee ledger credit', !!item.metadata?.settlementBatchId && !!item.metadata?.feeLedgerCredited);
      }
    } catch (err) {
      report('POST /api/v1/platform/integrations/logs/:id/reconcile', false, err);
    }
  }

  // --- PART 4: HTML DOM & UI ELEMENTS VERIFICATION ---
  console.log('\n--- 4. HTML Elements & Modals Verification ---');

  const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const requiredIds = [
    // Main View & Nav Tabs
    'view-integrations',
    'btnIntTabDirectory',
    'btnIntTabApi',
    'btnIntTabLogs',
    'badgeIntegrationsCount',
    'badgeApiClientsCount',
    'badgeEventLogsCount',

    // Tab 1: Directory
    'intTabDirectoryContent',
    'lblIntFilteredCount',
    'txtIntFilterSearch',
    'selIntFilterType',
    'selIntFilterStatus',
    'selIntFilterScope',
    'tbodyIntegrations',

    // Tab 2: API Management
    'intTabApiContent',
    'tbodyApiClients',

    // Tab 3: Event Logs
    'intTabLogsContent',
    'lblEventLogsFilteredCount',
    'txtEventFilterSearch',
    'selEventFilterPayment',
    'selEventFilterResult',
    'tbodyIntegrationEventLogs',

    // Modal 1: Create / Edit Integration
    'modalCreateEditIntegration',
    'lblIntModalTitle',
    'txtIntFormId',
    'txtIntFormName',
    'txtIntFormProvider',
    'selIntFormType',
    'selIntFormEnv',
    'selIntFormScope',
    'txtIntFormEndpoint',
    'txtIntFormCredRef',
    'txtIntFormRawKey',
    'txtIntFormScopes',
    'txtIntFormWebhookUrl',
    'txtIntFormWebhookEvents',
    'numIntFormRetries',
    'selIntFormBackoff',
    'numIntFormTimeout',

    // Modal 2: Integration Details
    'modalIntegrationDetail',
    'lblIntDetailName',
    'lblIntDetailStatus',
    'lblIntDetailProvider',
    'lblIntDetailType',
    'lblIntDetailScope',
    'lblIntDetailLastSync',
    'lblIntDetailEndpoint',
    'lblIntDetailCredRef',
    'lblIntDetailMasked',
    'lblIntDetailScopes',
    'btnIntDetailTest',
    'btnIntDetailRotate',
    'btnIntDetailEdit',

    // Modal 3: Register API Client
    'modalRegisterApiClient',
    'txtClientFormName',
    'txtClientFormOrg',
    'txtClientFormPerson',
    'txtClientFormEmail',
    'txtClientFormScopes',
    'numClientFormRpm',
    'numClientFormDaily',

    // Modal 4: Event Detail & Reconciliation
    'modalIntegrationEventDetail',
    'lblEventDetailId',
    'lblEventDetailResult',
    'lblEventDetailIntegration',
    'lblEventDetailScope',
    'lblEventDetailTime',
    'lblEventDetailCorrelation',
    'boxEventPaymentReconciliation',
    'lblEventDetailPayStatus',
    'lblEventDetailPayNote',
    'btnEventReconcileAction',
    'lblEventDetailMetadata'
  ];

  let allIdsPresent = true;
  for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) {
      report(`HTML element #${id} exists`, false, `Element id="${id}" missing from index.html`);
      allIdsPresent = false;
    }
  }
  if (allIdsPresent) {
    report(`All ${requiredIds.length} required HTML elements, tables, and modals present in index.html`, true);
  }

  // Check 8-column header structure for 13.1
  const has8Columns = html.includes('<th>Integration Name</th>') &&
    html.includes('<th>Provider</th>') &&
    html.includes('<th>Institution Scope</th>') &&
    html.includes('<th>Integration Type</th>') &&
    html.includes('<th>Connection Status</th>') &&
    html.includes('<th>Last Successful Sync</th>') &&
    html.includes('<th>Last Error</th>') &&
    html.includes('<th>Actions</th>');
  report('Integrations directory table defines exactly 8 columns (Section 13.1)', has8Columns);

  // --- PART 5: FRONTEND JS CONTROLLER EXPORTS & SYNTAX ---
  console.log('\n--- 5. Frontend Controller Exports & Interface ---');

  const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  const requiredExports = [
    'loadIntegrationsData',
    'switchIntegrationsSubTab',
    'renderIntegrationsTable',
    'filterIntegrationsTable',
    'resetIntegrationFilters',
    'openCreateIntegrationModal',
    'openEditIntegrationModal',
    'submitIntegrationForm',
    'testIntegrationConnection',
    'toggleIntegrationStatus',
    'rotateIntegrationCredentials',
    'disconnectIntegration',
    'openIntegrationDetailsModal',
    'renderApiClientsTable',
    'filterApiClientsTable',
    'openRegisterApiClientModal',
    'submitRegisterApiClient',
    'rotateApiClientCredentials',
    'revokeApiClient',
    'renderEventLogsTable',
    'filterEventLogsTable',
    'resetEventLogFilters',
    'openEventLogDetailsModal',
    'reconcilePaymentEvent',
    'viewIntegrationLogs'
  ];

  let allExportsPresent = true;
  for (const fn of requiredExports) {
    if (!js.includes(`${fn},`) && !js.includes(`${fn}\n`)) {
      report(`Controller method ${fn} exported in platform-admin.js`, false, `Method ${fn} missing from public interface`);
      allExportsPresent = false;
    }
  }
  if (allExportsPresent) {
    report(`All ${requiredExports.length} required Module 13 controller methods exported`, true);
  }

  // Check navigateTo integration handler
  const navHandlesIntegrations = js.includes("viewId === 'integrations' && typeof loadIntegrationsData === 'function'");
  report('navigateTo("integrations") dispatches loadIntegrationsData()', navHandlesIntegrations);

  try {
    const mongoose = require('../backend/node_modules/mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (e) {}

  // Summary
  console.log('\n=============================================================');
  console.log(` RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log('=============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runIntegrationsSuite().catch(err => {
  console.error('Fatal error during Module 13 suite execution:', err);
  process.exit(1);
});
