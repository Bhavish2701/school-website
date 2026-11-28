const helmet = require('helmet');

const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = helmet({
  contentSecurityPolicy: isProd
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
          styleSrcAttr: ["'unsafe-inline'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
          frameAncestors: ["'self'"],
          objectSrc: ["'none'"],
        },
      }
    : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: isProd
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

const sanitizeData = (target) => {
  if (target && typeof target === 'object') {
    Object.keys(target).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete target[key];
      } else if (typeof target[key] === 'object' && target[key] !== null) {
        sanitizeData(target[key]);
      }
    });
  }
};

const sanitizeInput = (req, res, next) => {
  if (req.body) sanitizeData(req.body);
  if (req.params) sanitizeData(req.params);
  if (req.query) sanitizeData(req.query);
  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput,
};
