import request from 'supertest';
import express from 'express';
import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { authenticateToken } from '../../src/middleware/auth.middleware';
import { prisma } from '../setup';

// Mock the auth middleware
jest.mock('../../src/middleware/auth.middleware');
const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

describe('UserController', () => {
  let app: express.Application;
  let server: any;
  let userController: UserController;
  let testUser: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    userController = new UserController();

    // Mock authentication middleware (sync to avoid lingering microtasks)
    mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
      req.user = {
        userId: testUser?.id || 'test-user-id',
        phoneNumber: '+1234567890',
        role: 'PLAYER',
      };
      next();
    });

    // Set up routes
    const router = express.Router();
    router.get('/profile', mockAuthenticateToken, userController.getProfile);
    router.put('/profile', mockAuthenticateToken, userController.updateProfile);
    router.get('/progress', mockAuthenticateToken, userController.getProgress);
    router.get('/stats', mockAuthenticateToken, userController.getStats);
    router.delete('/profile', mockAuthenticateToken, userController.deleteProfile);
    app.use('/api/users', router);

    // Start a real HTTP server for Supertest
    server = app.listen();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        phoneNumber: '+1234567890',
        email: 'test@example.com',
        isVerified: true,
        role: 'PLAYER',
        umojaCoins: 100,
      } as any,
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    // Close server to ensure all sockets/handles are released
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => setImmediate(resolve));
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request(server)
        .get('/api/users/profile')
        .set('Connection', 'close')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.phoneNumber).toBe(testUser.phoneNumber);
    });

    it('should handle user not found error', async () => {
      // Mock user with non-existent ID (sync)
      mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
        req.user = {
          userId: 'non-existent-id',
          phoneNumber: '+1234567890',
          role: 'PLAYER',
        };
        next();
      });

      const response = await request(server)
        .get('/api/users/profile')
        .set('Connection', 'close')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        email: 'updated@example.com',
      };

      const response = await request(server)
        .put('/api/users/profile')
        .set('Connection', 'close')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(updateData.email);
    });

    it('should handle validation errors', async () => {
      const updateData = {
        phoneNumber: '', // Invalid phone number
      };

      const response = await request(server)
        .put('/api/users/profile')
        .set('Connection', 'close')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/progress', () => {
    it('should return user progress successfully', async () => {
      // Create progress data
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          category: 'HISTORY' as any,
          currentLevel: 5,
          experiencePoints: 150,
          questionsCorrect: 10,
          questionsTotal: 15,
          bestStreak: 3,
        },
      });

      const response = await request(server)
        .get('/api/users/progress')
        .set('Connection', 'close')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('HISTORY');
    });
  });

  afterAll(async () => {
    // Final microtask drain to ensure all handles are closed
    await new Promise((resolve) => setImmediate(resolve));
  });
});