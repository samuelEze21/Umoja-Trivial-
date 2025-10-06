import { Router } from 'express';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware';
import { gameRateLimit } from '../middleware/rateLimit.middleware';
import * as gameController from '../controllers/gameController';

const router = Router();

// Start a session (guest or authenticated)
router.post('/session', optionalAuth, gameRateLimit, gameController.startSession);

// Get next question for a session
router.get('/session/:sessionId/question', optionalAuth, gameRateLimit, gameController.getQuestion);

// Submit answer for a question in a session
router.post('/answer', optionalAuth, gameRateLimit, gameController.submitAnswer);

// Get a hint for a question (requires coins if authenticated)
router.post('/hint', optionalAuth, gameRateLimit, gameController.getHint);

export default router;