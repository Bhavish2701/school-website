/**
 * Support & Issue Management - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./support-tickets.routes');
const controller = require('./support-tickets.controller');
const service = require('./support-tickets.service');
const repository = require('./support-tickets.repository');
const validation = require('./support-tickets.validation');
const policy = require('./support-tickets.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
