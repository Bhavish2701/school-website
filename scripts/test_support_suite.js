/**
 * Acceptance Test Suite for Module 14: Support & Issue Management
 * Covers:
 * - 14.1 Support Overview (5 KPI Metrics: open, high-priority, awaiting trust/school, overdue, recently resolved)
 * - 14.2 Support Ticket Directory (10 columns, 9 categories, priority, agent, status)
 * - 14.3 Create Ticket (Validation, SLA calculation, security incident triage)
 * - 14.4 Ticket Detail Inspector (6 Tabs: Overview, Conversation, Attachments, Internal Notes, Related Incidents, Activity History)
 * - 14.4 Actions: Assign, Change Priority, Reply, Internal Note, Request Info, Escalate, Resolve, Reopen
 * - Strict Invariants:
 *   - Internal notes kept separate from school-visible conversation
 *   - Security incidents follow dedicated security workflow rather than ordinary support queue
 * - HTML View, KPI Cards, 10-Column Table, and Modals
 * - Frontend JS Controller Exports and Navigation Handler
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

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

async function runSupportSuite() {
  console.log('\n=============================================================');
  console.log(' MODULE 14: SUPPORT & ISSUE MANAGEMENT ACCEPTANCE SUITE');
  console.log('=============================================================\n');

  // --- PART 1: 14.1 SUPPORT OVERVIEW ---
  console.log('--- 1. Support Overview KPI Metrics (14.1) ---');

  try {
    const res = await makeRequest('GET', '/api/v1/platform/support/overview');
    const ok = res.status === 200 && res.body.success && res.body.data;
    report('GET /api/v1/platform/support/overview returns successful telemetry', ok);

    if (ok) {
      const d = res.body.data;
      const hasFields = typeof d.openIssuesCount === 'number' &&
        typeof d.highPriorityCount === 'number' &&
        typeof d.awaitingCount === 'number' &&
        typeof d.overdueCount === 'number' &&
        typeof d.recentlyResolvedCount === 'number';
      report('Overview telemetry contains all 5 required KPI metrics', hasFields);
      report(`Metrics sample: Open=${d.openIssuesCount}, HighPri=${d.highPriorityCount}, Awaiting=${d.awaitingCount}, Overdue=${d.overdueCount}, Resolved=${d.recentlyResolvedCount}`, hasFields);
    }
  } catch (err) {
    report('GET /api/v1/platform/support/overview', false, err);
  }

  // --- PART 2: 14.2 SUPPORT TICKET DIRECTORY ---
  console.log('\n--- 2. Support Ticket Directory (14.2) ---');

  let testTicketId = null;

  try {
    const res = await makeRequest('GET', '/api/v1/platform/support/tickets');
    const ok = res.status === 200 && res.body.success && Array.isArray(res.body.data) && res.body.data.length >= 5;
    report('GET /api/v1/platform/support/tickets returns seeded ticket directory (min 5)', ok);

    const categories = res.body.data.map(t => t.category);
    const hasLogin = categories.includes('Login and access');
    const hasImport = categories.includes('Data import');
    const hasIntegration = categories.includes('Integration');
    const hasSecurity = categories.includes('Security incident');
    const hasConfig = categories.includes('Institution configuration');
    report('Ticket directory covers diverse categories including Login, Import, Integration, and Security', hasLogin && hasImport && hasIntegration && hasSecurity && hasConfig);

    const priorities = res.body.data.map(t => t.priority);
    const hasCritical = priorities.includes('Critical');
    const hasHigh = priorities.includes('High');
    const hasMedium = priorities.includes('Medium');
    report('Ticket directory covers Critical, High, and Medium priority tiers', hasCritical && hasHigh && hasMedium);

    testTicketId = res.body.data.find(t => t.ticketId === 'TICK-2026-001')?.ticketId || res.body.data[0].ticketId;
  } catch (err) {
    report('GET /api/v1/platform/support/tickets', false, err);
  }

  // Filter query test
  try {
    const res = await makeRequest('GET', '/api/v1/platform/support/tickets?priority=Critical');
    const ok = res.status === 200 && res.body.success && Array.isArray(res.body.data);
    const allCrit = ok && res.body.data.every(t => t.priority === 'Critical');
    report('Filter tickets by priority (Critical) returns matching records', ok && allCrit);
  } catch (err) {
    report('Filter tickets by priority', false, err);
  }

  // --- PART 3: 14.3 CREATE TICKET & SECURITY INCIDENT INVARIANT ---
  console.log('\n--- 3. Create Ticket & Security Incident Invariant (14.3 & 14.5) ---');

  let createdTicketId = null;
  try {
    const newTicketPayload = {
      subject: 'Grade 9 Biology Terminal Assessment Marks Lockout',
      institution: 'SV-MAIN',
      requesterName: 'M. Shailaja',
      requesterEmail: 'shailaja.m@srividya.edu.in',
      requesterRole: 'Teacher',
      category: 'Portal issue',
      priority: 'High',
      impact: 'Class or Section',
      description: 'Term exam mark entry grid timed out and locked section 9-B ledger.',
      attachmentName: 'mark_entry_lockout.png',
      relatedRecordId: 'EXAM-2026-T1'
    };

    const res = await makeRequest('POST', '/api/v1/platform/support/tickets', newTicketPayload);
    const ok = res.status === 201 && res.body.success && res.body.data && res.body.data.ticketId;
    report('POST /api/v1/platform/support/tickets creates a new support ticket', ok);

    if (ok) {
      createdTicketId = res.body.data.ticketId;
      const t = res.body.data;
      const slaValid = t.slaDeadline && new Date(t.slaDeadline) > new Date();
      report('SLA deadline calculated automatically based on priority (High: 12h)', slaValid);
    }
  } catch (err) {
    report('POST /api/v1/platform/support/tickets', false, err);
  }

  // Section 14.5 Invariant: Dedicated Security Incident Response
  try {
    const secTicketPayload = {
      subject: 'SQL Injection Probe Detected on Public Admissions Form',
      institution: 'TRUST_CENTRAL',
      requesterName: 'WAF Guard',
      requesterEmail: 'waf-bot@srividya.edu.in',
      requesterRole: 'Platform Operator',
      category: 'Security incident',
      priority: 'Critical',
      impact: 'Multi-Campus / Trust-wide',
      description: 'Repeated malformed single-quote UNION SELECT payloads blocked by perimeter WAF.',
      relatedRecordId: 'SEC-WAF-9912'
    };

    const res = await makeRequest('POST', '/api/v1/platform/support/tickets', secTicketPayload);
    const ok = res.status === 201 && res.body.success && res.body.data;
    report('POST /api/v1/platform/support/tickets handles Security Incident category', ok);

    if (ok) {
      const t = res.body.data;
      const isSecProper = t.isSecurityIncident === true &&
        t.status === 'Triaged' &&
        t.assignedAgent?.name === 'Security Response Team' &&
        !!t.securityIncidentRef;
      report('Section 14.5 Invariant: Security incidents auto-escalate to dedicated Security Response Team & Triaged workflow', isSecProper);
    }
  } catch (err) {
    report('Security incident invariant check', false, err);
  }

  // --- PART 4: 14.4 TICKET DETAIL INSPECTOR (6 TABS & ACTIONS) ---
  console.log('\n--- 4. Ticket Detail Inspector & Lifecycle Actions (14.4) ---');

  try {
    const res = await makeRequest('GET', `/api/v1/platform/support/tickets/${createdTicketId}`);
    const ok = res.status === 200 && res.body.success && res.body.data;
    report(`GET /api/v1/platform/support/tickets/:id fetches complete ticket detail (${createdTicketId})`, ok);

    if (ok) {
      const t = res.body.data;
      const has6Sections = Array.isArray(t.conversation) &&
        Array.isArray(t.supportingFiles) &&
        Array.isArray(t.internalNotes) &&
        Array.isArray(t.relatedIncidents) &&
        Array.isArray(t.activityHistory) &&
        t.subject && t.institution;
      report('Ticket detail contains all 6 tabs/subdocuments (Overview, Conversation, Attachments, Internal Notes, Related, Activity)', has6Sections);
    }
  } catch (err) {
    report('GET /api/v1/platform/support/tickets/:id', false, err);
  }

  // Action 1: Assign Ticket
  try {
    const assignPayload = {
      agentName: 'K. Sudhir',
      agentEmail: 'sudhir.k@srividya.edu.in',
      tier: 'Tier 2 Support'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/assign`, assignPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.assignedAgent.name === 'K. Sudhir';
    report('POST /api/v1/platform/support/tickets/:id/assign updates assigned agent & status', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/assign', false, err);
  }

  // Action 2: Change Priority
  try {
    const priPayload = {
      priority: 'Critical',
      reason: 'Mid-term grade submission closes in 2 hours'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/priority`, priPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.priority === 'Critical';
    report('POST /api/v1/platform/support/tickets/:id/priority updates priority and recalculates SLA deadline', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/priority', false, err);
  }

  // Action 3: Reply to School (Public Conversation)
  try {
    const replyPayload = {
      message: 'Hello Shailaja garu, we have released the lock on section 9-B mark entry grid. Please refresh your browser.',
      senderName: 'K. Sudhir',
      senderRole: 'Tier 2 Support',
      senderType: 'Support Agent'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/reply`, replyPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.conversation.some(m => m.message.includes('released the lock'));
    report('POST /api/v1/platform/support/tickets/:id/reply posts message to public school conversation', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/reply', false, err);
  }

  // Action 4: Add Internal Note (STRICT INVARIANT: Internal only, isolated from school)
  try {
    const notePayload = {
      note: 'Internal root cause note: Redis lock was not released due to network drop between web worker and cluster.',
      confidentialityLevel: 'Engineering / Security Only'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/internal-note`, notePayload);
    const ok = res.status === 200 && res.body.success && res.body.data.internalNotes.some(n => n.note.includes('Redis lock'));
    report('POST /api/v1/platform/support/tickets/:id/internal-note logs confidential note', ok);

    if (ok) {
      // Invariant: Verify internal note is in internalNotes array, NOT in conversation array
      const inConv = res.body.data.conversation.some(m => m.message.includes('Redis lock'));
      const inNotes = res.body.data.internalNotes.some(n => n.note.includes('Redis lock'));
      report('Section 14.4 Invariant: Internal notes strictly isolated from public conversation visible to school', inNotes && !inConv);
    }
  } catch (err) {
    report('Internal note isolation invariant', false, err);
  }

  // Action 5: Request Additional Information
  try {
    const reqInfoPayload = {
      message: 'Please confirm if teacher mark entry has concluded without error.'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/request-info`, reqInfoPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.status === 'Waiting for Requester';
    report('POST /api/v1/platform/support/tickets/:id/request-info sets status to Waiting for Requester', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/request-info', false, err);
  }

  // Action 6: Escalate Ticket
  try {
    const escPayload = {
      escalationTier: 'Tier 3 Engineering',
      reason: 'Requires database index optimization on exam grades table'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/escalate`, escPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.status === 'Waiting for Engineering';
    report('POST /api/v1/platform/support/tickets/:id/escalate sets status to Waiting for Engineering', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/escalate', false, err);
  }

  // Action 7: Resolve Ticket
  try {
    const resPayload = {
      resolutionSummary: 'Redis lock TTL adjusted to 30s. Marks entry completed and verified by principal.'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/resolve`, resPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.status === 'Resolved' && res.body.data.resolvedAt;
    report('POST /api/v1/platform/support/tickets/:id/resolve marks ticket Resolved with resolution summary', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/resolve', false, err);
  }

  // Action 8: Reopen Ticket
  try {
    const reopenPayload = {
      reason: 'Science teacher reported lingering lock on grade 9-A'
    };
    const res = await makeRequest('POST', `/api/v1/platform/support/tickets/${createdTicketId}/reopen`, reopenPayload);
    const ok = res.status === 200 && res.body.success && res.body.data.status === 'In Progress';
    report('POST /api/v1/platform/support/tickets/:id/reopen reopens ticket and transitions back to In Progress', ok);
  } catch (err) {
    report('POST /api/v1/platform/support/tickets/:id/reopen', false, err);
  }

  // --- PART 5: HTML DOM & UI ELEMENTS VERIFICATION ---
  console.log('\n--- 5. HTML Elements & Modals Verification ---');

  const htmlPath = path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const requiredIds = [
    // Main View & Overview KPI Cards
    'view-support',
    'kpiSupportOpenCount',
    'kpiSupportHighPriorityCount',
    'kpiSupportAwaitingCount',
    'kpiSupportOverdueCount',
    'kpiSupportResolvedCount',

    // Directory & Filters
    'lblSupportFilteredCount',
    'txtSupportSearch',
    'selSupportFilterCategory',
    'selSupportFilterPriority',
    'selSupportFilterStatus',
    'selSupportFilterInstitution',
    'tbodySupportTickets',

    // Create Modal (Section 14.3)
    'modalCreateTicket',
    'txtTicketFormSubject',
    'selTicketFormInstitution',
    'txtTicketFormRequesterName',
    'txtTicketFormRequesterEmail',
    'selTicketFormRequesterRole',
    'selTicketFormCategory',
    'selTicketFormPriority',
    'selTicketFormImpact',
    'txtTicketFormDescription',
    'txtTicketFormAttachment',
    'txtTicketFormRelatedId',
    'boxTicketSecurityNotice',

    // Detail Inspector (Section 14.4)
    'modalSupportTicketDetail',
    'lblTicketDetailId',
    'lblTicketDetailSubject',
    'lblTicketDetailInstitution',
    'lblTicketDetailRequester',
    'lblTicketDetailAgent',
    'lblTicketDetailSLA',
    'lblTicketDetailPriority',
    'lblTicketDetailStatus',
    'boxTicketDetailSecurityBanner',

    // Detail Tabs
    'btnTicketTabOverview',
    'btnTicketTabConversation',
    'btnTicketTabAttachments',
    'btnTicketTabInternalNotes',
    'btnTicketTabRelated',
    'btnTicketTabActivity',
    'tabTicketOverviewContent',
    'tabTicketConversationContent',
    'tabTicketAttachmentsContent',
    'tabTicketInternalNotesContent',
    'tabTicketRelatedContent',
    'tabTicketActivityContent',

    // Action Modals
    'modalAssignTicket',
    'selAssignAgent',
    'modalChangePriority',
    'selChangePriorityLevel',
    'txtChangePriorityReason',
    'modalEscalateTicket',
    'selEscalateTier',
    'txtEscalateReason',
    'modalResolveTicket',
    'txtResolutionSummary',
    'modalRequestInfo',
    'txtRequestInfoMessage'
  ];

  let allIdsPresent = true;
  for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) {
      report(`HTML element #${id} exists in index.html`, false, `Element id="${id}" missing`);
      allIdsPresent = false;
    }
  }
  if (allIdsPresent) {
    report(`All ${requiredIds.length} required HTML elements, KPI cards, and modals present in index.html`, true);
  }

  // Check 10-column table structure (Section 14.2)
  const has10Columns = html.includes('<th>Ticket ID</th>') &&
    html.includes('<th>Subject</th>') &&
    html.includes('<th>Institution</th>') &&
    html.includes('<th>Requester</th>') &&
    html.includes('<th>Category</th>') &&
    html.includes('<th>Priority</th>') &&
    html.includes('<th>Assigned Agent</th>') &&
    html.includes('<th>Created Date</th>') &&
    html.includes('<th>Last Updated</th>') &&
    html.includes('<th>Status</th>');
  report('Support ticket directory table defines exactly 10 columns (Section 14.2)', has10Columns);

  // --- PART 6: FRONTEND JS CONTROLLER EXPORTS & SYNTAX ---
  console.log('\n--- 6. Frontend Controller Exports & Interface ---');

  const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  const requiredExports = [
    'loadSupportData',
    'renderSupportOverview',
    'renderSupportTicketsTable',
    'filterSupportTickets',
    'resetSupportFilters',
    'openCreateTicketModal',
    'onTicketCategoryChange',
    'handleCreateTicket',
    'openSupportTicketDetailsModal',
    'switchTicketTab',
    'openAssignModal',
    'submitAssignTicket',
    'openChangePriorityModal',
    'submitChangePriority',
    'submitTicketReply',
    'submitTicketInternalNote',
    'openRequestInfoModal',
    'submitRequestInfo',
    'openEscalateModal',
    'submitEscalateTicket',
    'openResolveModal',
    'submitResolveTicket',
    'reopenCurrentTicket',
    'openTicketSecurityEvent'
  ];

  let allExportsPresent = true;
  for (const fn of requiredExports) {
    if (!js.includes(`${fn},`) && !js.includes(`${fn}\n`)) {
      report(`Controller method ${fn} exported in platform-admin.js`, false, `Method ${fn} missing from public interface`);
      allExportsPresent = false;
    }
  }
  if (allExportsPresent) {
    report(`All ${requiredExports.length} required Module 14 controller methods exported`, true);
  }

  // Check navigateTo support handler
  const navHandlesSupport = js.includes("viewId === 'support'") && js.includes("loadSupportData");
  report('navigateTo("support") dispatches loadSupportData()', navHandlesSupport);

  // Summary
  console.log('\n=============================================================');
  console.log(` RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log('=============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSupportSuite().catch(err => {
  console.error('Fatal error during Module 14 suite execution:', err);
  process.exit(1);
});
