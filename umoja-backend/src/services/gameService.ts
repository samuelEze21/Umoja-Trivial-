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
  
  // For Level 1, check if we've already asked 20 questions
  if (s.level === 1 && s.questionsAnswered >= 20) {
    throw new Error('Level 1 is limited to 20 questions');
  }

  // Get questions already asked in this session
  const askedQuestions = await prisma.gameQuestion.findMany({
    where: { sessionId },
    select: { questionId: true }
  });
  const askedQuestionIds = askedQuestions.map(gq => gq.questionId);

  const unlockedTopics = GAME_HELPERS.getUnlockedTopics(s.level);
  
  // Find questions that haven't been asked yet in this session
  const availableQuestions = await prisma.question.findMany({
    where: {
      category: { in: unlockedTopics as any },
      isActive: true,
      level: { lte: s.level }, // Cumulative access: level <= current level
      id: { notIn: askedQuestionIds }, // Exclude already asked questions
    },
  });

  if (!availableQuestions || availableQuestions.length === 0) {
    throw new Error('No more questions available for this session');
  }

  // Randomly select a question from available questions
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];

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
    const newTotalQuestions = s.questionsAnswered + 1;
    
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { questionsAnswered: { increment: 1 } },
    });
    
    // Check if Level 1 should complete after 20 total questions (even with wrong answer)
    const shouldComplete = s.level === 1 && newTotalQuestions >= 20;
    
    return { 
      isCorrect, 
      correctAnswer: q.correctAnswer, 
      coinsEarned: 0, 
      requireRegistration: shouldComplete && !isAuthenticated,
      levelComplete: shouldComplete
    };
  }

  const coinsEarned = GAME_HELPERS.getCoinsEarned(s.level);
  const newCorrect = s.correctAnswers + 1;
  const newTotalQuestions = s.questionsAnswered + 1;
  
  // For Level 1: complete after 20 total questions
  // For other levels: complete after reaching required correct answers
  const reachedThreshold = s.level === 1 
    ? newTotalQuestions >= 20 
    : newCorrect >= s.requiredCorrect;

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
      // Registration required after completion of level 1 for guests
      return { isCorrect, correctAnswer: q.correctAnswer, coinsEarned, requireRegistration: true, levelComplete: true };
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
    levelComplete: reachedThreshold,
  };
};

export const getHint = async (userId: string, sessionId: string, questionId: string, isAuthenticated = false) => {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  const s: any = session;
  if (!s?.isActive) throw new Error('Invalid session');

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  const q: any = question;
  if (!q) throw new Error('Question not found');

  // Use the actual hint from the question database
  const hintText = q.hint || `A clue related to ${q.country} and ${String(q.category).toLowerCase()}.`;

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

export const getSessionResults = async (sessionId: string) => {
  const session = await prisma.gameSession.findUnique({ 
    where: { id: sessionId },
    include: {
      gameQuestions: {
        include: {
          question: true
        }
      }
    }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const s: any = session;
  
  // Calculate statistics
  const totalQuestions = s.questionsAnswered;
  const correctAnswers = s.correctAnswers;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const completion = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const gamePoints = s.coinsEarned;
  
  // For Level 1, we expect 20 questions, so skipped = 20 - totalQuestions
  const expectedQuestions = s.level === 1 ? 20 : s.requiredCorrect;
  const skipped = Math.max(0, expectedQuestions - totalQuestions);

  return {
    sessionId: s.id,
    level: s.level,
    correctAnswers,
    totalQuestions,
    incorrectAnswers,
    completion,
    skipped,
    gamePoints,
    coinsEarned: s.coinsEarned,
    coinsSpent: s.coinsSpent,
    hintsUsed: s.hintsUsed,
    currentStreak: s.currentStreak,
    maxStreak: s.maxStreak,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    isActive: s.isActive,
    isGuest: s.isGuest
  };
}


// created by samuel Nwabueze
// Github: samueleze21