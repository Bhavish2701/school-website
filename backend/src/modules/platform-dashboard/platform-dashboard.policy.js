/**
 * Platform Dashboard Telemetry - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class PlatformDashboardPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'dashboard.read',
      auditCategory: 'PLATFORM_DASHBOARD',
      auditAction: 'READ_PLATFORM_DASHBOARD'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'dashboard.read',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'PLATFORM_DASHBOARD',
      auditAction: 'WRITE_PLATFORM_DASHBOARD'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'PLATFORM_DASHBOARD',
      auditAction: 'SENSITIVE_ACTION_PLATFORM_DASHBOARD'
    })(req, res, next);
  }
}

module.exports = PlatformDashboardPolicy;
