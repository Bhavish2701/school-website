/**
 * Support & Issue Management - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class SupportTicketsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'support.manage',
      auditCategory: 'SUPPORT_TICKETS',
      auditAction: 'READ_SUPPORT_TICKETS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'support.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'SUPPORT_TICKETS',
      auditAction: 'WRITE_SUPPORT_TICKETS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SUPPORT_TICKETS',
      auditAction: 'SENSITIVE_ACTION_SUPPORT_TICKETS'
    })(req, res, next);
  }
}

module.exports = SupportTicketsPolicy;
