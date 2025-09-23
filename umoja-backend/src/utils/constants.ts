export const GAME_CONSTANTS = {
  // Initial user settings
  INITIAL_COINS: 100,
  INITIAL_LEVEL: 1,

  // Coin rewards
  COINS_PER_CORRECT_ANSWER: 5,
  COINS_PER_STREAK_BONUS: 2, // Additional coins per streak multiplier
  LEVEL_UP_BONUS_COINS: 50,
  DAILY_LOGIN_BONUS: 10,

  // Hint system
  HINT_COSTS: {
    1: 2, // Easy questions (Level 1-40)
    2: 3, // Moderate questions (Level 41-80)
    3: 4, // Challenging questions (Level 81-120)
    4: 5, // Hard questions (Level 121-160)
    5: 6, // Expert questions (Level 161-200)
  } as const,

  // Question system
  QUESTIONS_PER_DIFFICULTY: 40,
  MAX_LEVEL: 200,
  CATEGORIES_COUNT: 8,
  COUNTRIES_COUNT: 5,
  
  // Level progression
  EXPERIENCE_PER_CORRECT: 10,
  EXPERIENCE_PER_WRONG: 2,
  EXPERIENCE_FOR_LEVEL_UP: 100, // XP needed per level

  // Game session limits
  MAX_QUESTIONS_PER_SESSION: 50,
  MIN_QUESTIONS_FOR_REWARD: 5,
  SESSION_TIMEOUT_MINUTES: 30,

  // Streak system
  MIN_STREAK_FOR_BONUS: 3,
  MAX_STREAK_MULTIPLIER: 5,
  STREAK_RESET_ON_WRONG: true,

  // Coin transfer limits
  MIN_TRANSFER_AMOUNT: 1,
  MAX_TRANSFER_AMOUNT: 1000,
  TRANSFER_FEE_PERCENTAGE: 0, // No fees for MVP

  // SMS verification
  VERIFICATION_CODE_LENGTH: 6,
  VERIFICATION_EXPIRY_MINUTES: 10,
  MAX_VERIFICATION_ATTEMPTS: 3,
  SMS_RATE_LIMIT_MINUTES: 1,

  // User roles
  ROLES: {
    PLAYER: 'PLAYER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
  } as const,

  // Question categories
  CATEGORIES: [
    'CULTURE',
    'HISTORY',
    'ENTERTAINMENT',
    'LEADERS',
    'MARKET_INSIGHTS',
    'GEOGRAPHY',
    'SPORTS',
    'TRADITIONAL_MUSIC',
  ] as const,

  // African countries in game
  COUNTRIES: [
    'NIGERIA',
    'SOUTH_AFRICA',
    'KENYA',
    'GHANA',
    'EGYPT',
  ] as const,

  // Difficulty names for UI
  DIFFICULTY_NAMES: {
    1: 'Easy',
    2: 'Moderate', 
    3: 'Challenging',
    4: 'Hard',
    5: 'Expert',
  } as const,

  // API rate limits
  RATE_LIMITS: {
    AUTH_REQUESTS_PER_HOUR: 10,
    GAME_REQUESTS_PER_MINUTE: 60,
    HINT_REQUESTS_PER_HOUR: 50,
  },
} as const;

// Helper functions for game mechanics
export const GAME_HELPERS = {
  /**
   * Get hint cost for a question difficulty
   */
  getHintCost: (difficulty: number): number => {
    return GAME_CONSTANTS.HINT_COSTS[difficulty as keyof typeof GAME_CONSTANTS.HINT_COSTS] || 2;
  },

  /**
   * Calculate coins earned for correct answer with streak bonus
   */
  calculateCoinsEarned: (streak: number): number => {
    const baseCoins = GAME_CONSTANTS.COINS_PER_CORRECT_ANSWER;
    const streakBonus = Math.min(streak, GAME_CONSTANTS.MAX_STREAK_MULTIPLIER) * 
                       GAME_CONSTANTS.COINS_PER_STREAK_BONUS;
    return baseCoins + streakBonus;
  },

  /**
   * Calculate experience points for answer
   */
  calculateExperience: (isCorrect: boolean, difficulty: number): number => {
    const baseXP = isCorrect ? GAME_CONSTANTS.EXPERIENCE_PER_CORRECT : GAME_CONSTANTS.EXPERIENCE_PER_WRONG;
    const difficultyMultiplier = difficulty * 0.2; // 20% more XP per difficulty level
    return Math.floor(baseXP * (1 + difficultyMultiplier));
  },

  /**
   * Get difficulty level from question level (1-200)
   */
  getDifficultyFromLevel: (level: number): number => {
    if (level <= 40) return 1;
    if (level <= 80) return 2;
    if (level <= 120) return 3;
    if (level <= 160) return 4;
    return 5;
  },

  /**
   * Get level range for difficulty
   */
  getLevelRangeForDifficulty: (difficulty: number): [number, number] => {
    const ranges: Record<number, [number, number]> = {
      1: [1, 40],
      2: [41, 80],
      3: [81, 120],
      4: [121, 160],
      5: [161, 200],
    };
    return ranges[difficulty] || [1, 40];
  },

  /**
   * Check if user qualifies for level up
   */
  canLevelUp: (currentXP: number, currentLevel: number): boolean => {
    const requiredXP = GAME_CONSTANTS.EXPERIENCE_FOR_LEVEL_UP * currentLevel;
    return currentXP >= requiredXP;
  },

  /**
   * Get user level from total experience
   */
  getLevelFromExperience: (totalXP: number): number => {
    let level = 1;
    let xpRequired = GAME_CONSTANTS.EXPERIENCE_FOR_LEVEL_UP;

    while (totalXP >= xpRequired) {
      level++;
      totalXP -= xpRequired;
      xpRequired = GAME_CONSTANTS.EXPERIENCE_FOR_LEVEL_UP * level;
    }

    return level;
  },
} as const;

// Type exports for TypeScript
export type GameCategory = typeof GAME_CONSTANTS.CATEGORIES[number];
export type GameCountry = typeof GAME_CONSTANTS.COUNTRIES[number];
export type UserRole = typeof GAME_CONSTANTS.ROLES[keyof typeof GAME_CONSTANTS.ROLES];
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;