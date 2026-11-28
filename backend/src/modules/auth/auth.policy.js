
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class AuthPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'auth.manage',
      auditCategory: 'AUTH',
      auditAction: 'READ_AUTH'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'auth.manage',
      requirePlatformWideScope: false,
      auditCategory: 'AUTH',
      auditAction: 'WRITE_AUTH'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'AUTH',
      auditAction: 'SENSITIVE_ACTION_AUTH'
    })(req, res, next);
  }
}

module.exports = AuthPolicy;
