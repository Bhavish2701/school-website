/**
 * Subscriptions & Commercial Plans - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

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
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'SUBSCRIPTIONS',
      auditAction: 'WRITE_SUBSCRIPTIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SUBSCRIPTIONS',
      auditAction: 'SENSITIVE_ACTION_SUBSCRIPTIONS'
    })(req, res, next);
  }
}

module.exports = SubscriptionsPolicy;
