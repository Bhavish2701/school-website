/**
 * Authentication & Session Security - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./auth.routes');
const controller = require('./auth.controller');
const service = require('./auth.service');
const repository = require('./auth.repository');
const validation = require('./auth.validation');
const policy = require('./auth.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
