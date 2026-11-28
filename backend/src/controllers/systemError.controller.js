const asyncHandler = require('../utils/asyncHandler');
const { formatSuccess } = require('../utils/apiResponse');
const ErrorLog = require('../models/errorLog.model');

const logClientError = asyncHandler(async (req, res) => {
  const { message, stack, endpoint, errorType, metadata } = req.body;

  if (!message) {
    return res.status(200).json(formatSuccess({}, 'No error recorded'));
  }

  const log = await ErrorLog.create({
    source: 'frontend',
    level: 'error',
    message: String(message).slice(0, 500),
    stack: stack ? String(stack).slice(0, 2000) : '',
    endpoint: endpoint ? String(endpoint).slice(0, 255) : '',
    errorType: errorType || 'CLIENT_RUNTIME_ERROR',
    user: req.user
      ? {
          id: String(req.user._id || req.user.id || ''),
          username: req.user.username || '',
          role: req.user.role || '',
        }
      : null,
    ip: req.ip || (req.connection && req.connection.remoteAddress) || '',
    userAgent: req.get ? req.get('User-Agent') : '',
    metadata: metadata || {},
  });

  res.status(201).json(formatSuccess({ id: log._id }, 'Client error recorded'));
});

const getErrorLogs = asyncHandler(async (req, res) => {
  const { limit = 50, source } = req.query;
  const filter = {};
  if (source) filter.source = source;

  const logs = await ErrorLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit, 10) || 50, 100));

  const totalErrors = await ErrorLog.countDocuments();
  const backendCount = await ErrorLog.countDocuments({ source: 'backend' });
  const frontendCount = await ErrorLog.countDocuments({ source: 'frontend' });

  res.status(200).json(
    formatSuccess(
      {
        totalErrors,
        backendCount,
        frontendCount,
        logs,
      },
      'Error logs retrieved'
    )
  );
});

module.exports = {
  logClientError,
  getErrorLogs,
};
