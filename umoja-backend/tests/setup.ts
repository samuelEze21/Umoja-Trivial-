import { PrismaClient } from '@prisma/client';
import '@jest/globals';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Set NODE_ENV to test before loading any config
process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

// Mock essential environment variables
process.env.DATABASE_URL = 'mysql://root:@localhost:3306/umoja_trivia';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FIREBASE_PROJECT_ID = 'test-project-id';
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';

// Import the mocked prisma client
// The actual client is mocked in prisma.mock.ts which is loaded before this file

// No need to validate DATABASE_URL since we're using mocks
// This simplifies the test setup and avoids database connection issues

// The prisma object is already mocked in prisma.mock.ts
const prisma = new PrismaClient();

beforeAll(async () => {
  // No need to connect to database with mocks
  console.log('Using mocked Prisma client for tests');
  // Silence error logs during tests to reduce noise
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(async () => {
  // No real cleanup needed with mocks
  console.log('Test cleanup complete');
  // Ensure prisma disconnect is called to release any handles
  await prisma.$disconnect();
  // Restore all mocked console methods
  jest.restoreAllMocks();
});

beforeEach(async () => {
  // Reset mock data before each test
  await prisma.user.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.coinTransfer.deleteMany();
});

export { prisma };