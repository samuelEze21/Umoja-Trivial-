import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UpdateUserData, NotFoundError, ValidationError } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const profile = await this.userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      });
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updateData: UpdateUserData = req.body;
      
      // Validate phone number if provided
      if (updateData.phoneNumber !== undefined && (!updateData.phoneNumber || updateData.phoneNumber.trim() === '')) {
        res.status(400).json({
          success: false,
          error: 'Phone number cannot be empty',
        });
        return;
      }
      
      if (updateData.email && updateData.email.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Email cannot be empty',
        });
        return;
      }

      const updatedProfile = await this.userService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  };

  getProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const progress = await this.userService.getUserProgress(userId);

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Get progress error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch progress',
      });
    }
  };

  getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const stats = await this.userService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }
  };

  deleteProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully',
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Delete profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete profile',
      });
    }
  };
}