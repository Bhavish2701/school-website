
const routes = require('./backups-recovery.routes');
const controller = require('./backups-recovery.controller');
const service = require('./backups-recovery.service');
const repository = require('./backups-recovery.repository');
const validation = require('./backups-recovery.validation');
const policy = require('./backups-recovery.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
