/**
 * Production MongoDB Connection Handler via Mongoose
 * Architecture: Optimized Connection Pooling, Auto-Reconnect & Graceful Teardown
 */
const mongoose = require('mongoose');
const config = require('./env');

// Disable command buffering globally so Mongoose operations fail fast when disconnected
// instead of hanging for 10,000ms and throwing buffering timeouts
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: config.isProd ? 50 : 20, // 50 concurrent sockets in production cluster
      minPoolSize: config.isProd ? 10 : 2,  // Maintain warm pool
      serverSelectionTimeoutMS: 10000,                            // 10s for Atlas cloud replica set handshake
      socketTimeoutMS: 45000,               // Close sockets after 45 seconds of inactivity
      family: 4,                            // Force IPv4 to prevent IPv6 DNS lookup delays
      heartbeatFrequencyMS: 10000,          // Check replica set status every 10s
    };

    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB successfully connected to: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB connection re-established');
    });

    const conn = await mongoose.connect(config.mongodbUri, options);

    // Drop legacy non-session unique attendance indexes if present (multi-session uses {..., session: 1})
    try {
      const legacyAttendanceIndexes = [
        ['attendancerecords', 'student_1_date_1'],
        ['attendanceregisters', 'class_1_section_1_date_1'],
      ];
      for (const [colName, idxName] of legacyAttendanceIndexes) {
        const col = conn.connection.db.collection(colName);
        const exists = await col.indexExists(idxName).catch(() => false);
        if (exists) {
          await col.dropIndex(idxName);
          console.log(`[Database] Dropped legacy index ${colName}.${idxName}`);
        }
      }
    } catch (idxErr) {
      console.warn(`[Database] Legacy index check skipped: ${idxErr.message}`);
    }

    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    if (config.isProd && process.env.STRICT_DB === 'true') {
      console.error('[Database Fatal] Strict production mode enabled. Halting process.');
      process.exit(1);
    } else {
      console.warn('[Database] MongoDB connection unavailable or deferred. Portals and static endpoints remain active.');
    }
    return null;
  }
};

module.exports = connectDB;
