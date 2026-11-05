/**
 * Sri Vidya Educational Trust - Permission Enforcement Middleware
 * Section 7.4 Security Invariant: The backend must enforce permissions on every protected operation.
 * Hiding a button in the frontend is not sufficient security.
 */

const RoleTemplateService = require('../services/roleTemplate.service');

/**
 * Middleware factory to enforce required module + action permissions
 * @param {string} moduleName - e.g. 'institutions', 'user_accounts', 'school_config', etc.
 * @param {string} action - 'view' | 'create_edit' | 'approve' | 'export' | 'manage_access'
 * @param {object} options - Optional context parameters (e.g. sensitiveField, campusIsolation)
 */
const requirePermission = (moduleName, action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Determine user roles from session / JWT / req.user
      const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);

      // If user is root superadmin, allow
      if (userRoles.includes('Super Administrator') || userRoles.includes('Platform Owner') || req.user?.isSuperAdmin) {
        return next();
      }

      if (userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied: No role templates associated with request context.'
        });
      }

      // Build context for evaluation
      const context = {
        institutionId: req.params.institutionId || req.body.institutionId || req.query.institutionId,
        userInstitutionId: req.user?.institutionId,
        requestedSensitiveField: options.sensitiveField || null
      };

      const result = await RoleTemplateService.evaluatePermission(userRoles, moduleName, action, context);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: result.reason || `Unauthorized: Requires '${action}' permission on '${moduleName}'.`
        });
      }

      // Permission granted
      req.permissionContext = result;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'PermissionEvaluationError',
        message: err.message
      });
    }
  };
};

module.exports = {
  requirePermission
};
