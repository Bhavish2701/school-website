const { authenticateUser } = require('./rbac.middleware');

module.exports = authenticateUser;
module.exports.authenticate = authenticateUser;
module.exports.authenticateUser = authenticateUser;
