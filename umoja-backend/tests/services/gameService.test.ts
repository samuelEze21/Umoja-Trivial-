// fix import paths and mocks
import { prisma } from '../setup';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import * as gameService from '../../src/services/gameService';
import * as gameUtils from '../../src/utils/gameUtils';
import { GAME_CONSTANTS } from '../../src/utils/gameConstants';

jest.mock('@prisma/client');
jest.mock('../../src/utils/gameUtils');

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Game Service', () => {
  const mockSession = { id: 'session1', userId: 'guest_123', level: 1, requiredCorrect: 20, isGuest: true, isActive: true };
  const mockQuestion = {
    id: 'q1',
    category: 'PLACES',
    country: 'NIGERIA',
    difficulty: 1,
    level: 1,
    questionText: 'What is the capital?',
    optionA: 'Lagos',
    optionB: 'Abuja',
    optionC: 'Kano',
    optionD: 'Ibadan',
    correctAnswer: 'B',
    explanation: 'Explanation',
    hint: 'Hint',
    isActive: true,
  };
  const mockUser = { id: 'user1', umojaCoins: 100 };

  beforeEach(() => {
    (prisma.gameSession.create as any).mockResolvedValue(mockSession);
    (prisma.gameSession.findUnique as any).mockResolvedValue(mockSession);
    (prisma.question.findFirst as any).mockResolvedValue(mockQuestion);
    (prisma.question.findUnique as any).mockResolvedValue(mockQuestion);
    (prisma.gameQuestion.create as any).mockResolvedValue({});
    (prisma.gameQuestion.findFirst as any).mockResolvedValue({ id: 'gq1', sessionId: 'session1', questionId: 'q1' });
    (prisma.gameQuestion.update as any).mockResolvedValue({});
    (prisma.gameSession.update as any).mockResolvedValue(mockSession);
    (prisma.hintRequest.create as any).mockResolvedValue({});
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.user.update as any).mockResolvedValue({ ...mockUser, umojaCoins: 98 });
    (gameUtils.generateGuestId as jest.Mock).mockReturnValue('guest_123');
  });

  it('should start a game session for guest', async () => {
    const session: any = await gameService.startGameSession(undefined, false);
    expect(session.userId).toContain('guest_');
    expect(session.level).toBe(GAME_CONSTANTS.INITIAL_LEVEL);
    expect(prisma.gameSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: expect.stringContaining('guest_'), level: 1, requiredCorrect: 20, isGuest: true }),
    });
  });

  it('should start a game session for authenticated user', async () => {
    (prisma.gameSession.create as any).mockResolvedValue({ ...mockSession, userId: 'user1', isGuest: false });
    const session: any = await gameService.startGameSession('user1', true);
    expect(session.userId).toBe('user1');
    expect(session.isGuest).toBe(false);
    expect(prisma.gameSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user1', level: 1, requiredCorrect: 20, isGuest: false }),
    });
  });

  it('should get next question for session', async () => {
    const { question, timer } = await gameService.getNextQuestion('session1');
    expect(question).toEqual(mockQuestion);
    expect(timer).toBe(GAME_CONSTANTS.TIMER_SECONDS);
    expect(prisma.gameQuestion.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ sessionId: 'session1', questionId: 'q1' }) }));
  });

  it('should submit correct answer for guest', async () => {
    const result = await gameService.submitAnswer('session1', 'q1', 'B', false);
    expect(result.isCorrect).toBe(true);
    expect(result.coinsEarned).toBe(1);
    expect(result.requireRegistration).toBe(false); // Before 20 correct
    expect(prisma.gameSession.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ correctAnswers: { increment: 1 }, coinsEarned: { increment: 1 } }),
    }));
  });

  it('should require registration after 20 correct answers for guest', async () => {
    (prisma.gameSession.findUnique as any).mockResolvedValue({ ...mockSession, correctAnswers: 19 });
    const result = await gameService.submitAnswer('session1', 'q1', 'B', false);
    expect(result.requireRegistration).toBe(true);
    expect(prisma.gameSession.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ correctAnswers: 20 }),
    }));
  });

  it('should submit correct answer and level up for authenticated user', async () => {
    (prisma.gameSession.findUnique as any).mockResolvedValue({ ...mockSession, correctAnswers: 19 });
    const result = await gameService.submitAnswer('session1', 'q1', 'B', true);
    expect(result.isCorrect).toBe(true);
    expect(result.coinsEarned).toBe(1);
    expect(result.requireRegistration).toBe(false);
    expect(prisma.gameSession.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ level: 2, requiredCorrect: 25 }),
    }));
  });

  it('should get hint for guest (no coin deduction)', async () => {
    const { hintText } = await gameService.getHint('guest_123', 'session1', 'q1', false);
    expect(hintText).toContain('clue');
    expect(prisma.hintRequest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'guest_123', coinsSpent: 0 }) }));
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should get hint for authenticated user with coin deduction', async () => {
    const { hintText } = await gameService.getHint('user1', 'session1', 'q1', true);
    expect(hintText).toContain('clue');
    expect(prisma.hintRequest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user1', coinsSpent: 2 }) }));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { umojaCoins: 98 } }));
  });
});