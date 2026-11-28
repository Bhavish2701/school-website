
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class InstitutionsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'institutions.read',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'VIEW_INSTITUTION'
    })(req, res, next);
  }

  static createPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator', 'Trust General Secretary'],
      requiredPermission: 'institutions.write',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'CREATE_INSTITUTION'
    })(req, res, next);
  }

  static updatePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal'],
      requiredPermission: 'institutions.write',
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'UPDATE_INSTITUTION'
    })(req, res, next);
  }

  static suspendPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requiredPermission: 'institutions.suspend',
      requireApprovalSignatory: false,
      auditCategory: 'INSTITUTION_MANAGEMENT',
      auditAction: 'SUSPEND_INSTITUTION'
    })(req, res, next);
  }
}

module.exports = InstitutionsPolicy;

