/**
 * Sri Vidya Educational Trust - Platform Administration Workflows Controller
 * Implements Workflows A through F
 */

const PlatformWorkflowService = require('../services/platformWorkflow.service');

// Workflow A: Register a new school
const registerSchool = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.registerSchoolWorkflow(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflow B: Invite a new school administrator
const inviteAdmin = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.inviteAdministratorWorkflow(req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const activateAdmin = async (req, res) => {
  try {
    const { token, inviteToken } = req.body;
    const resolvedToken = token || inviteToken || req.query.token;
    const operator = req.body.operator || 'Self / Recipient';
    const result = await PlatformWorkflowService.verifyAndActivateAdmin(resolvedToken, req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflow C: Deploy a new application version
const deployVersion = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.initiateDeploymentWorkflow(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const rollbackDeployment = async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.rollbackDeploymentWorkflow(deploymentId || req.body.deploymentId, req.body.reason, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflow D: Resolve a system incident
const createIncident = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Monitoring Service';
    const result = await PlatformWorkflowService.createIncidentWorkflow(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const resolveIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const operator = req.body.operator || req.user?.username || 'Platform Incident Commander';
    const result = await PlatformWorkflowService.resolveIncidentWorkflow(incidentId || req.body.incidentId, req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflow E: Suspend a compromised account
const suspendAccount = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform SecOps Lead';
    const result = await PlatformWorkflowService.suspendCompromisedAccountWorkflow(req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const reinstateAccount = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform SecOps Lead';
    const result = await PlatformWorkflowService.reinstateAccountWorkflow(req.body, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflow F: Import an existing school's records
const testImport = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.runImportWorkflow({ ...req.body, isDryRun: true }, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const approveImport = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await PlatformWorkflowService.runImportWorkflow({ ...req.body, isDryRun: false }, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Workflows Overview
const getOverview = async (req, res) => {
  try {
    const result = await PlatformWorkflowService.getWorkflowsOverview();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerSchool,
  inviteAdmin,
  activateAdmin,
  deployVersion,
  rollbackDeployment,
  createIncident,
  resolveIncident,
  suspendAccount,
  reinstateAccount,
  testImport,
  approveImport,
  getOverview
};
