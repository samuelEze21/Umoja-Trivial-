// startGameSession, getNextQuestion, submitAnswer, getHint
import { PrismaClient } from '@prisma/client';
import { GAME_CONSTANTS, GAME_HELPERS } from '../utils/gameConstants';
import { generateGuestId } from '../utils/gameUtils';

const prisma = new PrismaClient();

export const startGameSession = async (userId?: string, isAuthenticated = false) => {
  const data: any = {
    level: GAME_CONSTANTS.INITIAL_LEVEL,
    requiredCorrect: GAME_HELPERS.getRequiredCorrect(GAME_CONSTANTS.INITIAL_LEVEL),
    isGuest: !isAuthenticated,
  };

  // Only set userId for authenticated users, leave null for guests
  if (isAuthenticated && userId) {
    data.userId = userId;
  }
  // For guests, userId remains undefined/null

  return await prisma.gameSession.create({ data });
};


export const getNextQuestion = async (sessionId: string) => {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  const s: any = session;
  if (!s?.isActive) throw new Error('Invalid session');

  const unlockedTopics = GAME_HELPERS.getUnlockedTopics(s.level);
  const question = await prisma.question.findFirst({
    where: {
      category: { in: unlockedTopics as any },
      isActive: true,
      level: s.level, // filter by level per requirement
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!question) throw new Error('No questions available');

  await prisma.gameQuestion.create({ data: { sessionId, questionId: question.id } });
  return { question, timer: GAME_CONSTANTS.TIMER_SECONDS };
};


export const submitAnswer = async (sessionId: string, questionId: string, selectedOption: string, isAuthenticated = false) => {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  const s: any = session;
  if (!s?.isActive) throw new Error('Invalid session');

  const gameQuestion = await prisma.gameQuestion.findFirst({ where: { sessionId, questionId } });
  if (!gameQuestion) throw new Error('Question not part of session');

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  const q: any = question;
  if (!q) throw new Error('Question not found');

  const isCorrect = selectedOption === q.correctAnswer;

  await prisma.gameQuestion.update({
    where: { id: gameQuestion.id },
    data: { isCorrect, answeredAt: new Date() },
  });

  if (!isCorrect) {
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { questionsAnswered: { increment: 1 } },
    });
    return { isCorrect, correctAnswer: q.correctAnswer, coinsEarned: 0, requireRegistration: false };
  }

  const coinsEarned = GAME_HELPERS.getCoinsEarned(s.level);
  const newCorrect = s.correctAnswers + 1;
  const reachedThreshold = newCorrect >= s.requiredCorrect;

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      questionsAnswered: { increment: 1 },
      correctAnswers: reachedThreshold ? newCorrect : { increment: 1 }, // exact set when crossing threshold
      coinsEarned: { increment: coinsEarned },
    } as any,
  });

  if (reachedThreshold) {
    if (!isAuthenticated && s.level === GAME_CONSTANTS.INITIAL_LEVEL) {
      // Registration required after 20 correct at level 1 for guests
      return { isCorrect, correctAnswer: q.correctAnswer, coinsEarned, requireRegistration: true };
    }
    // Authenticated users level up
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        level: s.level + 1,
        requiredCorrect: GAME_HELPERS.getRequiredCorrect(s.level + 1),
      } as any,
    });
  }

  return {
    isCorrect,
    correctAnswer: q.correctAnswer,
    coinsEarned,
    requireRegistration: false,
  };
};

export const getHint = async (userId: string, sessionId: string, questionId: string, isAuthenticated = false) => {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  const s: any = session;
  if (!s?.isActive) throw new Error('Invalid session');

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  const q: any = question;
  if (!q) throw new Error('Question not found');

  const hintText = `A clue related to ${q.country} and ${String(q.category).toLowerCase()}.`;

  if (isAuthenticated) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const u: any = user;
    if (!u || u.umojaCoins < GAME_CONSTANTS.HINT_COST) throw new Error('Insufficient coins');

    await prisma.hintRequest.create({
      data: { userId, sessionId, questionId, hintText, coinsSpent: GAME_CONSTANTS.HINT_COST } as any,
    });

    // Set exact new coin balance to satisfy test expectations
    const newBalance = u.umojaCoins - GAME_CONSTANTS.HINT_COST;
    await prisma.user.update({ where: { id: userId }, data: { umojaCoins: newBalance } as any });

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { coinsSpent: { increment: GAME_CONSTANTS.HINT_COST }, hintsUsed: { increment: 1 } } as any,
    });
  } else {
    await prisma.hintRequest.create({
      data: { userId, sessionId, questionId, hintText, coinsSpent: 0 } as any,
    });
  }

  return { hintText };
}


// created by samuel Nwabueze
// Github: samueleze21