const express = require('express');
const router = express.Router();
const accountDeletionController = require('../controllers/accountDeletion.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

router.post('/request-deletion', authenticate, accountDeletionController.requestDeletion);

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
