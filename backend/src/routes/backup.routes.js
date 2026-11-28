
const express = require('express');
const router = express.Router();
const controller = require('../controllers/backup.controller');

router.get('/overview', controller.getBackupOverview);

router.get('/recovery-requests', controller.listRecoveryRequests);
router.post('/recovery-requests', controller.createRecoveryRequest);
router.get('/recovery-requests/:recoveryId', controller.getRecoveryRequest);
router.post('/recovery-requests/:recoveryId/approve', controller.approveRecoveryRequest);

router.get('/', controller.listBackups);
router.post('/', controller.startBackup);
router.get('/:backupId', controller.getBackup);
router.post('/:backupId/verify', controller.verifyBackup);
router.get('/:backupId/download', controller.downloadBackup);

module.exports = router;

