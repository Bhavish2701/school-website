const config = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.isDev) {
      return callback(null, true);
    }

    if (config.corsOrigins.includes('*')) {
      return callback(null, true);
    }

    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

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
