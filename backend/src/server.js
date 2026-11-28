const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const seedUsers = require('./config/seed');
const mongoose = require('mongoose');

const startServer = async () => {
  const conn = await connectDB();

  if (conn && mongoose.connection.readyState === 1) {
    await seedUsers();
  }

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log('  SRI VIDYA ERP - UNIFIED FULL-STACK SERVER (PORT 5000)');
    console.log('====================================================');
    console.log(`  Public Website   : http://localhost:${config.port}/`);
    console.log(`  Platform Admin   : http://localhost:${config.port}/platform-admin`);
    console.log(`  Admin Portal     : http://localhost:${config.port}/management`);
    console.log(`  Faculty Portal   : http://localhost:${config.port}/teacher`);
    console.log(`  Student Portal   : http://localhost:${config.port}/student`);
    console.log(`  Parent Portal    : http://localhost:${config.port}/parent`);
    console.log(`  API Health Check : http://localhost:${config.port}/api/v1/health`);
    console.log('====================================================');
  });

  process.on('unhandledRejection', (err) => {
    console.error('[Process Error] Unhandled Rejection:', err.message);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (err) => {
    console.error('[Process Error] Uncaught Exception:', err.message);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`\n[Process] Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        console.log('[Process] HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
