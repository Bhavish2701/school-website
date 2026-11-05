/**
 * Sri Vidya Educational Trust - Role Templates Controller
 * REST API Endpoints for Module 7: Role Templates & Permissions
 */

const RoleTemplateService = require('../services/roleTemplate.service');

const getSummary = async (req, res) => {
  try {
    const summary = await RoleTemplateService.getRolesSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listRoles = async (req, res) => {
  try {
    const result = await RoleTemplateService.listRoles(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRole = async (req, res) => {
  try {
    const result = await RoleTemplateService.getRoleById(req.params.roleId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Role template not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createRole = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await RoleTemplateService.createRole(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const duplicateRole = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await RoleTemplateService.duplicateRole(req.params.roleId, req.body.name, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const rationale = req.body.rationale || '';
    const result = await RoleTemplateService.updateRole(req.params.roleId, req.body, operator, rationale);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const reviewRoleChange = async (req, res) => {
  try {
    const reviewer = req.body.reviewer || req.user?.username || 'Platform Owner';
    const decision = req.body.decision; // 'Approved' | 'Rejected'
    const reviewNotes = req.body.notes || '';
    const result = await RoleTemplateService.reviewRoleChange(req.params.roleId, decision, reviewer, reviewNotes);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleRoleStatus = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await RoleTemplateService.toggleRoleStatus(req.params.roleId, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const assignUsers = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const delta = parseInt(req.body.delta || '1', 10);
    const result = await RoleTemplateService.assignUsersToRole(req.params.roleId, delta, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const evaluatePermission = async (req, res) => {
  try {
    const { roles, module, action, context } = req.body;
    const result = await RoleTemplateService.evaluatePermission(roles || [], module, action, context || {});
    return res.status(200).json({ success: true, evaluation: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSummary,
  listRoles,
  getRole,
  createRole,
  duplicateRole,
  updateRole,
  reviewRoleChange,
  toggleRoleStatus,
  assignUsers,
  evaluatePermission
};
