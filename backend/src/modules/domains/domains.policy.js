
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class DomainsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'domains.manage',
      auditCategory: 'DOMAINS',
      auditAction: 'READ_DOMAINS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'domains.manage',
      requirePlatformWideScope: false,
      auditCategory: 'DOMAINS',
      auditAction: 'WRITE_DOMAINS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'DOMAINS',
      auditAction: 'SENSITIVE_ACTION_DOMAINS'
    })(req, res, next);
  }
}

module.exports = DomainsPolicy;
