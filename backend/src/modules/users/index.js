/**
 * Platform Users & Accounts - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./users.routes');
const controller = require('./users.controller');
const service = require('./users.service');
const repository = require('./users.repository');
const validation = require('./users.validation');
const policy = require('./users.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
