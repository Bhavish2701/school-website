/**
 * School Configuration & Defaults - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class SchoolConfigurationPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'config.manage',
      auditCategory: 'SCHOOL_CONFIGURATION',
      auditAction: 'READ_SCHOOL_CONFIGURATION'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'config.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'SCHOOL_CONFIGURATION',
      auditAction: 'WRITE_SCHOOL_CONFIGURATION'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SCHOOL_CONFIGURATION',
      auditAction: 'SENSITIVE_ACTION_SCHOOL_CONFIGURATION'
    })(req, res, next);
  }
}

module.exports = SchoolConfigurationPolicy;
