import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { FirebaseAuthService } from '../../src/services/firebase-auth.service';

describe('AuthController', () => {
  let app: express.Application;
  let server: any;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    authController = new AuthController();

    // Set up routes
    const router = express.Router();
    router.post('/login', authController.login);
    router.post('/refresh', authController.refreshToken);
    router.post('/logout', authController.logout);
    app.use('/api/auth', router);

    // Start a real HTTP server for Supertest and ensure sockets close
    server = app.listen();

    // Suppress noisy error logs during negative tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    // Close the HTTP server to avoid open handles
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => setImmediate(resolve));
  });

  describe('POST /api/auth/login', () => {
    it('should handle missing idToken', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .set('Connection', 'close')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Firebase ID token is required');
    });

    it('should handle invalid idToken', async () => {
      // Force the auth service to reject immediately to avoid any hangs
      jest
        .spyOn(FirebaseAuthService.prototype, 'loginOrCreateUser')
        .mockRejectedValue(new Error('Authentication failed'));

      const response = await request(server)
        .post('/api/auth/login')
        .set('Connection', 'close')
        .send({ idToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should handle missing refresh token', async () => {
      const response = await request(server)
        .post('/api/auth/refresh')
        .set('Connection', 'close')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Refresh token is required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(server)
        .post('/api/auth/logout')
        .set('Connection', 'close')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });
});