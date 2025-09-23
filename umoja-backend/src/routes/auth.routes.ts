import { Router } from 'express';
import { FirebaseAuthController } from '../controllers/firebase-auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();
const authController = new FirebaseAuthController();

// Public routes
router.post('/firebase-login', generalRateLimit, authController.loginWithFirebase);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/refresh', authenticateToken, authController.refreshToken);

export default router;