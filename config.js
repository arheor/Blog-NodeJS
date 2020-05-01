const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname);
dotenv.config({ path: root('.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  // REDIS_IP: '192.168.1.200',
  // REDIS_PORT: '6379',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
