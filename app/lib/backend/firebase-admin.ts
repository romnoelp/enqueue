import * as admin from "firebase-admin";

// Initialize Firebase Admin (Firestore, Realtime DB, FCM only - auth via Better Auth)
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// Export services (auth handled by Better Auth)
export const realtimeDb = admin.database();
export const firestoreDb = admin.firestore();
export const fcm = admin.messaging();
