/**
 * Sri Vidya Educational Trust - Backups & Recovery Controller
 * Module 12: 12.1 Backup Overview, 12.2 Backup History, and 12.3 Controlled 8-Step Recovery Workflow
 */

const BackupService = require('../services/backup.service');

// 12.1 Backup Overview
const getBackupOverview = async (req, res) => {
  try {
    const result = await BackupService.getBackupOverview();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 12.2 Backup History
const listBackups = async (req, res) => {
  try {
    const result = await BackupService.listBackups(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getBackup = async (req, res) => {
  try {
    const result = await BackupService.getBackupById(req.params.backupId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Backup record not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const startBackup = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Operator';
    const result = await BackupService.startAuthorizedBackup(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyBackup = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Operator';
    const result = await BackupService.verifyBackup(req.params.backupId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadBackup = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Operator';
    const result = await BackupService.downloadBackup(req.params.backupId, operator);
    if (!result.success) {
      return res.status(403).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 12.3 Recovery Workflow
const listRecoveryRequests = async (req, res) => {
  try {
    const result = await BackupService.listRecoveryRequests(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRecoveryRequest = async (req, res) => {
  try {
    const result = await BackupService.getRecoveryRequestById(req.params.recoveryId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Recovery request record not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createRecoveryRequest = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await BackupService.createRecoveryRequest(req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const approveRecoveryRequest = async (req, res) => {
  try {
    const approver = req.body.approver || {
      userId: req.user?.userId || 'USR-PLAT-OWNER',
      name: req.user?.username || 'Trust Secretary',
      role: 'Platform Owner'
    };
    const result = await BackupService.approveAndExecuteRecovery(req.params.recoveryId, req.body, approver);
    if (!result.success) {
      return res.status(403).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBackupOverview,
  listBackups,
  getBackup,
  startBackup,
  verifyBackup,
  downloadBackup,
  listRecoveryRequests,
  getRecoveryRequest,
  createRecoveryRequest,
  approveRecoveryRequest
};
