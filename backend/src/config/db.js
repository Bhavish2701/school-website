const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: config.isProd ? 50 : 20,
      minPoolSize: config.isProd ? 10 : 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      heartbeatFrequencyMS: 10000,
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

    if (!config.mongodbUri || /@(localhost|127\.0\.0\.1)(:|\/|$)/i.test(config.mongodbUri)) {
      throw new Error('MongoDB Atlas MONGODB_URI is required; local MongoDB connections are disabled.');
    }

    const conn = await mongoose.connect(config.mongodbUri, options);

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
