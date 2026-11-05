/**
 * Sri Vidya Educational Trust - Domains, Email & Notifications Controller
 * Module 15: Domain Directory, DNS Configuration, Email Services, and Notification Templates
 */

const DomainEmailService = require('../services/domainEmail.service');

// 15.1 & 15.2 Domain Directory & DNS
const listDomains = async (req, res) => {
  try {
    const result = await DomainEmailService.listDomains(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDomain = async (req, res) => {
  try {
    const result = await DomainEmailService.getDomainById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDomainDns = async (req, res) => {
  try {
    const result = await DomainEmailService.getDomainById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json({
      success: true,
      data: {
        domain: result.data,
        records: result.data.dnsRecords || []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createDomain = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.createDomain(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyDomainOwnership = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.verifyDomainOwnership(req.params.id, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const checkDns = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.checkDns(req.params.id, actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const retryVerification = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.retryVerification(req.params.id, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeDomain = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.removeOrDisableDomain(req.params.id, 'remove', actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleDomain = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.removeOrDisableDomain(req.params.id, 'disable', actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 15.3 Email Service Management
const listEmailServices = async (req, res) => {
  try {
    const result = await DomainEmailService.listEmailServices();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const targetEmail = req.body.targetEmail || 'admin@srividya.edu.in';
    const result = await DomainEmailService.sendTestEmail(req.params.id, targetEmail, actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifySender = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.verifySenderDomain(req.params.id, actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleEmailService = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const isEnabled = req.body.isEnabled;
    const result = await DomainEmailService.toggleEmailService(req.params.id, isEnabled, actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDeliveryLogs = async (req, res) => {
  try {
    const result = await DomainEmailService.getEmailDeliveryLogs(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 15.4 Notification Templates
const listTemplates = async (req, res) => {
  try {
    const result = await DomainEmailService.listNotificationTemplates(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTemplate = async (req, res) => {
  try {
    const result = await DomainEmailService.getNotificationTemplateById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await DomainEmailService.updateNotificationTemplate(req.params.id, req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const previewTemplate = async (req, res) => {
  try {
    const sampleData = req.body.sampleData || {};
    const result = await DomainEmailService.renderTemplatePreview(req.params.id, sampleData);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const testSendTemplate = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const targetRecipient = req.body.targetRecipient || 'admin@srividya.edu.in';
    const result = await DomainEmailService.sendTestNotification(req.params.id, targetRecipient, actor);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listDomains,
  getDomain,
  getDomainDns,
  createDomain,
  verifyDomainOwnership,
  checkDns,
  retryVerification,
  removeDomain,
  toggleDomain,
  listEmailServices,
  sendTestEmail,
  verifySender,
  toggleEmailService,
  getDeliveryLogs,
  listTemplates,
  getTemplate,
  updateTemplate,
  previewTemplate,
  testSendTemplate
};
