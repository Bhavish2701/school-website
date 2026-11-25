/**
 * CORS Configuration
 */
const config = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin || config.isDev) {
      return callback(null, true);
    }

    // If wildcard '*' is in configured origins, reflect requesting origin
    if (config.corsOrigins.includes('*')) {
      return callback(null, true);
    }

    // Check exact match in configured origins
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployment domains (production, preview, branch deploys)
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow all Render deployment domains
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Allow local development and test origins
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Custom institutional domain support
    if (
      /^https:\/\/([a-zA-Z0-9_-]+\.)?srividyaschool\.edu\.in$/.test(origin) ||
      /^https:\/\/([a-zA-Z0-9_-]+\.)?srividya\.edu\.in$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
};

module.exports = corsOptions;
