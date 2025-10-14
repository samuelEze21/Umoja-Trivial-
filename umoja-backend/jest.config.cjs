module.exports = {
  preset: 'ts-jest',
  // Removed ESM-specific settings
  testEnvironment: 'node',              // Node.js environment for tests
  roots: ['<rootDir>/src', '<rootDir>/tests'], // Correct path to tests folder
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'], // Match test files
  transform: {
    '^.+\\.ts$': 'ts-jest', // Simplified transform configuration
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts', // Exclude declaration files and app entry
  ],
  coverageDirectory: 'coverage',         // Output coverage reports here
  coverageReporters: ['text', 'lcov', 'html'], // Coverage report formats
  setupFiles: ['<rootDir>/tests/prisma.mock.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/firebase.mock.ts', '<rootDir>/tests/setup.ts']
  // Removed moduleNameMapper to avoid ESM/CommonJS conflicts
};