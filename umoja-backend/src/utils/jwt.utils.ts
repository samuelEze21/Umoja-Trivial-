// Fixed JWT Utils (`src/utils/jwt.util.ts`)
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  role: 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN';
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  try {
    const tokenPayload = {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
    };

    // Direct assignment without SignOptions interface to bypass strict typing
    const token = jwt.sign(
      tokenPayload,
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'umoja-trivia-api',
        audience: 'umoja-trivia-app',
      } as SignOptions
    );

    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'umoja-trivia-api',
      audience: 'umoja-trivia-app',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for debugging/inspection)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Generate refresh token (longer expiration)
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  try {
    const tokenPayload = {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
    };

    // Direct assignment without SignOptions interface
    const token = jwt.sign(
      tokenPayload,
      config.jwt.secret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'umoja-trivia-api',
        audience: 'umoja-trivia-refresh',
      }as SignOptions
    );

    

    return token;
  } catch (error) {
    console.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenTTL = (token: string): number => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - currentTime;
    return Math.max(ttl, 0);
  } catch (error) {
    return 0;
  }
};

/**
 * Extract user ID from token without full verification (useful for logging)
 */
export const extractUserId = (token: string): string | null => {
  try {
    const decoded = decodeToken(token);
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
};