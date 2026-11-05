/**
 * Sri Vidya Educational Trust - Platform Audit Controller
 * REST API Endpoints for Module 8: Audit Logs
 */

const PlatformAuditService = require('../services/platformAudit.service');

const getSummary = async (req, res) => {
  try {
    const summary = await PlatformAuditService.getAuditSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listEvents = async (req, res) => {
  try {
    const result = await PlatformAuditService.listEvents(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const result = await PlatformAuditService.getEventById(req.params.eventId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Audit event not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const logEvent = async (req, res) => {
  try {
    const result = await PlatformAuditService.logEvent(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const report = await PlatformAuditService.exportAuthorizedReport(req.query, operator);
    return res.status(200).json(report);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSummary,
  listEvents,
  getEvent,
  logEvent,
  exportReport
};
