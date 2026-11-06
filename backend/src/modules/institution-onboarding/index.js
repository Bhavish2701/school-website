/**
 * Institution Onboarding & Migration - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./institution-onboarding.routes');
const controller = require('./institution-onboarding.controller');
const service = require('./institution-onboarding.service');
const repository = require('./institution-onboarding.repository');
const validation = require('./institution-onboarding.validation');
const policy = require('./institution-onboarding.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
