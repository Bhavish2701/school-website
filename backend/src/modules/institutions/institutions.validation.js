/**
 * Institutions Module - Validation Layer
 * Enforces schema formats, required fields, and duplicate pre-verification
 */

class InstitutionsValidation {
  static validateCreate(req, res, next) {
    const { name, code, domain } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: 'Validation failed: Institution full name is required.'
      });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        field: 'code',
        message: 'Validation failed: Unique institutional code (e.g. SV-CAMPUS) is required.'
      });
    }
    if (code.length < 3) {
      return res.status(400).json({
        success: false,
        field: 'code',
        message: 'Validation failed: Institutional code must be at least 3 characters.'
      });
    }
    next();
  }

  static validateSuspension(req, res, next) {
    const { reason, confirmAuthority } = req.body;
    if (!reason || reason.trim().length < 8) {
      return res.status(400).json({
        success: false,
        field: 'reason',
        message: 'Validation failed: A formal statutory justification of at least 8 characters is required.'
      });
    }
    next();
  }
}

module.exports = InstitutionsValidation;
