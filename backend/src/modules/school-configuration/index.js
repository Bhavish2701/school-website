/**
 * School Configuration & Defaults - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./school-configuration.routes');
const controller = require('./school-configuration.controller');
const service = require('./school-configuration.service');
const repository = require('./school-configuration.repository');
const validation = require('./school-configuration.validation');
const policy = require('./school-configuration.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
