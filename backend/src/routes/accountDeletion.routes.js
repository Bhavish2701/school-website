/**
 * Account Deletion & Deactivation Routes
 */
const express = require('express');
const router = express.Router();
const accountDeletionController = require('../controllers/accountDeletion.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Submit deactivation request (any authenticated user)
router.post('/request-deletion', authenticate, accountDeletionController.requestDeletion);

// Executive Review routes (Super Admin & Principal)
router.get(
  '/deletion-requests',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  accountDeletionController.listDeletionRequests
);

router.post(
  '/deletion-requests/:id/review',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  accountDeletionController.reviewDeletionRequest
);

module.exports = router;
