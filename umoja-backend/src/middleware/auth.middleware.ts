import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.utils';
import prisma from '../config/database';

// Extend Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authorization token'
      });
      return;
    }

    // Verify the JWT token
    const decoded: JWTPayload = verifyToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        error: 'Account not verified',
        message: 'Please verify your phone number'
      });
      return;
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      phoneNumber: decoded.phoneNumber,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    
    // Handle specific JWT errors
    if (error.message === 'Token has expired') {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
      return;
    }

    if (error.message === 'Invalid token') {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to authenticate request'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // If token exists, try to authenticate
    const decoded: JWTPayload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, phoneNumber: true, role: true, isVerified: true }
    });

    if (user && user.isVerified) {
      req.user = {
        userId: decoded.userId,
        phoneNumber: decoded.phoneNumber,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // If authentication fails, continue without user context
    next();
  }
};