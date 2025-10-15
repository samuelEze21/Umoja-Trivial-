const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugQuestions() {
  try {
    console.log('=== Database Questions Debug ===');
    
    // Count total questions
    const totalQuestions = await prisma.question.count();
    console.log(`Total questions in database: ${totalQuestions}`);
    
    // Count by level
    const questionsByLevel = await prisma.question.groupBy({
      by: ['level'],
      _count: { level: true },
    });
    console.log('\nQuestions by level:');
    questionsByLevel.forEach(group => {
      console.log(`Level ${group.level}: ${group._count.level} questions`);
    });
    
    // Count by category - using raw query to avoid enum issues
    const questionsByCategory = await prisma.$queryRaw`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category
    `;
    console.log('\nQuestions by category:');
    questionsByCategory.forEach(group => {
      console.log(`${group.category}: ${group.count} questions`);
    });
    
    // Show first few questions for level 1
    const level1Questions = await prisma.question.findMany({
      where: { level: 1, isActive: true },
      take: 5,
      select: {
        id: true,
        level: true,
        category: true,
        questionText: true,
        isActive: true
      }
    });
    console.log('\nFirst 5 Level 1 questions:');
    level1Questions.forEach((q, i) => {
      console.log(`${i + 1}. [${q.category}] ${q.questionText.substring(0, 50)}...`);
    });
    
    // Check what categories are available for level 1
    const level1Categories = await prisma.question.findMany({
      where: { level: 1, isActive: true },
      select: { category: true },
      distinct: ['category']
    });
    console.log('\nLevel 1 categories available:');
    level1Categories.forEach(q => console.log(`- ${q.category}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuestions();