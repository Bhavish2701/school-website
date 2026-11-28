
const express = require('express');
const router = express.Router();
const controller = require('../controllers/supportTicket.controller');

router.get('/overview', controller.getSupportOverview);

router.get('/tickets', controller.listTickets);
router.post('/tickets', controller.createTicket);
router.get('/tickets/:id', controller.getTicket);

router.post('/tickets/:id/assign', controller.assignTicket);
router.post('/tickets/:id/priority', controller.changePriority);
router.post('/tickets/:id/reply', controller.addReply);
router.post('/tickets/:id/internal-note', controller.addInternalNote);
router.post('/tickets/:id/request-info', controller.requestAdditionalInfo);
router.post('/tickets/:id/escalate', controller.escalateTicket);
router.post('/tickets/:id/resolve', controller.resolveTicket);
router.post('/tickets/:id/reopen', controller.reopenTicket);

module.exports = router;

