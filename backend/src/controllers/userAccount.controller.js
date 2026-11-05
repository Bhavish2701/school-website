/**
 * Sri Vidya Educational Trust - Platform User & Account Management Controller
 * REST API Endpoints for Module 6
 */

const UserAccountService = require('../services/userAccount.service');

const getSummary = async (req, res) => {
  try {
    const summary = await UserAccountService.getUsersSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await UserAccountService.listUsers(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const result = await UserAccountService.getUserById(req.params.userId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.createUser(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const resendInvitation = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.resendInvitation(req.params.userId, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.suspendUser(req.params.userId, reason, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const reactivateUser = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.reactivateUser(req.params.userId, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.deactivateUser(req.params.userId, reason, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const revokeSession = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.revokeSession(req.params.userId, req.params.sessionId, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const revokeAllSessions = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.revokeAllSessions(req.params.userId, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const triggerPasswordReset = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.triggerPasswordReset(req.params.userId, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleMfa = async (req, res) => {
  try {
    const { enabled, method } = req.body;
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await UserAccountService.toggleMfa(req.params.userId, enabled, method, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSummary,
  listUsers,
  getUser,
  createUser,
  resendInvitation,
  suspendUser,
  reactivateUser,
  deactivateUser,
  revokeSession,
  revokeAllSessions,
  triggerPasswordReset,
  toggleMfa
};
