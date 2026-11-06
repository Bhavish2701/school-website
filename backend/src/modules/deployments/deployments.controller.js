/**
 * Deployment History & Lifecycle - Controller Layer
 * Handles HTTP requests, responses, and status codes
 */

const Service = require('./deployments.service');

class DeploymentsController {
  static async getOverview(req, res) {
    try {
      const result = await Service.getOverview(req);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const result = await Service.getById(req.params.id, req);
      const statusCode = result.success ? 200 : 404;
      return res.status(statusCode).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createOrExecute(req, res) {
    try {
      const operator = req.user?.username || 'Platform Super Administrator';
      const result = await Service.processOperation(req.body, operator);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = DeploymentsController;
