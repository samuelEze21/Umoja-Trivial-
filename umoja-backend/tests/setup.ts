import { PrismaClient } from '@prisma/client';
import '@jest/globals';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Import the mocked prisma client
// The actual client is mocked in prisma.mock.ts which is loaded before this file

// No need to validate DATABASE_URL since we're using mocks
// This simplifies the test setup and avoids database connection issues

// The prisma object is already mocked in prisma.mock.ts
const prisma = new PrismaClient();

beforeAll(async () => {
  // No need to connect to database with mocks
  console.log('Using mocked Prisma client for tests');
});

afterAll(async () => {
  // No real cleanup needed with mocks
  console.log('Test cleanup complete');
});

beforeEach(async () => {
  // Reset mock data before each test
  await prisma.user.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.coinTransfer.deleteMany();
});

export { prisma };