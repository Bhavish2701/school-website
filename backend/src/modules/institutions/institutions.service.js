/**
 * Institutions Module - Service Layer
 * Encapsulates core business rules, default configurations, and state transitions
 */

const InstitutionsRepository = require('./institutions.repository');
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class InstitutionsService {
  static async listInstitutions(req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({}, req);
    const institutions = await InstitutionsRepository.findAll(scopedQuery);

    // Summary calculation
    const activeCount = institutions.filter(i => i.status === 'Active').length;
    const suspendedCount = institutions.filter(i => i.status === 'Suspended' || i.suspension?.isSuspended).length;

    return {
      success: true,
      count: institutions.length,
      summary: {
        total: institutions.length,
        active: activeCount,
        suspended: suspendedCount
      },
      data: institutions
    };
  }

  static async getInstitution(idOrCode) {
    const institution = await InstitutionsRepository.findByIdOrCode(idOrCode);
    if (!institution) {
      return { success: false, message: 'Institution record not found.' };
    }
    return { success: true, data: institution };
  }

  static async createInstitution(data, operator = 'Platform Super Administrator') {
    const code = (data.code || '').toUpperCase().trim();
    const domain = (data.domain || `${code.toLowerCase()}.srividya.edu.in`).trim();

    // Check duplicates
    const dupCheck = await InstitutionsRepository.checkDuplicateCodeOrDomain(code, domain);
    if (dupCheck.duplicate) {
      return {
        success: false,
        isDuplicate: true,
        message: `Duplicate detected: An institution with this ${dupCheck.field} ('${dupCheck.field === 'code' ? code : domain}') already exists.`
      };
    }

    const institutionId = data.institutionId || `INST-${Date.now().toString().slice(-4)}`;
    const newDoc = {
      institutionId,
      code,
      name: data.name,
      displayName: data.displayName || data.name,
      type: data.type || 'Primary & Secondary School',
      trust: 'Sri Vidya Educational Trust',
      board: data.board || 'Andhra Pradesh State Board (AP SSC)',
      status: data.status || 'Active',
      setupStatus: data.setupStatus || 'Complete',
      domains: {
        primary: domain,
        website: `www.${domain}`,
        adminPortal: `admin.${domain}`,
        facultyPortal: `faculty.${domain}`,
        dnsVerified: true,
        sslStatus: 'Active (TLS 1.3)'
      },
      configuration: data.configuration || {
        timezone: 'Asia/Kolkata (IST +05:30)',
        locale: 'en-IN',
        currentAcademicYear: '2026–2027',
        gradingScale: 'AP Board CCE (A1-E Scale with 10.0 GPA)'
      },
      administrators: data.administrators || []
    };

    const created = await InstitutionsRepository.create(newDoc);
    return {
      success: true,
      message: `Institution '${data.name}' successfully registered.`,
      data: created
    };
  }

  static async suspendInstitution(idOrCode, reason, policy = 'disable_login_keep_audit', operator = 'Platform Super Administrator') {
    const existing = await InstitutionsRepository.findByIdOrCode(idOrCode);
    if (!existing) {
      return { success: false, message: 'Institution record not found.' };
    }

    const updateData = {
      status: 'Suspended',
      'suspension.isSuspended': true,
      'suspension.suspendedAt': new Date(),
      'suspension.suspendedBy': operator,
      'suspension.reason': reason,
      'suspension.accessPolicy': policy
    };

    const updated = await InstitutionsRepository.update(idOrCode, updateData);
    return {
      success: true,
      message: `Institution '${existing.name}' access suspended. Zero academic or financial records deleted; audit history retained.`,
      data: updated
    };
  }
}

module.exports = InstitutionsService;
