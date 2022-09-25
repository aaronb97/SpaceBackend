import admin from 'firebase-admin';

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY ?? ''),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
