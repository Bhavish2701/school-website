const ApiError = require('../utils/apiError');
const { formatError } = require('../utils/apiResponse');
const ErrorLog = require('../models/errorLog.model');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON in request payload', 'INVALID_JSON', {
      body: 'Malformed JSON syntax',
    });
  }

  if (err.name === 'CastError') {
    const message = `Invalid value for parameter '${err.path}'`;
    error = ApiError.badRequest(message, 'INVALID_PARAMETER', {
      [err.path]: `Invalid value: ${err.value}`,
    });
  }

  if (err.name === 'ValidationError') {
    const errorMap = {};
    Object.values(err.errors || {}).forEach((val) => {
      errorMap[val.path] = val.message;
    });
    error = ApiError.validation(errorMap, 'Validation failed for model');
  }

  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {});
    const errorMap = {};
    duplicateFields.forEach((field) => {
      errorMap[field] = `${field} already exists`;
    });
    error = ApiError.conflict('Duplicate entry detected', 'DUPLICATE_KEY', errorMap);
  }

  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token', 'TOKEN_INVALID', {
      token: 'Token is invalid or corrupted',
    });
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired', 'TOKEN_EXPIRED', {
      token: 'Token has expired',
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'An unexpected server error occurred';
  const errors = error.errors || {};
  const errorCode = error.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  let recoveryAction = null;
  if (statusCode === 401) {
    recoveryAction = 'Your session has expired or authentication failed. Please sign in again with your credentials.';
  } else if (statusCode === 403) {
    recoveryAction = 'You do not have authorization to perform this executive action. Contact the Principal or IT Administrator.';
  } else if (statusCode === 404) {
    recoveryAction = 'The requested school record or endpoint does not exist. Please check the identifier or navigate back to the dashboard.';
  } else if (statusCode === 409 || errorCode === 'DUPLICATE_KEY') {
    recoveryAction = 'A duplicate record already exists in Sri Vidya ERP. Please use a unique admission number, roll number, or identifier.';
  } else if (statusCode === 429) {
    recoveryAction = 'Rate limit reached. Please wait a short moment before trying again.';
  } else if (statusCode === 400 || statusCode === 422) {
    recoveryAction = 'Please verify the highlighted form values, ensure all required fields are provided, and resubmit.';
  } else if (statusCode >= 500) {
    recoveryAction = 'Our school ERP engineering team has been notified. Please refresh the page or retry in a few moments.';
  }

  if (statusCode >= 500 || !(err instanceof ApiError)) {
    console.error(`[ERP Central Error Tracker] ${err.name || 'Error'}: ${err.message}`, err.stack);
    ErrorLog.create({
      source: 'backend',
      level: statusCode >= 500 ? 'error' : 'warn',
      message: err.message || message,
      errorType: errorCode,
      stack: err.stack,
      endpoint: req.originalUrl || req.path,
      method: req.method,
      statusCode,
      user: req.user
        ? {
            id: String(req.user._id || req.user.id || ''),
            username: req.user.username || '',
            role: req.user.role || '',
          }
        : null,
      ip: req.ip || (req.connection && req.connection.remoteAddress) || '',
      userAgent: req.get ? req.get('User-Agent') : '',
    }).catch((logErr) => {
      console.warn('[ErrorLog Persistence Warning]', logErr.message);
    });
  }

  const payload = formatError(message, errors, recoveryAction, errorCode);
  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
