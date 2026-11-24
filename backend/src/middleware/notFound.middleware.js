/**
 * 404 Route Not Found Middleware
 * Serves school-branded Skeuomorphic 404 page for web navigation,
 * and standard JSON error response for API requests.
 */
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

const notFoundMiddleware = (req, res, next) => {
  const isApiRequest = req.originalUrl.startsWith('/api') || req.path.startsWith('/api');

  if (!isApiRequest && req.accepts('html')) {
    const html404Path = path.resolve(__dirname, '../../../frontend/404.html');
    if (fs.existsSync(html404Path)) {
      return res.status(404).sendFile(html404Path);
    }
  }

  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  next(ApiError.notFound(message, 'ROUTE_NOT_FOUND'));
};

module.exports = notFoundMiddleware;
