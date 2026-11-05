/**
 * test_domains_email_suite.js
 * Acceptance test suite for Module 15: Domains, Email & Notifications
 * Sri Vidya Educational Trust Platform Administration
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('  MODULE 15: DOMAINS, EMAIL & NOTIFICATIONS ACCEPTANCE SUITE');
  console.log('=============================================================\n');

  try {
    // -------------------------------------------------------------
    // Test Group 1: 15.1 Domain Directory
    // -------------------------------------------------------------
    console.log('--- Test Group 1: 15.1 Domain Directory Listing ---');
    const resDomains = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/domains',
      method: 'GET'
    });

    assert(resDomains.status === 200, 'GET /api/v1/platform/domains returns 200 OK');
    assert(resDomains.data.success === true, 'Response indicates success = true');
    assert(Array.isArray(resDomains.data.data), 'Returns an array of domains');
    assert(resDomains.data.data.length >= 4, `At least 4 initial domains seeded (found ${resDomains.data.data.length})`);

    const primaryDomain = resDomains.data.data.find(d => d.domain === 'srividya.edu.in');
    assert(!!primaryDomain, 'Primary apex domain srividya.edu.in is present');
    assert(primaryDomain.verificationStatus === 'VERIFIED', 'srividya.edu.in verificationStatus is VERIFIED');
    assert(primaryDomain.dnsStatus === 'ACTIVE' || primaryDomain.dnsStatus === 'HEALTHY', 'srividya.edu.in dnsStatus is ACTIVE/HEALTHY');
    assert(primaryDomain.sslStatus === 'VALID', 'srividya.edu.in sslStatus is VALID');
    assert(primaryDomain.purpose === 'Public website', 'srividya.edu.in purpose is Public website');

    // -------------------------------------------------------------
    // Test Group 2: 15.1 & 15.2 Create Domain & Verification Invariant
    // -------------------------------------------------------------
    console.log('\n--- Test Group 2: Domain Creation & Verification Invariant (Section 15.2) ---');
    const newDomainName = `test-portal-${Date.now()}.srividya.org`;
    const resCreate = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/domains',
      method: 'POST'
    }, {
      domain: newDomainName,
      institutionScope: 'SV-VILLAGE',
      purpose: 'Faculty Portal'
    });

    assert(resCreate.status === 201, 'POST /api/v1/platform/domains returns 201 Created');
    assert(resCreate.data.success === true, 'Response indicates success = true');
    const createdDomain = resCreate.data.data;
    assert(createdDomain.domain === newDomainName, 'Created domain matches requested name');

    // Section 15.2 Invariant: Never report a domain as verified before check succeeds
    assert(createdDomain.verificationStatus === 'PENDING_VERIFICATION',
      'Invariant: New domain verificationStatus is strictly PENDING_VERIFICATION');
    assert(createdDomain.dnsRecords && createdDomain.dnsRecords.length >= 2,
      'Domain includes generated DNS records');

    // -------------------------------------------------------------
    // Test Group 3: 15.2 Domain DNS Details & Plain Language Explanations
    // -------------------------------------------------------------
    console.log('\n--- Test Group 3: DNS Records & Plain Language Explanations ---');
    const resDns = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/${encodeURIComponent(createdDomain.domainId)}/dns`,
      method: 'GET'
    });

    assert(resDns.status === 200, 'GET /api/v1/platform/domains/:id/dns returns 200 OK');
    assert(resDns.data.success === true, 'Response indicates success');
    const dnsRecords = resDns.data.data.records;
    assert(Array.isArray(dnsRecords) && dnsRecords.length >= 2, 'Records array is populated');

    const txtRecord = dnsRecords.find(r => r.type === 'TXT' || r.recordType === 'TXT');
    assert(!!txtRecord, 'TXT verification token record exists');
    assert((txtRecord.explanation || txtRecord.plainLanguageExplanation) && (txtRecord.explanation || txtRecord.plainLanguageExplanation).length > 10,
      'TXT record provides clear plain-language explanation');

    // -------------------------------------------------------------
    // Test Group 4: Domain Ownership Verification Probe & DNS Check
    // -------------------------------------------------------------
    console.log('\n--- Test Group 4: Verification Probes & DNS Checks ---');
    const resVerify = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/${encodeURIComponent(createdDomain.domainId)}/verify`,
      method: 'POST'
    });

    assert(resVerify.status === 200, 'POST /api/v1/platform/domains/:id/verify returns 200 OK');
    assert(resVerify.data.success === true, 'Verification probe returns success');
    assert(resVerify.data.data.verificationStatus === 'VERIFIED',
      'Domain transitioned to VERIFIED after authoritative verification check');

    const resCheckDns = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/${encodeURIComponent(createdDomain.domainId)}/check-dns`,
      method: 'POST'
    });

    assert(resCheckDns.status === 200, 'POST /api/v1/platform/domains/:id/check-dns returns 200 OK');
    assert(resCheckDns.data.success === true, 'Check DNS returns success');
    assert(resCheckDns.data.dnsStatus === 'ACTIVE' || resCheckDns.data.dnsStatus === 'HEALTHY' || (resCheckDns.data.data && resCheckDns.data.data.dnsStatus === 'ACTIVE'), 'DNS status is ACTIVE/HEALTHY');

    // Retry verification endpoint
    const resRetry = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/${encodeURIComponent(createdDomain.domainId)}/retry`,
      method: 'POST'
    });
    assert(resRetry.status === 200, 'POST /api/v1/platform/domains/:id/retry returns 200 OK');

    // Toggle active status (disable/enable)
    const resToggle = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/${encodeURIComponent(createdDomain.domainId)}/toggle`,
      method: 'POST'
    });
    assert(resToggle.status === 200, 'POST /api/v1/platform/domains/:id/toggle returns 200 OK');
    assert(resToggle.data.data.isEnabled === false || resToggle.data.data.isActive === false, 'Domain is now disabled');

    // -------------------------------------------------------------
    // Test Group 5: 15.3 Email Service Management
    // -------------------------------------------------------------
    console.log('\n--- Test Group 5: 15.3 Email Service Management ---');
    const resEmailServices = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/domains/email/services',
      method: 'GET'
    });

    assert(resEmailServices.status === 200, 'GET /api/v1/platform/domains/email/services returns 200 OK');
    assert(resEmailServices.data.success === true, 'Response indicates success = true');
    assert(Array.isArray(resEmailServices.data.data) && resEmailServices.data.data.length >= 2,
      'Returns list of email service relays (Google Workspace & AWS SES)');

    const gwService = resEmailServices.data.data.find(s => s.provider && (s.provider === 'GOOGLE_WORKSPACE' || s.provider.includes('Google Workspace')));
    assert(!!gwService, 'Google Workspace email service relay is configured');
    assert(gwService.senderDomain && gwService.senderDomain.includes('srividya.edu.in'), 'GW sender domain is srividya.edu.in');
    assert(['OPERATIONAL', 'OPTIMAL', 'HEALTHY'].includes(gwService.deliveryHealth), 'GW delivery health is OPERATIONAL/OPTIMAL');
    assert(gwService.bounceRate <= 5.0, 'GW bounce rate is within healthy threshold');

    // Diagnostic test email send
    const resTestMail = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/email/services/${encodeURIComponent(gwService.serviceId)}/test`,
      method: 'POST'
    }, {
      recipientEmail: 'operator@srividya.edu.in'
    });

    assert(resTestMail.status === 200, 'POST /api/v1/platform/domains/email/services/:id/test returns 200 OK');
    assert(resTestMail.data.success === true, 'Test email dispatch succeeded');

    // Verify sender domain
    const resVerifySender = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/email/services/${encodeURIComponent(gwService.serviceId)}/verify-sender`,
      method: 'POST'
    });
    assert(resVerifySender.status === 200, 'POST /api/v1/platform/domains/email/services/:id/verify-sender returns 200 OK');
    assert(resVerifySender.data.data.verificationStatus === 'VERIFIED', 'Sender domain is VERIFIED');

    // Delivery logs
    const resLogs = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/email/services/${encodeURIComponent(gwService.serviceId)}/logs`,
      method: 'GET'
    });
    assert(resLogs.status === 200, 'GET /api/v1/platform/domains/email/services/:id/logs returns 200 OK');
    assert(Array.isArray(resLogs.data.data), 'Delivery logs array returned');
    assert(resLogs.data.data.length >= 1, 'Delivery logs contain recent dispatch');

    // -------------------------------------------------------------
    // Test Group 6: 15.4 Notification Templates & Privacy Guard Invariant
    // -------------------------------------------------------------
    console.log('\n--- Test Group 6: 15.4 Notification Templates & Privacy Guard Invariant ---');
    const resTemplates = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/domains/templates',
      method: 'GET'
    });

    assert(resTemplates.status === 200, 'GET /api/v1/platform/domains/templates returns 200 OK');
    assert(resTemplates.data.success === true, 'Response indicates success = true');
    const templates = resTemplates.data.data;
    assert(templates.length >= 8, `All 8 required template types seeded (found ${templates.length})`);

    const requiredTriggers = [
      'USER_INVITATION',
      'PASSWORD_RECOVERY',
      'ADMISSION_STATUS',
      'DOCUMENT_CORRECTION',
      'FEE_RECEIPT',
      'APPOINTMENT_CONFIRMATION',
      'SUPPORT_TICKET_UPDATE',
      'SECURITY_ALERT'
    ];

    for (const trig of requiredTriggers) {
      const found = templates.some(t => t.eventTrigger === trig);
      assert(found, `Required template trigger ${trig} is configured`);
    }

    // Section 15.4 Invariant: Confidential variable privacy guard
    console.log('\n--- Test Group 7: Section 15.4 Privacy Guard Invariant Rejections ---');
    const sampleTemplate = templates[0];

    // Attempting to inject {{password_hash}} must be rejected
    const resViolating1 = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/templates/${encodeURIComponent(sampleTemplate.templateId)}`,
      method: 'PUT'
    }, {
      subject: 'Updated Subject',
      body: 'Hello {{user_name}}, your secret password is {{password_hash}}'
    });

    assert(resViolating1.status === 400, 'PUT template with {{password_hash}} is rejected with 400 Bad Request');
    assert(resViolating1.data.success === false, 'Privacy violation correctly yields success = false');
    assert(resViolating1.data.message.includes('Privacy Guard Violation') || resViolating1.data.message.includes('Confidential variable') || resViolating1.data.message.includes('Security Invariant Violation'),
      'Error message clearly explains the privacy guard invariant violation');

    // Attempting to inject {{session_token}} must also be rejected
    const resViolating2 = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/templates/${encodeURIComponent(sampleTemplate.templateId)}`,
      method: 'PUT'
    }, {
      subject: 'Updated Subject',
      body: 'Hello {{user_name}}, here is your token {{session_token}}'
    });

    assert(resViolating2.status === 400, 'PUT template with {{session_token}} is rejected with 400 Bad Request');

    // Valid update with permitted variables must succeed
    const resValidUpdate = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/templates/${encodeURIComponent(sampleTemplate.templateId)}`,
      method: 'PUT'
    }, {
      subject: 'Welcome to Sri Vidya ERP Portal - Official Invitation',
      body: 'Dear {{user_name}},\n\nYou have been invited to join {{institution_name}} as {{assigned_role}}.\nClick here to activate your account: {{activation_url}}\nThis link expires in {{invitation_expiry}}.\n\nSri Vidya Trust Administration',
      changeSummary: 'Updated invitation text for clarity'
    });

    assert(resValidUpdate.status === 200, 'Valid template update with whitelisted variables returns 200 OK');
    assert(resValidUpdate.data.data.version >= 2, 'Template version incremented on revision');

    // Template preview with safe variable interpolation
    const resPreview = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/templates/${encodeURIComponent(sampleTemplate.templateId)}/preview`,
      method: 'POST'
    });

    assert(resPreview.status === 200, 'POST template preview returns 200 OK');
    assert(resPreview.data.success === true, 'Preview returns success');
    assert(!resPreview.data.data.interpolatedBody.includes('{{user_name}}'),
      'Preview interpolates tokens with sample values');

    // Test send template
    const resTestSendTpl = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/domains/templates/${encodeURIComponent(sampleTemplate.templateId)}/test-send`,
      method: 'POST'
    });
    assert(resTestSendTpl.status === 200, 'POST test-send template returns 200 OK');
    assert(resTestSendTpl.data.success === true, 'Test-send reports success');

    // -------------------------------------------------------------
    // Test Group 8: Frontend Integrity & UI Controls Verification
    // -------------------------------------------------------------
    console.log('\n--- Test Group 8: Frontend HTML & JS Integrity ---');
    const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert(html.includes('id="view-domains-email"'), 'HTML contains #view-domains-email');
    assert(html.includes('id="btnDomTabDirectory"'), 'HTML contains Directory sub-tab button');
    assert(html.includes('id="btnDomTabEmail"'), 'HTML contains Email Service sub-tab button');
    assert(html.includes('id="btnDomTabTemplates"'), 'HTML contains Notification Templates sub-tab button');
    assert(html.includes('id="tbodyDomains"'), 'HTML contains domains table tbody');
    assert(html.includes('id="tbodyEmailServices"'), 'HTML contains email services tbody');
    assert(html.includes('id="tbodyNotificationTemplates"'), 'HTML contains notification templates tbody');

    // Modals
    assert(html.includes('id="modalAddDomain"'), 'HTML contains modalAddDomain');
    assert(html.includes('id="modalDomainDnsDetail"'), 'HTML contains modalDomainDnsDetail');
    assert(html.includes('id="modalSendTestEmail"'), 'HTML contains modalSendTestEmail');
    assert(html.includes('id="modalEmailDeliveryLogs"'), 'HTML contains modalEmailDeliveryLogs');
    assert(html.includes('id="modalEditNotificationTemplate"'), 'HTML contains modalEditNotificationTemplate');
    assert(html.includes('id="modalPreviewNotificationTemplate"'), 'HTML contains modalPreviewNotificationTemplate');

    // JS exports check
    const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
    const js = fs.readFileSync(jsPath, 'utf8');

    const expectedMethods = [
      'loadDomainsEmailData',
      'switchDomainsSubTab',
      'renderDomainsTable',
      'filterDomainsTable',
      'resetDomainFilters',
      'openAddDomainModal',
      'submitAddDomain',
      'openDomainDnsModal',
      'verifyCurrentDomainOwnership',
      'checkCurrentDomainDns',
      'retryDomainVerification',
      'disableOrRemoveCurrentDomain',
      'renderEmailServicesTable',
      'openSendTestEmailModal',
      'submitSendTestEmail',
      'verifySenderDomain',
      'toggleEmailService',
      'openEmailDeliveryLogsModal',
      'renderNotificationTemplatesTable',
      'openEditTemplateModal',
      'insertTemplateVariable',
      'submitUpdateTemplate',
      'openPreviewTemplateModal',
      'testSendNotificationTemplate'
    ];

    for (const m of expectedMethods) {
      assert(js.includes(`${m},`) || js.includes(`${m}:`), `platformApp exports ${m}`);
    }

    console.log('\n=============================================================');
    console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! (100%)`);
    console.log('=============================================================\n');

  } catch (err) {
    console.error('\nTest suite failed with error:', err);
    process.exit(1);
  }
}

runTests();
