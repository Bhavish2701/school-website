/**
 * Platform Maintenance Mode Enforcement Middleware
 * Reads GlobalSettings.maintenance.isActive (with lightweight 5s cache) and blocks
 * non-SUPER_ADMIN operational endpoints during scheduled maintenance windows.
 */
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { GlobalSettings } = require('../models/globalSettings.model');

let cachedState = { checkedAt: 0, isActive: false, message: '' };

const invalidateMaintenanceCache = () => {
  cachedState.checkedAt = 0;
};

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const path = req.path || '';
    if (
      path.startsWith('/health') ||
      path.startsWith('/auth') ||
      path.startsWith('/platform') ||
      path.startsWith('/settings') ||
      path.startsWith('/global-settings')
    ) {
      return next();
    }

    const now = Date.now();
    if (now - cachedState.checkedAt > 5000) {
      const settings = await GlobalSettings.findOne({ settingsId: 'PLATFORM_GLOBAL_SETTINGS' })
        .select('maintenance')
        .lean();
      cachedState = {
        checkedAt: now,
        isActive: Boolean(settings?.maintenance?.isActive),
        message:
          settings?.maintenance?.userFacingMessage ||
          'System is currently undergoing scheduled maintenance. Please try again later.',
      };
    }

    if (!cachedState.isActive) return next();

    // Allow authenticated SUPER_ADMIN to bypass maintenance mode
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET);
        if (decoded && decoded.role === 'SUPER_ADMIN') {
          return next();
        }
      } catch (_) {
        // Invalid token falls through to 503 during maintenance
      }
    }

    return res.status(503).json({
      success: false,
      maintenanceMode: true,
      message: cachedState.message,
    });
  } catch (err) {
    return next();
  }
};

module.exports = { maintenanceMiddleware, invalidateMaintenanceCache };
