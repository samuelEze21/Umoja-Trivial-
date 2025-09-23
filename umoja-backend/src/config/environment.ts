import dotenv from 'dotenv';

dotenv.config();

// Type to match jsonwebtoken's SignOptions.expiresIn
type JwtExpiresIn = number | string; // String must be like '24h', '7d'; no undefined for simplicity

interface JwtConfig {
  secret: string;
  expiresIn: JwtExpiresIn;
  refreshExpiresIn: JwtExpiresIn;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  } as JwtConfig,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    clientId: process.env.FIREBASE_CLIENT_ID || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

// Validate required environment variables
const requiredEnvVars = [
  { key: 'DATABASE_URL', value: config.databaseUrl },
  { key: 'JWT_SECRET', value: config.jwt.secret, warnOnly: true },
  { key: 'FIREBASE_PROJECT_ID', value: config.firebase.projectId },
  { key: 'FIREBASE_PRIVATE_KEY', value: config.firebase.privateKey },
  { key: 'FIREBASE_CLIENT_EMAIL', value: config.firebase.clientEmail },
];

for (const envVar of requiredEnvVars) {
  if (!envVar.value) {
    console.error(`❌ ${envVar.key} is required`);
    process.exit(1);
  }
  if (envVar.warnOnly && envVar.value === 'fallback-secret-change-in-production') {
    console.warn(`⚠️ Using fallback ${envVar.key}. Set ${envVar.key} in production!`);
  }
}

// Validate JWT expiresIn formats
const validateExpiresIn = (value: JwtExpiresIn, field: string): void => {
  if (typeof value === 'string' && !/^\d+[smhdwMy]$/.test(value)) {
    throw new Error(`Invalid ${field}: ${value}. Must be a number (seconds) or string like '24h', '7d'.`);
  }
  if (typeof value === 'number' && value <= 0) {
    throw new Error(`Invalid ${field}: ${value}. Must be a positive number of seconds.`);
  }
};

try {
  validateExpiresIn(config.jwt.expiresIn, 'JWT_EXPIRES_IN');
  validateExpiresIn(config.jwt.refreshExpiresIn, 'JWT_REFRESH_EXPIRES_IN');
} catch (error) {
  console.error('❌ Environment configuration error:', error);
  process.exit(1);
}

console.log('✅ Environment configuration loaded');
console.log(`📱 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${config.port}`);