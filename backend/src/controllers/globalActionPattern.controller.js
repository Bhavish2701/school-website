/**
 * Sri Vidya Educational Trust - Global Action Patterns Controller
 * Consistent Confirmation Dialogs, Field Validation, Duplicate Checking,
 * and Post-Backend Success Feedback.
 */

const globalActionPatternService = require('../services/globalActionPattern.service');

const getPatterns = async (req, res) => {
  try {
    const patterns = globalActionPatternService.getActionPatternsRegistry();
    return res.status(200).json({
      success: true,
      count: patterns.length,
      patterns
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const validateAction = async (req, res) => {
  try {
    const { actionType, payload = {} } = req.body;
    if (!actionType) {
      return res.status(400).json({
        success: false,
        message: 'Field actionType is required.'
      });
    }

    const validation = await globalActionPatternService.validateAction(actionType, payload, req.user);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        preservedInput: validation.preservedInput || payload,
        ...validation
      });
    }

    return res.status(200).json({
      success: true,
      ...validation
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const confirmAction = async (req, res) => {
  try {
    const { actionType, payload = {}, actor } = req.body;
    if (!actionType) {
      return res.status(400).json({
        success: false,
        message: 'Field actionType is required.'
      });
    }

    const resolvedActor = actor || req.user?.username || 'Platform Administrator';
    const result = await globalActionPatternService.confirmHighImpactAction(actionType, payload, resolvedActor);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getPatterns,
  validateAction,
  confirmAction
};
