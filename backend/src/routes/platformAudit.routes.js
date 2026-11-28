
const express = require('express');
const router = express.Router();
const controller = require('../controllers/platformAudit.controller');

router.get('/summary', controller.getSummary);
router.get('/', controller.listEvents);
router.get('/export', controller.exportReport);
router.post('/export', controller.exportReport);
router.get('/:eventId', controller.getEvent);

router.post('/', controller.logEvent);

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

