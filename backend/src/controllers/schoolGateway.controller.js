/**
 * Sri Vidya Educational Trust - School Gateways Controller
 * Module 18: Navigation Gateways, Identity Scoping, and Decoupled Telemetry
 */

const SchoolGatewayService = require('../services/schoolGateway.service');

const getStatus = async (req, res) => {
  try {
    const institutionId = req.query.institutionId || 'INST-001';
    const result = await SchoolGatewayService.getGatewayStatus(institutionId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyAdministrationAccess = async (req, res) => {
  try {
    const user = {
      role: req.body.role || req.query.role || req.user?.role || 'admin',
      institutionId: req.body.institutionId || req.query.institutionId || 'INST-001'
    };
    // Pass query params to check for token/password leakage
    const result = SchoolGatewayService.verifyAdministrationAccess(user, req.query);
    return res.status(result.statusCode || 200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyFacultyAccess = async (req, res) => {
  try {
    const user = {
      role: req.body.role || req.query.role || req.user?.role || 'teacher',
      institutionId: req.body.institutionId || req.query.institutionId || 'INST-001'
    };
    // Pass query params to check for token/password leakage
    const result = SchoolGatewayService.verifyFacultyAccess(user, req.query);
    return res.status(result.statusCode || 200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const probeWebsite = async (req, res) => {
  try {
    const result = await SchoolGatewayService.probeDecoupledHealth();
    return res.status(200).json({ success: true, telemetry: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStatus,
  verifyAdministrationAccess,
  verifyFacultyAccess,
  probeWebsite
};
