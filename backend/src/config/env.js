const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongodbUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
if (!mongodbUri) {
  throw new Error('[Config] MONGODB_URI is required and must point to MongoDB Atlas.');
}
if (/^(mongodb(\+srv)?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/i.test(mongodbUri) || /@(localhost|127\.0\.0\.1)(:|\/|$)/i.test(mongodbUri)) {
  throw new Error('[Config] Local MongoDB (localhost / 127.0.0.1) is disabled. Configure MONGODB_URI for MongoDB Atlas.');
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  mongodbUri,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5000,http://127.0.0.1:5000,http://localhost:8080,https://school-website-root-nex.vercel.app')
    .split(',')
    .map(origin => origin.trim()),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_fallback_secret_key_2026',
    expire: process.env.JWT_EXPIRE || '2h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_fallback_secret_2026',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  paymentSecret: process.env.PAYMENT_SECRET || 'srividya_payment_gateway_hmac_secret_2026',
};

module.exports = config;
