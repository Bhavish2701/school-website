/**
 * School Configuration Controller
 * Endpoints for School Profile, Academic Configuration, Operational Defaults,
 * and Document & Report Templates.
 */
const schoolConfigService = require('../services/schoolConfig.service');

class SchoolConfigController {
  async getConfig(req, res) {
    try {
      const institutionId = req.query.institutionId || req.params.institutionId || 'INST-001';
      const result = await schoolConfigService.getConfigByInstitution(institutionId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const institutionId = req.body.institutionId || req.params.institutionId || 'INST-001';
      const action = req.body.action || 'publish';
      const operator = req.user?.email || 'sysadmin.root@srividya.trust';
      const result = await schoolConfigService.updateSchoolProfile(institutionId, req.body.profile, action, operator);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateAcademic(req, res) {
    try {
      const institutionId = req.body.institutionId || req.params.institutionId || 'INST-001';
      const action = req.body.action || 'publish';
      const operator = req.user?.email || 'sysadmin.root@srividya.trust';
      const result = await schoolConfigService.updateAcademicConfig(institutionId, req.body.academic, action, operator);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateOperational(req, res) {
    try {
      const institutionId = req.body.institutionId || req.params.institutionId || 'INST-001';
      const operator = req.user?.email || 'sysadmin.root@srividya.trust';
      const result = await schoolConfigService.updateOperationalDefaults(institutionId, req.body.operational, operator);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async listTemplates(req, res) {
    try {
      const institutionId = req.query.institutionId || 'INST-001';
      const filter = req.query.filter || '';
      const result = await schoolConfigService.listDocumentTemplates(institutionId, filter);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const institutionId = req.body.institutionId || 'INST-001';
      const operator = req.user?.email || 'sysadmin.root@srividya.trust';
      const result = await schoolConfigService.updateDocumentTemplate(institutionId, templateId, req.body, operator);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SchoolConfigController();
