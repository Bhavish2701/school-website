/**
 * Sri Vidya Educational Trust - System Health & Deployment Controller
 * Module 11: Real-Time Service Health, Deployment History, Sanitized Logs & Background Jobs
 */

const SystemHealthService = require('../services/systemHealth.service');

// 11.1 Service Health Probes
const getServiceHealth = async (req, res) => {
  try {
    const health = await SystemHealthService.getServiceHealth();
    return res.status(200).json(health);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11.2 Deployment History
const listDeployments = async (req, res) => {
  try {
    const result = await SystemHealthService.listDeployments(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDeployment = async (req, res) => {
  try {
    const result = await SystemHealthService.getDeploymentById(req.params.deploymentId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const initiateDeployment = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SystemHealthService.initiateDeployment(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const requestRollback = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SystemHealthService.requestRollback(req.params.deploymentId, req.body.reason, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11.3 Application Logs
const listLogs = async (req, res) => {
  try {
    const result = await SystemHealthService.listLogs(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const ingestLog = async (req, res) => {
  try {
    const result = await SystemHealthService.ingestLog(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const exportDiagnostics = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SystemHealthService.exportDiagnosticReport(req.query, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11.4 Background Jobs
const listJobs = async (req, res) => {
  try {
    const result = await SystemHealthService.listJobs(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getJob = async (req, res) => {
  try {
    const result = await SystemHealthService.getJobById(req.params.jobId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Background job not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const retryJob = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SystemHealthService.retryJob(req.params.jobId, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const cancelJob = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SystemHealthService.cancelJob(req.params.jobId, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getServiceHealth,
  listDeployments,
  getDeployment,
  initiateDeployment,
  requestRollback,
  listLogs,
  ingestLog,
  exportDiagnostics,
  listJobs,
  getJob,
  retryJob,
  cancelJob
};
