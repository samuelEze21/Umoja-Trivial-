import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const currentDir = __dirname;

const prisma = new PrismaClient();

// Question data structure with proper typing
interface QuestionData {
  category: string;
  country?: string; // Make country optional
  difficulty: number;
  level?: number; // Make level optional
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string; // Make explanation optional
  hint?: string; // Make hint optional
}

// Calculate hint cost based on difficulty
const getHintCost = (difficulty: number): number => {
  const costs = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  return costs[difficulty as keyof typeof costs] || 2;
};

// Map string values to Prisma enum values as strings
const mapCategory = (category: string): string => {
  if (!category) return 'CURRENT_AFFAIRS'; // Handle undefined category
  
  const normalizedCategory = category.toUpperCase().replace(/\s+/g, '_');
  
  switch (normalizedCategory) {
    case 'PLACES': return 'PLACES';
    case 'PEOPLE': return 'PEOPLE';
    case 'FOOD': return 'FOOD';
    case 'CULTURE': return 'CULTURE';
    case 'DRINKS': return 'DRINKS';
    case 'MUSIC': return 'MUSIC';
    case 'CURRENT_AFFAIRS': return 'CURRENT_AFFAIRS';
    case 'HISTORY': return 'CURRENT_AFFAIRS'; // Map HISTORY to CURRENT_AFFAIRS
    default: return 'CURRENT_AFFAIRS';
  }
};

const mapCountry = (country?: string): string => {
  if (!country) return 'NIGERIA'; // Handle undefined country
  
  const normalizedCountry = country?.toUpperCase().replace(/\s+/g, '_');
  
  switch (normalizedCountry) {
    case 'NIGERIA': return 'NIGERIA';
    case 'SOUTH_AFRICA': return 'SOUTH_AFRICA';
    case 'KENYA': return 'KENYA';
    case 'GHANA': return 'GHANA';
    case 'EGYPT': return 'EGYPT';
    default: return 'NIGERIA';
  }
};

const mapCorrectOption = (option: string): string => {
  if (!option) return 'A'; // Handle undefined option
  
  const normalizedOption = option.toUpperCase().trim();
  
  switch (normalizedOption) {
    case 'A': return 'A';
    case 'B': return 'B';
    case 'C': return 'C';
    case 'D': return 'D';
    default: return 'A';
  }
};

async function seedQuestions() {
  try {
    console.log('🌱 Starting question seeding...');

    // Try to load questions from questions.json, fall back to sample if needed
    const primaryPath = join(currentDir, 'questions.json');
    const fallbackPath = join(currentDir, 'questions.sample.json');
    
    let questionsPath;
    if (existsSync(primaryPath)) {
      questionsPath = primaryPath;
      console.log('📄 Using questions.json file');
    } else if (existsSync(fallbackPath)) {
      questionsPath = fallbackPath;
      console.log('📄 Using questions.sample.json file (questions.json not found)');
    } else {
      throw new Error('Neither questions.json nor questions.sample.json found in prisma directory');
    }

    // Parse questions data
    const rawQuestionsData: QuestionData[] = JSON.parse(
      readFileSync(questionsPath, 'utf8')
    );

    console.log(`📝 Found ${rawQuestionsData.length} questions to process`);

    // Validate and transform questions
    const validQuestions = rawQuestionsData.filter(q => 
      q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer
    );

    console.log(`✅ ${validQuestions.length} valid questions (${rawQuestionsData.length - validQuestions.length} invalid skipped)`);

    // Clear existing questions (optional - for fresh start)
    await prisma.question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    // Insert questions in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < validQuestions.length; i += batchSize) {
      const batch = validQuestions.slice(i, i + batchSize);
      
      const questionsToInsert = batch.map(q => {
        // Map the category, country, and correctAnswer
        const mappedCategory = mapCategory(q.category);
        const mappedCountry = mapCountry(q.country);
        const mappedCorrectAnswer = mapCorrectOption(q.correctAnswer);
        
        return {
          category: mappedCategory,
          country: mappedCountry,
          difficulty: q.difficulty || 1,
          level: q.level || 1,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: mappedCorrectAnswer,
          explanation: q.explanation || '',
          hint: q.hint || '',
          hintCost: getHintCost(q.difficulty || 1),
          createdBy: 'SYSTEM',
          isActive: true,
        };
      });

      await prisma.question.createMany({
        data: questionsToInsert,
        skipDuplicates: true,
      });

      inserted += batch.length;
      console.log(`📝 Inserted ${inserted}/${validQuestions.length} questions`);
    }

    // Verify insertion
    const totalQuestions = await prisma.question.count();
    
    // Get category distribution using a simpler approach
    const categoryDistribution = await prisma.$queryRaw`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category
    `;
    
    console.log('');
    console.log('✅ Question seeding completed!');
    console.log(`📊 Total questions in database: ${totalQuestions}`);
    console.log('📊 Category distribution:', categoryDistribution);

  } catch (error) {
    console.error('❌ Question seeding failed:', error);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedQuestions();