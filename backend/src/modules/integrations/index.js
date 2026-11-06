/**
 * External Integrations Directory - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./integrations.routes');
const controller = require('./integrations.controller');
const service = require('./integrations.service');
const repository = require('./integrations.repository');
const validation = require('./integrations.validation');
const policy = require('./integrations.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
