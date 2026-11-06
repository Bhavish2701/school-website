/**
 * Email Relay & Notification Delivery - Validation Layer
 * Enforces field schemas, constraints, and data integrity
 */

class EmailNotificationsValidation {
  static validateRequest(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
      if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
        return res.status(400).json({
          success: false,
          errorCode: 'EMPTY_PAYLOAD_NOT_ALLOWED',
          message: 'Validation failed: Request payload cannot be empty.'
        });
      }
    }
    next();
  }

  static validateAction(req, res, next) {
    const { action, reason } = req.body;
    if (action === 'SUSPEND' || action === 'RESTORE' || action === 'DELETE') {
      if (!reason || reason.trim().length < 6) {
        return res.status(400).json({
          success: false,
          errorCode: 'JUSTIFICATION_REQUIRED',
          message: 'Validation failed: A justification of at least 6 characters is required for sensitive actions.'
        });
      }
    }
    next();
  }
}

module.exports = EmailNotificationsValidation;
