
const express = require('express');
const router = express.Router();
const Controller = require('./email-notifications.controller');
const Validation = require('./email-notifications.validation');
const Policy = require('./email-notifications.policy');
const fs = require('fs');
const path = require('path');

router.get('/', Policy.readPolicy, Controller.getOverview);
router.get('/:id', Policy.readPolicy, Controller.getById);
router.post('/', Policy.writePolicy, Validation.validateRequest, Controller.createOrExecute);
router.post('/action', Policy.sensitiveActionPolicy, Validation.validateAction, Controller.createOrExecute);

const legacyRouteFile = path.join(__dirname, 'routes.js');
if (fs.existsSync(legacyRouteFile)) {
  try {
    const legacyRouter = require('./routes');
    router.use('/', legacyRouter);
  } catch (err) {}
}

module.exports = router;
