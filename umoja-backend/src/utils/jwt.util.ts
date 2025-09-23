import jwt from 'jsonwebtoken';
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
 * @param payload User data to encode in token
 * @returns Signed JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: 'umoja-trivia-api',
        audience: 'umoja-trivia-app',
      }
    );

    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload
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
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param token JWT token to decode
 * @returns Decoded payload or null if invalid
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
 * @param token JWT token to check
 * @returns True if expired, false if valid
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
 * @param payload User data to encode
 * @returns Long-lived refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '30d', // Longer expiration for refresh
    issuer: 'umoja-trivia-api',
    audience: 'umoja-trivia-refresh',
  });
};