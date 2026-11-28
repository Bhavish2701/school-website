const {
  authenticateUser,
  authorizeRoles,
  authorizeResource,
} = require('./rbac.middleware');

module.exports = {
  authenticateUser,
  authorizeRoles,
  authorizeResource,
  authenticate: authenticateUser,
  authorize: authorizeRoles,
};
