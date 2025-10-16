import { Request, Response } from "express";
import { PrismaClient, QuestionCategory } from "@prisma/client";

const prisma = new PrismaClient();

export const getLevelQuestions = async (req: Request, res: Response) => {
  try {
    const level = Number(req.query.level || req.params.level || 1);
    const categories = level === 1 
      ? [QuestionCategory.FOOD, QuestionCategory.PLACES, QuestionCategory.PEOPLE] 
      : [QuestionCategory.FOOD, QuestionCategory.PLACES, QuestionCategory.PEOPLE, QuestionCategory.CULTURE, QuestionCategory.DRINKS, QuestionCategory.MUSIC];
    const count = 20 + (level - 1) * 5;

    const pool = await prisma.question.findMany({
      where: { category: { in: categories }, level: level, isActive: true },
      take: 200,
      orderBy: { createdAt: 'asc' },
    });

    if (!pool || pool.length === 0) return res.status(404).json({ error: 'No questions found' });

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));

    const payload = shuffled.map(q => ({
      id: q.id,
      category: q.category,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      hint: q.hint,
    }));

    return res.json({ level, duration: 15, topics: categories, questions: payload });
  } catch (err) {
    console.error("getLevelQuestions error", err);
    return res.status(500).json({ error: 'Failed to get questions' });
  }
};


// created by samuel Nwabueze
// Github: samueleze21