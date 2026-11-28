const ApiError = require('../utils/apiError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const fieldLabel = rules.label || field;

      if (rules.required) {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = `${fieldLabel} is required`;
          continue;
        }
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${fieldLabel} must be of type ${rules.type}`;
        continue;
      }

      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors[field] = `${fieldLabel} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] = `${fieldLabel} cannot exceed ${rules.maxLength} characters`;
        }
      }

      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors[field] = `${fieldLabel} must be at least ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
          errors[field] = `${fieldLabel} cannot exceed ${rules.max}`;
        }
      }

      if (rules.isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field] = `${fieldLabel} must be a valid email address`;
        }
      }

      if (rules.enum && Array.isArray(rules.enum)) {
        if (!rules.enum.includes(value)) {
          errors[field] = `${fieldLabel} must be one of: [${rules.enum.join(', ')}]`;
        }
      }

      if (typeof rules.custom === 'function') {
        const customResult = rules.custom(value, req);
        if (customResult !== true && typeof customResult === 'string') {
          errors[field] = customResult;
        } else if (customResult === false) {
          errors[field] = `${fieldLabel} failed validation`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw ApiError.validation(errors, 'Validation error occurred');
    }

    next();
  };
};

module.exports = validate;
