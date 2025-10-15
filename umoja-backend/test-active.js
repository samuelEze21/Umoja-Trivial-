const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkActiveQuestions() {
  try {
    const activeQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: { id: true, isActive: true, category: true },
      take: 5
    });
    
    console.log('Active questions:', activeQuestions);
    
    const totalActive = await prisma.question.count({
      where: { isActive: true }
    });
    
    console.log('Total active questions:', totalActive);
    
    const totalQuestions = await prisma.question.count();
    console.log('Total questions:', totalQuestions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveQuestions();