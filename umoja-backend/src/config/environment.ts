// Update src/config/environment.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};

// Validate required environment variables
if (!config.databaseUrl) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

if (!config.jwt.secret || config.jwt.secret === 'fallback-secret-change-in-production') {
  console.warn('⚠️  Using fallback JWT secret. Set JWT_SECRET in production!');
}

console.log('✅ Environment configuration loaded');
console.log(`📱 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${config.port}`);    