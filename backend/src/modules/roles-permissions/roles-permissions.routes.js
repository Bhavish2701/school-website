/**
 * Role Templates & RBAC Permissions - Route Layer
 * Connects endpoints with validation and policy middleware
 */

const express = require('express');
const router = express.Router();
const Controller = require('./roles-permissions.controller');
const Validation = require('./roles-permissions.validation');
const Policy = require('./roles-permissions.policy');
const fs = require('fs');
const path = require('path');

router.get('/', Policy.readPolicy, Controller.getOverview);
router.get('/:id', Policy.readPolicy, Controller.getById);
router.post('/', Policy.writePolicy, Validation.validateRequest, Controller.createOrExecute);
router.post('/action', Policy.sensitiveActionPolicy, Validation.validateAction, Controller.createOrExecute);

// Full backward compatibility for modules with legacy routes.js
const legacyRouteFile = path.join(__dirname, 'routes.js');
if (fs.existsSync(legacyRouteFile)) {
  try {
    const legacyRouter = require('./routes');
    router.use('/', legacyRouter);
  } catch (err) {}
}

module.exports = router;
