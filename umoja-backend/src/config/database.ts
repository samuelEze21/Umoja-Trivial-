import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test queries to verify all tables exist
    const tableTests = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.gameSession.count(),
      prisma.coinTransfer.count(),
    ]);
    
    console.log('📊 Database tables verified:');
    console.log(`   Users: ${tableTests[0]}`);
    console.log(`   Questions: ${tableTests[1]}`);
    console.log(`   Game Sessions: ${tableTests[2]}`);
    console.log(`   Coin Transfers: ${tableTests[3]}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

export default prisma;