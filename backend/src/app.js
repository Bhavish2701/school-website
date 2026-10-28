/**
 * Express Application Configuration and Middleware Pipeline
 * Production Architecture: Cloudflare -> Nginx -> Express API Cluster
 */
const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const { securityHeaders, sanitizeInput } = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const correlationMiddleware = require('./middleware/correlation.middleware');
const loggerMiddleware = require('./middleware/logger.middleware');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const { formatSuccess } = require('./utils/apiResponse');
const apiV1Router = require('./routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Enable Trust Proxy for Cloudflare / Nginx reverse proxy headers (X-Forwarded-For, CF-Connecting-IP)
app.set('trust proxy', 1);

// Disable Express advertising header
app.disable('x-powered-by');

// 1. Security HTTP headers via Helmet
app.use(securityHeaders);

// 2. CORS middleware
app.use(cors(corsOptions));

// 3. Compression middleware (if available)
try {
  const compression = require('compression');
  app.use(
    compression({
      level: 6,
      threshold: 1024, // only compress responses above 1KB
    })
  );
} catch (e) {
  // Compression falls back cleanly to Nginx Gzip reverse proxy
}

// 4. Request Body Parsers (Limited to 1MB to prevent memory exhaustion DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. Recursive NoSQL Injection input sanitization
app.use(sanitizeInput);

// 6. Correlation ID & Structured Request Logging
app.use(correlationMiddleware);
app.use(loggerMiddleware);

const path = require('path');
const fs = require('fs');
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');

// 7. Health Check Probes (Bypasses rate limiting for Docker/Nginx/K8s uptime monitors)
app.use('/api/v1/health', healthRoutes);

// 8. Global API Rate Limiting (Applied specifically to API endpoints)
app.use('/api', apiLimiter);

// 9. API Information Landing Endpoint
app.get(['/api', '/api/v1'], (req, res) => {
  res.status(200).json(
    formatSuccess(
      {
        name: 'Sri Vidya E.M High School Production API',
        version: '1.0.0',
        apiVersion: '/api/v1',
        healthCheck: '/api/v1/health',
      },
      'Welcome to Sri Vidya E.M High School REST API'
    )
  );
});

// 10. Mount Version 1 Core APIs
app.use('/api/v1', apiV1Router);

// 10b. Mount Modular ERP Domain Subsystems (/api/v1/modules/*)
const erpModulesRouter = require('./modules');
app.use('/api/v1/modules', erpModulesRouter);

// 11. Serve Frontend Portals and Static Assets (Unified on Port 5000)
if (fs.existsSync(FRONTEND_DIR)) {
  // Strip sub-portal prefixes when requesting static assets (css, js, assets, downloads)
  app.use((req, res, next) => {
    const assetMatch = req.url.match(/^\/(?:public-website|management|teacher|platform-admin|administration-portal|faculty-portal|student|student-portal|parent|parent-portal|future-portals\/[^\/]+)\/(css|js|assets|downloads)\/(.*)$/);
    if (assetMatch) {
      req.url = `/${assetMatch[1]}/${assetMatch[2]}`;
    }
    next();
  });

  // Clean ERP Portal Routes
  app.get(['/', '/public-website', '/index.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'public-website', 'index.html'));
  });

  app.get(['/platform-admin', '/admin'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'platform-admin', 'index.html'));
  });

  app.get(['/management', '/administration-portal', '/portal.html', '/management.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'administration-portal', 'index.html'));
  });

  app.get(['/teacher', '/faculty-portal', '/teacher-portal.html', '/teacher.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'faculty-portal', 'index.html'));
  });

  app.get(['/student', '/student-portal', '/future-portals/student-portal'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'future-portals', 'student-portal', 'index.html'));
  });

  app.get(['/parent', '/parent-portal', '/future-portals/parent-portal'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'future-portals', 'parent-portal', 'index.html'));
  });

  app.get(['/tc', '/transfer-certificate', '/transfer-certificate.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'transfer-certificate.html'));
  });

  app.get(['/merit-certificate', '/merit-certificate.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'merit-certificate.html'));
  });

  // Direct favicon handler
  app.get('/favicon.ico', (req, res) => {
    const icoPath = path.join(FRONTEND_DIR, 'assets', 'images', 'favicon.ico');
    const fallbackPath = path.join(FRONTEND_DIR, 'favicon.ico');
    res.sendFile(fs.existsSync(icoPath) ? icoPath : fallbackPath);
  });

  // Aliases for images and assets
  app.use('/images', express.static(path.join(FRONTEND_DIR, 'assets', 'images')));
  app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets')));

  // Serve static assets from frontend
  app.use(express.static(FRONTEND_DIR));
}

// 12. Catch 404 for undefined routes
app.use(notFoundMiddleware);

// 13. Centralized Production Error Handler
app.use(errorHandler);

module.exports = app;

