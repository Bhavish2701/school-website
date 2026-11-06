/**
 * Sri Vidya Educational Trust - Platform Policies & Data Retention Controller
 * Module 17: Governance Policy Register, Granular Retention Rules, and Controlled Data Requests
 */

const PlatformPolicyService = require('../services/platformPolicy.service');

// 17.1 Policy Register
const listPolicies = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      approvalStatus: req.query.approvalStatus,
      search: req.query.search
    };
    const result = await PlatformPolicyService.listPolicies(filters);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPolicy = async (req, res) => {
  try {
    const result = await PlatformPolicyService.getPolicy(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createPolicy = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await PlatformPolicyService.createPolicy(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await PlatformPolicyService.updatePolicy(req.params.id, req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 17.2 Data Retention Configuration
const listRetentionRules = async (req, res) => {
  try {
    const filters = {
      reviewStatus: req.query.reviewStatus,
      applicableInstitution: req.query.applicableInstitution,
      search: req.query.search
    };
    const result = await PlatformPolicyService.listRetentionRules(filters);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRetentionRule = async (req, res) => {
  try {
    const result = await PlatformPolicyService.getRetentionRule(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createRetentionDraft = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Trust Governance Officer';
    const result = await PlatformPolicyService.createRetentionDraft(req.body, actor);
    if (!result.success) {
      const statusCode = result.statutoryInvariantBlocked ? 422 : 400;
      return res.status(statusCode).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const submitRetentionReview = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Trust Governance Officer';
    const result = await PlatformPolicyService.submitRetentionReview(req.params.id, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const approveRetentionRule = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const approvedBy = req.body.approvedBy || 'State Board of Education & Trust Legal Directorate';
    const result = await PlatformPolicyService.approveRetentionRule(req.params.id, approvedBy, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const publishRetentionRule = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await PlatformPolicyService.publishRetentionRule(req.params.id, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getRetentionVersions = async (req, res) => {
  try {
    const result = await PlatformPolicyService.getRetentionVersions(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 17.3 Data Requests
const listDataRequests = async (req, res) => {
  try {
    const filters = {
      requestType: req.query.requestType,
      status: req.query.status,
      institutionScope: req.query.institutionScope,
      search: req.query.search
    };
    const result = await PlatformPolicyService.listDataRequests(filters);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDataRequest = async (req, res) => {
  try {
    const result = await PlatformPolicyService.getDataRequest(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createDataRequest = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await PlatformPolicyService.createDataRequest(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const approveDataRequest = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const signoffData = {
      signoffBy: req.body.signoffBy,
      role: req.body.role,
      notes: req.body.notes
    };
    const result = await PlatformPolicyService.approveDataRequest(req.params.id, signoffData, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const rejectDataRequest = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const reason = req.body.reason;
    const result = await PlatformPolicyService.rejectDataRequest(req.params.id, reason, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const fulfillDataRequest = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const fulfillmentDetails = req.body.fulfillmentDetails;
    const result = await PlatformPolicyService.fulfillDataRequest(req.params.id, fulfillmentDetails, actor);
    if (!result.success) {
      const statusCode = result.governanceSafeguardBlocked ? 403 : 400;
      return res.status(statusCode).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  // 17.1
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,

  // 17.2
  listRetentionRules,
  getRetentionRule,
  createRetentionDraft,
  submitRetentionReview,
  approveRetentionRule,
  publishRetentionRule,
  getRetentionVersions,

  // 17.3
  listDataRequests,
  getDataRequest,
  createDataRequest,
  approveDataRequest,
  rejectDataRequest,
  fulfillDataRequest
};

