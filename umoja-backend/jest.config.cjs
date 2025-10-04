module.exports = {
  preset: 'ts-jest/presets/default-esm', // Use ESM preset for TypeScript
  extensionsToTreatAsEsm: ['.ts'],      // Treat .ts files as ESM
  testEnvironment: 'node',              // Node.js environment for tests
  roots: ['<rootDir>/src', '<rootDir>/tests'], // Correct path to tests folder
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'], // Match test files
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }], // Transform TS files with ESM
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts', // Exclude declaration files and app entry
  ],
  coverageDirectory: 'coverage',         // Output coverage reports here
  coverageReporters: ['text', 'lcov', 'html'], // Coverage report formats
  setupFilesAfterEnv: ['<rootDir>/tests/firebase.mock.ts', '<rootDir>/tests/prisma.mock.ts', '<rootDir>/tests/setup.ts'],
  // Removed globalSetup to avoid ESM/CommonJS conflicts
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};