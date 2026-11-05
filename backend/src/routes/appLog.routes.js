/**
 * Sri Vidya Educational Trust - Application Logs Routes (11.3)
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemHealth.controller');

router.get('/export', controller.exportDiagnostics);
router.post('/export', controller.exportDiagnostics);
router.get('/', controller.listLogs);
router.post('/', controller.ingestLog);

module.exports = router;

