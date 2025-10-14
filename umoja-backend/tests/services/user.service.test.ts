import { UserService } from '../../src/services/user.service';
import { prisma } from '../setup';
import { NotFoundError, ValidationError } from '../../src/types';

describe('UserService', () => {
  let userService: UserService;
  let testUser: any;

  beforeEach(async () => {
    userService = new UserService();
    
    // Create a test user with type assertion to bypass TypeScript error
    testUser = await prisma.user.create({
      data: {
        phoneNumber: '+1234567890',
        email: 'test@example.com', // This will work with type assertion
        isVerified: true,
        role: 'PLAYER',
        umojaCoins: 100,
      } as any,
    });
  });

  describe('getUserById', () => {
    it('should return user profile when user exists', async () => {
      const result = await userService.getUserById(testUser.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.phoneNumber).toBe(testUser.phoneNumber);
      expect(result.email).toBe(testUser.email);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(userService.getUserById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user email successfully', async () => {
      const newEmail = 'updated@example.com';
      const result = await userService.updateUserProfile(testUser.id, {
        email: newEmail,
      });

      expect(result.email).toBe(newEmail);
      expect(result.id).toBe(testUser.id);
    });

    it('should update user phone number successfully', async () => {
      const newPhoneNumber = '+9876543210';
      const result = await userService.updateUserProfile(testUser.id, {
        phoneNumber: newPhoneNumber,
      });

      expect(result.phoneNumber).toBe(newPhoneNumber);
    });

    it('should throw NotFoundError when updating non-existent user', async () => {
      await expect(userService.updateUserProfile('non-existent-id', {
        email: 'test@example.com',
      }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw ValidationError when phone number already exists', async () => {
      // Create another user
      const anotherUser = await prisma.user.create({
        data: {
          phoneNumber: '+1111111111',
          isVerified: true,
          role: 'PLAYER',
        },
      });

      await expect(userService.updateUserProfile(testUser.id, {
        phoneNumber: anotherUser.phoneNumber!,
      }))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress data', async () => {
      // Create some progress data
      await prisma.userProgress.create({
        data: {
          userId: testUser.id,
          category: 'HISTORY' as any,
          currentLevel: 5,
          experiencePoints: 150,
          questionsCorrect: 10,
          questionsTotal: 15,
          bestStreak: 3,
        },
      });

      const result = await userService.getUserProgress(testUser.id);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('HISTORY');
      expect(result[0].currentLevel).toBe(5);
    });

    it('should return empty array when user has no progress', async () => {
      const result = await userService.getUserProgress(testUser.id);
      expect(result).toHaveLength(0);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      await userService.deleteUser(testUser.id);
      
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      
      expect(deletedUser).toBeNull();
    });

    it('should throw NotFoundError when deleting non-existent user', async () => {
      await expect(userService.deleteUser('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});