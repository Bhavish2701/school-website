/**
 * Institutions Module - Controller Layer
 * Handles incoming HTTP requests, status codes, and error bubbling
 */

const InstitutionsService = require('./institutions.service');

class InstitutionsController {
  static async list(req, res) {
    try {
      const result = await InstitutionsService.listInstitutions(req);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const result = await InstitutionsService.getInstitution(req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const operator = req.user?.username || 'Platform Super Administrator';
      const result = await InstitutionsService.createInstitution(req.body, operator);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async suspend(req, res) {
    try {
      const operator = req.user?.username || 'Platform Super Administrator';
      const { reason, accessPolicy } = req.body;
      const result = await InstitutionsService.suspendInstitution(req.params.id, reason, accessPolicy, operator);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = InstitutionsController;
