import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdmin =
  getApps().length === 0 //prevents us from initializing Firebase Admin multiple times during Next.js development/hot reload.
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),/**Our private key is stored in .env.local with \n characters. This converts those escaped characters back into actual newlines so Firebase Admin can use the key correctly. */
      })
    : getApps()[0];

export const adminAuth = getAuth(firebaseAdmin);