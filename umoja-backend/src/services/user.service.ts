import prisma from '../config/database';
import { 
  UserProfile, 
  UpdateUserData, 
  UserProgressData,
  NotFoundError, 
  ValidationError 
} from '../types';

export class UserService {
  async getUserById(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: (user as any).email || undefined,
      role: user.role,
      umojaCoins: user.umojaCoins,
      totalScore: user.totalScore,
      gamesPlayed: user.gamesPlayed,
      isVerified: user.isVerified,
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
      role: updatedUser.role,
      umojaCoins: updatedUser.umojaCoins,
      totalScore: updatedUser.totalScore,
      gamesPlayed: updatedUser.gamesPlayed,
      isVerified: updatedUser.isVerified,
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

    return progressRecords;
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
      select: {
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
      },
    });

    return {
      user,
      stats,
    };
  }
}