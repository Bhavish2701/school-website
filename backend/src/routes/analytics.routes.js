const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

router.post('/track', analyticsController.trackEvent);

router.get(
  '/summary',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  analyticsController.getAnalyticsSummary
);

module.exports = router;
