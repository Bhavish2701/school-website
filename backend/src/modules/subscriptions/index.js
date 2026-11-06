/**
 * Subscriptions & Commercial Plans - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./subscriptions.routes');
const controller = require('./subscriptions.controller');
const service = require('./subscriptions.service');
const repository = require('./subscriptions.repository');
const validation = require('./subscriptions.validation');
const policy = require('./subscriptions.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
