/**
 * Sri Vidya Educational Trust - Support & Issue Management Routes
 * Module 14: Support Overview, Ticket Directory, Lifecycle Workflow, and Internal Notes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/supportTicket.controller');

// 14.1 Support Overview
router.get('/overview', controller.getSupportOverview);

// 14.2 & 14.3 Support Tickets CRUD
router.get('/tickets', controller.listTickets);
router.post('/tickets', controller.createTicket);
router.get('/tickets/:id', controller.getTicket);

// 14.4 & 14.5 Ticket Actions & Lifecycle
router.post('/tickets/:id/assign', controller.assignTicket);
router.post('/tickets/:id/priority', controller.changePriority);
router.post('/tickets/:id/reply', controller.addReply);
router.post('/tickets/:id/internal-note', controller.addInternalNote);
router.post('/tickets/:id/request-info', controller.requestAdditionalInfo);
router.post('/tickets/:id/escalate', controller.escalateTicket);
router.post('/tickets/:id/resolve', controller.resolveTicket);
router.post('/tickets/:id/reopen', controller.reopenTicket);

module.exports = router;

