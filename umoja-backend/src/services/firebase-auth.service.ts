import { firebaseAuth } from '../config/firebase-admin';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt.utils';
import { GAME_CONSTANTS } from '../utils/constants';

export class FirebaseAuthService {
  
  async verifyFirebaseToken(idToken: string) {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid Firebase token');
    }
  }

  async loginOrCreateUser(idToken: string) {
    try {
      // Verify the Firebase token
      const decodedToken = await this.verifyFirebaseToken(idToken);
      const phoneNumber = decodedToken.phone_number;

      if (!phoneNumber) {
        throw new Error('Phone number not found in token');
      }

      // Find or create user in our database
      let user = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            phoneNumber,
            isVerified: true,
            umojaCoins: GAME_CONSTANTS.INITIAL_COINS,
            role: 'PLAYER',
          }
        });

        console.log(`✅ New user created: ${phoneNumber}`);
      } else {
        // Update verification status
        if (!user.isVerified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true }
          });
        }
      }

      // Generate our JWT token
      const token = generateToken({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          umojaCoins: user.umojaCoins,
          totalScore: user.totalScore,
          gamesPlayed: user.gamesPlayed,
          isVerified: user.isVerified,
        }
      };

    } catch (error) {
      console.error('Firebase auth error:', error);
      throw new Error('Authentication failed');
    }
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        umojaCoins: true,
        totalScore: true,
        gamesPlayed: true,
        isVerified: true,
        createdAt: true,
        progressRecords: {
          select: {
            category: true,
            currentLevel: true,
            experiencePoints: true,
            questionsCorrect: true,
            questionsTotal: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}