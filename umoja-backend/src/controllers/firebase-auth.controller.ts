import { Request, Response } from 'express';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { generateToken } from '../utils/jwt.util';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class FirebaseAuthController {
  private authService: FirebaseAuthService;

  constructor() {
    this.authService = new FirebaseAuthService();
  }

  loginWithFirebase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          error: 'Firebase ID token is required',
        });
        return;
      }

      const result = await this.authService.loginOrCreateUser(idToken);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      });

    } catch (error: any) {
      console.error('Firebase login error:', error);
      res.status(401).json({
        error: error.message || 'Authentication failed',
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const profile = await this.authService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to fetch profile',
      });
    }
  };

  refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      
      // Generate new token with same user data
      const newToken = generateToken({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        data: { token: newToken },
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to refresh token',
      });
    }
  };
}