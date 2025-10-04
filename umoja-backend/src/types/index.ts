// Replace Prisma enum imports with string unions
// Remove: import { UserRole, QuestionCategory } from '@prisma/client';

// Add string union types instead
export type UserRole = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN';
export type QuestionCategory =
  | 'CULTURE'
  | 'HISTORY'
  | 'ENTERTAINMENT'
  | 'LEADERS'
  | 'MARKET_INSIGHTS'
  | 'GEOGRAPHY'
  | 'SPORTS'
  | 'TRADITIONAL_MUSIC';

// User related types
export interface UserProfile {
  id: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  umojaCoins: number;
  totalScore: number;
  gamesPlayed: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  phoneNumber: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  phoneNumber?: string;
}

// Authentication related types
export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

export interface AuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User progress types
export interface UserProgressData {
  category: QuestionCategory;
  currentLevel: number;
  experiencePoints: number;
  questionsCorrect: number;
  questionsTotal: number;
  bestStreak: number;
}

// Error types
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}