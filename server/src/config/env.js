require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

const config = {
  nodeEnv,
  isTest,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT || 4000),
  // Tests must never touch the dev database.
  databaseUrl: isTest
    ? process.env.DATABASE_URL_TEST || 'postgresql://postgres:postgres@127.0.0.1:5432/church_attendance_test'
    : process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/church_attendance',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || (isTest ? 'test-access-secret' : ''),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (isTest ? 'test-refresh-secret' : ''),
  accessTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES || 15),
  // How long a device stays signed in without a password. This window SLIDES:
  // every successful refresh rotates the token and grants a full new window, so
  // an app that is opened at least once a month never asks for a password again.
  // 30 days suits the real cadence (weekly services, with holidays and off-weeks
  // in between) and installed PWAs, which are reopened long after a browser tab
  // would have been closed.
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
  cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true',
  // 'lax' for same-origin (Vercel monolith). Use 'none' only for split hosting.
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || (isTest ? 4 : 10)),
  // mNotify SMS gateway. Leave either value empty to run sends in dry-run mode.
  mnotify: {
    apiKey: process.env.MNOTIFY_API_KEY || '',
    senderId: process.env.MNOTIFY_SENDER_ID || '',
  },
};

if (config.isProd && (!config.jwtAccessSecret || !config.jwtRefreshSecret)) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required in production.');
}

module.exports = config;