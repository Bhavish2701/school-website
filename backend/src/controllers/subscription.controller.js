/**
 * Sri Vidya Educational Trust - Subscriptions & Plans Controller
 * Module 10: Multi-Tenant Commercial Plans Directory, Institution Subscriptions,
 * Usage Tracking, and Statutory Record Non-Disruption Guarantees
 */

const SubscriptionService = require('../services/subscription.service');

// Get Summary
const getSummary = async (req, res) => {
  try {
    const summary = await SubscriptionService.getSubscriptionSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10.1 Plans Operations
const listPlans = async (req, res) => {
  try {
    const result = await SubscriptionService.listPlans(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPlan = async (req, res) => {
  try {
    const result = await SubscriptionService.getPlanById(req.params.planId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.createPlan(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.updatePlan(req.params.planId, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const publishPlan = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.publishPlan(req.params.planId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const archivePlan = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.archivePlan(req.params.planId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10.2 Subscriptions Operations
const listSubscriptions = async (req, res) => {
  try {
    const result = await SubscriptionService.listSubscriptions(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSubscription = async (req, res) => {
  try {
    const result = await SubscriptionService.getSubscriptionById(req.params.subscriptionId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const assignPlan = async (req, res) => {
  try {
    const { institutionId, planId, ...options } = req.body;
    if (!institutionId || !planId) {
      return res.status(400).json({ success: false, message: 'institutionId and planId are required' });
    }
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.assignPlan(institutionId, planId, options, operator);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.renewSubscription(req.params.subscriptionId, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'Target planId is required' });
    }
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.changePlan(req.params.subscriptionId, planId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const recordAdjustment = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.recordBillingAdjustment(req.params.subscriptionId, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const suspendOrCancel = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SubscriptionService.suspendOrCancelSubscription(req.params.subscriptionId, action, reason, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 10.3 Usage & Entitlements
const getUsage = async (req, res) => {
  try {
    const instId = req.params.institutionId || req.query.institutionId || 'INST-001';
    const result = await SubscriptionService.getUsageAndEntitlements(instId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSummary,
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  publishPlan,
  archivePlan,
  listSubscriptions,
  getSubscription,
  assignPlan,
  renewSubscription,
  changePlan,
  recordAdjustment,
  suspendOrCancel,
  getUsage
};

