/**
 * Sri Vidya Educational Trust - Platform User & Account Management Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/userAccount.controller');

router.get('/summary', controller.getSummary);
router.get('/', controller.listUsers);
router.post('/', controller.createUser);
router.get('/:userId', controller.getUser);

router.post('/:userId/resend-invite', controller.resendInvitation);
router.post('/:userId/suspend', controller.suspendUser);
router.post('/:userId/reactivate', controller.reactivateUser);
router.post('/:userId/deactivate', controller.deactivateUser);
router.post('/:userId/reset-password', controller.triggerPasswordReset);
router.post('/:userId/mfa', controller.toggleMfa);

router.delete('/:userId/sessions/:sessionId', controller.revokeSession);
router.delete('/:userId/sessions', controller.revokeAllSessions);

module.exports = router;

