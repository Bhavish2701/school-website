
const formatSuccess = (data = {}, message = 'Operation completed successfully') => {
  return {
    success: true,
    message,
    data: data || {},
    errors: null,
  };
};

const formatError = (message = 'An error occurred', errors = {}, recoveryAction = null, errorCode = null) => {
  let formattedErrors = errors;
  if (Array.isArray(errors)) {
    formattedErrors = {};
    errors.forEach((err, idx) => {
      const key = err.field || err.param || `error_${idx}`;
      formattedErrors[key] = err.message || err.msg || String(err);
    });
  } else if (typeof errors !== 'object' || errors === null) {
    formattedErrors = { detail: String(errors) };
  }

  const payload = {
    success: false,
    message,
    data: null,
    errors: formattedErrors,
  };

  if (recoveryAction) {
    payload.recoveryAction = recoveryAction;
  }
  if (errorCode) {
    payload.errorCode = errorCode;
    payload.code = errorCode;
  }

  return payload;
};

const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(formatSuccess(data, message));
};

const sendError = (res, message = 'Request failed', errors = {}, statusCode = 400, recoveryAction = null, errorCode = null) => {
  return res.status(statusCode).json(formatError(message, errors, recoveryAction, errorCode));
};

module.exports = {
  formatSuccess,
  formatError,
  sendSuccess,
  sendError,
  apiResponse: (data = {}, message = 'Operation successful') => formatSuccess(data, message),
  ApiResponse: {
    success: (res, message = 'Operation successful', data = {}, statusCode = 200) => sendSuccess(res, data, message, statusCode),
    error: (res, message = 'Request failed', errors = {}, statusCode = 400, recoveryAction = null) => sendError(res, message, errors, statusCode, recoveryAction),
  },
};
