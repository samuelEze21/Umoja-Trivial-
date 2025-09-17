import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// Validate required environment variables
if (!config.databaseUrl) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

console.log('✅ Environment configuration loaded');
console.log(`📱 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${config.port}`);    