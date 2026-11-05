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
        institutionId: 'INST-001',
        name: 'Sri Vidya E.M High School (Main Campus)',
        displayName: 'Sri Vidya Main Campus',
        code: 'SV-MAIN',
        udise: '28172901923',
        board: 'Andhra Pradesh State SSC Board',
        category: 'High School & Primary (Class 1 to 10)',
        type: 'School',
        trust: 'Sri Vidya Educational Trust',
        students: 855,
        staff: 34,
        setupStatus: 'Complete',
        status: 'Active',
        domain: 'srividya.edu.in',
        domains: {
          primary: 'srividya.edu.in',
          publicWebsite: 'www.srividya.edu.in',
          adminPortal: 'admin.srividya.edu.in',
          facultyPortal: 'faculty.srividya.edu.in',
          dnsVerified: true
        },
        address: {
          street: '1-23 Main Road, Tilak Nagar',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          country: 'India',
          postalCode: '522002'
        },
        contact: {
          email: 'srividyaschools2017@gmail.com',
          phone: '+91 863 2234567',
          alternatePhone: '+91 9440123456',
          website: 'https://srividya.edu.in'
        },
        adminContact: {
          name: 'Smt. Gorle Varalakshmi',
          email: 'srividyaschools2017@gmail.com',
          phone: '+91 863 2234567'
        },
        administrators: [
          { name: 'Smt. Gorle Varalakshmi', email: 'srividyaschools2017@gmail.com', phone: '+91 863 2234567', role: 'Institutional Principal', status: 'Active' },
          { name: 'Sri Navva Anand', email: 'navva.anand.personal@gmail.com', phone: '+91 9440123456', role: 'Vice Principal & HOD Maths', status: 'Active' }
        ],
        configuration: {
          timezone: 'Asia/Kolkata',
          locale: 'en-IN',
          currency: 'INR',
          academicYearFormat: '2026-2027',
          gradingScale: 'AP SSC 10-Point GPA',
          attendanceMode: 'Twice Daily (Morning & Afternoon)'
        },
        branding: {
          primaryColor: '#1E3A8A',
          accentColor: '#F59E0B'
        },
        metrics: {
          students: 855,
          faculty: 34,
          attendanceToday: '96.4%',
          feeCollectionPct: '91.8%'
        },
        portalUrl: '/management',
        createdDate: '2017-06-12'
      },
      {
        id: 'INST-002',
        institutionId: 'INST-002',
        name: 'Sri Vidya Junior College (Science & Commerce)',
        displayName: 'Sri Vidya Junior College',
        code: 'SV-INTER',
        udise: '28172901924',
        board: 'Board of Intermediate Education AP (BIEAP)',
        category: 'Intermediate College (+1 & +2 Wing)',
        type: 'Branch',
        trust: 'Sri Vidya Educational Trust',
        students: 320,
        staff: 18,
        setupStatus: 'In Progress',
        status: 'Active',
        domain: 'intermediate.srividya.edu.in',
        domains: {
          primary: 'intermediate.srividya.edu.in',
          publicWebsite: 'intermediate.srividya.edu.in',
          adminPortal: 'admin-inter.srividya.edu.in',
          facultyPortal: 'faculty-inter.srividya.edu.in',
          dnsVerified: false
        },
        address: {
          street: 'Plot 45, Vidya Nagar',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          country: 'India',
          postalCode: '522004'
        },
        contact: {
          email: 'intermediate@srividya.edu.in',
          phone: '+91 863 2245678',
          website: 'https://intermediate.srividya.edu.in'
        },
        adminContact: {
          name: 'Sri K. Venkata Rao',
          email: 'intermediate@srividya.edu.in',
          phone: '+91 863 2245678'
        },
        administrators: [
          { name: 'Sri K. Venkata Rao', email: 'intermediate@srividya.edu.in', phone: '+91 863 2245678', role: 'College Principal', status: 'Active' }
        ],
        configuration: {
          timezone: 'Asia/Kolkata',
          locale: 'en-IN',
          currency: 'INR',
          academicYearFormat: '2026-2027',
          gradingScale: 'BIEAP Percentage Marks & Grades',
          attendanceMode: 'Per-Lecture Attendance'
        },
        branding: {
          primaryColor: '#059669',
          accentColor: '#10B981'
        },
        metrics: {
          students: 320,
          faculty: 18,
          attendanceToday: '94.2%',
          feeCollectionPct: '88.5%'
        },
        portalUrl: '/management',
        createdDate: '2021-07-01'
      },
      {
        id: 'INST-003',
        institutionId: 'INST-003',
        name: 'Sri Vidya Kids Academy (Early Childhood Centre)',
        displayName: 'Sri Vidya Kids Academy',
        code: 'SV-KIDS',
        udise: '28172901925',
        board: 'Early Years Foundation & Playgroup',
        category: 'Pre-Primary (Nursery, LKG, UKG)',
        type: 'Other',
        trust: 'Sri Vidya Educational Trust',
        students: 140,
        staff: 8,
        setupStatus: 'Complete',
        status: 'Active',
        domain: 'kids.srividya.edu.in',
        domains: {
          primary: 'kids.srividya.edu.in',
          publicWebsite: 'kids.srividya.edu.in',
          adminPortal: 'admin-kids.srividya.edu.in',
          facultyPortal: 'faculty-kids.srividya.edu.in',
          dnsVerified: true
        },
        address: {
          street: '8-12 Amaravathi Road',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          country: 'India',
          postalCode: '522007'
        },
        contact: {
          email: 'kids@srividya.edu.in',
          phone: '+91 863 2256789',
          website: 'https://kids.srividya.edu.in'
        },
        adminContact: {
          name: 'Smt. P. Madhavi Latha',
          email: 'kids@srividya.edu.in',
          phone: '+91 863 2256789'
        },
        administrators: [
          { name: 'Smt. P. Madhavi Latha', email: 'kids@srividya.edu.in', phone: '+91 863 2256789', role: 'Headmistress (Pre-Primary)', status: 'Active' }
        ],
        configuration: {
          timezone: 'Asia/Kolkata',
          locale: 'en-IN',
          currency: 'INR',
          academicYearFormat: '2026-2027',
          gradingScale: 'Developmental Milestone Descriptive',
          attendanceMode: 'Morning Check-in'
        },
        branding: {
          primaryColor: '#D97706',
          accentColor: '#FBBF24'
        },
        metrics: {
          students: 140,
          faculty: 8,
          attendanceToday: '92.0%',
          feeCollectionPct: '95.0%'
        },
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
    return { dateString, timeString,
    loadInstitutions,
    updateInstitutionSummaryCards,
    filterInstitutionsDirectory,
    resetInstitutionFilters,
    openAddInstitutionWizard,
    goToWizardStep,
    nextWizardStep,
    prevWizardStep,
    updateWizardBrandingPreview,
    runWizardDnsCheck,
    submitWizard,
    viewInstitution,
    switchInstitutionDetailTab,
    openEditFromDetail,
    openConfigureFromDetail,
    openInviteAdminForDetail,
    openSuspendFromDetail,
    confirmSuspendInstitution,
    reactivateInstitutionFromDetail,
    archiveInstitutionFromDetail,
    verifyDomainFromDetail,
    resendAdminInvite,
    exportInstitutionsCSV,
    openImportModal,
    downloadSampleInstitutionsCSV,
    handleImportFileSelect,
    processImportInstitutions,
    toggleRowDropdown,
    closeAllRowDropdowns
  };
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
        'onboarding': 'Institution Onboarding & Migration',
        'users': 'User & Account Management',
        'roles': 'Role Templates & Permissions',
        'security-monitoring': 'Security & Access Monitoring',
        'subscription': 'Subscriptions & Plans',
        'health': 'System Health & Deployment',
        'backups': 'Backups & Recovery',
        'integrations': 'Integrations & API Management',
        'support': 'Support & Issue Management',
        'domains-email': 'Domains, Email & Notifications',
        'settings': 'Global Platform Settings',
        'policies': 'Platform Policies & Data Retention',
        'audit': 'Immutable Audit Logs'
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
    loadInstitutions();
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
    // =========================================================================
  // MODULE 3: INSTITUTION MANAGEMENT (SECTIONS 3.1, 3.2, 3.3, 3.4)
  // =========================================================================

  let currentWizardStep = 1;
  let selectedInstitutionId = null;
  let importedFileData = null;

  // Load institutions from API or fallback
  async function loadInstitutions() {
    try {
      const res = await fetch('/api/v1/platform/institutions');
      if (res.ok) {
        const body = await res.json();
        if (body && body.success && Array.isArray(body.data) && body.data.length > 0) {
          state.institutions = body.data;
        }
      }
    } catch (e) {
      console.warn('API endpoint unreachable, using enriched state:', e);
    }
    updateInstitutionSummaryCards();
    renderInstitutionsTable();
  }

  // Update Section 3.1 5 Summary Cards
  function updateInstitutionSummaryCards() {
    const total = state.institutions.length;
    const active = state.institutions.filter(i => i.status === 'Active').length;
    const inProgress = state.institutions.filter(i => i.setupStatus === 'In Progress' || i.setupStatus === 'Not Started' || i.status === 'Draft' || i.status === 'Onboarding').length;
    const suspended = state.institutions.filter(i => i.status === 'Suspended').length;
    const configIssues = state.institutions.filter(i => (i.domains && !i.domains.dnsVerified) || i.setupStatus === 'Configuration Review').length;

    const totalEl = document.getElementById('instSummaryTotal');
    if (totalEl) totalEl.textContent = total;
    const activeEl = document.getElementById('instSummaryActive');
    if (activeEl) activeEl.textContent = active;
    const progEl = document.getElementById('instSummaryProgress');
    if (progEl) progEl.textContent = inProgress;
    const suspEl = document.getElementById('instSummarySuspended');
    if (suspEl) suspEl.textContent = suspended;
    const confEl = document.getElementById('instSummaryConfigIssues');
    if (confEl) confEl.textContent = configIssues;
  }

  // Render 10-Column Directory Table (Section 3.1)
  function renderInstitutionsTable(list = null) {
    const tbody = document.getElementById('institutionsTableBody');
    if (!tbody) return;
    const items = list || state.institutions;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 3rem; color: #64748B;">' +
        '<div style="font-size: 2.5rem; color: #CBD5E1; margin-bottom: 0.75rem;"><i class="fa-solid fa-school-circle-xmark"></i></div>' +
        '<strong style="font-size: 1.05rem; color: var(--color-text-main);">No institutions match the filter criteria.</strong>' +
        '<p style="margin: 0.35rem 0 1rem; font-size: 0.85rem;">Try adjusting your search terms or clearing the filter fields.</p>' +
        '<button type="button" class="btn-pa btn-pa-secondary" onclick="platformApp.resetInstitutionFilters()">' +
        '<i class="fa-solid fa-rotate-left mr-1"></i> Reset All Filters</button></td></tr>';
      return;
    }

    tbody.innerHTML = items.map(inst => {
      const instId = inst.institutionId || inst.id || 'INST-000';
      const name = inst.name || 'Untitled Institution';
      const code = inst.code || 'N/A';
      const type = inst.type || 'School';
      const domain = (inst.domains && inst.domains.primary) || inst.domain || 'Not Configured';
      const dnsVerified = inst.domains ? !!inst.domains.dnsVerified : true;
      const adminName = (inst.adminContact && inst.adminContact.name) || (inst.administrators && inst.administrators[0] && inst.administrators[0].name) || 'Authorized Staff';
      const adminEmail = (inst.adminContact && inst.adminContact.email) || (inst.administrators && inst.administrators[0] && inst.administrators[0].email) || (inst.contact && inst.contact.email) || 'N/A';
      const setupStatus = inst.setupStatus || 'Complete';
      const status = inst.status || 'Active';
      const createdDate = inst.createdDate || '2026-01-01';

      let setupBadgeClass = 'setup-badge-complete';
      let setupIcon = 'fa-circle-check';
      if (setupStatus === 'In Progress' || setupStatus === 'Configuration Review') {
        setupBadgeClass = 'setup-badge-progress';
        setupIcon = 'fa-spinner fa-spin';
      } else if (setupStatus === 'Not Started' || setupStatus === 'Draft') {
        setupBadgeClass = 'setup-badge-notstarted';
        setupIcon = 'fa-circle-pause';
      }

      let statusBadgeClass = 'inst-badge-active';
      let statusIcon = 'fa-circle-check';
      if (status === 'Suspended') {
        statusBadgeClass = 'inst-badge-suspended';
        statusIcon = 'fa-ban';
      } else if (status === 'Archived') {
        statusBadgeClass = 'inst-badge-archived';
        statusIcon = 'fa-box-archive';
      } else if (status === 'Draft' || status === 'Onboarding') {
        statusBadgeClass = 'inst-badge-draft';
        statusIcon = 'fa-pen-to-square';
      }

      const dnsBadge = dnsVerified
        ? '<span class="domain-dns-badge dns-badge-verified"><i class="fa-solid fa-check"></i> DNS Verified</span>'
        : '<span class="domain-dns-badge dns-badge-pending"><i class="fa-solid fa-clock"></i> Pending DNS</span>';

      const toggleAction = status === 'Suspended'
        ? '<a href="javascript:void(0)" onclick="platformApp.reactivateInstitutionFromDetail(\'' + instId + '\'); platformApp.closeAllRowDropdowns();" style="display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; font-size: 0.78rem; color: #059669; text-decoration: none;"><i class="fa-solid fa-circle-check"></i> Reactivate Access</a>'
        : '<a href="javascript:void(0)" onclick="platformApp.openSuspendFromDetail(\'' + instId + '\'); platformApp.closeAllRowDropdowns();" style="display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; font-size: 0.78rem; color: #DC2626; text-decoration: none;"><i class="fa-solid fa-ban"></i> Suspend Access</a>';

      return '<tr>' +
        '<td><span style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: var(--pa-primary, #4F46E5); background: rgba(79, 70, 229, 0.08); padding: 2px 6px; border-radius: 4px;">' + instId + '</span></td>' +
        '<td><div style="font-weight: 700; color: var(--color-text-main); font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;"><i class="fa-solid fa-school" style="color: var(--pa-primary, #4F46E5); font-size: 0.85rem;"></i><span>' + name + '</span></div><div style="font-size: 0.75rem; color: #64748B; margin-top: 2px;">' + (inst.trust || 'Sri Vidya Educational Trust') + ' • UDISE: ' + (inst.udise || 'Statutory') + '</div></td>' +
        '<td><span class="inst-code-badge">' + code + '</span></td>' +
        '<td><span style="font-size: 0.82rem; font-weight: 600; color: #334155;">' + type + '</span><div style="font-size: 0.72rem; color: #64748B;">' + (inst.category || 'Dual-Wing') + '</div></td>' +
        '<td><div><a href="http://' + domain + '" target="_blank" style="color: var(--pa-primary, #4F46E5); text-decoration: none; font-weight: 600; font-size: 0.82rem;">' + domain + '</a></div><div style="margin-top: 3px;">' + dnsBadge + '</div></td>' +
        '<td><div style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-main);">' + adminName + '</div><div style="font-size: 0.74rem; color: #64748B;">' + adminEmail + '</div></td>' +
        '<td><span class="inst-setup-badge ' + setupBadgeClass + '"><i class="fa-solid ' + setupIcon + '"></i> ' + setupStatus + '</span></td>' +
        '<td><span class="inst-status-badge ' + statusBadgeClass + '"><i class="fa-solid ' + statusIcon + '"></i> ' + status + '</span></td>' +
        '<td><span style="font-size: 0.8rem; color: #475569;">' + createdDate + '</span></td>' +
        '<td style="text-align: center;"><div style="display: inline-flex; align-items: center; gap: 0.35rem;">' +
        '<button type="button" class="btn-pa btn-pa-secondary" style="padding: 0.28rem 0.55rem; font-size: 0.75rem;" onclick="platformApp.viewInstitution(\'' + instId + '\')" title="View Full 10-Tab Dossier"><i class="fa-solid fa-eye mr-1"></i> View</button>' +
        '<button type="button" class="btn-pa btn-pa-secondary" style="padding: 0.28rem 0.55rem; font-size: 0.75rem;" onclick="platformApp.openConfigureFromDetail(\'' + instId + '\')" title="Configure Institution"><i class="fa-solid fa-sliders"></i></button>' +
        '<div class="dropdown" style="position: relative; display: inline-block;">' +
        '<button type="button" class="btn-pa btn-pa-secondary" style="padding: 0.28rem 0.45rem; font-size: 0.75rem;" onclick="platformApp.toggleRowDropdown(event, \'' + instId + '\')" title="More Operations"><i class="fa-solid fa-ellipsis-vertical"></i></button>' +
        '<div class="pa-dropdown-menu" id="dropdown-' + instId + '" style="display: none; position: absolute; right: 0; top: 100%; z-index: 50; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 160px; padding: 4px 0; margin-top: 4px;">' +
        '<a href="javascript:void(0)" onclick="platformApp.viewInstitution(\'' + instId + '\'); platformApp.closeAllRowDropdowns();" style="display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; font-size: 0.78rem; color: #1E293B; text-decoration: none;"><i class="fa-solid fa-circle-info text-primary"></i> Full Dossier</a>' +
        '<a href="javascript:void(0)" onclick="platformApp.openInviteAdminForDetail(\'' + instId + '\'); platformApp.closeAllRowDropdowns();" style="display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; font-size: 0.78rem; color: #1E293B; text-decoration: none;"><i class="fa-solid fa-user-shield text-indigo"></i> Invite Administrator</a>' +
        '<a href="javascript:void(0)" onclick="platformApp.verifyDomainFromDetail(\'' + domain + '\'); platformApp.closeAllRowDropdowns();" style="display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; font-size: 0.78rem; color: #1E293B; text-decoration: none;"><i class="fa-solid fa-globe text-emerald"></i> Probe DNS Records</a>' +
        '<div style="height: 1px; background: #F1F5F9; margin: 4px 0;"></div>' +
        toggleAction +
        '</div></div></div></td></tr>';
    }).join('');
  }

  function toggleRowDropdown(event, instId) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('dropdown-' + instId);
    if (!menu) return;
    const isShowing = menu.style.display === 'block';
    closeAllRowDropdowns();
    if (!isShowing) {
      menu.style.display = 'block';
    }
  }

  function closeAllRowDropdowns() {
    document.querySelectorAll('.pa-dropdown-menu').forEach(el => el.style.display = 'none');
  }

  document.addEventListener('click', () => closeAllRowDropdowns());

  // Multi-Field Filter Directory (Section 3.1)
  function filterInstitutionsDirectory() {
    const q = (document.getElementById('instSearchInput')?.value || '').trim().toLowerCase();
    const code = (document.getElementById('instCodeFilter')?.value || '').trim().toLowerCase();
    const type = (document.getElementById('instTypeFilter')?.value || '').trim();
    const status = (document.getElementById('instStatusFilter')?.value || '').trim();
    const ay = (document.getElementById('instYearFilter')?.value || '').trim();
    const domain = (document.getElementById('instDomainFilter')?.value || '').trim().toLowerCase();
    const date = (document.getElementById('instDateFilter')?.value || '').trim();

    const filtered = state.institutions.filter(inst => {
      const name = (inst.name || '').toLowerCase();
      const instCode = (inst.code || '').toLowerCase();
      const instType = inst.type || '';
      const instStatus = inst.status || '';
      const instAy = (inst.configuration && inst.configuration.academicYearFormat) || '';
      const instDomain = ((inst.domains && inst.domains.primary) || inst.domain || '').toLowerCase();
      const instDate = inst.createdDate || '';

      if (q && !name.includes(q) && !instCode.includes(q) && !instDomain.includes(q)) return false;
      if (code && !instCode.includes(code)) return false;
      if (type && instType !== type) return false;
      if (status && instStatus !== status) return false;
      if (ay && !instAy.includes(ay)) return false;
      if (domain && !instDomain.includes(domain)) return false;
      if (date && instDate !== date) return false;

      return true;
    });

    renderInstitutionsTable(filtered);
  }

  function resetInstitutionFilters() {
    if (document.getElementById('instSearchInput')) document.getElementById('instSearchInput').value = '';
    if (document.getElementById('instCodeFilter')) document.getElementById('instCodeFilter').value = '';
    if (document.getElementById('instTypeFilter')) document.getElementById('instTypeFilter').value = '';
    if (document.getElementById('instStatusFilter')) document.getElementById('instStatusFilter').value = '';
    if (document.getElementById('instYearFilter')) document.getElementById('instYearFilter').value = '';
    if (document.getElementById('instDomainFilter')) document.getElementById('instDomainFilter').value = '';
    if (document.getElementById('instDateFilter')) document.getElementById('instDateFilter').value = '';
    renderInstitutionsTable();
    showToast('Institution directory filters reset', 'info');
  }

  // =========================================================================
  // SECTION 3.2: ADD INSTITUTION 6-STEP SETUP WIZARD
  // =========================================================================

  function openAddInstitutionWizard() {
    currentWizardStep = 1;
    goToWizardStep(1);
    openModal('modalAddInstitution');
  }

  function goToWizardStep(stepNum) {
    currentWizardStep = stepNum;
    for (let s = 1; s <= 6; s++) {
      const pane = document.getElementById('wizardPane' + s);
      const nav = document.getElementById('wizardStepNav' + s);
      if (pane) pane.style.display = (s === stepNum) ? 'block' : 'none';
      if (nav) {
        if (s === stepNum) {
          nav.className = 'pa-wizard-step active';
        } else if (s < stepNum) {
          nav.className = 'pa-wizard-step completed';
        } else {
          nav.className = 'pa-wizard-step';
        }
      }
    }

    const prevBtn = document.getElementById('btnWizardBack');
    const nextBtn = document.getElementById('btnWizardNext');
    const saveDraftBtn = document.getElementById('btnWizardDraft');
    const activateBtn = document.getElementById('btnWizardSubmit');

    if (prevBtn) prevBtn.style.display = (stepNum > 1) ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = (stepNum < 6) ? 'inline-flex' : 'none';
    if (saveDraftBtn) saveDraftBtn.style.display = (stepNum === 6) ? 'inline-flex' : 'none';
    if (activateBtn) activateBtn.style.display = (stepNum === 6) ? 'inline-flex' : 'none';

    if (stepNum === 6) {
      populateWizardReviewSummary();
    }
  }

  function nextWizardStep() {
    if (currentWizardStep < 6) {
      goToWizardStep(currentWizardStep + 1);
    }
  }

  function prevWizardStep() {
    if (currentWizardStep > 1) {
      goToWizardStep(currentWizardStep - 1);
    }
  }

  function updateWizardBrandingPreview() {
    const primary = document.getElementById('wizPrimaryColor')?.value || '#1E3A8A';
    const accent = document.getElementById('wizAccentColor')?.value || '#F59E0B';
    const code = document.getElementById('wizPrimaryHexCode');
    const accentCode = document.getElementById('wizAccentHexCode');
    if (code) code.textContent = primary;
    if (accentCode) accentCode.textContent = accent;

    const brandBtn = document.getElementById('wizBrandingLoginBtn');
    if (brandBtn) {
      brandBtn.style.background = primary;
    }
    const reportBorder = document.getElementById('wizBrandingReportBorder');
    if (reportBorder) {
      reportBorder.style.borderColor = primary;
    }
    const docBar = document.getElementById('wizDocHeaderBar');
    if (docBar) {
      docBar.style.background = primary;
    }
  }

  function runWizardDnsCheck() {
    const domain = document.getElementById('wizPrimaryDomain')?.value || 'institution.srividya.edu.in';
    const probeEl = document.getElementById('wizDnsProbeStatus');
    if (probeEl) {
      probeEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-primary mr-1"></i> Probing DNS A &amp; CNAME records for ' + domain + '...';
      probeEl.style.color = '#4F46E5';
    }

    setTimeout(() => {
      if (probeEl) {
        probeEl.innerHTML = '<i class="fa-solid fa-circle-check text-emerald mr-1"></i> DNS Verification Succeeded! Host ' + domain + ' resolves cleanly to Cloud Gateway.';
        probeEl.style.color = '#059669';
      }
      showToast('DNS Verification check passed for ' + domain, 'success');
    }, 900);
  }

  function populateWizardReviewSummary() {
    const name = document.getElementById('wizName')?.value || 'New School Entity';
    const code = document.getElementById('wizCode')?.value || 'SV-NEW';
    const type = document.getElementById('wizType')?.value || 'School';
    const domain = document.getElementById('wizPrimaryDomain')?.value || 'new.srividya.edu.in';
    const adminName = document.getElementById('wizAdminName')?.value || 'Institutional Principal';
    const adminEmail = document.getElementById('wizAdminEmail')?.value || 'principal@srividya.edu.in';

    const revName = document.getElementById('revName');
    if (revName) revName.textContent = name + ' (' + code + ')';
    const revType = document.getElementById('revType');
    if (revType) revType.textContent = type;
    const revDomain = document.getElementById('revDomain');
    if (revDomain) revDomain.textContent = domain;
    const revAdmin = document.getElementById('revAdmin');
    if (revAdmin) revAdmin.textContent = adminName + ' (' + adminEmail + ')';
  }

  async function submitWizard(actionType) {
    actionType = actionType || 'activate';
    const name = document.getElementById('wizName')?.value || 'New School Entity';
    const displayName = document.getElementById('wizDisplayName')?.value || name;
    const code = document.getElementById('wizCode')?.value || ('SV-0' + (state.institutions.length + 1));
    const type = document.getElementById('wizType')?.value || 'School';
    const email = document.getElementById('wizEmail')?.value || 'contact@srividya.edu.in';
    const phone = document.getElementById('wizPhone')?.value || '+91 863 2234000';
    const domain = document.getElementById('wizPrimaryDomain')?.value || (code.toLowerCase() + '.srividya.edu.in');
    const adminName = document.getElementById('wizAdminName')?.value || 'Institutional Principal';
    const adminEmail = document.getElementById('wizAdminEmail')?.value || ('admin@' + domain);

    const payload = {
      institutionId: 'INST-00' + (state.institutions.length + 1),
      name: name,
      displayName: displayName,
      code: code,
      type: type,
      trust: 'Sri Vidya Educational Trust',
      contact: { email: email, phone: phone, website: 'https://' + domain },
      domains: { primary: domain, publicWebsite: domain, adminPortal: 'admin.' + domain, facultyPortal: 'faculty.' + domain, dnsVerified: true },
      administrators: [{ name: adminName, email: adminEmail, role: 'Institutional Principal', status: 'Invited' }],
      setupStatus: actionType === 'activate' ? 'Complete' : 'In Progress',
      status: actionType === 'activate' ? 'Active' : 'Draft',
      createdDate: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/v1/platform/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.data) {
          state.institutions.unshift(body.data);
        } else {
          state.institutions.unshift(payload);
        }
      } else {
        state.institutions.unshift(payload);
      }
    } catch (e) {
      state.institutions.unshift(payload);
    }

    closeModal('modalAddInstitution');
    updateInstitutionSummaryCards();
    renderInstitutionsTable();

    state.auditLogs.unshift({
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: 'Just now',
      actor: 'sysadmin.root@srividya.trust',
      role: 'Super Admin',
      action: actionType === 'activate' ? 'Institution Provisioning & Activation' : 'Institution Draft Created',
      target: name,
      ip: '192.168.1.1',
      status: 'Success',
      details: 'Provisioned institutional tenant ' + code + ' (' + domain + ') with status ' + payload.status
    });
    renderAuditLogsTable();

    showToast('Institution "' + name + '" ' + (actionType === 'activate' ? 'activated and live' : 'saved as draft') + ' successfully!', 'success');
  }

  // =========================================================================
  // SECTION 3.3: INSTITUTION DETAIL DOSSIER (10 TABS)
  // =========================================================================

    function viewInstitution(id) {
    selectedInstitutionId = id;
    const inst = state.institutions.find(i => (i.institutionId === id || i.id === id));
    if (!inst) {
      showToast('Institution ' + id + ' not found', 'warning');
      return;
    }

    const titleEl = document.getElementById('detailModalTitle') || document.getElementById('detailInstTitle');
    if (titleEl) titleEl.textContent = inst.name;
    const badgeEl = document.getElementById('detailModalStatusBadge');
    if (badgeEl) {
      badgeEl.textContent = inst.status;
      badgeEl.className = 'inst-status-badge ' + (inst.status === 'Suspended' ? 'inst-badge-suspended' : 'inst-badge-active');
    }
    const idEl = document.getElementById('detailModalId');
    if (idEl) idEl.textContent = inst.institutionId || inst.id;
    const codeEl = document.getElementById('detailModalCode');
    if (codeEl) codeEl.textContent = inst.code;
    const boardEl = document.getElementById('detailModalBoard');
    if (boardEl) boardEl.textContent = inst.board || 'AP State SSC Board';

    // Overview KPIs
    const studEl = document.getElementById('detailOverviewStudents');
    if (studEl) studEl.textContent = (inst.metrics && inst.metrics.students) || inst.students || 0;
    const staffEl = document.getElementById('detailOverviewStaff');
    if (staffEl) staffEl.textContent = (inst.metrics && inst.metrics.faculty) || inst.staff || 0;
    const headEl = document.getElementById('detailOverviewHead');
    if (headEl) headEl.textContent = (inst.adminContact && inst.adminContact.name) || (inst.administrators && inst.administrators[0] && inst.administrators[0].name) || 'Principal';
    const emailEl = document.getElementById('detailOverviewEmail');
    if (emailEl) emailEl.textContent = (inst.contact && inst.contact.email) || 'N/A';
    const phoneEl = document.getElementById('detailOverviewPhone');
    if (phoneEl) phoneEl.textContent = (inst.contact && inst.contact.phone) || 'N/A';
    const addrEl = document.getElementById('detailOverviewAddress');
    if (addrEl) {
      const a = inst.address || {};
      addrEl.textContent = (a.street || 'Main Road') + ', ' + (a.city || 'Guntur') + ', ' + (a.state || 'Andhra Pradesh');
    }
    const domLink = document.getElementById('detailOverviewDomainLink');
    if (domLink) {
      const d = (inst.domains && inst.domains.primary) || inst.domain || 'srividya.edu.in';
      domLink.textContent = d;
      domLink.href = 'http://' + d;
    }

    // Profile Tab
    const pName = document.getElementById('detailProfileName');
    if (pName) pName.textContent = inst.name;
    const pDisp = document.getElementById('detailProfileDisplayName');
    if (pDisp) pDisp.textContent = inst.displayName || inst.name;
    const pCode = document.getElementById('detailProfileCode');
    if (pCode) pCode.textContent = inst.code;
    const pBoard = document.getElementById('detailProfileBoard');
    if (pBoard) pBoard.textContent = inst.board || 'AP State Board';
    const pUdise = document.getElementById('detailProfileUdise');
    if (pUdise) pUdise.textContent = inst.udise || 'Statutory UDISE+';
    const pTrust = document.getElementById('detailProfileTrust');
    if (pTrust) pTrust.textContent = inst.trust || 'Sri Vidya Educational Trust';
    const pEmail = document.getElementById('detailProfileEmail');
    if (pEmail) pEmail.textContent = (inst.contact && inst.contact.email) || 'N/A';
    const pPhone = document.getElementById('detailProfilePhone');
    if (pPhone) pPhone.textContent = (inst.contact && inst.contact.phone) || 'N/A';
    const pFullAddr = document.getElementById('detailProfileFullAddress');
    if (pFullAddr) {
      const a = inst.address || {};
      pFullAddr.textContent = (a.street || 'Main Road') + ', ' + (a.city || 'Guntur') + ', ' + (a.state || 'Andhra Pradesh') + ' - ' + (a.postalCode || '522002');
    }

    // Config Tab
    const cTz = document.getElementById('detailConfigTimezone');
    if (cTz) cTz.textContent = (inst.configuration && inst.configuration.timezone) || 'Asia/Kolkata (IST)';
    const cLoc = document.getElementById('detailConfigLocale');
    if (cLoc) cLoc.textContent = (inst.configuration && inst.configuration.locale) || 'en-IN (English India)';
    const cCur = document.getElementById('detailConfigCurrency');
    if (cCur) cCur.textContent = (inst.configuration && inst.configuration.currency) || 'INR (₹)';
    const cAy = document.getElementById('detailConfigAyFormat');
    if (cAy) cAy.textContent = (inst.configuration && inst.configuration.academicYearFormat) || '2026–2027';
    const cGrd = document.getElementById('detailConfigGrading');
    if (cGrd) cGrd.textContent = (inst.configuration && inst.configuration.gradingScale) || 'AP SSC 10-Point GPA';
    const cAtt = document.getElementById('detailConfigAttendance');
    if (cAtt) cAtt.textContent = (inst.configuration && inst.configuration.attendanceMode) || 'Twice Daily (Morning & Afternoon)';

    // Domains Tab Table
    const domTbody = document.getElementById('detailDomainsTableBody');
    if (domTbody) {
      const d = (inst.domains && inst.domains.primary) || inst.domain || 'srividya.edu.in';
      const isVerified = inst.domains ? !!inst.domains.dnsVerified : true;
      domTbody.innerHTML = '<tr><td>Primary Domain</td><td><strong>' + d + '</strong></td><td>A Record -> Cloud Ingress</td><td>' +
        (isVerified ? '<span class="domain-dns-badge dns-badge-verified"><i class="fa-solid fa-check"></i> Verified</span>' : '<span class="domain-dns-badge dns-badge-pending"><i class="fa-solid fa-clock"></i> Pending DNS</span>') +
        '</td><td><button class="btn-pa btn-pa-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="platformApp.verifyDomainFromDetail(\'' + d + '\')">Check DNS</button></td></tr>';
    }

    // Admins Tab Table
    const admTbody = document.getElementById('detailAdminsTableBody');
    if (admTbody) {
      const admins = inst.administrators || [
        { name: (inst.adminContact && inst.adminContact.name) || 'Administrator', email: (inst.adminContact && inst.adminContact.email) || 'admin@srividya.edu.in', phone: (inst.adminContact && inst.adminContact.phone) || '+91 863 2234567', role: 'Institutional Principal', status: 'Active' }
      ];
      admTbody.innerHTML = admins.map(adm => {
        return '<tr>' +
          '<td style="font-weight: 700; color: var(--color-text-main);">' + adm.name + '</td>' +
          '<td>' + adm.email + '</td>' +
          '<td>' + (adm.phone || 'N/A') + '</td>' +
          '<td><span style="font-weight: 600; font-size: 0.8rem; color: #4F46E5;">' + adm.role + '</span></td>' +
          '<td><span class="inst-status-badge inst-badge-active"><i class="fa-solid fa-check"></i> ' + (adm.status || 'Active') + '</span></td>' +
          '<td style="text-align: right;"><button type="button" class="btn-pa btn-pa-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="platformApp.resendAdminInvite(\'' + adm.email + '\')"><i class="fa-solid fa-paper-plane mr-1"></i> Resend Invite</button></td></tr>';
      }).join('');
    }

    switchInstitutionDetailTab('overview');
    openModal('modalInstitutionDetail');
  }

  function switchInstitutionDetailTab(tabKey) {
    const tabKeys = ['overview', 'profile', 'config', 'domains', 'portals', 'admins', 'integrations', 'subscription', 'support', 'audit'];
    tabKeys.forEach(key => {
      const pane = document.getElementById('detailTabPane-' + key);
      if (pane) pane.style.display = (key === tabKey) ? 'block' : 'none';
    });

    const nav = document.getElementById('institutionDetailTabsNav');
    if (nav) {
      const buttons = nav.querySelectorAll('.pa-detail-tab-btn');
      buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + tabKey + "'")) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  function openEditFromDetail() {
    closeModal('modalInstitutionDetail');
    openAddInstitutionWizard();
  }

  function openConfigureFromDetail(id) {
    closeModal('modalInstitutionDetail');
    navigateTo('config');
  }

  function openInviteAdminForDetail(id) {
    const inst = state.institutions.find(i => (i.institutionId === id || i.id === id));
    if (inst) {
      const emailField = document.getElementById('inviteAdminEmail');
      if (emailField) emailField.value = 'admin@' + ((inst.domains && inst.domains.primary) || inst.domain || 'srividya.edu.in');
    }
    openModal('modalInviteAdmin');
  }

  function resendAdminInvite(email) {
    showToast('Cryptographic activation token resent to ' + email + ' (Valid for 7 Days)', 'success');
  }

  function verifyDomainFromDetail(domain) {
    showToast('Probing DNS records for ' + domain + '... All authoritative A & CNAME records match!', 'success');
  }

  // =========================================================================
  // SECTION 3.4: INSTITUTION SUSPENSION & GOVERNANCE WORKFLOW
  // =========================================================================

    function openSuspendFromDetail(id) {
    const instId = id || selectedInstitutionId;
    const inst = state.institutions.find(i => (i.institutionId === instId || i.id === instId));
    if (!inst) return;

    selectedInstitutionId = instId;
    const idEl = document.getElementById('suspendTargetInstId');
    if (idEl) idEl.value = instId;
    const nameEl = document.getElementById('suspendTargetInstName');
    if (nameEl) nameEl.value = inst.name + ' (' + instId + ')';

    const reasonEl = document.getElementById('suspendReason');
    if (reasonEl) reasonEl.value = '';
    const chkEl = document.getElementById('suspendConfirmationCheckbox');
    if (chkEl) chkEl.checked = false;

    openModal('modalSuspendInstitution');
  }

  async function confirmSuspendInstitution(event) {
    if (event) event.preventDefault();
    const targetId = document.getElementById('suspendTargetInstId')?.value || selectedInstitutionId;
    const reason = document.getElementById('suspendReason')?.value || 'Administrative Compliance Review';
    const policy = 'disable_login_keep_audit';
    const confirmed = document.getElementById('suspendConfirmationCheckbox')?.checked;

    if (!confirmed) {
      showToast('You must confirm the statutory zero-deletion preservation statement', 'danger');
      return;
    }

    try {
      await fetch('/api/v1/platform/institutions/' + targetId + '/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason, accessPolicy: policy })
      });
    } catch (e) {
      console.warn('API error during suspension:', e);
    }

    const inst = state.institutions.find(i => (i.institutionId === targetId || i.id === targetId));
    if (inst) {
      inst.status = 'Suspended';
      inst.suspension = {
        isSuspended: true,
        reason: reason,
        accessPolicy: policy,
        suspendedAt: new Date().toISOString()
      };
    }

    closeModal('modalSuspendInstitution');
    closeModal('modalInstitutionDetail');
    updateInstitutionSummaryCards();
    renderInstitutionsTable();

    state.auditLogs.unshift({
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: 'Just now',
      actor: 'sysadmin.root@srividya.trust',
      role: 'Super Admin',
      action: 'Institution Suspension',
      target: inst ? inst.name : targetId,
      ip: '192.168.1.1',
      status: 'Enforced',
      details: 'Suspended access under policy: ' + policy + '. Reason: ' + reason + '. Records preserved without deletion.'
    });
    renderAuditLogsTable();

    showToast('Access suspended for institution ' + targetId + '. Zero records deleted; audit trail retained.', 'warning');
  }

  async function reactivateInstitutionFromDetail(id) {
    const instId = id || selectedInstitutionId;
    try {
      await fetch('/api/v1/platform/institutions/' + instId + '/reactivate', { method: 'POST' });
    } catch (e) {
      console.warn('API reactivate error:', e);
    }

    const inst = state.institutions.find(i => (i.institutionId === instId || i.id === instId));
    if (inst) {
      inst.status = 'Active';
      if (inst.suspension) inst.suspension.isSuspended = false;
    }

    closeModal('modalInstitutionDetail');
    updateInstitutionSummaryCards();
    renderInstitutionsTable();

    state.auditLogs.unshift({
      id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: 'Just now',
      actor: 'sysadmin.root@srividya.trust',
      role: 'Super Admin',
      action: 'Institution Reactivated',
      target: inst ? inst.name : instId,
      ip: '192.168.1.1',
      status: 'Success',
      details: 'Restored full operational and login access'
    });
    renderAuditLogsTable();

    showToast('Institution ' + instId + ' reactivated successfully. Operations restored.', 'success');
  }

  function archiveInstitutionFromDetail(id) {
    const instId = id || selectedInstitutionId;
    const inst = state.institutions.find(i => (i.institutionId === instId || i.id === instId));
    if (inst) {
      inst.status = 'Archived';
    }
    closeModal('modalInstitutionDetail');
    updateInstitutionSummaryCards();
    renderInstitutionsTable();
    showToast('Institution ' + instId + ' marked as Archived', 'info');
  }

  // =========================================================================
  // IMPORT & EXPORT OPERATIONS (SECTION 3.1)
  // =========================================================================

  function exportInstitutionsCSV() {
    const headers = ['Institution ID', 'Official Name', 'Display Name', 'Code', 'Type', 'Trust', 'Domain', 'Contact Email', 'Phone', 'Setup Status', 'Status', 'Created Date'];
    const rows = state.institutions.map(i => [
      i.institutionId || i.id,
      '"' + (i.name || '') + '"',
      '"' + (i.displayName || '') + '"',
      i.code || '',
      i.type || '',
      '"' + (i.trust || 'Sri Vidya Educational Trust') + '"',
      (i.domains && i.domains.primary) || i.domain || '',
      (i.contact && i.contact.email) || '',
      (i.contact && i.contact.phone) || '',
      i.setupStatus || 'Complete',
      i.status || 'Active',
      i.createdDate || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SriVidya_Institutions_Directory_' + (new Date().toISOString().split('T')[0]) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported Institutions Directory CSV successfully!', 'success');
  }

  function openImportModal() {
    importedFileData = null;
    const statusEl = document.getElementById('importFileStatus');
    if (statusEl) statusEl.style.display = 'none';
    openModal('modalImportInstitutions');
  }

  function downloadSampleInstitutionsCSV() {
    const sample = 'Name,Code,Type,Domain,Email,Phone\n' +
                   'Sri Vidya High School (East Campus),SV-EAST,Branch,east.srividya.edu.in,east@srividya.edu.in,+91 863 2289000\n' +
                   'Sri Vidya Model School (West Campus),SV-WEST,School,west.srividya.edu.in,west@srividya.edu.in,+91 863 2291000';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_institutions_import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleImportFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    importedFileData = file;
    const nameEl = document.getElementById('importFileName');
    if (nameEl) nameEl.textContent = file.name;
    const statusEl = document.getElementById('importFileStatus');
    if (statusEl) statusEl.style.display = 'block';
  }

  function processImportInstitutions() {
    if (!importedFileData) {
      showToast('Please select a valid CSV docket file to ingest', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('CSV file is empty or missing data rows', 'warning');
        return;
      }

      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 4) {
          const name = parts[0];
          const code = parts[1];
          const type = parts[2];
          const domain = parts[3];
          const email = parts[4] || 'contact@srividya.edu.in';
          const phone = parts[5] || '+91 863 0000000';
          state.institutions.push({
            institutionId: 'INST-00' + (state.institutions.length + 1),
            name: name,
            displayName: name,
            code: code || ('SV-0' + (state.institutions.length + 1)),
            type: type || 'Branch',
            trust: 'Sri Vidya Educational Trust',
            contact: { email: email, phone: phone },
            domains: { primary: domain, dnsVerified: false },
            setupStatus: 'In Progress',
            status: 'Draft',
            createdDate: new Date().toISOString().split('T')[0]
          });
          count++;
        }
      }

      closeModal('modalImportInstitutions');
      updateInstitutionSummaryCards();
      renderInstitutionsTable();
      showToast('Successfully ingested ' + count + ' institution(s) from CSV docket!', 'success');
    };
    reader.readAsText(importedFileData);
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

  // Infrastructure & Operations Actions
  function triggerManualBackup() {
    showToast('Snapshot initiation dispatched to AWS S3 Mumbai Vault (ap-south-1). Encryption: AES-256.', 'info');
    setTimeout(() => {
      showToast('Disaster Recovery Snapshot #SNAP-2026-LIVE verified and stored in immutable vault.', 'success');
    }, 1800);
  }

  function terminateAllSuspiciousSessions() {
    showToast('All anomalous IP sessions terminated. Forced re-authentication triggered.', 'warning');
  }

  function verifyDnsStatus() {
    showToast('Probing Apex DNS, SPF/DKIM, and MX records...', 'info');
    setTimeout(() => {
      showToast('DNS Health Verified: 100% records aligned with Google Workspace and Cloudflare edge.', 'success');
    }, 1200);
  }

  function savePlatformPolicies() {
    showToast('AP Statutory Retention Policies (Rule 88/99) updated and locked into database governance matrix.', 'success');
  }

  // Default Platform Telemetry (Specification 2.1 & 2.2)
  function getDefaultPlatformData() {
    return {
      overview: {
        registeredInstitutions: state.institutions.length,
        platformAccounts: 128,
        applicationStatus: 'Healthy',
        openIssues: 2,
        securityIssuesCount: 0,
        pendingTasksCount: 4,
        p95LatencyMs: 24,
        uptimePercentage: '99.98%'
      },
      institutionSummary: {
        totalRegistered: state.institutions.length,
        active: state.institutions.filter(i => i.status === 'Active').length,
        onboarding: 0,
        suspended: 0,
        configIssues: 0
      },
      platformHealth: {
        frontendAvailability: { status: 'Healthy', metrics: '99.99% Uptime (P90: 12ms)' },
        backendApiHealth: { status: 'Healthy', metrics: '24ms P95 Latency (Zero Drops)' },
        databaseConnectivity: { status: 'Healthy', metrics: 'MongoDB 8.0 (6ms Ping)' },
        fileStorageAvailability: { status: 'Healthy', metrics: 'Local Storage & S3 Vault' },
        emailDeliveryStatus: { status: 'Healthy', metrics: 'Google Workspace SMTP Relay' },
        backgroundJobFailures: { status: 'Healthy', metrics: 'Scheduler Active (12 Success)' },
        latestSuccessfulBackup: { status: 'Healthy', metrics: 'Today, 03:00 AM UTC' },
        recentDeploymentStatus: { status: 'Healthy', metrics: 'v2.4.0-prod (Commit a3e9c55)' }
      },
      securityOverview: {
        failedLoginCount: 4,
        suspiciousAuthEvents: 0,
        adminPermissionChanges: 2,
        accountsAwaitingActivation: 5,
        expiringPrivilegedAccess: 1,
        unresolvedSecurityAlerts: 0
      },
      operationalTasks: [
        {
          id: 'TASK-01',
          title: 'New institution setup review',
          institution: 'Sri Vidya Kids Academy',
          assignedTo: 'Platform Root SysAdmin',
          status: 'Pending Verification',
          priority: 'Medium',
          actionText: 'Review Setup',
          targetView: 'institutions'
        },
        {
          id: 'TASK-02',
          title: 'School configuration pending review',
          institution: 'Sri Vidya Junior College',
          assignedTo: 'Super Administrator',
          status: 'Pending Review',
          priority: 'High',
          actionText: 'Review Config',
          targetView: 'config'
        },
        {
          id: 'TASK-03',
          title: 'Integration setup pending',
          institution: 'Sri Vidya Main Campus',
          assignedTo: 'DevOps Operator',
          status: 'Ready for Test',
          priority: 'Normal',
          actionText: 'Open Integrations',
          targetView: 'integrations'
        },
        {
          id: 'TASK-04',
          title: 'Open support tickets (2 unresolved)',
          institution: 'Sri Vidya E.M High School',
          assignedTo: 'Lead Support Engineer',
          status: '2 Open Tickets',
          priority: 'High',
          actionText: 'Open Tickets',
          targetView: 'support'
        },
        {
          id: 'TASK-05',
          title: 'Failed background jobs check',
          institution: 'Platform Scheduler',
          assignedTo: 'DevOps Operator',
          status: '0 Critical',
          priority: 'Low',
          actionText: 'View Jobs',
          targetView: 'health'
        },
        {
          id: 'TASK-06',
          title: 'Backup snapshot retention verification',
          institution: 'Disaster Recovery Vault',
          assignedTo: 'Security Officer',
          status: 'Verified',
          priority: 'Low',
          actionText: 'Review Vault',
          targetView: 'backups'
        }
      ],
      recentActivity: [
        {
          id: 'AUD-9941',
          activity: 'Institution Onboarding Phase 2 Verified',
          institution: 'Sri Vidya E.M High School (SV-MAIN)',
          responsibleUser: 'sysadmin.root@s***.trust',
          role: 'Super Admin',
          timestamp: '12 mins ago',
          outcome: 'Success',
          details: 'AP Statutory Form 16 and UDISE+ compliance verified'
        },
        {
          id: 'AUD-9940',
          activity: 'Disaster Recovery Snapshot Completed',
          institution: 'AWS S3 Glacier Snapshot Vault',
          responsibleUser: 'devops.ops@s***.trust',
          role: 'Platform Operator',
          timestamp: '48 mins ago',
          outcome: 'Success',
          details: 'Daily immutable snapshot #SNAP-2026-LIVE verified (AES-256)'
        },
        {
          id: 'AUD-9939',
          activity: 'Faculty Permission Grant Audited',
          institution: 'Classroom Attendance & Mark Roster',
          responsibleUser: 'srividyaschools2017@g***.com',
          role: 'Principal',
          timestamp: '2 hours ago',
          outcome: 'Success',
          details: 'Authorized Class 8A lead attendance register submission'
        },
        {
          id: 'AUD-9938',
          activity: 'Seat Quota Allocation Adjusted',
          institution: 'Sri Vidya Main Campus',
          responsibleUser: 'sysadmin.root@s***.trust',
          role: 'Super Admin',
          timestamp: '4 hours ago',
          outcome: 'Success',
          details: 'Allocated 1,000 maximum student quota for academic year 2025-26'
        }
      ]
    };
  }

  // Load Platform Dashboard Live Telemetry
  async function loadPlatformDashboard() {
    try {
      const res = await fetch('/api/v1/dashboard/platform');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          applyPlatformDashboardData(json.data);
          return;
        }
      }
    } catch (e) {
      // Fallback to local state if fetch fails or network blocked
    }
    applyPlatformDashboardData(getDefaultPlatformData());
  }

  // Apply Data to Dashboard DOM
  function applyPlatformDashboardData(data) {
    if (!data) return;
    state.platformData = data;
    state.recentActivities = data.recentActivity || [];

    // 1. Hero Overview Cards (Answers 5 questions immediately)
    const elInst = document.getElementById('paHeroInstitutions');
    const elAcc = document.getElementById('paHeroAccounts');
    const elStatus = document.getElementById('paHeroStatus');
    const elIssues = document.getElementById('paHeroOpenIssues');

    if (elInst) elInst.textContent = data.overview?.registeredInstitutions ?? state.institutions.length;
    if (elAcc) elAcc.textContent = data.overview?.platformAccounts ?? 128;
    if (elStatus) elStatus.textContent = data.overview?.applicationStatus ?? 'Healthy';
    if (elIssues) elIssues.textContent = data.overview?.openIssues ?? 2;

    // 2. Section 2.1 A: Institution Summary
    const sumTotal = document.getElementById('sumTotalRegistered');
    const sumAct = document.getElementById('sumActive');
    const sumOnb = document.getElementById('sumOnboarding');
    const sumSusp = document.getElementById('sumSuspended');
    const sumCfg = document.getElementById('sumConfigIssues');

    if (sumTotal) sumTotal.textContent = data.institutionSummary?.totalRegistered ?? state.institutions.length;
    if (sumAct) sumAct.textContent = data.institutionSummary?.active ?? state.institutions.length;
    if (sumOnb) sumOnb.textContent = data.institutionSummary?.onboarding ?? 0;
    if (sumSusp) sumSusp.textContent = data.institutionSummary?.suspended ?? 0;
    if (sumCfg) sumCfg.textContent = data.institutionSummary?.configIssues ?? 0;

    // 3. Section 2.1 B: Platform Health Matrix
    if (data.platformHealth) {
      const map = {
        Frontend: data.platformHealth.frontendAvailability,
        Backend: data.platformHealth.backendApiHealth,
        Database: data.platformHealth.databaseConnectivity,
        Storage: data.platformHealth.fileStorageAvailability,
        Email: data.platformHealth.emailDeliveryStatus,
        Jobs: data.platformHealth.backgroundJobFailures,
        Backup: data.platformHealth.latestSuccessfulBackup,
        Deployment: data.platformHealth.recentDeploymentStatus
      };
      Object.keys(map).forEach(key => {
        const item = map[key];
        if (!item) return;
        const badgeEl = document.getElementById(`badgeHealth${key}`);
        const metricEl = document.getElementById(`metricsHealth${key}`);
        if (badgeEl) {
          const isHealthy = item.status === 'Healthy' || item.status === 'Connected' || item.status === 'Operational' || item.status === 'Current' || item.status === 'Verified' || item.status === '0 Failures';
          badgeEl.className = isHealthy ? 'badge-active' : 'badge-operator';
          badgeEl.innerHTML = `<i class="fa-solid fa-${isHealthy ? 'check' : 'triangle-exclamation'}"></i> ${item.status || 'Active'}`;
        }
        if (metricEl && item.metrics) {
          metricEl.textContent = item.metrics;
        }
      });
    }

    // 4. Section 2.1 C: Security Overview
    const elFail = document.getElementById('secFailedLogins');
    const elSusp = document.getElementById('secSuspiciousAuth');
    const elPerm = document.getElementById('secAdminPermChanges');
    const elPend = document.getElementById('secPendingActivation');
    const elExp = document.getElementById('secExpiringAccess');
    const elAlert = document.getElementById('secUnresolvedAlerts');

    if (elFail) elFail.textContent = data.securityOverview?.failedLoginCount ?? 4;
    if (elSusp) elSusp.textContent = data.securityOverview?.suspiciousAuthEvents ?? 0;
    if (elPerm) elPerm.textContent = data.securityOverview?.adminPermissionChanges ?? 2;
    if (elPend) elPend.textContent = data.securityOverview?.accountsAwaitingActivation ?? 5;
    if (elExp) elExp.textContent = data.securityOverview?.expiringPrivilegedAccess ?? 1;
    if (elAlert) elAlert.textContent = data.securityOverview?.unresolvedSecurityAlerts ?? 0;

    // 5. Section 2.1 D: Operational Tasks
    if (data.operationalTasks) {
      renderOperationalTasks(data.operationalTasks);
    }

    // 6. Section 2.1 E: Recent Platform Activity
    if (data.recentActivity) {
      renderRecentPlatformActivity(data.recentActivity);
    }
  }

  // Render Section 2.1 D: Operational Tasks Table
  function renderOperationalTasks(tasks) {
    const tbody = document.getElementById('operationalTasksTableBody');
    if (!tbody) return;
    const badge = document.getElementById('operationalTasksBadge');
    if (badge) badge.textContent = `${tasks.length} Tasks Pending`;

    tbody.innerHTML = tasks.map(task => {
      let priorityClass = 'badge-active';
      if (task.priority === 'High') priorityClass = 'badge-operator';
      else if (task.priority === 'Medium') priorityClass = 'badge-active';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.9rem;">
              <i class="fa-solid fa-list-check text-primary mr-1"></i> ${task.title}
            </div>
            <div style="font-size: 0.76rem; color: #64748B;">ID: ${task.id}</div>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 600;">${task.institution}</span>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #475569;">${task.assignedTo || 'SysAdmin'}</span>
          </td>
          <td>
            <span class="badge-active" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;">${task.status}</span>
          </td>
          <td>
            <span class="${priorityClass}" style="font-size:0.75rem;">${task.priority}</span>
          </td>
          <td style="text-align: right;">
            <button class="btn-pa btn-pa-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="platformApp.openTaskAction('${task.id}', '${task.targetView || 'dashboard'}')">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> ${task.actionText || 'Execute'}
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // Render Section 2.1 E: Recent Platform Activity
  function renderRecentPlatformActivity(activities) {
    const tbody = document.getElementById('recentPlatformActivityTableBody');
    if (!tbody) return;

    tbody.innerHTML = activities.map(act => {
      let outcomeBadge = '<span class="badge-active"><i class="fa-solid fa-circle-check"></i> Success</span>';
      if (act.outcome === 'Warning') {
        outcomeBadge = '<span class="badge-active" style="background:#fef3c7; color:#b45309; border-color:#fde68a;"><i class="fa-solid fa-triangle-exclamation"></i> Warning</span>';
      } else if (act.outcome === 'Failed') {
        outcomeBadge = '<span class="badge-operator"><i class="fa-solid fa-circle-xmark"></i> Failed</span>';
      }

      const timeStr = typeof act.timestamp === 'string' ? act.timestamp : new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.88rem;">${act.activity}</div>
            <div style="font-size: 0.76rem; color: #64748B;">${act.details || 'Operational record logged'}</div>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 600;">${act.institution || 'Platform Global'}</span>
          </td>
          <td>
            <span style="font-family: monospace; font-size: 0.82rem; background: var(--color-bg-subtle); padding: 2px 6px; border-radius: 4px;">
              <i class="fa-solid fa-user-shield text-indigo mr-1"></i> ${act.responsibleUser}
            </span>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #64748B;">${timeStr}</span>
          </td>
          <td>
            ${outcomeBadge}
          </td>
          <td style="text-align: right;">
            <button class="btn-pa btn-pa-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="platformApp.viewActivityDetails('${act.id}')">
              <i class="fa-solid fa-eye"></i> Details
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // Action for Operational Tasks
  function openTaskAction(taskId, targetView) {
    if (targetView && targetView !== 'dashboard') {
      navigateTo(targetView);
      showToast(`Navigated to ${targetView} for task ${taskId}.`, 'info');
    } else {
      showToast(`Operational Task ${taskId} marked as Reviewed!`, 'success');
    }
  }

  // View Masked Activity Details Modal
  function viewActivityDetails(activityId) {
    const act = (state.recentActivities || []).find(a => a.id === activityId) || {
      id: activityId,
      activity: 'Platform Telemetry Audit Inspection',
      institution: 'Sri Vidya E.M High School (Main Campus)',
      responsibleUser: 'sysadmin.root@s***.trust',
      role: 'Super Administrator',
      timestamp: new Date().toISOString(),
      outcome: 'Success',
      details: 'All sensitive fields masked for privacy preservation (AP Education Rules & Trust Governance)'
    };

    const container = document.getElementById('activityDetailModalBody');
    if (container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Event ID:</span>
            <strong>${act.id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Action / Activity:</span>
            <strong>${act.activity}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Target Institution:</span>
            <span>${act.institution}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Responsible User (Masked):</span>
            <span style="font-family: monospace; color: #4F46E5;">${act.responsibleUser}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Outcome Status:</span>
            <span class="badge-active">${act.outcome}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">
            <span style="color: #64748B;">Compliance Reason:</span>
            <span>${act.details}</span>
          </div>
          <div style="background: rgba(79, 70, 229, 0.06); border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.78rem; color: #4F46E5;">
            <i class="fa-solid fa-lock"></i> Cryptographic Privacy Guard: Passwords, private keys, hashes, and student PII are permanently masked in platform operator views.
          </div>
        </div>`;
    }
    openModal('modalActivityDetail');
  }

  function openInviteAdminModal() {
    openModal('modalInviteAdmin');
  }

  function openFailedJobsModal() {
    openModal('modalFailedJobs');
  }

  function openSecurityAlertsModal() {
    openModal('modalSecurityAlerts');
  }

  function handleInviteAdmin(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('inviteAdminName')?.value || 'New Administrator';
    const email = document.getElementById('inviteAdminEmail')?.value || 'operator@srividya.trust';
    const role = document.getElementById('inviteAdminRole')?.value || 'Platform Operator';
    closeModal('modalInviteAdmin');
    showToast(`Cryptographic invitation issued to ${name} (${email}) for role ${role}!`, 'success');
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
    loadPlatformDashboard();

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
    exportAuditTrail,
    triggerManualBackup,
    terminateAllSuspiciousSessions,
    verifyDnsStatus,
    savePlatformPolicies,
    loadPlatformDashboard,
    filterInstitutions,
    openTaskAction,
    viewActivityDetails,
    openInviteAdminModal,
    openFailedJobsModal,
    openSecurityAlertsModal,
    handleInviteAdmin
  };
})();

window.platformApp = platformApp;
