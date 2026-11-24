/**
 * Privacy-Conscious Analytics Controller
 * Under DPDP Act 2023: No student PII or third-party ad tracking
 */
const asyncHandler = require('../utils/asyncHandler');
const { formatSuccess } = require('../utils/apiResponse');
const AnalyticsEvent = require('../models/analyticsEvent.model');

/**
 * @route   POST /api/v1/analytics/track
 * @desc    Record telemetry event (privacy-safe, zero 3rd party)
 * @access  Public / Authenticated
 */
const trackEvent = asyncHandler(async (req, res) => {
  const { eventType, module, action, durationMs, metadata } = req.body;

  if (!eventType) {
    return res.status(200).json(formatSuccess({}, 'Event omitted'));
  }

  // Anonymize IP (strip last octet for IPv4, last 80 bits for IPv6)
  const rawIp = req.ip || (req.connection && req.connection.remoteAddress) || '';
  const anonymizedIp = rawIp.includes('.')
    ? rawIp.replace(/\.\d+$/, '.0')
    : '0.0.0.0';

  // Scrub any accidental student PII from metadata
  const sanitizedMeta = { ...(metadata || {}) };
  delete sanitizedMeta.password;
  delete sanitizedMeta.token;
  delete sanitizedMeta.aadhaarNumber;

  const event = await AnalyticsEvent.create({
    eventType: String(eventType).slice(0, 50),
    module: module ? String(module).slice(0, 50) : 'GENERAL',
    action: action ? String(action).slice(0, 50) : '',
    userRole: req.user ? req.user.role : 'ANONYMOUS',
    institutionId: 'INST-SRIVIDYA-001',
    durationMs: typeof durationMs === 'number' ? Math.max(0, durationMs) : undefined,
    anonymizedIp,
    metadata: sanitizedMeta,
  });

  res.status(201).json(formatSuccess({ id: event._id }, 'Analytics event logged'));
});

/**
 * @route   GET /api/v1/analytics/summary
 * @desc    Get aggregated in-house telemetry summary
 * @access  Protected (Super Admin, Principal)
 */
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const totalEvents = await AnalyticsEvent.countDocuments();
  const moduleBreakdown = await AnalyticsEvent.aggregate([
    { $group: { _id: '$module', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const roleBreakdown = await AnalyticsEvent.aggregate([
    { $group: { _id: '$userRole', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const recentEvents = await AnalyticsEvent.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-anonymizedIp');

  res.status(200).json(
    formatSuccess(
      {
        totalEvents,
        moduleBreakdown: moduleBreakdown.map((m) => ({ module: m._id || 'GENERAL', count: m.count })),
        roleBreakdown: roleBreakdown.map((r) => ({ role: r._id || 'ANONYMOUS', count: r.count })),
        recentEvents,
      },
      'Analytics summary retrieved successfully'
    )
  );
});

module.exports = {
  trackEvent,
  getAnalyticsSummary,
};
