const {
  authorizeRoles,
  authorizeResource,
  requireRole,
  requirePermission,
} = require('./rbac.middleware');

module.exports = {
  authorizeRoles,
  authorizeResource,
  requireRole,
  requirePermission,
  authorize: authorizeRoles,
};
