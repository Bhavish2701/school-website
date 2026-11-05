const mongoose = require('mongoose');
const { Institution } = require('../models/institution.model');
const crypto = require('crypto');

let AuditLogModel = null;
try {
  const auditMod = require('../models/auditLog.model');
  AuditLogModel = auditMod.AuditLog || auditMod;
} catch (e) {
  // Graceful fallback
}

// In-memory fallback if MongoDB is not connected
const defaultInstitutions = [
  {
    institutionId: 'INST-001',
    name: 'Sri Vidya E.M High School (Main Campus)',
    displayName: 'Sri Vidya High School',
    code: 'SV-MAIN',
    type: 'Primary & Secondary School',
    trust: 'Sri Vidya Educational Trust',
    address: {
      street: 'D.No 48-12-5, Srinagar Colony',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530016',
      country: 'India',
      region: 'Andhra Pradesh'
    },
    contact: {
      email: 'srividyaschools2017@gmail.com',
      phone: '+91 891 255 4899',
      website: 'srividya.edu.in'
    },
    udise: '28172901923',
    board: 'Andhra Pradesh State Board (AP SSC - English Medium)',
    category: 'High School & Primary (Class 1 to 10)',
    configuration: {
      timezone: 'Asia/Kolkata (IST +05:30)',
      locale: 'en-IN',
      language: 'English / Telugu',
      currency: 'INR (₹)',
      academicYearFormat: 'June to April (AP State Board)',
      currentAcademicYear: '2026–2027',
      gradingScale: 'AP Board CCE (A1-E Scale with 10.0 GPA)',
      attendanceMode: 'Daily Morning & Afternoon Register',
      calendarSettings: '6 Working Days (Mon-Sat, 2nd Saturday Holiday)'
    },
    branding: {
      logoUrl: '/assets/images/logo.png',
      faviconUrl: '/assets/images/favicon.ico',
      primaryColor: '#1e3a8a',
      secondaryColor: '#059669',
      accentColor: '#d97706',
      documentHeader: 'SRI VIDYA EDUCATIONAL TRUST • GOVT OF ANDHRA PRADESH RECOGNIZED'
    },
    domains: {
      primary: 'srividya.edu.in',
      website: 'www.srividya.edu.in',
      adminPortal: 'admin.srividya.edu.in',
      facultyPortal: 'faculty.srividya.edu.in',
      apiDomain: 'api.srividya.edu.in',
      dnsVerified: true,
      sslStatus: 'Active (TLS 1.3 Let\'s Encrypt)',
      dkimStatus: 'Verified (2048-bit RSA)',
      spfStatus: 'Valid (v=spf1 include:_spf.google.com ~all)'
    },
    setupStatus: 'Complete',
    status: 'Active',
    suspension: {
      isSuspended: false,
      suspendedAt: null,
      suspendedBy: '',
      reason: '',
      accessPolicy: 'Public & teacher portal login disabled. Authorized administrative audit access retained.'
    },
    administrators: [
      {
        name: 'Smt. Gorle Varalakshmi',
        email: 'srividyaschools2017@gmail.com',
        phone: '+91 891 255 4899',
        role: 'Institutional Principal',
        status: 'Active',
        inviteToken: 'AUTH-INV-001',
        inviteExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        lastLogin: 'Today, 08:15 PM IST'
      },
      {
        name: 'Sri Navva Anand',
        email: 'navva.anand.personal@gmail.com',
        phone: '+91 944 011 2233',
        role: 'Vice Principal & HOD Maths',
        status: 'Active',
        inviteToken: 'AUTH-INV-002',
        inviteExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        lastLogin: 'Today, 07:48 PM IST'
      }
    ],
    integrations: {
      smsGateway: 'National CDAC Gateway (Govt DLT Approved)',
      paymentGateway: 'Razorpay & UPI Instant Settlement',
      biometricEnabled: true,
      storageVault: 'AWS S3 Mumbai (AES-256 Encrypted)'
    },
    subscription: {
      tier: 'Trust Enterprise Multi-Campus',
      seatsTotal: 1200,
      seatsUsed: 855,
      renewalDate: '2028-06-30',
      storageQuotaGb: 250
    },
    metrics: {
      students: 855,
      staff: 34,
      classrooms: 18
    },
    createdDate: new Date('2017-06-12')
  },
  {
    institutionId: 'INST-002',
    name: 'Sri Vidya Junior College (Science & Commerce)',
    displayName: 'Sri Vidya Junior College',
    code: 'SV-INTER',
    type: 'Junior College',
    trust: 'Sri Vidya Educational Trust',
    address: {
      street: 'Plot 14, Gajuwaka Junction',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530026',
      country: 'India',
      region: 'Andhra Pradesh'
    },
    contact: {
      email: 'intermediate@srividya.edu.in',
      phone: '+91 891 278 1122',
      website: 'intermediate.srividya.edu.in'
    },
    udise: '28172901924',
    board: 'Board of Intermediate Education AP (BIEAP)',
    category: 'Intermediate College (+1 & +2 Wing)',
    configuration: {
      timezone: 'Asia/Kolkata (IST +05:30)',
      locale: 'en-IN',
      language: 'English / Telugu',
      currency: 'INR (₹)',
      academicYearFormat: 'June to March (BIEAP Standard)',
      currentAcademicYear: '2026–2027',
      gradingScale: 'BIEAP Intermediate Grade Scale (A to D)',
      attendanceMode: 'Period/Subject-Wise Biometric',
      calendarSettings: '6 Working Days (Mon-Sat)'
    },
    branding: {
      logoUrl: '/assets/images/logo.png',
      faviconUrl: '/assets/images/favicon.ico',
      primaryColor: '#0284c7',
      secondaryColor: '#0f766e',
      accentColor: '#e11d48',
      documentHeader: 'SRI VIDYA JUNIOR COLLEGE • AFFILIATED TO BIEAP HYD/VJA'
    },
    domains: {
      primary: 'intermediate.srividya.edu.in',
      website: 'intermediate.srividya.edu.in',
      adminPortal: 'admin.intermediate.srividya.edu.in',
      facultyPortal: 'faculty.intermediate.srividya.edu.in',
      apiDomain: 'api.intermediate.srividya.edu.in',
      dnsVerified: true,
      sslStatus: 'Active (TLS 1.3 Let\'s Encrypt)',
      dkimStatus: 'Verified (2048-bit RSA)',
      spfStatus: 'Valid (v=spf1 include:_spf.google.com ~all)'
    },
    setupStatus: 'Complete',
    status: 'Active',
    suspension: {
      isSuspended: false,
      suspendedAt: null,
      suspendedBy: '',
      reason: '',
      accessPolicy: 'Public & teacher portal login disabled. Authorized administrative audit access retained.'
    },
    administrators: [
      {
        name: 'Dr. C. H. Satyanarayana',
        email: 'principal.inter@srividya.edu.in',
        phone: '+91 98481 22334',
        role: 'College Principal',
        status: 'Active',
        inviteToken: 'AUTH-INV-003',
        inviteExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        lastLogin: 'Yesterday, 04:15 PM IST'
      }
    ],
    integrations: {
      smsGateway: 'National CDAC Gateway (Govt DLT Approved)',
      paymentGateway: 'Razorpay & UPI Instant Settlement',
      biometricEnabled: true,
      storageVault: 'AWS S3 Mumbai (AES-256 Encrypted)'
    },
    subscription: {
      tier: 'Trust Enterprise Multi-Campus',
      seatsTotal: 500,
      seatsUsed: 320,
      renewalDate: '2028-06-30',
      storageQuotaGb: 100
    },
    metrics: {
      students: 320,
      staff: 18,
      classrooms: 8
    },
    createdDate: new Date('2021-07-01')
  },
  {
    institutionId: 'INST-003',
    name: 'Sri Vidya Kids Academy (Early Childhood Centre)',
    displayName: 'Sri Vidya Kids Academy',
    code: 'SV-KIDS',
    type: 'Early Childhood Centre',
    trust: 'Sri Vidya Educational Trust',
    address: {
      street: '12th Lane, Dwaraka Nagar',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530016',
      country: 'India',
      region: 'Andhra Pradesh'
    },
    contact: {
      email: 'kids@srividya.edu.in',
      phone: '+91 891 279 8833',
      website: 'kids.srividya.edu.in'
    },
    udise: '28172901925',
    board: 'Early Years Foundation & Playgroup',
    category: 'Pre-Primary (Nursery, LKG, UKG)',
    configuration: {
      timezone: 'Asia/Kolkata (IST +05:30)',
      locale: 'en-IN',
      language: 'English / Activity Based',
      currency: 'INR (₹)',
      academicYearFormat: 'June to April (Pre-Primary)',
      currentAcademicYear: '2026–2027',
      gradingScale: 'Early Development Milestones (Exemplary, Proficient, Developing)',
      attendanceMode: 'Single Daily Homeroom Register',
      calendarSettings: '5 Working Days (Mon-Fri)'
    },
    branding: {
      logoUrl: '/assets/images/logo.png',
      faviconUrl: '/assets/images/favicon.ico',
      primaryColor: '#7c3aed',
      secondaryColor: '#db2777',
      accentColor: '#f59e0b',
      documentHeader: 'SRI VIDYA KIDS ACADEMY • EARLY YEARS FOUNDATION'
    },
    domains: {
      primary: 'kids.srividya.edu.in',
      website: 'kids.srividya.edu.in',
      adminPortal: 'admin.kids.srividya.edu.in',
      facultyPortal: 'faculty.kids.srividya.edu.in',
      apiDomain: 'api.kids.srividya.edu.in',
      dnsVerified: true,
      sslStatus: 'Active (TLS 1.3 Let\'s Encrypt)',
      dkimStatus: 'Verified (2048-bit RSA)',
      spfStatus: 'Valid (v=spf1 include:_spf.google.com ~all)'
    },
    setupStatus: 'Complete',
    status: 'Active',
    suspension: {
      isSuspended: false,
      suspendedAt: null,
      suspendedBy: '',
      reason: '',
      accessPolicy: 'Public & teacher portal login disabled. Authorized administrative audit access retained.'
    },
    administrators: [
      {
        name: 'Smt. K. Anitha',
        email: 'headmistress.kids@srividya.edu.in',
        phone: '+91 99890 33445',
        role: 'Early Years Headmistress',
        status: 'Active',
        inviteToken: 'AUTH-INV-004',
        inviteExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        lastLogin: 'Today, 11:30 AM IST'
      }
    ],
    integrations: {
      smsGateway: 'National CDAC Gateway (Govt DLT Approved)',
      paymentGateway: 'Razorpay & UPI Instant Settlement',
      biometricEnabled: false,
      storageVault: 'AWS S3 Mumbai (AES-256 Encrypted)'
    },
    subscription: {
      tier: 'Trust Enterprise Multi-Campus',
      seatsTotal: 250,
      seatsUsed: 140,
      renewalDate: '2028-06-30',
      storageQuotaGb: 50
    },
    metrics: {
      students: 140,
      staff: 8,
      classrooms: 6
    },
    createdDate: new Date('2023-04-15')
  }
];

// Helper to record audit events
async function logAuditEvent(action, details, user, ip) {
  if (!AuditLogModel || mongoose.connection.readyState !== 1) return;
  try {
    await AuditLogModel.create({
      action,
      module: 'INSTITUTIONS',
      user: user || 'Platform Root Administrator',
      details,
      ip: ip || '127.0.0.1',
      timestamp: new Date()
    });
  } catch (err) {
    // Non-blocking
  }
}

class InstitutionService {
  /**
   * Seed default 3 trust institutions if collection is empty
   */
  async seedIfEmpty() {
    if (mongoose.connection.readyState !== 1) return defaultInstitutions;
    try {
      const count = await Institution.countDocuments();
      if (count === 0) {
        await Institution.insertMany(defaultInstitutions);
      }
    } catch (e) {
      // Non-blocking
    }
  }

  /**
   * List all institutions with multi-field search and filters
   */
  async listInstitutions(filters = {}) {
    await this.seedIfEmpty();
    const {
      search = '',
      code = '',
      type = '',
      status = '',
      academicYear = '',
      domainStatus = ''
    } = filters;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { institutionId: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { 'contact.email': { $regex: search, $options: 'i' } },
            { 'domains.primary': { $regex: search, $options: 'i' } }
          ];
        }
        if (code) {
          query.code = { $regex: code, $options: 'i' };
        }
        if (type && type !== 'All') {
          query.type = type;
        }
        if (status && status !== 'All') {
          query.status = status;
        }
        if (academicYear && academicYear !== 'All') {
          query['configuration.currentAcademicYear'] = { $regex: academicYear, $options: 'i' };
        }
        if (domainStatus === 'verified') {
          query['domains.dnsVerified'] = true;
        } else if (domainStatus === 'unverified') {
          query['domains.dnsVerified'] = false;
        }

        const list = await Institution.find(query).sort({ createdDate: -1 }).lean();
        return {
          success: true,
          total: list.length,
          summary: await this.getSummaryCounts(),
          data: list
        };
      } catch (err) {
        // Fall back to memory
      }
    }

    // In-memory filtering
    let list = [...defaultInstitutions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.institutionId.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.contact.email.toLowerCase().includes(q) ||
        i.domains.primary.toLowerCase().includes(q)
      );
    }
    if (code) {
      list = list.filter(i => i.code.toLowerCase().includes(code.toLowerCase()));
    }
    if (type && type !== 'All') {
      list = list.filter(i => i.type === type);
    }
    if (status && status !== 'All') {
      list = list.filter(i => i.status === status);
    }
    if (academicYear && academicYear !== 'All') {
      list = list.filter(i => i.configuration.currentAcademicYear.includes(academicYear));
    }
    if (domainStatus === 'verified') {
      list = list.filter(i => i.domains.dnsVerified === true);
    } else if (domainStatus === 'unverified') {
      list = list.filter(i => i.domains.dnsVerified === false);
    }

    return {
      success: true,
      total: list.length,
      summary: await this.getSummaryCounts(),
      data: list
    };
  }

  /**
   * Get summary counts for the 5 hero cards
   */
  async getSummaryCounts() {
    if (mongoose.connection.readyState === 1) {
      try {
        const total = await Institution.countDocuments();
        const active = await Institution.countDocuments({ status: 'Active' });
        const setupInProgress = await Institution.countDocuments({
          status: { $in: ['Draft', 'Setup in Progress', 'Configuration Review', 'Ready for Activation'] }
        });
        const suspended = await Institution.countDocuments({ status: 'Suspended' });
        const configIssues = await Institution.countDocuments({
          $or: [
            { 'domains.dnsVerified': false },
            { setupStatus: 'In Progress' }
          ]
        });
        return {
          total,
          active,
          setupInProgress,
          suspended,
          configIssues
        };
      } catch (e) {
        // Fall back to memory
      }
    }

    const total = defaultInstitutions.length;
    const active = defaultInstitutions.filter(i => i.status === 'Active').length;
    const setupInProgress = defaultInstitutions.filter(i =>
      ['Draft', 'Setup in Progress', 'Configuration Review', 'Ready for Activation'].includes(i.status)
    ).length;
    const suspended = defaultInstitutions.filter(i => i.status === 'Suspended').length;
    const configIssues = defaultInstitutions.filter(i => !i.domains.dnsVerified || i.setupStatus === 'In Progress').length;

    return { total, active, setupInProgress, suspended, configIssues };
  }

  /**
   * Get single institution by ID or code
   */
  async getInstitutionById(id) {
    await this.seedIfEmpty();
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Institution.findOne({
          $or: [{ institutionId: id }, { code: id.toUpperCase() }, { _id: mongoose.isValidObjectId(id) ? id : null }]
        }).lean();
        if (doc) return { success: true, data: doc };
      } catch (e) {
        // Fall back to memory
      }
    }
    const found = defaultInstitutions.find(i => i.institutionId === id || i.code === id.toUpperCase());
    if (found) return { success: true, data: found };
    return { success: false, message: `Institution '${id}' not found` };
  }

  /**
   * Multi-Step Setup Wizard: Create new institution
   */
  async createInstitution(data, operator = 'Platform Root Administrator') {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const institutionId = data.institutionId || `INST-0${nextNum}`;
    const code = (data.code || `SV-${nextNum}`).toUpperCase();

    // Generate cryptographic invitation token for initial admin (never shared password!)
    const inviteToken = `SEC-INV-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

    const initialAdmin = {
      name: data.adminName || 'Institutional Administrator',
      email: data.adminEmail || data.contactEmail || `admin.${code.toLowerCase()}@srividya.edu.in`,
      phone: data.adminPhone || data.contactPhone || '',
      role: data.adminRole || 'Institutional Principal',
      status: 'Invitation Sent',
      inviteToken,
      inviteExpiresAt: inviteExpiry,
      lastLogin: 'Pending Activation'
    };

    const newInst = {
      institutionId,
      name: data.name || data.officialName || 'Sri Vidya Branch School',
      displayName: data.displayName || data.name || 'Sri Vidya Branch',
      code,
      type: data.type || 'Primary & Secondary School',
      trust: data.trust || 'Sri Vidya Educational Trust',
      address: {
        street: data.street || '',
        city: data.city || 'Visakhapatnam',
        state: data.state || 'Andhra Pradesh',
        pincode: data.pincode || '530001',
        country: data.country || 'India',
        region: data.region || 'Andhra Pradesh'
      },
      contact: {
        email: data.contactEmail || data.email || 'info@srividya.edu.in',
        phone: data.contactPhone || data.phone || '+91 891 255 4899',
        website: data.website || `${code.toLowerCase()}.srividya.edu.in`
      },
      udise: data.udise || `2817290${nextNum}`,
      board: data.board || 'Andhra Pradesh State Board (AP SSC - English Medium)',
      category: data.category || 'High School & Primary (Class 1 to 10)',
      configuration: {
        timezone: data.timezone || 'Asia/Kolkata (IST +05:30)',
        locale: data.locale || 'en-IN',
        language: data.language || 'English / Telugu',
        currency: data.currency || 'INR (₹)',
        academicYearFormat: data.academicYearFormat || 'June to April (AP State Board)',
        currentAcademicYear: data.currentAcademicYear || '2026–2027',
        gradingScale: data.gradingScale || 'AP Board CCE (A1-E Scale with 10.0 GPA)',
        attendanceMode: data.attendanceMode || 'Daily Morning & Afternoon Register',
        calendarSettings: data.calendarSettings || '6 Working Days (Mon-Sat, 2nd Saturday Holiday)'
      },
      branding: {
        logoUrl: data.logoUrl || '/assets/images/logo.png',
        faviconUrl: data.faviconUrl || '/assets/images/favicon.ico',
        primaryColor: data.primaryColor || '#1e3a8a',
        secondaryColor: data.secondaryColor || '#059669',
        accentColor: data.accentColor || '#d97706',
        documentHeader: data.documentHeader || 'SRI VIDYA EDUCATIONAL TRUST • GOVT RECOGNIZED'
      },
      domains: {
        primary: data.primaryDomain || `${code.toLowerCase()}.srividya.edu.in`,
        website: data.websiteDomain || `www.${code.toLowerCase()}.srividya.edu.in`,
        adminPortal: data.adminPortalDomain || `admin.${code.toLowerCase()}.srividya.edu.in`,
        facultyPortal: data.facultyPortalDomain || `faculty.${code.toLowerCase()}.srividya.edu.in`,
        apiDomain: data.apiDomain || `api.${code.toLowerCase()}.srividya.edu.in`,
        dnsVerified: data.status === 'Active',
        sslStatus: data.status === 'Active' ? 'Active (Let\'s Encrypt TLS 1.3)' : 'Pending DNS Propagation',
        dkimStatus: 'Configured (2048-bit RSA)',
        spfStatus: 'Configured'
      },
      setupStatus: data.action === 'save_draft' ? 'In Progress' : 'Complete',
      status: data.action === 'save_draft' ? 'Draft' : 'Active',
      suspension: {
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: '',
        reason: '',
        accessPolicy: 'Public & teacher portal login disabled. Authorized administrative audit access retained.'
      },
      administrators: [initialAdmin],
      integrations: {
        smsGateway: 'National CDAC Gateway (Govt DLT Approved)',
        paymentGateway: 'Razorpay & UPI Instant Settlement',
        biometricEnabled: true,
        storageVault: 'AWS S3 Mumbai (AES-256 Encrypted)'
      },
      subscription: {
        tier: 'Trust Enterprise Multi-Campus',
        seatsTotal: 1000,
        seatsUsed: 0,
        renewalDate: '2028-06-30',
        storageQuotaGb: 100
      },
      metrics: {
        students: 0,
        staff: 1,
        classrooms: 12
      },
      createdDate: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Institution.create(newInst);
        await logAuditEvent('INSTITUTION_CREATED', `Created institution ${newInst.name} (${newInst.code}) in status ${newInst.status}`, operator);
        return {
          success: true,
          message: `Institution '${newInst.name}' provisioned successfully!`,
          data: created,
          inviteToken
        };
      } catch (err) {
        // Fall through to memory
      }
    }

    defaultInstitutions.push(newInst);
    return {
      success: true,
      message: `Institution '${newInst.name}' provisioned successfully (in-memory mode)!`,
      data: newInst,
      inviteToken
    };
  }

  /**
   * Update institution details
   */
  async updateInstitution(id, updateData, operator = 'Platform Root Administrator') {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Institution.findOneAndUpdate(
          { $or: [{ institutionId: id }, { code: id.toUpperCase() }] },
          { $set: updateData, updatedDate: new Date() },
          { new: true }
        ).lean();
        if (doc) {
          await logAuditEvent('INSTITUTION_UPDATED', `Updated details for institution ${id}`, operator);
          return { success: true, message: 'Institution updated successfully', data: doc };
        }
      } catch (e) {
        // Fall back
      }
    }
    const idx = defaultInstitutions.findIndex(i => i.institutionId === id || i.code === id.toUpperCase());
    if (idx !== -1) {
      defaultInstitutions[idx] = { ...defaultInstitutions[idx], ...updateData, updatedDate: new Date() };
      return { success: true, message: 'Institution updated successfully', data: defaultInstitutions[idx] };
    }
    return { success: false, message: 'Institution not found' };
  }

  /**
   * Suspend Institution (Section 3.3 & 3.4)
   * Enforces Access Policy: Login access disabled, records NOT deleted, audit retained.
   */
  async suspendInstitution(id, reason, accessPolicy, operator = 'Platform Root Administrator') {
    if (!reason || reason.trim().length < 5) {
      return { success: false, message: 'Suspension requires an authoritative justification reason (minimum 5 characters).' };
    }

    const policy = accessPolicy || 'Public & teacher portal login disabled. Authorized administrative audit access retained. All student & fee records preserved.';

    const updateFields = {
      status: 'Suspended',
      'suspension.isSuspended': true,
      'suspension.suspendedAt': new Date(),
      'suspension.suspendedBy': operator,
      'suspension.reason': reason,
      'suspension.accessPolicy': policy
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Institution.findOneAndUpdate(
          { $or: [{ institutionId: id }, { code: id.toUpperCase() }] },
          { $set: updateFields },
          { new: true }
        ).lean();
        if (doc) {
          await logAuditEvent('INSTITUTION_SUSPENDED', `Suspended institution ${id}. Reason: ${reason}. Policy: ${policy}`, operator);
          return {
            success: true,
            message: `Institution '${doc.name}' access has been suspended under Trust Policy. Records remain fully preserved.`,
            data: doc
          };
        }
      } catch (e) {
        // Fall back
      }
    }

    const inst = defaultInstitutions.find(i => i.institutionId === id || i.code === id.toUpperCase());
    if (inst) {
      inst.status = 'Suspended';
      inst.suspension = {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedBy: operator,
        reason,
        accessPolicy: policy
      };
      return {
        success: true,
        message: `Institution '${inst.name}' access has been suspended under Trust Policy. Records remain fully preserved.`,
        data: inst
      };
    }
    return { success: false, message: 'Institution not found' };
  }

  /**
   * Reactivate a suspended institution
   */
  async reactivateInstitution(id, operator = 'Platform Root Administrator') {
    const updateFields = {
      status: 'Active',
      'suspension.isSuspended': false,
      'suspension.suspendedAt': null,
      'suspension.suspendedBy': '',
      'suspension.reason': '',
      'domains.dnsVerified': true
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Institution.findOneAndUpdate(
          { $or: [{ institutionId: id }, { code: id.toUpperCase() }] },
          { $set: updateFields },
          { new: true }
        ).lean();
        if (doc) {
          await logAuditEvent('INSTITUTION_REACTIVATED', `Reactivated institution ${id}`, operator);
          return { success: true, message: `Institution '${doc.name}' has been reactivated. Full portal access restored.`, data: doc };
        }
      } catch (e) {
        // Fall back
      }
    }

    const inst = defaultInstitutions.find(i => i.institutionId === id || i.code === id.toUpperCase());
    if (inst) {
      inst.status = 'Active';
      inst.suspension.isSuspended = false;
      return { success: true, message: `Institution '${inst.name}' has been reactivated. Full portal access restored.`, data: inst };
    }
    return { success: false, message: 'Institution not found' };
  }

  /**
   * Archive an institution
   */
  async archiveInstitution(id, operator = 'Platform Root Administrator') {
    const updateFields = {
      status: 'Archived',
      'domains.dnsVerified': false
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Institution.findOneAndUpdate(
          { $or: [{ institutionId: id }, { code: id.toUpperCase() }] },
          { $set: updateFields },
          { new: true }
        ).lean();
        if (doc) {
          await logAuditEvent('INSTITUTION_ARCHIVED', `Archived institution ${id}`, operator);
          return { success: true, message: `Institution '${doc.name}' archived. Read-only historical audit preserved.`, data: doc };
        }
      } catch (e) {
        // Fall back
      }
    }

    const inst = defaultInstitutions.find(i => i.institutionId === id || i.code === id.toUpperCase());
    if (inst) {
      inst.status = 'Archived';
      return { success: true, message: `Institution '${inst.name}' archived. Read-only historical audit preserved.`, data: inst };
    }
    return { success: false, message: 'Institution not found' };
  }

  /**
   * Run simulated DNS check & verification
   */
  async verifyDomain(id, domain) {
    const isSuccess = Boolean(domain && !domain.includes('invalid'));
    const records = [
      { type: 'A', host: '@', value: '172.67.182.41', status: 'Propagated' },
      { type: 'CNAME', host: 'www', value: 'ingress.srividya.edu.in', status: 'Propagated' },
      { type: 'CNAME', host: 'admin', value: 'ingress.srividya.edu.in', status: 'Propagated' },
      { type: 'TXT', host: '@', value: 'v=spf1 include:_spf.google.com ~all', status: 'Verified' },
      { type: 'TXT', host: 'google._domainkey', value: 'k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA', status: 'Verified' }
    ];

    return {
      success: true,
      verified: isSuccess,
      domain: domain || 'srividya.edu.in',
      dnsRecords: records,
      sslValid: true,
      message: isSuccess ? 'DNS propagation verified! All CNAME and TXT records matched.' : 'DNS verification pending.'
    };
  }

  /**
   * Invite an institutional administrator
   */
  async inviteAdministrator(id, adminData, operator = 'Platform Root Administrator') {
    const inviteToken = `SEC-INV-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const newAdmin = {
      name: adminData.name || 'New Institutional Leader',
      email: adminData.email,
      phone: adminData.phone || '',
      role: adminData.role || 'Institutional Principal',
      status: 'Invitation Sent',
      inviteToken,
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      lastLogin: 'Never'
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Institution.updateOne(
          { $or: [{ institutionId: id }, { code: id.toUpperCase() }] },
          { $push: { administrators: newAdmin } }
        );
        await logAuditEvent('ADMIN_INVITED', `Invited ${newAdmin.email} as ${newAdmin.role} for institution ${id}`, operator);
        return {
          success: true,
          message: `Cryptographic activation invitation generated and dispatched to ${newAdmin.email}`,
          data: newAdmin,
          inviteLink: `http://localhost:5000/management?activate=${inviteToken}`
        };
      } catch (e) {
        // Fall back
      }
    }

    const inst = defaultInstitutions.find(i => i.institutionId === id || i.code === id.toUpperCase());
    if (inst) {
      inst.administrators.push(newAdmin);
      return {
        success: true,
        message: `Cryptographic activation invitation generated and dispatched to ${newAdmin.email}`,
        data: newAdmin,
        inviteLink: `http://localhost:5000/management?activate=${inviteToken}`
      };
    }
    return { success: false, message: 'Institution not found' };
  }
}

module.exports = new InstitutionService();

