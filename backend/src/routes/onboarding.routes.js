/**
 * Sri Vidya Educational Trust - Onboarding & Migration Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/onboarding.controller');

router.get('/overview', controller.getOverview);
router.get('/checklist/:institutionId', controller.getChecklist);
router.post('/checklist/:institutionId/item', controller.updateChecklistItem);

router.get('/imports', controller.listImportJobs);
router.post('/imports/new', controller.createImportJob);
router.post('/imports/:jobId/execute', controller.executeImport);
router.get('/imports/:jobId/errors-csv', controller.exportErrorsCSV);

module.exports = router;
