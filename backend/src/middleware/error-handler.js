/**
 * Centralized Error Handler Middleware
 * Normalizes all exceptions into uniform standard JSON responses
 */
const errorHandler = require('./error.middleware');

module.exports = errorHandler;
