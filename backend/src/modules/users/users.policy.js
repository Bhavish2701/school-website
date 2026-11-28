
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class UsersPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'users.manage',
      auditCategory: 'USERS',
      auditAction: 'READ_USERS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'users.manage',
      requirePlatformWideScope: false,
      auditCategory: 'USERS',
      auditAction: 'WRITE_USERS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'USERS',
      auditAction: 'SENSITIVE_ACTION_USERS'
    })(req, res, next);
  }
}

module.exports = UsersPolicy;
