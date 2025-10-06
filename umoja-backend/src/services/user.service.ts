import prisma from '../config/database';
import {
  UserProfile,
  UpdateUserData,
  UserProgressData,
  NotFoundError,
  ValidationError,
  QuestionCategory,
} from '../types';

export class UserService {
  async getUserById(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: (user as any).email || undefined,
      role: (user as any).role,
      // Cast to any to avoid compile-time mismatch with Prisma types
      umojaCoins: (user as any).umojaCoins,
      totalScore: (user as any).totalScore,
      gamesPlayed: (user as any).gamesPlayed,
      isVerified: (user as any).isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserProfile(userId: string, updateData: UpdateUserData): Promise<UserProfile> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check for phone number uniqueness if updating phone number
    if (updateData.phoneNumber) {
      const phoneExists = await prisma.user.findFirst({
        where: {
          phoneNumber: updateData.phoneNumber,
          id: { not: userId },
        },
      });

      if (phoneExists) {
        throw new ValidationError('Phone number already exists');
      }
    }

    // Check for email uniqueness if updating email 
    if (updateData.email) { 
      const emailExists = await prisma.user.findFirst({ 
        where: { 
          email: updateData.email, 
          id: { not: userId }, 
        } as any, 
      });
  
      if (emailExists) {
        throw new ValidationError('Email already exists');
      }
    }

    // Create a type-safe update object
    const updateInput: any = {};
    if (updateData.phoneNumber !== undefined) {
      updateInput.phoneNumber = updateData.phoneNumber;
    }
    if (updateData.email !== undefined) {
      updateInput.email = updateData.email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateInput,
    });

    return {
      id: updatedUser.id,
      phoneNumber: updatedUser.phoneNumber,
      // Convert null to undefined for optional email
      email: (updatedUser as any).email || undefined,
      role: (updatedUser as any).role,
      umojaCoins: (updatedUser as any).umojaCoins,
      totalScore: (updatedUser as any).totalScore,
      gamesPlayed: (updatedUser as any).gamesPlayed,
      isVerified: (updatedUser as any).isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async getUserProgress(userId: string): Promise<UserProgressData[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        category: true,
        currentLevel: true,
        experiencePoints: true,
        questionsCorrect: true,
        questionsTotal: true,
        bestStreak: true,
      },
    });

    // Map to app-level types to avoid enum type mismatch
    return progressRecords.map((r: any) => ({
      category: r.category as unknown as QuestionCategory,
      currentLevel: r.currentLevel,
      experiencePoints: r.experiencePoints,
      questionsCorrect: r.questionsCorrect,
      questionsTotal: r.questionsTotal,
      bestStreak: r.bestStreak,
    }));
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.getUserById(userId);
    
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      // Cast select to any to avoid compile-time mismatch with generated Prisma types
      select: ({
        umojaCoins: true,
        totalScore: true,
        gamesPlayed: true,
        progressRecords: {
          select: {
            category: true,
            currentLevel: true,
            experiencePoints: true,
            questionsCorrect: true,
            questionsTotal: true,
            bestStreak: true,
          },
        },
        gameSessions: {
          where: { isActive: false },
          select: {
            correctAnswers: true,
            questionsAnswered: true,
            coinsEarned: true,
            maxStreak: true,
          },
        },
      } as any),
    });

    return {
      user,
      stats,
    };
  }
}