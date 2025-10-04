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
  let userController: UserController;
  let testUser: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    userController = new UserController();
    
    // Mock authentication middleware
    mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
      req.user = {
        userId: testUser?.id || 'test-user-id',
        phoneNumber: '+1234567890',
        role: 'PLAYER',
      };
      next();
    });

    // Set up routes
    app.get('/profile', mockAuthenticateToken, userController.getProfile);
    app.put('/profile', mockAuthenticateToken, userController.updateProfile);
    app.get('/progress', mockAuthenticateToken, userController.getProgress);
    app.get('/stats', mockAuthenticateToken, userController.getStats);
    app.delete('/profile', mockAuthenticateToken, userController.deleteProfile);

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

  describe('GET /profile', () => {
    it('should return user profile successfully', async () => {
      const response = await request(app)
        .get('/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.phoneNumber).toBe(testUser.phoneNumber);
    });

    it('should handle user not found error', async () => {
      // Mock user with non-existent ID
      mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
        req.user = {
          userId: 'non-existent-id',
          phoneNumber: '+1234567890',
          role: 'PLAYER',
        };
        next();
      });

      const response = await request(app)
        .get('/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put('/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(updateData.email);
    });

    it('should handle validation errors', async () => {
      const updateData = {
        phoneNumber: '', // Invalid phone number
      };

      const response = await request(app)
        .put('/profile')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /progress', () => {
    it('should return user progress successfully', async () => {
      // Create progress data
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          category: 'HISTORY',
          currentLevel: 5,
          experiencePoints: 150,
          questionsCorrect: 10,
          questionsTotal: 15,
          bestStreak: 3,
        },
      });

      const response = await request(app)
        .get('/progress')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('HISTORY');
    });
  });
});