/**
 * Sri Vidya Educational Trust - Integrations & API Management Controller
 * Module 13: Integrations Directory, Configuration, API Clients, and Event Logs
 */

const IntegrationService = require('../services/integration.service');

// 13.1 & 13.2 Integrations Directory & Configuration
const listIntegrations = async (req, res) => {
  try {
    const result = await IntegrationService.listIntegrations(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getIntegration = async (req, res) => {
  try {
    const result = await IntegrationService.getIntegrationById(req.params.id);
    if (!result.success || !result.data) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createIntegration = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.createIntegration(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateIntegration = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.updateIntegration(req.params.id, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const testConnection = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.testConnection(req.params.id, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        latencyMs: result.latencyMs,
        endpoint: result.endpoint,
        testedAt: result.testedAt,
        status: 'CONNECTED'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleIntegration = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const isEnabled = req.body.isEnabled !== false;
    const result = await IntegrationService.toggleIntegration(req.params.id, isEnabled, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const rotateCredentials = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.rotateCredentials(req.params.id, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const disconnectIntegration = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.disconnectIntegration(req.params.id, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 13.3 API Management (External Clients)
const listApiClients = async (req, res) => {
  try {
    const result = await IntegrationService.listApiClients(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const registerApiClient = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.registerApiClient(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const rotateApiClientCredentials = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await IntegrationService.rotateApiClientCredentials(req.params.clientId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const revokeApiClient = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Administrator';
    const reason = req.body.reason || 'Operator manual revocation';
    const result = await IntegrationService.revokeApiClient(req.params.clientId, reason, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 13.4 Integration Event Logs
const listEventLogs = async (req, res) => {
  try {
    const result = await IntegrationService.listEventLogs(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const reconcilePaymentEvent = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Accounts Staff';
    const result = await IntegrationService.reconcilePaymentEvent(req.params.eventId, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  testConnection,
  toggleIntegration,
  rotateCredentials,
  disconnectIntegration,
  listApiClients,
  registerApiClient,
  rotateApiClientCredentials,
  revokeApiClient,
  listEventLogs,
  reconcilePaymentEvent
};
