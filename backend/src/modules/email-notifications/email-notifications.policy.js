
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class EmailNotificationsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'email.manage',
      auditCategory: 'EMAIL_NOTIFICATIONS',
      auditAction: 'READ_EMAIL_NOTIFICATIONS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'email.manage',
      requirePlatformWideScope: false,
      auditCategory: 'EMAIL_NOTIFICATIONS',
      auditAction: 'WRITE_EMAIL_NOTIFICATIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'EMAIL_NOTIFICATIONS',
      auditAction: 'SENSITIVE_ACTION_EMAIL_NOTIFICATIONS'
    })(req, res, next);
  }
}

module.exports = EmailNotificationsPolicy;
