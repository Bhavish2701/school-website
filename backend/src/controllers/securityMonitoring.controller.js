/**
 * Sri Vidya Educational Trust - Security & Access Monitoring Controller
 * Module 9: Real-time Threat Defense, 9.1 Overview, 9.2 Event Register,
 * 9.3 Privileged Access Reviews, and 9.4 7-Step Incident Workflow
 */

const SecurityMonitoringService = require('../services/securityMonitoring.service');

// 9.1 Get Overview KPIs
const getOverview = async (req, res) => {
  try {
    const data = await SecurityMonitoringService.getSecurityOverview();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 List Security Events
const listEvents = async (req, res) => {
  try {
    const result = await SecurityMonitoringService.listSecurityEvents(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 Get Single Security Event
const getEvent = async (req, res) => {
  try {
    const result = await SecurityMonitoringService.getSecurityEventById(req.params.eventId);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Security event not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.4 Lifecycle Transition: Triage Event
const triageEvent = async (req, res) => {
  try {
    const { riskClassification, operator } = req.body;
    const op = operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.triageEvent(req.params.eventId, riskClassification, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.4 Lifecycle Transition: Assign Investigator
const assignInvestigator = async (req, res) => {
  try {
    const { investigatorName, slaHours, operator } = req.body;
    const op = operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.assignInvestigator(req.params.eventId, investigatorName, slaHours, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 Action: Mark Under Investigation
const markUnderInvestigation = async (req, res) => {
  try {
    const op = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.markUnderInvestigation(req.params.eventId, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 Action: Record Findings
const recordFindings = async (req, res) => {
  try {
    const op = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.recordFindings(req.params.eventId, req.body, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.4 Lifecycle Transition: Contain or Remediate (High-Impact Action)
const containOrRemediate = async (req, res) => {
  try {
    const op = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.containOrRemediate(req.params.eventId, req.body, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 Action: Close Event
const closeEvent = async (req, res) => {
  try {
    const op = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.closeEvent(req.params.eventId, req.body.resolutionNotes, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.2 Action: Escalate According to Policy (High-Impact Action)
const escalateEvent = async (req, res) => {
  try {
    const { escalationLevel, reason, operator } = req.body;
    const op = operator || req.user?.username || 'Platform Administrator';
    const result = await SecurityMonitoringService.escalateEvent(req.params.eventId, escalationLevel, reason, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.3 Privileged Access Reviews: List Reviews
const listAccessReviews = async (req, res) => {
  try {
    const result = await SecurityMonitoringService.listAccessReviews(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9.3 Action: Record Review Outcome (Confirm, Reduce, Revoke, Clarify)
const recordAccessReviewOutcome = async (req, res) => {
  try {
    const { decision, notes, operator } = req.body;
    const op = operator || req.user?.username || 'Trust Security Auditor';
    const result = await SecurityMonitoringService.recordAccessReviewOutcome(req.params.reviewId, decision, notes, op);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOverview,
  listEvents,
  getEvent,
  triageEvent,
  assignInvestigator,
  markUnderInvestigation,
  recordFindings,
  containOrRemediate,
  closeEvent,
  escalateEvent,
  listAccessReviews,
  recordAccessReviewOutcome
};
