import { config } from './environment';

let admin: any = null;
let firebaseAuth: any = null;

if (config.nodeEnv === 'test') {
  // In test mode, avoid importing firebase-admin to prevent heavy Google auth deps
  console.log('🧪 Using mocked Firebase Auth in test mode');
  firebaseAuth = {
    verifyIdToken: async (_idToken: string) => {
      // In dev/test server, we don't verify tokens; callers should handle errors
      throw new Error('Firebase admin disabled in test mode');
    },
  };
} else {
  // Initialize Firebase Admin (only once)
  // Use require to avoid loading in test mode
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  admin = require('firebase-admin');

  if (!admin.apps.length) {
    let serviceAccount;

    if (config.nodeEnv === 'production') {
      // In production, use environment variables
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      };
    } else {
      // In development, use service account file or mock credentials
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        serviceAccount = require('../../firebase-service-account.json');
      } catch (error) {
        // Use mock credentials if file not found
        serviceAccount = {
          type: 'service_account',
          project_id: 'mock-project-id',
          private_key_id: 'mock-key-id',
          private_key: 'mock-private-key',
          client_email: 'mock@example.com',
          client_id: 'mock-client-id',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        };
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    });
  }

  firebaseAuth = admin.auth();
}

export { firebaseAuth };
export default admin || {};