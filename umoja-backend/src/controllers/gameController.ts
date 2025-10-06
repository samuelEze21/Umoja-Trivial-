// startSession, getQuestion, submitAnswer, getHint
import { Response } from 'express';
import * as gameService from '../services/gameService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const startSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.body?.userId || req.user?.userId;
    const isAuthenticated = !!req.user;
    const session = await gameService.startGameSession(userId, isAuthenticated);
    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to start session' });
  }
};

export const getQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'sessionId is required' });
      return;
    }
    const { question, timer } = await gameService.getNextQuestion(sessionId);
    res.json({ success: true, data: { question, timer } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to retrieve question' });
  }
};

export const submitAnswer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, questionId, selectedOption } = req.body || {};
    if (!sessionId || !questionId || !selectedOption) {
      res.status(400).json({ success: false, error: 'sessionId, questionId, and selectedOption are required' });
      return;
    }
    const isAuthenticated = !!req.user;
    const result = await gameService.submitAnswer(sessionId, questionId, selectedOption, isAuthenticated);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to submit answer' });
  }
};

export const getHint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, sessionId, questionId } = req.body || {};
    if (!sessionId || !questionId) {
      res.status(400).json({ success: false, error: 'sessionId and questionId are required' });
      return;
    }
    const isAuthenticated = !!req.user;
    const effectiveUserId = isAuthenticated ? req.user!.userId : userId;
    const { hintText } = await gameService.getHint(effectiveUserId, sessionId, questionId, isAuthenticated);
    res.json({ success: true, data: { hintText } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to get hint' });
  }
};