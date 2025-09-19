import { PrismaClient, QuestionCategory, AfricanCountry, CorrectOption } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Question data structure
interface QuestionData {
  category: QuestionCategory;
  country: AfricanCountry;
  difficulty: number;
  level: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: CorrectOption;
  explanation: string;
  hint: string;
}

// Calculate hint cost based on difficulty
const getHintCost = (difficulty: number): number => {
  const costs = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  return costs[difficulty as keyof typeof costs] || 2;
};

async function seedQuestions() {
  try {
    console.log('🌱 Starting question seeding...');

    // Load questions from JSON file (updated to prisma directory)
    const questionsPath = join(__dirname, 'questions.json'); 
    const questionsData: QuestionData[] = JSON.parse(
      readFileSync(questionsPath, 'utf8')
    );

    console.log(`📝 Found ${questionsData.length} questions to seed`);

    // Clear existing questions (optional - for fresh start)
    await prisma.question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    // Insert questions in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < questionsData.length; i += batchSize) {
      const batch = questionsData.slice(i, i + batchSize);
      
      const questionsToInsert = batch.map(q => ({
        ...q,
        hintCost: getHintCost(q.difficulty),
        createdBy: 'SYSTEM',
        isActive: true,
      }));

      await prisma.question.createMany({
        data: questionsToInsert,
        skipDuplicates: true,
      });

      inserted += batch.length;
      console.log(`📝 Inserted ${inserted}/${questionsData.length} questions`);
    }

    // Verify insertion
    const totalQuestions = await prisma.question.count();
    const questionsByCategory = await prisma.question.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    console.log('');
    console.log('✅ Question seeding completed!');
    console.log(`📊 Total questions in database: ${totalQuestions}`);
    console.log('📊 Questions by category:');
    questionsByCategory.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.id} questions`);
    });

  } catch (error) {
    console.error('❌ Question seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();