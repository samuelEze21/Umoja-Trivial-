import { Request, Response } from 'express';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuthRequest, RefreshTokenRequest } from '../types';

export class AuthController {
  private authService: FirebaseAuthService;

  constructor() {
    this.authService = new FirebaseAuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken }: AuthRequest = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
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
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
        return;
      }

      // For now, we'll use the existing Firebase token refresh logic
      // In a production app, you might want to implement your own refresh token system
      res.status(501).json({
        success: false,
        error: 'Refresh token functionality not implemented yet',
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Token refresh failed',
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by removing the token from storage
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
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
      console.error('Get profile error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch profile',
      });
    }
  };
}