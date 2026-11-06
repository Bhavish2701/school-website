/**
 * Institutions Module - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class InstitutionsPolicy {
  /**
   * Reading institutions: platform-wide admins see all, school admins see only their campus
   */
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'institutions.read',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'VIEW_INSTITUTION'
    })(req, res, next);
  }

  /**
   * Creating an institution requires explicit Platform-Wide authorization
   */
  static createPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator', 'Trust General Secretary'],
      requiredPermission: 'institutions.write',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'CREATE_INSTITUTION'
    })(req, res, next);
  }

  /**
   * Modifying an institution: Must be scoped to institution or have platform-wide superadmin authority
   */
  static updatePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal'],
      requiredPermission: 'institutions.write',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'UPDATE_INSTITUTION'
    })(req, res, next);
  }

  /**
   * Suspending an institution: High-impact action requiring statutory authority and explicit reason
   */
  static suspendPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requiredPermission: 'institutions.suspend',
      requireApprovalSignatory: false, // validated via authority checkbox
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'SUSPEND_INSTITUTION'
    })(req, res, next);
  }
}

module.exports = InstitutionsPolicy;

