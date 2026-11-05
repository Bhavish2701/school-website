/**
 * Sri Vidya Educational Trust - Institution Onboarding & Migration Controller
 * REST API Endpoints for Module 5
 */

const OnboardingService = require('../services/onboarding.service');

const getOverview = async (req, res) => {
  try {
    const result = await OnboardingService.getOnboardingOverview();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getChecklist = async (req, res) => {
  try {
    const result = await OnboardingService.getInstitutionChecklist(req.params.institutionId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateChecklistItem = async (req, res) => {
  try {
    const { itemKey, status, operator, notes } = req.body;
    const result = await OnboardingService.updateChecklistItem(req.params.institutionId, itemKey, status, operator, notes);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const listImportJobs = async (req, res) => {
  try {
    const result = await OnboardingService.listImportJobs(req.query);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createImportJob = async (req, res) => {
  try {
    const operator = req.body.operator || req.user?.username || 'Platform Super Administrator';
    const result = await OnboardingService.createImportJob(req.body, operator);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const executeImport = async (req, res) => {
  try {
    const { operator, isDryRun, updatePolicy } = req.body;
    const result = await OnboardingService.executeImport(req.params.jobId, operator, isDryRun, updatePolicy);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const exportErrorsCSV = async (req, res) => {
  try {
    const csv = await OnboardingService.exportImportErrorsCSV(req.params.jobId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Migration_Errors_${req.params.jobId}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOverview,
  getChecklist,
  updateChecklistItem,
  listImportJobs,
  createImportJob,
  executeImport,
  exportErrorsCSV
};
