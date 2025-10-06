export const GAME_CONSTANTS = {
  // Initial user settings
  INITIAL_COINS: 100,
  INITIAL_LEVEL: 1,

  // Coin rewards
  COINS_PER_CORRECT_ANSWER: {
    1: 1, // Level 1
    2: 2, // Level 2
    3: 3, // Level 3, etc.
  } as const,

  // Hint system
  HINT_COST: 2, // Fixed cost for all levels per requirement

  // Question system
  INITIAL_TOPICS: ['PLACES', 'PEOPLE', 'FOOD', 'CURRENT_AFFAIRS'] as const,
  MANDATORY_TOPICS: ['PLACES', 'PEOPLE', 'FOOD', 'CULTURE'] as const,
  ALL_TOPICS: ['PLACES', 'PEOPLE', 'FOOD', 'CULTURE', 'DRINKS', 'MUSIC', 'CURRENT_AFFAIRS'] as const,
  QUESTIONS_PER_LEVEL: 5, // Incremental questions per level (e.g., +5)

  // Level progression
  REQUIRED_CORRECT_BASE: 20, // Starting requirement for Level 1

  // Game session limits
  TIMER_SECONDS: 15,

  // User roles
  ROLES: {
    PLAYER: 'PLAYER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
  } as const,

  // African countries in game
  COUNTRIES: ['NIGERIA', 'SOUTH_AFRICA', 'KENYA', 'GHANA', 'EGYPT'] as const,
} as const;

// Helper functions for game mechanics
export const GAME_HELPERS = {
  /**
   * Calculate required correct answers for a level
   */
  getRequiredCorrect: (level: number): number => {
    return GAME_CONSTANTS.REQUIRED_CORRECT_BASE + (level - 1) * GAME_CONSTANTS.QUESTIONS_PER_LEVEL;
  },

  /**
   * Get coins earned for a correct answer based on level
   */
  getCoinsEarned: (level: number): number => {
    return GAME_CONSTANTS.COINS_PER_CORRECT_ANSWER[level as keyof typeof GAME_CONSTANTS.COINS_PER_CORRECT_ANSWER] || 1;
  },

  /**
   * Get unlocked topics for a level
   */
  getUnlockedTopics: (level: number): QuestionCategory[] => {
    return [
      ...GAME_CONSTANTS.INITIAL_TOPICS,
      ...GAME_CONSTANTS.ALL_TOPICS.slice(GAME_CONSTANTS.INITIAL_TOPICS.length, GAME_CONSTANTS.INITIAL_TOPICS.length + (level - 1)),
    ].filter(t => (GAME_CONSTANTS.MANDATORY_TOPICS as readonly string[]).includes(t as string) || level > 1);
  },
} as const;

// Type exports for TypeScript
export type QuestionCategory = typeof GAME_CONSTANTS.ALL_TOPICS[number];
export type AfricanCountry = typeof GAME_CONSTANTS.COUNTRIES[number];
export type UserRole = typeof GAME_CONSTANTS.ROLES[keyof typeof GAME_CONSTANTS.ROLES];