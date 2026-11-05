/**
 * Sri Vidya Educational Trust - Backups & Recovery Routes
 * Module 12: 12.1 Backup Overview, 12.2 Backup History, and 12.3 Controlled 8-Step Recovery Workflow
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/backup.controller');

// 12.1 Backup Overview
router.get('/overview', controller.getBackupOverview);

// 12.3 Recovery Workflow
router.get('/recovery-requests', controller.listRecoveryRequests);
router.post('/recovery-requests', controller.createRecoveryRequest);
router.get('/recovery-requests/:recoveryId', controller.getRecoveryRequest);
router.post('/recovery-requests/:recoveryId/approve', controller.approveRecoveryRequest);

// 12.2 Backup History
router.get('/', controller.listBackups);
router.post('/', controller.startBackup);
router.get('/:backupId', controller.getBackup);
router.post('/:backupId/verify', controller.verifyBackup);
router.get('/:backupId/download', controller.downloadBackup);

module.exports = router;

