import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { prisma } from '../setup';

describe('AuthController', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    authController = new AuthController();
    
    // Set up routes
    app.post('/login', authController.login);
    app.post('/refresh', authController.refreshToken);
    app.post('/logout', authController.logout);
  });

  describe('POST /login', () => {
    it('should handle missing idToken', async () => {
      const response = await request(app)
        .post('/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Firebase ID token is required');
    });

    it('should handle invalid idToken', async () => {
      const response = await request(app)
        .post('/login')
        .send({ idToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /refresh', () => {
    it('should handle missing refresh token', async () => {
      const response = await request(app)
        .post('/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Refresh token is required');
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/logout')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });
});