import { Request, Response } from 'express';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { generateToken } from '../utils/jwt.utils';
import {AuthenticatedRequest} from '../middleware/auth.middleware';
import cors from 'cors';


export class FirebaseAuthController {
  private authService: FirebaseAuthService;
  private corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://umoja-frontend.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  };

  constructor() {
    this.authService = new FirebaseAuthService();
  }
  
  // Phone authentication endpoints
  initiatePhoneAuth = async (req: Request, res: Response): Promise<void> => {
    // Apply CORS for this endpoint
    cors(this.corsOptions)(req, res, async () => {
      try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
          res.status(400).json({
            error: 'Phone number is required',
          });
          return;
        }
        
        const result = await this.authService.initiatePhoneAuth(phoneNumber);
        
        res.status(200).json({
          success: true,
          message: 'OTP sent successfully',
          data: result,
        });
        
      } catch (error: any) {
        console.error('Phone auth initiation error:', error);
        res.status(500).json({
          error: error.message || 'Failed to initiate phone authentication',
        });
      }
    });
  };
  
  verifyPhoneOTP = async (req: Request, res: Response): Promise<void> => {
    // Apply CORS for this endpoint
    cors(this.corsOptions)(req, res, async () => {
      try {
        const { verificationId, otp } = req.body;
        
        if (!verificationId || !otp) {
          res.status(400).json({
            error: 'Verification ID and OTP are required',
          });
          return;
        }
        
        const verification = await this.authService.verifyPhoneOTP(verificationId, otp);
        
        if (verification.isValid) {
          // Create or login user with the verified phone number
          const result = await this.authService.loginOrCreateUser(`mock:${verification.phoneNumber}`);
          
          res.status(200).json({
            success: true,
            message: 'Phone authentication successful',
            data: result,
          });
        } else {
          res.status(401).json({
            error: 'Invalid OTP',
          });
        }
        
      } catch (error: any) {
        console.error('OTP verification error:', error);
        res.status(401).json({
          error: error.message || 'Invalid OTP',
        });
      }
    });
  };

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
        role: user.role as 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN',
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