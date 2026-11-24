/**
 * System Error Logging Routes
 */
const express = require('express');
const router = express.Router();
const systemErrorController = require('../controllers/systemError.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Public sink for frontend runtime errors (captured by window.onerror)
router.post('/client-errors', systemErrorController.logClientError);

// Executive error log dashboard
router.get(
  '/error-logs',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  systemErrorController.getErrorLogs
);

module.exports = router;
