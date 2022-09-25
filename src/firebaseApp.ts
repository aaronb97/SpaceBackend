import admin from 'firebase-admin';

import * as dotenv from 'dotenv';
dotenv.config();

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey:
      process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
