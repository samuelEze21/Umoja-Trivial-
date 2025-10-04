// Mock for Firebase Auth
import { jest } from '@jest/globals';

// Create a mock for firebase-admin
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    },
    apps: [{}], // Mock apps array to fix admin.apps.length check
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn().mockImplementation(() => Promise.resolve({
        uid: 'test-uid-123',
        email: 'test@example.com'
      })),
      getUser: jest.fn().mockImplementation(() => Promise.resolve({
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User'
      })),
      createUser: jest.fn().mockImplementation(() => Promise.resolve({
        uid: 'new-user-456',
        email: 'new@example.com'
      }))
    }))
  };
});

console.log('Firebase auth mock initialized');