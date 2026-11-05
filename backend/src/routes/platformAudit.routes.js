/**
 * Sri Vidya Educational Trust - Platform Audit Routes
 * Module 8: Audit Log Explorer REST API Endpoints
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/platformAudit.controller');

// Read-only evidence exploration
router.get('/summary', controller.getSummary);
router.get('/', controller.listEvents);
router.get('/export', controller.exportReport);
router.post('/export', controller.exportReport);
router.get('/:eventId', controller.getEvent);

// Append-only entry creation (prohibits update / delete)
router.post('/', controller.logEvent);

// Explicit 405 Method Not Allowed guards for update/delete attempts
const rejectTampering = (req, res) => {
  return res.status(405).json({
    success: false,
    error: 'MethodNotAllowed',
    message: 'Audit Log Immutability: Modifications and deletions of forensic audit entries are strictly prohibited under AP Education Code statutory rules.'
  });
};

router.put('/:eventId', rejectTampering);
router.patch('/:eventId', rejectTampering);
router.delete('/:eventId', rejectTampering);
router.delete('/', rejectTampering);

module.exports = router;
