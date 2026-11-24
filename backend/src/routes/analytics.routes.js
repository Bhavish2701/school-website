/**
 * Analytics Routes
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Public tracking sink (rate-limited via global limiter)
router.post('/track', analyticsController.trackEvent);

// Executive analytics summary
router.get(
  '/summary',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  analyticsController.getAnalyticsSummary
);

module.exports = router;
