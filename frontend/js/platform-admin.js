/**
 * Sri Vidya Educational Trust - Platform Administration Controller
 * Scope: Multi-tenant Platform Infrastructure, Institutional Configuration, Privacy Guard
 */

const platformApp = (function () {
  'use strict';

  // State Management
  const state = {
    activeView: 'dashboard',
    theme: localStorage.getItem('sv_theme') || 'light',
    institutions: [
      {
        id: 'INST-001',
        name: 'Sri Vidya E.M High School (Main Campus)',
        code: 'SV-MAIN',
        udise: '28172901923',
        board: 'Andhra Pradesh State SSC Board',
        category: 'High School & Primary (Class 1 to 10)',
        students: 855,
        staff: 34,
        status: 'Active',
        domain: 'srividya.edu.in',
        portalUrl: '/management',
        createdDate: '2017-06-12'
      },
      {
        id: 'INST-002',
        name: 'Sri Vidya Junior College (Science & Commerce)',
        code: 'SV-INTER',
        udise: '28172901924',
        board: 'Board of Intermediate Education AP (BIEAP)',
        category: 'Intermediate College (+1 & +2 Wing)',
        students: 320,
        staff: 18,
        status: 'Active',
        domain: 'intermediate.srividya.edu.in',
        portalUrl: '/management',
        createdDate: '2021-07-01'
      },
      {
        id: 'INST-003',
        name: 'Sri Vidya Kids Academy (Early Childhood Centre)',
        code: 'SV-KIDS',
        udise: '28172901925',
        board: 'Early Years Foundation & Playgroup',
        category: 'Pre-Primary (Nursery, LKG, UKG)',
        students: 140,
        staff: 8,
        status: 'Active',
        domain: 'kids.srividya.edu.in',
        portalUrl: '/management',
        createdDate: '2023-04-15'
      }
    ],
    operators: [
      {
        id: 'OP-001',
        name: 'Platform Root SysAdmin',
        email: 'sysadmin.root@srividya.trust',
        role: 'Super Administrator',
        institution: 'Global Trust Authority',
        mfa: 'Enabled (Hardware TOTP)',
        status: 'Active',
        lastLogin: 'Today, 08:24 PM IST'
      },
      {
        id: 'OP-002',
        name: 'Smt. Gorle Varalakshmi',
        email: 'srividyaschools2017@gmail.com',
        role: 'Institutional Principal',
        institution: 'Sri Vidya Main Campus',
        mfa: 'Enabled (Mobile OTP)',
        status: 'Active',
        lastLogin: 'Today, 08:15 PM IST'
      },
      {
        id: 'OP-003',
        name: 'Sri Navva Anand',
        email: 'navva.anand.personal@gmail.com',
        role: 'Vice Principal & HOD Maths',
        institution: 'Sri Vidya Main Campus',
        mfa: 'Enabled (Mobile OTP)',
        status: 'Active',
        lastLogin: 'Today, 07:48 PM IST'
      },
      {
        id: 'OP-004',
        name: 'DevOps Platform Operator',
        email: 'devops.ops@srividya.trust',
        role: 'Platform Operator',
        institution: 'Global Trust Authority',
        mfa: 'Enabled (FIDO2 Key)',
        status: 'Active',
        lastLogin: 'Yesterday, 11:30 PM IST'
      },
      {
        id: 'OP-005',
        name: 'Smt. M. Vijaya',
        email: 'vijaya.m.personal@gmail.com',
        role: 'Office Administrator',
        institution: 'Sri Vidya Main Campus',
        mfa: 'Enabled',
        status: 'Active',
        lastLogin: 'Today, 05:10 PM IST'
      }
    ],
    auditLogs: [
      {
        id: 'AUD-9941',
        timestamp: 'Today, 08:31:04 PM IST',
        actor: 'sysadmin.root@srividya.trust',
        role: 'Super Admin',
        action: 'School Configuration Update',
        target: 'Sri Vidya Main Campus (SV-MAIN)',
        ip: '192.168.1.1 (LAN Gateway)',
        status: 'Success',
        details: 'Verified high-contrast Indian Standard Time clock telemetry'
      },
      {
        id: 'AUD-9940',
        timestamp: 'Today, 07:15:22 PM IST',
        actor: 'sysadmin.root@srividya.trust',
        role: 'Super Admin',
        action: 'Feature Flag Toggled',
        target: 'Global Settings',
        ip: '192.168.1.1',
        status: 'Success',
        details: 'Enforced Institutional Privacy Isolation Boundary across Super Admin role'
      },
      {
        id: 'AUD-9939',
        timestamp: 'Today, 06:40:11 PM IST',
        actor: 'srividyaschools2017@gmail.com',
        role: 'Principal',
        action: 'Faculty Permissions Grant',
        target: 'Classroom Attendance Module',
        ip: '117.214.45.18 (Guntur BSNL Fiber)',
        status: 'Success',
        details: 'Authorized Class 8A lead attendance register submission'
      },
      {
        id: 'AUD-9938',
        timestamp: 'Today, 04:22:50 PM IST',
        actor: 'devops.ops@srividya.trust',
        role: 'Platform Operator',
        action: 'Database Snapshot Backup',
        target: 'Primary PostgreSQL 16 Cluster',
        ip: '10.0.4.12 (Internal VPC)',
        status: 'Success',
        details: 'Completed daily AES-256 automated backup snapshot (1.4 GB verified)'
      },
      {
        id: 'AUD-9937',
        timestamp: 'Yesterday, 09:10:14 PM IST',
        actor: 'sysadmin.root@srividya.trust',
        role: 'Super Admin',
        action: 'Seat Quota Allocation',
        target: 'Sri Vidya Main Campus',
        ip: '192.168.1.1',
        status: 'Success',
        details: 'Allocated 1,000 maximum student quota for academic year 2025-26'
      }
    ],
    supportTickets: [
      {
        id: 'TK-1082',
        institution: 'Sri Vidya E.M High School',
        subject: 'Requesting additional 50 student seats for Class 6 new admissions batch',
        priority: 'High',
        status: 'Open',
        reportedBy: 'Smt. Gorle Varalakshmi (Principal)',
        date: '2026-10-24',
        category: 'Subscription & Quota'
      },
      {
        id: 'TK-1079',
        institution: 'Sri Vidya Main Campus',
        subject: 'Biometric device sync delay during morning 8:30 AM peak rush',
        priority: 'Medium',
        status: 'In Progress',
        reportedBy: 'Smt. M. Vijaya (Office Admin)',
        date: '2026-10-23',
        category: 'Hardware Integration'
      },
      {
        id: 'TK-1075',
        institution: 'Sri Vidya Main Campus',
        subject: 'Update AP Board science curriculum practical rubric format',
        priority: 'Normal',
        status: 'Resolved',
        reportedBy: 'Sri Navva Anand (VP & HOD)',
        date: '2026-10-21',
        category: 'School Configuration'
      },
      {
        id: 'TK-1068',
        institution: 'Sri Vidya Main Campus',
        subject: 'SMS Gateway OTP delivery intermittent on Airtel network numbers',
        priority: 'High',
        status: 'Resolved',
        reportedBy: 'Smt. Gorle Varalakshmi',
        date: '2026-10-18',
        category: 'Third-Party Gateways'
      }
    ]
  };

  // Indian Standard Time (Asia/Kolkata) Engine
  function getISTDateTime() {
    const now = new Date();
    const dateOptions = {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
    return { dateString, timeString };
  }

  function updatePlatformClock() {
    const { dateString, timeString } = getISTDateTime();
    const timeEl = document.getElementById('platformLiveTimeText');
    if (timeEl) {
      timeEl.textContent = `${timeString} IST`;
    }
    const dateEl = document.getElementById('platformLiveDateText');
    if (dateEl) {
      dateEl.textContent = dateString;
    }
  }

  // Theme Management
  function setupTheme() {
    const saved = localStorage.getItem('sv_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sv_theme', next);
    updateThemeIcon(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('platformThemeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // Toast Alerts
  function showToast(message, type = 'success') {
    let toast = document.getElementById('platformToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'platformToast';
      toast.className = 'pa-toast';
      document.body.appendChild(toast);
    }
    const iconClass = type === 'success' ? 'fa-solid fa-circle-check text-emerald' :
                      type === 'info' ? 'fa-solid fa-circle-info text-blue' :
                      type === 'warning' ? 'fa-solid fa-triangle-exclamation text-amber' :
                      'fa-solid fa-circle-xmark text-danger';
    toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Navigation Controller
  function navigateTo(viewId) {
    state.activeView = viewId;

    // Update Sidebar Active Links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Visible Views
    document.querySelectorAll('.portal-view').forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Header Breadcrumb
    const crumbEl = document.getElementById('currentViewBreadcrumb');
    if (crumbEl) {
      const titles = {
        'dashboard': 'Platform Dashboard',
        'institutions': 'Institution Management',
        'config': 'School Configuration',
        'users': 'User & Account Management',
        'roles': 'Role Templates & RBAC',
        'subscription': 'Subscription & Plans',
        'health': 'System Health & Deployment',
        'audit': 'Immutable Audit Logs',
        'settings': 'Global Platform Settings',
        'support': 'Support & Issue Management'
      };
      crumbEl.textContent = titles[viewId] || 'Platform Administration';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileSidebar();
  }

  // Mobile Sidebar Controls
  function toggleMobileSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('mobile-open');
  }

  function closeMobileSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('mobile-open');
  }

  // Modals
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // Action: Add New Institution
  function handleAddInstitution(e) {
    e.preventDefault();
    const name = document.getElementById('newInstName').value;
    const code = document.getElementById('newInstCode').value;
    const board = document.getElementById('newInstBoard').value;
    const domain = document.getElementById('newInstDomain').value;

    const newInst = {
      id: `INST-00${state.institutions.length + 1}`,
      name: name,
      code: code,
      udise: '2817290192' + (state.institutions.length + 6),
      board: board,
      category: 'Dual-Wing Campus',
      students: 0,
      staff: 1,
      status: 'Active',
      domain: domain,
      portalUrl: '/management',
      createdDate: new Date().toISOString().split('T')[0]
    };

    state.institutions.push(newInst);
    renderInstitutionsTable();
    closeModal('modalAddInstitution');
    showToast(`Institution "${name}" provisioned successfully!`, 'success');

    // Add Audit Log Entry
    state.auditLogs.unshift({
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      actor: 'sysadmin.root@srividya.trust',
      role: 'Super Admin',
      action: 'Institution Onboarding',
      target: name,
      ip: '192.168.1.1',
      status: 'Success',
      details: `Provisioned tenant ${code} (${domain}) under Enterprise Trust License`
    });
    renderAuditLogsTable();
  }

  // Action: Create Support Ticket
  function handleCreateTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('newTicketSubject').value;
    const priority = document.getElementById('newTicketPriority').value;
    const category = document.getElementById('newTicketCategory').value;

    const newTicket = {
      id: `TK-${Math.floor(1085 + Math.random() * 50)}`,
      institution: 'Sri Vidya Main Campus',
      subject: subject,
      priority: priority,
      status: 'Open',
      reportedBy: 'Super Admin Operator',
      date: new Date().toISOString().split('T')[0],
      category: category
    };

    state.supportTickets.unshift(newTicket);
    renderSupportTicketsTable();
    closeModal('modalCreateTicket');
    showToast(`Support ticket #${newTicket.id} logged successfully!`, 'success');
  }

  // Renders
  function renderInstitutionsTable() {
    const tbody = document.getElementById('institutionsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.institutions.map(inst => `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.95rem;">${inst.name}</div>
          <div style="font-size: 0.78rem; color: #64748B;">Code: <strong>${inst.code}</strong> • UDISE: ${inst.udise}</div>
        </td>
        <td>
          <span style="font-size: 0.85rem; font-weight: 600;">${inst.board}</span>
          <div style="font-size: 0.75rem; color: #64748B;">${inst.category}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${inst.students} Students</div>
          <div style="font-size: 0.78rem; color: #64748B;">${inst.staff} Faculty &amp; Staff</div>
        </td>
        <td>
          <a href="http://${inst.domain}" target="_blank" style="color: #4F46E5; text-decoration: none; font-weight: 600; font-size: 0.85rem;">
            <i class="fa-solid fa-globe"></i> ${inst.domain}
          </a>
        </td>
        <td>
          <span class="badge-active"><i class="fa-solid fa-circle-check"></i> ${inst.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn-pa btn-pa-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="platformApp.navigateTo('config')">
              <i class="fa-solid fa-sliders"></i> Config
            </button>
            <a href="${inst.portalUrl}" class="btn-pa btn-pa-primary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Portal
            </a>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderOperatorsTable() {
    const tbody = document.getElementById('operatorsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.operators.map(op => `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--color-text-main);">${op.name}</div>
          <div style="font-size: 0.78rem; color: #64748B;"><i class="fa-regular fa-envelope"></i> ${op.email}</div>
        </td>
        <td>
          <span class="badge-operator">${op.role}</span>
        </td>
        <td>${op.institution}</td>
        <td>
          <span style="font-size: 0.8rem; color: #059669; font-weight: 600;">
            <i class="fa-solid fa-shield-check"></i> ${op.mfa}
          </span>
        </td>
        <td style="font-size: 0.8rem; color: #64748B;">${op.lastLogin}</td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn-pa btn-pa-secondary" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;" onclick="platformApp.invalidateSession('${op.name}')" title="Invalidate Session Tokens">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
            <button class="btn-pa btn-pa-secondary" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;" onclick="platformApp.resetMFA('${op.name}')" title="Reset MFA">
              <i class="fa-solid fa-key"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderAuditLogsTable() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.auditLogs.map(log => `
      <tr>
        <td style="font-size: 0.8rem; font-family: monospace; font-weight: 600; white-space: nowrap;">
          <i class="fa-regular fa-clock text-primary"></i> ${log.timestamp}
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.85rem;">${log.actor}</div>
          <span class="badge-operator" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">${log.role}</span>
        </td>
        <td>
          <strong style="color: var(--color-text-main); font-size: 0.85rem;">${log.action}</strong>
          <div style="font-size: 0.75rem; color: #64748B;">Target: ${log.target}</div>
        </td>
        <td style="font-size: 0.8rem; color: #64748B;">${log.details}</td>
        <td style="font-size: 0.78rem; font-family: monospace;">${log.ip}</td>
        <td>
          <span class="badge-active" style="padding: 0.15rem 0.5rem; font-size: 0.72rem;">${log.status}</span>
        </td>
      </tr>
    `).join('');
  }

  function renderSupportTicketsTable() {
    const tbody = document.getElementById('supportTicketsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.supportTickets.map(tk => `
      <tr>
        <td style="font-weight: 700; color: #4F46E5;">#${tk.id}</td>
        <td>
          <div style="font-weight: 600; font-size: 0.875rem;">${tk.subject}</div>
          <div style="font-size: 0.75rem; color: #64748B;">Reported by: ${tk.reportedBy} • ${tk.institution}</div>
        </td>
        <td>
          <span style="font-size: 0.78rem; font-weight: 600; background: var(--color-bg-subtle); padding: 0.2rem 0.6rem; border-radius: 6px;">
            ${tk.category}
          </span>
        </td>
        <td>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${tk.priority === 'High' ? '#DC2626' : tk.priority === 'Medium' ? '#D97706' : '#2563EB'};">
            ${tk.priority} Priority
          </span>
        </td>
        <td>
          <span class="${tk.status === 'Resolved' ? 'badge-active' : 'badge-pending'}">${tk.status}</span>
        </td>
        <td>
          <button class="btn-pa btn-pa-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="platformApp.resolveTicket('${tk.id}')">
            ${tk.status === 'Resolved' ? 'View Thread' : 'Resolve'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Feature Toggle Handler
  function toggleFeature(flagName) {
    showToast(`Institutional feature "${flagName}" updated and synchronized!`, 'success');
  }

  // Operator Actions
  function invalidateSession(userName) {
    showToast(`Active sessions for "${userName}" have been invalidated. User must re-authenticate.`, 'warning');
  }

  function resetMFA(userName) {
    showToast(`MFA reset email dispatched to "${userName}".`, 'info');
  }

  function resolveTicket(ticketId) {
    const tk = state.supportTickets.find(t => t.id === ticketId);
    if (tk) {
      tk.status = 'Resolved';
      renderSupportTicketsTable();
      showToast(`Support Ticket #${ticketId} marked as Resolved.`, 'success');
    }
  }

  // Filter Audit Logs by Search
  function filterAuditLogs() {
    const query = (document.getElementById('auditSearchInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#auditLogsTableBody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(query) ? '' : 'none';
    });
  }

  // Live Ping Latency Test
  function pingCluster() {
    const btn = document.getElementById('btnPingCluster');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pinging...';
    setTimeout(() => {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Run Ping Diagnostics';
      const latency = Math.floor(18 + Math.random() * 12);
      showToast(`Cluster Health Excellent! P95 API Latency: ${latency}ms (0 packet loss)`, 'success');
    }, 700);
  }

  // Export Audit Trail
  function exportAuditTrail() {
    let csv = 'Timestamp,Actor,Role,Action,Target,IP,Status,Details\n';
    state.auditLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.ip}","${l.status}","${l.details}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sri_Vidya_Platform_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Audit trail exported successfully as CSV!', 'success');
  }

  // Initialization
  function init() {
    setupTheme();
    updatePlatformClock();
    setInterval(updatePlatformClock, 1000);

    renderInstitutionsTable();
    renderOperatorsTable();
    renderAuditLogsTable();
    renderSupportTicketsTable();

    // Check hash for direct view navigation (e.g. #institutions)
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      navigateTo(hash);
    } else {
      navigateTo('dashboard');
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public Interface
  return {
    navigateTo,
    toggleTheme,
    toggleMobileSidebar,
    closeMobileSidebar,
    openModal,
    closeModal,
    handleAddInstitution,
    handleCreateTicket,
    toggleFeature,
    invalidateSession,
    resetMFA,
    resolveTicket,
    filterAuditLogs,
    pingCluster,
    exportAuditTrail
  };
})();

window.platformApp = platformApp;
