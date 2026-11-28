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

app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(securityHeaders);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

try {
  const compression = require('compression');
  app.use(
    compression({
      level: 6,
      threshold: 1024,
    })
  );
} catch (e) {
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(sanitizeInput);

app.use(correlationMiddleware);
app.use(loggerMiddleware);

const path = require('path');
const fs = require('fs');
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');

app.use('/api/v1/health', healthRoutes);

app.use('/api', apiLimiter);

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

const { maintenanceMiddleware } = require('./middleware/maintenance.middleware');
app.use('/api/v1', maintenanceMiddleware, apiV1Router);

const erpModulesRouter = require('./modules');
app.use('/api/v1/modules', erpModulesRouter);

if (fs.existsSync(FRONTEND_DIR)) {
  app.use((req, res, next) => {
    const assetMatch = req.url.match(/^\/(?:public-website|management|teacher|platform-admin|administration-portal|faculty-portal|student|student-portal|parent|parent-portal|future-portals\/[^\/]+)\/(css|js|assets|downloads)\/(.*)$/);
    if (assetMatch) {
      req.url = `/${assetMatch[1]}/${assetMatch[2]}`;
    }
    next();
  });

  app.get(['/', '/public-website', '/index.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'public-website', 'index.html'));
  });

  app.get(['/login', '/login/', '/signin', '/signin/', '/portal-login'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'login.html'));
  });

  app.get(['/forgot-password', '/forgot-password/', '/reset-password', '/forgot-password.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'forgot-password.html'));
  });

  app.get(['/privacy', '/privacy/', '/privacy-policy', '/privacy.html', '/privacy-policy.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'privacy.html'));
  });

  app.get(['/terms', '/terms/', '/terms-and-conditions', '/terms.html', '/terms-and-conditions.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'terms.html'));
  });

  app.get(['/cookie-policy', '/cookie-policy/', '/cookies', '/cookie-policy.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'cookie-policy.html'));
  });

  app.get(['/fee-policy', '/fee-policy/', '/fee-terms', '/fee-policy.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'fee-policy.html'));
  });

  app.get(['/licenses', '/licenses/', '/open-source', '/licenses.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'licenses.html'));
  });

  app.get(['/404', '/404.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, '404.html'));
  });

  app.get(['/platform-admin', '/platform-admin/', '/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'platform-admin', 'index.html'));
  });

  app.get(['/management', '/management/', '/administration-portal', '/administration-portal/', '/portal.html', '/management.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'administration-portal', 'index.html'));
  });

  app.get(['/teacher', '/teacher/', '/faculty-portal', '/faculty-portal/', '/teacher-portal.html', '/teacher.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'faculty-portal', 'index.html'));
  });

  app.get(['/student', '/student/', '/student-portal', '/student-portal/', '/future-portals/student-portal'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'future-portals', 'student-portal', 'index.html'));
  });

  app.get(['/parent', '/parent/', '/parent-portal', '/parent-portal/', '/future-portals/parent-portal'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'future-portals', 'parent-portal', 'index.html'));
  });

  app.get(['/tc', '/transfer-certificate', '/transfer-certificate.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'transfer-certificate.html'));
  });

  app.get(['/merit-certificate', '/merit-certificate.html'], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'merit-certificate.html'));
  });

  app.get('/favicon.ico', (req, res) => {
    const icoPath = path.join(FRONTEND_DIR, 'assets', 'images', 'favicon.ico');
    const fallbackPath = path.join(FRONTEND_DIR, 'favicon.ico');
    res.sendFile(fs.existsSync(icoPath) ? icoPath : fallbackPath);
  });

  app.use('/images', express.static(path.join(FRONTEND_DIR, 'assets', 'images')));
  app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets')));

  app.use(express.static(FRONTEND_DIR));
}

app.use(notFoundMiddleware);

app.use(errorHandler);

module.exports = app;

