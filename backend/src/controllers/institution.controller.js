const institutionService = require('../services/institution.service');

exports.listInstitutions = async (req, res) => {
  try {
    const result = await institutionService.listInstitutions(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInstitution = async (req, res) => {
  try {
    const result = await institutionService.getInstitutionById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createInstitution = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const result = await institutionService.createInstitution(req.body, operator);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateInstitution = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const result = await institutionService.updateInstitution(req.params.id, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.suspendInstitution = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const { reason, accessPolicy } = req.body;
    const result = await institutionService.suspendInstitution(req.params.id, reason, accessPolicy, operator);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reactivateInstitution = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const result = await institutionService.reactivateInstitution(req.params.id, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.archiveInstitution = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const result = await institutionService.archiveInstitution(req.params.id, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyDomain = async (req, res) => {
  try {
    const result = await institutionService.verifyDomain(req.params.id, req.body.domain);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.inviteAdministrator = async (req, res) => {
  try {
    const operator = req.user ? req.user.email : 'Platform Root Administrator';
    const result = await institutionService.inviteAdministrator(req.params.id, req.body, operator);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

