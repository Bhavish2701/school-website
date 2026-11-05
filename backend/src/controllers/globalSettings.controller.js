/**
 * Sri Vidya Educational Trust - Global Platform Settings Controller
 * Module 16: General Settings, Authentication Policies, Platform Feature Controls, and Maintenance Safeguards
 */

const GlobalSettingsService = require('../services/globalSettings.service');

const getSettings = async (req, res) => {
  try {
    const result = await GlobalSettingsService.getGlobalSettings();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateGeneral = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.updateGeneralSettings(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAuthentication = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.updateAuthenticationSettings(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listFeatures = async (req, res) => {
  try {
    const result = await GlobalSettingsService.listFeatureControls();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFeature = async (req, res) => {
  try {
    const result = await GlobalSettingsService.getFeatureControl(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createFeature = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.createFeatureControl(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateFeature = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.updateFeatureControl(req.params.id, req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleFeature = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.toggleFeatureControl(req.params.id, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMaintenance = async (req, res) => {
  try {
    const result = await GlobalSettingsService.getMaintenanceSettings();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const scheduleMaintenance = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const result = await GlobalSettingsService.scheduleMaintenance(req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleMaintenance = async (req, res) => {
  try {
    const actor = req.body.operator || req.user?.username || 'Platform Administrator';
    const isActive = req.body.isActive !== undefined ? req.body.isActive : true;
    const result = await GlobalSettingsService.setMaintenanceMode(isActive, req.body, actor);
    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const previewMaintenance = async (req, res) => {
  try {
    const result = await GlobalSettingsService.previewMaintenanceAnnouncement(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSettings,
  updateGeneral,
  updateAuthentication,
  listFeatures,
  getFeature,
  createFeature,
  updateFeature,
  toggleFeature,
  getMaintenance,
  scheduleMaintenance,
  toggleMaintenance,
  previewMaintenance
};

