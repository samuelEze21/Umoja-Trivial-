import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Question data structure with proper typing
interface QuestionData {
  category: string;
  country?: string;
  difficulty: number;
  level?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  hint?: string;
}

// Fallback questions for production if no JSON file is available
const FALLBACK_QUESTIONS: QuestionData[] = [
  {
    category: 'CURRENT_AFFAIRS',
    country: 'NIGERIA',
    difficulty: 1,
    level: 1,
    questionText: 'What is the capital city of Nigeria?',
    optionA: 'Lagos',
    optionB: 'Abuja',
    optionC: 'Kano',
    optionD: 'Port Harcourt',
    correctAnswer: 'B',
    explanation: 'Abuja became the capital of Nigeria in 1991, replacing Lagos.',
    hint: 'This city was specifically built to be the capital in the center of the country.'
  },
  {
    category: 'PLACES',
    country: 'KENYA',
    difficulty: 1,
    level: 2,
    questionText: 'Which mountain is the highest peak in Africa?',
    optionA: 'Mount Kenya',
    optionB: 'Mount Kilimanjaro',
    optionC: 'Mount Elgon',
    optionD: 'Drakensberg',
    correctAnswer: 'B',
    explanation: 'Mount Kilimanjaro in Tanzania is the highest peak in Africa at 5,895 meters.',
    hint: 'This mountain is located in Tanzania and is famous for its snow-capped peak.'
  },
  {
    category: 'CULTURE',
    country: 'SOUTH_AFRICA',
    difficulty: 2,
    level: 3,
    questionText: 'How many official languages does South Africa have?',
    optionA: '9',
    optionB: '11',
    optionC: '13',
    optionD: '15',
    correctAnswer: 'B',
    explanation: 'South Africa has 11 official languages, making it one of the most linguistically diverse countries.',
    hint: 'It\'s more than 10 but less than 12.'
  },
  {
    category: 'PEOPLE',
    country: 'GHANA',
    difficulty: 2,
    level: 4,
    questionText: 'Who was the first President of Ghana?',
    optionA: 'Jerry Rawlings',
    optionB: 'Kwame Nkrumah',
    optionC: 'John Kufuor',
    optionD: 'Kofi Busia',
    correctAnswer: 'B',
    explanation: 'Kwame Nkrumah led Ghana to independence and became its first President in 1960.',
    hint: 'He was a key figure in the Pan-African movement and Ghana\'s independence.'
  },
  {
    category: 'FOOD',
    country: 'NIGERIA',
    difficulty: 1,
    level: 5,
    questionText: 'What is the main ingredient in Nigerian Jollof rice?',
    optionA: 'Coconut milk',
    optionB: 'Tomato paste',
    optionC: 'Palm oil',
    optionD: 'Groundnut oil',
    correctAnswer: 'B',
    explanation: 'Tomato paste gives Jollof rice its characteristic red color and rich flavor.',
    hint: 'This ingredient gives the rice its distinctive red color.'
  }
];

// Category mapping function
const mapCategory = (category: string) => {
  switch (category.toUpperCase()) {
    case 'PLACES': return 'PLACES';
    case 'PEOPLE': return 'PEOPLE';
    case 'FOOD': return 'FOOD';
    case 'CULTURE': return 'CULTURE';
    case 'DRINKS': return 'DRINKS';
    case 'MUSIC': return 'MUSIC';
    case 'CURRENT_AFFAIRS': return 'CURRENT_AFFAIRS';
    case 'HISTORY': return 'CURRENT_AFFAIRS';
    default: return 'CURRENT_AFFAIRS';
  }
};

// Country mapping function
const mapCountry = (country: string) => {
  switch (country?.toUpperCase()) {
    case 'NIGERIA': return 'NIGERIA';
    case 'SOUTH_AFRICA': return 'SOUTH_AFRICA';
    case 'KENYA': return 'KENYA';
    case 'GHANA': return 'GHANA';
    case 'EGYPT': return 'EGYPT';
    default: return 'NIGERIA';
  }
};

// Correct answer mapping
const mapCorrectAnswer = (answer: string) => {
  switch (answer?.toUpperCase()) {
    case 'A': return 'A';
    case 'B': return 'B';
    case 'C': return 'C';
    case 'D': return 'D';
    default: return 'A';
  }
};

async function loadQuestions(): Promise<QuestionData[]> {
  const currentDir = __dirname;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Try to load from JSON files
  const possiblePaths = [
    join(currentDir, 'questions.json'),
    join(currentDir, '..', 'prisma', 'questions.json'),
    join(currentDir, 'questions.sample.json'),
    join(currentDir, '..', 'prisma', 'questions.sample.json'),
    join(process.cwd(), 'prisma', 'questions.json'),
    join(process.cwd(), 'prisma', 'questions.sample.json')
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      try {
        console.log(`📄 Loading questions from: ${path}`);
        const rawData = readFileSync(path, 'utf8');
        const questions = JSON.parse(rawData);
        
        if (Array.isArray(questions) && questions.length > 0) {
          console.log(`✅ Successfully loaded ${questions.length} questions from JSON file`);
          return questions;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load questions from ${path}:`, error);
      }
    }
  }

  // Fallback to hardcoded questions
  console.log(`📦 Using fallback questions (${FALLBACK_QUESTIONS.length} questions)`);
  if (isProduction) {
    console.log('⚠️ PRODUCTION WARNING: Using fallback questions. Consider adding your questions.json file.');
  }
  
  return FALLBACK_QUESTIONS;
}

async function seedQuestions() {
  try {
    console.log('🌱 Starting enhanced question seeding...');
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Check if questions already exist
    const existingCount = await prisma.question.count();
    
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing questions.`);
      
      // In production, don't overwrite existing questions
      if (process.env.NODE_ENV === 'production') {
        console.log('🛡️ Production mode: Skipping seed to preserve existing data.');
        console.log('💡 To force reseed in production, manually clear the questions table first.');
        return;
      }
      
      // In development, clear related data first to avoid foreign key constraints
  console.log('🗑️ Development mode: Clearing existing data for fresh seed...');
  
  // Delete in order to respect foreign key constraints
  await prisma.gameQuestion.deleteMany({});
  await prisma.hintRequest.deleteMany({});
  await prisma.question.deleteMany({});
      console.log('✅ Existing questions cleared');
    }

    // Load questions from various sources
    const rawQuestionsData = await loadQuestions();
    console.log(`📝 Processing ${rawQuestionsData.length} questions...`);

    // Validate and transform questions
    const validQuestions = rawQuestionsData.filter(q => 
      q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer
    );

    console.log(`✅ ${validQuestions.length} valid questions (${rawQuestionsData.length - validQuestions.length} invalid skipped)`);

    // Process questions with auto-generated levels if missing
    let currentLevel = 1;
    const processedQuestions = validQuestions.map((q, index) => ({
      ...q,
      level: q.level || currentLevel++,
      difficulty: q.difficulty || Math.ceil((index + 1) / 20), // Auto-assign difficulty based on position
      country: q.country || 'NIGERIA',
      explanation: q.explanation || 'No explanation provided.',
      hint: q.hint || 'No hint available.'
    }));

    // Insert questions in batches for better performance
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < processedQuestions.length; i += batchSize) {
      const batch = processedQuestions.slice(i, i + batchSize);
      
      try {
        const createPromises = batch.map(questionData => 
          prisma.question.create({
            data: {
              category: mapCategory(questionData.category),
              country: mapCountry(questionData.country),
              difficulty: questionData.difficulty,
              level: questionData.level,
              questionText: questionData.questionText,
              optionA: questionData.optionA,
              optionB: questionData.optionB,
              optionC: questionData.optionC,
              optionD: questionData.optionD,
              correctAnswer: mapCorrectAnswer(questionData.correctAnswer),
              explanation: questionData.explanation,
              hint: questionData.hint,
              hintCost: 2,
              isActive: true
            }
          })
        );

        await Promise.all(createPromises);
        insertedCount += batch.length;
        console.log(`📊 Processed batch ${Math.ceil((i + batchSize) / batchSize)} - ${insertedCount}/${processedQuestions.length} questions inserted`);
        
      } catch (error) {
        console.error(`❌ Failed to insert batch starting at index ${i}:`, error);
      }
    }

    // Verify final count
    const finalCount = await prisma.question.count();
    console.log(`🎉 Seeding completed! Total questions in database: ${finalCount}`);

    // Show statistics
    const categoryStats = await prisma.question.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: { difficulty: true }
    });

    console.log('\n📊 Database Statistics:');
    console.log('Categories:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat._count.category} questions`);
    });
    
    console.log('Difficulty Levels:');
    difficultyStats.forEach(stat => {
      console.log(`  Level ${stat.difficulty}: ${stat._count.difficulty} questions`);
    });

    console.log('\n✅ Enhanced seeding completed successfully!');

  } catch (error) {
    console.error('❌ Enhanced seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('✅ Enhanced seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Enhanced seeding script failed:', error);
      process.exit(1);
    });
}

export { seedQuestions, loadQuestions };