/**
 * Global Platform Settings - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./global-settings.routes');
const controller = require('./global-settings.controller');
const service = require('./global-settings.service');
const repository = require('./global-settings.repository');
const validation = require('./global-settings.validation');
const policy = require('./global-settings.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
