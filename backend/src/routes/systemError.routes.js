const express = require('express');
const router = express.Router();
const systemErrorController = require('../controllers/systemError.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

router.post('/client-errors', systemErrorController.logClientError);

router.get(
  '/error-logs',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  systemErrorController.getErrorLogs
);

module.exports = router;
