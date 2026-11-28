process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/srividya_school_test_db';
process.env.JWT_SECRET = 'test_jwt_secret_key_srividya_2026';
process.env.JWT_EXPIRE = '1h';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_srividya_2026';
process.env.JWT_REFRESH_EXPIRE = '7d';

const mongoose = require('mongoose');

jest.setTimeout(30000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
