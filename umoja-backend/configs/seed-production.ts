import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Production question data - Add your actual questions here
const PRODUCTION_QUESTIONS = [
  // HISTORY Questions
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
  },
  {
    category: 'MUSIC',
    country: 'NIGERIA',
    difficulty: 2,
    level: 6,
    questionText: 'Which Nigerian artist is known as the "African Giant"?',
    optionA: 'Wizkid',
    optionB: 'Davido',
    optionC: 'Burna Boy',
    optionD: 'Tiwa Savage',
    correctAnswer: 'C',
    explanation: 'Burna Boy earned the nickname "African Giant" and won a Grammy Award for his album "Twice as Tall".',
    hint: 'This artist won a Grammy Award and is known for Afrobeats music.'
  },
  {
    category: 'DRINKS',
    country: 'SOUTH_AFRICA',
    difficulty: 2,
    level: 7,
    questionText: 'What is the traditional South African alcoholic beverage made from fermented maize?',
    optionA: 'Umqombothi',
    optionB: 'Amarula',
    optionC: 'Rooibos',
    optionD: 'Mageu',
    correctAnswer: 'A',
    explanation: 'Umqombothi is a traditional Xhosa beer made from fermented maize, sorghum, and yeast.',
    hint: 'This is a traditional beer with cultural significance in Xhosa communities.'
  },
  {
    category: 'CURRENT_AFFAIRS',
    country: 'EGYPT',
    difficulty: 3,
    level: 8,
    questionText: 'In which year did Egypt host the Africa Cup of Nations (AFCON) most recently?',
    optionA: '2019',
    optionB: '2021',
    optionC: '2022',
    optionD: '2023',
    correctAnswer: 'A',
    explanation: 'Egypt hosted AFCON 2019, which was won by Algeria.',
    hint: 'This was the year before the COVID-19 pandemic began.'
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

async function seedProductionQuestions() {
  try {
    console.log('🌱 Starting production question seeding...');

    // Check if questions already exist
    const existingCount = await prisma.question.count();
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing questions. Skipping seed to avoid duplicates.`);
      console.log('💡 To force reseed, manually clear the questions table first.');
      return;
    }

    console.log(`📝 Seeding ${PRODUCTION_QUESTIONS.length} production questions...`);

    // Process and insert questions
    for (const questionData of PRODUCTION_QUESTIONS) {
      try {
        await prisma.question.create({
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
            explanation: questionData.explanation || 'No explanation provided.',
            hint: questionData.hint || 'No hint available.',
            hintCost: 2,
            isActive: true
          }
        });
        console.log(`✅ Added question: ${questionData.questionText.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Failed to add question: ${questionData.questionText.substring(0, 50)}...`);
        console.error('Error:', error);
      }
    }

    // Verify seeding
    const finalCount = await prisma.question.count();
    console.log(`🎉 Production seeding completed! Total questions in database: ${finalCount}`);

    // Show category breakdown
    const categoryStats = await prisma.question.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    console.log('\n📊 Questions by category:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat._count.category} questions`);
    });

  } catch (error) {
    console.error('❌ Production seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedProductionQuestions()
    .then(() => {
      console.log('✅ Production seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production seeding script failed:', error);
      process.exit(1);
    });
}

export { seedProductionQuestions };