
const routes = require('./email-notifications.routes');
const controller = require('./email-notifications.controller');
const service = require('./email-notifications.service');
const repository = require('./email-notifications.repository');
const validation = require('./email-notifications.validation');
const policy = require('./email-notifications.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
