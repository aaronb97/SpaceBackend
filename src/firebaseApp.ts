import { applicationDefault } from "firebase-admin/app";
import admin from "firebase-admin";

export const firebaseApp = admin.initializeApp({
  credential: applicationDefault(),
});
