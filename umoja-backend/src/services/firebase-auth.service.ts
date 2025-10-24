import { firebaseAuth } from '../config/firebase-admin';
import admin from '../config/firebase-admin';
import { config } from '../config/environment';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt.utils';
import { GAME_CONSTANTS } from '../utils/gameConstants';

export class FirebaseAuthService {
  
  async initiatePhoneAuth(phoneNumber: string) {
    try {
      if (config.nodeEnv === 'test') {
        // In test mode, return a mock verification ID
        return { verificationId: 'mock-verification-id' };
      }
      
      // Generate a verification ID for the phone number
      const verificationId = await admin.auth().createSessionCookie(phoneNumber, { expiresIn: 60 * 5 * 1000 }); // 5 minutes
      return { verificationId };
    } catch (error) {
      console.error('Phone auth initiation error:', error);
      throw new Error('Failed to initiate phone authentication');
    }
  }
  
  async verifyPhoneOTP(verificationId: string, otp: string) {
    try {
      if (config.nodeEnv === 'test') {
        // In test mode, accept any OTP for the mock verification ID
        if (verificationId === 'mock-verification-id' && otp) {
          return { isValid: true, phoneNumber: '+1234567890' };
        }
        throw new Error('Invalid OTP');
      }
      
      // Verify the OTP with Firebase
      const sessionCookie = verificationId;
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie);
      const phoneNumber = decodedClaims.phone_number;
      
      if (!phoneNumber) {
        throw new Error('Phone number not found in verification');
      }
      
      return { isValid: true, phoneNumber };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new Error('Invalid OTP');
    }
  }
  
  async verifyFirebaseToken(idToken: string) {
    try {
      // In test mode, accept mock tokens like "mock:+1234567890"
      if (config.nodeEnv === 'test') {
        if (idToken && idToken.startsWith('mock:')) {
          const phone = idToken.substring('mock:'.length);
          if (!phone) {
            throw new Error('Mock token missing phone number');
          }
          return { phone_number: phone } as any;
        }
        throw new Error('Invalid Firebase token');
      }

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
      const phoneNumberFromToken = decodedToken.phone_number;
      
      if (!phoneNumberFromToken) {
        throw new Error('Phone number not found in token');
      }
      const phoneNumber = phoneNumberFromToken;

      // Find or create user in our database
      let user = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: ({
            phoneNumber,
            isVerified: true,
            umojaCoins: GAME_CONSTANTS.INITIAL_COINS,
            role: 'PLAYER',
          } as any),
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
        phoneNumber: user.phoneNumber ?? phoneNumber,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          role: (user as any).role,
          umojaCoins: (user as any).umojaCoins,
          totalScore: (user as any).totalScore,
          gamesPlayed: (user as any).gamesPlayed,
          isVerified: (user as any).isVerified,
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
      select: ({
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
      } as any)
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}