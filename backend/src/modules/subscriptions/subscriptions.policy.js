
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class SubscriptionsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'subscriptions.manage',
      auditCategory: 'SUBSCRIPTIONS',
      auditAction: 'READ_SUBSCRIPTIONS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'subscriptions.manage',
      requirePlatformWideScope: false,
      auditCategory: 'SUBSCRIPTIONS',
      auditAction: 'WRITE_SUBSCRIPTIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SUBSCRIPTIONS',
      auditAction: 'SENSITIVE_ACTION_SUBSCRIPTIONS'
    })(req, res, next);
  }
}

module.exports = SubscriptionsPolicy;
